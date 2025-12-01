
import React from 'react';
import { MOCK_SUBJECTS, MOCK_STUDENTS } from '../../constants';
import { BookOpen, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherDashboard = () => {
  // Use the actual length of the mock students array
  const studentCount = MOCK_STUDENTS.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido, Prof. Sánchez</h1>
        <p className="text-gray-500">Resumen de sus asignaturas y clases asignadas.</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mis Asignaturas</h2>
          <Link to="/docente/resumen" className="text-primary font-medium hover:underline">Ver todas</Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_SUBJECTS.map(subject => (
            <div key={subject.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <BookOpen className="text-primary" size={24} />
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {subject.grade}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-1">{subject.name}</h3>
              <p className="text-gray-500 text-sm mb-4">Sección "{subject.section}"</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Users size={16} />
                <span>{studentCount} Estudiantes</span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-500 text-right">Progreso Calificaciones: 75%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-indigo-900">Gestión de Calificaciones</h3>
          <p className="text-indigo-700">Acceda rápidamente para cargar notas pendientes.</p>
        </div>
        <Link to="/docente/resumen" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
          Ir a Gestión
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
