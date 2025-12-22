import React from 'react';
import { SubjectType, ChildProfile } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { Lock, Cloud, Crown, Star, Trees, Bird, ChevronRight, Play } from 'lucide-react';
import { playSound } from '../services/soundService';

interface LessonMapProps {
  onSelectLesson: (subject: SubjectType) => void;
  user: ChildProfile;
  onPremiumClick: () => void;
}

const LessonMap: React.FC<LessonMapProps> = ({ onSelectLesson, user, onPremiumClick }) => {
  // Configuração Visual dos Níveis (Posição X/Y para criar o caminho sinuoso)
  // O mapa é renderizado de baixo para cima.
  const levels = [
    { subject: SubjectType.GRAMMAR, id: 1, type: 'start', premium: false, x: 50, y: 0 },
    { subject: SubjectType.ARITHMETIC, id: 2, type: 'node', premium: false, x: 25, y: 15 },
    { subject: SubjectType.LOGIC, id: 3, type: 'node', premium: true, x: 75, y: 25 },
    { subject: SubjectType.MUSIC, id: 4, type: 'node', premium: true, x: 50, y: 40 },
    { subject: SubjectType.GEOMETRY, id: 5, type: 'node', premium: true, x: 20, y: 55 },
    { subject: SubjectType.RHETORIC, id: 6, type: 'node', premium: true, x: 80, y: 70 },
    { subject: SubjectType.ASTRONOMY, id: 7, type: 'boss', premium: true, x: 50, y: 90 },
  ];

  // Encontra o próximo nível jogável para o botão de ação rápida
  // Se todos desbloqueados, joga o último
  const getNextPlayableLevel = () => {
    // Pega o último desbloqueado
    const lastUnlockedSubject = user.unlockedSubjects[user.unlockedSubjects.length - 1];
    
    // Tenta achar o objeto do nível correspondente
    const lastLevelObj = levels.find(l => l.subject === lastUnlockedSubject);
    
    // Se achou, verifica se é o último do mapa
    if (lastLevelObj) {
        // Logica simples: Se for premium e não tem premium, retorna ele (vai triggerar modal).
        // Se já está desbloqueado e jogável, retorna ele mesmo (replay) ou o próximo se existisse logica de progresso linear estrita
        return lastLevelObj; 
    }
    
    // Fallback absoluto
    return levels[0];
  };

  const nextLevel = getNextPlayableLevel();

  const handleQuickStart = () => {
      playSound.click();
      if (!nextLevel) return;

      if (nextLevel.premium && !user.isPremium) {
          onPremiumClick();
      } else {
          onSelectLesson(nextLevel.subject as SubjectType);
      }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200 via-sky-50 to-green-50 pb-32">
      
      {/* Background Decorativo (Fixed) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-20 left-10 text-green-200 opacity-60"><Trees size={120} /></div>
        <div className="absolute top-40 right-10 text-green-200 opacity-60"><Trees size={100} /></div>
        <Cloud className="absolute top-20 left-10 text-white w-24 h-24 opacity-80 animate-float" />
        <Cloud className="absolute top-40 right-20 text-white w-16 h-16 opacity-60 animate-float" style={{ animationDelay: '2s' }} />
        <Bird className="absolute top-32 left-1/3 text-sky-400 w-8 h-8 animate-bounce" />
      </div>

      {/* Header do Perfil */}
      <div className="relative z-20 w-full max-w-xl mx-auto pt-8 px-6 mb-8 flex justify-between items-center animate-fade-in-up">
        <div className="bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-white/60 shadow-sm">
           <h2 className="text-2xl font-display font-bold text-gray-800">Mapa do Mundo</h2>
           <p className="text-gray-600 text-sm font-bold">Nível {user.level} • {user.xp} XP</p>
        </div>
        
        {/* Botão de Status PRO - Agora clicável */}
        <button 
            onClick={() => {
                playSound.click();
                onPremiumClick();
            }}
            className={`
                px-3 py-1.5 rounded-full border shadow-sm flex items-center space-x-2 transition-all active:scale-95 cursor-pointer group
                ${user.isPremium ? 'bg-brand-dark border-brand-dark' : 'bg-white/80 backdrop-blur border-white hover:border-yellow-400 hover:bg-yellow-50'}
            `}
        >
            <span className={user.isPremium ? 'text-yellow-400' : 'text-yellow-500'}>👑</span>
            <span className={`font-bold text-sm ${user.isPremium ? 'text-white' : 'text-gray-700'}`}>
                {user.isPremium ? 'Membro PRO' : 'Grátis'}
            </span>
            {!user.isPremium && (
                <div className="flex items-center ml-1 bg-brand-secondary text-white text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                    UPGRADE <ChevronRight size={10} />
                </div>
            )}
        </button>
      </div>

      {/* Área do Mapa (Scrollable container logic happens in parent, this is the content) */}
      <div className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col-reverse items-center justify-end py-10" style={{ minHeight: '800px' }}>
         
         {/* O Caminho SVG (Desenhado atrás dos botões) */}
         <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.4 }}>
            {/* Um caminho pontilhado simples conectando os pontos centralizados */}
            <path 
              d="M 50% 90% C 90% 80%, 10% 70%, 50% 50% S 90% 20%, 50% 5%" 
              stroke="#cbd5e1" 
              strokeWidth="8" 
              strokeDasharray="15, 15"
              fill="none" 
              strokeLinecap="round"
            />
         </svg>

         {levels.map((level, index) => {
            const config = SUBJECT_CONFIG[level.subject as SubjectType];
            const isUnlocked = user.unlockedSubjects.includes(level.subject);
            const isPremiumLocked = level.premium && !user.isPremium;
            const isPlayable = isUnlocked && !isPremiumLocked;
            const isNext = isPlayable && index === user.unlockedSubjects.length - 1; // Simplificação visual

            // Renderizar o Botão do Nível
            return (
               <div 
                  key={level.id}
                  className={`relative mb-12 transform transition-all duration-300 ${isNext ? 'scale-110' : 'scale-100'}`}
                  style={{ 
                     // Pequeno offset horizontal para simular o caminho sinuoso sem complexidade de layout absoluto total
                     transform: `translateX(${level.id % 2 === 0 ? '-30px' : (level.id === 1 || level.id === 4 || level.id === 7 ? '0px' : '30px')})` 
                  }}
               >
                  <button
                    onClick={() => {
                        playSound.click();
                        if (isPremiumLocked) onPremiumClick();
                        else if (isPlayable) onSelectLesson(level.subject);
                    }}
                    className={`
                       w-20 h-20 md:w-24 md:h-24 rounded-full border-b-8 flex flex-col items-center justify-center shadow-xl transition-all relative group cursor-pointer
                       ${isPlayable 
                          ? `${config.color} border-black/20 active:border-b-0 active:translate-y-2` 
                          : 'bg-white border-gray-300 cursor-not-allowed'}
                       ${isPremiumLocked ? 'hover:scale-105 active:scale-95 cursor-pointer bg-gray-100' : ''}
                    `}
                  >
                     {/* Icone */}
                     <div className={`text-white drop-shadow-md ${isPlayable ? 'group-hover:scale-110 transition-transform' : 'opacity-30 text-gray-400'}`}>
                        {isPremiumLocked ? <Crown size={32} className="text-yellow-300 animate-pulse-slow" /> : 
                         !isUnlocked ? <Lock size={28} /> : 
                         config.icon}
                     </div>

                     {/* Estrelas de progresso (Decorativo) */}
                     {isPlayable && !isPremiumLocked && (
                        <div className="absolute -bottom-10 flex space-x-1">
                           <Star size={12} className="text-yellow-400 fill-current" />
                           <Star size={12} className="text-yellow-400 fill-current" />
                           <Star size={12} className="text-gray-300" />
                        </div>
                     )}
                  </button>
                  
                  {/* Label flutuante */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 bg-white px-3 py-1 rounded-lg shadow-sm whitespace-nowrap z-20 pointer-events-none border border-gray-100">
                     <span className="font-bold text-xs text-gray-700 uppercase tracking-wider">{config.label}</span>
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-gray-100"></div>
                  </div>

                  {/* Avatar do Usuário (Se for o nível atual) */}
                  {isPlayable && index === user.unlockedSubjects.length - 1 && ( // Lógica simplificada de "onde estou"
                     <div className="absolute -right-4 top-0 w-12 h-12 bg-white p-1 rounded-full shadow-lg animate-bounce z-30 pointer-events-none ring-2 ring-white">
                        <img src={user.avatar} className="w-full h-full rounded-full bg-brand-background" alt="Eu" />
                     </div>
                  )}

               </div>
            );
         })}

         {/* Base Start Line */}
         <div className="mt-8 text-center opacity-50">
            <div className="text-xs font-bold uppercase tracking-widest text-green-700 bg-white/40 px-3 py-1 rounded-full">Início da Jornada</div>
         </div>

      </div>

      {/* Floating Action Button (FAB) para Continuar Aventura */}
      <div className="fixed bottom-24 md:bottom-8 right-6 z-50">
        <button 
           onClick={handleQuickStart}
           className="bg-gradient-to-r from-brand-secondary to-orange-500 text-white p-4 rounded-full shadow-2xl border-4 border-white animate-bounce-sm hover:scale-110 transition-transform group flex items-center"
        >
            <Play fill="currentColor" className="w-8 h-8" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap font-bold">
                Continuar Aventura
            </span>
        </button>
      </div>

    </div>
  );
};

export default LessonMap;