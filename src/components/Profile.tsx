import React, { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import { getProfileStats, ProfileStats, getRecords, AnimalRecord } from '../utils/api';
import { showToast } from './Toast';

let cachedProfileStats: any = null;
let cachedProfileRecords: AnimalRecord[] | null = null;

export default function Profile({ onNavigate }: { onNavigate: (s:string)=>void }) {
  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';

  const [userId] = useState(() => {
    return localStorage.getItem('animdex_user_id') || '8942371';
  });
  
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('animdex_user_name') || '自然探索者';
  });
  
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('animdex_user_avatar') || DEFAULT_AVATAR;
  });

  const [bio, setBio] = useState(() => {
    return localStorage.getItem('animdex_user_bio') || '行而不辍，探索自然的奥秘。';
  });

  // 各种弹窗控制
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editBio, setEditBio] = useState(bio);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [records, setRecords] = useState<AnimalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择有效的图片文件！', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          showToast('图像压缩失败', 'error');
          return;
        }

        const size = 120;
        canvas.width = size;
        canvas.height = size;

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        localStorage.setItem('animdex_user_avatar', compressedBase64);
        setAvatar(compressedBase64);
        window.dispatchEvent(new Event('animdex_avatar_updated'));
        showToast('头像已成功修改', 'success');
      };
      img.onerror = () => {
        showToast('读取图片出错！', 'error');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchStats = async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const data = await getProfileStats(userId);
        setStats(data);
        cachedProfileStats = data;

        const recordData = await getRecords('全部', undefined, userId);
        setRecords(recordData);
        cachedProfileRecords = recordData;
      } catch (err: any) {
        showToast(err.message || '获取个人数据失败', 'error');
      } finally {
        if (!isBackground) setLoading(false);
      }
    };
    
    if (cachedProfileStats && cachedProfileRecords) {
      setStats(cachedProfileStats);
      setRecords(cachedProfileRecords);
      setLoading(false);
      fetchStats(true);
    } else {
      fetchStats(false);
    }
  }, [userId]);

  const handleSaveName = () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      showToast('用户名不能为空！', 'error');
      return;
    }
    const trimmedBio = editBio.trim() || '行而不辍，探索自然的奥秘。';

    setUserName(trimmedName);
    localStorage.setItem('animdex_user_name', trimmedName);

    setBio(trimmedBio);
    localStorage.setItem('animdex_user_bio', trimmedBio);

    setIsEditing(false);
    showToast('个人资料已更新', 'success');
  };

  const totalSpecies = records.length;
  
  const categoryCounts = records.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const badges = [
    {
      id: 'badge-1',
      title: '自然初识',
      desc: '首次完成物种识别',
      icon: 'explore',
      req: 1,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-250',
      story: '万物皆有其名。当你记录下第一个物种，你便开启了与大自然对话的第一扇窗。正如博物学家达尔文所言：“光是凝视大自然，就足以让人沉醉。”'
    },
    {
      id: 'badge-2',
      title: '荒野行者',
      desc: '成功记录 3 个物种',
      icon: 'forest',
      req: 3,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-250',
      story: '行者无疆。记录 3 个物种意味着你已经迈出了舒适区，开始在附近的荒野、公园或街道中寻找生命的痕迹。地球上的每一个角落都充满了生机，等待着你去发掘。'
    },
    {
      id: 'badge-3',
      title: '博物学者',
      desc: '成功记录 6 个物种',
      icon: 'auto_stories',
      req: 6,
      color: 'from-purple-500 to-fuchsia-600',
      shadow: 'shadow-purple-250',
      story: '格物致知。收集 6 个物种的你，已逐渐培养出敏锐的观察力。在18世纪，林奈等博物学家正是通过不知疲倦的记录，为庞大的生物世界建立起科学的分类。你正在延续他们的足迹。'
    },
    {
      id: 'badge-4',
      title: '生态守护',
      desc: '成功记录 10 个物种',
      icon: 'shield_with_heart',
      req: 10,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-250',
      story: '万物共生。当记录达到 10 个物种，你不仅是一个旁观者，更成为了生态的守护者。每一个物种的记录，都是人类了解并保护地球生物多样性的重要一步。'
    }
  ];

  return (
    <div className="bg-[#f8fafc] text-on-surface min-h-screen pb-28 relative font-sans">
      {/* 置顶玻璃磨砂 Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <h1 className="text-[19px] font-black text-slate-800 flex items-center gap-1.5">
          <span className="material-symbols-outlined fill text-emerald-600 text-[23px]">forest</span>
          我的野外档案
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('history')} 
            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-550 border border-slate-100 active:scale-95 transition-all"
            title="足迹"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
        </div>
      </header>
      
      <main className="pt-20 px-4 max-w-lg mx-auto animate-in fade-in duration-500 flex flex-col gap-5">
        {/* Hero Banner Card */}
        <div className="bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            {/* Avatar upload */}
            <label className="relative w-18 h-18 rounded-full overflow-hidden border-2 border-white/40 shrink-0 z-10 cursor-pointer group block bg-white/10 shadow-inner">
              <img src={avatar} alt="Profile avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="material-symbols-outlined text-white text-[18px]">photo_camera</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload-input"
              />
            </label>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[20px] font-black tracking-wide truncate">{userName}</h2>
                <button 
                  onClick={() => {
                    setEditName(userName);
                    setEditBio(bio);
                    setIsEditing(true);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/15 p-1 rounded-full flex items-center justify-center transition-all active:scale-90"
                  title="修改用户名"
                >
                  <span className="material-symbols-outlined text-[17px]">edit</span>
                </button>
              </div>
              <p className="text-[11px] text-white/70 font-semibold mb-2">ID: {userId}</p>
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-[12px] fill text-amber-300">editor_choice</span>
                <span className="text-[10.5px] font-black">{loading ? '正在载入...' : (stats?.user_title || '初级探险家')}</span>
              </div>
            </div>
          </div>

          {/* Personality Bio */}
          <div className="mt-4 pt-3.5 border-t border-white/15 relative z-10">
            <p className="text-[11.5px] text-white/95 italic font-medium leading-relaxed truncate">
              “ {bio} ”
            </p>
          </div>
        </div>

        {/* Compact Stats Capsules */}
        <div className="flex gap-3">
          <div className="flex-1 bg-emerald-50/70 border border-emerald-100/40 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 shrink-0">
              <span className="material-symbols-outlined text-[20px] fill">forest</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-black text-emerald-800 leading-none">{loading ? '--' : totalSpecies}</span>
              <span className="text-[10px] font-bold text-emerald-600/80 mt-0.5">已发现物种</span>
            </div>
          </div>

          <div className="flex-1 bg-orange-50/70 border border-orange-100/40 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-600 shrink-0">
              <span className="material-symbols-outlined text-[20px] fill">bookmark_added</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-black text-orange-800 leading-none">{loading ? '--' : (stats?.total_saved || 0)}</span>
              <span className="text-[10px] font-bold text-orange-600/80 mt-0.5">已收藏样本</span>
            </div>
          </div>
        </div>

        {/* Achievement Badges陈列室 */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
          <h3 className="text-[13.5px] font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px] text-emerald-600 fill">workspace_premium</span>
            荣誉成就勋章墙
          </h3>
          <div className="grid grid-cols-2 gap-3.5">
            {badges.map(b => {
              const unlocked = totalSpecies >= b.req;
              return (
                <div 
                  key={b.id} 
                  onClick={() => setSelectedBadge(b)}
                  className={`relative rounded-2xl p-4 border transition-all duration-300 flex flex-col items-center text-center cursor-pointer hover:shadow-sm ${
                    unlocked 
                      ? 'bg-gradient-to-br from-white to-slate-50 border-slate-100 scale-100' 
                      : 'bg-slate-50/50 border-slate-100 opacity-60 scale-98'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 shadow-sm transition-all ${
                    unlocked 
                      ? `bg-gradient-to-br ${b.color} text-white shadow-md animate-pulse duration-3000` 
                      : 'bg-slate-200 text-slate-450'
                  }`}>
                    <span className="material-symbols-outlined text-[22px]">{b.icon}</span>
                  </div>
                  <h4 className={`text-[13px] font-extrabold ${unlocked ? 'text-slate-800' : 'text-slate-450'}`}>{b.title}</h4>
                  <p className="text-[9.5px] text-slate-400 mt-0.5 leading-snug font-medium">{b.desc}</p>
                  
                  {!unlocked ? (
                    <div className="absolute top-2 right-2 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px] text-slate-350">lock</span>
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 flex items-center justify-center bg-emerald-500 w-3 h-3 rounded-full">
                      <span className="material-symbols-outlined text-[8px] text-white font-black">done</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Category Exploration Distribution */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
          <h3 className="text-[13.5px] font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px] text-emerald-600 fill">donut_large</span>
            物种探索分布
          </h3>
          <div className="flex flex-col gap-3.5">
            {[
              { name: '哺乳类', color: 'from-amber-400 to-orange-500' },
              { name: '鸟类', color: 'from-blue-400 to-indigo-500' },
              { name: '昆虫', color: 'from-emerald-400 to-teal-500' },
              { name: '其他', color: 'from-pink-400 to-rose-500' }
            ].map(cat => {
              const count = categoryCounts[cat.name] || 0;
              const maxVal = Math.max(1, totalSpecies);
              const percent = Math.round((count / maxVal) * 100);
              return (
                <div key={cat.name} className="flex items-center text-[11.5px] font-extrabold">
                  <span className="w-12 text-slate-500 font-bold">{cat.name}</span>
                  <div className="flex-1 mx-3 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-50">
                    <div 
                      className={`bg-gradient-to-r ${cat.color} h-full rounded-full transition-all duration-500`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    <span className="font-black text-slate-700">{count} 种 ({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 个人资料修改模态弹窗 */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-[88vw] max-w-[340px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] transform transition-transform duration-300 animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-[22px]">manage_accounts</span>
              <h3 className="text-[18px] font-black text-slate-800">编辑个人档案</h3>
            </div>
            
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1.5 block">探索者名称</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="请输入您的探索者名称"
                  maxLength={15}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                  }}
                  id="edit-username-input"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1.5 block">个性探索签名</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all h-20 resize-none"
                  placeholder="用一句话表达您的探索态度..."
                  maxLength={40}
                  id="edit-bio-input"
                />
                <div className="text-right text-[9.5px] text-slate-400 mt-1">
                  {editBio.length} / 40
                </div>
              </div>
            </div>
            
            <div className="flex gap-3.5 justify-end border-t border-slate-50 pt-4">
              <button
                onClick={() => {
                  setEditName(userName);
                  setEditBio(bio);
                  setIsEditing(false);
                }}
                className="px-4 py-2.5 rounded-xl text-[12.5px] font-black bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors border border-slate-200 active:scale-95"
              >
                取消
              </button>
              <button
                onClick={handleSaveName}
                className="px-5 py-2.5 rounded-xl text-[12.5px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95"
                id="confirm-save-name-btn"
              >
                保存资料
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 徽章详情模态弹窗 */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-[88vw] max-w-[340px] shadow-[0_12px_32px_rgba(0,0,0,0.18)] transform transition-transform duration-300 animate-in zoom-in-95 text-center relative">
            
            <button 
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Badge Icon large */}
            <div className="flex justify-center my-4">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg ${
                totalSpecies >= selectedBadge.req 
                  ? `bg-gradient-to-br ${selectedBadge.color} ${selectedBadge.shadow} animate-pulse duration-3000` 
                  : 'bg-slate-200 text-slate-455'
              }`}>
                <span className="material-symbols-outlined text-[42px]">{selectedBadge.icon}</span>
              </div>
            </div>

            <h3 className="text-[17px] font-black text-slate-800 mb-1">{selectedBadge.title}</h3>
            
            {/* Status chip */}
            <div className="inline-block mb-4">
              {totalSpecies >= selectedBadge.req ? (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  已解锁 · 探索者荣誉
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  未解锁 · 需记录达 {selectedBadge.req} 种生物 (当前 {totalSpecies}/{selectedBadge.req})
                </span>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[12px] text-slate-550 leading-relaxed font-medium text-left italic mb-2">
              “ {selectedBadge.story} ”
            </div>
            
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full mt-4 py-2.5 rounded-xl text-[13px] font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-colors active:scale-95"
            >
              确定
            </button>
          </div>
        </div>
      )}

      <BottomNav active="profile" onNavigate={onNavigate} />
    </div>
  );
}
