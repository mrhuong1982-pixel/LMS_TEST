
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CloudSettings } from '../../types';
import { Cloud, Save, RefreshCw, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminSettings: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<CloudSettings>({ sheetUrl: '', isEnabled: false });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    setSettings(api.settings.get());
  }, []);

  const handleSave = () => {
    api.settings.save(settings);
    setStatus({ type: 'success', msg: t('save') + ' thành công!' });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSync = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await api.settings.sync();
      setStatus({ type: 'success', msg: t('syncSuccess') });
    } catch (e) {
      setStatus({ type: 'error', msg: t('syncError') });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!confirm("Hành động này sẽ ghi đè toàn bộ dữ liệu hiện tại bằng dữ liệu từ Cloud. Tiếp tục?")) return;
    setLoading(true);
    try {
      await api.settings.import();
      setStatus({ type: 'success', msg: 'Nhập dữ liệu từ Cloud thành công!' });
    } catch (e) {
      setStatus({ type: 'error', msg: 'Không thể nhập dữ liệu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
          <Cloud size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">{t('cloudSync')}</h1>
          <p className="text-gray-500">Lưu trữ và quản trị dữ liệu LMS thông qua Google Sheets.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start space-x-4">
            <Info className="text-blue-500 shrink-0" size={24} />
            <div className="text-sm text-blue-700 leading-relaxed">
              <p className="font-bold mb-1">Hướng dẫn nhanh:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Mở Google Sheet của bạn.</li>
                <li>Vào Tiện ích mở rộng -> Apps Script.</li>
                <li>Dán mã Script xử lý JSON (được cung cấp bên dưới).</li>
                <li>Triển khai dưới dạng Ứng dụng web và sao chép URL vào đây.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{t('sheetUrlLabel')}</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all font-medium"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={settings.sheetUrl}
                onChange={e => setSettings({...settings, sheetUrl: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <input 
                type="checkbox" 
                id="enableCloud"
                className="w-5 h-5 accent-indigo-600"
                checked={settings.isEnabled}
                onChange={e => setSettings({...settings, isEnabled: e.target.checked})}
              />
              <label htmlFor="enableCloud" className="text-sm font-bold text-gray-700 cursor-pointer">Bật chế độ tự động đồng bộ (Tương lai)</label>
            </div>
          </div>

          {status && (
            <div className={`p-4 rounded-2xl flex items-center space-x-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold">{status.msg}</span>
            </div>
          )}

          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleSave}
              className="bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-all"
            >
              <Save size={20} />
              <span>{t('save')} Cấu hình</span>
            </button>
            <button 
              onClick={handleSync}
              disabled={loading || !settings.sheetUrl}
              className="bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 disabled:opacity-30 transition-all"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              <span>{t('syncNow')} (Gửi)</span>
            </button>
            <button 
              onClick={handleImport}
              disabled={loading || !settings.sheetUrl}
              className="bg-white text-indigo-600 border-2 border-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-50 disabled:opacity-30 transition-all md:col-span-2"
            >
              <Cloud size={20} />
              <span>Nhập dữ liệu từ Cloud (Tải về)</span>
            </button>
          </div>

          {settings.lastSynced && (
            <p className="text-center text-xs text-gray-400 font-medium">Lần đồng bộ cuối: {new Date(settings.lastSynced).toLocaleString()}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <CheckCircle className="text-indigo-400 mr-2" />
          Mã Google Apps Script (Sử dụng cho Sheet)
        </h3>
        <pre className="text-[10px] bg-black/50 p-6 rounded-2xl overflow-x-auto text-indigo-300 font-mono">
{`function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Database') || ss.insertSheet('Database');
  sheet.clear();
  sheet.getRange(1, 1).setValue(JSON.stringify(data));
  return ContentService.createTextOutput("Success");
}

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Database');
  var data = sheet.getRange(1, 1).getValue();
  return ContentService.createTextOutput(data)
    .setMimeType(ContentService.MimeType.JSON);
}`}
        </pre>
      </div>
    </div>
  );
};

export default AdminSettings;
