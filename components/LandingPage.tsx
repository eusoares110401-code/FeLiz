import React, { useState, useEffect, useMemo } from 'react';
import { Play, Brain, Sparkles, ChevronRight, ChevronLeft, CheckCircle, Heart, Star, Shield, X, Mail, Info, Camera, ArrowRight, Library, Music, Microscope, BookOpen, Calculator, Shapes, Telescope, Quote } from 'lucide-react';
import { SUBJECT_CONFIG } from '../constants';
import { SubjectType } from '../types';
import { playSound } from '../services/soundService';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeModal, setActiveModal] = useState<'about' | 'press' | 'privacy' | 'contact' | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slides para o Carrossel Explicativo baseados no SUBJECT_CONFIG
  const slides = useMemo(() => [
    {
      id: SubjectType.GRAMMAR,
      title: "1. Gramática (Absorver)",
      config: SUBJECT_CONFIG[SubjectType.GRAMMAR],
    },
    {
      id: SubjectType.LOGIC,
      title: "2. Lógica (Conectar)",
      config: SUBJECT_CONFIG[SubjectType.LOGIC],
    },
    {
      id: SubjectType.RHETORIC,
      title: "3. Retórica (Expressar)",
      config: SUBJECT_CONFIG[SubjectType.RHETORIC],
    }
  ], []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  // Handler centralizado que inicializa o som
  const handleStartApp = () => {
    playSound.init();
    playSound.click();
    onStart();
  };

  const handleClick = (action: () => void) => {
    try { playSound.click(); } catch (e) {}
    action();
  };

  const scrollToSection = (id: string) => {
    handleClick(() => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  };

  const renderModalContent = () => {
     switch (activeModal) {
      case 'about':
        return (
          <div className="space-y-8">
            <div className="relative">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-brand-secondary/20 rounded-full blur-2xl"></div>
                <div className="flex items-center space-x-4 relative z-10">
                <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-4 rounded-2xl text-white shadow-lg transform -rotate-3">
                    <Heart size={32} fill="currentColor" />
                </div>
                <div>
                    <h3 className="text-3xl font-display font-bold text-gray-900">O Legado da Liz</h3>
                    <p className="text-gray-500 font-medium">Como o amor de um pai virou código.</p>
                </div>
                </div>
            </div>

            <div className="prose prose-blue text-gray-600 leading-relaxed text-lg">
                <p>
                    Tudo começou em uma noite comum, observando minha filha, <strong>Liz</strong>, tentando usar um aplicativo "educativo". 
                    Percebi algo que me incomodou: o app não queria ensinar, queria apenas <span className="text-red-500 font-bold">viciá-la</span> com luzes piscantes e recompensas vazias.
                </p>
                <p>
                    Eu não queria que a infância dela fosse roubada por algoritmos de dopamina. Eu queria que ela sentisse a 
                    verdadeira alegria da descoberta, a satisfação de entender como o mundo funciona.
                </p>
            </div>

            <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10 group-hover:rotate-12 transition-transform duration-700">
                    <Sparkles size={150} />
                </div>
                <p className="font-bold text-gray-400 text-xs uppercase tracking-[0.2em] mb-4">A Alquimia do Nome</p>
                
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="text-5xl md:text-6xl font-display font-bold text-gray-800 tracking-tight flex items-baseline">
                        <span className="text-brand-primary drop-shadow-sm">Fe</span>
                        <span className="text-brand-secondary drop-shadow-sm">Liz</span>
                    </div>
                    
                    <div className="h-px md:h-16 w-full md:w-px bg-gray-200"></div>
                    
                    <div className="space-y-3 flex-1">
                        <div className="flex items-start">
                            <span className="bg-brand-primary/10 text-brand-primary font-bold px-2 py-1 rounded text-xs mr-3 mt-1">FE</span>
                            <span className="text-sm text-gray-700">Representa a <strong>Felicidade</strong> genuína de aprender e a <strong>Fé</strong> que temos no futuro das nossas crianças.</span>
                        </div>
                        <div className="flex items-start">
                            <span className="bg-brand-secondary/10 text-brand-secondary font-bold px-2 py-1 rounded text-xs mr-3 mt-1">LIZ</span>
                            <span className="text-sm text-gray-700">Uma homenagem eterna à minha filha, a musa inspiradora que transformou este projeto em missão de vida.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-white border-l-4 border-brand-accent pl-6 py-4 pr-4 rounded-r-xl italic text-gray-600 relative">
                <Quote className="absolute top-2 left-2 text-brand-accent/20 w-8 h-8 -scale-x-100" />
                <p className="relative z-10">
                    "Construí a FeLiz para a Liz, mas decidi compartilhá-la com o mundo. 
                    Porque toda criança merece aprender com a mesma segurança, qualidade e amor que eu desejo para a minha filha."
                </p>
            </div>
          </div>
        );
      case 'press': return <div className="text-gray-600 space-y-4"><h3 className="text-xl font-bold mb-2">Imprensa</h3><p>Para releases, kits de mídia e entrevistas, entre em contato:</p><p className="font-bold text-brand-primary">imprensa@feliz.education</p></div>;
      case 'privacy': return <div className="text-gray-600 space-y-4"><h3 className="text-xl font-bold mb-2">Privacidade</h3><p>Seus dados estão seguros. Não vendemos informações para terceiros e seguimos rigorosamente a LGPD. O ambiente da FeLiz é fechado e monitorado.</p></div>;
      case 'contact': return <div className="text-gray-600 space-y-4"><h3 className="text-xl font-bold mb-2">Fale Conosco</h3><p>Dúvidas ou sugestões? Nosso time de suporte (que também são pais!) vai adorar ajudar.</p><p className="font-bold text-brand-primary">suporte@feliz.education</p></div>;
      default: return null;
    }
  };

  return (
    <div className="bg-gradient-to-b from-sky-100 via-white to-sky-50 min-h-screen font-sans text-gray-800 overflow-x-hidden relative selection:bg-brand-primary selection:text-white flex flex-col">
      
      <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-lg border-b border-sky-100 transition-all shadow-sm">
        <div className="flex justify-between items-center p-4 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center space-x-1 group cursor-pointer" onClick={handleStartApp}>
             <div className="relative flex items-baseline">
                <span className="font-display font-extrabold text-3xl text-brand-primary tracking-tight">Fe</span>
                <span className="font-display font-extrabold text-3xl text-brand-secondary tracking-tight">Liz</span>
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-brand-accent" viewBox="0 0 60 15" fill="none">
                  <path d="M 2 2 Q 30 15 58 2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
             </div>
          </div>

          <div className="hidden md:flex space-x-8 font-bold text-gray-500 text-sm items-center">
            <button onClick={() => scrollToSection('metodo')} className="hover:text-brand-primary transition p-2 cursor-pointer focus:outline-none">O Método</button>
            <button onClick={() => scrollToSection('quadrivium')} className="hover:text-brand-primary transition p-2 cursor-pointer focus:outline-none">O Currículo</button>
            <button onClick={() => handleClick(() => setActiveModal('about'))} className="hover:text-brand-primary transition p-2 cursor-pointer focus:outline-none">Nossa História</button>
            <button 
              onClick={handleStartApp}
              className="bg-brand-secondary text-white font-bold px-6 py-2 rounded-xl shadow-[0_4px_0_#d97706] hover:translate-y-1 hover:shadow-none transition-all active:scale-95 cursor-pointer"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center overflow-visible z-0">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-200 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-200 rounded-full blur-[100px] opacity-40"></div>
        </div>

        <div className="md:w-1/2 relative z-20 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-white text-brand-secondary rounded-full text-xs font-bold mb-6 tracking-wide border border-brand-secondary/20 shadow-sm">
             <Star size={14} className="mr-2 fill-current" /> DE PAI PARA FILHA
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 leading-[1.1] mb-6">
            A Felicidade de <span className="text-brand-primary relative inline-block">
              Aprender
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-secondary" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span> de verdade.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
            Inspirado no crescimento da Liz e fundamentado na Educação Clássica. A única plataforma que une o amor de família com a tecnologia adaptativa.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 relative z-30">
            <button 
              onClick={handleStartApp}
              className="bg-brand-primary text-white text-lg font-bold py-4 px-10 rounded-2xl shadow-[0_8px_0_rgb(14,116,144)] hover:shadow-[0_4px_0_rgb(14,116,144)] hover:translate-y-1 transition-all flex items-center justify-center group w-full sm:w-auto cursor-pointer"
            >
              Começar a Jornada Grátis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="mt-8 flex items-center space-x-4 text-sm font-bold text-gray-400">
             <span>🔒 Ambiente seguro criado por pais</span>
          </div>
        </div>

        <div className="md:w-1/2 relative mt-16 md:mt-0 flex justify-center perspective-1000 z-10 pointer-events-none md:pointer-events-auto">
          <div className="relative z-10 w-80 md:w-96 bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border-8 border-white/50 transform rotate-y-12 rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
             <div className="bg-gradient-to-br from-sky-50 to-indigo-50 p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                   <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-brand-secondary"></div></div>
                   <div className="bg-brand-primary/10 text-brand-primary p-2 rounded-lg font-bold">👑 PRO</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                   <img src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=Liz" className="w-24 h-24 drop-shadow-lg animate-bounce-sm" alt="Liz" />
                   <div className="bg-white p-4 rounded-xl shadow-sm text-center w-full">
                      <p className="font-display font-bold text-gray-800 text-lg">Qual é a letra A?</p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                         <div className="p-3 border-2 border-brand-primary bg-sky-50 rounded-lg font-bold text-brand-primary">A</div>
                         <div className="p-3 border-2 border-gray-100 rounded-lg text-gray-400">B</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Rest of the Landing Page sections remain visually the same, but ensuring buttons call handleStartApp if they lead to app entry */}
      <section id="metodo" className="py-24 relative overflow-hidden z-0">
         <div className="absolute -left-20 top-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -z-10"></div>
         <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-brand-secondary font-bold tracking-widest uppercase text-sm mb-3">O Método Clássico (Trivium)</h2>
               <h3 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">As 3 Etapas do Cérebro</h3>
               <p className="max-w-2xl mx-auto text-gray-600 text-lg">Não jogamos conteúdo aleatório. Respeitamos a ordem natural de aprendizado da criança.</p>
            </div>
            <div className="relative max-w-5xl mx-auto">
                <div className="bg-white/80 backdrop-blur rounded-[3rem] shadow-xl border border-white overflow-hidden relative min-h-[450px] md:min-h-[350px] flex items-center">
                    <button onClick={() => handleClick(() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1)))} className="absolute left-4 z-20 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors hidden md:block cursor-pointer"><ChevronLeft size={24} /></button>
                    <div className="w-full h-full flex items-center justify-center p-8 md:p-12 relative z-10">
                         <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 text-center md:text-left transition-all duration-500 transform animate-fade-in-up key={currentSlide}">
                            <div className={`${slides[currentSlide].config.color} w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-lg shrink-0 border-4 border-white ring-4 ring-sky-50`}>
                                <div className="scale-150 transform">{slides[currentSlide].config.icon}</div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-3xl font-display font-bold text-gray-900 mb-4">{slides[currentSlide].title}</h4>
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">{slides[currentSlide].config.longDescription}</p>
                                <div className="mb-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">O que aprendemos:</p>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        {slides[currentSlide].config.skills.map((skill: string, idx: number) => (
                                            <span key={idx} className="bg-sky-50 text-sky-800 px-3 py-1 rounded-lg text-sm font-medium border border-sky-100">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleStartApp} className="inline-flex items-center text-brand-primary font-bold hover:text-brand-dark transition-colors group cursor-pointer">
                                    Explorar este módulo <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                         </div>
                    </div>
                    <button onClick={() => handleClick(() => setCurrentSlide((prev) => (prev + 1) % slides.length))} className="absolute right-4 z-20 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors hidden md:block cursor-pointer"><ChevronRight size={24} /></button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                        {slides.map((_, idx) => (
                            <button key={idx} onClick={() => handleClick(() => setCurrentSlide(idx))} className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'bg-brand-primary w-8' : 'bg-gray-200 w-3 hover:bg-gray-300'}`} />
                        ))}
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* QUADRIVIUM SECTION */}
      <section id="quadrivium" className="py-24 bg-brand-dark relative overflow-hidden z-0">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none -z-10"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/30 rounded-full blur-[100px] pointer-events-none -z-10"></div>

         <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 text-purple-300 rounded-full text-xs font-bold mb-4 tracking-wide border border-white/10 backdrop-blur-sm">
                    <Microscope size={14} className="mr-2" /> FASE AVANÇADA (7+ ANOS)
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">O Quadrivium: A Ordem do Universo</h2>
                <p className="max-w-2xl mx-auto text-gray-400 text-lg">
                    Quando a criança domina a linguagem (Trivium), ela está pronta para os Números. 
                    Aqui, matemática não é decoreba, é o estudo da harmonia da criação.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[SubjectType.ARITHMETIC, SubjectType.GEOMETRY, SubjectType.MUSIC, SubjectType.ASTRONOMY].map((subject) => {
                    const config = SUBJECT_CONFIG[subject];
                    return (
                        <button key={subject} onClick={handleStartApp} className="w-full text-left bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors duration-300 group cursor-pointer relative">
                            <div className={`${config.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                {config.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{config.label}</h3>
                            <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{config.description}</p>
                            <div className="space-y-2">
                                {config.skills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full mr-2"></div>
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
         </div>
      </section>

      {/* DIFFERENTIALS */}
      <section id="diferenciais" className="py-24 max-w-7xl mx-auto px-6 md:px-12 bg-[#F8FAFC] rounded-t-[4rem] -mt-10 relative z-20 border-t border-gray-100">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
               <div className="relative h-96 w-full flex items-center justify-center">
                   <div className="absolute inset-0 bg-brand-secondary/10 rounded-[3rem] rotate-6 transform"></div>
                   <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500 relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
                       <div className="relative flex items-baseline">
                          <span className="font-display font-extrabold text-8xl md:text-9xl text-brand-primary tracking-tight">Fe</span>
                          <span className="font-display font-extrabold text-8xl md:text-9xl text-brand-secondary tracking-tight">Liz</span>
                          <svg className="absolute -bottom-6 left-0 w-full h-8 text-brand-accent" viewBox="0 0 60 15" fill="none">
                            <path d="M 2 2 Q 30 15 58 2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                          </svg>
                       </div>
                       <p className="mt-8 text-xl font-bold text-gray-400 tracking-[0.5em] uppercase">Education</p>
                   </div>
               </div>
            </div>
            <div>
               <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">Educação que conecta, não isola.</h2>
               <p className="text-lg text-gray-600 mb-8">
                  Criamos a FeLiz porque cansamos de apps que hipnotizam. Nosso objetivo é que você receba relatórios para conversar com seu filho no jantar sobre o que ele aprendeu.
               </p>
               <div className="space-y-6">
                  <FeatureRow icon={<Shield className="text-green-600" />} title="Segurança Máxima" desc="Zero anúncios. Zero chat com estranhos. Ambiente blindado." />
                  <FeatureRow icon={<Brain className="text-purple-600" />} title="IA Adaptativa (Astra)" desc="Como um professor particular que conhece o ritmo do seu filho." />
                  <FeatureRow icon={<Heart className="text-rose-600" />} title="Feito com Amor" desc="Cada lição passa pelo crivo de nossa família antes de chegar à sua." />
               </div>
            </div>
         </div>
      </section>

      <div className="bg-brand-primary py-20 text-center px-6 relative z-10">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Faça parte da nossa família.</h2>
            <p className="text-sky-100 text-xl mb-10">Crie sua conta gratuita em 30 segundos.</p>
            <button onClick={handleStartApp} className="bg-white text-brand-primary text-xl font-bold py-5 px-12 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all cursor-pointer">
               Criar Conta Grátis
            </button>
         </div>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-sm border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
               <div className="flex items-baseline mb-4">
                  <span className="font-display font-extrabold text-2xl text-white tracking-tight">Fe</span>
                  <span className="font-display font-extrabold text-2xl text-gray-400 tracking-tight">Liz</span>
               </div>
               <p className="mb-4">Educação clássica gamificada para o século 21.</p>
               <p>© 2024 FeLiz Education.</p>
            </div>
            <div>
               <h4 className="font-bold text-white mb-4">Plataforma</h4>
               <ul className="space-y-2">
                  <li><button onClick={handleStartApp} className="hover:text-white transition cursor-pointer">Criar Conta</button></li>
                  <li><button onClick={handleStartApp} className="hover:text-white transition cursor-pointer">Login</button></li>
                  <li><button onClick={() => scrollToSection('metodo')} className="hover:text-white transition cursor-pointer">Como Funciona</button></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-white mb-4">Sobre</h4>
               <ul className="space-y-2">
                  <li><button onClick={() => handleClick(() => setActiveModal('about'))} className="hover:text-white transition cursor-pointer">Nossa História</button></li>
                  <li><button onClick={() => handleClick(() => setActiveModal('press'))} className="hover:text-white transition cursor-pointer">Imprensa</button></li>
                  <li><button onClick={() => handleClick(() => setActiveModal('contact'))} className="hover:text-white transition cursor-pointer">Fale Conosco</button></li>
               </ul>
            </div>
             <div>
               <h4 className="font-bold text-white mb-4">Legal</h4>
               <ul className="space-y-2">
                  <li><button onClick={() => handleClick(() => setActiveModal('privacy'))} className="hover:text-white transition cursor-pointer">Privacidade</button></li>
                  <li><button onClick={() => handleClick(() => alert("Página de Termos de Uso em construção!"))} className="hover:text-white transition cursor-pointer">Termos de Uso</button></li>
               </ul>
            </div>
        </div>
      </footer>

      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative animate-fade-in-up">
              <button onClick={() => handleClick(() => setActiveModal(null))} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition cursor-pointer z-20"><X size={20} /></button>
              <div className="p-8 max-h-[90vh] overflow-y-auto">{renderModalContent()}</div>
              <div className="bg-gray-50 p-4 flex justify-end">
                <button onClick={() => handleClick(() => setActiveModal(null))} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition cursor-pointer">Fechar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const FeatureRow = ({ icon, title, desc }: any) => (
   <div className="flex items-start space-x-4">
      <div className="bg-white p-3 rounded-xl shrink-0 border border-gray-100 shadow-sm">
         {icon}
      </div>
      <div>
         <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
         <p className="text-gray-500 text-sm">{desc}</p>
      </div>
   </div>
);

export default LandingPage;
