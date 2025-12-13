import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, GraduationCap, ShieldCheck, Zap, Sparkles, Brain, Target } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: string }) => (
  <div className={`glass-card p-8 rounded-2xl flex flex-col items-start hover:bg-white/40 transition-all duration-300 animate-fade-in-up ${delay}`}>
    <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl mb-6 shadow-inner">
      <Icon className="w-8 h-8 text-primary-600" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ number, title, desc, delay }: { number: string, title: string, desc: string, delay: string }) => (
  <div className={`flex items-start p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors animate-fade-in-up ${delay}`}>
    <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 font-bold text-white text-xl shadow-lg shadow-primary-500/30 mr-6">
      {number}
    </span>
    <div>
      <h4 className="font-bold text-xl text-white mb-2">{title}</h4>
      <p className="text-primary-100 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Home: React.FC = () => {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative text-center py-20 md:py-32 overflow-visible">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-300/20 rounded-full blur-3xl -z-10 animate-blob mix-blend-multiply" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-300/20 rounded-full blur-3xl -z-10 animate-blob animate-delay-200 mix-blend-multiply" />

        <div className="inline-flex items-center px-4 py-2 rounded-full glass mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-secondary-500 mr-2" />
          <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
            Powered by Gemini 2.5 Flash
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight animate-fade-in-up animate-delay-100">
          Your Future, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 bg-size-200 animate-gradient">
            Calculated & Planned.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12 animate-fade-in-up animate-delay-200 leading-relaxed">
          Upload your matric results and let our AI discover your perfect study path, matched bursaries, and career roadmap in seconds.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up animate-delay-300">
          <Link to="/upload" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gray-900 rounded-xl overflow-hidden shadow-2xl shadow-primary-900/20 transition-transform hover:scale-105 hover:shadow-primary-900/40">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-100 transition-opacity group-hover:opacity-90" />
            <span className="relative flex items-center">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link to="/resources" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            Browse Resources
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Feature
          icon={Zap}
          title="Instant APS Analysis"
          desc="Simply snap a photo of your results. We extract the data and calculate your score instantly with 99% accuracy."
          delay="animate-delay-100"
        />
        <Feature
          icon={Brain}
          title="AI Course Matching"
          desc="Get matched with courses you actually qualify for at over 30 SA institutions based on your unique subject profile."
          delay="animate-delay-200"
        />
        <Feature
          icon={Target}
          title="Bursary Finder"
          desc="Don't let funding stop you. We automatically filter bursaries that match your marks and career goals."
          delay="animate-delay-300"
        />
      </section>

      {/* How it works */}
      <section className="relative rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-dark-900 z-0" />

        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] z-0" />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-8">How it works</h2>
            <div className="space-y-4">
              <Step
                number="1"
                title="Upload Results"
                desc="Upload your statement of results (PDF or Image) or enter marks manually."
                delay="animate-delay-100"
              />
              <Step
                number="2"
                title="AI Analysis"
                desc="Our Gemini-powered AI calculates your APS and matches you to likely acceptances."
                delay="animate-delay-200"
              />
              <Step
                number="3"
                title="Plan Your Future"
                desc="View salary trends, apply for bursaries, and generate a step-by-step action plan."
                delay="animate-delay-300"
              />
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="glass-card p-8 rounded-3xl border-transparent bg-white/5 backdrop-blur-md transform rotate-3 hover:rotate-0 transition-all duration-500">
              <GraduationCap className="w-full h-full text-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2">99%</div>
                  <div className="text-primary-200 uppercase tracking-widest text-sm font-semibold">Match Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;