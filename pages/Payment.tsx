import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { verifyPayment } from '../services/geminiService';
import { CheckCircle, Upload, AlertCircle, Loader2, ArrowLeft, Mail, RefreshCw, PartyPopper } from 'lucide-react';

const PaymentPage: React.FC = () => {
  const { profile, unlockPremium, setPaymentVerified } = useUser();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock ID if profile missing (shouldn't happen in flow)
  const referenceId = profile?.idNumber || 'CP-USER-123';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess(false);
      setShowAnimation(false);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setIsVerifying(true);
    setError('');
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const verified = await verifyPayment(base64, file.type, referenceId);
        
        if (verified) {
          setSuccess(true);
          unlockPremium();
          setPaymentVerified(true);
          
          // Trigger animation state shortly after render
          setTimeout(() => setShowAnimation(true), 50);

          // Redirect after 3 seconds
          setTimeout(() => navigate('/results'), 3000);
        } else {
          setError(`Verification unsuccessful. Please ensure your proof of payment clearly shows:
• The amount of R120.00
• The correct reference number (${referenceId})
• A clear, legible view of the transaction details`);
        }
        setIsVerifying(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setError('Error processing file. Please try a different format (PDF or JPG).');
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/results')} className="text-gray-500 hover:text-gray-900 mb-6 flex items-center">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Results
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden min-h-[550px] relative transition-all duration-500">
        {success ? (
          <div className={`absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center transition-all duration-700 ease-out ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-50 rounded-full p-8 shadow-sm">
                <CheckCircle className="w-20 h-20 text-green-600 animate-[bounce_1s_infinite]" />
              </div>
              
              {/* Confetti particles (CSS only) */}
              <div className={`absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-4 animate-bounce delay-75"></div>
                <div className="absolute top-1/4 right-0 w-2 h-2 bg-blue-400 rounded-full transform translate-x-4 animate-bounce delay-100"></div>
                <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-red-400 rounded-full transform -translate-x-4 animate-bounce delay-150"></div>
                <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full transform translate-y-4 animate-bounce delay-200"></div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Verified!</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              Success! Your premium features have been unlocked. Redirecting you to your dashboard...
            </p>
            
            <div className="flex items-center space-x-2 text-primary-600 font-medium">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 p-8 text-white text-center">
              <h1 className="text-2xl font-bold mb-2">Unlock CareerPath Premium</h1>
              <p className="text-gray-300">One-time payment of <span className="text-white font-bold text-xl">R120.00</span></p>
            </div>

            <div className="p-8">
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">1. Make a Bank Transfer</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank:</span>
                    <span className="font-medium">Capitec Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Number:</span>
                    <span className="font-medium">123 456 7890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Branch Code:</span>
                    <span className="font-medium">470010</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-500">Reference:</span>
                    <span className="font-bold text-primary-600">{referenceId}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">* Use your ID number as reference so we can track it.</p>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">2. Upload Proof of Payment</h3>
                <div 
                  onClick={() => !isVerifying && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:bg-gray-50'} ${isVerifying ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" disabled={isVerifying} />
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-primary-600' : 'text-gray-400'}`} />
                  {file ? (
                    <span className="text-primary-700 font-medium">{file.name}</span>
                  ) : (
                    <span className="text-gray-500">Click to upload photo or PDF</span>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex flex-col gap-3 text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="whitespace-pre-wrap">{error}</div>
                  </div>
                  <div className="flex flex-wrap gap-3 pl-7 mt-1">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-md font-medium hover:bg-red-200 transition-colors text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Try Uploading Again
                    </button>
                    <a 
                      href="mailto:support@careerpath.ai?subject=Payment Verification Help"
                      className="flex items-center px-3 py-1.5 border border-red-200 text-red-700 rounded-md font-medium hover:bg-red-50 transition-colors text-xs"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5" />
                      Contact Support
                    </a>
                  </div>
                </div>
              )}

              <button 
                onClick={handleVerify}
                disabled={!file || isVerifying}
                className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center transition-all ${
                  !file || isVerifying
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30'
                }`}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...
                  </>
                ) : (
                  'Verify Payment & Unlock'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;