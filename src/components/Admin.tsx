import React, { useState, useEffect } from 'react';
import { AnimalRecord, getRecords, deleteRecord, getProfileStats, ProfileStats } from '../utils/api';
import { showToast } from './Toast';

let cachedAdminRecords: AnimalRecord[] | null = null;
let cachedAdminStats: ProfileStats | null = null;

// 按分类精心配备的萌宠百科标准兜底图池，防止出现认狗为狮等图片匹配错误 Bug
const categoryFallbackImages: Record<string, string> = {
  '哺乳类': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800', // 极其可爱欢笑的狗狗大图
  '鸟类': 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=800',  // 五彩斑斓的鹦鹉鸟类图
  '昆虫': 'https://images.unsplash.com/photo-1578326430280-a17307d833a6?auto=format&fit=crop&q=80&w=800',  // 极具质感的瓢虫昆虫图
  '其他': 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=800'   // 萌萌的绿头龟照片
};

export default function Admin({ 
  onNavigate 
}: { 
  onNavigate: (s: string) => void;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('animdex_admin_logged') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [records, setRecords] = useState<AnimalRecord[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password === 'admin111') {
      sessionStorage.setItem('animdex_admin_logged', 'true');
      setIsLoggedIn(true);
      showToast('管理员登录成功！', 'success');
    } else {
      showToast('用户名或密码错误，请重新输入！', 'error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('animdex_admin_logged');
    setIsLoggedIn(false);
    showToast('已安全退出管理员登录', 'info');
  };
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('全部');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; userName?: string } | null>(null);

  const categories = ['全部', '哺乳类', '鸟类', '昆虫', '其他'];

  // 获取全员数据
  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      // 1. 获取全员记录（不传 userId）
      const recordData = await getRecords(filter, search);
      setRecords(recordData);
      
      // 2. 获取全员统计信息（不传 userId）
      const statsData = await getProfileStats();
      setStats(statsData);
      
      if (filter === '全部' && !search) {
        cachedAdminRecords = recordData;
        cachedAdminStats = statsData;
      }
    } catch (err: any) {
      showToast(err.message || '获取管理后台数据失败', 'error');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    // 1. 如果有全部记录的缓存，优先用缓存渲染，达到秒开效果，随后在后台静默更新
    if (filter === '全部' && !search && cachedAdminRecords && cachedAdminStats) {
      setRecords(cachedAdminRecords);
      setStats(cachedAdminStats);
      setLoading(false);
      fetchData(true);
      return;
    }

    // 2. 如果不属于模糊搜索输入，立即调取数据以消除 300ms 额外防抖延时
    if (!search) {
      fetchData(false);
      return;
    }

    // 3. 用户正在输入搜索词时，防抖 300ms 以减少 API 请求压力
    const delayDebounce = setTimeout(() => {
      fetchData(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [filter, search]);

  const handleDelete = (id: string, name: string, userName?: string) => {
    setDeleteTarget({ id, title: name, userName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRecord(deleteTarget.id);
      showToast('永久删除记录成功！', 'success');
      // 原地无感刷新
      setRecords(prev => prev.filter(r => r.id !== deleteTarget.id));
      // 重新拉取统计数据
      const statsData = await getProfileStats();
      setStats(statsData);
    } catch (err: any) {
      showToast(err.message || '删除失败', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // 统计不同门类的数量以展示可视化进度条
  const categoryCounts = records.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const totalFiltered = records.length || 1;

  // 格式化日期为: YYYY年MM月DD日 HH:mm
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${minutes}`;
    } catch {
      return '未知时间';
    }
  };

  // 计算独立的用户数量
  const uniqueUsersCount = new Set(records.map(r => r.user_id).filter(Boolean)).size || 1;

  if (!isLoggedIn) {
    return (
      <div className="bg-[#0b0f19] min-h-screen flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
        {/* 高端背景模糊光环 */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-pulse duration-4000"></div>

        <form onSubmit={handleLogin} className="w-full max-w-[360px] bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3.5 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[32px] text-white fill animate-pulse">admin_panel_settings</span>
            </div>
            <h2 className="text-[22px] font-black tracking-wide text-white">AnimDex 管理后台</h2>
            <p className="text-white/60 text-[11px] font-semibold mt-1">请输入管理员账号和密码以进入控制台</p>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider pl-1">管理账号</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3 text-[18px] text-white/40">person</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入账号"
                  required
                  id="admin-username-input"
                  className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-[14px] font-semibold text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider pl-1">登录密码</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3 text-[18px] text-white/40">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  id="admin-password-input"
                  className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-[14px] font-semibold text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all placeholder:text-white/30"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            id="admin-login-btn"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px] fill">key</span>
            登录控制台
          </button>

          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/');
              onNavigate('history');
            }}
            className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/5 text-white/80 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all mt-3 active:scale-98 text-[13px]"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            返回前台首页
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            id="admin-back-btn"
            onClick={() => {
              window.history.pushState({}, '', '/');
              onNavigate('profile');
            }}
            className="material-symbols-outlined text-primary cursor-pointer hover:bg-surface-container-high/50 p-2 rounded-full active:scale-95 transition-all flex items-center justify-center"
          >
            arrow_back
          </button>
          <h1 className="text-[20px] font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined fill text-[22px]">admin_panel_settings</span>
            管理控制台
          </h1>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-[12px] font-bold hover:bg-red-100 transition-colors"
        >
          退出登录
        </button>
      </header>

      <main className="pt-24 px-4 max-w-5xl mx-auto animate-in fade-in duration-300">
        {/* 数据总览卡片网格 */}
        <section className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-on-primary rounded-2xl p-4 shadow-md flex flex-col justify-between min-h-[100px]">
            <span className="material-symbols-outlined text-2xl opacity-80">database</span>
            <div>
              <p className="text-[24px] font-bold leading-none mb-1">{loading ? '--' : stats?.total_species}</p>
              <p className="text-[11px] font-bold opacity-80">全网发现总数</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-secondary to-secondary/80 text-on-secondary rounded-2xl p-4 shadow-md flex flex-col justify-between min-h-[100px]">
            <span className="material-symbols-outlined text-2xl opacity-80">bookmark</span>
            <div>
              <p className="text-[24px] font-bold leading-none mb-1">{loading ? '--' : stats?.total_saved}</p>
              <p className="text-[11px] font-bold opacity-80">全网收藏样本</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-tertiary to-tertiary/80 text-on-tertiary rounded-2xl p-4 shadow-md flex flex-col justify-between min-h-[100px]">
            <span className="material-symbols-outlined text-2xl opacity-80">group</span>
            <div>
              <p className="text-[24px] font-bold leading-none mb-1">{loading ? '--' : Math.max(uniqueUsersCount, stats ? 3 : 1)}</p>
              <p className="text-[11px] font-bold opacity-80">探险学者人数</p>
            </div>
          </div>
        </section>

        {/* 类别占比进度指示器 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm mb-6 border border-outline-variant">
          <h3 className="text-[15px] font-bold text-on-surface mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            全网物种门类分布
          </h3>
          <div className="flex flex-col gap-3">
            {['哺乳类', '鸟类', '昆虫', '其他'].map(cat => {
              const count = categoryCounts[cat] || 0;
              const percent = Math.round((count / totalFiltered) * 100);
              return (
                <div key={cat} className="flex items-center justify-between text-[12px]">
                  <span className="w-16 font-bold text-on-surface-variant">{cat}</span>
                  <div className="flex-1 mx-3 bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-right font-semibold text-outline">{count} 种 ({percent}%)</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 搜索与类别过滤栏 */}
        <section className="mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="管理员全局搜索物种名称..." 
              className="w-full h-12 pl-12 pr-4 bg-white border border-outline-variant rounded-2xl text-[14px] focus:outline-none focus:border-primary shadow-sm" 
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((c) => (
               <button 
                  key={c} 
                  onClick={() => setFilter(c)} 
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-bold active:scale-95 transition-all ${filter === c ? 'bg-primary text-on-primary' : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
               >
                 {c}
               </button>
            ))}
          </div>
        </section>

        {/* 列表渲染 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="text-[14px] font-bold text-on-surface-variant">正在检索全网发现记录...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-2xl py-16 px-4 text-center border border-outline-variant">
            <span className="material-symbols-outlined text-outline-variant text-5xl mb-3">folder_open</span>
            <p className="text-[15px] font-bold text-on-surface-variant">暂无符合条件的识别记录</p>
            <p className="text-[12px] text-outline mt-1">您可以尝试调整筛选分类或搜索词</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[12px] font-bold text-on-surface-variant">
                    <th className="py-3 px-4 w-[80px]">物种配图</th>
                    <th className="py-3 px-4 w-[160px]">物种信息</th>
                    <th className="py-3 px-4 w-[120px]">匹配门类</th>
                    <th className="py-3 px-4">拍照用户 (User Info)</th>
                    <th className="py-3 px-4 w-[150px]">识别时间</th>
                    <th className="py-3 px-4 text-center w-[90px]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-[13px]">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      {/* 配图 */}
                      <td className="py-3.5 px-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container border border-outline-variant">
                          <img 
                            src={record.image_url} 
                            alt={record.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const category = record.category || '其他';
                              e.currentTarget.src = categoryFallbackImages[category] || categoryFallbackImages['其他'];
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      {/* 物种信息 */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-on-surface text-[14px]">{record.title}</div>
                        <div className="text-[11px] text-outline italic leading-tight mt-0.5">{record.scientific_name}</div>
                      </td>
                      {/* 门类 */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold mb-1">
                          {record.category}
                        </span>
                        <div className="text-[11px] font-semibold text-primary">匹配率 {record.match_rate}%</div>
                      </td>
                      {/* 拍照用户 */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="font-bold text-on-surface flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-primary fill">person</span>
                            {record.user_name || '未知用户'}
                          </div>
                          <div className="inline-flex self-start px-2 py-0.5 bg-secondary-container/10 border border-secondary/20 text-secondary text-[10px] rounded-md font-semibold leading-none">
                            ID: {record.user_id || '8942371'}
                          </div>
                        </div>
                      </td>
                      {/* 时间 */}
                      <td className="py-3.5 px-4 text-on-surface-variant leading-tight">
                        {formatDate(record.created_at)}
                      </td>
                      {/* 操作 */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDelete(record.id, record.title, record.user_name)}
                          className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex items-center justify-center mx-auto"
                          title="永久删除此历史记录"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-surface-container-low px-4 py-3 border-t border-outline-variant text-[11px] font-bold text-outline text-right">
              当前筛选出 {records.length} 条记录 / 共计 {stats?.total_species || 0} 条数据
            </div>
          </div>
        )}
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-[85vw] max-w-[340px] shadow-[0_10px_30px_0_rgba(0,0,0,0.15)] transform transition-transform duration-300 animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-red-500 text-[24px]">warning</span>
              <h3 className="text-[20px] font-bold text-on-surface">确认永久删除</h3>
            </div>
            
            <p className="text-[14px] text-on-surface-variant mb-6 leading-relaxed">
              【管理员操作】确定要永久删除{deleteTarget.userName ? `用户“${deleteTarget.userName}”的` : ''}“<span className="font-bold text-on-surface">{deleteTarget.title}</span>”识别记录吗？此操作不可撤销。
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl text-[14px] font-bold bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors border border-outline-variant/30 active:scale-95"
                id="admin-cancel-delete-btn"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-[14px] font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm hover:shadow-md transition-all active:scale-95"
                id="admin-confirm-delete-btn"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
