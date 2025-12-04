import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Subject, Student, Grade } from '../../types';
import { ArrowLeft, Edit } from 'lucide-react';

export const TeacherGradesSummary = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLapso, setSelectedLapso] = useState(1);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await client.get('subjects/');
        const fetchedSubjects = res.data.map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
          grade: s.grade_level,
          section: s.section || 'A', // Default to A if not set
          teacherId: s.teacher?.toString(),
          schedule: []
        }));
        setSubjects(fetchedSubjects);
        if (fetchedSubjects.length > 0) {
          setSelectedSubjectId(fetchedSubjects[0].id);
        }
      } catch (error) {
        console.error("Error fetching subjects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) return;

    const fetchData = async () => {
      try {
        // Fetch Grades for the subject
        const gradesRes = await client.get(`grades/?subject_id=${selectedSubjectId}`);
        const fetchedGrades = gradesRes.data.map((g: any) => ({
          studentId: g.student.toString(),
          subjectId: g.subject_id?.toString() || '',
          evaluationName: g.evaluation_name || 'Evaluación',
          score: parseFloat(g.score),
          date: g.evaluation_date || new Date().toISOString(),
          evaluationLapso: g.evaluation_lapso // Ensure backend sends this
        }));
        setGrades(fetchedGrades);

        // Fetch Students and filter by Subject's Grade and Section
        const studentsRes = await client.get('students/');
        const currentSubject = subjects.find(s => s.id === selectedSubjectId);

        const fetchedStudents = studentsRes.data
          .filter((s: any) => {
            if (!currentSubject) return false;
            // Match Grade and Section
            return s.current_grade === currentSubject.grade && s.section === currentSubject.section;
          })
          .map((s: any) => ({
            id: s.id.toString(),
            name: `${s.first_name} ${s.last_name}`,
            cedula: s.id_number,
            grade: s.current_grade,
            section: s.section,
            parentId: s.representative.toString()
          }));
        setStudents(fetchedStudents);

      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, [selectedSubjectId]);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  // Calculate averages based on selected Lapso
  const studentAverages = students.map(student => {
    // Filter grades by student AND selected lapso
    const studentGrades = grades.filter(g =>
      g.studentId === student.id &&
      (g.evaluationLapso === selectedLapso || (!g.evaluationLapso && selectedLapso === 1)) // Fallback for old data
    );

    if (studentGrades.length === 0) return { ...student, average: '-' };

    const sum = studentGrades.reduce((acc, curr) => acc + curr.score, 0);
    const avg = sum / studentGrades.length;
    return { ...student, average: avg.toFixed(2) };
  });

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Resumen de Calificaciones</h1>
        <Link to="/docente/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} /> Volver
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="text-xl font-bold text-gray-800 bg-transparent border-none focus:ring-0 p-0 cursor-pointer hover:text-primary transition-colors"
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.grade} "{subject.section}")
                  </option>
                ))}
              </select>

              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              <select
                value={selectedLapso}
                onChange={(e) => setSelectedLapso(parseInt(e.target.value))}
                className="text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-primary focus:border-primary"
              >
                <option value={1}>Lapso 1</option>
                <option value={2}>Lapso 2</option>
                <option value={3}>Lapso 3</option>
              </select>
            </div>

            {selectedSubject && (
              <p className="text-gray-500">
                {selectedSubject.grade} - Sección {selectedSubject.section} • Año Escolar: 2025-2026
              </p>
            )}
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
                <th className="px-6 py-3 font-bold text-center">Promedio Lapso {selectedLapso} (20pts)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {studentAverages.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-gray-600">{student.cedula}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className={`px-6 py-4 text-center font-bold ${student.average !== '-' && parseFloat(student.average) >= 10 ? 'text-blue-600' : 'text-red-600'}`}>
                    {student.average}
                  </td>
                </tr>
              ))}
              {studentAverages.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No hay estudiantes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
