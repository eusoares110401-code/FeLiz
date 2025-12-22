import { GoogleGenAI, Type } from "@google/genai";
import { SubjectType, Question } from "../types";
import { FREE_MODULES, getLessonByLetter, ALPHABET_DB } from "./staticDatabase";

// Inicialização Segura da API
const apiKey = process.env.API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Função de Limpeza JSON Robusta
const cleanJson = (text: string): string => {
  if (!text) return "";
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
      return text.substring(firstBrace, lastBrace + 1);
  }
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "").trim();
};

export const generateLessonContent = async (
  subject: SubjectType,
  age: number,
  isPremium: boolean,
  topic?: string
): Promise<{ title: string; description: string; questions: Question[] }> => {
  
  // 1. Prioridade: Tabuleiro ABC
  if (topic && topic.startsWith("Letra ")) {
      const requestedLetter = topic.split(" ")[1];
      if (ALPHABET_DB[requestedLetter]) {
          return getLessonByLetter(requestedLetter) as unknown as { title: string; description: string; questions: Question[] };
      }
  }

  // 2. Fallback / Usuário Free / Sem API Key
  if (!ai || !isPremium) {
      console.log(`[GeminiService] Modo Offline/Free para ${subject}`);
      const availableModules = FREE_MODULES.filter(m => m.subject === subject);
      if (availableModules.length > 0) {
          const randomModule = availableModules[Math.floor(Math.random() * availableModules.length)];
          return randomModule as unknown as { title: string; description: string; questions: Question[] };
      }
      return getSpecificFallback(subject);
  }

  // 3. Geração via IA (Premium)
  const modelName = "gemini-3-flash-preview";
  const prompt = `
      Create a fun, educational mini-lesson for a child aged ${age} years old.
      Subject: ${subject}. Topic: ${topic || 'Core Concepts'}.
      Language: Portuguese (Brazil).
      Create 4 simple multiple choice questions.
      Return pure JSON with this schema.
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
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
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
      try {
        const sanitizedText = cleanJson(response.text);
        const parsed = JSON.parse(sanitizedText);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            return parsed;
        }
      } catch (e) {
        console.warn("JSON Parse Error on Gemini Response", e);
      }
    }
    throw new Error("Invalid response from Gemini");
  } catch (error) {
    console.error("Gemini API Error, using fallback:", error);
    return getSpecificFallback(subject);
  }
};

// Fallback Garantido (Nunca deixa o usuário na mão)
const getSpecificFallback = (subject: SubjectType): { title: string; description: string; questions: Question[] } => {
    switch(subject) {
        case SubjectType.ARITHMETIC:
            return {
                title: "Matemática Divertida",
                description: "Vamos contar!",
                questions: [
                    { id: "f1", text: "Quanto é 1 + 1?", options: ["2", "3", "4"], correctAnswer: "2", explanation: "Um mais um é dois.", type: "multiple-choice" },
                    { id: "f2", text: "Conte os dedos: ✌️", options: ["2", "5", "10"], correctAnswer: "2", explanation: "Dois dedos levantados.", type: "multiple-choice" },
                    { id: "f3", text: "Qual número vem depois do 2?", options: ["3", "1", "0"], correctAnswer: "3", explanation: "1, 2, 3!", type: "multiple-choice" }
                ]
            };
        case SubjectType.LOGIC:
            return {
                title: "Lógica Rápida",
                description: "Pense bem!",
                questions: [
                    { id: "l1", text: "O que o gato bebe?", options: ["Leite", "Pedra", "Vento"], correctAnswer: "Leite", explanation: "Gatinhos gostam de leite.", type: "multiple-choice" },
                    { id: "l2", text: "O gelo é...", options: ["Frio", "Quente", "Morno"], correctAnswer: "Frio", explanation: "Brrr! Gelo é gelado.", type: "multiple-choice" }
                ]
            };
        default:
             return {
                title: "Descobertas Gerais",
                description: "Aprendendo sobre o mundo.",
                questions: [
                    { id: "g1", text: "Qual é a cor da banana?", options: ["Amarela", "Azul", "Rosa"], correctAnswer: "Amarela", explanation: "Bananas maduras são amarelas.", type: "multiple-choice" },
                    { id: "g2", text: "O peixe vive...", options: ["Na água", "Na árvore", "No céu"], correctAnswer: "Na água", explanation: "Peixes nadam na água.", type: "multiple-choice" }
                ]
            };
    }
};

export const getTutorHelp = async (question: string, age: number): Promise<string> => {
  if (!ai) return "Hoot! Olhe as imagens e tente contar com os dedinhos! (Modo Offline)";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explique para criança de ${age} anos: ${question}. Responda em 1 frase curta com emoji.`,
    });
    return response.text || "Pense com carinho!";
  } catch (e) {
    return "Hoot! Você consegue!";
  }
};