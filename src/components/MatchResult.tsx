import { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import { AnimalRecord, saveRecord, unsaveRecord } from '../utils/api';
import { showToast } from './Toast';

// 兜底 Mock 记录 (小熊猫)，以防直接导航至此页面时 record 为空
const fallbackRecord: AnimalRecord = {
  id: 'fallback-panda',
  created_at: new Date().toISOString(),
  title: '小熊猫',
  scientific_name: 'Ailurus fulgens',
  image_url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=800',
  match_rate: 98,
  habitat: '温带山地森林/竹林',
  protection_status: '濒危',
  fun_fact: '小熊猫是温带山地森林的特有种，体型与猫相似但更丰满。它们长有红褐色的浓密毛发与环状条纹的尾巴，以竹子为主食，自成小熊猫科，是高度适应树栖生活的珍稀哺乳动物。',
  size: '50-64cm',
  diet: '杂食',
  activity: '夜行',
  location: '中国四川省横断山脉地区',
  category: '哺乳类',
  is_saved: false
};

// 按分类精心配备的萌宠百科标准兜底图池
const categoryFallbackImages: Record<string, string> = {
  '哺乳类': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
  '鸟类': 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=800',
  '昆虫': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
  '其他': 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=800'
};

export default function MatchResult({ record, localImage, onBack, onNavigate }: { record: AnimalRecord | null, localImage: string | null, onBack: () => void, onNavigate: (page: string) => void }) {
  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';
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

  const activeRecord = record || fallbackRecord;
  const [saved, setSaved] = useState(activeRecord.is_saved);
  const [saving, setSaving] = useState(false);
  const [showUserPhoto, setShowUserPhoto] = useState(false);

  // 引入防盗链和断网裂图兜底逻辑
  const [imgSrc, setImgSrc] = useState(activeRecord.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800');

  useEffect(() => {
    setImgSrc(activeRecord.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800');
    setSaved(activeRecord.is_saved);
    // 默认展示百度标准百科图，用户点击“看我拍的”才会切换实拍图
    setShowUserPhoto(false);
  }, [activeRecord.image_url, activeRecord.is_saved, activeRecord.uploaded_image_url, localImage]);

  const handleImageError = () => {
    if (showUserPhoto && userImg) {
      setShowUserPhoto(false);
    } else {
      const fallbackUrl = categoryFallbackImages[activeRecord.category || ''] || categoryFallbackImages['其他'];
      if (imgSrc !== fallbackUrl) {
        setImgSrc(fallbackUrl);
      }
    }
  };

  const handleToggleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        await unsaveRecord(activeRecord.id);
        setSaved(false);
        activeRecord.is_saved = false;
        showToast('已取消收藏', 'info');
      } else {
        await saveRecord(activeRecord.id);
        setSaved(true);
        activeRecord.is_saved = true;
        showToast('成功保存到收藏！', 'success');
        onNavigate('history');
      }
    } catch (err: any) {
      showToast(err.message || '操作失败，请重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  const userImg = activeRecord.uploaded_image_url || localImage;
  const currentMainImg = showUserPhoto && userImg ? userImg : imgSrc;

  // 定标红区域（即卡片背景）
  return (
    <div className="bg-[#f8f9fc] text-on-surface pb-32 min-h-screen relative">
      {/* 头部固定导航栏 */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-primary text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-[20px] font-bold text-primary tracking-wide">AnimDex 物种详情</h1>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container cursor-pointer active:scale-95 transition-all" onClick={() => onNavigate('profile')}>
          <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </header>

      <main className="mt-16 animate-in fade-in duration-500">
        {/* 头部大图展示区 - 高度相比原 aspect-video 增加 50%，设为 aspect-[4/5] 极致视觉张力 */}
        <section className="relative w-full aspect-[4/5] overflow-hidden rounded-b-[40px] shadow-lg bg-gray-900">
          <img 
            src={currentMainImg} 
            onError={handleImageError}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-500 ease-out" 
            alt={activeRecord.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

          {/* 只有一个识别成功胶囊，精致透明感 */}
          <div className="absolute top-6 left-6 z-10">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[12px] font-bold border border-white/10 shadow-sm">
              <span className="material-symbols-outlined text-[15px] mr-1.5 text-emerald-400 fill">verified</span>
              识别成功
            </span>
          </div>

          {/* 右上角“看我拍的 / 看百科图”切换毛玻璃气泡 */}
          {userImg && (
            <div className="absolute top-6 right-6 z-10">
              <button 
                onClick={() => setShowUserPhoto(!showUserPhoto)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-primary text-[12px] font-bold shadow-md hover:bg-white active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {showUserPhoto ? 'menu_book' : 'photo_camera'}
                </span>
                {showUserPhoto ? '看百科图' : '看我拍的'}
              </button>
            </div>
          )}

          {/* 标题及匹配度文字浮层 */}
          <div className="absolute bottom-10 left-0 w-full px-6 flex items-end justify-between">
            <div>
              <h2 className="text-[32px] font-extrabold text-white leading-tight drop-shadow-md">{activeRecord.title}</h2>
              <p className="text-white/70 text-[14px] italic mt-1 drop-shadow-sm">{activeRecord.scientific_name}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-white/60 text-[11px] font-bold tracking-wider uppercase">匹配度</div>
              <div className="text-[#10b981] text-[36px] font-black leading-none mt-1 drop-shadow-md">{activeRecord.match_rate}%</div>
            </div>
          </div>
        </section>

        {/* 标红区域（即卡片背景区域）- 相比原先增加 50% 的内边距和高级质感 */}
        <section className="px-6 -mt-6 relative z-10 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100/50 flex flex-col gap-6">
            
            {/* 科普趣味知识 Fun Fact */}
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 text-primary">
                <span className="material-symbols-outlined text-[80px]">description</span>
              </div>
              <h4 className="text-[12px] font-black text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] fill">description</span>
                简要介绍
              </h4>
              <p className="text-[14px] text-gray-700 leading-relaxed font-medium">{activeRecord.fun_fact}</p>
            </div>

            {/* 百科属性列表 - 采用全新扁平化高密度纵向列表，解决内容太长挤扁的问题 */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-1">基本物理与生态特征</h3>
              
              <div className="divide-y divide-gray-100">
                {/* 1. 栖息地 */}
                <div className="py-3.5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] fill">park</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-gray-400">栖息环境</div>
                    <div className="text-[14px] font-semibold text-gray-800 mt-0.5 leading-snug">{activeRecord.habitat}</div>
                  </div>
                </div>

                {/* 2. 保护现状 */}
                <div className="py-3.5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] fill">shield_with_heart</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-gray-400">保护现状</div>
                    <div className="text-[14px] font-semibold text-gray-800 mt-0.5 leading-snug">{activeRecord.protection_status}</div>
                  </div>
                </div>

                {/* 3. 体型大小 */}
                <div className="py-3.5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">straighten</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-gray-400">平均体型</div>
                    <div className="text-[14px] font-semibold text-gray-800 mt-0.5 leading-snug">{activeRecord.size}</div>
                  </div>
                </div>

                {/* 4. 食性类别 */}
                <div className="py-3.5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] fill">restaurant</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-gray-400">饮食特征</div>
                    <div className="text-[14px] font-semibold text-gray-800 mt-0.5 leading-snug">{activeRecord.diet}</div>
                  </div>
                </div>

                {/* 5. 活跃时间 */}
                <div className="py-3.5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] fill">schedule</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-gray-400">活跃规律</div>
                    <div className="text-[14px] font-semibold text-gray-800 mt-0.5 leading-snug">{activeRecord.activity}</div>
                  </div>
                </div>

                {/* 6. 发现地点 / 分布地点 */}
                <div className="py-3.5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] fill">location_on</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-gray-400">分布地区 / 发现地点</div>
                    <div className="text-[14px] font-semibold text-gray-800 mt-0.5 leading-snug">{activeRecord.location}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 实拍照展示相册 - 精美对比卡片 */}
            {userImg && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">探索足迹相册</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* 实拍对比图 */}
                  <div 
                    onClick={() => setShowUserPhoto(true)}
                    className={`relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border-2 transition-all ${showUserPhoto ? 'border-primary shadow-md scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={userImg} className="w-full h-full object-cover" alt="现场拍摄" />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                      现场实拍
                    </div>
                  </div>

                  {/* 百科对比图 */}
                  <div 
                    onClick={() => setShowUserPhoto(false)}
                    className={`relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border-2 transition-all ${!showUserPhoto ? 'border-primary shadow-md scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={imgSrc} className="w-full h-full object-cover" alt="标准百科" />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                      标准百科
                    </div>
                  </div>
                </div>
              </div>
            )}



          </div>
        </section>
      </main>

      {/* 底部收藏操作悬浮条 */}
      <section className="fixed bottom-24 left-0 w-full px-6 z-[70] max-w-5xl mx-auto pointer-events-none inset-x-0">
        <button 
          onClick={handleToggleSave} 
          disabled={saving}
          className={`w-full pointer-events-auto ${saved ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-200' : 'bg-primary text-white shadow-lg shadow-primary/20'} font-bold py-4 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all duration-200`}
        >
          <span className={`material-symbols-outlined ${saved ? 'fill' : ''}`}>{saved ? 'bookmark_added' : 'bookmark'}</span>
          {saved ? '已收藏' : '保存收藏'}
        </button>
      </section>

      <BottomNav active="result" onNavigate={onNavigate} />
    </div>
  );
}