export interface ScriptLine {
  id: string;
  character: string;
  text: string;
  type: 'dialogue' | 'action' | 'parenthetical';
  emotion?: string; // AI detected emotion
  directorNote?: string; // User added note
}

export interface Character {
  name: string;
  gender: 'male' | 'female' | 'neutral';
  voiceURI?: string; // ID of the specific browser voice selected
}

export interface Script {
  id: string;
  title: string;
  author: string;
  lines: ScriptLine[];
  characters: Character[]; // Changed from string[] to Character[]
  lastPracticed?: string;
}

export interface RehearsalStats {
  totalTime: number; // minutes
  linesPracticed: number;
  accuracyScore: number;
  emotionMatchScore: number;
}

export interface AnalysisResult {
  accuracy: number;
  feedback: string;
  tone: string;
}

export interface ActingFeedback {
  accuracy: number; // 0-100
  energy: number; // 1-10
  clarity: number; // 1-10
  tone: string;
  emotionDetected: string;
  feedback: string; // Constructive coaching tip
  directorNoteAdherence?: number; // 0-10 score on how well they followed the note
  directorNoteFeedback?: string; // Feedback specific to the note
}

export enum UserRole {
  ACTOR = 'Actor',
  DIRECTOR = 'Director',
  STUDENT = 'Estudiante'
}

export type PlanType = 'free' | 'pro';

export type LanguageCode = 'es-ES' | 'en-US' | 'fr-FR' | 'pt-BR' | 'de-DE' | 'it-IT';

export interface LanguageOption {
    code: LanguageCode;
    label: string;
    flag: string;
    greeting: string;
}