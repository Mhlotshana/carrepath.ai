import React, { useState, useEffect } from 'react';
import { Loader2, Lightbulb, GraduationCap, Briefcase } from 'lucide-react';

const FACTS = [
    "Did you know? Engineers in South Africa have one of the highest starting salaries, averaging R45,000 pm.",
    "TVET Colleges offer NATED courses that can lead to National Diplomas equal to university qualifications.",
    "Data Science is the fastest-growing tech career in Africa, with a 30% year-on-year demand increase.",
    "Even with an APS of 20, you can bridge into university through a Higher Certificate program.",
    "Artisans like Electricians and Plumbers often earn more than some university graduates in their first 5 years.",
    "NSFAS covers tuition, accommodation, and a living allowance for eligible public university students."
];

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = "Analyzing your future..." }) => {
    const [factIndex, setFactIndex] = useState(0);

    useEffect(() => {
        if (!isVisible) return;
        const interval = setInterval(() => {
            setFactIndex((prev) => (prev + 1) % FACTS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md transition-all duration-500">
            <div className="w-full max-w-md px-6 text-center">
                {/* Animated Icon */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-6 rounded-full shadow-xl border border-primary-50">
                        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                    </div>
                </div>

                {/* Main Status */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">
                    {message}
                </h2>
                <p className="text-gray-500 mb-12 text-sm">Our AI is scanning 50+ institutions for you...</p>

                {/* Fact Card */}
                <div className="glass-card p-6 rounded-2xl border border-primary-100 bg-primary-50/30 relative overflow-hidden transition-all duration-500 transform hover:scale-105">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>

                    <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Did You Know?</h4>
                            <p className="text-gray-700 text-sm font-medium leading-relaxed min-h-[60px] animate-fade-in">
                                {FACTS[factIndex]}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
