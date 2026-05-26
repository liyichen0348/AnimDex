export default function BottomNav({ active, onNavigate }: { active: string, onNavigate: (s:string)=>void }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-[60] flex justify-around items-center px-4 py-3 bg-surface/80 backdrop-blur-2xl shadow-[0_-4px_20px_0_rgba(0,0,0,0.1)] rounded-t-2xl">
      <button id="nav-camera-btn" onClick={() => onNavigate('camera')} className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${active === 'camera' || active === 'result' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>
        <span className={`material-symbols-outlined ${active === 'camera' || active === 'result' ? 'fill' : ''}`}>photo_camera</span>
        <span className="text-[12px] font-semibold mt-1">相机</span>
      </button>
      <button id="nav-history-btn" onClick={() => onNavigate('history')} className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${active === 'history' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>
        <span className={`material-symbols-outlined ${active === 'history' ? 'fill' : ''}`}>history</span>
        <span className="text-[12px] font-semibold mt-1">历史</span>
      </button>
      <button id="nav-profile-btn" onClick={() => onNavigate('profile')} className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${active === 'profile' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>
        <span className={`material-symbols-outlined ${active === 'profile' ? 'fill' : ''}`}>person</span>
        <span className="text-[12px] font-semibold mt-1">我的</span>
      </button>
    </nav>
  );
}
