
export interface Subject {
  name: string;
  mark: number;
  level: number;
}

export interface StudentProfile {
  idNumber: string;
  name: string;
  subjects: Subject[];
  apsScore: number;
}

export interface Course {
  id: string;
  institution: string;
  name: string;
  type: string;
  duration: string;
  minAps: number;
  faculty: string;
  requirements: string;
  modules: string[];
  careerOutcomes: string[];
  isUnlocked?: boolean;
  applicationDeadline?: string;
  applicationLink?: string; // New field for direct URL
}

export interface Bursary {
  id: string;
  name: string;
  provider: string;
  amount: string;
  closingDate: string;
  link: string;
}

export interface CareerPath {
  title: string;
  entrySalary: string;
  seniorSalary: string;
  growth: 'High' | 'Moderate' | 'Stable';
  demand: number; // 0-100
  description: string;
}

export interface ActionItem {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
  category: 'Application' | 'Documents' | 'Funding';
}

export interface AnalysisSummary {
  title: string; // e.g. "Strong Engineering Candidate"
  overview: string; // 1-2 sentences
  strengths: string[]; // Bullet points
  limitations: string[]; // Bullet points (e.g. "Maths Lit limits University options")
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  courses: Course[];
  bursaries: Bursary[];
  careers: CareerPath[];
  actionPlan: ActionItem[];
}

export interface ResourceItem {
  name: string;
  description: string;
  url: string;
}

export interface ResourceCategory {
  category: string;
  items: ResourceItem[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
