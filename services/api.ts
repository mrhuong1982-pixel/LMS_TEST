
import { User, Question, Lesson, Role, CloudSettings } from '../types';

const DB_KEY = 'lms_db_v1';
const SETTINGS_KEY = 'lms_settings_v1';

const getSettings = (): CloudSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : { 
    sheetUrl: 'https://script.google.com/macros/s/AKfycbwSPNwoXb5NHH1qDGNh_sOpVv1FRMib9A11D8-Q3gXu1sR9REApcJ3h_tB6MCX9UeSe/exec', 
    isEnabled: true 
  };
};

const SEED_QUESTIONS: Question[] = [
  {
    id: 'VN-GEO-001',
    type: 'mcq',
    questionText: 'Đỉnh núi cao nhất Việt Nam là đỉnh nào?',
    options: ['Bạch Mã', 'Fansipan', 'Ngọc Linh', 'Langbiang'],
    correctIndex: 1,
    difficulty: 'easy',
    tags: ['Thiên nhiên'],
    createdAt: new Date().toISOString()
  }
];

const getDB = () => {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Đảm bảo không ghi đè dữ liệu rỗng của người dùng
      if (!parsed.users) parsed.users = [{ id: 'u_admin', username: 'admin', fullName: 'Quản trị viên', role: 'admin', createdAt: new Date().toISOString(), password: 'admin', totalScore: 0 }];
      if (parsed.questions === undefined) parsed.questions = SEED_QUESTIONS;
      if (!parsed.lessons) parsed.lessons = [];
      return parsed;
    }
  } catch (e) { console.error("Error reading DB", e); }
  
  const initialData = {
    users: [{ id: 'u_admin', username: 'admin', fullName: 'Quản trị viên', role: 'admin', createdAt: new Date().toISOString(), password: 'admin', totalScore: 0 }],
    questions: SEED_QUESTIONS,
    lessons: []
  };
  localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  return initialData;
};

const triggerAutoSync = async () => {
  const settings = getSettings();
  if (!settings.isEnabled || !settings.sheetUrl) return;
  const db = getDB();
  try {
    await fetch(settings.sheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(db)
    });
    console.log("Cloud synced after change");
  } catch (e) { console.warn("Cloud sync failed", e); }
};

const saveDB = (data: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  triggerAutoSync();
};

export const api = {
  settings: {
    get: getSettings,
    save: (settings: CloudSettings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)),
    sync: async () => {
      const settings = getSettings();
      if (!settings.sheetUrl) throw new Error("No URL");
      const db = getDB();
      await fetch(settings.sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(db)
      });
      settings.lastSynced = new Date().toISOString();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    },
    import: async () => {
      const settings = getSettings();
      if (!settings.sheetUrl) return false;
      try {
        const response = await fetch(settings.sheetUrl);
        const remoteData = await response.json();
        if (remoteData && (remoteData.users || remoteData.questions)) {
          localStorage.setItem(DB_KEY, JSON.stringify(remoteData));
          return true;
        }
      } catch (e) { console.error("Cloud Import failed", e); }
      return false;
    }
  },
  auth: {
    login: async (username: string, password: string) => {
      const db = getDB();
      const user = db.users.find((u: any) => u.username === username && u.password === password);
      if (user) return { user, token: 'session-' + user.id };
      throw new Error('Sai tài khoản hoặc mật khẩu');
    }
  },
  users: {
    getAll: async (params?: { role?: Role, search?: string }) => {
      let users = getDB().users || [];
      if (params?.role) users = users.filter((u: any) => u.role === params.role);
      if (params?.search) {
        const s = params.search.toLowerCase();
        users = users.filter((u: any) => u.fullName.toLowerCase().includes(s) || u.username.toLowerCase().includes(s));
      }
      return users;
    },
    create: async (data: any) => {
      const db = getDB();
      const newUser = { ...data, id: 'u_' + Date.now(), createdAt: new Date().toISOString(), totalScore: 0 };
      db.users.push(newUser);
      saveDB(db);
      return newUser;
    },
    update: async (id: string, data: any) => {
      const db = getDB();
      const idx = db.users.findIndex((u: any) => String(u.id) === String(id));
      if (idx !== -1) {
        db.users[idx] = { ...db.users[idx], ...data };
        saveDB(db);
      }
    },
    updateScore: async (userId: string, points: number) => {
      const db = getDB();
      const idx = db.users.findIndex((u: any) => String(u.id) === String(userId));
      if (idx !== -1) {
        db.users[idx].totalScore = (db.users[idx].totalScore || 0) + points;
        saveDB(db);
      }
    },
    delete: async (id: string) => {
      const db = getDB();
      db.users = db.users.filter((u: any) => String(u.id) !== String(id));
      saveDB(db);
    }
  },
  questions: {
    getAll: async () => getDB().questions || [],
    getRandom: async (count: number) => {
      const qs = getDB().questions || [];
      return [...qs].sort(() => 0.5 - Math.random()).slice(0, Math.min(count, qs.length));
    },
    create: async (data: any) => {
      const db = getDB();
      const newQ = { ...data, id: 'q_' + Date.now(), createdAt: new Date().toISOString() };
      db.questions.push(newQ);
      saveDB(db);
    },
    bulkCreate: async (questions: any[]) => {
      const db = getDB();
      // Ánh xạ cấu trúc JSON đặc biệt của người dùng
      const mapped = questions.map(q => ({
        id: q.id || 'q_' + Math.random().toString(36).substr(2, 9),
        type: q.type === 'multiple_choice' ? 'mcq' : q.type,
        questionText: q.question || q.questionText,
        options: q.options || [],
        correctIndex: q.type === 'multiple_choice' ? q.answer : q.correctIndex,
        correctAnswer: q.type === 'short_answer' ? q.answer : q.correctAnswer,
        difficulty: q.difficulty || 'medium',
        tags: q.group ? [q.group] : (q.tags || []),
        createdAt: q.createdAt || new Date().toISOString()
      }));
      db.questions = mapped; // Ghi đè toàn bộ bằng dữ liệu mới từ file
      saveDB(db);
    },
    update: async (id: string, data: any) => {
      const db = getDB();
      const idx = db.questions.findIndex((q: any) => String(q.id) === String(id));
      if (idx !== -1) {
        db.questions[idx] = { ...db.questions[idx], ...data };
        saveDB(db);
      }
    },
    delete: async (id: string) => {
      const db = getDB();
      const initialCount = db.questions.length;
      db.questions = db.questions.filter((q: any) => String(q.id) !== String(id));
      if (db.questions.length !== initialCount) {
        saveDB(db);
        return true;
      }
      return false;
    }
  },
  lessons: {
    getAll: async () => getDB().lessons || [],
    create: async (data: any) => {
      const db = getDB();
      const newL = { ...data, id: 'l_' + Date.now(), createdAt: new Date().toISOString() };
      db.lessons.push(newL);
      saveDB(db);
    },
    update: async (id: string, data: any) => {
      const db = getDB();
      const idx = db.lessons.findIndex((l: any) => String(l.id) === String(id));
      if (idx !== -1) {
        db.lessons[idx] = { ...db.lessons[idx], ...data };
        saveDB(db);
      }
    },
    delete: async (id: string) => {
      const db = getDB();
      db.lessons = db.lessons.filter((l: any) => String(l.id) !== String(id));
      saveDB(db);
    }
  },
  leaderboard: {
    getTop: async (limit: number = 5) => {
      const users = getDB().users || [];
      return users
        .filter((u: any) => u.role === 'student')
        .sort((a: any, b: any) => (b.totalScore || 0) - (a.totalScore || 0))
        .slice(0, limit);
    }
  }
};
