export enum AnalysisType {
  URL = 'URL',
  CODE = 'CODE'
}

export interface BusinessDetails {
  name: string;
  industry: string;
  location: string;
  keywords: string;
  competitors: string;
}

export interface SeoScore {
  basic: number;
  technical: number;
  advanced: number;
  aeo: number;
  geo: number;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  status: 'Pass' | 'Fail' | 'Warning';
  category: 'Basic' | 'Technical' | 'Advanced' | 'AEO' | 'GEO';
  solution: string;
}

export interface KeywordData {
  keyword: string;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  difficulty: 'Hard' | 'Medium' | 'Easy';
  volume: 'High' | 'Medium' | 'Low';
}

export interface BacklinkStrategy {
  type: string;
  description: string;
  example: string;
}

export interface AuditResult {
  summary: string;
  scores: SeoScore;
  recommendations: Recommendation[];
  blogIdeas: string[];
  keywords: KeywordData[];
  backlinks: BacklinkStrategy[];
}

export interface BlogContent {
  title: string;
  content: string;
}

export interface CodeAnalysis {
  issues: string[];
  fixedCode?: string;
  explanation?: string;
}

export type LoadingState = 'idle' | 'analyzing' | 'generating_blog' | 'fixing_code' | 'error';