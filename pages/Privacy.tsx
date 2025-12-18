import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
            </Link>

            <div className="glass-card p-8 md:p-12 rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary-100 rounded-xl">
                        <Shield className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
                </div>
                <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                <div className="prose prose-lg max-w-none">
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>

                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Information You Provide</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">When you use CareerPath.AI, we may collect:</p>
                    <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-6">
                        <li><strong>Personal Information:</strong> Name, ID number (optional), email address (if provided)</li>
                        <li><strong>Academic Information:</strong> Matric results, subject marks, calculated APS score</li>
                        <li><strong>Payment Information:</strong> Proof of payment documents for verification purposes</li>
                        <li><strong>Usage Data:</strong> Pages visited, features used, interaction patterns</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Automatically Collected Information</h3>
                    <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-6">
                        <li>Device information (browser type, operating system)</li>
                        <li>IP address and general location</li>
                        <li>Cookies and local storage data</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">We use collected information to:</p>
                    <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-6">
                        <li>Generate personalized career and course recommendations</li>
                        <li>Calculate your APS score accurately</li>
                        <li>Verify payment for premium features</li>
                        <li>Improve our AI algorithms and service quality</li>
                        <li>Communicate important updates or support messages</li>
                        <li>Analyze usage patterns to enhance user experience</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Storage and Security</h2>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                        <p className="text-blue-800 font-medium">
                            <strong>Local Storage:</strong> Your analysis results and profile are stored locally in your browser's
                            localStorage for quick access. We do not store this data on our servers unless you create an account.
                        </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        We implement industry-standard security measures including:
                    </p>
                    <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-6">
                        <li>HTTPS encryption for all data transmission</li>
                        <li>Secure server-side API key management</li>
                        <li>Regular security audits and updates</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Sharing and Disclosure</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We <strong>DO NOT sell</strong> your personal information to third parties. We may share data with:
                    </p>
                    <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-6">
                        <li><strong>AI Service Providers:</strong> Google Gemini AI processes your data to generate recommendations (subject to Google's privacy policy)</li>
                        <li><strong>Analytics Services:</strong> Anonymized usage data for analytics (if applicable)</li>
                        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights (POPIA Compliance)</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Under South Africa's Protection of Personal Information Act (POPIA), you have the right to:
                    </p>
                    <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-6">
                        <li>Access your personal information</li>
                        <li>Correct inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Object to processing of your data</li>
                        <li>Withdraw consent at any time</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        To exercise these rights, contact us at support@careerpath.ai
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cookies and Tracking</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        We use localStorage (not cookies) to cache your results for faster access. You can clear this data
                        at any time through your browser settings.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Children's Privacy</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Our service is designed for matric students (typically 17-18 years old). We comply with applicable
                        privacy laws regarding minors. If you are under 18, please use the service with parental guidance.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Changes to This Policy</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        We may update this Privacy Policy periodically. Continued use of the Service after changes indicates
                        acceptance of the updated policy.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        For privacy-related questions or concerns, please contact:<br />
                        Email: support@careerpath.ai<br />
                        We will respond to all requests within 30 days.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
