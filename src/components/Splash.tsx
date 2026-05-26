import { useState } from 'react';

export default function Splash({ onStart }: { onStart: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      onStart();
    }, 2000);
  };

  return (
    <main className="relative h-screen flex flex-col items-center justify-between px-6 pt-16 pb-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[80px] opacity-40"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-tertiary-container/10 rounded-full blur-[80px] opacity-40"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[80px] opacity-40"></div>
      </div>

      <div className="w-full flex flex-col items-center z-10 animate-in fade-in slide-in-from-top-8 duration-700">
        <h1 className="text-[32px] font-bold text-primary tracking-tighter mb-2">AnimDex</h1>
        <p className="text-[20px] font-semibold text-on-surface-variant opacity-80">探索身边的自然奇迹</p>
      </div>

      <div className="relative w-full max-w-sm aspect-[4/5] mt-8 group z-10 animate-in zoom-in-95 duration-1000 ease-out">
        <div className="absolute inset-4 bg-black/10 blur-[40px] rounded-2xl"></div>
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20 shadow-xl">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGPmbGNj58NDeFIA24Fxv32xUs0gd3Xu233FdLa31Y3nSxDZwQ1gdhnXM2fNeOM3nD-3UcS6aMDyke7I97Wq_Dk8WbeXzi0M-TsoJcz9GJBSG2hou7wl-3-1zJAtroZRhcIhVJcATY23OFJWGbG_G6OjrmQZAeX-_384cGbEmvTTCE2JeHjSp3n-P3lZwv5mCFBUojp7X2e7WlUjxFVB8OW-7dG0MPt7IK9k5VSB3C7UjHgkUFOFxka6rKE5KPcKsIvA4gQJ_CXLEU" alt="Lion" className="w-full h-full object-cover transform duration-10000 hover:scale-110" />
          <div className="absolute bottom-6 left-6 right-6 glass-panel p-4 rounded-xl flex items-center justify-between">
             <div className="flex flex-col">
               <span className="text-[12px] font-semibold text-primary uppercase tracking-widest">今日精选</span>
               <span className="text-[20px] font-bold text-on-surface">Panthera Leo</span>
             </div>
             <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
               <span className="material-symbols-outlined fill text-[18px] text-primary">auto_awesome</span>
               <span className="text-[12px] font-semibold text-primary">98% 匹配度</span>
             </div>
          </div>
        </div>
        <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl opacity-60"></div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-tertiary-container rounded-br-2xl opacity-60"></div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6 mt-auto z-10 animate-in slide-in-from-bottom-8 duration-700">
        <button onClick={handleStart} className="w-full h-16 bg-tertiary-container text-white font-bold rounded-full text-lg shadow-[0_8px_30px_0_rgba(255,126,45,0.3)] active:scale-95 transition-all duration-200 animate-pulse-ring flex items-center justify-center gap-3">
          <span className="material-symbols-outlined fill">photo_camera</span>
          立即开始
        </button>
        <div className="flex items-center gap-4 text-on-surface-variant/60">
          <div className="h-[1px] w-12 bg-outline-variant"></div>
          <span className="text-[12px] font-semibold">由先进 AI 驱动</span>
          <div className="h-[1px] w-12 bg-outline-variant"></div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center transition-opacity animate-in fade-in">
           <div className="relative w-32 h-32 mb-8">
             <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <span className="material-symbols-outlined text-4xl text-primary fill">pets</span>
             </div>
           </div>
           <p className="text-[20px] font-bold text-primary animate-pulse">正在初始化自然图鉴...</p>
        </div>
      )}
    </main>
  );
}
