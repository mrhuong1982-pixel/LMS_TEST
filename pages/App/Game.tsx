
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Question } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Trophy, Timer, CheckCircle2, XCircle, ArrowRight, RefreshCcw, Star } from 'lucide-react';

const Game: React.FC = () => {
  const { t } = useLanguage();
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'feedback' | 'finished'>('start');
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean, msg: string, points: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const timerRef = useRef<any>(null);

  const startLevel = async () => {
    const qs = await api.questions.getRandom(5);
    setQuestions(qs);
    setCurrentIdx(0);
    setScore(0);
    setGameState('playing');
    resetTimer();
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(null); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (ans: any) => {
    if (gameState !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    const q = questions[currentIdx];
    let isCorrect = false;

    if (q.type === 'mcq') {
      isCorrect = ans === q.correctIndex;
    } else if (q.type === 'short_answer') {
      isCorrect = ans?.toString().toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim();
    } else if (q.type === 'drag_drop') {
      isCorrect = JSON.stringify(ans) === JSON.stringify(q.correctOrder);
    }

    if (isCorrect) {
      setScore(s => s + 2);
      setAnswerResult({ isCorrect: true, msg: t('gameCorrect'), points: 2 });
    } else {
      setAnswerResult({ isCorrect: false, msg: ans === null ? t('gameTimeout') : t('gameWrong'), points: 0 });
    }

    setGameState('feedback');
  };

  const nextQuestion = async () => {
    if (currentIdx < 4) {
      setCurrentIdx(currentIdx + 1);
      setUserAnswer('');
      setAnswerResult(null);
      setGameState('playing');
      resetTimer();
    } else {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        await api.users.updateScore(user.id, score);
        // Cập nhật lại UI header bằng cách update user local
        user.totalScore = (user.totalScore || 0) + score;
        localStorage.setItem('user', JSON.stringify(user));
      }
      setGameState('finished');
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (gameState === 'start') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <Trophy size={48} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t('playGame')}</h1>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">Khám phá vẻ đẹp Việt Nam qua 5 cấp độ thử thách. Mỗi câu trả lời đúng giúp bạn tiến gần hơn đến đỉnh bảng xếp hạng!</p>
        <button onClick={startLevel} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
          {t('startGame')}
        </button>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl shadow-2xl p-10 text-center animate-in slide-in-from-bottom duration-500">
        <Star size={80} className="mb-6 text-yellow-300 fill-yellow-300 animate-pulse" />
        <h1 className="text-5xl font-black mb-4">{t('gameFinished')}</h1>
        <p className="text-indigo-100 text-2xl mb-10">Tổng điểm tích lũy: <span className="text-yellow-300 font-black text-4xl">+{score}</span></p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => setGameState('start')} className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2 shadow-lg">
            <RefreshCcw size={20} /> <span>{t('gameRetry')}</span>
          </button>
          {level < 5 && (
            <button onClick={() => { setLevel(level + 1); startLevel(); }} className="bg-yellow-400 text-indigo-900 px-10 py-4 rounded-2xl font-bold hover:bg-yellow-300 transition-all flex items-center justify-center space-x-2 shadow-lg">
              <span>{t('gameNext')}</span> <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8 gap-4">
        <div className="flex-1 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">{level}</div>
          <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">{t('gameLevel')}</span>
        </div>
        
        <div className={`flex-1 px-6 py-3 rounded-2xl shadow-sm flex items-center justify-center space-x-3 border-2 transition-all ${timeLeft < 10 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-transparent text-gray-700'}`}>
          <Timer size={20} className={timeLeft < 10 ? 'animate-pulse' : ''} />
          <span className="font-black text-2xl tabular-nums">{timeLeft}s</span>
        </div>

        <div className="flex-1 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-end space-x-3">
          <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">{t('score')}</span>
          <span className="font-black text-2xl text-indigo-600">+{score}</span>
        </div>
      </div>

      <div className="w-full bg-gray-200 h-3 rounded-full mb-8 overflow-hidden shadow-inner">
        <div className="bg-indigo-600 h-full transition-all duration-700 ease-out" style={{ width: `${(currentIdx + 1) * 20}%` }}></div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative min-h-[400px]">
        <div className="p-12">
          <div className="flex items-center space-x-2 mb-6">
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Câu {currentIdx + 1} / 5</span>
            <span className="text-gray-300">|</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{q.type.replace('_', ' ')}</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-10 leading-snug">{q.questionText}</h2>

          {q.type === 'mcq' && (
            <div className="grid grid-cols-1 gap-4">
              {q.options?.map((opt, i) => (
                <button
                  key={i}
                  disabled={gameState === 'feedback'}
                  onClick={() => { setUserAnswer(i.toString()); handleAnswer(i); }}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all font-semibold flex justify-between items-center group
                    ${gameState === 'feedback' && i === q.correctIndex ? 'border-green-500 bg-green-50 text-green-700' : 
                      gameState === 'feedback' && Number(userAnswer) === i && i !== q.correctIndex ? 'border-red-500 bg-red-50 text-red-700' :
                      'border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg'}`}
                >
                  <span className="flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-4 text-xs group-hover:bg-indigo-100 transition-colors">{String.fromCharCode(65+i)}</span>
                    {opt}
                  </span>
                  {gameState === 'feedback' && i === q.correctIndex && <CheckCircle2 size={24} className="text-green-500" />}
                </button>
              ))}
            </div>
          )}

          {q.type === 'short_answer' && (
            <div className="space-y-6">
              <input
                type="text"
                autoFocus
                disabled={gameState === 'feedback'}
                className="w-full p-6 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 outline-none font-bold text-xl shadow-inner transition-all"
                placeholder="Câu trả lời của bạn..."
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && userAnswer.trim() && handleAnswer(userAnswer)}
              />
              <button
                disabled={gameState === 'feedback' || !userAnswer.trim()}
                onClick={() => handleAnswer(userAnswer)}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 disabled:opacity-30 shadow-xl shadow-indigo-100 transition-all"
              >
                {t('check')}
              </button>
            </div>
          )}

          {q.type === 'drag_drop' && (
            <div className="space-y-6">
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-2">
                 {q.options?.map((opt, i) => <div key={i} className="flex items-center text-sm font-bold text-gray-600"><span className="w-6 h-6 bg-white border rounded mr-3 flex items-center justify-center">{i}</span> {opt}</div>)}
               </div>
               <input
                type="text"
                disabled={gameState === 'feedback'}
                className="w-full p-6 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 outline-none font-bold text-xl text-center tracking-widest"
                placeholder="Ví dụ: 0, 1, 2, 3"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
              />
              <button
                disabled={gameState === 'feedback' || !userAnswer.trim()}
                onClick={() => handleAnswer(userAnswer.split(',').map(n => parseInt(n.trim())))}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-30 shadow-xl transition-all"
              >
                {t('check')}
              </button>
            </div>
          )}
        </div>

        {gameState === 'feedback' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-12 animate-in fade-in zoom-in duration-300 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${answerResult?.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {answerResult?.isCorrect ? <CheckCircle2 size={64} /> : <XCircle size={64} />}
            </div>
            <h3 className={`text-4xl font-black mb-4 ${answerResult?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {answerResult?.msg}
            </h3>
            {answerResult?.isCorrect && <p className="text-green-500 font-bold mb-8 animate-bounce">+{answerResult.points} {t('points')}</p>}
            {!answerResult?.isCorrect && (
              <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Đáp án đúng là:</p>
                <p className="text-indigo-600 font-black text-xl">
                  {q.type === 'mcq' ? q.options?.[q.correctIndex!] : q.type === 'short_answer' ? q.correctAnswer : q.correctOrder?.join(', ')}
                </p>
              </div>
            )}
            <button
              onClick={nextQuestion}
              className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-xl flex items-center space-x-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:scale-105"
            >
              <span>{currentIdx < 4 ? t('gameNext') : t('submit')}</span> 
              <ArrowRight size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
