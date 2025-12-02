import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Student, Subject } from '../../types';

// Standardized academic blocks + breaks
const TIME_BLOCKS = [
  { id: 1, label: '07:00 - 07:45', start: '07:00 AM', end: '07:45 AM', type: 'class' },
  { id: 2, label: '07:45 - 08:30', start: '07:45 AM', end: '08:30 AM', type: 'class' },
  { id: 3, label: '08:30 - 09:15', start: '08:30 AM', end: '09:15 AM', type: 'class' },
  { id: 4, label: '09:15 - 09:45', start: '09:15 AM', end: '09:45 AM', type: 'class' },
  { id: 5, label: '09:45 - 10:30', start: '09:45 AM', end: '10:30 AM', type: 'break', name: 'Receso' },
  { id: 6, label: '10:30 - 11:15', start: '10:30 AM', end: '11:15 AM', type: 'class' },
  { id: 7, label: '11:15 - 12:00', start: '11:15 AM', end: '12:00 PM', type: 'class' },
  { id: 8, label: '12:00 - 12:45', start: '12:00 PM', end: '12:45 PM', type: 'class' },
  { id: 9, label: '12:45 - 01:30', start: '12:45 PM', end: '01:30 PM', type: 'class' },
];

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const RepresentativeSchedule = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
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
    // In a real app, we would fetch the schedule for the specific student/section
    // For now, we fetch subjects and will display them in a mock schedule or list
    const fetchSubjects = async () => {
      try {
        const res = await client.get('subjects/');
        const fetchedSubjects = res.data.map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
          grade: s.grade_level,
          section: 'A',
          teacherId: s.teacher?.toString(),
          schedule: [] // Backend doesn't support schedule blocks yet
        }));
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error("Error fetching subjects", error);
      }
    };
    fetchSubjects();
  }, []);

  const student = students.find(s => s.id === selectedStudentId);

  // Filter subjects for the student's grade
  const studentSubjects = student
    ? subjects.filter(sub => sub.grade === student.grade)
    : [];

  // Mock schedule distribution for demo purposes since backend lacks schedule model
  const getSubjectForSlot = (day: string, startTime: string) => {
    // Simple deterministic assignment based on day/time hash for demo
    if (!studentSubjects.length) return null;
    const index = (day.length + startTime.length) % (studentSubjects.length + 2);
    if (index < studentSubjects.length) {
      return studentSubjects[index].name;
    }
    return null;
  };

  if (loading) return <div className="p-8 text-center">Cargando horario...</div>;
  if (!student) return <div className="p-8 text-center">No hay estudiantes seleccionados.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Horario Académico</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Seleccionar Estudiante:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full sm:w-52 p-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary bg-white"
          >
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <h3 className="text-lg font-semibold text-primary w-full sm:w-1/3 text-left">Horario de Clases</h3>

          <div className="text-gray-600 font-medium w-full sm:w-1/3 text-center">
            Año Escolar 2025-2026
          </div>

          <div className="text-gray-900 font-bold w-full sm:w-1/3 text-right">
            {student.grade}, Sección "{student.section}"
          </div>
        </div>

        <div className="min-w-[800px]">
          <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="w-1/6 px-4 py-4 text-left text-sm font-bold uppercase tracking-wider border-b border-r border-gray-200">Hora</th>
                  {DAYS.map(day => (
                    <th key={day} className="w-[16.6%] px-4 py-4 text-left text-sm font-bold uppercase tracking-wider border-b border-gray-200">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {TIME_BLOCKS.map((block) => (
                  <tr key={block.id} className={block.type === 'break' ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-500 border-r border-gray-200 whitespace-nowrap">
                      {block.label}
                    </td>

                    {block.type === 'break' ? (
                      <td colSpan={5} className="px-4 py-3 text-center text-sm font-bold text-gray-400 tracking-widest uppercase bg-gray-100/50">
                        {block.name}
                      </td>
                    ) : (
                      DAYS.map(day => {
                        const subjectName = getSubjectForSlot(day, block.start);
                        return (
                          <td key={day} className="px-4 py-3 text-sm border-l border-gray-100">
                            {subjectName ? (
                              <span className="font-semibold text-gray-900 block">
                                {subjectName}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
