import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import SkeletonResults from '../components/SkeletonResults';
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

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ResultsPage: React.FC = () => {
  const { profile, analysis, isPremium, paymentVerified, isLoading } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'bursaries' | 'plan'>('overview');
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const downloadPDF = async () => {
    const element = document.getElementById('printable-results');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      // Temporarily expand everything for PDF capture if needed
      // Or use a hidden comprehensive view
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc' // Matches bg-gray-50
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CareerPath_Analysis_${profile?.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    if (!analysis && !isLoading) {
      navigate('/upload');
    }
  }, [analysis, isLoading, navigate]);

  if (isLoading) return <SkeletonResults />;
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
    if (t.includes('degree')) return 'text-primary-600 bg-primary-50 border border-primary-100';
    if (t.includes('diploma')) return 'text-purple-600 bg-purple-50 border border-purple-100';
    if (t.includes('certificate')) return 'text-orange-600 bg-orange-50 border border-orange-100';
    if (t.includes('short') || t.includes('course')) return 'text-emerald-600 bg-emerald-50 border border-emerald-100';
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
    if (type.toLowerCase().includes('certificate')) return <FileText className="w-5 h-5 text-emerald-600" />;
    if (type.toLowerCase().includes('online') || type.toLowerCase().includes('bootcamp')) return <Laptop className="w-5 h-5 text-purple-600" />;

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
      className={`flex items-center px-6 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === id
        ? 'border-primary-600 text-primary-600 bg-primary-50/50'
        : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
    >
      <Icon className={`w-4 h-4 mr-2 ${activeTab === id ? 'text-primary-600' : 'text-gray-400'}`} />
      {label}
      {count !== undefined && (
        <span className={`ml-2 text-xs py-0.5 px-2 rounded-full font-bold ${activeTab === id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Summary */}
      <section className="glass-card p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100/20 to-secondary-100/20 rounded-full blur-3xl -z-10" />

        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-full w-32 h-32 flex flex-col items-center justify-center border-4 border-white shadow-2xl flex-shrink-0 text-white animate-float">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">APS Score</span>
          <span className="text-4xl font-extrabold tracking-tight">{profile.apsScore}</span>
        </div>

        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Hello, {profile.name}</h1>
              <p className="text-gray-600 text-base font-medium">We've analyzed your results and found <strong className="text-primary-600">{courses.length} potential matches</strong>.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center px-5 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2 text-primary-600" />
                    Download PDF
                  </>
                )}
              </button>

              <div className={`flex items-center px-4 py-2 rounded-full text-xs font-bold border shadow-sm ${hasPremiumAccess
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                {hasPremiumAccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Premium Access
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Free Account
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE VIEW FOR PDF EXPORT (Hidden from UI) */}
      <div id="printable-results" className="fixed left-[-9999px] top-0 w-[800px] p-10 bg-gray-50 text-gray-900 font-sans">
        <div className="mb-10 flex justify-between items-end border-b-4 border-primary-600 pb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-1">CareerPath<span className="text-primary-600">.AI</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Official Career Analysis Report</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">{profile.name}</p>
            <p className="text-xs text-gray-500">APS Score: {profile.apsScore}</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 1. Insight Summary */}
        <div className="mb-12">
          <h2 className="text-2xl font-black mb-4 flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-3 text-primary-600" />
            Strategic Insight
          </h2>
          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 mb-6">
            <h3 className="font-bold text-lg mb-2 text-gray-800">{summary.title}</h3>
            <p className="text-gray-600 leading-relaxed">{summary.overview}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
              <h4 className="font-bold text-green-800 mb-3 flex items-center">
                <ThumbsUp className="w-4 h-4 mr-2" /> Strengths
              </h4>
              <ul className="space-y-2">
                {summary.strengths.map((s, i) => <li key={i} className="text-xs text-green-700 font-medium">• {s}</li>)}
              </ul>
            </div>
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                <AlertOctagon className="w-4 h-4 mr-2" /> Considerations
              </h4>
              <ul className="space-y-2">
                {summary.limitations.map((l, i) => <li key={i} className="text-xs text-orange-700 font-medium">• {l}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Top University Matches */}
        <div className="mb-12 page-break-before">
          <h2 className="text-2xl font-black mb-6 flex items-center">
            <GraduationCap className="w-6 h-6 mr-3 text-primary-600" />
            Top Study Matches
          </h2>
          <div className="space-y-4">
            {courses.slice(0, 5).map((course, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{course.name}</h3>
                  <span className="text-[10px] font-black uppercase text-gray-400">{course.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{course.institution}</p>
                  <p className="text-xs font-bold text-primary-600">APS Req: {course.minAps}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Action Plan */}
        <div className="page-break-before">
          <h2 className="text-2xl font-black mb-6 flex items-center">
            <ListTodo className="w-6 h-6 mr-3 text-primary-600" />
            Next Steps
          </h2>
          <div className="space-y-4">
            {actionPlan.map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border-l-4 border-l-primary-600 border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-black text-xs text-gray-400">{i + 1}</div>
                <div>
                  <p className="font-bold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{item.category} • Due: {item.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">Generated by CareerPath.AI - Your Future, Simplified.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass rounded-2xl overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          <TabButton id="overview" label="Insight" icon={LayoutDashboard} />
          <TabButton id="courses" label="Study Matches" icon={GraduationCap} count={courses.length} />
          <TabButton id="bursaries" label="Funding" icon={Wallet} count={bursaries.length} />
          <TabButton id="plan" label="Action Plan" icon={ListTodo} />
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            {/* 1. The Verdict Card */}
            <div className="md:col-span-2 bg-gradient-to-r from-gray-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Info className="w-8 h-8 text-primary-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{summary.title}</h2>
                  <p className="text-gray-300 leading-relaxed max-w-3xl">{summary.overview}</p>
                </div>
              </div>
            </div>

            {/* 2. Strengths Card */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="flex items-center font-bold text-green-700 mb-6 text-lg">
                <ThumbsUp className="w-5 h-5 mr-2" /> Key Strengths
              </h3>
              <ul className="space-y-4">
                {summary.strengths?.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-700 font-medium bg-green-50/50 p-3 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Limitations Card */}
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="flex items-center font-bold text-orange-600 mb-6 text-lg">
                <AlertOctagon className="w-5 h-5 mr-2" /> Important Considerations
              </h3>
              <ul className="space-y-4">
                {summary.limitations?.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-700 font-medium bg-orange-50/50 p-3 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Call to Action for Courses */}
            <div className="md:col-span-2 mt-4 text-center">
              <button
                onClick={() => setActiveTab('courses')}
                className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all transform hover:scale-105"
              >
                View {courses.length} Recommended Courses
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>

            {/* 4. Salary Graph */}
            <div className="md:col-span-2 glass-card p-8 rounded-3xl mt-4">
              <h3 className="font-bold text-gray-900 mb-8 flex items-center text-lg">
                <TrendingUp className="w-6 h-6 mr-3 text-primary-600" />
                Projected Career Earnings
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} tickFormatter={(val) => `R${val / 1000}k`} />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                    />
                    <Bar dataKey="salary" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Study Options */}
        {activeTab === 'courses' && (
          <div className="animate-fade-in-up">
            {courses.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl text-center border-dashed border-2 border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-6">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-6">We couldn't match any courses to your current APS. Try verifying your subjects.</p>
                <button onClick={() => navigate('/upload')} className="text-primary-600 font-bold hover:underline">Check marks again</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {displayedCourses.map((course, idx) => (
                  <div key={idx} className={`glass-card rounded-2xl border-0 transition-all duration-300 ${expandedCourse === idx ? 'ring-2 ring-primary-500 bg-white' : 'bg-white/60 hover:bg-white'}`}>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${getTypeColor(course.type)}`}>{course.type}</span>
                          {course.applicationDeadline && (
                            <span className="flex items-center text-[10px] font-bold px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-100">
                              <Clock className="w-3 h-3 mr-1" /> Closes: {course.applicationDeadline}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{course.duration}</span>
                      </div>

                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl flex-shrink-0 border border-gray-100 shadow-sm">
                          {getCourseIcon(course.name, course.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{course.name}</h3>
                          <p className="text-sm font-medium text-gray-500">{course.institution}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                        <div className="flex items-center text-xs font-bold text-gray-500">
                          <span className="bg-gray-100 px-2.5 py-1 rounded-md mr-2 text-gray-700">Min APS: {course.minAps}</span>
                          <span>{course.faculty}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <a
                            href={getApplicationLink(course)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Visit Website"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => toggleExpand(idx)}
                            className="flex items-center text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 px-3 py-1.5 rounded-lg"
                          >
                            {expandedCourse === idx ? 'Hide' : 'Details'}
                            {expandedCourse === idx ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    {expandedCourse === idx && (
                      <div className="px-6 pb-6 pt-0 text-sm border-t border-gray-100 bg-gray-50/50 rounded-b-2xl animate-fade-in-up">
                        <div className="grid grid-cols-1 gap-6 pt-6">
                          {/* Entry Requirements - Modern Styled Card */}
                          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>
                            <h4 className="flex items-center font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                              <FileText className="w-4 h-4 mr-2 text-primary-500" />
                              Admissions Checklist
                            </h4>

                            <div className="space-y-3">
                              {(course.requirements ? parseRequirements(course.requirements) : [`APS of ${course.minAps} required`]).map((req, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                  <div className="mt-0.5">{getRequirementIcon(req)}</div>
                                  <span className="text-sm text-gray-700 font-medium leading-relaxed">{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Modules */}
                          {course.modules && course.modules.length > 0 && (
                            <div>
                              <h4 className="flex items-center font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider text-gray-400">
                                Key Modules
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {course.modules.map((mod, i) => (
                                  <span key={i} className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                                    {mod}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Career Outcomes */}
                          {course.careerOutcomes && course.careerOutcomes.length > 0 && (
                            <div>
                              <h4 className="flex items-center font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider text-gray-400">
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

                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                          <a
                            href={getApplicationLink(course)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm font-bold text-white bg-gray-900 hover:bg-black px-6 py-4 rounded-xl transition-all shadow-xl shadow-gray-200 transform hover:-translate-y-1"
                          >
                            {course.applicationLink ? 'Visit Application Portal' : 'How to Apply'}
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Locked Courses Visual Overlay */}
                {!hasPremiumAccess && lockedCourseCount > 0 && (
                  <div className="col-span-1 md:col-span-2 relative mt-4">
                    {/* Blurred Dummy Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-40 filter blur-sm select-none pointer-events-none" aria-hidden="true">
                      {[1, 2].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                          <div className="flex justify-between mb-4">
                            <div className="h-6 w-24 bg-gray-200 rounded"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                          </div>
                          <div className="h-8 w-3/4 bg-gray-300 rounded mb-4"></div>
                          <div className="h-4 w-1/2 bg-gray-100 rounded mb-4"></div>
                          <div className="h-4 w-1/3 bg-gray-100 rounded"></div>
                        </div>
                      ))}
                    </div>

                    {/* Unlock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div
                        onClick={() => navigate('/payment')}
                        className="bg-gray-900/95 text-white p-10 rounded-3xl shadow-2xl text-center max-w-sm backdrop-blur-md border border-white/10 cursor-pointer transform hover:scale-105 transition-all w-full mx-4"
                      >
                        <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Lock className="w-8 h-8 text-secondary-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Unlock {lockedCourseCount} More Courses</h3>
                        <p className="text-gray-300 mb-8 text-sm leading-relaxed">Get access to your full list of tailored university matches.</p>
                        <button className="bg-secondary-500 hover:bg-secondary-400 text-gray-900 font-bold py-4 px-8 rounded-xl transition-colors w-full flex items-center justify-center">
                          Unlock Now - R120
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
        }

        {/* Bursaries */}
        {
          activeTab === 'bursaries' && (
            <div className="space-y-4 animate-fade-in-up">
              {displayedBursaries.length === 0 ? (
                <div className="text-center py-16 bg-white/50 glass-card rounded-3xl border-dashed border-2 border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">No bursaries found</h3>
                  <p className="text-gray-500">We couldn't find specific funding for this profile.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedBursaries.map((bursary, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col h-full hover:border-primary-200 transition-colors group">
                      <div className="mb-6 flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2.5 bg-green-50 rounded-xl text-green-600 border border-green-100">
                            <Wallet className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
                            Bursary
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">{bursary.name}</h4>
                        <p className="text-sm text-gray-500 font-medium">{bursary.provider}</p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-gray-50 mt-auto">
                        <div className="flex items-center text-xs font-bold text-gray-500">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          Closes: {bursary.closingDate}
                        </div>

                        <a
                          href={bursary.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-gray-900 text-white hover:bg-black font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-gray-200 transform group-hover:-translate-y-1"
                        >
                          Apply Now
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }

        {/* Action Plan */}
        {
          activeTab === 'plan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              {actionPlan.map((item, idx) => (
                <div key={idx} className="glass-card p-6 rounded-2xl flex items-start gap-5 hover:bg-white transition-colors">
                  <div className={`mt-1 w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.completed ? 'bg-green-100 border-green-200' : 'border-gray-200'}`}>
                    {item.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight mb-2">{item.title}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {item.category}
                      </span>
                      <span className="text-xs font-medium text-gray-400 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
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