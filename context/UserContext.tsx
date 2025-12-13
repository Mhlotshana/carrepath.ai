import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, AnalysisResult } from '../types';

interface UserContextType {
  profile: StudentProfile | null;
  setProfile: (profile: StudentProfile) => void;
  analysis: AnalysisResult | null;
  setAnalysis: (analysis: AnalysisResult) => void;
  isPremium: boolean;
  unlockPremium: () => void;
  paymentVerified: boolean;
  setPaymentVerified: (verified: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [paymentVerified, setPaymentVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Persist basic state to local storage to survive refreshes
  useEffect(() => {
    const savedProfile = localStorage.getItem('cp_profile');
    const savedPremium = localStorage.getItem('cp_premium');
    const savedPaymentVerified = localStorage.getItem('cp_payment_verified');
    
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedPremium) setIsPremium(savedPremium === 'true');
    if (savedPaymentVerified) setPaymentVerified(savedPaymentVerified === 'true');
  }, []);

  useEffect(() => {
    if (profile) localStorage.setItem('cp_profile', JSON.stringify(profile));
    localStorage.setItem('cp_premium', String(isPremium));
    localStorage.setItem('cp_payment_verified', String(paymentVerified));
  }, [profile, isPremium, paymentVerified]);

  const unlockPremium = () => setIsPremium(true);

  return (
    <UserContext.Provider value={{
      profile,
      setProfile,
      analysis,
      setAnalysis,
      isPremium,
      unlockPremium,
      paymentVerified,
      setPaymentVerified,
      isLoading,
      setIsLoading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};