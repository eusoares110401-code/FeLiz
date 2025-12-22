import { ALPHABET_DB } from "./staticDatabase";

// ==========================================
// SERVIÇO DE ÁUDIO ROBUSTO (Web Audio API + TTS)
// ==========================================

let audioCtx: AudioContext | null = null;
let synthesisVoice: SpeechSynthesisVoice | null = null;

// Inicializa o Contexto de Áudio (Sintetizador de Tons)
const initAudioContext = () => {
  try {
    if (typeof window === 'undefined') return null;
    
    if (!audioCtx) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
            audioCtx = new Ctx();
        }
    }
    
    // Tenta resumir se estiver suspenso (comum em navegadores modernos antes da interação)
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch((e) => console.warn("Audio resume failed (aguardando interação)", e));
    }
    
    return audioCtx;
  } catch (e) {
    console.error("Erro ao iniciar AudioContext", e);
    return null;
  }
};

// Inicializa e Busca a Melhor Voz PT-BR disponível
const initVoices = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadBestVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        // 1. Tenta achar uma voz da Google em PT-BR (geralmente melhor qualidade)
        let bestVoice = voices.find(v => v.lang === 'pt-BR' && v.name.includes('Google'));
        
        // 2. Se não, qualquer PT-BR
        if (!bestVoice) {
            bestVoice = voices.find(v => v.lang === 'pt-BR');
        }

        // 3. Se não, qualquer PT (PT-PT)
        if (!bestVoice) {
            bestVoice = voices.find(v => v.lang.includes('pt'));
        }

        if (bestVoice) {
            synthesisVoice = bestVoice;
            console.log("Voz selecionada:", bestVoice.name);
        }
    };

    // Chrome carrega vozes de forma assíncrona
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = loadBestVoice;
    } else {
        loadBestVoice();
    }
};

// Inicializa listeners
if (typeof window !== 'undefined') {
    initVoices();
}

// Gerador de Tons (Oscillator)
const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    // Envelope sonoro (Attack e Release rápidos para som percussivo "Plink")
    gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  } catch (e) {
      console.warn("Erro ao tocar tom", e);
  }
};

const safeExec = (fn: () => void) => {
    try { fn(); } catch (e) { console.warn("Erro no soundService", e); }
};

export const playSound = {
  // Som de Clique (Plink agudo e curto)
  click: () => safeExec(() => playTone(800, 'sine', 0.1, 0, 0.1)),
  
  // Som de Sucesso (Acorde maior ascendente)
  success: () => safeExec(() => {
    playTone(523.25, 'sine', 0.15, 0);    // C
    playTone(659.25, 'sine', 0.15, 0.1);  // E
    playTone(783.99, 'sine', 0.4, 0.2);   // G
  }),
  
  // Som de Erro (Grave e áspero)
  error: () => safeExec(() => {
    playTone(150, 'sawtooth', 0.2, 0);
    playTone(130, 'sawtooth', 0.2, 0.15);
  }),
  
  // Som de Lição Completa (Fanfarra)
  complete: () => safeExec(() => {
    playTone(523.25, 'triangle', 0.1, 0);
    playTone(659.25, 'triangle', 0.1, 0.1);
    playTone(783.99, 'triangle', 0.1, 0.2);
    playTone(1046.50, 'triangle', 0.6, 0.3); // C High
  }),

  // TTS - Fala o texto
  speak: (text: string, forceReloadVoices: boolean = false) => safeExec(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Cancela fala anterior para não encavalar
    window.speechSynthesis.cancel();

    // Se a voz ainda não foi carregada (ou se perdemos ela), tenta carregar de novo
    if (!synthesisVoice || forceReloadVoices) {
        initVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurações para voz didática
    utterance.lang = 'pt-BR'; 
    utterance.rate = 0.9; // Um pouco mais lento para crianças entenderem
    utterance.pitch = 1.1; // Tom levemente mais agudo (mais amigável)
    utterance.volume = 1.0;

    if (synthesisVoice) {
        utterance.voice = synthesisVoice;
    }

    window.speechSynthesis.speak(utterance);
  }),

  // Método específico para pré-carregar (útil para chamar no primeiro clique do app)
  init: () => {
      initAudioContext();
      initVoices();
  }
};