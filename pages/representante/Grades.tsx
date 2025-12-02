import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Student, Subject, Grade } from '../../types';

export const RepresentativeGrades = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await client.get('students/');
        const fetchedStudents = response.data.map((s: any) => ({
          id: s.id.toString(),
          name: `${s.first_name} ${s.last_name}`,
          cedula: s.id_number,
          grade: s.current_grade,
          section: s.section,
          parentId: s.representative.toString()
        }));
        setStudents(fetchedStudents);
        if (fetchedStudents.length > 0) {
          setSelectedStudentId(fetchedStudents[0].id);
        }
      } catch (error) {
        console.error("Error fetching students", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await client.get('subjects/');
        const fetchedSubjects = res.data.map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
          grade: s.grade_level,
          section: 'A', // Default or fetch if available
          teacherId: s.teacher?.toString(),
          schedule: [] // Schedule not yet implemented in backend
        }));
        setSubjects(fetchedSubjects);
        if (fetchedSubjects.length > 0) {
          setSelectedSubjectId(fetchedSubjects[0].id);
        }
      } catch (error) {
        console.error("Error fetching subjects", error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchGrades = async () => {
      try {
        const res = await client.get(`grades/?student_id=${selectedStudentId}`);
        const fetchedGrades = res.data.map((g: any) => ({
          studentId: g.student.toString(),
          subjectId: g.subject_id?.toString() || '',
          evaluationName: g.evaluation_name || 'Evaluación',
          score: parseFloat(g.score),
          date: g.evaluation_date || new Date().toISOString()
        }));
        setGrades(fetchedGrades);
      } catch (error) {
        console.error("Error fetching grades", error);
      }
    };
    fetchGrades();
  }, [selectedStudentId]);

  const studentGrades = grades.filter(
    g => g.studentId === selectedStudentId && g.subjectId === selectedSubjectId
  );

  const subject = subjects.find(s => s.id === selectedSubjectId);
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE');
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (students.length === 0) return <div className="p-8 text-center">No tiene estudiantes asignados.</div>;

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
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asignatura</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
            </select>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg mb-6">
          <p className="text-sm text-blue-900">
            <span className="font-bold">Docente:</span> {subject?.teacherId ? 'Asignado' : 'Por asignar'}
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
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No hay calificaciones registradas para esta asignatura.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};