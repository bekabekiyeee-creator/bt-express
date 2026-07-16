// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { translations } from './translations';
import { ReportCard } from './templates';
import { userManuals, chatbotDatabase, type ChatbotQA } from './helpData';
import type { Student, Subject, Mark, GradingConfig, AppLanguage, SchoolInfo, CustomRule, VirtualFile, FieldConfig } from './types';
import { FileDown, FileUp, Settings, Users, BookOpen, Grid, FileText, Plus, Trash2, ArrowUpDown, Sparkles, Printer, FolderPlus, FilePlus, Folder, HelpCircle, MessageSquare } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'setup' | 'students' | 'subjects' | 'marks' | 'reports'>('setup');
  const [reportSubTab, setReportSubTab] = useState<'class' | 'cards' | 'sheets'>('class');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Local State Modifiers
  const [sortAlphabetically, setSortAlphabetically] = useState<boolean>(false);
  const [reportSortBy, setReportSortBy] = useState<'rank' | 'alpha'>('rank');
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [enteringSemester, setEnteringSemester] = useState<'sem1' | 'sem2'>('sem1');
  const [reportSemester, setReportSemester] = useState<'sem1' | 'sem2' | 'annual'>('annual');
  const [printTargetStudentId, setPrintTargetStudentId] = useState<string | null>(null);
  const [printTargetChunkIndex, setPrintTargetChunkIndex] = useState<number | null>(null);

  // Help & Chatbot Modals States
  const [showHelpModal, setShowShowHelpModal] = useState<boolean>(false);
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);

  // Directory explorer live queries
  const filesList = useLiveQuery(() => db.files.toArray()) || [];
  const dbLanguage = useLiveQuery(() => db.settings.get('language'));
  const dbActiveFileId = useLiveQuery(() => db.settings.get('activeFileId'));

  const language: AppLanguage = dbLanguage?.value || 'en';
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Restore active loaded file context on load
  useEffect(() => {
    if (dbActiveFileId?.value) {
      setActiveFileId(dbActiveFileId.value);
    } else if (filesList.length > 0) {
      const firstFile = filesList.find(f => !f.isFolder);
      if (firstFile) {
        setActiveFileId(firstFile.id);
      }
    }
  }, [dbActiveFileId, filesList]);

  // Local sandbox files states (instantly reactive)
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marksSem1, setMarksSem1] = useState<Record<string, Record<string, Mark>>>({});
  const [marksSem2, setMarksSem2] = useState<Record<string, Record<string, Mark>>>({});
  const [config, setConfig] = useState<GradingConfig>({ passingMark: 50, minPassedSubjectsToPromote: 2, autoSaveIntervalMs: 5000 });
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({ name: '', academicYear: '', selectedTemplateId: 't1' });
  const [studentFields, setStudentFields] = useState<FieldConfig[]>([
    { name: 'age', label: 'Age', type: 'number', isDefault: true },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], isDefault: true },
    { name: 'birthDate', label: 'Birth Date', type: 'date', isDefault: true }
  ]);
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);

  const t = translations[language];

  // Helper chunk generator for mark sheets
  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  // Load selected workspace file
  useEffect(() => {
    const loadFile = async () => {
      if (!activeFileId) return;
      const fileObj = await db.files.get(activeFileId);
      if (fileObj && fileObj.data) {
        setActiveFileName(fileObj.name);
        setStudents(fileObj.data.students || []);
        setSubjects(fileObj.data.subjects || []);
        setMarksSem1(fileObj.data.marksSem1 || {});
        setMarksSem2(fileObj.data.marksSem2 || {});
        setConfig(fileObj.data.config || { passingMark: 50, minPassedSubjectsToPromote: 2, autoSaveIntervalMs: 5000 });
        setSchoolInfo(fileObj.data.schoolInfo || { name: '', academicYear: '', selectedTemplateId: 't1' });
        setStudentFields(fileObj.data.studentFields || [
          { name: 'age', label: 'Age', type: 'number', isDefault: true },
          { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], isDefault: true },
          { name: 'birthDate', label: 'Birth Date', type: 'date', isDefault: true }
        ]);
        setCustomRules(fileObj.data.customRules || []);
      }
    };
    loadFile();
  }, [activeFileId]);

  // Debounced Auto-Save back to IndexedDB [1]
  useEffect(() => {
    if (!activeFileId || isTestMode) return;

    const commitWorkspaceToDB = async () => {
      const fileObj = await db.files.get(activeFileId);
      if (fileObj) {
        await db.files.put({
          id: activeFileId,
          name: fileObj.name,
          parentId: fileObj.parentId,
          isFolder: false,
          data: {
            students,
            subjects,
            marksSem1,
            marksSem2,
            config,
            schoolInfo,
            customRules,
            studentFields
          }
        });
        setStatusMessage(t.autoSaved);
        setTimeout(() => setStatusMessage(''), 1500);
      }
    };

    const delay = setTimeout(commitWorkspaceToDB, 800);
    return () => clearTimeout(delay);
  }, [students, subjects, marksSem1, marksSem2, config, schoolInfo, customRules, studentFields, activeFileId, isTestMode, t.autoSaved]);

  // Test Mode Dummy datasets
  const testStudents: Student[] = [
    { id: 'test1', name: 'Abebe Kebede', studentId: 'ST-0091', conduct: 'A', fields: { age: 14, gender: 'Male', birthDate: '2012-05-12' } },
    { id: 'test2', name: 'Chaltu Alemu', studentId: 'ST-0092', conduct: 'B', fields: { age: 13, gender: 'Female', birthDate: '2013-08-20' } },
    { id: 'test3', name: 'Bonsa Gemechu', studentId: 'ST-0093', conduct: 'A', fields: { age: 15, gender: 'Male', birthDate: '2011-03-10' } },
    { id: 'test4', name: 'Marta Hailu', studentId: 'ST-0094', conduct: 'C', fields: { age: 14, gender: 'Female', birthDate: '2012-11-25' } }
  ];

  const testMarksSem1: Record<string, Record<string, Mark>> = {
    'test1': { 'sub1': { studentId: 'test1', subjectId: 'sub1', score: 85 }, 'sub2': { studentId: 'test1', subjectId: 'sub2', score: 90 }, 'sub3': { studentId: 'test1', subjectId: 'sub3', score: 45 } },
    'test2': { 'sub1': { studentId: 'test2', subjectId: 'sub1', score: 48 }, 'sub2': { studentId: 'test2', subjectId: 'sub2', score: 55 }, 'sub3': { studentId: 'test2', subjectId: 'sub3', score: 30 } },
    'test3': { 'sub1': { studentId: 'test3', subjectId: 'sub1', score: 92 }, 'sub2': { studentId: 'test3', subjectId: 'sub2', score: 88 }, 'sub3': { studentId: 'test3', subjectId: 'sub3', score: 95 } },
    'test4': { 'sub1': { studentId: 'test4', subjectId: 'sub1', score: 40 }, 'sub2': { studentId: 'test4', subjectId: 'sub2', score: 42 }, 'sub3': { studentId: 'test4', subjectId: 'sub3', score: 38 } }
  };

  const testMarksSem2: Record<string, Record<string, Mark>> = {
    'test1': { 'sub1': { studentId: 'test1', subjectId: 'sub1', score: 88 }, 'sub2': { studentId: 'test1', subjectId: 'sub2', score: 85 }, 'sub3': { studentId: 'test1', subjectId: 'sub3', score: 78 } },
    'test2': { 'sub1': { studentId: 'test2', subjectId: 'sub1', score: 50 }, 'sub2': { studentId: 'test2', subjectId: 'sub2', score: 62 }, 'sub3': { studentId: 'test2', subjectId: 'sub3', score: 70 } },
    'test3': { 'sub1': { studentId: 'test3', subjectId: 'sub1', score: 95 }, 'sub2': { studentId: 'test3', subjectId: 'sub2', score: 90 }, 'sub3': { studentId: 'test3', subjectId: 'sub3', score: 92 } },
    'test4': { 'sub1': { studentId: 'test4', subjectId: 'sub1', score: 45 }, 'sub2': { studentId: 'test4', subjectId: 'sub2', score: 48 }, 'sub3': { studentId: 'test4', subjectId: 'sub3', score: 42 } }
  };

  const activeStudentsList = isTestMode ? testStudents : students;
  const sortedStudents = [...activeStudentsList].sort((a, b) => {
    if (sortAlphabetically) return a.name.localeCompare(b.name);
    return 0;
  });

  const activeMarksSem1Map = isTestMode ? testMarksSem1 : marksSem1;
  const activeMarksSem2Map = isTestMode ? testMarksSem2 : marksSem2;

  const currentMarksMap = enteringSemester === 'sem1' ? activeMarksSem1Map : activeMarksSem2Map;

  // Dynamic School branding placeholders
  const getBrandingValue = (key: keyof SchoolInfo) => {
    if (isTestMode) {
      if (key === 'name') return 'BT Express Academy';
      if (key === 'academicYear') return '2026/2027';
      if (key === 'directorName') return 'Ato Chala Tolosa';
      if (key === 'homeroomTeacherName') return 'W/ro Tigist Abebe';
      if (key === 'viceDirectorName') return 'Ato Bekele Kenesa';
      if (key === 'evaluatorName') return 'Dr. Aster Gemeda';
      if (key === 'address') return 'Nekemte, Ethiopia';
    }
    return schoolInfo[key] || '';
  };

  // Directory Tree selectors
  const selectWorkspaceFile = async (id: string) => {
    await db.settings.put({ key: 'activeFileId', value: id });
  };

  const createWorkspaceFolder = async () => {
    const name = prompt("Enter Folder Name:");
    if (!name) return;
    const newFolder: VirtualFile = { id: 'fold_' + Date.now().toString(), name, parentId: null, isFolder: true };
    await db.files.add(newFolder);
  };

  const createWorkspaceFile = async (parentId: string | null = null) => {
    const name = prompt("Enter Class Name (e.g. Grade 10B.bte):");
    if (!name) return;
    const cleanName = name.endsWith('.bte') ? name : name + '.bte';
    const newFile: VirtualFile = {
      id: 'file_' + Date.now().toString(),
      name: cleanName,
      parentId,
      isFolder: false,
      data: {
        students: [],
        subjects: [],
        marksSem1: {},
        marksSem2: {},
        config: { passingMark: 50, minPassedSubjectsToPromote: 2, autoSaveIntervalMs: 5000 },
        schoolInfo: { name: '', academicYear: '', address: '', selectedTemplateId: 't1' },
        customRules: [],
        studentFields: [
          { name: 'age', label: 'Age', type: 'number', isDefault: true },
          { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], isDefault: true },
          { name: 'birthDate', label: 'Birth Date', type: 'date', isDefault: true }
        ]
      }
    };
    await db.files.add(newFile);
    await selectWorkspaceFile(newFile.id);
  };

  const deleteWorkspaceItem = async (id: string, isFolder: boolean) => {
    if (!confirm("Are you sure? All data inside this node will be deleted.")) return;
    if (isFolder) {
      await db.files.delete(id);
      await db.files.where('parentId').equals(id).delete();
    } else {
      await db.files.delete(id);
      if (activeFileId === id) {
        const nextFile = filesList.find(f => !f.isFolder && f.id !== id);
        await db.settings.put({ key: 'activeFileId', value: nextFile ? nextFile.id : '' });
      }
    }
  };

  const handleImportToTree = (e: React.ChangeEvent<HTMLInputElement>, folderId: string | null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const fileId = 'file_' + Date.now().toString();
        await db.files.add({
          id: fileId,
          name: file.name,
          parentId: folderId,
          isFolder: false,
          data: {
            students: parsed.students || [],
            subjects: parsed.subjects || [],
            marksSem1: parsed.marksSem1 || parsed.marks || {},
            marksSem2: parsed.marksSem2 || {},
            config: parsed.config || { passingMark: 50, minPassedSubjectsToPromote: 2, autoSaveIntervalMs: 5000 },
            schoolInfo: parsed.schoolInfo || { name: 'BT Academy', academicYear: '2026/2027', selectedTemplateId: 't1' },
            customRules: parsed.customRules || [],
            studentFields: parsed.studentFields || [
              { name: 'age', label: 'Age', type: 'number', isDefault: true },
              { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], isDefault: true },
              { name: 'birthDate', label: 'Birth Date', type: 'date', isDefault: true }
            ]
          }
        });
        await selectWorkspaceFile(fileId);
        alert("File imported into workspace successfully!");
      } catch {
        alert("Invalid file structure.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportBTEGlobal = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImportToTree(e, null);
  };

  const handleExportBTE = () => {
    const exportData = {
      students,
      subjects,
      marksSem1,
      marksSem2,
      config,
      schoolInfo,
      customRules,
      studentFields
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFileName || 'class_data.bte';
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage(t.saveSuccess);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // State update handlers
  const updateSchoolInfo = (fields: Partial<SchoolInfo>) => {
    setSchoolInfo({ ...schoolInfo, ...fields });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSchoolInfo({ logoBase64: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSchoolInfo({ stampBase64: reader.result as string });
    reader.readAsDataURL(file);
  };

  const addStudent = () => {
    if (isTestMode) return;
    const newStudent: Student = {
      id: 'st_' + Date.now().toString(),
      studentId: '',
      name: 'New Student Name',
      teacherComment: '',
      conduct: '',
      fields: {}
    };
    setStudents([...students, newStudent]);
  };

  const updateStudentName = (id: string, name: string) => {
    if (isTestMode) return;
    setStudents(students.map(s => s.id === id ? { ...s, name } : s));
  };

  const updateStudentID = (id: string, studentId: string) => {
    if (isTestMode) return;
    setStudents(students.map(s => s.id === id ? { ...s, studentId } : s));
  };

  const updateStudentComment = (id: string, teacherComment: string) => {
    if (isTestMode) return;
    setStudents(students.map(s => s.id === id ? { ...s, teacherComment } : s));
  };

  const updateStudentConduct = (id: string, conduct: string) => {
    if (isTestMode) return;
    setStudents(students.map(s => s.id === id ? { ...s, conduct } : s));
  };

  const updateStudentDynamicField = (studentId: string, fieldName: string, value: any) => {
    if (isTestMode) return;
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const currentFields = s.fields || {};
        return { ...s, fields: { ...currentFields, [fieldName]: value } };
      }
      return s;
    }));
  };

  const deleteStudent = (studentId: string) => {
    if (isTestMode) return;
    setStudents(students.filter(s => s.id !== studentId));
    
    const updatedS1 = { ...marksSem1 };
    delete updatedS1[studentId];
    setMarksSem1(updatedS1);

    const updatedS2 = { ...marksSem2 };
    delete updatedS2[studentId];
    setMarksSem2(updatedS2);
  };

  const addCustomField = () => {
    const label = prompt("Enter Custom Field Label (e.g. Conduct):");
    if (!label) return;
    const name = label.toLowerCase().replace(/\s+/g, '_');
    setStudentFields([...studentFields, { name, label, type: 'text' }]);
  };

  const deleteStudentField = (fieldName: string) => {
    setStudentFields(studentFields.filter(f => f.name !== fieldName));
  };

  const addSubject = () => {
    const newSub: Subject = { id: 'sub_' + Date.now().toString(), name: 'New Subject', maxMarks: 100 };
    setSubjects([...subjects, newSub]);
  };

  const updateSubjectName = (id: string, name: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, name } : s));
  };

  const updateSubjectMaxMarks = (id: string, maxMarks: number) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, maxMarks } : s));
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    
    const cleanMarks = (m: Record<string, Record<string, Mark>>) => {
      const updated = { ...m };
      Object.keys(updated).forEach(stId => {
        if (updated[stId]) delete updated[stId][subjectId];
      });
      return updated;
    };
    setMarksSem1(cleanMarks(marksSem1));
    setMarksSem2(cleanMarks(marksSem2));
  };

  const addCustomRule = (rule: CustomRule) => {
    setCustomRules([...customRules, rule]);
  };

  const updateCustomRule = (id: string, updatedFields: Partial<CustomRule>) => {
    setCustomRules(customRules.map(r => r.id === id ? { ...r, ...updatedFields } : r));
  };

  const deleteCustomRule = (ruleId: string) => {
    setCustomRules(customRules.filter(r => r.id !== ruleId));
  };

  const handleMarkChange = (studentId: string, subjectId: string, value: string) => {
    if (isTestMode) return;
    const score = value === '' ? '' : Math.min(100, Math.max(0, Number(value)));

    const targetSetter = enteringSemester === 'sem1' ? setMarksSem1 : setMarksSem2;
    targetSetter(prev => {
      const record = prev[studentId] || {};
      return {
        ...prev,
        [studentId]: {
          ...record,
          [subjectId]: { studentId, subjectId, score }
        }
      };
    });
  };

  // Keyboard vertical/horizontal cellular focus shifting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentIndex: number, subjectIndex: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextInput = document.querySelector(`input[data-student="${studentIndex}"][data-subject="${subjectIndex + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevInput = document.querySelector(`input[data-student="${studentIndex}"][data-subject="${subjectIndex - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = document.querySelector(`input[data-student="${studentIndex + 1}"][data-subject="${subjectIndex}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = document.querySelector(`input[data-student="${studentIndex - 1}"][data-subject="${subjectIndex}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  // Multi-Semester Grade compiler engine
  const calculateStudentSummary = (studentId: string, type: 'sem1' | 'sem2' | 'annual') => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    let countedSubjects = 0;
    let passedSubjectsCount = 0;
    let failedSubjectsCount = 0;

    let s1Total = 0;
    let s1Count = 0;
    let s2Total = 0;
    let s2Count = 0;

    subjects.forEach(subject => {
      const score1 = activeMarksSem1Map[studentId]?.[subject.id]?.score;
      const score2 = activeMarksSem2Map[studentId]?.[subject.id]?.score;

      if (typeof score1 === 'number') {
        s1Total += score1;
        s1Count++;
      }
      if (typeof score2 === 'number') {
        s2Total += score2;
        s2Count++;
      }

      let score: number | '';
      if (type === 'sem1') {
        score = typeof score1 === 'number' ? score1 : '';
      } else if (type === 'sem2') {
        score = typeof score2 === 'number' ? score2 : '';
      } else {
        if (typeof score1 === 'number' && typeof score2 === 'number') {
          score = (score1 + score2) / 2;
        } else if (typeof score1 === 'number') {
          score = score1;
        } else if (typeof score2 === 'number') {
          score = score2;
        } else {
          score = '';
        }
      }

      if (typeof score === 'number') {
        totalScore += score;
        maxPossibleScore += subject.maxMarks;
        countedSubjects++;
        if (score >= config.passingMark) {
          passedSubjectsCount++;
        } else {
          failedSubjectsCount++;
        }
      }
    });

    const average = countedSubjects > 0 ? parseFloat((totalScore / countedSubjects).toFixed(1)) : 0;
    const s1Average = s1Count > 0 ? parseFloat((s1Total / s1Count).toFixed(1)) : 0;
    const s2Average = s2Count > 0 ? parseFloat((s2Total / s2Count).toFixed(1)) : 0;

    let isPromoted = false;
    if (customRules.length > 0) {
      isPromoted = customRules.every(rule => {
        if (rule.metric === 'average') {
          const check = rule.operator === 'gte' ? average >= rule.value : average <= rule.value;
          return rule.outcome === 'promote' ? check : !check;
        }
        if (rule.metric === 'failedSubjects') {
          const check = rule.operator === 'gte' ? failedSubjectsCount >= rule.value : failedSubjectsCount <= rule.value;
          return rule.outcome === 'promote' ? check : !check;
        }
        if (rule.metric === 'failedSubjectsThresholdWithAvg') {
          const maxAllowedFails = rule.value;
          const requiredAvg = rule.secondaryThreshold || 60;
          if (failedSubjectsCount > maxAllowedFails) {
            return average >= requiredAvg;
          }
          return true;
        }
        return true;
      });
    } else {
      isPromoted = failedSubjectsCount <= 1; // standard
    }

    return { totalScore, maxPossibleScore, average, passedSubjectsCount, failedSubjectsCount, isPromoted, s1Total, s1Average, s2Total, s2Average };
  };

  const getSortedRanks = (type: 'sem1' | 'sem2' | 'annual') => {
    const calculated = sortedStudents.map(st => ({
      id: st.id,
      ...calculateStudentSummary(st.id, type)
    }));
    return calculated.sort((a, b) => b.average - a.average);
  };

  const getRank = (studentId: string, type: 'sem1' | 'sem2' | 'annual') => {
    const sorted = getSortedRanks(type);
    const index = sorted.findIndex(item => item.id === studentId);
    return index !== -1 ? index + 1 : '-';
  };

  const translateRuleToEnglish = (rule: CustomRule) => {
    const metricText = rule.metric === 'average' ? "Student's Average Score" : "Number of Failed Subjects";
    let operatorText = "is greater than";
    if (rule.operator === 'gte') operatorText = "is greater than or equal to";
    if (rule.operator === 'lte') operatorText = "is less than or equal to";
    if (rule.operator === 'lt') operatorText = "is less than";

    const outcomeText = rule.outcome === 'promote' ? "be automatically Promoted" : "be Detained";
    return `If ${metricText} ${operatorText} ${rule.value}, the student will ${outcomeText}.`;
  };

  // Sorting Handler based on Selected Basis (Rank vs Alphabetical)
  const getSortedReportsRoster = () => {
    if (reportSortBy === 'alpha') {
      return [...sortedStudents].sort((a, b) => a.name.localeCompare(b.name));
    }
    const ranks = getSortedRanks(reportSemester);
    return [...sortedStudents].sort((a, b) => {
      const idxA = ranks.findIndex(r => r.id === a.id);
      const idxB = ranks.findIndex(r => r.id === b.id);
      return idxA - idxB;
    });
  };

  const reportsRoster = getSortedReportsRoster();
  const reportsChunks = chunkArray(reportsRoster, 5); // Divided Student Mark list chunks of 5 students

  // Chatbot logic
  const handleBotQA = (qa: ChatbotQA) => {
    setChatLog(prev => [
      ...prev, 
      { sender: 'user', text: qa.q },
      { sender: 'bot', text: qa.a }
    ]);
  };

  const printIndividualChunk = (chunkIndex: number) => {
    setPrintTargetChunkIndex(chunkIndex);
    setPrintTargetStudentId(null);
    setTimeout(() => {
      window.print();
      setPrintTargetChunkIndex(null);
    }, 100);
  };

  const handleDownloadSingleBTE = async (fileItem: VirtualFile) => {
    const stateData = JSON.stringify(fileItem.data, null, 2);
    const blob = new Blob([stateData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileItem.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (activeFileId && isLoading) {
    setTimeout(() => setIsLoading(false), 50);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* HEADER BAR */}
      <header className="bg-slate-900 text-white shadow-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-bold text-xl px-4 py-2 rounded-lg">BT</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-xs text-slate-400 font-medium">Workspace Active: <span className="text-blue-400 font-bold">{activeFileName || 'None'}</span></p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsTestMode(!isTestMode)} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition ${isTestMode ? 'bg-amber-500 text-slate-900 border-amber-600' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
            <Sparkles size={14} /> Test Data
          </button>

          {statusMessage && <span className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded">{statusMessage}</span>}
          
          <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700">
            {(['en', 'am', 'om'] as AppLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => db.settings.put({ key: 'language', value: lang })}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${language === lang ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {lang === 'en' ? 'EN' : lang === 'am' ? 'አማ' : 'ORM'}
              </button>
            ))}
          </div>

          <button onClick={handleExportBTE} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm px-3 py-2 rounded-md transition">
            <FileDown size={16} />
            <span className="hidden sm:inline">{t.exportBte}</span>
          </button>

          <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm px-3 py-2 rounded-md transition cursor-pointer">
            <FileUp size={16} />
            <span className="hidden sm:inline">Import BTE</span>
            <input type="file" accept=".bte" onChange={handleImportBTEGlobal} className="hidden" />
          </label>
        </div>
      </header>

      {/* CORE SPLIT GRID FRAME (EXPLORER SIDEBAR + MAIN WORKSPACE) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT WORKSPACE FILE EXPLORER SIDEBAR */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 print:hidden shrink-0">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Explorer Directory</span>
              <div className="flex gap-2">
                <button onClick={createWorkspaceFolder} className="p-1 hover:text-white text-slate-400" title="New Folder"><FolderPlus size={16} /></button>
                <button onClick={() => createWorkspaceFile(null)} className="p-1 hover:text-white text-slate-400" title="New Class File"><FilePlus size={16} /></button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {filesList.map((item) => {
                if (item.isFolder) {
                  const folderFiles = filesList.filter(f => f.parentId === item.id);
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/50 text-slate-400">
                        <span className="flex items-center gap-2 font-semibold text-xs uppercase text-slate-500">
                          <Folder size={14} className="text-amber-500" /> {item.name}
                        </span>
                        <div className="flex gap-1.5 opacity-40 hover:opacity-100">
                          <label className="cursor-pointer text-slate-400 hover:text-white text-xs">
                            <FileUp size={12} />
                            <input type="file" accept=".bte" onChange={(e) => handleImportToTree(e, item.id)} className="hidden" />
                          </label>
                          <button onClick={() => createWorkspaceFile(item.id)} className="text-slate-400 hover:text-slate-200" title="New File"><Plus size={12} /></button>
                          <button onClick={() => deleteWorkspaceItem(item.id, true)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      
                      <div className="pl-4 border-l border-slate-800 ml-2 space-y-1">
                        {folderFiles.map(subFile => (
                          <div 
                            key={subFile.id} 
                            onClick={() => selectWorkspaceFile(subFile.id)}
                            className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition ${activeFileId === subFile.id ? 'bg-blue-600/20 text-blue-400 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
                          >
                            <span className="truncate pr-2">📄 {subFile.name}</span>
                            <div className="flex gap-1.5">
                              <button onClick={(e) => { e.stopPropagation(); handleDownloadSingleBTE(subFile); }} className="text-slate-500 hover:text-slate-300"><FileDown size={12} /></button>
                              <button onClick={(e) => { e.stopPropagation(); deleteWorkspaceItem(subFile.id, false); }} className="text-slate-500 hover:text-red-500"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block px-1">Root Workspaces</span>
                {filesList.filter(f => !f.isFolder && !f.parentId).map(rootFile => (
                  <div 
                    key={rootFile.id} 
                    onClick={() => selectWorkspaceFile(rootFile.id)}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition ${activeFileId === rootFile.id ? 'bg-blue-600/20 text-blue-400 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <span className="truncate pr-2">📄 {rootFile.name}</span>
                    <div className="flex gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadSingleBTE(rootFile); }} className="text-slate-500 hover:text-slate-300"><FileDown size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteWorkspaceItem(rootFile.id, false); }} className="text-slate-500 hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HELP HANDBOOK & CHATBOT BUTTONS */}
          <div className="p-4 border-t border-slate-800 flex gap-2">
            <button 
              onClick={() => { setShowShowHelpModal(true); setShowChatbot(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition"
            >
              <HelpCircle size={14} /> Help Manual
            </button>
            <button 
              onClick={() => { setShowShowHelpModal(true); setShowChatbot(true); }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg border border-slate-700 transition"
              title="QA Chatbot Assistant"
            >
              <MessageSquare size={16} />
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE FRAME */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          
          {/* TABS */}
          <div className="bg-white border-b border-slate-200 shadow-sm flex overflow-x-auto print:hidden shrink-0">
            <button onClick={() => setActiveTab('setup')} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition shrink-0 ${activeTab === 'setup' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
              <Settings size={18} /> {t.setup}
            </button>
            <button onClick={() => setActiveTab('students')} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition shrink-0 ${activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
              <Users size={18} /> {t.students}
            </button>
            <button onClick={() => setActiveTab('subjects')} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition shrink-0 ${activeTab === 'subjects' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
              <BookOpen size={18} /> {t.subjects}
            </button>
            <button onClick={() => setActiveTab('marks')} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition shrink-0 ${activeTab === 'marks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
              <Grid size={18} /> {t.marks}
            </button>
            <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition shrink-0 ${activeTab === 'reports' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
              <FileText size={18} /> Reports Workspace
            </button>
          </div>

          <main className="flex-1 p-6 w-full print:p-0 print:max-w-none">
            
            {!activeFileId ? (
              <div className="bg-white border p-12 text-center rounded-2xl border-dashed">
                <span className="text-2xl block mb-2">📁</span>
                <h3 className="font-bold text-slate-700">No Class Workspace Selected</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Select a class file in the sidebar explorer directory to begin.</p>
              </div>
            ) : (
              <>
                {/* 1. SETUP TAB */}
                {activeTab === 'setup' && (
                  <div className="space-y-6">
                    
                    {/* School Profile Branding */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h2 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2 text-blue-600"><Settings /> School Profile Branding</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-[fadeIn_0.3s]">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">{t.schoolName}</label>
                          <input type="text" placeholder="Enter School Name..." value={getBrandingValue('name', 'School Name')} onChange={(e) => updateSchoolInfo({ name: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">{t.academicYear}</label>
                          <input type="text" placeholder="Enter Academic Year..." value={getBrandingValue('academicYear', 'Academic Year')} onChange={(e) => updateSchoolInfo({ academicYear: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">School Logo</label>
                          <div className="flex items-center gap-2 mt-1.5">
                            {schoolInfo.logoBase64 && <img src={schoolInfo.logoBase64} alt="Logo" className="w-8 h-8 object-contain border rounded" />}
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs file:py-1 file:px-2 file:border-0 file:rounded file:bg-blue-50 file:text-blue-700 cursor-pointer" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">School Stamp (Chapa)</label>
                          <div className="flex items-center gap-2 mt-1.5">
                            {schoolInfo.stampBase64 && <img src={schoolInfo.stampBase64} alt="Stamp" className="w-8 h-8 object-contain border rounded" />}
                            <input type="file" accept="image/*" onChange={handleStampUpload} className="text-xs file:py-1 file:px-2 file:border-0 file:rounded file:bg-blue-50 file:text-blue-700 cursor-pointer" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">{t.directorName}</label>
                          <input type="text" placeholder="Enter Director Name..." value={getBrandingValue('directorName', 'Director')} onChange={(e) => updateSchoolInfo({ directorName: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">{t.viceDirectorName}</label>
                          <input type="text" placeholder="Enter Vice Director Name..." value={getBrandingValue('viceDirectorName', 'Vice Director')} onChange={(e) => updateSchoolInfo({ viceDirectorName: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Homeroom Teacher Name</label>
                          <input type="text" placeholder="Enter Teacher Name..." value={getBrandingValue('homeroomTeacherName', 'Teacher')} onChange={(e) => updateSchoolInfo({ homeroomTeacherName: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">{t.evaluatorName}</label>
                          <input type="text" placeholder="Enter Evaluator Name..." value={getBrandingValue('evaluatorName', 'Evaluator')} onChange={(e) => updateSchoolInfo({ evaluatorName: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Promotion Rules with advanced threshold support */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-[fadeIn_0.3s]">
                      <div className="border-b pb-3 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 text-blue-600">Promotion Rules</h2>
                        <button 
                          onClick={() => addCustomRule({ id: Date.now().toString(), metric: 'average', operator: 'gte', value: 50, outcome: 'promote' })}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                        >
                          + Add Rule
                        </button>
                      </div>

                      {customRules.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No custom rules configured.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {customRules.map((rule) => (
                            <div key={rule.id} className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                              <div className="flex flex-wrap gap-2 items-center mb-3">
                                <select 
                                  value={rule.metric} 
                                  onChange={(e) => updateCustomRule(rule.id, { metric: e.target.value as any })}
                                  className="text-xs bg-white border px-2 py-1.5 rounded font-semibold focus:outline-none"
                                >
                                  <option value="average">Average Score (%)</option>
                                  <option value="failedSubjects">Failed Subjects</option>
                                  <option value="failedSubjectsThresholdWithAvg">Failed Subjects Average Threshold</option>
                                </select>

                                {rule.metric !== 'failedSubjectsThresholdWithAvg' ? (
                                  <>
                                    <select 
                                      value={rule.operator} 
                                      onChange={(e) => updateCustomRule(rule.id, { operator: e.target.value as any })}
                                      className="text-xs bg-white border px-2 py-1.5 rounded font-semibold focus:outline-none"
                                    >
                                      <option value="gte">&gt;=</option>
                                      <option value="lte">&lt;=</option>
                                      <option value="lt">&lt;</option>
                                    </select>
                                    <input 
                                      type="number" 
                                      value={rule.value} 
                                      onChange={(e) => updateCustomRule(rule.id, { value: Number(e.target.value) })}
                                      className="w-16 text-xs bg-white border px-2 py-1 rounded font-semibold text-center focus:outline-none"
                                    />
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                    <span>If Failed &gt;</span>
                                    <input 
                                      type="number" 
                                      value={rule.value} 
                                      onChange={(e) => updateCustomRule(rule.id, { value: Number(e.target.value) })}
                                      className="w-12 bg-white border px-2 py-1 rounded text-center focus:outline-none"
                                    />
                                    <span>Average must be &gt;=</span>
                                    <input 
                                      type="number" 
                                      value={rule.secondaryThreshold || 60} 
                                      onChange={(e) => updateCustomRule(rule.id, { secondaryThreshold: Number(e.target.value) })}
                                      className="w-14 bg-white border px-2 py-1 rounded text-center focus:outline-none"
                                    />
                                  </div>
                                )}

                                <select 
                                  value={rule.outcome} 
                                  onChange={(e) => updateCustomRule(rule.id, { outcome: e.target.value as any })}
                                  className="text-xs bg-white border px-2 py-1.5 rounded font-semibold focus:outline-none text-emerald-700"
                                >
                                  <option value="promote">Promote</option>
                                  <option value="detain">Detain</option>
                                </select>

                                <button onClick={() => deleteCustomRule(rule.id)} className="text-red-500 hover:text-red-700 ml-auto p-1">
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className="bg-white border p-2 rounded text-xs text-slate-500 font-medium italic border-dashed">
                                💡 {rule.metric === 'failedSubjectsThresholdWithAvg' 
                                  ? `If student fails more than ${rule.value} subjects, their average must be >= ${rule.secondaryThreshold || 60} to promote.` 
                                  : translateRuleToEnglish(rule)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Standard parameters */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                      <h2 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2 text-blue-600"><Settings /> General Parameters</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 block">Passing Mark (%)</label>
                          <input type="number" value={config.passingMark} onChange={(e) => setConfig({ ...config, passingMark: Number(e.target.value) })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-1" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700 block">Min Subjects Required for Promotion</label>
                          <input type="number" value={config.minPassedSubjectsToPromote} onChange={(e) => setConfig({ ...config, minPassedSubjectsToPromote: Number(e.target.value) })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. STUDENTS REGISTRY */}
                {activeTab === 'students' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    
                    <div className="flex flex-wrap justify-between items-center border-b pb-3 gap-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users className="text-blue-600" /> {t.students}</h2>
                        <button onClick={() => setSortAlphabetically(!sortAlphabetically)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${sortAlphabetically ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <ArrowUpDown size={14} /> Sort A-Z
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={addCustomField} className="bg-slate-100 border text-slate-700 px-3 py-1.5 text-xs font-bold rounded-lg">+ Column</button>
                        <button onClick={addStudent} disabled={isTestMode} className={`flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg ${isTestMode ? 'bg-slate-300' : 'bg-blue-600'}`}><Plus size={16} /> {t.addStudent}</button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b">
                            <th className="p-3 text-sm font-bold text-slate-600">Student ID</th>
                            <th className="p-3 text-sm font-bold text-slate-600">{t.studentName}</th>
                            <th className="p-3 text-sm font-bold text-slate-600">Conduct</th>
                            {studentFields.map(f => (
                              <th key={f.name} className="p-3 text-sm font-bold text-slate-600">
                                <div className="flex items-center gap-1">
                                  <span>{f.label}</span>
                                  <button onClick={() => deleteStudentField(f.name)} className="text-red-400 font-bold hover:text-red-600 ml-1">×</button>
                                </div>
                              </th>
                            ))}
                            {!isTestMode && <th className="p-3 text-sm font-bold text-slate-600">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedStudents.map((student) => (
                            <tr key={student.id} className="border-b">
                              <td className="p-2 w-48">
                                <input type="text" placeholder="Optional ID" disabled={isTestMode} value={student.studentId || ''} onChange={(e) => updateStudentID(student.id, e.target.value)} className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm font-semibold text-slate-700" />
                              </td>
                              <td className="p-2">
                                <input type="text" disabled={isTestMode} value={student.name} onChange={(e) => updateStudentName(student.id, e.target.value)} className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium" />
                              </td>
                              <td className="p-2 w-32">
                                <input type="text" placeholder="Conduct" disabled={isTestMode} value={student.conduct || ''} onChange={(e) => updateStudentConduct(student.id, e.target.value)} className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm uppercase font-bold text-center text-slate-700" />
                              </td>
                              {studentFields.map(field => (
                                <td key={field.name} className="p-2">
                                  <input type={field.type} disabled={isTestMode} value={student.fields?.[field.name] || ''} onChange={(e) => updateStudentDynamicField(student.id, field.name, e.target.value)} className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1" />
                                </td>
                              ))}
                              {!isTestMode && (
                                <td className="p-2 text-center w-16">
                                  <button onClick={() => deleteStudent(student.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. SUBJECTS REGISTRY */}
                {activeTab === 'subjects' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><BookOpen className="text-blue-600" /> {t.subjects}</h2>
                      <button onClick={addSubject} className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"><Plus size={16} /> {t.addSubject}</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b">
                            <th className="p-3 text-sm font-bold text-slate-600">{t.subjectName}</th>
                            <th className="p-3 text-sm font-bold text-slate-600">{t.maxMarks}</th>
                            <th className="p-3 text-sm font-bold text-slate-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.map((subject) => (
                            <tr key={subject.id} className="border-b">
                              <td className="p-2">
                                <input type="text" value={subject.name} onChange={(e) => updateSubjectName(subject.id, e.target.value)} className="w-full px-2 py-1 border rounded font-medium focus:outline-none" />
                              </td>
                              <td className="p-2 w-48">
                                <input type="number" value={subject.maxMarks} onChange={(e) => updateSubjectMaxMarks(subject.id, Number(e.target.value))} className="w-full px-2 py-1 border rounded focus:outline-none" />
                              </td>
                              <td className="p-2 text-center w-16">
                                <button onClick={() => deleteSubject(subject.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. MARKS ENTRY GRID */}
                {activeTab === 'marks' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-wrap justify-between items-center border-b pb-2 gap-4">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Grid className="text-blue-600" /> Marks Grid (Excel Navigation Enabled)</h2>
                      
                      <div className="bg-slate-100 rounded-lg p-1 flex border border-slate-200 print:hidden">
                        <button onClick={() => setEnteringSemester('sem1')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${enteringSemester === 'sem1' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Semester 1 Input</button>
                        <button onClick={() => setEnteringSemester('sem2')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${enteringSemester === 'sem2' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Semester 2 Input</button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border border-collapse border-slate-200">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border p-3 text-sm font-bold text-slate-700 text-left">Student Name</th>
                            {subjects.map(sub => (
                              <th key={sub.id} className="border p-3 text-sm font-bold text-slate-700 text-center min-w-[120px]">
                                <div>{sub.name}</div>
                                <div className="text-xs font-normal text-slate-500">(Max: {sub.maxMarks})</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedStudents.map((student, studentIdx) => (
                            <tr key={student.id}>
                              <td className="border p-3 font-semibold bg-slate-50">{student.name}</td>
                              {subjects.map((sub, subjectIdx) => {
                                const cell = currentMarksMap[student.id]?.[sub.id] || { score: '' };
                                const isFailed = cell.score !== '' && cell.score < config.passingMark;
                                return (
                                  <td key={sub.id} className="border p-2 text-center">
                                    <input 
                                      type="number" 
                                      value={cell.score}
                                      disabled={isTestMode}
                                      data-student={studentIdx}
                                      data-subject={subjectIdx}
                                      onKeyDown={(e) => handleKeyDown(e, studentIdx, subjectIdx)}
                                      onChange={(e) => handleMarkChange(student.id, sub.id, e.target.value)}
                                      placeholder="--"
                                      className={`w-full max-w-[80px] text-center p-1 rounded border outline-none ${isFailed ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-slate-200'}`}
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. REPORTS SPLIT VIEW */}
                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    
                    {/* View Controller */}
                    <div className="flex flex-wrap justify-between items-center gap-4 print:hidden bg-slate-100 p-3 rounded-xl">
                      <div className="bg-white border p-1 rounded-xl shadow-sm flex max-w-lg">
                        <button onClick={() => setReportSubTab('class')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${reportSubTab === 'class' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>1. Class Report Summary</button>
                        <button onClick={() => setReportSubTab('cards')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${reportSubTab === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>2. Individual Cards</button>
                        <button onClick={() => setReportSubTab('sheets')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${reportSubTab === 'sheets' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>3. Student Mark List</button>
                      </div>

                      {/* Sorting Selection basis (Rank vs Alphabetical) */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Sort Roster By:</label>
                        <select 
                          value={reportSortBy} 
                          onChange={(e) => setReportSortBy(e.target.value as any)}
                          className="text-xs bg-white border rounded px-2.5 py-1.5 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="rank">Student Class Rank</option>
                          <option value="alpha">Alphabetical Name</option>
                        </select>
                      </div>

                      {/* Template Selector dropdown */}
                      {reportSubTab === 'cards' && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Template Layout:</label>
                          <select 
                            value={schoolInfo.selectedTemplateId || 't1'} 
                            onChange={(e) => updateSchoolInfo({ selectedTemplateId: e.target.value })}
                            className="text-xs bg-white border rounded px-2.5 py-1.5 font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="t1">1. Slate Classic</option>
                            <option value="t2">2. Teal Compact Grid</option>
                            <option value="t3">3. Prestige Gold & Maroon</option>
                            <option value="t4">4. Emerald Tech Minimal</option>
                            <option value="t5">5. Indigo Modern Blocks</option>
                            <option value="t6">6. Soft Minimal Borderless</option>
                            <option value="t7">7. Charcoal Corporate</option>
                            <option value="t8">8. Vintage Amber Cream</option>
                            <option value="t9">9. Royal Burgundy Classic</option>
                            <option value="t10">10. Cobalt Bold Strip</option>
                          </select>
                        </div>
                      )}

                      {/* Semester selector for card print displays */}
                      <div className="bg-white border p-1 rounded-xl shadow-sm flex">
                        <button onClick={() => setReportSemester('sem1')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${reportSemester === 'sem1' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t.sem1Only}</button>
                        <button onClick={() => setReportSemester('sem2')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${reportSemester === 'sem2' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t.sem2Only}</button>
                        <button onClick={() => setReportSemester('annual')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${reportSemester === 'annual' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t.annualReport}</button>
                      </div>
                    </div>

                    {/* CLASS REPORT SHEET */}
                    {reportSubTab === 'class' && (
                      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6 print:border-0 print:shadow-none animate-fade-in">
                        
                        {/* Branded Header Area */}
                        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase">{getBrandingValue('name', 'School Name')}</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Academic Year: {getBrandingValue('academicYear', 'Academic Year')} | Grade & Section: {activeFileName}</p>
                            <h3 className="text-sm font-black text-blue-700 mt-2 uppercase">{t.classPerformanceSummary} - {reportSemester === 'annual' ? t.annualReport : reportSemester === 'sem1' ? t.sem1Only : t.sem2Only}</h3>
                          </div>
                          {schoolInfo.logoBase64 && <img src={schoolInfo.logoBase64} alt="Logo" className="w-16 h-16 object-contain" />}
                        </div>

                        <div className="flex justify-between items-center print:hidden">
                          <p className="text-xs text-slate-400">Classroom summary performance sheets list</p>
                          <button onClick={() => window.print()} className="flex items-center gap-1 bg-slate-950 text-white px-4 py-2 rounded-lg text-xs font-bold"><Printer size={14} /> Print Summary Sheet</button>
                        </div>

                        {/* Summary Matrix with Grouped Dual-Semester Columns */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse border border-slate-200">
                            <thead>
                              <tr className="bg-slate-100 border-b text-xs font-bold">
                                <th className="p-3 text-slate-700 border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Rank</th>
                                <th className="p-3 text-slate-700 border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Student ID</th>
                                <th className="p-3 text-slate-700 border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Student Name</th>
                                <th className="p-3 text-slate-700 border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Conduct</th>
                                
                                {subjects.map(sub => (
                                  <th key={sub.id} className="p-3 text-slate-700 text-center border" colSpan={reportSemester === 'annual' ? 3 : 1}>
                                    {sub.name}
                                  </th>
                                ))}
                                
                                <th className="p-3 text-slate-700 text-center border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Total</th>
                                <th className="p-3 text-slate-700 text-center border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Average</th>
                                <th className="p-3 text-slate-700 text-center border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Outcome</th>
                              </tr>

                              {reportSemester === 'annual' && (
                                <tr className="bg-slate-50 border-b">
                                  {subjects.map(sub => (
                                    <React.Fragment key={sub.id + '_sub'}>
                                      <th className="p-1 text-[10px] font-bold text-center border text-slate-500">S1</th>
                                      <th className="p-1 text-[10px] font-bold text-center border text-slate-500">S2</th>
                                      <th className="p-1 text-[10px] font-bold text-center border text-slate-800 bg-slate-100">Avg</th>
                                    </React.Fragment>
                                  ))}
                                </tr>
                              )}
                            </thead>
                            <tbody>
                              {reportsRoster.map(student => {
                                const summary = calculateStudentSummary(student.id, reportSemester);
                                const rank = getRank(student.id, reportSemester);
                                return (
                                  <tr key={student.id} className="border-b hover:bg-slate-50/20 text-sm">
                                    <td className="p-3 font-mono font-bold text-blue-600 border">{rank}</td>
                                    <td className="p-3 font-mono text-xs text-slate-500 border">{student.studentId || '-'}</td>
                                    <td className="p-3 font-semibold text-slate-700 border">{student.name}</td>
                                    <td className="p-3 text-center border font-bold uppercase text-slate-600">{student.conduct || '-'}</td>
                                    
                                    {subjects.map(sub => {
                                      const s1 = activeMarksSem1Map[student.id]?.[sub.id]?.score;
                                      const s2 = activeMarksSem2Map[student.id]?.[sub.id]?.score;

                                      if (reportSemester === 'sem1') {
                                        return <td key={sub.id} className="p-3 text-center font-mono border">{typeof s1 === 'number' ? s1 : '--'}</td>;
                                      } else if (reportSemester === 'sem2') {
                                        return <td key={sub.id} className="p-3 text-center font-mono border">{typeof s2 === 'number' ? s2 : '--'}</td>;
                                      } else {
                                        let finalScore: number | '';
                                        if (typeof s1 === 'number' && typeof s2 === 'number') finalScore = (s1+s2)/2;
                                        else if (typeof s1 === 'number') finalScore = s1;
                                        else if (typeof s2 === 'number') finalScore = s2;
                                        else finalScore = '';

                                        return (
                                          <React.Fragment key={sub.id}>
                                            <td className="p-2 text-center text-xs font-mono border text-slate-400">{typeof s1 === 'number' ? s1 : '--'}</td>
                                            <td className="p-2 text-center text-xs font-mono border text-slate-400">{typeof s2 === 'number' ? s2 : '--'}</td>
                                            <td className="p-2 text-center text-xs font-mono font-bold border bg-slate-50/50">{finalScore !== '' ? finalScore : '--'}</td>
                                          </React.Fragment>
                                        );
                                      }
                                    })}
                                    
                                    <td className="p-3 text-center font-mono border">{summary.totalScore} / {summary.maxPossibleScore}</td>
                                    <td className="p-3 text-center font-mono font-bold border">{summary.average}%</td>
                                    <td className="p-3 text-center border">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${summary.isPromoted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{summary.isPromoted ? t.promote : t.detain}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 2: INDIVIDUAL CARDS */}
                    {reportSubTab === 'cards' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-xl border flex justify-between items-center print:hidden">
                          <div>
                            <h2 className="text-lg font-bold text-slate-900">{t.printAllCards} - {reportSemester === 'annual' ? t.annualReport : reportSemester === 'sem1' ? t.sem1Only : t.sem2Only}</h2>
                          </div>
                          <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold"><Printer size={14} /> Print Cards</button>
                        </div>

                        <div className="space-y-8 print:space-y-0">
                          {reportsRoster.map(student => {
                            const summary = calculateStudentSummary(student.id, reportSemester);
                            const rank = getRank(student.id, reportSemester);

                            return (
                              <ReportCard 
                                key={student.id}
                                templateId={schoolInfo.selectedTemplateId || 't1'}
                                student={student}
                                subjects={subjects}
                                summary={summary}
                                rank={rank}
                                schoolInfo={{
                                  ...schoolInfo,
                                  name: getBrandingValue('name', 'School Name'),
                                  academicYear: getBrandingValue('academicYear', 'Academic Year'),
                                  directorName: getBrandingValue('directorName', 'Director'),
                                  homeroomTeacherName: getBrandingValue('homeroomTeacherName', 'Teacher')
                                }}
                                reportSemester={reportSemester}
                                activeMarksSem1Map={activeMarksSem1Map}
                                activeMarksSem2Map={activeMarksSem2Map}
                                config={config}
                                printIndividualCard={printIndividualChunk}
                                printTargetStudentId={printTargetStudentId}
                                isTestMode={isTestMode}
                                onCommentChange={(text) => updateStudentComment(student.id, text)}
                                onConductChange={(text) => updateStudentConduct(student.id, text)}
                                totalStudentsCount={activeStudentsList.length}
                                studentFields={studentFields}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 3: STUDENT MARK LIST PAGINATED SHEETS */}
                    {reportSubTab === 'sheets' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-xl border flex justify-between items-center print:hidden">
                          <div>
                            <h2 className="text-lg font-bold text-slate-900">{t.markListSubTab}</h2>
                            <p className="text-xs text-slate-400">Class roster paginated sheets (5 students per page) [2]</p>
                          </div>
                          <button onClick={() => { setPrintTargetChunkIndex(null); setPrintTargetStudentId(null); setTimeout(() => window.print(), 100); }} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold"><Printer size={14} /> {t.printAllSheets}</button>
                        </div>

                        <div className="space-y-8 print:space-y-0">
                          {reportsChunks.map((chunk, chunkIdx) => (
                            <div 
                              key={chunkIdx} 
                              className={`bg-white border-2 border-slate-300 rounded-2xl p-8 shadow-md relative overflow-hidden flex flex-col justify-between print-page-break print:shadow-none print:border print:rounded-none min-h-[600px] print:min-h-0 print:p-6 mark-list-sheet ${printTargetChunkIndex === chunkIdx ? 'print-chunk-target' : ''}`}
                            >
                              
                              {/* 1. Header Branded Area */}
                              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-4">
                                <div>
                                  <h3 className="text-2xl font-black text-slate-900 uppercase">{getBrandingValue('name', 'School Name')}</h3>
                                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">Academic Year: {getBrandingValue('academicYear', 'Academic Year')} | Grade & Section: {activeFileName}</p>
                                  <h4 className="text-xs font-black text-blue-700 uppercase mt-2">{t.markListSubTab} (Sheet {chunkIdx + 1} of {reportsChunks.length}) - {reportSemester === 'annual' ? t.annualReport : reportSemester === 'sem1' ? t.sem1Only : t.sem2Only}</h4>
                                </div>
                                {schoolInfo.logoBase64 && <img src={schoolInfo.logoBase64} alt="Logo" className="w-16 h-16 object-contain" />}
                              </div>

                              {/* 2. Grouped marks roster */}
                              <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse border border-slate-200 text-sm">
                                  <thead>
                                    <tr className="bg-slate-100 border-b text-xs">
                                      <th className="p-2 font-bold text-slate-700 border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Rank</th>
                                      <th className="p-2 font-bold text-slate-700 border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Student ID</th>
                                      <th className="p-2 font-bold text-slate-700 border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Student Name</th>
                                      <th className="p-2 font-bold text-slate-700 border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Conduct</th>
                                      
                                      {subjects.map(sub => (
                                        <th key={sub.id} className="p-2 font-bold text-slate-700 text-center border" colSpan={reportSemester === 'annual' ? 3 : 1}>
                                          {sub.name}
                                        </th>
                                      ))}
                                      
                                      <th className="p-2 font-bold text-slate-700 text-center border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Total</th>
                                      <th className="p-2 font-bold text-slate-700 text-center border" rowSpan={reportSemester === 'annual' ? 2 : 1}>Average</th>
                                    </tr>

                                    {reportSemester === 'annual' && (
                                      <tr className="bg-slate-50 border-b">
                                        {subjects.map(sub => (
                                          <React.Fragment key={sub.id + '_chnk'}>
                                            <th className="p-1 text-[9px] font-bold text-center border text-slate-500">S1</th>
                                            <th className="p-1 text-[9px] font-bold text-center border text-slate-500">S2</th>
                                            <th className="p-1 text-[9px] font-bold text-center border text-slate-800 bg-slate-100">Avg</th>
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                    )}
                                  </thead>
                                  <tbody>
                                    {chunk.map(student => {
                                      const summary = calculateStudentSummary(student.id, reportSemester);
                                      const rank = getRank(student.id, reportSemester);
                                      return (
                                        <tr key={student.id} className="border-b hover:bg-slate-50/20 text-xs">
                                          <td className="p-2 font-mono font-bold text-blue-600 border">{rank}</td>
                                          <td className="p-2 font-mono text-slate-500 border">{student.studentId || '-'}</td>
                                          <td className="p-2 font-semibold text-slate-700 border">{student.name}</td>
                                          <td className="p-2 text-center border font-bold uppercase text-slate-600">{student.conduct || '-'}</td>
                                          
                                          {subjects.map(sub => {
                                            const s1 = activeMarksSem1Map[student.id]?.[sub.id]?.score;
                                            const s2 = activeMarksSem2Map[student.id]?.[sub.id]?.score;

                                            if (reportSemester === 'sem1') {
                                              return <td key={sub.id} className="p-2 text-center font-mono border">{typeof s1 === 'number' ? s1 : '--'}</td>;
                                            } else if (reportSemester === 'sem2') {
                                              return <td key={sub.id} className="p-2 text-center font-mono border">{typeof s2 === 'number' ? s2 : '--'}</td>;
                                            } else {
                                              let finalScore: number | '';
                                              if (typeof s1 === 'number' && typeof s2 === 'number') finalScore = (s1+s2)/2;
                                              else if (typeof s1 === 'number') finalScore = s1;
                                              else if (typeof s2 === 'number') finalScore = s2;
                                              else finalScore = '';

                                              return (
                                                <React.Fragment key={sub.id}>
                                                  <td className="p-1 text-center text-xs font-mono border text-slate-400">{typeof s1 === 'number' ? s1 : '--'}</td>
                                                  <td className="p-1 text-center text-xs font-mono border text-slate-400">{typeof s2 === 'number' ? s2 : '--'}</td>
                                                  <td className="p-1 text-center text-xs font-mono font-bold border bg-slate-50/50">{finalScore !== '' ? finalScore : '--'}</td>
                                                </React.Fragment>
                                              );
                                            }
                                          })}
                                          
                                          <td className="p-2 text-center font-mono border">{summary.totalScore} / {summary.maxPossibleScore}</td>
                                          <td className="p-2 text-center font-mono font-bold border">{summary.average}%</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* 3. Official Sign-Off Footer */}
                              <div className="border-t-2 border-slate-900 pt-6 mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-center relative">
                                <div className="border-t border-slate-400 pt-1">
                                  <p className="font-bold text-slate-700">{getBrandingValue('evaluatorName', 'Evaluator') || '__________________'}</p>
                                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">{t.evaluatorSig}</p>
                                </div>
                                <div className="border-t border-slate-400 pt-1">
                                  <p className="font-bold text-slate-700">{getBrandingValue('homeroomTeacherName', 'Teacher') || '__________________'}</p>
                                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">{t.teacherSig}</p>
                                </div>
                                <div className="border-t border-slate-400 pt-1">
                                  <p className="font-bold text-slate-700">{getBrandingValue('viceDirectorName', 'Vice Director') || '__________________'}</p>
                                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">{t.viceDirectorSig}</p>
                                </div>
                                <div className="border-t border-slate-400 pt-1">
                                  <p className="font-bold text-slate-700">{getBrandingValue('directorName', 'Director') || '__________________'}</p>
                                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">{t.directorSig}</p>
                                </div>

                                {schoolInfo.stampBase64 && (
                                  <img src={schoolInfo.stampBase64} alt="Stamp" className="absolute bottom-2 left-1/2 w-20 h-20 object-contain opacity-85 mix-blend-multiply pointer-events-none" />
                                )}
                              </div>

                              {/* Individual Sheet print buttons */}
                              <div className="absolute top-4 right-4 print:hidden">
                                <button onClick={() => printIndividualChunk(chunkIdx)} className="bg-slate-100 hover:bg-slate-200 border text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                  <Printer size={12} /> {t.printSheet}
                                </button>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>

      {/* 6. SYSTEM HELP HANDBOOK & CHATBOT POPUP WINDOW */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-[scaleUp_0.2s]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {showChatbot ? <MessageSquare className="text-blue-400" /> : <HelpCircle className="text-blue-400" />}
                <h3 className="font-black tracking-tight">{showChatbot ? "BT Express Pre-defined QA Assistant" : userManuals[language].title}</h3>
              </div>
              <button 
                onClick={() => { setShowShowHelpModal(false); setChatLog([]); }}
                className="text-slate-400 hover:text-white font-bold text-xl px-2.5 py-1 rounded"
              >
                ×
              </button>
            </div>

            {/* Modal Content Frame */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-sm leading-relaxed">
              
              {/* CHATBOT VIEW */}
              {showChatbot ? (
                <div className="flex flex-col h-[50vh] justify-between">
                  <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 border rounded-xl max-h-[35vh]">
                    {chatLog.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center mt-6">Select a pre-defined question below to chat with the local assistant bot.</p>
                    ) : (
                      chatLog.map((chat, idx) => (
                        <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs rounded-xl px-4 py-2.5 text-xs font-semibold ${chat.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800 shadow-sm'}`}>
                            {chat.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pre-defined Questions selection list */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Frequently Asked Questions:</p>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[15vh] overflow-y-auto">
                      {chatbotDatabase[language].map((qa, index) => (
                        <button 
                          key={index}
                          onClick={() => handleBotQA(qa)}
                          className="w-full text-left bg-slate-100 hover:bg-slate-200 border rounded-lg p-2.5 text-xs font-semibold transition"
                        >
                          ❓ {qa.q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // USER HANDBOOK GUIDE VIEW
                <div className="space-y-4">
                  <p className="font-semibold text-slate-700 italic border-l-4 border-blue-500 pl-3">{userManuals[language].intro}</p>
                  <div className="bg-slate-50 p-4 border rounded-xl space-y-3 font-medium text-slate-600">
                    <p>{userManuals[language].setup}</p>
                    <p>{userManuals[language].students}</p>
                    <p>{userManuals[language].subjects}</p>
                    <p>{userManuals[language].marks}</p>
                    <p>{userManuals[language].reports}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Switch View Footer */}
            <div className="bg-slate-50 border-t p-4 flex justify-between">
              <button 
                onClick={() => setShowChatbot(!showChatbot)}
                className="text-xs font-black text-blue-600 hover:text-blue-800 tracking-wide uppercase"
              >
                {showChatbot ? "← Read System Manual" : "💬 Talk to Chatbot Assistant →"}
              </button>
              <button 
                onClick={() => { setShowShowHelpModal(false); setChatLog([]); }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global CSS overrides */}
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          header, footer, aside, .tabs, .print\\:hidden, button, textarea {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
          
          /* Individual Student Printing Target */
          ${printTargetStudentId ? `
            .report-card-container:not(.print-target) {
              display: none !important;
            }
            .print-target {
              border: 1px solid #cbd5e1 !important;
              padding: 40px !important;
              box-shadow: none !important;
              min-height: 100vh !important;
              width: 100% !important;
            }
          ` : ''}

          /* Individual Chunk/Sheet Printing Target */
          ${printTargetChunkIndex !== null ? `
            .mark-list-sheet:not(.print-chunk-target) {
              display: none !important;
            }
            .print-chunk-target {
              border: 1px solid #cbd5e1 !important;
              padding: 40px !important;
              box-shadow: none !important;
              min-height: 100vh !important;
              width: 100% !important;
            }
          ` : ''}

          /* If printing everything bulk */
          ${!printTargetStudentId && printTargetChunkIndex === null ? `
            .print-page-break {
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              border: 1px solid #cbd5e1 !important;
              margin-bottom: 0 !important;
              padding: 40px !important;
              box-shadow: none !important;
              min-height: 100vh !important;
            }
          ` : ''}
        }
      `}</style>
    </div>
  );
}