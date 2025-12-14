import React from 'react';

const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="h-8 w-12 bg-gray-200 rounded-lg"></div>
            <div className="h-5 w-20 bg-gray-100 rounded-full"></div>
        </div>
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 w-1/2 bg-gray-100 rounded mb-6"></div>
        <div className="border-t border-gray-50 pt-4 mt-auto flex justify-between">
            <div className="h-4 w-24 bg-gray-100 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
    </div>
);

const SkeletonResults: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
            {/* Header Skeleton */}
            <div className="glass-card rounded-3xl p-8 mb-8 border border-white/50 relative overflow-hidden">
                <div className="md:flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6 mb-6 md:mb-0">
                        <div className="w-20 h-20 bg-gray-200 rounded-2xl animate-pulse"></div>
                        <div>
                            <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
                            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-32 bg-white rounded-full border border-gray-200 animate-pulse"></div>
                ))}
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
};

export default SkeletonResults;
