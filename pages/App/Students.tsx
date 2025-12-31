
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';
import { Search, UserRound } from 'lucide-react';

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await api.users.getAll({ role: 'student', search });
      setStudents(data);
      setLoading(false);
    };
    fetch();
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Danh Sách Học Sinh</h1>
          <p className="text-gray-500">Tìm kiếm và kết nối với các bạn học khác.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">Đang tải danh sách...</div>
        ) : students.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">Không tìm thấy học sinh nào</div>
        ) : (
          students.map(student => (
            <div key={student.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <UserRound size={40} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{student.fullName}</h3>
              <p className="text-sm text-gray-400 mb-4">@{student.username}</p>
              
              <div className="w-full pt-4 border-t border-gray-50 mt-auto">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                  <span>Score</span>
                  <span className="text-indigo-600 text-lg">{student.totalScore || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentList;
