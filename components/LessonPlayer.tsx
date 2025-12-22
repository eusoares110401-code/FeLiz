import React, { useState, useEffect } from 'react';
import { generateLessonContent, getTutorHelp } from '../services/geminiService';
import { ALPHABET_DB } from '../services/staticDatabase';
import { SubjectType, Lesson, ChildProfile } from '../types';
import { ArrowLeft, Check, Loader2, Volume2, X, Gamepad2, Star, Trophy, AlertTriangle } from 'lucide-react';
import { playSound } from '../services/soundService';

interface LessonPlayerProps {
  subject: SubjectType;
  user: ChildProfile;
  onComplete: (xp: number, completedItem?: string) => void;
  onExit: () => void;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ subject, user, onComplete, onExit }) => {
  const isLiteracy = subject === SubjectType.GRAMMAR;

  // View Mode State
  const [viewMode, setViewMode] = useState<'board' | 'quiz' | 'result'>(isLiteracy ? 'board' : 'quiz');
  const [focusedLetter, setFocusedLetter] = useState<string | null>(null);

  // Lesson State
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  
  // Tutor State
  const [tutorMessage, setTutorMessage] = useState<string | null>(null);
  const [tutorLoading, setTutorLoading] = useState(false);

  // Load Content Logic
  useEffect(() => {
    // Inicializa o som e, se houver URLs configuradas no DB, pré-carrega
    playSound.init();
    if (isLiteracy) {
        playSound.preloadBank(ALPHABET_DB as any);
    }
    
    if (viewMode === 'quiz' && !lesson) {
        loadLessonContent();
    }
  }, [viewMode, isLiteracy, lesson]);

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
        
        // Critical Validation: Ensure questions exist
        if (!content || !content.questions || !Array.isArray(content.questions) || content.questions.length === 0) {
            throw new Error("Conteúdo da lição vazio ou inválido.");
        }

        const newLesson: Lesson = {
          id: (content as any).id || `lesson_${Date.now()}`,
          subject,
          title: content.title || "Lição Surpresa",
          description: content.description || "Vamos aprender!",
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

  const handleCheck = () => {
    if (!lesson || !selectedOption) return;
    
    setIsChecking(true);
    const currentQ = lesson.questions[currentQuestionIndex];
    if (!currentQ) return; // Safety check

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

    if (currentQuestionIndex < lesson.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setFeedback(null);
      setTutorMessage(null);
      setIsChecking(false);
    } else {
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

      let completedItem = undefined;
      // Check if it was a letter lesson
      if (lesson.id.startsWith('letter_')) {
          const parts = lesson.id.split('_');
          if (parts.length > 1) completedItem = parts[1];
      } else if (lesson.title.includes("Letra ")) {
          // Fallback check by title
          completedItem = lesson.title.split("Letra ")[1]?.charAt(0);
      }
      
      onComplete(lesson.xpReward, completedItem);
  };

  const handleAskTutor = async (questionText: string) => {
    if (!user.isPremium) {
        setTutorMessage("Dica da Astra: Tente olhar as figuras com atenção! (Premium desbloqueia dicas)");
        return;
    }
    setTutorLoading(true);
    const help = await getTutorHelp(questionText, user.age);
    setTutorMessage(help);
    setTutorLoading(false);
  };

  // --- SUB-COMPONENT: ALPHABET BOARD ---
  const AlphabetBoard = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    const mastered = user.masteredLetters || [];
    
    const handleLetterClick = (letter: string) => {
       playSound.click();
       
       const letterData = ALPHABET_DB[letter];
       if(letterData) {
           // Passa a chave 'letter_A' para verificar se há cache, senão usa o texto fonético
           playSound.speak(letterData.phoneticText, `letter_${letter}`);
       }
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
        <div className="flex flex-col items-center w-full h-full animate-fade-in-up relative pb-20">
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-rose-200 mb-4 text-center w-full shadow-sm">
                <h3 className="text-lg font-bold text-rose-600 flex items-center justify-center">
                    <Volume2 className="mr-2 w-5 h-5" /> Toque nas letras para ouvir!
                </h3>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 w-full max-h-[70vh] overflow-y-auto p-2">
                {letters.map((letter) => {
                    const isMastered = mastered.includes(letter);
                    return (
                        <button
                            key={letter}
                            onClick={() => handleLetterClick(letter)}
                            className={`
                                aspect-square rounded-xl shadow-sm border-b-4 flex items-center justify-center relative
                                text-3xl font-display font-bold transition-all duration-200 cursor-pointer
                                ${isMastered 
                                    ? 'bg-green-50 border-green-300 text-green-600' 
                                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                                }
                                active:border-b-0 active:translate-y-1
                            `}
                        >
                            {letter}
                            {isMastered && <div className="absolute top-1 right-1"><Star size={10} className="text-yellow-400 fill-current" /></div>}
                        </button>
                    );
                })}
            </div>

            {/* LETTER MODAL */}
            {focusedLetter && letterData && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={() => setFocusedLetter(null)}></div>
                    <div className="bg-white rounded-[2rem] shadow-2xl p-6 w-full max-w-sm relative z-50 animate-bounce-sm border-4 border-rose-100 flex flex-col items-center">
                        <button onClick={() => { playSound.click(); setFocusedLetter(null); }} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full text-gray-500">
                            <X size={24} />
                        </button>
                        <div className="text-9xl font-display font-bold mb-2 text-brand-primary">{focusedLetter}</div>
                        <div className="text-6xl mb-4">{letterData.emoji}</div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-6 font-display">{letterData.word}</h3>
                        <div className="space-y-3 w-full">
                            <button onClick={() => { playSound.click(); playSound.speak(letterData.phoneticText, `letter_${letterData.letter}`); }} className="w-full bg-yellow-400 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center">
                                <Volume2 className="mr-2" /> Ouvir
                            </button>
                            <button onClick={playLetterGame} className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center">
                                <Gamepad2 className="mr-2" /> Jogar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  // --- RESULT SCREEN ---
  if (viewMode === 'result') {
      const isPerfect = lesson ? score === lesson.questions.length : false;
      return (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in-up text-center p-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-white max-w-md w-full relative">
                    <div className="mb-6 scale-125 flex justify-center">
                        {isPerfect 
                            ? <Trophy size={64} className="text-yellow-500 animate-bounce" />
                            : <Star size={64} className="text-brand-primary fill-brand-primary" />
                        }
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{isPerfect ? 'Perfeito!' : 'Muito Bem!'}</h2>
                    <p className="text-gray-500 mb-8">Você acertou {score} de {lesson?.questions.length}.</p>
                    <div className="bg-brand-background rounded-xl p-4 w-full mb-8 border border-brand-primary/20">
                        <p className="text-sm font-bold text-gray-500 uppercase">Recompensa</p>
                        <p className="text-4xl font-display font-bold text-brand-primary">+{lesson?.xpReward} XP</p>
                    </div>
                    <button onClick={handleFinishLesson} className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-600 transition-all flex items-center justify-center">
                        Continuar <ArrowLeft className="ml-2 rotate-180" />
                    </button>
              </div>
          </div>
      );
  }

  // --- ERROR STATE ---
  if ((error || (!loading && !lesson)) && viewMode === 'quiz') {
      return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center px-4 bg-red-50 rounded-3xl p-6">
              <AlertTriangle className="w-16 h-16 text-red-400" />
              <h2 className="text-2xl font-bold text-gray-800">Ops!</h2>
              <p className="text-gray-600">Ocorreu um erro ao carregar a lição.</p>
              <button onClick={() => isLiteracy ? setViewMode('board') : onExit()} className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg">Voltar</button>
          </div>
      );
  }

  // --- LOADING STATE ---
  if (loading && viewMode === 'quiz') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
        <p className="text-xl font-display text-brand-primary font-bold">Preparando magia...</p>
      </div>
    );
  }

  // --- RENDER BOARD ---
  if (viewMode === 'board') {
      return <AlphabetBoard />;
  }

  // --- RENDER QUIZ ---
  const currentQuestion = lesson?.questions[currentQuestionIndex];
  if (!currentQuestion) return <div className="flex justify-center h-full items-center"><Loader2 className="animate-spin"/></div>;

  const progress = lesson && lesson.questions.length > 0 ? ((currentQuestionIndex) / lesson.questions.length) * 100 : 0;
  const isVisualOptions = isLiteracy || (currentQuestion.options && currentQuestion.options.every(opt => opt.length <= 2));

  return (
    <div className={`flex flex-col h-full w-full max-w-4xl mx-auto relative rounded-3xl p-4 shadow-sm border border-white ${isLiteracy ? 'bg-gradient-to-b from-rose-50 to-orange-50' : 'bg-slate-50/50'}`}>
      
      {/* HEADER */}
      <div className="flex flex-col space-y-4 mb-4 z-10">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => isLiteracy ? setViewMode('board') : onExit()} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden border border-white shadow-inner">
                <div className={`h-full transition-all duration-500 ease-out ${isLiteracy ? 'bg-rose-500' : 'bg-brand-secondary'}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
      </div>

      {/* QUESTION */}
      <div className="flex-1 flex flex-col items-center w-full overflow-y-auto pb-24">
          <div className="w-full flex flex-col items-center max-w-2xl animate-fade-in-up">
            <h2 className={`font-display font-bold text-gray-800 mb-8 text-center px-2 ${isLiteracy ? 'text-2xl md:text-4xl text-rose-600' : 'text-xl md:text-3xl'}`}>
                {currentQuestion.text}
            </h2>

            <div className={`grid ${isVisualOptions ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-4 w-full px-1`}>
                {currentQuestion.options.map((option, idx) => (
                    <button
                        key={idx}
                        disabled={isChecking}
                        onClick={() => { playSound.click(); setSelectedOption(option); }}
                        className={`
                            rounded-2xl border-b-4 font-bold transition-all w-full relative
                            ${isVisualOptions ? 'aspect-square text-5xl flex items-center justify-center' : 'p-4 text-lg text-center'}
                            ${selectedOption === option ? 'bg-sky-100 border-sky-500 text-sky-700 -translate-y-1' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
                            ${isChecking && option === currentQuestion.correctAnswer ? '!bg-green-100 !border-green-500 !text-green-700' : ''}
                            ${isChecking && selectedOption === option && feedback === 'incorrect' ? '!bg-red-100 !border-red-400 !text-red-700' : ''}
                        `}
                    >
                        {option}
                        {isChecking && option === currentQuestion.correctAnswer && <div className="absolute top-2 right-2 text-green-500"><Check size={16}/></div>}
                    </button>
                ))}
            </div>
          </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md md:absolute md:rounded-b-3xl md:bg-transparent z-20">
            <div className="max-w-4xl mx-auto">
                {(tutorMessage || tutorLoading) && (
                    <div className="mb-4 p-3 bg-white rounded-xl border border-blue-100 shadow-lg flex items-center space-x-3 animate-fade-in-up">
                        <div className="text-2xl">🦉</div>
                        <div className="text-sm text-gray-700 font-medium flex-1">
                            {tutorLoading ? "Pensando..." : tutorMessage}
                        </div>
                    </div>
                )}
                {!feedback ? (
                    <button disabled={!selectedOption} onClick={handleCheck} className={`w-full py-4 rounded-2xl font-bold text-xl shadow-lg transition-all border-b-4 ${selectedOption ? 'bg-brand-secondary border-yellow-600 text-white hover:bg-yellow-500' : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'}`}>
                        VERIFICAR
                    </button>
                ) : (
                    <button onClick={handleNext} className={`w-full py-4 rounded-2xl font-bold text-xl shadow-lg text-white transition-all border-b-4 ${feedback === 'correct' ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'}`}>
                        CONTINUAR <ArrowLeft className="inline ml-2 rotate-180" />
                    </button>
                )}
            </div>
      </div>
    </div>
  );
};

export default LessonPlayer;