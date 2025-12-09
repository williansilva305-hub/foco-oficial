export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'facebook' | 'email';
}

export type QuestionStyle = 'QConcursos' | 'TecConcursos' | 'BancaReal';

export interface Question {
  id: number;
  statement: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  style: QuestionStyle;
  level: number;
  topic: string;
}

export interface Simulation {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
  style: QuestionStyle;
  score?: number;
}

export interface HeatmapItem {
  topic: string;
  frequency: string;
  probability: number; // 0-100%
  color: string;
  lastAppearance: string;
  trend: 'Crescente' | 'Estável' | 'Decrescente';
}

export interface BankProfile {
  name: string;
  styleDescription: string;
  literalityRate: number;
  jurisprudenceRate: number;
  trickeryRate: number;
  difficultyLevel: number;
  keywords: string[];
}

export interface TopicStat {
  name: string;
  frequency: number;
  trend: 'Crescente' | 'Estável' | 'Decrescente';
  probabilityNextExam: number;
  importanceLevel: 'Baixa' | 'Média' | 'Alta' | 'Muito Alta';
  relevance: number;
  reasoning?: string;
}

export interface AnalysisResult {
  profile: BankProfile;
  topicsStats: TopicStat[];
  heatmap: HeatmapItem[];
  topThemes: TopicStat[];
  abandonedThemes: string[];
  predictionReport: string;
  recommendations: { focusArea: string; action: string; priority: number }[];
  topics: { name: string; relevance: number; probability: string }[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  
  // SRS Fields
  status: 'new' | 'learning' | 'review' | 'graduated';
  nextReview: string; // ISO String
  interval: number; // days
  easeFactor: number; // default 2.5
  repetitions: number;
}

export interface MindMap {
  id: string;
  title: string;
  mermaidContent: string; // Using Mermaid for stability in CDN environment
  createdAt: string;
}

export interface StudyTask {
  day: string;
  focus: string;
  description: string;
  durationMinutes: number;
  completed?: boolean;
}

export interface StudyPlan {
  id: string;
  goal: string;
  weeklySchedule: StudyTask[];
}

export type ViewMode = 'upload' | 'dashboard' | 'analysis' | 'simulation_setup' | 'simulation_active' | 'flashcards' | 'mindmap' | 'study_plan';
