import { Question, SubjectType } from "../types";

/**
 * ESTE É O SEU "BANCO DE DADOS" ESTÁTICO E SÓLIDO.
 * 
 * Vantagens:
 * 1. Zero Delay: O conteúdo já está no app.
 * 2. Curadoria Pedagógica: As 7 lições base são perfeitas, criadas por humanos, não IA.
 * 3. Base para Áudio: A estrutura 'audioPhonetic' prepara o terreno para arquivos .mp3 reais.
 */

// =====================================================================
// 1. O TABULEIRO ABC (DATABASE DE LETRAS E SONS)
// =====================================================================
export interface LetterData {
    letter: string;
    word: string;
    emoji: string;
    phoneticText: string; // O texto exato para o sintetizador (ou nome do arquivo mp3 futuro)
    audioUrl?: string; // Futuro: 'assets/audio/letter_a.mp3'
}

export const ALPHABET_DB: Record<string, LetterData> = {
    A: { letter: "A", word: "Avião", emoji: "✈️", phoneticText: "Áhhh. A de Avião." },
    B: { letter: "B", word: "Bola", emoji: "⚽", phoneticText: "Bê. A letra Bê tem som de Bú. Bola." },
    C: { letter: "C", word: "Casa", emoji: "🏠", phoneticText: "Cê. A letra Cê. Casa." },
    D: { letter: "D", word: "Dado", emoji: "🎲", phoneticText: "Dê. Dado." },
    E: { letter: "E", word: "Elefante", emoji: "🐘", phoneticText: "Éhhh. E de Elefante." },
    F: { letter: "F", word: "Faca", emoji: "🔪", phoneticText: "Éfe. Faca." },
    G: { letter: "G", word: "Gato", emoji: "🐱", phoneticText: "Gê. Gato." },
    H: { letter: "H", word: "Hipopótamo", emoji: "🦛", phoneticText: "Agá. Hipopótamo." },
    I: { letter: "I", word: "Ilha", emoji: "🏝️", phoneticText: "Íiii. Ilha." },
    J: { letter: "J", word: "Jacaré", emoji: "🐊", phoneticText: "Jóta. Jacaré." },
    K: { letter: "K", word: "Kiwi", emoji: "🥝", phoneticText: "Cá. Kiwi." },
    L: { letter: "L", word: "Leão", emoji: "🦁", phoneticText: "Éle. Leão." },
    M: { letter: "M", word: "Macaco", emoji: "🐒", phoneticText: "Ême. Macaco." },
    N: { letter: "N", word: "Navio", emoji: "🚢", phoneticText: "Êne. Navio." },
    O: { letter: "O", word: "Ovo", emoji: "🥚", phoneticText: "Óhh. Ovo." },
    P: { letter: "P", word: "Pato", emoji: "🦆", phoneticText: "Pê. Pato." },
    Q: { letter: "Q", word: "Queijo", emoji: "🧀", phoneticText: "Quê. Queijo." },
    R: { letter: "R", word: "Rato", emoji: "🐭", phoneticText: "Érre. Rato." },
    S: { letter: "S", word: "Sol", emoji: "☀️", phoneticText: "Ésse. Sol." },
    T: { letter: "T", word: "Tatu", emoji: "🦔", phoneticText: "Tê. Tatu." },
    U: { letter: "U", word: "Uva", emoji: "🍇", phoneticText: "Úuu. Uva." },
    V: { letter: "V", word: "Vaca", emoji: "🐮", phoneticText: "Vê. Vaca." },
    W: { letter: "W", word: "Web", emoji: "🌐", phoneticText: "Dábliu. Web." },
    X: { letter: "X", word: "Xícara", emoji: "☕", phoneticText: "Xis. Xícara." },
    Y: { letter: "Y", word: "YouTube", emoji: "📺", phoneticText: "Ípsilon. YouTube." },
    Z: { letter: "Z", word: "Zebra", emoji: "🦓", phoneticText: "Zê. Zebra." }
};

// =====================================================================
// 2. CURRÍCULO BASE SÓLIDA (7 MÓDULOS GRATUITOS)
// =====================================================================
export interface PredefinedLesson {
    id: string;
    subject: SubjectType;
    title: string;
    description: string;
    questions: Question[];
}

export const FREE_MODULES: PredefinedLesson[] = [
    {
        id: "mod_1_vogais",
        subject: SubjectType.GRAMMAR,
        title: "Módulo 1: As Vogais Mágicas",
        description: "A base de todas as palavras! Vamos conhecer A, E, I, O, U.",
        questions: [
            { id: "1", text: "Qual destas é a letra A?", options: ["A", "B", "C"], correctAnswer: "A", explanation: "A de Avião!", type: "multiple-choice" },
            { id: "2", text: "Toque na Uva! 🍇", options: ["🍇", "🍎", "🍌"], correctAnswer: "🍇", explanation: "U de Uva!", type: "multiple-choice" },
            { id: "3", text: "Que som a letra E faz?", options: ["Éhhh", "Buh", "Sss"], correctAnswer: "Éhhh", explanation: "É de Elefante!", type: "multiple-choice" },
            { id: "4", text: "Quem começa com O?", options: ["Ovo", "Pato", "Gato"], correctAnswer: "Ovo", explanation: "O de Ovo!", type: "multiple-choice" }
        ]
    },
    {
        id: "mod_2_encontros",
        subject: SubjectType.GRAMMAR,
        title: "Módulo 2: Encontros Vocálicos",
        description: "Quando as vogais dão as mãos! AI, OI, AU.",
        questions: [
            { id: "1", text: "O cachorro faz...", options: ["AU", "MIAU", "PIU"], correctAnswer: "AU", explanation: "A + U = AU!", type: "multiple-choice" },
            { id: "2", text: "Quando eu me machuco eu digo...", options: ["AI", "OI", "EI"], correctAnswer: "AI", explanation: "A + I = AI!", type: "multiple-choice" },
            { id: "3", text: "Para cumprimentar o amigo dizemos...", options: ["OI", "UI", "AU"], correctAnswer: "OI", explanation: "O + I = OI!", type: "multiple-choice" }
        ]
    },
    {
        id: "mod_3_consoantes_1",
        subject: SubjectType.GRAMMAR,
        title: "Módulo 3: Primeiras Consoantes",
        description: "B de Bola, C de Casa, D de Dado.",
        questions: [
            { id: "1", text: "Toque na BOLA ⚽", options: ["⚽", "🏠", "🎲"], correctAnswer: "⚽", explanation: "B de Bola!", type: "multiple-choice" },
            { id: "2", text: "Qual letra vem depois do B?", options: ["C", "A", "H"], correctAnswer: "C", explanation: "A, B, C!", type: "multiple-choice" },
            { id: "3", text: "D de...", options: ["Dado", "Sapo", "Pato"], correctAnswer: "Dado", explanation: "D de Dado!", type: "multiple-choice" }
        ]
    },
    {
        id: "mod_4_numeros_1_5",
        subject: SubjectType.ARITHMETIC,
        title: "Módulo 4: Contando até 5",
        description: "Um, dois, três indiozinhos...",
        questions: [
            { id: "1", text: "Quantos dedos temos em uma mão?", options: ["5", "2", "10"], correctAnswer: "5", explanation: "Cinco dedos!", type: "multiple-choice" },
            { id: "2", text: "Conte os patinhos: 🦆🦆", options: ["2", "3", "1"], correctAnswer: "2", explanation: "Dois patinhos!", type: "multiple-choice" },
            { id: "3", text: "Qual número é este: 3", options: ["Três", "Um", "Cinco"], correctAnswer: "Três", explanation: "Este é o número 3.", type: "multiple-choice" }
        ]
    },
    {
        id: "mod_5_somas_simples",
        subject: SubjectType.ARITHMETIC,
        title: "Módulo 5: Juntando Coisas",
        description: "Introdução à soma com visual.",
        questions: [
            { id: "1", text: "🍎 + 🍎 = ?", options: ["2", "1", "3"], correctAnswer: "2", explanation: "Uma maçã mais uma maçã são duas!", type: "multiple-choice" },
            { id: "2", text: "Se tenho 1 bala e ganho mais 2...", options: ["3", "2", "5"], correctAnswer: "3", explanation: "Fico com 3 balas!", type: "multiple-choice" }
        ]
    },
    {
        id: "mod_6_formas",
        subject: SubjectType.GEOMETRY,
        title: "Módulo 6: Formas e Cores",
        description: "O mundo das formas geométricas.",
        questions: [
            { id: "1", text: "Qual forma parece uma Bola? ⚽", options: ["Círculo", "Quadrado", "Triângulo"], correctAnswer: "Círculo", explanation: "A bola é um círculo!", type: "multiple-choice" },
            { id: "2", text: "O quadrado tem quantos lados?", options: ["4", "3", "1"], correctAnswer: "4", explanation: "Quatro lados iguais.", type: "multiple-choice" },
            { id: "3", text: "Qual cor é o Sol? ☀️", options: ["Amarelo", "Azul", "Vermelho"], correctAnswer: "Amarelo", explanation: "O sol brilha amarelo!", type: "multiple-choice" }
        ]
    },
    {
        id: "mod_7_logica_basica",
        subject: SubjectType.LOGIC,
        title: "Módulo 7: Lógica - O Intruso",
        description: "Desenvolvendo o raciocínio lógico.",
        questions: [
            { id: "1", text: "Quem NÃO é animal?", options: ["Mesa", "Gato", "Cachorro"], correctAnswer: "Mesa", explanation: "A mesa é um objeto!", type: "multiple-choice" },
            { id: "2", text: "O que usamos nos pés?", options: ["Sapato", "Chapéu", "Luva"], correctAnswer: "Sapato", explanation: "Sapatos vão nos pés.", type: "multiple-choice" },
            { id: "3", text: "Dia e...", options: ["Noite", "Escuro", "Lua"], correctAnswer: "Noite", explanation: "O contrário de dia é noite.", type: "multiple-choice" }
        ]
    }
];

export const getLessonByLetter = (letter: string): PredefinedLesson => {
    const data = ALPHABET_DB[letter] || ALPHABET_DB['A'];
    const allLetters = Object.keys(ALPHABET_DB);
    const distractors = allLetters.filter(l => l !== letter).sort(() => 0.5 - Math.random()).slice(0, 3);
    const distractorEmojis = [ALPHABET_DB[distractors[0]].emoji, ALPHABET_DB[distractors[1]].emoji];

    return {
        id: `letter_${letter}`,
        subject: SubjectType.GRAMMAR,
        title: `A Letra ${letter}`,
        description: `Aprendendo o som e a forma do ${letter}.`,
        questions: [
            {
                id: "1",
                text: `Esta é a letra ${letter}. Toque nela!`,
                options: [letter, distractors[0], distractors[1]].sort(() => 0.5 - Math.random()),
                correctAnswer: letter,
                explanation: `Muito bem! ${data.phoneticText}`,
                type: "multiple-choice"
            },
            {
                id: "2",
                text: `${letter} de ${data.word}! ${data.emoji}. O que começa com ${letter}?`,
                options: [data.emoji, distractorEmojis[0], distractorEmojis[1]].sort(() => 0.5 - Math.random()),
                correctAnswer: data.emoji,
                explanation: `${letter} de ${data.word}.`,
                type: "multiple-choice"
            },
            {
                id: "3",
                text: `Qual letra tem som de "${data.word}"?`,
                options: [distractors[2], letter, distractors[0]].sort(() => 0.5 - Math.random()),
                correctAnswer: letter,
                explanation: `Isso! O ${letter} faz esse som.`,
                type: "multiple-choice"
            }
        ]
    };
};