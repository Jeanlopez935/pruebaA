
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STUDENTS, MOCK_SUBJECTS } from '../../constants';
import { ArrowLeft, Edit } from 'lucide-react';

export const TeacherGradesSummary = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(MOCK_SUBJECTS[0].id);
  
  const selectedSubject = MOCK_SUBJECTS.find(s => s.id === selectedSubjectId) || MOCK_SUBJECTS[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Resumen de Calificaciones</h1>
        <Link to="/docente/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} /> Volver
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xl font-bold text-gray-800 bg-transparent border-none focus:ring-0 p-0 cursor-pointer hover:text-primary transition-colors"
            >
              {MOCK_SUBJECTS.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <p className="text-gray-500">
              {selectedSubject.grade} - Sección {selectedSubject.section} • Año Escolar: 2025-2026
            </p>
          </div>
          <Link 
            to="/docente/gestion" 
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 flex items-center gap-2"
          >
            <Edit size={18} />
            Gestionar Evaluaciones
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-500 border-b">
              <tr>
                <th className="px-6 py-3 font-bold">Cédula</th>
                <th className="px-6 py-3 font-bold">Nombre del Alumno</th>
                <th className="px-6 py-3 font-bold text-center">Promedio (20pts)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_STUDENTS.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-gray-600">{student.cedula}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">18.5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
