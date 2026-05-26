import { useState, useEffect } from 'react';
import CameraScan from './components/CameraScan';
import MatchResult from './components/MatchResult';
import History from './components/History';
import Profile from './components/Profile';
import Admin from './components/Admin';
import ToastContainer from './components/Toast';
import { AnimalRecord } from './utils/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
      return 'admin';
    }
    return 'history';
  });
  const [currentRecord, setCurrentRecord] = useState<AnimalRecord | null>(null);
  const [localImage, setLocalImage] = useState<string | null>(null);

  // 初始化多用户模拟标识与监听 URL 路径
  useEffect(() => {
    const handleLocationCheck = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
        setCurrentScreen('admin');
      }
    };

    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);

    if (!localStorage.getItem('animdex_user_id')) {
      const randomId = String(Math.floor(1000000 + Math.random() * 9000000));
      const randomNames = ['野外探险家', '森林研究员', '科普学者', '自然摄影师', '走山人'];
      const chosenName = `${randomNames[Math.floor(Math.random() * randomNames.length)]}_${randomId.slice(-4)}`;
      
      localStorage.setItem('animdex_user_id', randomId);
      localStorage.setItem('animdex_user_name', chosenName);
    }

    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  const handleNavigateToResult = (record: AnimalRecord, localImg?: string) => {
    setCurrentRecord(record);
    setLocalImage(localImg || null);
    setCurrentScreen('result');
  };

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen">
      {/* 全局自定义 Toast 容器 */}
      <ToastContainer />
      
      {currentScreen === 'camera' && (
        <CameraScan 
          onCapture={(record, img) => handleNavigateToResult(record, img)} 
          onNavigate={setCurrentScreen} 
        />
      )}
      
      {currentScreen === 'result' && (
        <MatchResult 
          record={currentRecord}
          localImage={localImage}
          onBack={() => setCurrentScreen('camera')} 
          onNavigate={setCurrentScreen} 
        />
      )}
      
      {currentScreen === 'history' && (
        <History 
          onSelectRecord={(record) => handleNavigateToResult(record)}
          onNavigate={setCurrentScreen} 
        />
      )}
      
      {currentScreen === 'profile' && (
        <Profile 
          onNavigate={setCurrentScreen} 
        />
      )}

      {currentScreen === 'admin' && (
        <Admin 
          onNavigate={setCurrentScreen} 
        />
      )}
    </div>
  );
}

