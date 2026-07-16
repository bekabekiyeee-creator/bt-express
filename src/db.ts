// src/db.ts
import Dexie, { type Table } from 'dexie';
import type { VirtualFile } from './types';

export interface DBSetting {
  key: string;
  value: any;
}

class BTExpressDatabase extends Dexie {
  files!: Table<VirtualFile>;
  settings!: Table<DBSetting>;

  constructor() {
    super('BTExpressDatabase');
    this.version(6).stores({
      files: 'id, name, parentId, isFolder',
      settings: 'key'
    });
  }
}

export const db = new BTExpressDatabase();

db.on('populate', () => {
  db.files.bulkAdd([
    {
      id: 'f_grade9',
      name: 'Grade 9 Directory',
      parentId: null,
      isFolder: true
    },
    {
      id: 'file_9a',
      name: 'Section 9A.bte',
      parentId: 'f_grade9',
      isFolder: false,
      data: {
        students: [
          { id: 'st1', name: 'Abebe Kebede', studentId: 'ST-0091', teacherComment: 'Excellent academic progress, keep it up!', conduct: 'A', fields: { age: 14, gender: 'Male', birthDate: '2012-05-12' } },
          { id: 'st2', name: 'Chaltu Alemu', studentId: 'ST-0092', teacherComment: 'Good effort, needs to study harder in math.', conduct: 'B', fields: { age: 13, gender: 'Female', birthDate: '2013-08-20' } },
        ],
        subjects: [
          { id: 'sub1', name: 'Mathematics', maxMarks: 100 },
          { id: 'sub2', name: 'English', maxMarks: 100 },
          { id: 'sub3', name: 'Amharic', maxMarks: 100 },
        ],
        marksSem1: {
          'st1': {
            'sub1': { studentId: 'st1', subjectId: 'sub1', score: 85 },
            'sub2': { studentId: 'st1', subjectId: 'sub2', score: 90 },
            'sub3': { studentId: 'st1', subjectId: 'sub3', score: 72 }
          },
          'st2': {
            'sub1': { studentId: 'st2', subjectId: 'sub1', score: 45 },
            'sub2': { studentId: 'st2', subjectId: 'sub2', score: 55 },
            'sub3': { studentId: 'st2', subjectId: 'sub3', score: 68 }
          }
        },
        marksSem2: {
          'st1': {
            'sub1': { studentId: 'st1', subjectId: 'sub1', score: 88 },
            'sub2': { studentId: 'st1', subjectId: 'sub2', score: 85 },
            'sub3': { studentId: 'st1', subjectId: 'sub3', score: 78 }
          },
          'st2': {
            'sub1': { studentId: 'st2', subjectId: 'sub1', score: 50 },
            'sub2': { studentId: 'st2', subjectId: 'sub2', score: 62 },
            'sub3': { studentId: 'st2', subjectId: 'sub3', score: 70 }
          }
        },
        config: { passingMark: 50, minPassedSubjectsToPromote: 2, autoSaveIntervalMs: 5000 },
        schoolInfo: { name: 'BT Express Academy', academicYear: '2026/2027', address: 'Nekemte, Ethiopia', directorName: 'Ato Chala Tolosa', homeroomTeacherName: 'W/ro Tigist Abebe', viceDirectorName: 'Ato Bekele Kenesa', evaluatorName: 'Dr. Aster Gemeda' },
        customRules: [
          { id: 'r1', metric: 'average', operator: 'gte', value: 50, outcome: 'promote' }
        ],
        studentFields: [
          { name: 'age', label: 'Age', type: 'number', isDefault: true },
          { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], isDefault: true },
          { name: 'birthDate', label: 'Birth Date', type: 'date', isDefault: true }
        ]
      }
    }
  ]);

  db.settings.bulkAdd([
    { key: 'language', value: 'en' },
    { key: 'activeFileId', value: 'file_9a' }
  ]);
});