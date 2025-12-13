import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { extractMatricData, analyzeProfile } from '../services/geminiService';
import { calculateLevel, calculateTotalAPS } from '../services/apsCalculator';
import { SUBJECT_OPTIONS } from '../constants';
import { Subject } from '../types';
import { Upload as UploadIcon, Camera, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { setProfile, setAnalysis, setIsLoading } = useUser();
  
  // State for the chronological flow
  const [step, setStep] = useState<'upload' | 'processing' | 'manual'>('upload');
  const [processingStage, setProcessingStage] = useState<string>('');
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [studentName, setStudentName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [manualSubjects, setManualSubjects] = useState<Subject[]>([
    { name: 'English Home Language', mark: 0, level: 0 },
    { name: 'Mathematics', mark: 0, level: 0 },
    { name: 'Life Orientation', mark: 0, level: 0 },
  ]);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIC: AUTOMATED FLOW ---

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        // Automatically start processing once loaded
        startAutomatedAnalysis(selectedFile, result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const startAutomatedAnalysis = async (fileObj: File, dataUrl: string) => {
    setStep('processing');
    setError('');

    try {
      // Stage 1: Extraction
      setProcessingStage('Scanning document...');
      const base64 = dataUrl.split(',')[1];
      const data = await extractMatricData(base64, fileObj.type);

      if (data.subjects && data.subjects.length >= 3) {
        // Successful extraction
        const subjectsWithLevels = data.subjects.map(s => ({
          ...s,
          level: calculateLevel(s.mark)
        }));
        
        const extractedName = data.name || "Student";
        const extractedId = data.idNumber || "";
        const aps = calculateTotalAPS(subjectsWithLevels);

        setStudentName(extractedName);
        setIdNumber(extractedId);
        setManualSubjects(subjectsWithLevels);

        // Stage 2: Analysis
        setProcessingStage(`Calculated APS: ${aps}. Generating career paths...`);
        
        // Save to context immediately
        setProfile({
            name: extractedName,
            idNumber: extractedId,
            subjects: subjectsWithLevels,
            apsScore: aps
        });

        // Trigger AI Analysis
        const analysisResult = await analyzeProfile(subjectsWithLevels, aps);
        setAnalysis(analysisResult);

        // Stage 3: Done
        setProcessingStage('Finalizing...');
        setTimeout(() => navigate('/results'), 800);

      } else {
        // Extraction failed or unclear
        setError("We couldn't clearly read the subjects. Please enter them manually.");
        setStep('manual');
      }

    } catch (e) {
      console.error(e);
      setError('Auto-scan failed. Please switch to manual entry.');
      setStep('manual');
    }
  };

  const handleManualSubmit = async () => {
    if (!studentName) {
        setError('Please enter your name.');
        return;
    }
    if (manualSubjects.some(s => s.mark === 0 || !s.name)) {
        setError('Please ensure all subjects have valid names and marks.');
        return;
    }

    setStep('processing');
    setProcessingStage('Analyzing your profile...');
    
    const aps = calculateTotalAPS(manualSubjects);
    setProfile({
        name: studentName,
        idNumber: idNumber || 'N/A',
        subjects: manualSubjects,
        apsScore: aps
    });

    try {
        const analysis = await analyzeProfile(manualSubjects, aps);
        setAnalysis(analysis);
        navigate('/results');
    } catch (e) {
        setError('Analysis failed. Please try again.');
        setStep('manual');
    }
  };

  // --- MANUAL HELPERS ---

  const handleSubjectChange = (index: number, field: keyof Subject, value: string | number) => {
    const updated = [...manualSubjects];
    if (field === 'mark') {
      const numValue = Number(value);
      updated[index].mark = numValue;
      updated[index].level = calculateLevel(numValue);
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setManualSubjects(updated);
  };

  const addSubject = () => setManualSubjects([...manualSubjects, { name: '', mark: 0, level: 0 }]);
  const removeSubject = (index: number) => setManualSubjects(manualSubjects.filter((_, i) => i !== index));

  // --- RENDER ---

  return (
    <div className="max-w-2xl mx-auto py-8">
      
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Upload your Results</h1>
        <p className="text-gray-500">We'll auto-calculate your APS and find your best career matches.</p>
      </div>

      {/* PROCESSING STATE */}
      {step === 'processing' && (
        <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
           <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-8 h-8 text-primary-600 animate-pulse" />
              </div>
           </div>
           <h2 className="text-xl font-bold text-gray-900 mb-2">{processingStage}</h2>
           <p className="text-gray-500 text-sm">This usually takes about 10 seconds.</p>
        </div>
      )}

      {/* UPLOAD STATE */}
      {step === 'upload' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="group relative bg-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300"
           >
             <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,application/pdf" 
                onChange={handleFileChange} 
                className="hidden" 
             />
             
             <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <UploadIcon className="w-10 h-10" />
             </div>
             
             <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your Statement of Results here</h3>
             <p className="text-gray-500 mb-8">Supports PDF, JPG, or PNG</p>
             
             <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-gray-200 group-hover:shadow-xl transition-all">
                Select File
             </button>
           </div>

           <div className="mt-8 text-center">
             <button onClick={() => setStep('manual')} className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
                Or enter your marks manually
             </button>
           </div>
        </div>
      )}

      {/* MANUAL STATE */}
      {step === 'manual' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-gray-900">Manual Entry</h2>
             {error && <div className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">{error}</div>}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Student Name</label>
                <input 
                  type="text" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Your Name"
                />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">ID Number (Optional)</label>
                 <input 
                  type="text" 
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="ID Number"
                />
             </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                <span>Subject</span>
                <span className="w-20 text-center">Mark %</span>
            </div>
            {manualSubjects.map((subject, index) => (
               <div key={index} className="flex gap-3">
                   <select 
                      value={SUBJECT_OPTIONS.includes(subject.name) ? subject.name : ''} 
                      onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                      className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                   >
                     <option value="" disabled>Select Subject</option>
                     {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                     {!SUBJECT_OPTIONS.includes(subject.name) && subject.name && <option value={subject.name}>{subject.name}</option>}
                   </select>
                   <div className="w-24 relative">
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={subject.mark}
                        onChange={(e) => handleSubjectChange(index, 'mark', e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                      <span className="absolute right-8 top-3 text-gray-400 text-sm pointer-events-none">%</span>
                   </div>
                   <button onClick={() => removeSubject(index)} className="text-gray-400 hover:text-red-500 px-2">
                      <Trash2 className="w-5 h-5" />
                   </button>
               </div>
            ))}
            <button onClick={addSubject} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" /> Add Subject
            </button>
          </div>

          <div className="flex gap-4">
             <button onClick={() => setStep('upload')} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Back
             </button>
             <button onClick={handleManualSubmit} className="flex-[2] py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-colors flex items-center justify-center">
                Analyze Results <ArrowRight className="w-5 h-5 ml-2" />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
