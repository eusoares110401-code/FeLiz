import React from 'react';
import { SubjectType } from './types';
import { 
  BookOpen, 
  BrainCircuit, 
  MessageCircle, 
  Calculator, 
  Shapes, 
  Music, 
  Telescope,
  Sparkles
} from 'lucide-react';

// ==========================================
// CONFIGURAÇÃO DE PAGAMENTO
// ==========================================
// Substitua esta URL pelo seu Link de Pagamento do Stripe real
// (Stripe Dashboard -> Produtos -> Criar Link de Pagamento)
export const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_seu_link_aqui"; 

export const SUBJECT_CONFIG: Record<SubjectType, { 
  label: string; 
  color: string; 
  icon: React.ReactNode; 
  description: string;
  longDescription: string;
  skills: string[]; // Lista de competências aprendidas
}> = {
  [SubjectType.GRAMMAR]: {
    label: 'Alfabetização Mágica',
    color: 'bg-rose-500',
    icon: <Sparkles className="w-6 h-6 text-white" />,
    description: 'Aprenda o ABC: Letra por Letra',
    longDescription: 'O início de tudo! Ensinamos o alfabeto do zero, letra por letra. A criança aprende o desenho da letra, o som que ela faz e a primeira palavra, com muita repetição lúdica e visual.',
    skills: ['Reconhecimento Visual (A-Z)', 'Fonética Inicial (Sons)', 'Vogais', 'Associação Letra-Imagem', 'Coordenação Motora Fina']
  },
  [SubjectType.LOGIC]: {
    label: 'Lógica',
    color: 'bg-sky-500',
    icon: <BrainCircuit className="w-6 h-6 text-white" />,
    description: 'O processamento: Conectar os fatos.',
    longDescription: 'Com os dados na cabeça, a Lógica ensina a processar. A criança aprende a responder "Por quê?", identifica sequências, entende causa e efeito e começa a separar a verdade da mentira (falácias simples).',
    skills: ['Causa e Efeito', 'Sequências Lógicas', 'Categorização', 'Verdadeiro ou Falso', 'Resolução de Problemas']
  },
  [SubjectType.RHETORIC]: {
    label: 'Retórica',
    color: 'bg-amber-500',
    icon: <MessageCircle className="w-6 h-6 text-white" />,
    description: 'A expressão: Comunicar com sabedoria.',
    longDescription: 'O topo do Trivium. A criança pega o que aprendeu e entendeu, e agora expressa. Ensinamos a contar histórias com começo, meio e fim, a falar com clareza e a usar a criatividade para persuadir.',
    skills: ['Contação de Histórias', 'Expressão Verbal', 'Poesia e Rimas', 'Persuasão Básica', 'Organização de Ideias']
  },
  [SubjectType.ARITHMETIC]: {
    label: 'Aritmética',
    color: 'bg-emerald-500',
    icon: <Calculator className="w-6 h-6 text-white" />,
    description: 'Os Números: Quantidade pura.',
    longDescription: 'O estudo dos números em si. Não é apenas decorar tabuada, é entender o conceito de quantidade, pares e ímpares, e como os números se comportam nas quatro operações básicas.',
    skills: ['Contagem e Quantidade', 'Adição e Subtração', 'Pares e Ímpares', 'Frações Visuais', 'Tabuada Lúdica']
  },
  [SubjectType.GEOMETRY]: {
    label: 'Geometria',
    color: 'bg-indigo-500',
    icon: <Shapes className="w-6 h-6 text-white" />,
    description: 'O Espaço: Números parados.',
    longDescription: 'Geometria é o número no espaço. Ensinamos a criança a ver padrões visuais, simetria, formas planas e espaciais (2D e 3D) e a entender sua posição no mundo físico.',
    skills: ['Formas 2D e 3D', 'Simetria e Padrões', 'Noção Espacial', 'Medidas e Tamanhos', 'Ângulos Visuais']
  },
  [SubjectType.MUSIC]: {
    label: 'Música',
    color: 'bg-pink-500',
    icon: <Music className="w-6 h-6 text-white" />,
    description: 'A Harmonia: Números no tempo.',
    longDescription: 'Música clássica é matemática audível. Estudamos ritmo, proporção e harmonia. Isso desenvolve a inteligência matemática intuitiva e a sensibilidade da criança para o belo.',
    skills: ['Ritmo e Compasso', 'Notas Musicais', 'Harmonia de Sons', 'Padrões Auditivos', 'Instrumentos']
  },
  [SubjectType.ASTRONOMY]: {
    label: 'Astronomia',
    color: 'bg-purple-600',
    icon: <Telescope className="w-6 h-6 text-white" />,
    description: 'O Cosmos: Geometria em movimento.',
    longDescription: 'A aplicação final. Observar os ciclos da natureza (dia/noite, estações), o movimento dos astros e o tempo. É a conexão da criança com a ordem do universo.',
    skills: ['Dia e Noite', 'Estações do Ano', 'Sistema Solar', 'Ciclos do Tempo', 'Constelações']
  },
};

export const MOCK_CHILD: any = { 
  id: '1',
  name: 'Leo',
  age: 6,
  xp: 1250,
  level: 4,
  streak: 5,
  avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Leo',
  isAdmin: true // Flag to show admin button
};