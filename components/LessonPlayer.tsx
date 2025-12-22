import React, { useState, useEffect } from 'react';
import { generateLessonContent, getTutorHelp } from '../services/geminiService';
import { ALPHABET_DB } from '../services/staticDatabase';
import { SubjectType, Lesson, Question, ChildProfile } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { ArrowLeft, Check, Loader2, Share2, AlertTriangle, Volume2, X, Gamepad2, Star, Trophy, Home } from 'lucide-react';
import { playSound } from '../services/soundService';

interface LessonPlayerProps {
  subject: SubjectType;
  user: ChildProfile;
  onComplete: (xp: number, completedItem?: string) => void;
  onExit: () => void;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ subject, user, onComplete, onExit }) => {
  const isLiteracy = subject === SubjectType.GRAMMAR;

  // Modos de visualização: Board (Alfabeto), Quiz (Perguntas), Result (Vitória!)
  const [viewMode, setViewMode] = useState<'board' | 'quiz' | 'result'>(isLiteracy ? 'board' : 'quiz');
  
  // State para o Modal da Letra (Foco)
  const [focusedLetter, setFocusedLetter] = useState<string | null>(null);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [tutorMessage, setTutorMessage] = useState<string | null>(null);
  const [tutorLoading, setTutorLoading] = useState(false);
  
  // Rastreamento de acertos para a tela final
  const [score, setScore] = useState(0);

  // Inicialização Segura
  useEffect(() => {
    playSound.init(); // Garante init do audio
    
    if (viewMode === 'quiz') {
        loadLessonContent();
    } else {
        setLoading(false);
    }
  }, [subject, user.age, user.isPremium]); 

  const loadLessonContent = async (topic?: string) => {
    setLoading(true);
    setError(false);
    setLesson(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback(null);
    setTutorMessage(null);
    setSelectedOption(null);
    setIsChecking(false);

    try {
        const content = await generateLessonContent(subject, user.age, user.isPremium, topic);
        
        if (!content || !content.questions || content.questions.length === 0) {
            throw new Error("Conteúdo da lição vazio.");
        }

        const newLesson: Lesson = {
          id: (content as any).id || Date.now().toString(),
          subject,
          title: content.title,
          description: content.description,
          questions: content.questions,
          xpReward: 50
        };
        
        setLesson(newLesson);
    } catch (err) {
        console.error("Erro no LessonPlayer:", err);
        setError(true);
    } finally {
        setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (isChecking) return; // Bloqueia mudança após verificar
    playSound.click();
    setSelectedOption(option);
  };

  const handleCheck = () => {
    if (!lesson || !selectedOption) return;
    
    setIsChecking(true);
    const currentQ = lesson.questions[currentQuestionIndex];
    // Normalização para evitar erros de espaços/case
    const isCorrect = selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      playSound.success();
      setScore(prev => prev + 1);
    } else {
      playSound.error();
      handleAskTutor(currentQ.text);
    }
  };

  const handleNext = () => {
    playSound.click();
    if (!lesson) return;

    // Se ainda tem perguntas
    if (currentQuestionIndex < lesson.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setFeedback(null);
      setTutorMessage(null);
      setIsChecking(false);
    } else {
      // Fim da lição -> Vai para tela de RESULTADO (não fecha direto)
      playSound.complete();
      setViewMode('result');
    }
  };

  const handleFinishLesson = () => {
      playSound.click();
      if (!lesson) {
          onExit();
          return;
      }

      // Detecta se completou uma letra específica para salvar progresso especial
      let completedItem = undefined;
      if (lesson.id.startsWith('letter_')) {
          completedItem = lesson.id.split('_')[1]; // Ex: 'A'
      }
      
      onComplete(lesson.xpReward, completedItem);
  };

  const handleAskTutor = async (questionText: string) => {
    if (!user.isPremium) {
        setTutorMessage("Dica da Astra: Tente olhar as figuras com atenção! (Premium desbloqueia dicas mágicas)");
        return;
    }
    setTutorLoading(true);
    const help = await getTutorHelp(questionText, user.age);
    setTutorMessage(help);
    setTutorLoading(false);
  };

  const handleExitClick = () => {
    playSound.click();
    onExit();
  };

  // --- SUB-COMPONENT: ALPHABET BOARD ---
  const AlphabetBoard = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    const mastered = user.masteredLetters || [];
    
    const handleLetterClick = (letter: string) => {
       playSound.click();
       const letterData = ALPHABET_DB[letter];
       const textToSpeak = letterData ? letterData.phoneticText : letter;
       setTimeout(() => playSound.speak(textToSpeak), 100);
       setFocusedLetter(letter);
    };

    const playLetterGame = () => {
        if (!focusedLetter) return;
        playSound.click();
        const letter = focusedLetter;
        setFocusedLetter(null); 
        setViewMode('quiz');
        loadLessonContent(`Letra ${letter}`);
    };

    const letterData = focusedLetter ? ALPHABET_DB[focusedLetter] : null;

    return (
        <div className="flex flex-col items-center w-full h-full animate-fade-in-up relative">
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-rose-200 mb-4 text-center w-full shadow-sm">
                <h3 className="text-lg md:text-xl font-bold text-rose-600 flex items-center justify-center">
                    <Volume2 className="mr-2 w-5 h-5" /> Toque nas letras para ouvir!
                </h3>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 md:gap-4 w-full max-h-[65vh] overflow-y-auto p-2 pb-24">
                {letters.map((letter) => {
                    const isMastered = mastered.includes(letter);
                    return (
                        <button
                            key={letter}
                            id={`letter-${letter}`}
                            onClick={() => handleLetterClick(letter)}
                            className={`
                                aspect-square rounded-xl md:rounded-2xl shadow-sm border-b-4 flex items-center justify-center relative
                                text-3xl md:text-5xl font-display font-bold transition-all duration-200 cursor-pointer
                                ${isMastered 
                                    ? 'bg-green-50 border-green-300 text-green-600 hover:bg-green-100 ring-2 ring-green-100' 
                                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                                }
                                active:border-b-0 active:translate-y-1 active:shadow-none
                            `}
                        >
                            {letter}
                            {isMastered && (
                                <div className="absolute top-1 right-1">
                                    <Star size={12} className="text-yellow-400 fill-current" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* MODAL DE FOCO DA LETRA */}
            {focusedLetter && letterData && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={() => setFocusedLetter(null)}></div>
                    <div className="bg-white rounded-[2rem] shadow-2xl p-6 w-full max-w-sm relative z-50 animate-bounce-sm border-4 border-rose-100 flex flex-col items-center">
                        <button onClick={() => { playSound.click(); setFocusedLetter(null); }} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-500">
                            <X size={24} />
                        </button>
                        <div className={`text-9xl font-display font-bold mb-2 drop-shadow-md ${user.masteredLetters.includes(focusedLetter) ? 'text-green-500' : 'text-gray-800'}`}>
                            {focusedLetter}
                        </div>
                        <div className="text-6xl mb-4 animate-pulse">{letterData.emoji}</div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-6 font-display">{letterData.word}</h3>
                        <div className="flex flex-col w-full space-y-3">
                            <button onClick={() => { playSound.click(); setTimeout(() => playSound.speak(letterData.phoneticText), 50); }} className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 rounded-xl shadow-[0_4px_0_#ca8a04] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center text-lg">
                                <Volume2 className="mr-2 w-6 h-6" /> Ouvir Exemplo
                            </button>
                            <button onClick={playLetterGame} className="w-full bg-brand-primary hover:bg-sky-600 text-white font-bold py-4 rounded-xl shadow-[0_4px_0_#0284c7] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center text-lg">
                                <Gamepad2 className="mr-2 w-6 h-6" /> 
                                {user.masteredLetters.includes(focusedLetter) ? 'Praticar Novamente' : 'Aprender e Ganhar ⭐'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  // --- RESULT SCREEN (TELA DE VITÓRIA) ---
  if (viewMode === 'result') {
      const isPerfect = lesson ? score === lesson.questions.length : false;
      
      return (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in-up text-center p-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-white max-w-md w-full relative overflow-hidden">
                  {/* Confete Background (Simulado com CSS) */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_#fbbf24_2px,_transparent_2.5px)] [background-size:20px_20px]"></div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 scale-125">
                        {isPerfect 
                            ? <div className="bg-yellow-100 p-6 rounded-full shadow-inner animate-bounce"><Trophy size={64} className="text-yellow-500" /></div>
                            : <div className="bg-brand-primary/10 p-6 rounded-full shadow-inner"><Star size={64} className="text-brand-primary fill-brand-primary" /></div>
                        }
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-2">
                        {isPerfect ? 'Perfeito!' : 'Muito Bem!'}
                    </h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Você acertou {score} de {lesson?.questions.length} questões.
                    </p>

                    <div className="bg-brand-background rounded-xl p-4 w-full mb-8 border border-brand-primary/20">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Recompensa</p>
                        <p className="text-4xl font-display font-bold text-brand-primary">+{lesson?.xpReward} XP</p>
                    </div>

                    <button 
                        onClick={handleFinishLesson}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-[0_4px_0_#15803d] active:shadow-none active:translate-y-1 transition-all text-xl flex items-center justify-center"
                    >
                        Continuar Jornada <ArrowLeft className="ml-2 rotate-180" />
                    </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- LOADING STATE ---
  if (loading && viewMode === 'quiz') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 bg-slate-50/50 rounded-3xl p-6 backdrop-blur-sm">
        <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
        <p className="text-xl font-display text-brand-primary animate-pulse font-bold">
            Preparando desafio...
        </p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if ((error || !lesson) && viewMode === 'quiz') {
      return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center px-4 bg-red-50 rounded-3xl p-6 border border-red-100">
              <AlertTriangle className="w-16 h-16 text-red-400" />
              <h2 className="text-2xl font-bold text-gray-800">Ops! Pequeno problema.</h2>
              <p className="text-gray-600">Não conseguimos carregar a lição. Tente novamente.</p>
              <button 
                onClick={() => isLiteracy ? setViewMode('board') : onExit()} 
                className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold mt-4 shadow-lg hover:bg-sky-600"
              >
                Voltar
              </button>
          </div>
      );
  }

  // --- RENDER QUIZ ---
  const currentQuestion = lesson?.questions[currentQuestionIndex];
  const progress = lesson && lesson.questions.length > 0 ? ((currentQuestionIndex) / lesson.questions.length) * 100 : 0;
  const isVisualOptions = isLiteracy || (currentQuestion?.options && currentQuestion.options.every(opt => opt.length <= 2 || /\p{Emoji}/u.test(opt)));

  return (
    <div className={`
        flex flex-col h-full w-full max-w-4xl mx-auto relative rounded-3xl p-4 md:p-8 shadow-sm border border-white
        ${isLiteracy ? 'bg-gradient-to-b from-rose-50 to-orange-50' : 'bg-slate-50/50'}
        overflow-hidden md:overflow-visible
    `}>
      
      {/* HEADER */}
      <div className="flex flex-col space-y-4 mb-6 z-10">
          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={() => {
                  if (viewMode === 'quiz' && isLiteracy) {
                      setViewMode('board'); 
                  } else {
                      handleExitClick();
                  }
              }} 
              className="flex items-center text-gray-500 hover:text-brand-primary font-bold transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 group"
            >
              <ArrowLeft className="w-6 h-6 mr-1 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Desistir</span>
            </button>
            
            {/* Barra de Progresso */}
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden border border-white shadow-inner mx-2">
                <div 
                    className={`h-full transition-all duration-500 ease-out ${isLiteracy ? 'bg-rose-500' : 'bg-brand-secondary'}`}
                    style={{ width: `${progress}%` }} 
                />
            </div>

            <div className="flex items-center font-display font-bold text-gray-400 text-sm">
                 {currentQuestionIndex + 1}/{lesson?.questions.length}
            </div>
          </div>
      </div>

      {/* QUESTION AREA */}
      <div className="flex-1 flex flex-col justify-start md:justify-center items-center w-full overflow-y-auto md:overflow-visible pb-32 md:pb-0 no-scrollbar">
        {currentQuestion && (
            <div className="w-full flex flex-col items-center animate-fade-in-up max-w-2xl">
                <h2 className={`
                    font-display font-bold text-gray-800 mb-6 md:mb-10 text-center leading-relaxed px-2
                    ${isLiteracy ? 'text-2xl md:text-4xl text-rose-600' : 'text-xl md:text-3xl'}
                `}>
                {currentQuestion.text}
                </h2>

                <div className={`grid ${isVisualOptions ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-4 md:gap-6 w-full px-1`}>
                {currentQuestion.options.map((option, idx) => (
                    <button
                    key={idx}
                    disabled={isChecking} // Bloqueia cliques durante verificação
                    onClick={() => handleOptionSelect(option)}
                    className={`
                        rounded-2xl md:rounded-3xl border-b-4 md:border-b-8 font-bold transition-all transform duration-200 w-full relative group cursor-pointer
                        ${isVisualOptions 
                            ? 'aspect-square text-5xl md:text-7xl flex items-center justify-center shadow-lg' 
                            : 'p-4 md:p-6 text-lg md:text-xl shadow-md border-2 text-left md:text-center flex items-center md:justify-center min-h-[70px]'}
                        ${selectedOption === option 
                        ? 'bg-sky-100 border-sky-500 text-sky-700 -translate-y-1 ring-2 ring-sky-200' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:scale-[1.02] active:scale-95'
                        }
                        ${isChecking && option === currentQuestion.correctAnswer ? '!bg-green-100 !border-green-500 !text-green-700 !opacity-100 scale-105 ring-2 ring-green-200' : ''}
                        ${isChecking && selectedOption === option && feedback === 'incorrect' ? '!bg-red-100 !border-red-400 !text-red-700 shake-animation' : ''}
                        ${isChecking ? 'cursor-default' : ''}
                    `}
                    >
                    <span className="z-10 relative">{option}</span>
                    {/* Status Icon */}
                    {isChecking && option === currentQuestion.correctAnswer && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                            <Check size={16} strokeWidth={4} />
                        </div>
                    )}
                    </button>
                ))}
                </div>
            </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 md:static md:mt-8 z-30 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
                {/* Tutor Message */}
                {(tutorMessage || tutorLoading) && (
                    <div className="mx-4 md:mx-0 mb-4 p-4 bg-white/95 backdrop-blur rounded-2xl border border-brand-primary/20 flex items-start space-x-4 animate-fade-in-up shadow-xl md:shadow-lg">
                        <div className="text-3xl md:text-4xl bg-brand-background rounded-full p-1 shadow-sm">🦉</div>
                        <div className="flex-1">
                        <h4 className="font-bold text-brand-primary text-sm mb-1">Dica da Astra</h4>
                        {tutorLoading ? (
                            <div className="flex space-x-1 mt-2">
                            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-150" />
                            </div>
                        ) : (
                            <p className="text-gray-700 text-sm md:text-base font-medium leading-tight">{tutorMessage}</p>
                        )}
                        </div>
                    </div>
                )}

                {/* Main Action Button */}
                <div className={`
                    p-4 rounded-t-3xl md:rounded-none md:bg-transparent shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:shadow-none
                    ${feedback === 'correct' ? 'bg-green-100 md:bg-transparent' : ''}
                    ${feedback === 'incorrect' ? 'bg-red-100 md:bg-transparent' : 'bg-white/90 backdrop-blur-md md:bg-transparent'}
                    transition-all duration-300
                `}>
                    <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
                        {!feedback ? (
                        <button
                            disabled={!selectedOption}
                            onClick={handleCheck}
                            className={`flex-1 py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-lg transition-all border-b-4 
                            ${selectedOption 
                                ? 'bg-brand-secondary border-yellow-600 text-white hover:bg-yellow-500 active:scale-95 active:border-b-0 active:translate-y-1 cursor-pointer' 
                                : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'}
                            `}
                        >
                            VERIFICAR
                        </button>
                        ) : (
                        <button
                            onClick={handleNext}
                            className={`flex-1 py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-lg text-white transition-all active:scale-95 border-b-4 cursor-pointer
                            ${feedback === 'correct' ? 'bg-green-500 border-green-700 hover:bg-green-400' : 'bg-red-500 border-red-700 hover:bg-red-400'}
                            `}
                        >
                            CONTINUAR <ArrowLeft className="inline ml-2 rotate-180" />
                        </button>
                        )}
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};

export default LessonPlayer;