import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Subject } from '../../types';
import { BookOpen, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Fetch all subjects. In a real app, the backend should filter by the logged-in teacher.
        // Currently, our SubjectViewSet returns all subjects. 
        // We can filter client-side if needed, or rely on backend improvements later.
        const res = await client.get('subjects/');
        const fetchedSubjects = res.data.map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
          grade: s.grade_level,
          section: s.section,
          teacherId: s.teacher?.toString(),
          schedule: []
        }));

        // Filter by current teacher if user.id matches teacherId (assuming user.id is the teacher's user ID)
        // Note: The teacher model links to User. The subject links to Teacher.
        // We might need to fetch the Teacher profile first to get the ID.
        // For now, let's display all subjects to verify data flow.
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error("Error fetching subjects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando asignaturas...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido, {user?.name}</h1>
        <p className="text-gray-500">Resumen de sus asignaturas y clases asignadas.</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mis Asignaturas</h2>
          <Link to="/docente/resumen" className="text-primary font-medium hover:underline">Ver todas</Link>
        </div>

        {subjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => (
              <div key={subject.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <BookOpen className="text-primary" size={24} />
                  </div>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {subject.grade} "{subject.section}"
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-1">{subject.name}</h3>
                <p className="text-gray-500 text-sm mb-4">Sección "{subject.section}"</p>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Users size={16} />
                  <span>-- Estudiantes</span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500 text-right">Progreso Calificaciones: 0%</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500">No tiene asignaturas asignadas actualmente.</p>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-indigo-900">Gestión de Calificaciones</h3>
          <p className="text-indigo-700">Acceda rápidamente para cargar notas pendientes.</p>
        </div>
        <Link to="/docente/gestion" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
          Ir a Gestión
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
