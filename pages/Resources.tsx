import React, { useState, useEffect } from 'react';
import { getResources } from '../services/geminiService';
import { ExternalLink, Search, Loader2, BookOpen } from 'lucide-react';
import { ResourceCategory } from '../types';

const ResourcesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage cache first to save API calls
    const cached = localStorage.getItem('cp_resources_cache');
    if (cached) {
      setResources(JSON.parse(cached));
      setLoading(false);
    } else {
      fetchResources();
    }
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    const data = await getResources();
    if (data.length > 0) {
      setResources(data);
      localStorage.setItem('cp_resources_cache', JSON.stringify(data));
    }
    setLoading(false);
  };

  const filteredCategories = resources.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Resources Directory</h1>
           <p className="text-gray-500 text-sm mt-1">Curated links for South African students.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
            placeholder="Search directory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
           <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
           <p className="text-gray-500">Curating latest resources...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                   <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center mr-3">
                      <BookOpen className="w-4 h-4 text-primary-600" />
                   </div>
                   {category.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item, i) => (
                    <a 
                      key={i}
                      href={item.url}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group block p-4 border border-gray-100 rounded-xl hover:border-primary-200 hover:shadow-md hover:bg-gray-50 transition-all duration-200"
                    >
                      <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors flex items-start justify-between">
                         {item.name}
                         <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-primary-500" />
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-12">
               <p className="text-gray-500">No resources found matching "{searchTerm}".</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
