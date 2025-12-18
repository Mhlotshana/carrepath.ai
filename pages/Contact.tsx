import React, { useState } from 'react';
import { Mail, MessageCircle, Send, CheckCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, just show success (user can add actual email service later)
        setSubmitted(true);
        console.log('Contact form submission:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <div className="glass-card p-12 rounded-3xl text-center animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Received!</h2>
                    <p className="text-gray-600 mb-8">
                        Thank you for reaching out. We'll get back to you within 24 hours at <strong>{formData.email}</strong>
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all"
                    >
                        Send Another Message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-10 text-center animate-fade-in-up">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Get in Touch</h1>
                <p className="text-gray-600 text-lg">
                    Have questions? We're here to help you navigate your career journey.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="glass-card p-6 rounded-2xl animate-fade-in-up animate-delay-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary-100 rounded-xl">
                            <Mail className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                            <p className="text-sm text-gray-600 mb-2">Get a response within 24 hours</p>
                            <a href="mailto:support@careerpath.ai" className="text-primary-600 font-medium hover:underline">
                                support@careerpath.ai
                            </a>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl animate-fade-in-up animate-delay-200">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-secondary-100 rounded-xl">
                            <MessageCircle className="w-6 h-6 text-secondary-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Live Support</h3>
                            <p className="text-sm text-gray-600 mb-2">Monday - Friday, 8am - 5pm SAST</p>
                            <p className="text-secondary-600 font-medium">Chat available in-app</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card p-8 md:p-10 rounded-3xl animate-fade-in-up animate-delay-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Your Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject *</label>
                        <select
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                        >
                            <option value="">Select a topic</option>
                            <option value="payment">Payment Issues</option>
                            <option value="results">Course Recommendations</option>
                            <option value="technical">Technical Support</option>
                            <option value="general">General Inquiry</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                        <textarea
                            name="message"
                            required
                            value={formData.message}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all resize-none"
                            placeholder="Tell us how we can help..."
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <Send className="w-5 h-5" />
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactPage;
