// src/types.ts

export interface Student {
  id: string;
  studentId?: string; // Optional student registration ID
  name: string;
  teacherComment?: string; // Homeroom teacher's written remarks
  conduct?: string; // Student Conduct Rating (e.g. A, B, C)
  fields?: Record<string, any>; // Dynamic custom fields (age, gender, etc.)
}

export interface Subject {
  id: string;
  name: string;
  maxMarks: number;
}

export interface Mark {
  studentId: string;
  subjectId: string;
  score: number | '';
}

export interface SchoolInfo {
  name: string;
  academicYear: string;
  logoBase64?: string;
  stampBase64?: string; // School stamp
  address?: string;
  directorName?: string;
  viceDirectorName?: string;
  homeroomTeacherName?: string;
  evaluatorName?: string;
  selectedTemplateId?: string;
}

export interface CustomRule {
  id: string;
  classId?: string;
  metric: 'average' | 'failedSubjects' | 'failedSubjectsThresholdWithAvg';
  operator: 'gte' | 'lte' | 'gt' | 'lt';
  value: number;
  secondaryThreshold?: number; // Secondary Average required if value threshold exceeded
  outcome: 'promote' | 'detain';
}

export interface GradingConfig {
  passingMark: number;
  minPassedSubjectsToPromote: number;
  autoSaveIntervalMs: number;
}

export type AppLanguage = 'en' | 'am' | 'om';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  isDefault?: boolean;
}

export interface VirtualFile {
  id: string;
  name: string;
  parentId: string | null;
  isFolder: boolean;
  data?: {
    students: Student[];
    subjects: Subject[];
    marksSem1: Record<string, Record<string, Mark>>; // Semester 1 sandbox
    marksSem2: Record<string, Record<string, Mark>>; // Semester 2 sandbox
    config: GradingConfig;
    schoolInfo: SchoolInfo;
    customRules: CustomRule[];
    studentFields: FieldConfig[];
  };
}