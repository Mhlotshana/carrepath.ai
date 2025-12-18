import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        resetErrorBoundary();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="max-w-md w-full glass-card p-8 md:p-12 rounded-3xl text-center animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Oops! Something went wrong
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    We encountered an unexpected error. Don't worry, your data is safe.
                    Try refreshing the page or going back to the home screen.
                </p>

                {import.meta.env.DEV && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                        <p className="text-xs font-mono text-red-800 break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Refresh Page
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:border-primary-300 hover:text-primary-700 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                    If the problem persists, please contact support@careerpath.ai
                </p>
            </div>
        </div>
    );
};

// Simple Error Boundary wrapper
export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error Boundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
