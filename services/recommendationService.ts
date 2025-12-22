import { SubjectType, ChildProfile } from "../types";

/**
 * Simulates the AI analyzing the child's profile to determine the starting path.
 * 4-5 years: Starts with Literacy (Grammar) only.
 * 6-7 years: Literacy + Basic Math (Arithmetic).
 * 8+: Logic + Advanced Math.
 */
export const calculateLearningPath = async (age: number): Promise<{
  recommendedStart: SubjectType;
  message: string;
  initialUnlocks: SubjectType[];
}> => {
  // Simulate AI "thinking" delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (age <= 5) {
    return {
      recommendedStart: SubjectType.GRAMMAR,
      message: `Para ${age} anos, vamos brincar com o ALFABETO! 🅰️🅱️ A IA vai criar jogos com letras grandes e emojis para ensinar os sons.`,
      initialUnlocks: [SubjectType.GRAMMAR]
    };
  } else if (age <= 7) {
    return {
      recommendedStart: SubjectType.ARITHMETIC,
      message: "Fase de Alfabetização ativa! Vamos juntar as sílabas e introduzir os primeiros números (1, 2, 3...).",
      initialUnlocks: [SubjectType.GRAMMAR, SubjectType.ARITHMETIC]
    };
  } else {
    return {
      recommendedStart: SubjectType.LOGIC,
      message: "Seu filho já está pronto para leitura, interpretação e desafios de Lógica! O currículo completo do Trivium está liberado.",
      initialUnlocks: [SubjectType.GRAMMAR, SubjectType.ARITHMETIC, SubjectType.LOGIC]
    };
  }
};