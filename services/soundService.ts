// ==========================================
// SERVIÇO DE ÁUDIO DE ALTA PERFORMANCE
// ==========================================

// Cache para armazenar áudios pré-carregados na memória (ZERO Latency)
const audioCache = new Map<string, AudioBuffer>();
let audioCtx: AudioContext | null = null;

// Variáveis para TTS (Text-to-Speech)
let synthesisVoice: SpeechSynthesisVoice | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null; // Previne Garbage Collection do Chrome
let isUnlocked = false;

// --- 1. WEB AUDIO API (Para Efeitos e Arquivos Locais) ---

const initAudioContext = () => {
    try {
        if (typeof window === 'undefined') return null;
        if (!audioCtx) {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            if (Ctx) audioCtx = new Ctx({ latencyHint: 'interactive' }); // Prioriza baixa latência
        }
        return audioCtx;
    } catch (e) {
        console.error("Erro ao iniciar AudioContext", e);
        return null;
    }
};

/**
 * Carrega um arquivo de áudio (URL) e o decodifica para a memória.
 * Ideal para sons de UI e letras do alfabeto se houver arquivos .mp3
 */
const preloadAudio = async (key: string, url: string) => {
    try {
        const ctx = initAudioContext();
        if (!ctx) return;

        // Se já está em cache, ignora
        if (audioCache.has(key)) return;

        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        // Decodifica o áudio para PCM (Raw Audio) na memória
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioCache.set(key, audioBuffer);
        console.log(`[SoundService] Áudio pré-carregado: ${key}`);
    } catch (e) {
        console.warn(`[SoundService] Falha ao pré-carregar áudio: ${url}`, e);
    }
};

/**
 * Toca um áudio do cache instantaneamente.
 */
const playFromCache = (key: string, volume = 1.0): boolean => {
    const ctx = initAudioContext();
    const buffer = audioCache.get(key);
    
    if (ctx && buffer) {
        // Se o contexto foi suspenso (comum mobile), tenta retomar
        if (ctx.state === 'suspended') ctx.resume();

        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        
        source.buffer = buffer;
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        source.start(0);
        return true; // Sucesso
    }
    return false; // Não estava em cache
};

// --- 2. TTS OPTIMIZATION (Voz Sintetizada) ---

const getBestVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // Preferência: Google PT-BR (Alta qualidade) -> Microsoft/Apple PT-BR -> Qualquer PT
    let best = voices.find(v => v.lang === 'pt-BR' && v.name.includes('Google'));
    if (!best) best = voices.find(v => v.lang === 'pt-BR' && !v.name.includes('Luciana')); // Luciana iOS as vezes é lenta
    if (!best) best = voices.find(v => v.lang === 'pt-BR');
    if (!best) best = voices.find(v => v.lang.startsWith('pt'));

    return best || null;
};

const initVoices = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    // Tenta carregar voz imediatamente
    synthesisVoice = getBestVoice();

    // Listener para quando as vozes carregarem (evento assíncrono do Chrome)
    window.speechSynthesis.onvoiceschanged = () => {
        const voice = getBestVoice();
        if (voice) {
            synthesisVoice = voice;
            // console.log("Voz otimizada carregada:", voice.name);
        }
    };
};

// --- 3. UNLOCK & WARMUP (Mobile Fix) ---

const unlockAudio = () => {
    if (isUnlocked) return;
    
    const ctx = initAudioContext();
    
    // 1. Resume Web Audio
    if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => isUnlocked = true);
    }

    // 2. Play Silent Buffer (Acorda o hardware de áudio)
    if (ctx) {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
    }

    // 3. TTS Warmup (Acorda o motor de síntese sem som)
    if ('speechSynthesis' in window) {
        // Cancela qualquer coisa pendente
        window.speechSynthesis.cancel();
        // Cria uma fala vazia para inicializar o engine
        const warmUp = new SpeechSynthesisUtterance('');
        warmUp.volume = 0; 
        window.speechSynthesis.speak(warmUp);
    }

    if (!synthesisVoice) initVoices();
};

if (typeof window !== 'undefined') {
    initVoices();
    // Captura o primeiro clique em QUALQUER lugar para destravar o áudio
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    interactionEvents.forEach(evt => 
        window.addEventListener(evt, unlockAudio, { once: true, passive: true })
    );
}

// --- 4. TONE GENERATOR (Sintetizador Básico) ---

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
    try {
        const ctx = initAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        
        // Envelope ADSR simples para evitar "estouros" no som
        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    } catch (e) {}
};

const safeExec = (fn: () => void) => {
    try { fn(); } catch (e) { console.warn("Sound Error", e); }
};

// --- PUBLIC API ---

export const playSound = {
    // Pré-carrega uma lista de recursos (chame isso ao iniciar o app ou entrar na lição)
    preloadBank: (resources: Record<string, { audioUrl?: string }>) => {
        Object.keys(resources).forEach(key => {
            const item = resources[key];
            if (item.audioUrl) {
                preloadAudio(key, item.audioUrl);
            }
        });
    },

    click: () => safeExec(() => {
        // Tenta tocar cache 'click' se existir, senão gera tom
        if (!playFromCache('ui_click', 0.5)) {
            playTone(800, 'sine', 0.05, 0, 0.05);
        }
    }),

    success: () => safeExec(() => {
        if (!playFromCache('ui_success')) {
            playTone(523.25, 'sine', 0.1, 0);
            playTone(659.25, 'sine', 0.1, 0.1);
            playTone(783.99, 'sine', 0.3, 0.2);
        }
    }),

    error: () => safeExec(() => {
        if (!playFromCache('ui_error')) {
            playTone(150, 'sawtooth', 0.15, 0);
            playTone(130, 'sawtooth', 0.15, 0.15);
        }
    }),

    complete: () => safeExec(() => {
        playTone(523.25, 'triangle', 0.1, 0);
        playTone(659.25, 'triangle', 0.1, 0.1);
        playTone(783.99, 'triangle', 0.1, 0.2);
        playTone(1046.50, 'triangle', 0.5, 0.3);
    }),

    // Otimizado para letras e palavras
    speak: (text: string, cacheKey?: string) => safeExec(() => {
        // 1. Tenta tocar arquivo local (Zero Latency)
        if (cacheKey && playFromCache(cacheKey)) {
            return;
        }

        // 2. Fallback para TTS Otimizado
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        
        // CRÍTICO: Cancela imediatamente a fala anterior para não "encavalar"
        window.speechSynthesis.cancel();

        // Recupera voz cacheada ou tenta buscar novamente
        if (!synthesisVoice) synthesisVoice = getBestVoice();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurações para rapidez
        utterance.lang = 'pt-BR'; 
        utterance.rate = 1.1; // Ligeiramente mais rápido para parecer mais responsivo
        utterance.pitch = 1.0; 
        utterance.volume = 1.0;
        
        if (synthesisVoice) {
            utterance.voice = synthesisVoice;
        }

        // CRÍTICO: Mantém referência global para evitar Garbage Collection do Chrome interromper o áudio
        currentUtterance = utterance; 
        
        utterance.onend = () => {
            currentUtterance = null; // Libera memória após terminar
        };

        window.speechSynthesis.speak(utterance);
    }),

    // Garante que o sistema está acordado
    init: () => {
        unlockAudio();
    }
};