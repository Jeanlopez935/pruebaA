import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Student, Subject, Grade } from '../../types';
import { Download } from 'lucide-react';

export const RepresentativeGrades = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLapso, setSelectedLapso] = useState(1);


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
          date: g.evaluation_date || new Date().toISOString(),
          evaluationLapso: g.evaluation_lapso || 1
        }));
        setGrades(fetchedGrades);
      } catch (error) {
        console.error("Error fetching grades", error);
      }
    };
    fetchGrades();
  }, [selectedStudentId]);

  const filteredGrades = grades.filter(g => g.evaluationLapso === selectedLapso);

  const handleDownloadReport = async () => {
    if (!selectedStudentId) return;
    try {
      const response = await client.get(`students/${selectedStudentId}/report_card/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `boletin_estudiante_${selectedStudentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report", error);
      alert("Error al descargar el boletín. Verifique su sesión.");
    }
  };

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Consulta de Calificaciones</h2>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-800 transition-colors"
          >
            <Download size={20} /> Descargar Boletín
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
          >
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="flex gap-4 border-b border-gray-200 mb-6">
          {[1, 2, 3].map(lapso => (
            <button
              key={lapso}
              onClick={() => setSelectedLapso(lapso)}
              className={`pb-2 px-4 font-medium transition-colors ${selectedLapso === lapso
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Lapso {lapso}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Asignatura</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Evaluación</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Nota (20)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.map((grade, idx) => {
                const subjectName = subjects.find(s => s.id === grade.subjectId)?.name || 'Desconocida';
                return (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{subjectName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{grade.evaluationName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(grade.date)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${grade.score >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                      {grade.score}
                    </td>
                  </tr>
                );
              })}
              {filteredGrades.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay calificaciones registradas para este lapso.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};