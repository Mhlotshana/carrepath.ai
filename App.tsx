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

const App: React.FC = () => {
  return (
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
          </Routes>
        </Layout>
      </HashRouter>
    </UserProvider>
  );
};

export default App;