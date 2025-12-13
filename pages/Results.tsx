import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Lock, Unlock, CheckCircle, Wallet, TrendingUp, Calendar, ArrowRight, 
  AlertTriangle, ChevronRight, ChevronDown, ChevronUp, BookOpen, Briefcase, GraduationCap,
  Calculator, Atom, Languages, FileText, Globe, Coins, Laptop, Palette, Ruler,
  Stethoscope, Microscope, Scale, Building, Wrench, Leaf, Zap,
  LayoutDashboard, ListTodo, ThumbsUp, AlertOctagon, Info, Clock, ExternalLink,
  FlaskConical, ScrollText, Code
} from 'lucide-react';

const ResultsPage: React.FC = () => {
  const { profile, analysis, isPremium, paymentVerified } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'bursaries' | 'plan'>('overview');
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  useEffect(() => {
    if (!analysis) {
      navigate('/upload');
    }
  }, [analysis, navigate]);

  if (!analysis || !profile) return null;

  // Safely access arrays with fallbacks
  const careers = analysis.careers || [];
  const courses = analysis.courses || [];
  const bursaries = analysis.bursaries || [];
  const actionPlan = analysis.actionPlan || [];
  
  // Safe access to new summary structure
  const summary = analysis.summary || {
      title: "Career Analysis",
      overview: "Overview not available.",
      strengths: [],
      limitations: []
  };

  // Unlock features if user is marked as premium OR payment is verified
  const hasPremiumAccess = isPremium || paymentVerified;

  // Prepare chart data
  const salaryData = careers.map(c => ({
    name: c.title.split(' ')[0], // Shorten name
    salary: parseInt(c.entrySalary.replace(/\D/g, '')) || 0
  }));

  // Logic for displaying courses (Premium model retained for courses per earlier logic, though user asked for free funding)
  const displayedCourses = hasPremiumAccess ? courses : courses.slice(0, 2);
  const lockedCourseCount = Math.max(0, courses.length - 2);

  // Funding Options are now FREE for all
  const displayedBursaries = bursaries; 

  // Helper for badge colors
  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('degree')) return 'text-primary-600 bg-primary-50';
    if (t.includes('diploma')) return 'text-purple-600 bg-purple-50';
    if (t.includes('certificate')) return 'text-orange-600 bg-orange-50';
    if (t.includes('short') || t.includes('course')) return 'text-emerald-600 bg-emerald-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Helper to determine course icon
  const getCourseIcon = (name: string, type: string) => {
    const lowerName = name.toLowerCase();
    // IT & Software
    if (lowerName.includes('software') || lowerName.includes('develop') || lowerName.includes('code')) return <Code className="w-5 h-5 text-cyan-600" />;
    if (lowerName.includes('comput') || lowerName.includes('it ') || lowerName.includes('data') || lowerName.includes('cyber')) return <Laptop className="w-5 h-5 text-cyan-600" />;
    
    // Engineering
    if (lowerName.includes('electric') || lowerName.includes('electron')) return <Zap className="w-5 h-5 text-yellow-600" />;
    if (lowerName.includes('civil') || lowerName.includes('construct') || lowerName.includes('build') || lowerName.includes('architect')) return <Building className="w-5 h-5 text-gray-600" />;
    if (lowerName.includes('engine') || lowerName.includes('mech')) return <Ruler className="w-5 h-5 text-indigo-600" />;
    
    // Health
    if (lowerName.includes('medic') || lowerName.includes('nurs') || lowerName.includes('health') || lowerName.includes('pharm')) return <Stethoscope className="w-5 h-5 text-red-500" />;
    
    // Science
    if (lowerName.includes('scienc') || lowerName.includes('bio') || lowerName.includes('chem') || lowerName.includes('lab') || lowerName.includes('physic')) return <FlaskConical className="w-5 h-5 text-purple-600" />;
    
    // Law
    if (lowerName.includes('law') || lowerName.includes('legal') || lowerName.includes('justice')) return <Scale className="w-5 h-5 text-amber-700" />;
    
    // Commerce
    if (lowerName.includes('account') || lowerName.includes('business') || lowerName.includes('financ') || lowerName.includes('econ') || lowerName.includes('manage')) return <Briefcase className="w-5 h-5 text-blue-600" />;
    
    // Education
    if (lowerName.includes('teach') || lowerName.includes('educat')) return <BookOpen className="w-5 h-5 text-pink-600" />;
    
    // Arts
    if (lowerName.includes('art') || lowerName.includes('design') || lowerName.includes('drama') || lowerName.includes('music')) return <Palette className="w-5 h-5 text-orange-600" />;
    
    // Trades
    if (lowerName.includes('weld') || lowerName.includes('plumb') || lowerName.includes('fitter') || lowerName.includes('boiler')) return <Wrench className="w-5 h-5 text-slate-600" />;
    
    // Agriculture
    if (lowerName.includes('agri') || lowerName.includes('farm') || lowerName.includes('environment')) return <Leaf className="w-5 h-5 text-green-600" />;
    
    // Qualification Type Fallbacks
    if (type.toLowerCase().includes('degree')) return <GraduationCap className="w-5 h-5 text-primary-600" />;
    if (type.toLowerCase().includes('diploma')) return <ScrollText className="w-5 h-5 text-indigo-600" />;
    
    return <BookOpen className="w-5 h-5 text-gray-400" />;
  };

  // Helper to determine icon based on requirement text
  const getRequirementIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('math') || lower.includes('calculat')) return <Calculator className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />;
    if (lower.includes('science') || lower.includes('physic') || lower.includes('bio') || lower.includes('chem')) return <Atom className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />;
    if (lower.includes('computer') || lower.includes('it ') || lower.includes('programming') || lower.includes('tech')) return <Laptop className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />;
    if (lower.includes('engineering') || lower.includes('drawing') || lower.includes('technical')) return <Ruler className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />;
    if (lower.includes('english') || lower.includes('language') || lower.includes('afrikaans') || lower.includes('isizulu')) return <Languages className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />;
    if (lower.includes('account') || lower.includes('business') || lower.includes('econ') || lower.includes('finance')) return <Coins className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />;
    if (lower.includes('geo') || lower.includes('history') || lower.includes('life') || lower.includes('tour')) return <Globe className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />;
    if (lower.includes('art') || lower.includes('design') || lower.includes('drama')) return <Palette className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />;
    return <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />;
  };

  // Helper to parse requirements string into a list
  const parseRequirements = (text: string) => {
    if (!text) return [`APS of ${profile?.apsScore || 0} required`];
    const clean = text.replace(/\*\*/g, '');
    let items: string[] = [];
    if (clean.includes('•')) items = clean.split('•');
    else if (clean.includes('\n-')) items = clean.split('\n-');
    else if (clean.includes('\n')) items = clean.split('\n');
    else items = clean.split(/[.;]/);
    
    return items
      .map(s => s.trim().replace(/^[-*]\s*/, ''))
      .filter(s => s.length > 2 && !s.match(/^entry requirements/i));
  };

  // Helper to safely generate application link
  const getApplicationLink = (course: any) => {
    // Basic validation to check if it looks like a URL
    if (course.applicationLink && (course.applicationLink.startsWith('http') || course.applicationLink.startsWith('www'))) {
      return course.applicationLink.startsWith('www') ? `https://${course.applicationLink}` : course.applicationLink;
    }
    // Reliable fallback with encoded query
    return `https://www.google.com/search?q=${encodeURIComponent(`${course.institution} ${course.name} application`)}`;
  };

  const toggleExpand = (index: number) => {
    if (expandedCourse === index) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(index);
    }
  };

  const TabButton = ({ id, label, icon: Icon, count }: { id: typeof activeTab, label: string, icon: any, count?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        activeTab === id 
          ? 'border-primary-600 text-primary-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className={`w-4 h-4 mr-2 ${activeTab === id ? 'text-primary-600' : 'text-gray-400'}`} />
      {label}
      {count !== undefined && (
        <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${activeTab === id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Summary */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-6 rounded-full w-28 h-28 flex flex-col items-center justify-center border-4 border-white shadow-xl flex-shrink-0 text-white">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">APS Score</span>
          <span className="text-3xl font-extrabold">{profile.apsScore}</span>
        </div>
        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-2 mb-2">
            <div>
                 <h1 className="text-2xl font-bold text-gray-900">Hello, {profile.name}</h1>
                 <p className="text-gray-500 text-sm">We've analyzed your results and found {courses.length} potential matches.</p>
            </div>
            
            <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${
              hasPremiumAccess 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-orange-50 text-orange-700 border-orange-200'
            }`}>
              {hasPremiumAccess ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1.5" /> Verified
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1.5" /> Not Verified
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto">
          <TabButton id="overview" label="Insight" icon={LayoutDashboard} />
          <TabButton id="courses" label="Study Matches" icon={GraduationCap} count={courses.length} />
          <TabButton id="bursaries" label="Funding" icon={Wallet} count={bursaries.length} />
          <TabButton id="plan" label="Action Plan" icon={ListTodo} />
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                {/* 1. The Verdict Card */}
                <div className="md:col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <Info className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">{summary.title}</h2>
                            <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">{summary.overview}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Strengths Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="flex items-center font-bold text-green-700 mb-4">
                        <ThumbsUp className="w-5 h-5 mr-2" /> Key Strengths
                    </h3>
                    <ul className="space-y-3">
                        {summary.strengths?.map((item, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3. Limitations Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="flex items-center font-bold text-orange-600 mb-4">
                        <AlertOctagon className="w-5 h-5 mr-2" /> Important Considerations
                    </h3>
                    <ul className="space-y-3">
                        {summary.limitations?.map((item, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                 {/* Call to Action for Courses */}
                 <div className="md:col-span-2 mt-4 text-center">
                    <button 
                      onClick={() => setActiveTab('courses')}
                      className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition-all transform hover:scale-105"
                    >
                      View {courses.length} Recommended Courses
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                    <p className="text-sm text-gray-400 mt-2">Based on your marks & APS</p>
                 </div>

                {/* 4. Salary Graph */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-4">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                        Projected Career Earnings
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salaryData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#6b7280'}} />
                            <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#6b7280'}} tickFormatter={(val) => `R${val/1000}k`} />
                            <Tooltip 
                            cursor={{fill: '#f9fafb'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                            />
                            <Bar dataKey="salary" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        )}

        {/* Study Options */}
        {activeTab === 'courses' && (
          <div className="animate-in slide-in-from-bottom-2 duration-300">
            {courses.length === 0 ? (
               <div className="bg-white p-8 rounded-xl text-center border border-dashed border-gray-300">
                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                   <BookOpen className="w-6 h-6 text-gray-400" />
                 </div>
                 <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                 <p className="text-gray-500 mb-4">We couldn't match any courses to your current APS. Try verifying your subjects.</p>
                 <button onClick={() => navigate('/upload')} className="text-primary-600 font-medium hover:underline">Check marks again</button>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {displayedCourses.map((course, idx) => (
                  <div key={idx} className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${expandedCourse === idx ? 'border-primary-300 ring-2 ring-primary-50' : 'border-gray-100 hover:border-primary-200'}`}>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-wrap gap-2">
                           <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${getTypeColor(course.type)}`}>{course.type}</span>
                           {course.applicationDeadline && (
                             <span className="flex items-center text-[10px] font-semibold px-2 py-1 rounded bg-red-50 text-red-600">
                               <Clock className="w-3 h-3 mr-1" /> Closes: {course.applicationDeadline}
                             </span>
                           )}
                        </div>
                        <span className="text-xs text-gray-500">{course.duration}</span>
                      </div>
                      
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2.5 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100">
                           {getCourseIcon(course.name, course.type)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{course.name}</h3>
                            <p className="text-sm text-gray-600">{course.institution}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded mr-2">Min APS: {course.minAps}</span>
                          <span>{course.faculty}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={getApplicationLink(course)}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                            title="Visit Website"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => toggleExpand(idx)}
                            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
                          >
                            {expandedCourse === idx ? 'Hide' : 'Details'}
                            {expandedCourse === idx ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    {expandedCourse === idx && (
                      <div className="px-5 pb-5 pt-0 text-sm border-t border-gray-100 bg-gray-50/50 rounded-b-xl animate-[fadeIn_0.3s_ease-in-out]">
                        <div className="grid grid-cols-1 gap-4 pt-4">
                          {/* Entry Requirements - Modern Styled Card */}
                          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                             <h4 className="flex items-center font-bold text-gray-900 mb-4 text-base">
                              <FileText className="w-5 h-5 mr-2 text-primary-500" />
                              Admissions Checklist
                            </h4>
                            
                            {/* Requirements are now always unlocked */}
                            <div className="space-y-3">
                                {(course.requirements ? parseRequirements(course.requirements) : [`APS of ${course.minAps} required`]).map((req, i) => (
                                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-0.5">{getRequirementIcon(req)}</div>
                                    <span className="text-sm text-gray-700 font-medium leading-tight">{req}</span>
                                </div>
                                ))}
                            </div>
                          </div>

                          {/* Modules */}
                          {course.modules && course.modules.length > 0 && (
                            <div>
                              <h4 className="flex items-center font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wider text-gray-500">
                                Key Modules
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {course.modules.map((mod, i) => (
                                  <span key={i} className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                                    {mod}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Career Outcomes */}
                          {course.careerOutcomes && course.careerOutcomes.length > 0 && (
                            <div>
                              <h4 className="flex items-center font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wider text-gray-500">
                                Future Careers
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {course.careerOutcomes.map((job, i) => (
                                  <span key={i} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                                    {job}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                           <a 
                             href={getApplicationLink(course)}
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center text-sm font-bold text-white bg-gray-900 hover:bg-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-gray-200 transform hover:-translate-y-0.5"
                           >
                             {course.applicationLink ? 'Visit Application Portal' : 'How to Apply'}
                             <ExternalLink className="w-4 h-4 ml-2" />
                           </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Locked Courses Visual Overlay (For additional courses beyond top 2) */}
                {!hasPremiumAccess && lockedCourseCount > 0 && (
                  <div className="col-span-1 md:col-span-2 relative">
                    {/* Blurred Dummy Cards to visualize content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 filter blur-sm select-none pointer-events-none" aria-hidden="true">
                      {[1, 2].map((_, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-gray-100">
                          <div className="flex justify-between mb-2">
                            <div className="h-5 w-20 bg-gray-200 rounded"></div>
                            <div className="h-4 w-12 bg-gray-200 rounded"></div>
                          </div>
                          <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-4 w-1/2 bg-gray-100 rounded mb-3"></div>
                          <div className="h-4 w-1/3 bg-gray-100 rounded"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Unlock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div 
                        onClick={() => navigate('/payment')}
                        className="bg-gray-900/95 text-white p-8 rounded-2xl shadow-2xl text-center max-w-sm backdrop-blur-md border border-white/10 cursor-pointer transform hover:scale-105 transition-transform"
                      >
                        <Lock className="w-10 h-10 mx-auto mb-4 text-accent-500" />
                        <h3 className="text-xl font-bold mb-2">Unlock {lockedCourseCount} More Courses</h3>
                        <p className="text-gray-300 mb-6 text-sm">Get access to your full list of university matches tailored to your APS.</p>
                        <button className="bg-accent-500 hover:bg-accent-600 text-black font-bold py-3 px-8 rounded-lg transition-colors w-full flex items-center justify-center">
                          Unlock Now - R120
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bursaries (Now Fully Unlocked) */}
        {activeTab === 'bursaries' && (
             <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            {displayedBursaries.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                 <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <h3 className="text-lg font-medium text-gray-900">No bursaries found</h3>
                 <p className="text-gray-500">We couldn't find specific funding for this profile.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {displayedBursaries.map((bursary, idx) => (
                   <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-primary-200 transition-colors flex flex-col h-full">
                      <div className="mb-4 flex-grow">
                        <div className="flex justify-between items-start mb-2">
                           <div className="p-2 bg-green-50 rounded-lg text-green-600">
                             <Wallet className="w-5 h-5" />
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                             Bursary
                           </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">{bursary.name}</h4>
                        <p className="text-sm text-gray-500 font-medium">{bursary.provider}</p>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t border-gray-50 mt-auto">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          Closes: {bursary.closingDate}
                        </div>
                        
                        <a 
                          href={bursary.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-primary-50 text-primary-700 hover:bg-primary-100 font-bold py-2 rounded-lg text-sm transition-colors"
                        >
                          Apply Now
                        </a>
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}

        {/* Action Plan */}
         {activeTab === 'plan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
            {actionPlan.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.completed ? 'bg-green-100 border-green-200' : 'border-primary-200'}`}>
                   {item.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wide">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Due {item.deadline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;