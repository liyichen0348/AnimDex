import React, { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import { AnimalRecord, getRecords, deleteRecord } from '../utils/api';
import { showToast } from './Toast';

// 按分类精心配备的萌宠百科标准兜底图池，防止出现认狗为狮等图片匹配错误 Bug
const categoryFallbackImages: Record<string, string> = {
  '哺乳类': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800', // 极其可爱欢笑的狗狗大图
  '鸟类': 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=800',  // 五彩斑斓的鹦鹉鸟类图
  '昆虫': 'https://images.unsplash.com/photo-1578326430280-a17307d833a6?auto=format&fit=crop&q=80&w=800',  // 极具质感的瓢虫昆虫图
  '其他': 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=800'   // 萌萌的绿头龟照片
};

let cachedHistoryRecords: AnimalRecord[] | null = null;

export default function History({ 
  onNavigate, 
  onSelectRecord 
}: { 
  onNavigate: (s: string) => void;
  onSelectRecord: (record: AnimalRecord) => void;
}) {
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

  const [filter, setFilter] = useState('全部');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<AnimalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const categories = ['全部', '哺乳类', '鸟类', '昆虫', '其他'];

  // 拉取历史记录 (客户端 SWR 预加载极速缓存模式)
  useEffect(() => {
    const fetchHistory = async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const userId = localStorage.getItem('animdex_user_id') || '8942371';
        const data = await getRecords(filter, search, userId);
        setRecords(data);
        
        if (filter === '全部' && !search) {
          cachedHistoryRecords = data;
        }
      } catch (err: any) {
        showToast(err.message || '获取历史记录失败，请刷新重试', 'error');
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    // 1. 如果有全部记录的缓存，优先用缓存渲染，达到秒开效果，随后在后台静默更新
    if (filter === '全部' && !search && cachedHistoryRecords) {
      setRecords(cachedHistoryRecords);
      setLoading(false);
      fetchHistory(true);
      return;
    }

    // 2. 如果不属于模糊搜索输入（例如切换类别标签），立即调取数据以消除 300ms 额外防抖延时
    if (!search) {
      fetchHistory(false);
      return;
    }

    // 3. 用户正在输入搜索词时，防抖 300ms 以减少 API 请求压力
    const delayDebounce = setTimeout(() => {
      fetchHistory(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [filter, search]);

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, title: name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRecord(deleteTarget.id);
      showToast('删除历史成功', 'success');
      setRecords(prev => prev.filter(r => r.id !== deleteTarget.id));
    } catch (err: any) {
      showToast(err.message || '删除失败', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // 格式化日期为: YYYY年MM月DD日
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    } catch {
      return '未知时间';
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen pb-28">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer hover:bg-surface-container-high/50 p-2 rounded-full active:scale-95 transition-all">menu</span>
          <h1 className="text-[28px] font-bold text-primary">AnimDex</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container cursor-pointer" onClick={() => onNavigate('profile')}>
          <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </header>

      <main className="pt-24 px-4 max-w-5xl mx-auto animate-in fade-in">
        {/* 搜索框 */}
        <section className="mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索我的发现或收藏..." 
              className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-[16px] focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm" 
            />
          </div>
        </section>

        {/* 分类过滤栏 */}
        <section className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-4">
          {categories.map((c) => (
             <button 
                key={c} 
                onClick={() => setFilter(c)} 
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[12px] font-bold active:scale-95 transition-all ${filter === c ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
             >
               {c}
             </button>
          ))}
        </section>

        {/* 加载骨架屏 */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mt-4">
            <div className="lg:col-span-2 h-72 bg-surface-container-high rounded-2xl"></div>
            <div className="h-72 bg-surface-container-high rounded-2xl"></div>
            <div className="h-40 bg-surface-container-high rounded-2xl"></div>
            <div className="h-40 bg-surface-container-high rounded-2xl"></div>
          </div>
        )}

        {/* 列表渲染 */}
        {!loading && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-outline-variant text-6xl mb-4">search_off</span>
            <p className="text-[16px] font-bold text-on-surface-variant">没有找到相关的发现记录</p>
            <p className="text-[12px] text-outline mt-1">去拍张照片，开始你的自然探索吧！</p>
          </div>
        )}

        {!loading && records.length > 0 && (
          <section className="flex flex-col gap-4">
            {records.map((record) => (
              <div 
                key={record.id}
                onClick={() => onSelectRecord(record)}
                className="group relative flex gap-4 p-3 bg-white rounded-2xl border border-outline-variant/30 hover:border-primary/30 active:scale-[0.98] transition-all shadow-[0_2px_8px_0_rgba(0,0,0,0.03)] cursor-pointer overflow-hidden"
              >
                {/* 左侧：精美大图 */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/10 shadow-inner">
                  <img 
                    src={record.image_url} 
                    onError={(e) => {
                      const category = record.category || '其他';
                      e.currentTarget.src = categoryFallbackImages[category] || categoryFallbackImages['其他'];
                    }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={record.title} 
                  />
                  {record.is_saved && (
                    <div className="absolute top-1 left-1 bg-[#10b981] text-white rounded-full p-0.5 shadow-sm flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px] fill">bookmark</span>
                    </div>
                  )}
                </div>

                {/* 右侧：高密度信息内容 */}
                <div className="flex-1 flex flex-col justify-between min-w-0 pr-2">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[17px] font-bold text-on-surface truncate group-hover:text-primary transition-colors leading-snug">{record.title}</h3>
                      {/* 删除按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record.id, record.title);
                        }}
                        className="w-7 h-7 rounded-full bg-surface-container-high/40 hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center text-on-surface-variant transition-colors shrink-0"
                        title="删除记录"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                    <p className="text-[12px] text-outline italic truncate -mt-0.5 mb-1">{record.scientific_name}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[10px] font-bold border border-primary/10">
                        {record.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-tertiary-container/5 text-tertiary text-[10px] font-bold border border-tertiary/10">
                        匹配 {record.match_rate}%
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-outline-variant leading-none">{formatDate(record.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* 底部悬浮拍照 */}
      <div className="fixed bottom-24 right-6 z-40">
        <button 
          onClick={() => onNavigate('camera')} 
          className="relative w-16 h-16 rounded-full bg-tertiary-container text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform overflow-hidden group"
        >
           <span className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping opacity-75"></span>
           <span className="material-symbols-outlined text-3xl font-bold">add_a_photo</span>
        </button>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-[85vw] max-w-[340px] shadow-[0_10px_30px_0_rgba(0,0,0,0.15)] transform transition-transform duration-300 animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-red-500 text-[24px]">warning</span>
              <h3 className="text-[20px] font-bold text-on-surface">确认删除</h3>
            </div>
            
            <p className="text-[14px] text-on-surface-variant mb-6 leading-relaxed">
              确定要删除“<span className="font-bold text-on-surface">{deleteTarget.title}</span>”的识别历史吗？此操作无法撤销。
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl text-[14px] font-bold bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors border border-outline-variant/30 active:scale-95"
                id="cancel-delete-btn"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-[14px] font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm hover:shadow-md transition-all active:scale-95"
                id="confirm-delete-btn"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="history" onNavigate={onNavigate} />
    </div>
  );
}


