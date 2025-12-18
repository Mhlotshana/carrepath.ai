import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import UploadPage from './pages/Upload';
import ResultsPage from './pages/Results';
import PaymentPage from './pages/Payment';
import ChatPage from './pages/Chat';
import ResourcesPage from './pages/Resources';
import RemindersPage from './pages/Reminders';
import TermsPage from './pages/Terms';
import PrivacyPage from './pages/Privacy';
import ContactPage from './pages/Contact';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </Layout>
        </HashRouter>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;