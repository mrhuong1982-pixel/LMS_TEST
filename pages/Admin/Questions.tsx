
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../services/api';
import { Question } from '../../types';
import { Plus, Edit2, Trash2, X, CloudDownload, RefreshCw, FileJson, Upload } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminQuestions: React.FC = () => {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: 'mcq' as any,
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    correctAnswer: '',
    correctOrder: [0, 1, 2, 3],
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    tags: ''
  });

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.questions.getAll();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to load questions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloudImport = async () => {
    setLoading(true);
    const success = await api.settings.import();
    if (success) {
      await loadQuestions();
      alert(t('importSuccess'));
    } else {
      alert("Không tìm thấy dữ liệu trên Cloud.");
    }
    setLoading(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setLoading(true);
          await api.questions.bulkCreate(json); // Hàm này giờ sẽ map cấu trúc JSON đặc biệt
          await loadQuestions();
          alert(`${t('importSuccess')} (${json.length} câu hỏi)`);
        } else {
          alert(t('importError'));
        }
      } catch (err) {
        alert(t('importError'));
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  useEffect(() => { loadQuestions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    if (editingQ) await api.questions.update(editingQ.id, payload);
    else await api.questions.create(payload);
    
    setIsModalOpen(false);
    setEditingQ(null);
    setFormData({ type: 'mcq', questionText: '', options: ['', '', '', ''], correctIndex: 0, correctAnswer: '', correctOrder: [0, 1, 2, 3], difficulty: 'easy', tags: '' });
    loadQuestions();
  };

  const handleEdit = (q: Question) => {
    setEditingQ(q);
    setFormData({
      type: q.type,
      questionText: q.questionText,
      options: q.options || ['', '', '', ''],
      correctIndex: q.correctIndex || 0,
      correctAnswer: q.correctAnswer || '',
      correctOrder: q.correctOrder || [0, 1, 2, 3],
      difficulty: q.difficulty,
      tags: q.tags.join(', ')
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xóa câu hỏi này?')) {
      const success = await api.questions.delete(id);
      if (success) {
        // Cập nhật state local ngay lập tức
        setQuestions(prev => prev.filter(q => String(q.id) !== String(id)));
      } else {
        alert("Lỗi: Không tìm thấy câu hỏi để xóa.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{t('questions')}</h1>
          <p className="text-gray-500">Quản lý ngân hàng câu hỏi (Tự động đồng bộ Sheet).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileImport}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-50 transition-all shadow-sm"
          >
            <FileJson size={18} />
            <span>{t('importJson')}</span>
          </button>

          <button 
            onClick={handleCloudImport} 
            className="bg-white text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-emerald-50 transition-all shadow-sm"
          >
            <CloudDownload size={18} />
            <span>Tải từ Cloud</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            <Plus size={18} /> 
            <span>{t('newQuestion')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && questions.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <RefreshCw className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-gray-400 font-medium">Đang tải...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] py-20 text-center flex flex-col items-center">
            <Upload className="text-gray-300 mb-4" size={48} />
            <p className="text-gray-400">Ngân hàng câu hỏi trống. Hãy nhập JSON hoặc thêm mới.</p>
          </div>
        ) : (
          questions.map(q => (
            <div key={q.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{q.type}</span>
                    <span className="text-[10px] font-bold text-gray-300">ID: {q.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">{q.questionText}</h2>
                  
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`p-4 rounded-2xl text-sm border-2 transition-all ${q.type === 'mcq' && i === q.correctIndex ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'border-gray-50 text-gray-500 bg-gray-50/50'}`}>
                          <span className="inline-block w-6 h-6 rounded-lg bg-white border border-gray-200 text-center mr-3 font-black text-[10px]">{String.fromCharCode(65 + i)}</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl text-sm text-indigo-700 font-bold flex items-center">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center mr-4 text-indigo-600">✓</div>
                      Đáp án chính xác: {q.correctAnswer}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    {q.tags.map(tag => <span key={tag} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white border border-gray-100 px-3 py-1 rounded-full">#{tag}</span>)}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(q)} className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"><Edit2 size={20} /></button>
                  <button onClick={() => handleDelete(q.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl text-gray-900">{editingQ ? 'Cập nhật câu hỏi' : t('newQuestion')}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Chi tiết câu hỏi</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Loại câu hỏi</label>
                  <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold transition-all" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="mcq">Trắc nghiệm (MCQ)</option>
                    <option value="short_answer">Trả lời ngắn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Độ khó</label>
                  <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold transition-all" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})}>
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nội dung câu hỏi</label>
                <textarea required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-medium h-28 transition-all" value={formData.questionText} onChange={e => setFormData({...formData, questionText: e.target.value})} placeholder="Nhập nội dung câu hỏi..." />
              </div>

              {formData.type === 'mcq' && (
                <div className="space-y-4">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Các phương án trả lời</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.options.map((opt, i) => (
                      <div key={i} className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300 text-sm">{String.fromCharCode(65+i)}</span>
                        <input required className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-medium transition-all" value={opt} onChange={e => {
                          const newOpts = [...formData.options];
                          newOpts[i] = e.target.value;
                          setFormData({...formData, options: newOpts});
                        }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Đáp án đúng</label>
                    <div className="flex gap-2">
                      {formData.options.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({...formData, correctIndex: i})}
                          className={`flex-1 py-3 rounded-xl font-black transition-all border-2 ${formData.correctIndex === i ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}
                        >
                          {String.fromCharCode(65+i)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'short_answer' && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Đáp án chính xác</label>
                  <input required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold transition-all" value={formData.correctAnswer} onChange={e => setFormData({...formData, correctAnswer: e.target.value})} placeholder="Nhập đáp án đúng..." />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tags (cách nhau bằng dấu phẩy)</label>
                <input className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-medium transition-all" placeholder="địa lý, lịch sử, văn hóa..." value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </div>

              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs">{t('cancel')}</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest text-xs">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
