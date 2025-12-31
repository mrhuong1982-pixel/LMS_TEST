
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Lesson } from '../../types';
import { Plus, Edit2, Trash2, X, Search, FileText } from 'lucide-react';

const AdminLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingL, setEditingL] = useState<Lesson | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentHtml: '',
    grade: '',
    tags: ''
  });

  const loadLessons = async () => {
    setLoading(true);
    const data = await api.lessons.getAll();
    setLessons(data);
    setLoading(false);
  };

  useEffect(() => { loadLessons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    if (editingL) await api.lessons.update(editingL.id, payload);
    else await api.lessons.create(payload);
    setIsModalOpen(false);
    setEditingL(null);
    setFormData({ title: '', description: '', contentHtml: '', grade: '', tags: '' });
    loadLessons();
  };

  const handleEdit = (l: Lesson) => {
    setEditingL(l);
    setFormData({
      title: l.title,
      description: l.description,
      contentHtml: l.contentHtml,
      grade: l.grade,
      tags: l.tags.join(', ')
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lessons & Content</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold flex items-center space-x-2 hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> <span>New Lesson</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? <p>Loading lessons...</p> : lessons.map(l => (
          <div key={l.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:shadow-lg transition-all border-l-4 border-l-indigo-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{l.title}</h3>
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Grade {l.grade}</span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button onClick={() => handleEdit(l)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={18} /></button>
                <button onClick={async () => { if(confirm('Delete?')) { await api.lessons.delete(l.id); loadLessons(); } }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{l.description}</p>
            <div className="mt-auto flex flex-wrap gap-2">
              {l.tags.map(tag => <span key={tag} className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] rounded-md font-bold uppercase border border-gray-100">#{tag}</span>)}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center font-bold text-lg">
              {editingL ? 'Edit Lesson' : 'Create New Lesson'}
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input required className="w-full px-4 py-2 border rounded-lg" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description (short)</label>
                <input required className="w-full px-4 py-2 border rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Grade</label>
                <input required className="w-full px-4 py-2 border rounded-lg" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Content (Markdown / HTML)</label>
                <textarea required className="w-full px-4 py-2 border rounded-lg h-48" value={formData.contentHtml} onChange={e => setFormData({...formData, contentHtml: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Tags (comma separated)</label>
                <input className="w-full px-4 py-2 border rounded-lg" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Save Lesson</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessons;
