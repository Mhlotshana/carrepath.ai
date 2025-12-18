import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LoadingOverlay from '../components/LoadingOverlay';
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

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('⚠️ File too large! Please use an image under 10MB or take a photo directly.');
        return;
      }

      // Validate file type
      if (!selectedFile.type.includes('image') && !selectedFile.type.includes('pdf')) {
        setError('⚠️ Invalid file type. Please upload an image (JPG, PNG) or PDF.');
        return;
      }

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
      console.error('Extraction error details:', e);

      // Provide specific, helpful error messages
      const errorMessage = e.message || 'Unknown error occurred';

      if (errorMessage.includes('API key') || errorMessage.includes('CONFIGURATION_ERROR')) {
        setError('⚠️ System configuration issue detected. The API key may not be set up correctly. Please contact support or use manual entry for now.');
      } else if (errorMessage.includes('QUALITY_ERROR') || errorMessage.includes('Not enough subjects')) {
        setError('📸 Image quality issue: We could only detect a few subjects. Tips:\n• Use better lighting\n• Ensure all text is clearly visible\n• Avoid glare or shadows\n• Or use manual entry below');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('🌐 Connection issue: Please check your internet and try again, or use manual entry.');
      } else {
        setError(`❌ Auto-scan unsuccessful: ${errorMessage}\n\nYou can use manual entry below to continue.`);
      }

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
    if (manualSubjects.some(s => s.mark > 100 || s.mark < 0)) {
      setError('Marks must be between 0 and 100.');
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
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Upload your Results</h1>
        <p className="text-gray-600 text-lg">We'll auto-calculate your APS and find your best career matches.</p>
      </div>

      {/* LOADING STATE - FULL SCREEN OVERLAY */}
      <LoadingOverlay isVisible={step === 'processing'} message={processingStage} />

      {/* UPLOAD STATE */}
      {step === 'upload' && (
        <div className="animate-fade-in-up animate-delay-100">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative glass-card rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center cursor-pointer hover:border-primary-500 hover:bg-white/60 transition-all duration-300"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
              <UploadIcon className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">Drop your Statement of Results here</h3>
            <p className="text-gray-500 mb-10 text-lg">Supports PDF, JPG, or PNG</p>

            <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-gray-900/20 group-hover:shadow-xl group-hover:-translate-y-1 transition-all">
              Select File
            </button>
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => setStep('manual')} className="text-base font-medium text-gray-500 hover:text-primary-600 transition-colors">
              Or enter your marks manually
            </button>
          </div>
        </div>
      )}

      {/* MANUAL STATE */}
      {step === 'manual' && (
        <div className="glass-card rounded-3xl p-8 md:p-10 animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Manual Entry</h2>
            {error && <div className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">{error}</div>}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">ID Number (Optional)</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                placeholder="ID Number"
              />
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
              <span>Subject</span>
              <span className="w-24 text-center">Mark %</span>
            </div>
            {manualSubjects.map((subject, index) => (
              <div key={index} className="flex gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <select
                  value={SUBJECT_OPTIONS.includes(subject.name) ? subject.name : ''}
                  onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                  className="flex-grow p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                >
                  <option value="" disabled>Select Subject</option>
                  {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  {!SUBJECT_OPTIONS.includes(subject.name) && subject.name && <option value={subject.name}>{subject.name}</option>}
                </select>
                <div className="w-28 relative">
                  <input
                    type="number"
                    min="0" max="100"
                    value={subject.mark}
                    onChange={(e) => handleSubjectChange(index, 'mark', e.target.value)}
                    className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-center font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                  />
                  <span className="absolute right-8 top-4 text-gray-400 text-sm pointer-events-none font-bold">%</span>
                </div>
                <button onClick={() => removeSubject(index)} className="text-gray-400 hover:text-red-500 px-2 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button onClick={addSubject} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:border-primary-400 hover:text-primary-600 transition-all flex items-center justify-center hover:bg-primary-50/50">
              <Plus className="w-5 h-5 mr-2" /> Add Subject
            </button>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep('upload')} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              Back
            </button>
            <button onClick={handleManualSubmit} className="flex-[2] py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center">
              Analyze Results <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
