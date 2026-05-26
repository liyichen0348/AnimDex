import React, { useState, useRef, useEffect } from 'react';
import BottomNav from './BottomNav';
import { identifyAnimal, AnimalRecord } from '../utils/api';
import { showToast } from './Toast';

export default function CameraScan({ onCapture, onNavigate }: { onCapture: (record: AnimalRecord, localImg?: string) => void, onNavigate: (s:string)=>void }) {
  const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdtA-_PhOy88U0hjYfmMtGLooUrCPB446kOM3rePUxFReRAYtvodEPHgjR9ieAf4ao4-I-TWaFZGRlCjg15dLgDRgqQP_-uN7NfUK3L2hCVpvYkBWbQ0PPFC2o6Pm7YT1WfQnbUI4QaNGBloZCzywrW0cZc9099NS-mlHwSgorXMZG-lnEkNZhncGFH1GTdyNU5o6aFeCg0CujYEp-hjOimnhq1gygqwrD96VQru1NvPl89pgvS8PIsdfk9Ul9uoedcWLlL0ZAgCqi';
  
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('animdex_user_avatar') || DEFAULT_AVATAR;
  });

  useEffect(() => {
    const handleUpdate = () => {
      setAvatar(localStorage.getItem('animdex_user_avatar') || DEFAULT_AVATAR);
    };
    window.addEventListener('animdex_avatar_updated', handleUpdate);
    return () => {
      window.removeEventListener('animdex_avatar_updated', handleUpdate);
    };
  }, []);

  const [identifying, setIdentifying] = useState(false);
  const [flash, setFlash] = useState(false);
  const [bgImage, setBgImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuB0VdMRP-k0wBttPuULX1ScEnnTdncprgMDhipKS_nEhxCkWjkXgyIY8tMA6A3Q6WOQS6kCADngNSZn3-4Tw9Iz-wZ0veqOPW7BK3ziVkqsZt5TjKElSuPbiGYUV5fMepvs6VOpbs1ykbfLW72m32jRDabxBESaCeuRfz71z5r8uddxElPJNyMKPvOHBF8zEPovuNtIg88OSpHtOLHYkbQ_Z8dcsasMfMOzHA9dbUOeZzZVNF-GYanBIX4gDVVrvZrK_9rr23e3t0wi');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1x1像素的透明PNG，用于Demo演示兜底
  const demoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  // Canvas 图片压缩工具，限制最大边长为 400 像素，生成 JPEG (quality: 0.6) 缩略图以极速落库
  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const MAX_WIDTH = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 导出轻量化的缩略图 Base64 (JPG格式，60%质量)
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        resolve(compressed);
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  // 触发图片文件选择/拍照
  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 处理选择的文件
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    reader.onload = async () => {
      const originalBase64 = reader.result as string;
      setBgImage(originalBase64);
      const compressedBase64 = await compressImage(originalBase64);
      await processImageIdentification(compressedBase64, originalBase64, file.type);
    };

    reader.onerror = () => {
      showToast('读取图片文件失败！', 'error');
    };

    reader.readAsDataURL(file);
  };

  // 统一发起识别请求
  const processImageIdentification = async (compressedBase64: string, originalBase64: string, mimeType: string) => {
    setIdentifying(true);
    try {
      showToast('图片上传中，AI 正在深度解析...', 'info', 2000);
      const userId = localStorage.getItem('animdex_user_id') || '8942371';
      const userName = localStorage.getItem('animdex_user_name') || '自然探索者';
      const record = await identifyAnimal(compressedBase64, mimeType, userId, userName);
      showToast('识别完成！', 'success');
      onCapture(record, originalBase64);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || '识别出错，请重试', 'error');
    } finally {
      setIdentifying(false);
      // 清空 input value，防止下次选相同文件不触发 onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 快捷一键演示（供测试用，不需要真实文件）
  const handleDemoCapture = async () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 100);
    setBgImage('https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&q=80&w=800');
    await processImageIdentification(demoBase64, demoBase64, 'image/png');
  };

  return (
    <div className="bg-background text-on-surface h-screen overflow-hidden relative">
      {/* 隐藏的文件上传 Input 控件，在移动端会自动唤起相机拍照或相册 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="hidden-camera-input"
      />

      <div className="fixed inset-0 z-0">
        <img src={bgImage} alt="Viewfinder" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="relative w-[80vw] h-[60vh] border-2 border-white/30 rounded-2xl">
             <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary-container rounded-tl-2xl"></div>
             <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary-container rounded-tr-2xl"></div>
             <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary-container rounded-bl-2xl"></div>
             <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary-container rounded-br-2xl"></div>
             <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scan"></div>
           </div>
        </div>
      </div>

      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/70 backdrop-blur-xl shadow-sm">
        <button className="text-primary hover:bg-surface-container-high/50 p-2 rounded-full transition-colors active:scale-95">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-[28px] font-bold text-primary">AnimDex</h1>
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-white cursor-pointer" onClick={() => onNavigate('profile')}>
          <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </header>

      {identifying && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
          <div className="glass-panel px-6 py-2 rounded-full shadow-lg flex items-center gap-3 border border-white/20 relative bg-black/60 text-white">
            <div className="w-2 h-2 bg-[#10b981] rounded-full animate-ping"></div>
            <span className="text-[12px] font-bold uppercase tracking-wider">正在智能分析中...</span>
          </div>
        </div>
      )}

      {flash && <div className="fixed inset-0 bg-white z-[100] transition-opacity duration-100 ease-out" />}

      {/* 右侧动作条 */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-40">
        <button onClick={handleDemoCapture} title="AI智能演示" className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-white bg-black/40 hover:bg-black/60 active:scale-90 shadow-sm border border-white/40">
          <span className="material-symbols-outlined text-[#eab308]">auto_awesome</span>
        </button>
        <button onClick={triggerCamera} title="从相册选择" className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-white bg-black/40 hover:bg-black/60 active:scale-90 shadow-sm border border-white/40">
          <span className="material-symbols-outlined">photo_library</span>
        </button>
        <button onClick={() => showToast('已开启自动对焦', 'info')} title="闪光灯" className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-white bg-black/40 hover:bg-black/60 active:scale-90 shadow-sm border border-white/40">
          <span className="material-symbols-outlined">flash_on</span>
        </button>
      </div>

      <div className="fixed bottom-28 left-0 w-full flex flex-col items-center gap-8 z-40">
        {/* 拍照主按钮 */}
        <button onClick={triggerCamera} className="relative group" title="点击拍照">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_0_4px_white,0_0_0_8px_rgba(255,255,255,0.3)] active:scale-90 transition-transform">
             <div className="w-16 h-16 border-2 border-on-surface-variant/10 rounded-full flex items-center justify-center">
                 <div className="w-14 h-14 bg-tertiary-container rounded-full shadow-inner group-hover:bg-tertiary transition-colors"></div>
             </div>
          </div>
          <div className="absolute -inset-2 border-2 border-primary-container/50 rounded-full animate-ping pointer-events-none opacity-40"></div>
        </button>
      </div>

      <BottomNav active="camera" onNavigate={onNavigate} />
    </div>
  );
}
