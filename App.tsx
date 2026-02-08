
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Delete, X, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, Team, GameSettings } from './types';
import { WIN_MESSAGES, LIMIT_OPTIONS } from './constants';

const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppState>(AppState.WELCOME);
  const [settings, setSettings] = useState<GameSettings>({
    team1Name: 'فريقنا',
    team2Name: 'فريقهم',
    limit: 101
  });
  const [team1, setTeam1] = useState<Team>({ name: '', scores: [], total: 0 });
  const [team2, setTeam2] = useState<Team>({ name: '', scores: [], total: 0 });
  const [activeKeypad, setActiveKeypad] = useState<1 | 2 | null>(null);
  const [keypadValue, setKeypadValue] = useState('');
  const [winner, setWinner] = useState<{ name: string; message: string; t1Final: number; t2Final: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (currentStep === AppState.GAME) {
      if (team1.total >= settings.limit && team1.total > team2.total) {
        handleWin(team1.name, team1.total, team2.total);
      } else if (team2.total >= settings.limit && team2.total > team1.total) {
        handleWin(team2.name, team1.total, team2.total);
      }
    }
  }, [team1.total, team2.total, currentStep, settings.limit]);

  const handleWin = (name: string, t1: number, t2: number) => {
    const randomMsg = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
    setWinner({ name, message: randomMsg, t1Final: t1, t2Final: t2 });
    setCurrentStep(AppState.WINNER);
    
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      confetti({ ...defaults, particleCount: 40, origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 250);
  };

  const startGame = () => {
    setTeam1({ name: settings.team1Name || 'فريق 1', scores: [], total: 0 });
    setTeam2({ name: settings.team2Name || 'فريق 2', scores: [], total: 0 });
    setCurrentStep(AppState.GAME);
    setToast("يلا شدو حيلكم 💪");
  };

  const onKeypadPress = (num: string) => {
    if (keypadValue.length < 3) setKeypadValue(prev => prev + num);
  };

  const onKeypadDelete = () => setKeypadValue(prev => prev.slice(0, -1));

  const onKeypadConfirm = () => {
    if (!keypadValue || !activeKeypad) {
      setActiveKeypad(null);
      setKeypadValue('');
      return;
    }
    const val = parseInt(keypadValue);
    if (activeKeypad === 1) {
      setTeam1(prev => ({ ...prev, scores: [...prev.scores, val], total: prev.total + val }));
    } else {
      setTeam2(prev => ({ ...prev, scores: [...prev.scores, val], total: prev.total + val }));
    }
    setKeypadValue('');
    setActiveKeypad(null);
  };

  const removeLast = (teamIdx: 1 | 2) => {
    if (teamIdx === 1 && team1.scores.length > 0) {
      const last = team1.scores[team1.scores.length - 1];
      setTeam1(prev => ({ ...prev, scores: prev.scores.slice(0, -1), total: prev.total - last }));
    } else if (teamIdx === 2 && team2.scores.length > 0) {
      const last = team2.scores[team2.scores.length - 1];
      setTeam2(prev => ({ ...prev, scores: prev.scores.slice(0, -1), total: prev.total - last }));
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white select-none transition-colors duration-500">
      
      <AnimatePresence>
        {toast && (
          <MotionDiv
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 60, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none"
          >
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full shadow-2xl font-black text-xl flex items-center gap-3 border border-white/10">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              {toast}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentStep === AppState.WELCOME && (
          <MotionDiv
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-full flex flex-col items-center justify-center p-10 text-center"
          >
            <MotionDiv 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-44 h-44 bg-blue-600 dark:bg-blue-500 rounded-[3.5rem] mb-10 flex items-center justify-center shadow-2xl"
            >
              <div className="grid grid-cols-2 gap-3 p-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="w-3 h-3 bg-white rounded-full"></div>)}
              </div>
            </MotionDiv>
            <h1 className="text-7xl font-black mb-4 tracking-tighter">دومينو</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xl mb-12 font-bold">الحاسبة الذكية للديوانية</p>
            <button
              onClick={() => setCurrentStep(AppState.SETUP)}
              className="bg-blue-600 text-white text-2xl font-black px-16 py-6 rounded-full shadow-xl active:scale-95 transition-all"
            >
              نبلش؟
            </button>
          </MotionDiv>
        )}

        {currentStep === AppState.SETUP && (
          <MotionDiv
            key="setup"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 p-8 pt-20"
          >
            <h2 className="text-5xl font-black mb-12 text-right">الإعدادات</h2>
            <div className="space-y-8 flex-1">
              <div className="space-y-3">
                <label className="block text-right pr-2 text-slate-500 font-bold">الفريق الأول</label>
                <input
                  type="text"
                  placeholder="مثلاً: فريقنا"
                  value={settings.team1Name}
                  onChange={e => setSettings({...settings, team1Name: e.target.value})}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 text-2xl font-bold text-right outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-right pr-2 text-slate-500 font-bold">الفريق الثاني</label>
                <input
                  type="text"
                  placeholder="مثلاً: فريقهم"
                  value={settings.team2Name}
                  onChange={e => setSettings({...settings, team2Name: e.target.value})}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 text-2xl font-bold text-right outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="pt-8 text-right">
                <label className="block mb-4 pr-2 text-slate-500 font-bold">من شقد تلعبون؟</label>
                <div className="flex gap-3">
                  {LIMIT_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSettings({...settings, limit: opt as any})}
                      className={`flex-1 py-6 rounded-3xl text-3xl font-black transition-all border-2 ${
                        settings.limit === opt 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={startGame}
              className="bg-blue-600 text-white text-3xl font-black py-8 rounded-[2.5rem] shadow-2xl mb-12 active:scale-95 transition-all"
            >
              يا الله
            </button>
          </MotionDiv>
        )}

        {currentStep === AppState.GAME && (
          <MotionDiv key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col relative bg-white dark:bg-slate-950">
            <div className="absolute top-0 left-0 w-full z-20 p-6 pt-14 flex justify-between items-center">
               <button onClick={() => setCurrentStep(AppState.SETUP)} className="glass p-3 rounded-2xl dark:text-white text-slate-800"><RotateCcw className="w-6 h-6"/></button>
               <div className="glass px-6 py-2 rounded-full font-black text-sm tracking-widest text-blue-600 dark:text-blue-400 bg-white/20">الهدف: {settings.limit}</div>
               <button onClick={() => { setTeam1(t=>({...t, scores:[], total:0})); setTeam2(t=>({...t, scores:[], total:0})); setToast("تم التصفير 🧼"); }} className="glass p-3 rounded-2xl text-rose-500"><X className="w-6 h-6"/></button>
            </div>

            <div className="flex-1 flex flex-col">
              {/* Team 1 Section */}
              <div 
                onClick={() => setActiveKeypad(1)}
                className="flex-1 relative overflow-hidden bg-blue-50/30 dark:bg-blue-900/10 flex flex-col items-center justify-center border-b border-slate-100 dark:border-white/5 active:bg-blue-100/50 dark:active:bg-blue-900/20 transition-all duration-300"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.07] font-black italic whitespace-nowrap fluid-bg-text pointer-events-none select-none">
                  {team1.name}
                </div>
                <MotionSpan key={team1.total} initial={{scale:0.8, opacity: 0}} animate={{scale:1, opacity: 1}} className="font-black leading-none drop-shadow-sm text-blue-600 dark:text-blue-400 fluid-score z-10">{team1.total}</MotionSpan>
                <span className="text-blue-800 dark:text-blue-200 font-black text-2xl uppercase tracking-widest z-10">{team1.name}</span>
                <div className="absolute bottom-6 left-6 flex gap-2 overflow-x-auto max-w-[60%] scrollbar-hide">
                    {team1.scores.slice(-4).map((s, i) => <span key={i} className="text-blue-600 dark:text-blue-300 text-sm font-black bg-white dark:bg-blue-800/40 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-700/50">+{s}</span>)}
                </div>
                {team1.scores.length > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); removeLast(1); }} className="absolute bottom-6 right-6 text-slate-300 dark:text-slate-600 hover:text-rose-500 p-2"><Delete className="w-6 h-6"/></button>
                )}
              </div>

              {/* Team 2 Section */}
              <div 
                onClick={() => setActiveKeypad(2)}
                className="flex-1 relative overflow-hidden bg-rose-50/30 dark:bg-rose-900/10 flex flex-col items-center justify-center active:bg-rose-100/50 dark:active:bg-rose-900/20 transition-all duration-300"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.07] font-black italic whitespace-nowrap fluid-bg-text pointer-events-none select-none text-rose-900 dark:text-rose-100">
                  {team2.name}
                </div>
                <MotionSpan key={team2.total} initial={{scale:0.8, opacity: 0}} animate={{scale:1, opacity: 1}} className="font-black leading-none drop-shadow-sm text-rose-600 dark:text-rose-400 fluid-score z-10">{team2.total}</MotionSpan>
                <span className="text-rose-800 dark:text-rose-200 font-black text-2xl uppercase tracking-widest z-10">{team2.name}</span>
                <div className="absolute bottom-6 left-6 flex gap-2 overflow-x-auto max-w-[60%] scrollbar-hide">
                    {team2.scores.slice(-4).map((s, i) => <span key={i} className="text-rose-600 dark:text-rose-300 text-sm font-black bg-white dark:bg-rose-800/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-700/50">+{s}</span>)}
                </div>
                {team2.scores.length > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); removeLast(2); }} className="absolute bottom-6 right-6 text-slate-300 dark:text-slate-600 hover:text-rose-500 p-2"><Delete className="w-6 h-6"/></button>
                )}
              </div>
            </div>

            <AnimatePresence>
                {activeKeypad && (
                    <MotionDiv 
                        initial={{ y: '100%' }} 
                        animate={{ y: 0 }} 
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex flex-col justify-end"
                    >
                        <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm" onClick={() => setActiveKeypad(null)}></div>
                        <div className="relative bg-white dark:bg-slate-900 rounded-t-[4rem] p-8 pb-14 shadow-2xl border-t border-slate-100 dark:border-white/10">
                            <div className="flex justify-between items-center mb-10 px-4">
                                <div className="flex flex-col">
                                    <span className={`text-xl font-bold ${activeKeypad === 1 ? 'text-blue-500' : 'text-rose-500'}`}>
                                        نقاط {activeKeypad === 1 ? team1.name : team2.name}
                                    </span>
                                    <span className="text-slate-400 text-sm">أدخل النتيجة المضافة</span>
                                </div>
                                <div className={`text-7xl font-black tabular-nums ${keypadValue ? 'text-slate-900 dark:text-white' : 'text-slate-200 dark:text-slate-700'}`}>
                                    {keypadValue || '0'}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'DEL'].map((k) => (
                                    <button
                                        key={k}
                                        onClick={() => {
                                            if (k === 'C') setKeypadValue('');
                                            else if (k === 'DEL') onKeypadDelete();
                                            else onKeypadPress(k.toString());
                                        }}
                                        className="h-[18vw] max-h-24 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[2rem] text-3xl font-black active:bg-blue-600 active:text-white dark:active:bg-blue-500 transition-all flex items-center justify-center border-2 border-transparent active:border-blue-400"
                                    >
                                        {k === 'DEL' ? <Delete className="w-8 h-8"/> : k}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                onClick={onKeypadConfirm}
                                className={`w-full py-7 rounded-[2.5rem] text-3xl font-black shadow-xl transition-all active:scale-95 ${
                                    activeKeypad === 1 
                                    ? 'bg-blue-600 text-white shadow-blue-500/30' 
                                    : 'bg-rose-600 text-white shadow-rose-500/30'
                                }`}
                            >
                                {keypadValue ? 'تأكيد' : 'إغلاق'}
                            </button>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
          </MotionDiv>
        )}

        {currentStep === AppState.WINNER && (
          <MotionDiv
            key="winner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-950 relative overflow-y-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
            
            <MotionDiv
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-48 h-48 bg-yellow-400 dark:bg-yellow-500 rounded-[4rem] mb-10 flex items-center justify-center shadow-2xl relative flex-shrink-0"
            >
                <Trophy className="w-28 h-28 text-white drop-shadow-lg" />
            </MotionDiv>
            
            <h2 className="text-2xl font-bold text-slate-400 dark:text-slate-500 mb-2">الفائز بطل اللعبة</h2>
            <h3 className="text-6xl font-black mb-4 text-slate-900 dark:text-white text-center leading-tight">{winner?.name}</h3>
            
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 text-center mb-10">{winner?.message}</p>

            {/* Score Summary Card */}
            <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 mb-12 border border-slate-100 dark:border-white/5 flex flex-col items-center gap-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 font-bold mb-2">
                    <TrendingUp className="w-5 h-5" />
                    النتيجة النهائية
                </div>
                <div className="flex justify-between w-full items-center px-4">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-blue-500 mb-1">{settings.team1Name}</span>
                        <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{winner?.t1Final}</span>
                    </div>
                    <div className="text-2xl font-black text-slate-300 dark:text-slate-700">VS</div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-rose-500 mb-1">{settings.team2Name}</span>
                        <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{winner?.t2Final}</span>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-4 max-w-sm px-4">
                <button
                    onClick={() => { setTeam1(t=>({...t, total:0, scores:[]})); setTeam2(t=>({...t, total:0, scores:[]})); setCurrentStep(AppState.GAME); setToast("لعبة جديدة.. حظ موفق! 🔥"); }}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-2xl font-black py-7 rounded-[2.5rem] flex items-center justify-center gap-3 active:scale-95 shadow-xl transition-all"
                >
                    <RotateCcw className="w-7 h-7" />
                    لعبة جديدة
                </button>
                <button
                    onClick={() => setCurrentStep(AppState.SETUP)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xl font-bold py-5 rounded-[2rem] active:scale-95"
                >
                    تغيير الفرق
                </button>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
