import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Upload, CreditCard, MessageCircle, BookOpen, Calendar, Menu, X, Home } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to} className={`flex flex-col items-center justify-center p-2 text-xs md:text-sm md:flex-row md:space-x-2 ${active ? 'text-primary-600 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>
    <Icon className={`w-6 h-6 md:w-5 md:h-5 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
    <span className="mt-1 md:mt-0">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation (Desktop) */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <GraduationCap className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">CareerPath<span className="text-primary-600">.AI</span></span>
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
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/upload" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
              <Link to="/results" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Results</Link>
              <Link to="/chat" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>AI Advisor</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center z-50 safe-area-bottom">
        <NavItem to="/upload" icon={Upload} label="Check" active={location.pathname === '/upload'} />
        <NavItem to="/results" icon={BookOpen} label="Plan" active={location.pathname === '/results'} />
        <NavItem to="/chat" icon={MessageCircle} label="Chat" active={location.pathname === '/chat'} />
        <NavItem to="/reminders" icon={Calendar} label="Dates" active={location.pathname === '/reminders'} />
      </div>
    </div>
  );
};