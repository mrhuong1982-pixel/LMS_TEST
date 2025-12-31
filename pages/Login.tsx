
import React, { useState } from 'react';
// Fix: Use any cast to bypass missing member errors in some environments
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM as any;
import { api } from '../services/api';
import { LogIn, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Login: React.FC = () => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.auth.login(username, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      if (response.user.role === 'admin') {
        navigate('/admin/users');
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('loginTitle')}</h1>
          <p className="text-gray-500 mt-2">{t('loginSubtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('username')}</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder={t('username')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder={t('password')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>{t('signIn')}</span>}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Admin: admin / admin</p>
          <p>Student: hs01 / 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;