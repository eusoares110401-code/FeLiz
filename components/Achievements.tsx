import React from 'react';
import { UserProfile } from '../types';
import { Trophy, Star, Zap, BookOpen, Crown, Medal, Lock, ArrowLeft } from 'lucide-react';
import { playSound } from '../services/soundService';

interface AchievementsProps {
  user: UserProfile;
  onBack: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ user, onBack }) => {
  
  // Definição das Medalhas e Regras de Desbloqueio
  const badges = [
    {
      id: 'first_step',
      title: 'Primeiros Passos',
      description: 'Complete sua primeira lição (Ganhe XP).',
      icon: <Star size={32} />,
      color: 'bg-yellow-400',
      isUnlocked: user.xp > 0
    },
    {
      id: 'on_fire',
      title: 'Em Chamas',
      description: 'Mantenha uma ofensiva de 3 dias seguidos.',
      icon: <Zap size={32} />,
      color: 'bg-orange-500',
      isUnlocked: user.streak >= 3
    },
    {
      id: 'abc_master',
      title: 'Mestre do ABC',
      description: 'Aprenda 5 letras do alfabeto.',
      icon: <BookOpen size={32} />,
      color: 'bg-blue-500',
      isUnlocked: (user.masteredLetters?.length || 0) >= 5
    },
    {
      id: 'dedicated',
      title: 'Super Dedicado',
      description: 'Alcance o Nível 5.',
      icon: <Medal size={32} />,
      color: 'bg-purple-500',
      isUnlocked: user.level >= 5
    },
    {
      id: 'premium_club',
      title: 'Clube FeLiz',
      description: 'Torne-se um membro Premium.',
      icon: <Crown size={32} />,
      color: 'bg-brand-secondary',
      isUnlocked: user.isPremium
    },
    {
      id: 'xp_millionaire',
      title: 'Lenda Viva',
      description: 'Alcance 1000 XP.',
      icon: <Trophy size={32} />,
      color: 'bg-emerald-500',
      isUnlocked: user.xp >= 1000
    }
  ];

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const progressPercent = (unlockedCount / badges.length) * 100;

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center mb-6">
         <button 
            onClick={() => { playSound.click(); onBack(); }}
            className="bg-white p-2 rounded-full shadow-sm border border-gray-100 mr-4 hover:bg-gray-50 transition"
         >
            <ArrowLeft className="text-gray-600" />
         </button>
         <div>
            <h2 className="text-3xl font-display font-bold text-gray-800">Sala de Troféus</h2>
            <p className="text-gray-500 text-sm">Sua coleção de vitórias!</p>
         </div>
      </div>

      {/* Resumo */}
      <div className="bg-gradient-to-r from-brand-secondary to-orange-400 rounded-3xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12">
            <Trophy size={120} />
         </div>
         <div className="relative z-10">
            <div className="flex items-end space-x-2 mb-2">
               <span className="text-5xl font-display font-bold">{unlockedCount}</span>
               <span className="text-xl font-bold opacity-80 mb-2">/ {badges.length}</span>
            </div>
            <p className="font-bold text-orange-100 mb-4 uppercase tracking-wider text-xs">Medalhas Desbloqueadas</p>
            
            {/* Barra de Progresso Geral */}
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
               <div 
                  className="h-full bg-white transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
               />
            </div>
         </div>
      </div>

      {/* Grid de Medalhas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-20 overflow-y-auto">
         {badges.map((badge) => (
            <div 
               key={badge.id}
               className={`
                  relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center
                  ${badge.isUnlocked 
                     ? 'bg-white border-white shadow-md scale-100' 
                     : 'bg-gray-50 border-gray-100 opacity-60 grayscale hover:grayscale-0'}
               `}
            >
               {/* Ícone da Medalha */}
               <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner relative
                  ${badge.isUnlocked ? badge.color : 'bg-gray-200'}
               `}>
                  <div className="text-white drop-shadow-md transform scale-110">
                     {badge.isUnlocked ? badge.icon : <Lock size={24} className="text-gray-400" />}
                  </div>
                  {badge.isUnlocked && (
                     <div className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                     </div>
                  )}
               </div>

               <h3 className={`font-bold font-display text-lg mb-1 ${badge.isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                  {badge.title}
               </h3>
               <p className="text-xs text-gray-500 leading-snug">
                  {badge.description}
               </p>
            </div>
         ))}
      </div>
    </div>
  );
};

export default Achievements;