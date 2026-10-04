export interface SearchKeywords {
  indonesian: string[];
  english: string[];
}

export interface SuggestedJournalTopic {
  title: string;
  reason: string;
  searchSnippet: string;
}

export interface QuestionAnalysisResult {
  coreConcept: string;
  searchKeywords: SearchKeywords;
  recommendedQuery: string;
  theoreticalFrameworks: string[];
  suggestedJournalTopics: SuggestedJournalTopic[];
  discussionOutline: string[];
}

export interface JournalItem {
  id: string;
  title: string;
  publicationYear: number | string;
  authors: string;
  venue: string;
  isOpenAccess: boolean;
  pdfUrl: string | null;
  doi: string | null;
  url: string;
  abstract: string;
  citedByCount: number;
}

export interface PolishedAnswerResult {
  polishedText: string;
  academicToneScore: string;
  improvements: string[];
  suggestedCitationTemplate: string;
  humanizationAdvice: string;
  aiDetectorRisk?: string;
  structureScore?: string;
}

export interface TranslationResult {
  translatedText: string;
  academicNotes?: string;
  wordCount?: number;
}

export interface JournalSourceInfo {
  id: string;
  name: string;
  badge: string;
  description: string;
  urlTemplate: (query: string) => string;
  homeUrl: string;
  isFree: boolean;
  type: "nasional" | "internasional";
}

export type AiModelType = "gemini-3.1-flash-lite" | "gemini-3.8-flash";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  geminiApiKey?: string;
  preferredModel?: AiModelType;
  createdAt?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  userId: string;
  question: string;
  courseSubject: string;
  modelUsed: AiModelType;
  result: QuestionAnalysisResult;
  createdAt: number;
}

export type TabId = "ai-analyzer" | "journal-search" | "notebooklm" | "templates" | "history" | "quillbot" | "zerogpt";

export function isValidGeminiApiKey(key?: string | null): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  return (trimmed.startsWith("AIzaSy") || trimmed.startsWith("AQ")) && trimmed.length >= 15;
}
