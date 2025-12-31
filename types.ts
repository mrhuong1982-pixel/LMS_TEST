
export type Role = 'admin' | 'student';
export type QuestionType = 'mcq' | 'short_answer' | 'drag_drop';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  createdAt: string;
  password?: string;
  totalScore?: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  correctOrder?: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  contentHtml: string;
  grade: string;
  tags: string[];
  createdAt: string;
}

export interface CloudSettings {
  sheetUrl: string;
  isEnabled: boolean;
  lastSynced?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
