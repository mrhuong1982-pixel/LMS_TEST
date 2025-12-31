
import React, { useState } from 'react';
// Fix: Use any cast to bypass missing member errors in some environments
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate, useLocation, Link } = ReactRouterDOM as any;
import { 
  Users, 
  HelpCircle, 
  BookOpen, 
  Trophy, 
  Users2, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  LayoutDashboard,
  Settings
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const adminMenu = [
    { name: t('users'), path: '/admin/users', icon: <Users size={20} /> },
    { name: t('questions'), path: '/admin/questions', icon: <HelpCircle size={20} /> },
    { name: t('lessons'), path: '/admin/lessons', icon: <BookOpen size={20} /> },
    { name: t('students'), path: '/app/students', icon: <Users2 size={20} /> },
    { name: t('leaderboard'), path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: t('settings'), path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const studentMenu = [
    { name: t('dashboard'), path: '/app', icon: <LayoutDashboard size={20} /> },
    { name: t('students'), path: '/app/students', icon: <Users2 size={20} /> },
    { name: t('leaderboard'), path: '/leaderboard', icon: <Trophy size={20} /> },
  ];

  const currentMenu = role === 'admin' ? adminMenu : studentMenu;

  return (
    <div className="min-h-screen flex text-gray-800">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <span className={`font-bold text-xl text-indigo-600 ${!isSidebarOpen && 'hidden'}`}>ZenLMS</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-100 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1">
          {currentMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 rounded-xl transition-colors ${
                location.pathname === item.path 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className={`ml-3 font-medium transition-opacity ${!isSidebarOpen && 'opacity-0 w-0 whitespace-nowrap'}`}>{item.name}</span>
              {location.pathname === item.path && isSidebarOpen && <ChevronRight size={16} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className={`ml-3 font-medium ${!isSidebarOpen && 'hidden'}`}>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-700 capitalize">
            {location.pathname.split('/').pop()?.replace('-', ' ') || t('dashboard')}
          </h2>
          
          <div className="flex items-center space-x-6">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setLanguage('vi')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'vi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                VI
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                EN
              </button>
            </div>

            <div className="flex items-center space-x-4 border-l pl-6 border-gray-100">
              <div className="text-right">
                <p className="text-sm font-semibold">{user?.fullName}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role === 'admin' ? t('admin') : t('student')}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
