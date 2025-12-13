import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, GraduationCap, ShieldCheck, Zap } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="p-3 bg-primary-50 rounded-full mb-4">
      <Icon className="w-6 h-6 text-primary-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{desc}</p>
  </div>
);

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          Your Future, <span className="text-primary-600">Calculated.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-8">
          Upload your matric results and let our AI discover your perfect study path, matched bursaries, and career roadmap.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/upload" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
            Get Started Free
            <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
          </Link>
          <Link to="/resources" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
            Browse Universities
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Feature 
          icon={Zap} 
          title="Instant APS Calculation" 
          desc="Simply snap a photo of your results. We extract the data and calculate your score instantly." 
        />
        <Feature 
          icon={CheckCircle} 
          title="Personalized Matches" 
          desc="Get matched with courses you actually qualify for at over 30 SA institutions." 
        />
        <Feature 
          icon={ShieldCheck} 
          title="Bursary Finder" 
          desc="Don't let funding stop you. We find bursaries that match your academic profile." 
        />
      </section>

      {/* How it works */}
      <section className="bg-primary-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-8">How it works</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-700 font-bold mr-4">1</span>
              <div>
                <h4 className="font-semibold text-lg">Upload Results</h4>
                <p className="text-primary-100">Upload your statement of results or enter marks manually.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-700 font-bold mr-4">2</span>
              <div>
                <h4 className="font-semibold text-lg">AI Analysis</h4>
                <p className="text-primary-100">Our AI calculates your APS and matches you to courses.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-700 font-bold mr-4">3</span>
              <div>
                <h4 className="font-semibold text-lg">Plan Your Future</h4>
                <p className="text-primary-100">View salary trends, apply for bursaries, and follow your action plan.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
          <GraduationCap className="w-96 h-96" />
        </div>
      </section>
    </div>
  );
};

export default Home;