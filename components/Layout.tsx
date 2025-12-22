import React from 'react';
import { Map, Trophy, Settings, ShieldCheck, LogOut } from 'lucide-react';
import { AppView, ChildProfile } from '../types';
import { playSound } from '../services/soundService';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  profile: ChildProfile;
}

// Logo Component Reutilizável
const FeLizLogo = ({ size = 'normal' }: { size?: 'normal' | 'small' }) => (
  <div className="flex flex-col items-center">
    <div className={`relative flex items-baseline ${size === 'small' ? 'scale-75' : ''}`}>
      <span className="font-display font-extrabold text-4xl text-brand-primary tracking-tight">Fe</span>
      <span className="font-display font-extrabold text-4xl text-brand-secondary tracking-tight">Liz</span>
      {/* O Sorriso */}
      <svg className="absolute -bottom-2 left-0 w-full h-4 text-brand-accent" viewBox="0 0 60 15" fill="none">
         <path d="M 2 2 Q 30 15 58 2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
    {size === 'normal' && (
       <p className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase mt-2 ml-1">Education</p>
    )}
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, profile }) => {
  
  const handleNavClick = (action: () => void) => {
    try { playSound.click(); } catch(e) {}
    action();
  };

  return (
    <div className="min-h-screen bg-brand-background font-sans text-gray-800 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="bg-white md:w-72 md:flex-col flex-row flex justify-between md:justify-start items-center p-4 shadow-xl z-20 md:h-screen fixed bottom-0 w-full md:relative md:border-r border-gray-100">
        
        {/* Brand / Logo Area */}
        <div 
          className="hidden md:flex flex-col items-center mb-8 pt-6 w-full cursor-pointer hover:scale-105 transition-transform" 
          onClick={() => handleNavClick(() => setView(AppView.LANDING))}
        >
          <FeLizLogo />
        </div>

        {/* Navigation Items */}
        <div className="flex md:flex-col justify-around w-full md:space-y-3 md:px-2">
          <NavButton 
            active={currentView === AppView.MAP} 
            onClick={() => setView(AppView.MAP)} 
            icon={<Map />} 
            label="Amarelinha" 
            color="text-blue-500"
          />
           <NavButton 
            active={currentView === AppView.ACHIEVEMENTS}
            onClick={() => setView(AppView.ACHIEVEMENTS)} 
            icon={<Trophy />} 
            label="Conquistas" 
            color="text-yellow-500"
          />
          <NavButton 
            active={currentView === AppView.PARENT_DASHBOARD} 
            onClick={() => setView(AppView.PARENT_DASHBOARD)} 
            icon={<Settings />} 
            label="Pais" 
            color="text-gray-500"
          />
          
          {/* Admin Button - Visível para todos para facilitar o acesso (Demo) */}
          {/* Separator apenas Desktop */}
          <div className="hidden md:block md:mt-8 md:pt-8 md:border-t md:border-gray-100 w-full">
               <p className="text-xs font-bold text-gray-400 mb-2 px-4 uppercase">Administração</p>
          </div>
          
          <NavButton 
            active={currentView === AppView.ADMIN_DASHBOARD} 
            onClick={() => setView(AppView.ADMIN_DASHBOARD)} 
            icon={<ShieldCheck />} 
            label="Admin" 
            color="text-brand-accent"
          />
        </div>

        {/* Profile Summary (Desktop Bottom) */}
        <div className="hidden md:flex flex-col items-center mt-auto pt-6 border-t w-full bg-gray-50 p-4 rounded-xl">
           <div className="flex items-center w-full space-x-3">
             <img src={profile.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-brand-secondary" />
             <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{profile.name}</p>
                <p className="text-xs text-gray-500">Nível {profile.level}</p>
             </div>
             <button 
                onClick={() => handleNavClick(() => setView(AppView.LANDING))} 
                className="text-gray-400 hover:text-red-500 cursor-pointer"
                title="Sair"
             >
               <LogOut size={18} />
             </button>
           </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen pb-24 md:pb-0 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center p-3 bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
          <div className="flex items-center space-x-2">
             <FeLizLogo size="small" />
          </div>
          <div className="flex items-center space-x-2">
             <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full border border-orange-200">
                <span className="text-orange-500 font-bold text-sm mr-1">🔥</span>
                <span className="text-orange-700 font-bold text-sm">{profile.streak}</span>
             </div>
             <img src={profile.avatar} className="w-8 h-8 rounded-full border border-gray-200" />
          </div>
        </div>
        
        <div className="p-4 md:p-8 max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, color }: any) => {
  const handleClick = (e: any) => {
    try { playSound.click(); } catch(err) {}
    onClick(e);
  };

  return (
    <button 
      onClick={handleClick}
      className={`flex md:flex-row flex-col items-center md:space-x-3 p-2 md:px-4 md:py-3 rounded-2xl transition-all duration-200 w-full group cursor-pointer
        ${active 
          ? 'bg-white shadow-[0_4px_0_#e2e8f0] translate-y-[-2px] border-2 border-gray-100' 
          : 'hover:bg-gray-50 text-gray-400 hover:text-gray-600 border-2 border-transparent'
        }`}
    >
      <div className={`transition-transform duration-200 ${active ? color : 'text-gray-400 group-hover:text-gray-600'}`}>
        {React.cloneElement(icon, { 
          className: `w-6 h-6 ${active ? 'fill-current opacity-20' : ''}`, 
          strokeWidth: active ? 2.5 : 2 
        })}
      </div>
      <span className={`text-xs md:text-sm font-bold mt-1 md:mt-0 ${active ? 'text-gray-800' : ''}`}>{label}</span>
    </button>
  );
};

export default Layout;