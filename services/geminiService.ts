import { GoogleGenAI, Type } from "@google/genai";
import { SubjectType, Question } from "../types";
import { FREE_MODULES, getLessonByLetter, ALPHABET_DB } from "./staticDatabase";

// Initialize the API client safely
const apiKey = process.env.API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper function to sanitize JSON from AI responses
const cleanJson = (text: string): string => {
  if (!text) return "";
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "").trim();
};

export const generateLessonContent = async (
  subject: SubjectType,
  age: number,
  isPremium: boolean,
  topic?: string
): Promise<{ title: string; description: string; questions: Question[] }> => {
  
  // =========================================================
  // LOGIC 1: TABULEIRO ABC (PRIORIDADE MÁXIMA)
  // =========================================================
  if (topic && topic.startsWith("Letra ")) {
      const requestedLetter = topic.split(" ")[1];
      if (ALPHABET_DB[requestedLetter]) {
          return getLessonByLetter(requestedLetter) as unknown as { title: string; description: string; questions: Question[] };
      }
  }

  // =========================================================
  // LOGIC 2: OFFLINE / FALLBACK / FREE TIER (MÓDULOS ESTÁTICOS)
  // =========================================================
  // Se não tiver API Key (ambiente de teste) OU usuário for free, usamos banco estático robusto.
  if (!ai || !isPremium) {
      console.log(`[Content Service] Usando modo Offline/Estático para ${subject}`);
      
      // Tenta achar um módulo pronto específico
      const availableModules = FREE_MODULES.filter(m => m.subject === subject);
      
      if (availableModules.length > 0) {
          const randomModule = availableModules[Math.floor(Math.random() * availableModules.length)];
          return randomModule as unknown as { title: string; description: string; questions: Question[] };
      }
      
      // Se não achou módulo, gera um fallback específico por matéria
      return getSpecificFallback(subject);
  }

  // =========================================================
  // LOGIC 3: PREMIUM USERS (AI GENERATION)
  // =========================================================
  const modelName = "gemini-3-flash-preview";
  const specificContext = `
      Create a fun, educational mini-lesson for a child aged ${age} years old.
      Subject: ${subject}. Topic: ${topic || 'Core Concepts'}.
      Language: Portuguese (Brazil).
      Create 4 simple multiple choice questions.
  `;

  const prompt = `
    ${specificContext}
    Return pure JSON with this schema. Output MUST be valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  type: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const sanitizedText = cleanJson(response.text);
      return JSON.parse(sanitizedText) as { title: string; description: string; questions: Question[] };
    }
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Error generating lesson, reverting to fallback:", error);
    return getSpecificFallback(subject);
  }
};

// Fallback Inteligente por Matéria (Garante que o teste funcione sempre)
const getSpecificFallback = (subject: SubjectType): { title: string; description: string; questions: Question[] } => {
    switch(subject) {
        case SubjectType.ARITHMETIC:
            return {
                title: "Matemática Divertida",
                description: "Vamos contar e somar!",
                questions: [
                    { id: "f1", text: "Quanto é 2 + 2?", options: ["3", "4", "5"], correctAnswer: "4", explanation: "Dois mais dois são quatro.", type: "multiple-choice" },
                    { id: "f2", text: "Qual número é maior?", options: ["1", "9", "3"], correctAnswer: "9", explanation: "Nove é o maior aqui.", type: "multiple-choice" },
                    { id: "f3", text: "Se tenho 3 maçãs e como 1...", options: ["Ficam 2", "Ficam 3", "Acabou"], correctAnswer: "Ficam 2", explanation: "3 menos 1 é igual a 2.", type: "multiple-choice" }
                ]
            };
        case SubjectType.LOGIC:
            return {
                title: "Desafios de Lógica",
                description: "Pense rápido!",
                questions: [
                    { id: "l1", text: "O que é quente?", options: ["Gelo", "Fogo", "Água"], correctAnswer: "Fogo", explanation: "Fogo queima!", type: "multiple-choice" },
                    { id: "l2", text: "Quem vive na água?", options: ["Peixe", "Gato", "Pássaro"], correctAnswer: "Peixe", explanation: "Peixes nadam.", type: "multiple-choice" },
                    { id: "l3", text: "Qual é a forma da roda?", options: ["Quadrada", "Redonda", "Triangular"], correctAnswer: "Redonda", explanation: "Rodas rolam pois são redondas.", type: "multiple-choice" }
                ]
            };
        case SubjectType.GEOMETRY:
            return {
                title: "Formas do Mundo",
                description: "Identifique as formas.",
                questions: [
                    { id: "g1", text: "O quadrado tem quantos lados?", options: ["3", "4", "0"], correctAnswer: "4", explanation: "Quatro lados iguais.", type: "multiple-choice" },
                    { id: "g2", text: "O que parece um triângulo?", options: ["Fatia de Pizza", "Bola", "Livro"], correctAnswer: "Fatia de Pizza", explanation: "Pizza tem formato triangular.", type: "multiple-choice" }
                ]
            };
        default:
            return {
                title: "Exploração Geral",
                description: "Aprendendo um pouco de tudo.",
                questions: [
                    { id: "x1", text: "Qual cor é o céu?", options: ["Verde", "Azul", "Roxo"], correctAnswer: "Azul", explanation: "Olhe para cima!", type: "multiple-choice" },
                    { id: "x2", text: "Quantas pernas tem o gato?", options: ["2", "4", "6"], correctAnswer: "4", explanation: "Quatro patas.", type: "multiple-choice" }
                ]
            };
    }
};

export const getTutorHelp = async (question: string, age: number): Promise<string> => {
  if (!ai) return "Hoot! Olhe as imagens e tente contar com os dedinhos! (Modo Offline)";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é a coruja mágica Astra. Explique esta questão para uma criança de ${age} anos em Português.
      IMPORTANTE: Seja EXTREMAMENTE breve. Use emojis.
      Questão: ${question}`,
    });
    return response.text || "Tente de novo!";
  } catch (e) {
    return "Hoot! Olhe as cores e formas para descobrir a resposta!";
  }
};