export enum AppView {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  MAP = 'MAP',
  LESSON = 'LESSON',
  PARENT_DASHBOARD = 'PARENT_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  PREMIUM_WALL = 'PREMIUM_WALL'
}

export enum SubjectType {
  // Trivium
  GRAMMAR = 'GRAMMAR', // Alfabetização
  LOGIC = 'LOGIC',
  RHETORIC = 'RHETORIC',
  // Quadrivium
  ARITHMETIC = 'ARITHMETIC',
  GEOMETRY = 'GEOMETRY',
  MUSIC = 'MUSIC',
  ASTRONOMY = 'ASTRONOMY',
}

// Entidade de Usuário (Reflete o Banco de Dados)
export interface UserProfile {
  id: string;
  email: string;
  name: string; // Nome da criança
  parentName?: string;
  age: number;
  avatar: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
  
  // Gamification Data
  xp: number;
  level: number;
  streak: number;
  unlockedSubjects: SubjectType[];
  masteredLetters: string[]; // Novidade: Lista de letras aprendidas (ex: ['A', 'C'])

  // Subscription Data
  isPremium: boolean;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'free';
  subscriptionPlan?: 'monthly' | 'yearly' | null;
  subscriptionRenewsAt?: string;
}

export type ChildProfile = UserProfile;

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: 'multiple-choice' | 'true-false';
}

export interface Lesson {
  id: string;
  subject: SubjectType;
  title: string;
  description: string;
  questions: Question[];
  xpReward: number;
}

// Tipos para Analytics e Admin
export interface Transaction {
  id: string;
  userEmail: string;
  amount: number;
  date: string;
  status: 'succeeded' | 'failed' | 'refunded';
  plan: 'monthly' | 'yearly';
}

export interface KPI {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  activeUsers: number;
  churnRate: number;
  conversionRate: number;
}