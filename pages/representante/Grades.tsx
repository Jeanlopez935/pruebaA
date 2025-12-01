import React, { useState } from 'react';
import { MOCK_STUDENTS, MOCK_SUBJECTS, MOCK_GRADES } from '../../constants';

export const RepresentativeGrades = () => {
  const [selectedStudentId, setSelectedStudentId] = useState(MOCK_STUDENTS[0].id);
  const [selectedSubjectId, setSelectedSubjectId] = useState(MOCK_SUBJECTS[0].id);

  const studentGrades = MOCK_GRADES.filter(
    g => g.studentId === selectedStudentId && g.subjectId === selectedSubjectId
  );

  const subject = MOCK_SUBJECTS.find(s => s.id === selectedSubjectId);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-primary mb-6">Consulta de Calificaciones</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
            <select 
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
            >
              {MOCK_STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asignatura</label>
            <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
            >
              {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg mb-6">
          <p className="text-sm text-blue-900">
            <span className="font-bold">Docente:</span> Prof. Carlos Sánchez
          </p>
          <p className="text-sm text-blue-900 mt-1">
            <span className="font-bold">Año escolar actual:</span> 2025-2026
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actividad / Evaluación</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Calificación (20)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentGrades.map((grade, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.evaluationName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(grade.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">{grade.score}</td>
                </tr>
              ))}
              {studentGrades.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No hay calificaciones registradas para este periodo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};