
import React, { useEffect, useState } from 'react';
// Fix: Use any cast to bypass missing member errors in some environments
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter: Router, Routes, Route, Navigate } = ReactRouterDOM as any;
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminUsers from './pages/Admin/Users';
import AdminQuestions from './pages/Admin/Questions';
import AdminLessons from './pages/Admin/Lessons';
import AdminSettings from './pages/Admin/Settings';
import Leaderboard from './pages/App/Leaderboard';
import StudentList from './pages/App/Students';
import StudentLessons from './pages/App/StudentLessons';
import Game from './pages/App/Game';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { t } = useLanguage();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!token) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center p-12 bg-white rounded-[2.5rem] shadow-xl border border-red-100 max-w-md">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold">!</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('accessDenied')}</h2>
            <p className="text-gray-500 mb-8">{t('accessDeniedMsg')}</p>
            <button onClick={() => window.location.href='/#/app'} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Quay lại Trang chủ</button>
          </div>
        </div>
      </Layout>
    );
  }
  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/questions" element={<ProtectedRoute allowedRoles={['admin']}><AdminQuestions /></ProtectedRoute>} />
      <Route path="/admin/lessons" element={<ProtectedRoute allowedRoles={['admin']}><AdminLessons /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
      
      {/* Shared/Student Routes */}
      <Route path="/app" element={<ProtectedRoute><StudentLessons /></ProtectedRoute>} />
      <Route path="/app/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
      <Route path="/app/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <AppRoutes />
      </Router>
    </LanguageProvider>
  );
};

export default App;
