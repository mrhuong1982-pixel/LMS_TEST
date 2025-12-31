
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Lesson } from '../../types';
import { Play, Clock, BookOpen, Trophy } from 'lucide-react';
// Fix: Use any cast to bypass missing member errors in some environments
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM as any;
import { useLanguage } from '../../context/LanguageContext';

const StudentLessons: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await api.lessons.getAll();
      setLessons(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-500 mt-2">Bắt đầu hành trình chinh phục kiến thức ngay hôm nay.</p>
        </div>
      </div>

      {/* Featured Game Entry */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-indigo-200 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all"></div>
        <div className="z-10 mb-6 md:mb-0 text-center md:text-left">
          <h2 className="text-3xl font-black mb-2 flex items-center justify-center md:justify-start">
            <Trophy className="mr-3 text-yellow-300" size={32} />
            {t('playGame')}
          </h2>
          <p className="text-indigo-100 max-w-sm">Thử thách trí tuệ với các câu hỏi địa lý Việt Nam cực kỳ hấp dẫn!</p>
        </div>
        <button 
          onClick={() => navigate('/app/game')}
          className="z-10 bg-yellow-400 text-indigo-900 font-black px-10 py-4 rounded-2xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg active:scale-95"
        >
          {t('startGame')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">Đang tải bài học...</div>
        ) : lessons.map(lesson => (
          <div key={lesson.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all group cursor-pointer">
            <div className="aspect-video bg-indigo-100 flex items-center justify-center p-8 relative overflow-hidden">
               <BookOpen size={48} className="text-indigo-600/50" />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-lg">
                    <Play size={24} className="text-indigo-600 ml-1" />
                 </div>
               </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full">Grade {lesson.grade}</span>
                <div className="flex items-center text-gray-400 text-xs">
                   <Clock size={14} className="mr-1" />
                   <span>15 mins</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{lesson.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{lesson.description}</p>
              
              <div className="mt-8 flex flex-wrap gap-2">
                {lesson.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentLessons;