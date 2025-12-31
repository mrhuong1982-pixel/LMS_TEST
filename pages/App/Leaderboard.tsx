
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';
import { Trophy, Medal, Crown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Leaderboard: React.FC = () => {
  const { t } = useLanguage();
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await api.leaderboard.getTop(5);
      setTopUsers(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t('vinhDanhTitle')}</h1>
        <p className="mt-4 text-gray-500">{t('vinhDanhSubtitle')}</p>
      </div>

      {loading ? <p className="text-center">Loading...</p> : (
        <div className="space-y-10">
          {/* Top 3 Visuals */}
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 px-4">
            {/* Rank 2 */}
            {topUsers[1] && (
              <div className="flex flex-col items-center group w-32 md:w-48">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full border-4 border-gray-300 flex items-center justify-center overflow-hidden">
                    <span className="text-2xl font-bold">{topUsers[1].fullName.charAt(0)}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white">2</div>
                </div>
                <div className="h-32 w-full bg-white border border-gray-200 rounded-t-2xl shadow-sm flex flex-col items-center justify-center p-2 text-center">
                  <span className="font-bold text-sm truncate w-full">{topUsers[1].fullName}</span>
                  <span className="text-indigo-600 font-extrabold text-xl">{topUsers[1].totalScore || 0}</span>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {topUsers[0] && (
              <div className="flex flex-col items-center group w-40 md:w-56 -mb-2">
                <Crown className="text-yellow-400 mb-2 drop-shadow-md animate-bounce" size={48} />
                <div className="relative mb-4 scale-110">
                  <div className="w-24 h-24 bg-yellow-50 rounded-full border-4 border-yellow-400 flex items-center justify-center overflow-hidden">
                    <span className="text-3xl font-bold text-yellow-700">{topUsers[0].fullName.charAt(0)}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 border-white">1</div>
                </div>
                <div className="h-44 w-full bg-indigo-600 rounded-t-2xl shadow-xl flex flex-col items-center justify-center p-2 text-center">
                  <span className="font-bold text-white text-lg truncate w-full">{topUsers[0].fullName}</span>
                  <span className="text-yellow-300 font-extrabold text-3xl">{topUsers[0].totalScore || 0}</span>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {topUsers[2] && (
              <div className="flex flex-col items-center group w-32 md:w-48">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-orange-50 rounded-full border-4 border-orange-300 flex items-center justify-center overflow-hidden">
                    <span className="text-2xl font-bold text-orange-800">{topUsers[2].fullName.charAt(0)}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white">3</div>
                </div>
                <div className="h-24 w-full bg-white border border-gray-200 rounded-t-2xl shadow-sm flex flex-col items-center justify-center p-2 text-center">
                  <span className="font-bold text-sm truncate w-full">{topUsers[2].fullName}</span>
                  <span className="text-indigo-600 font-extrabold text-xl">{topUsers[2].totalScore || 0}</span>
                </div>
              </div>
            )}
          </div>

          {/* List for 4 and 5 */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {topUsers.slice(3).map((user, i) => (
              <div key={user.id} className="flex items-center p-6 border-b last:border-0 hover:bg-gray-50 transition-colors">
                <span className="text-xl font-bold text-gray-400 w-12">{i + 4}</span>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 font-bold text-gray-500">
                  {user.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">{user.totalScore || 0}</span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{t('points')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
