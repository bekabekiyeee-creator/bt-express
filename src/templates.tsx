// src/templates.tsx
import type { Student, Subject, Mark, SchoolInfo, GradingConfig, FieldConfig } from './types';
import { Printer } from 'lucide-react';

interface ReportCardProps {
  templateId: string;
  student: Student;
  subjects: Subject[];
  summary: { totalScore: number; maxPossibleScore: number; average: number; failedSubjectsCount: number; isPromoted: boolean; s1Total: number; s1Average: number; s2Total: number; s2Average: number };
  rank: string | number;
  schoolInfo: SchoolInfo;
  reportSemester: 'sem1' | 'sem2' | 'annual';
  activeMarksSem1Map: Record<string, Record<string, Mark>>;
  activeMarksSem2Map: Record<string, Record<string, Mark>>;
  config: GradingConfig;
  printIndividualCard: (studentId: string) => void;
  printTargetStudentId: string | null;
  isTestMode: boolean;
  onCommentChange: (text: string) => void;
  onConductChange: (text: string) => void;
  totalStudentsCount: number;
  studentFields: FieldConfig[];
}

export function ReportCard({
  templateId,
  student,
  subjects,
  summary,
  rank,
  schoolInfo,
  reportSemester,
  activeMarksSem1Map,
  activeMarksSem2Map,
  config,
  printIndividualCard,
  printTargetStudentId,
  isTestMode,
  onCommentChange,
  onConductChange,
  totalStudentsCount,
  studentFields
}: ReportCardProps) {

  const getSubjectScores = (subId: string) => {
    const s1 = activeMarksSem1Map[student.id]?.[subId]?.score;
    const s2 = activeMarksSem2Map[student.id]?.[subId]?.score;
    
    let finalScore: number | '';
    if (reportSemester === 'sem1') {
      finalScore = typeof s1 === 'number' ? s1 : '';
    } else if (reportSemester === 'sem2') {
      finalScore = typeof s2 === 'number' ? s2 : '';
    } else {
      if (typeof s1 === 'number' && typeof s2 === 'number') finalScore = (s1 + s2) / 2;
      else if (typeof s1 === 'number') finalScore = s1;
      else if (typeof s2 === 'number') finalScore = s2;
      else finalScore = '';
    }
    return { s1, s2, final: finalScore };
  };

  const styles: Record<string, {
    container: string;
    border: string;
    headerBg: string;
    headerText: string;
    labelText: string;
    badge: string;
  }> = {
    t1: { container: "bg-white p-8 border-2 border-slate-300 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[600px] print:min-h-0 print:p-6", border: "border-slate-200", headerBg: "border-b-2 border-slate-900 pb-4 mb-4", headerText: "text-slate-900", labelText: "text-slate-500", badge: summary.isPromoted ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-rose-50 border-rose-500 text-rose-800" },
    t2: { container: "bg-white p-6 border border-teal-300 rounded-lg relative overflow-hidden flex flex-col justify-between min-h-[580px] print:min-h-0 print:p-4 font-mono", border: "border-teal-100", headerBg: "bg-teal-50 p-4 border border-teal-200 rounded-lg mb-4", headerText: "text-teal-950", labelText: "text-teal-600", badge: summary.isPromoted ? "bg-teal-100 border-teal-500 text-teal-900" : "bg-red-100 border-red-500 text-red-900" },
    t3: { container: "bg-white p-8 border-4 border-double border-amber-500 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[600px] print:min-h-0 print:p-6 font-serif", border: "border-amber-100", headerBg: "border-b-4 border-double border-amber-500 pb-4 mb-4", headerText: "text-rose-955", labelText: "text-amber-800", badge: summary.isPromoted ? "bg-amber-50 border-amber-600 text-amber-900" : "bg-rose-50 border-rose-700 text-rose-950" },
    t4: { container: "bg-white p-8 border-t-8 border-emerald-600 border-x-2 border-b-2 border-emerald-100 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[600px] print:min-h-0 print:p-6", border: "border-emerald-100", headerBg: "pb-4 mb-4", headerText: "text-emerald-950", labelText: "text-emerald-600", badge: summary.isPromoted ? "bg-emerald-50 border-emerald-600 text-emerald-900" : "bg-red-50 border-red-600 text-red-900" },
    t5: { container: "bg-white p-8 border-2 border-indigo-100 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[600px] print:min-h-0 print:p-6", border: "border-indigo-50", headerBg: "bg-indigo-900 p-6 rounded-2xl text-white mb-4", headerText: "text-white", labelText: "text-indigo-400 print:text-indigo-950", badge: summary.isPromoted ? "bg-indigo-100 border-indigo-500 text-indigo-900" : "bg-rose-100 border-rose-500 text-rose-900" },
    t6: { container: "bg-slate-50/50 p-8 border border-slate-100 rounded-none relative overflow-hidden flex flex-col justify-between min-h-[600px] print:min-h-0 print:p-6 print:bg-white", border: "border-slate-200", headerBg: "border-b border-slate-200 pb-4 mb-4", headerText: "text-slate-800", labelText: "text-slate-500", badge: summary.isPromoted ? "bg-white border-emerald-400 text-emerald-800" : "bg-white border-rose-400 text-rose-800" },
    t7: { container: "bg-white p-8 border-2 border-zinc-400 rounded-lg relative overflow-hidden flex flex-col justify-between min-h-[600px] print:min-h-0 print:p-6", border: "border-zinc-200", headerBg: "bg-zinc-800 text-white p-5 rounded-md mb-4", headerText: "text-white", labelText: "text-zinc-500 print:text-zinc-950", badge: summary.isPromoted ? "bg-zinc-100 border-zinc-800 text-zinc-900" : "bg-red-50 border-red-800 text-red-955" },
    t8: { container: "bg-amber-50/20 p-8 border-2 border-amber-200 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[600px] print:min-h-0 print:p-6 font-serif", border: "border-amber-200/60", headerBg: "border-b-2 border-amber-300 pb-4 mb-4", headerText: "text-amber-955", labelText: "text-amber-700", badge: summary.isPromoted ? "bg-amber-100/50 border-amber-500 text-amber-955" : "bg-rose-100/40 border-rose-700 text-rose-955" },
    t9: { container: "bg-white p-8 border-t-8 border-rose-900 border-x border-b border-rose-100 rounded-none relative overflow-hidden flex flex-col justify-between min-h-[600px] print:min-h-0 print:p-6 font-serif", border: "border-rose-100", headerBg: "pb-4 border-b border-rose-200 mb-4", headerText: "text-rose-955", labelText: "text-rose-800", badge: summary.isPromoted ? "bg-rose-50 border-rose-600 text-rose-900" : "bg-red-50 border-red-700 text-red-955" },
    t10: { container: "bg-white p-8 border-l-[16px] border-l-blue-900 border-y border-r border-blue-100 rounded-r-xl relative overflow-hidden flex flex-col justify-between min-h-[600px] print:min-h-0 print:p-6", border: "border-blue-50", headerBg: "border-b border-blue-100 pb-4 mb-4", headerText: "text-blue-955", labelText: "text-blue-600", badge: summary.isPromoted ? "bg-blue-50 border-blue-600 text-blue-900" : "bg-rose-50 border-rose-600 text-rose-900" }
  };

  const style = styles[templateId] || styles.t1;
  const isAnnual = reportSemester === 'annual';

  return (
    <div className={`${style.container} print-page-break report-card-container ${printTargetStudentId === student.id ? 'print-target' : ''}`}>
      
      {/* 1. BRANDING HEADER */}
      <div className={style.headerBg}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-2xl font-black tracking-tight uppercase ${style.headerText}`}>{schoolInfo.name}</h3>
            <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mt-1">Academic Year: {schoolInfo.academicYear}</p>
          </div>
          {schoolInfo.logoBase64 && <img src={schoolInfo.logoBase64} alt="Logo" className="w-16 h-16 object-contain" />}
        </div>
      </div>

      {/* 2. DEMOGRAPHICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs mb-4 bg-slate-50 p-4 rounded-xl border print:bg-white print:p-2">
        <div>
          <strong className={`${style.labelText} uppercase block text-[10px]`}>Student ID</strong>
          <span className="text-sm font-bold text-slate-800">{student.studentId || '-'}</span>
        </div>
        <div>
          <strong className={`${style.labelText} uppercase block text-[10px]`}>Name</strong>
          <span className="text-sm font-bold text-slate-800">{student.name}</span>
        </div>
        <div>
          <strong className={`${style.labelText} uppercase block text-[10px]`}>Conduct</strong>
          <input 
            type="text" 
            placeholder="A, B, C..." 
            value={student.conduct || ''} 
            onChange={(e) => onConductChange(e.target.value)} 
            disabled={isTestMode}
            className="w-16 mt-0.5 border text-center font-bold border-slate-300 rounded px-1 text-slate-800 uppercase focus:outline-none focus:ring-1 focus:ring-blue-500 print:border-0 print:p-0 print:w-auto print:text-left" 
          />
        </div>
        {studentFields.map(f => (
          <div key={f.name}>
            <strong className={`${style.labelText} uppercase block text-[10px]`}>{f.label}</strong>
            <span className="text-sm font-semibold text-slate-800">{student.fields?.[f.name] || '-'}</span>
          </div>
        ))}
      </div>

      {/* 3. PERFORMANCE MATRIX */}
      <div className="flex-1">
        <table className="w-full text-left text-sm border">
          <thead>
            <tr className="bg-slate-100 border-b">
              <th className="p-2 font-bold uppercase text-xs">Subject Name</th>
              {isAnnual ? (
                <>
                  <th className="p-2 font-bold text-center uppercase text-xs">Sem 1 Score</th>
                  <th className="p-2 font-bold text-center uppercase text-xs">Sem 2 Score</th>
                  <th className="p-2 font-bold text-center uppercase text-xs">Annual Avg</th>
                </>
              ) : (
                <>
                  <th className="p-2 font-bold text-center uppercase text-xs">Max Score</th>
                  <th className="p-2 font-bold text-center uppercase text-xs">Obtained</th>
                </>
              )}
              <th className="p-2 font-bold text-center uppercase text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(sub => {
              const scores = getSubjectScores(sub.id);
              const isFailed = typeof scores.final === 'number' && scores.final < config.passingMark;

              return (
                <tr key={sub.id} className="border-b">
                  <td className="p-2 font-semibold text-slate-800">{sub.name}</td>
                  {isAnnual ? (
                    <>
                      <td className="p-2 text-center font-mono text-slate-500">{typeof scores.s1 === 'number' ? scores.s1 : '--'}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{typeof scores.s2 === 'number' ? scores.s2 : '--'}</td>
                      <td className={`p-2 text-center font-mono font-bold ${isFailed ? 'text-red-600' : 'text-slate-800'}`}>{scores.final !== '' ? scores.final : '--'}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 text-center font-mono text-slate-500">{sub.maxMarks}</td>
                      <td className={`p-2 text-center font-mono font-bold ${isFailed ? 'text-red-600' : 'text-slate-800'}`}>{scores.final !== '' ? scores.final : '--'}</td>
                    </>
                  )}
                  <td className="p-2 text-center font-bold text-xs uppercase">
                    {scores.final === '' ? '-' : isFailed ? <span className="text-red-500">Fail</span> : <span className="text-emerald-600">Pass</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. TEACHER COMMENTS & DASHED CIRCLE STAMP */}
      <div className="mt-4 flex items-center gap-4 justify-between border p-3 rounded-lg bg-slate-50 print:bg-white print:border-slate-300">
        <div className="flex-1">
          <strong className={`${style.labelText} uppercase block text-[10px] mb-1`}>Homeroom Teacher's Remarks</strong>
          <textarea 
            value={student.teacherComment || ''} 
            disabled={isTestMode}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Type comments directly..."
            className="w-full border-0 bg-transparent text-sm font-medium focus:outline-none focus:ring-0 resize-none h-12 print:hidden"
          />
          <p className="hidden print:block text-sm font-semibold text-slate-800 italic">{student.teacherComment || 'No remarks provided.'}</p>
        </div>
        
        {/* Circled Stamp Placeholder */}
        <div className="relative shrink-0 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-full w-20 h-20 text-center text-[10px] text-slate-400 select-none">
          <span className="p-1 leading-none font-bold">School Stamp</span>
          {schoolInfo.stampBase64 && (
            <img src={schoolInfo.stampBase64} alt="Stamp Seal" className="absolute inset-0 w-full h-full object-contain rounded-full" />
          )}
        </div>
      </div>

      {/* 5. OFFICIAL SIGN SIGNATURES */}
      <div className="border-t pt-4 mt-4 flex justify-between items-end relative">
        <div className="grid grid-cols-2 gap-12 text-xs">
          <div className="border-t border-slate-400 pt-1 text-center min-w-[150px]">
            <p className="font-bold text-slate-700">{schoolInfo.homeroomTeacherName || '__________________'}</p>
            <p className="text-[10px] text-slate-500 uppercase mt-0.5">Homeroom Teacher</p>
          </div>
          <div className="border-t border-slate-400 pt-1 text-center min-w-[150px]">
            <p className="font-bold text-slate-700">{schoolInfo.directorName || '__________________'}</p>
            <p className="text-[10px] text-slate-500 uppercase mt-0.5">School Director</p>
          </div>
        </div>

        {/* Dynamic Totals and Averages calculations */}
        <div className="flex gap-4 text-sm text-right print:mt-4">
          {isAnnual ? (
            <>
              <div>
                <strong className={`${style.labelText} block uppercase text-[10px]`}>S1 Total / Avg</strong>
                <span className="text-xs font-bold font-mono text-slate-500">{summary.s1Total} / {summary.s1Average}%</span>
              </div>
              <div>
                <strong className={`${style.labelText} block uppercase text-[10px]`}>S2 Total / Avg</strong>
                <span className="text-xs font-bold font-mono text-slate-500">{summary.s2Total} / {summary.s2Average}%</span>
              </div>
              <div className="border-l pl-2">
                <strong className={`${style.labelText} block uppercase text-[10px] font-bold`}>Annual Tot / Avg</strong>
                <span className="text-sm font-black font-mono text-slate-900">{summary.totalScore} / {summary.average}%</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <strong className={`${style.labelText} block uppercase text-[10px]`}>Total Score</strong>
                <span className="text-sm font-bold font-mono text-slate-900">{summary.totalScore} / {summary.maxPossibleScore}</span>
              </div>
              <div>
                <strong className={`${style.labelText} block uppercase text-[10px]`}>Average</strong>
                <span className="text-sm font-black font-mono text-slate-900">{summary.average}%</span>
              </div>
            </>
          )}
          <div>
            <strong className={`${style.labelText} block uppercase text-[10px]`}>{isAnnual ? 'Annual Rank' : 'Rank'}</strong>
            <span className="text-base font-black font-mono">{rank} / {totalStudentsCount}</span>
          </div>
          <span className={`px-3 py-1 self-end rounded-full text-[10px] font-black tracking-wide uppercase border-2 ${style.badge}`}>{summary.isPromoted ? 'Promoted' : 'Detained'}</span>
        </div>
      </div>

      {/* Individual Print buttons */}
      <div className="absolute top-4 right-4 print:hidden">
        <button onClick={() => printIndividualCard(student.id)} className="bg-slate-100 hover:bg-slate-200 border text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
          <Printer size={12} /> Print Card
        </button>
      </div>

    </div>
  );
}