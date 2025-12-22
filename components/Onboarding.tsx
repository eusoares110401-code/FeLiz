import React, { useState } from 'react';
import { calculateLearningPath } from '../services/recommendationService';
import { UserProfile } from '../types';
import { Brain, ChevronRight, Loader2, Sparkles, Image as ImageIcon, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { playSound } from '../services/soundService';
import { dbService } from '../services/databaseService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    parentEmail: '',
    password: '',
    childName: '',
    childAge: 4, 
    childAvatar: '', 
  });
  const [loading, setLoading] = useState(false);

  // STEP 1: Email Check
  const handleEmailSubmit = () => {
    playSound.click();
    if (!formData.parentEmail) return;
    
    // Na implementação real, não verificaríamos se o email existe aqui por segurança (user enumeration),
    // mas para UX deste app, podemos simular ou pular direto para senha.
    // Vamos assumir modo cadastro por padrão, se falhar o login, avisamos.
    setStep(2);
    setErrorMessage('');
  };

  // STEP 2: Login or Setup Password
  const handlePasswordSubmit = async () => {
     playSound.click();
     if (!formData.password) return;
     setLoading(true);
     setErrorMessage('');

     try {
         // Tenta Logar primeiro
         const user = await dbService.login(formData.parentEmail, formData.password);
         // Se sucesso, completa
         onComplete(user);
     } catch (e: any) {
         setLoading(false);
         // Se erro for "Usuário não encontrado", vamos para cadastro
         if (e.message.includes("não encontrado")) {
             setIsLoginMode(false);
             setStep(3); // Cadastro de criança
         } else {
             // Senha errada
             setIsLoginMode(true);
             setErrorMessage("Senha incorreta ou erro de conexão.");
         }
     }
  };

  // STEP 3: Complete Signup
  const handleSignupComplete = async () => {
      playSound.click();
      if (!formData.childName) return;

      setStep(4);
      setLoading(true);
      
      try {
        const newUser = await dbService.register({
            parentEmail: formData.parentEmail,
            password: formData.password,
            childName: formData.childName,
            childAge: formData.childAge,
            avatar: formData.childAvatar
        });
        
        setTimeout(() => {
            onComplete(newUser);
        }, 1500); // Visual delay for effect

      } catch (e: any) {
          setStep(2); // Back to password/email
          setErrorMessage(e.message || "Erro ao criar conta.");
          setLoading(false);
      }
  };

  const handleBackStep = () => {
      playSound.click();
      setStep(1);
      setErrorMessage('');
      setFormData({...formData, password: ''});
  };

  const handleGoHome = () => {
      playSound.click();
      onBack();
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-sky-100 via-indigo-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur max-w-md w-full rounded-[2rem] shadow-2xl overflow-hidden p-8 relative border border-white">
        
        {/* Navigation Back */}
        <button 
            onClick={step === 1 ? handleGoHome : handleBackStep}
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100"
            title="Voltar"
        >
            <ArrowLeft size={20} />
        </button>

        {/* Header Visuals */}
        {step < 4 && (
             <div className="mb-8 text-center mt-6">
                 <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 rounded-2xl mb-4 text-3xl shadow-sm">
                    {step === 1 ? '📧' : step === 2 ? '🔑' : '👶'}
                 </div>
                 <h2 className="text-2xl font-display font-bold text-gray-800">
                     {step === 1 ? 'Bem-vindo(a)!' : 
                      step === 2 ? 'Acesso Seguro' : 
                      'Quem vai aprender?'}
                 </h2>
                 <p className="text-gray-500 text-sm mt-1">
                     {step === 1 ? 'Digite seu email para entrar ou cadastrar.' : 
                      step === 2 ? 'Digite sua senha.' : 
                      'Vamos personalizar a experiência.'}
                 </p>
             </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <label className="block text-sm font-bold text-gray-700 mb-2">E-mail dos Pais</label>
            <input 
              type="email" 
              className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-brand-primary outline-none transition-colors mb-6 bg-white text-gray-900 placeholder-gray-400"
              placeholder="exemplo@email.com"
              value={formData.parentEmail}
              onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
            />
            
            <button 
              onClick={handleEmailSubmit}
              disabled={!formData.parentEmail.includes('@')}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Continuar <ChevronRight className="ml-2" />
            </button>
          </div>
        )}

        {/* Step 2: Password */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <label className="block text-sm font-bold text-gray-700 mb-2">
                Senha
            </label>
            <div className="relative mb-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                type="password" 
                className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 text-lg focus:border-brand-primary outline-none transition-colors bg-white text-gray-900 placeholder-gray-400"
                placeholder="******"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
            </div>
            {errorMessage && <p className="text-red-500 text-sm mb-4 font-bold">{errorMessage}</p>}
            
            <button 
              onClick={handlePasswordSubmit}
              disabled={loading || formData.password.length < 3}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Entrar / Criar'} {!loading && <ChevronRight className="ml-2" />}
            </button>
            
            <button 
                onClick={handleBackStep} 
                className="w-full text-center text-gray-400 text-sm mt-4 hover:text-gray-600"
            >
                Trocar Email
            </button>
          </div>
        )}

        {/* Step 3: Child Info (Signup Only) */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Criança</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-gray-200 rounded-xl p-3 text-lg focus:border-brand-primary outline-none bg-white text-gray-900 placeholder-gray-400"
                  value={formData.childName}
                  onChange={(e) => setFormData({...formData, childName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Link da Foto (Opcional)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 text-sm focus:border-brand-primary outline-none bg-white text-gray-900 placeholder-gray-400"
                    placeholder="https://..."
                    value={formData.childAvatar}
                    onChange={(e) => setFormData({...formData, childAvatar: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Idade: <span className="text-brand-primary text-xl">{formData.childAge} anos</span></label>
                <input 
                  type="range" 
                  min="4" 
                  max="12" 
                  step="1"
                  className="w-full accent-brand-secondary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.childAge}
                  onChange={(e) => setFormData({...formData, childAge: parseInt(e.target.value)})}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
                  <span>4 anos</span>
                  <span>12 anos</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSignupComplete}
              disabled={loading || !formData.childName}
              className="w-full bg-brand-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-yellow-600 transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Finalizar Cadastro'} {!loading && <Sparkles className="ml-2" />}
            </button>
          </div>
        )}

        {/* Step 4: Loading Screen */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center animate-fade-in-up py-8">
            <Loader2 className="w-16 h-16 text-brand-primary animate-spin mb-6" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Configurando banco de dados...</h3>
            <p className="text-gray-600 mb-6 text-sm">Criando perfil, gerando chaves de segurança e preparando a IA.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;