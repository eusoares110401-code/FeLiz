import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import LessonMap from './components/LessonMap';
import LessonPlayer from './components/LessonPlayer';
import ParentDashboard from './components/ParentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Achievements from './components/Achievements';
import Onboarding from './components/Onboarding';
import { AppView, UserProfile, SubjectType } from './types';
import { Crown, ArrowLeft, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { STRIPE_CHECKOUT_URL, MOCK_CHILD } from './constants';
import { playSound } from './services/soundService';
import { dbService } from './services/databaseService';

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.LANDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeSubject, setActiveSubject] = useState<SubjectType | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); 

  // 1. INITIALIZATION & SESSION CHECK
  useEffect(() => {
    const initApp = async () => {
        try {
            const currentUser = dbService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                setView(AppView.MAP);
            } else {
                setView(AppView.LANDING);
            }

            const params = new URLSearchParams(window.location.search);
            if (params.get('success') === 'true' && currentUser) {
                setIsProcessing(true);
                const updatedUser = await dbService.activatePremium(currentUser.email);
                setUser(updatedUser);
                alert("Pagamento Confirmado! Bem-vindo ao Plano Premium! 🌟");
                window.history.replaceState({}, document.title, window.location.pathname);
                setIsProcessing(false);
            }
        } catch (error) {
            console.error("Init Error:", error);
            dbService.logout();
            setUser(null);
            setView(AppView.LANDING);
        } finally {
            setIsInitializing(false);
        }
    };
    initApp();
  }, []);

  const handleAuthComplete = (profile: UserProfile) => {
    setUser(profile);
    setView(AppView.MAP);
  };

  const handleStartLesson = (subject: SubjectType) => {
    setActiveSubject(subject);
    setView(AppView.LESSON);
  };

  const safeAction = (action: () => void) => {
    try { playSound.click(); } catch(e) {}
    action();
  };

  const handleGoToStripe = () => {
    safeAction(() => {
        const dynamicLink = localStorage.getItem('feliz_stripe_link');
        let finalLink = dynamicLink || STRIPE_CHECKOUT_URL;
        window.open(finalLink, '_blank');
        setView(AppView.PREMIUM_WALL); 
    });
  };

  const handleManualCheckPayment = async () => {
      playSound.click();
      if (!user) return;
      setIsProcessing(true);
      try {
          const updatedUser = await dbService.activatePremium(user.email);
          setUser(updatedUser);
          alert("Assinatura ativada com sucesso!");
          setView(AppView.MAP);
      } catch (e) {
          alert("Erro ao verificar pagamento.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleLessonComplete = async (xp: number, completedItem?: string) => {
    if (user) {
        try {
            if (completedItem && completedItem.length === 1) {
                const updatedUser = await dbService.markLetterAsMastered(user.email, completedItem);
                setUser(updatedUser);
            } else {
                const updatedUser = await dbService.updateUserProgress(user.email, xp);
                setUser(updatedUser);
            }
        } catch(e) {
            console.error("Save Progress Error", e);
        }
    }
    setActiveSubject(null);
    setView(AppView.MAP);
  };

  const handleLogout = () => {
    dbService.logout();
    setUser(null);
    setView(AppView.LANDING);
  };

  const renderContent = () => {
    if (isInitializing || isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-brand-background">
                <Loader2 className="w-16 h-16 text-brand-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold text-gray-700">{isProcessing ? "Sincronizando..." : "Carregando..."}</h2>
            </div>
        );
    }

    switch (currentView) {
      case AppView.LANDING: return <LandingPage onStart={() => setView(AppView.ONBOARDING)} />;
      case AppView.ONBOARDING: return <Onboarding onComplete={handleAuthComplete} onBack={() => setView(AppView.LANDING)} />;
      case AppView.MAP:
        if (!user) return <LandingPage onStart={() => setView(AppView.ONBOARDING)} />;
        return <LessonMap onSelectLesson={handleStartLesson} user={user} onPremiumClick={() => setView(AppView.PREMIUM_WALL)} />;
      case AppView.ACHIEVEMENTS:
        if (!user) return null;
        return <Achievements user={user} onBack={() => setView(AppView.MAP)} />;
      case AppView.PARENT_DASHBOARD:
        if (!user) return null;
        return <ParentDashboard child={user} onBack={() => setView(AppView.MAP)} onUpdateUser={setUser} />;
      case AppView.ADMIN_DASHBOARD:
        return <AdminDashboard onBack={() => setView(user ? AppView.MAP : AppView.LANDING)} />;
      case AppView.PREMIUM_WALL:
         return (
             <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 animate-fade-in-up relative overflow-hidden bg-brand-background">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-gray-100 relative">
                    <div className="bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-sm shadow-inner"><Crown className="w-12 h-12 text-yellow-600" /></div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">FeLiz <span className="text-yellow-500">Premium</span></h2>
                    <p className="text-gray-500 mb-8">Desbloqueie o potencial máximo com o Quadrivium completo.</p>
                    <button onClick={handleGoToStripe} className="w-full bg-brand-secondary text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:scale-105 transition-all text-xl mb-4 flex items-center justify-center">Assinar Agora <ExternalLink className="ml-2 w-5 h-5"/></button>
                    <button onClick={handleManualCheckPayment} className="text-sm text-green-600 font-bold hover:text-green-700 underline mb-4">Já pagou? Clique aqui.</button>
                    <button onClick={() => safeAction(() => setView(AppView.MAP))} className="text-gray-400 font-bold hover:text-gray-600 flex items-center justify-center mx-auto mt-4"><ArrowLeft size={16} className="mr-1" /> Voltar</button>
                </div>
             </div>
         );
      case AppView.LESSON:
        if (!user || !activeSubject) {
            setTimeout(() => setView(AppView.MAP), 100);
            return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
        }
        return (
          <div className="absolute inset-0 bg-brand-background z-50">
             <LessonPlayer subject={activeSubject} user={user} onComplete={handleLessonComplete} onExit={() => setView(AppView.MAP)}/>
          </div>
        );
      default: return <div>View not found</div>;
    }
  };

  return (
    // Views that take full screen without Sidebar
    currentView === AppView.LESSON || 
    currentView === AppView.LANDING || 
    currentView === AppView.ONBOARDING ||
    currentView === AppView.PREMIUM_WALL ||
    isInitializing ? (
      <div className="min-h-screen bg-brand-background font-sans text-gray-800">
        {renderContent()}
      </div>
    ) : (
      <Layout 
        currentView={currentView} 
        setView={(view) => view === AppView.LANDING ? handleLogout() : setView(view)} 
        profile={user || { ...MOCK_CHILD, name: 'Convidado' }}
      >
        {renderContent()}
      </Layout>
    )
  );
};

export default App;