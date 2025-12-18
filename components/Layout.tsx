import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Upload, CreditCard, MessageCircle, BookOpen, Calendar, Menu, X, Home } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to} className={`relative group flex flex-col items-center justify-center p-2 text-xs md:text-sm md:flex-row md:space-x-2 transition-colors duration-200 ${active ? 'text-primary-600 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>
    <Icon className={`w-6 h-6 md:w-5 md:h-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`} />
    <span className="mt-1 md:mt-0">{label}</span>
    {active && (
      <span className="hidden md:block absolute -bottom-4 left-0 right-0 h-0.5 bg-primary-600 rounded-full animate-fade-in-up" />
    )}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Navigation (Desktop) */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <div className="bg-primary-50 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 text-primary-600" />
                </div>
                <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
                  CareerPath.AI
                </span>
              </Link>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-8">
              <NavItem to="/" icon={Home} label="Home" active={location.pathname === '/'} />
              <NavItem to="/upload" icon={Upload} label="Check APS" active={location.pathname === '/upload'} />
              <NavItem to="/results" icon={BookOpen} label="Results" active={location.pathname === '/results'} />
              <NavItem to="/resources" icon={BookOpen} label="Resources" active={location.pathname === '/resources'} />
              <NavItem to="/chat" icon={MessageCircle} label="Advisor" active={location.pathname === '/chat'} />
            </div>

            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-xl text-gray-500 hover:bg-white hover:text-primary-600 transition-colors focus:outline-none">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass border-t border-gray-100/50 absolute w-full animate-fade-in-up">
            <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col">
              <Link to="/" className="block px-4 py-3 rounded-xl hover:bg-primary-50 text-base font-medium text-gray-700 hover:text-primary-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/upload" className="block px-4 py-3 rounded-xl hover:bg-primary-50 text-base font-medium text-gray-700 hover:text-primary-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
              <Link to="/results" className="block px-4 py-3 rounded-xl hover:bg-primary-50 text-base font-medium text-gray-700 hover:text-primary-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Results</Link>
              <Link to="/chat" className="block px-4 py-3 rounded-xl hover:bg-primary-50 text-base font-medium text-gray-700 hover:text-primary-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>AI Advisor</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-12">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 glass rounded-2xl p-2 flex justify-around items-center z-50 shadow-2xl safe-area-bottom">
        <NavItem to="/upload" icon={Upload} label="Check" active={location.pathname === '/upload'} />
        <NavItem to="/results" icon={BookOpen} label="Plan" active={location.pathname === '/results'} />
        <NavItem to="/chat" icon={MessageCircle} label="Chat" active={location.pathname === '/chat'} />
        <NavItem to="/reminders" icon={Calendar} label="Dates" active={location.pathname === '/reminders'} />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50/50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} CareerPath.AI. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};