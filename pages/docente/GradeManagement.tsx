import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Subject, Student, Evaluation, Grade } from '../../types';
import { Save, Plus, Calendar } from 'lucide-react';

export const TeacherGradeManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]); // Existing grades from DB
  const [gradeInputs, setGradeInputs] = useState<{ [studentId: string]: number }>({}); // Local state for inputs

  // UI State
  const [isCreating, setIsCreating] = useState(false);
  const [newEvalName, setNewEvalName] = useState('');
  const [newEvalDate, setNewEvalDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEvalPercentage, setNewEvalPercentage] = useState('');

  const [loading, setLoading] = useState(true);

  // Fetch Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await client.get('subjects/');
        const fetchedSubjects = res.data.map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
          grade: s.grade_level,
          section: s.section || 'A',
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

  // Fetch Evaluations and Students when Subject changes
  useEffect(() => {
    if (!selectedSubjectId) return;

    const fetchData = async () => {
      try {
        // Fetch Evaluations
        const evalRes = await client.get(`evaluations/?subject_id=${selectedSubjectId}`);
        const fetchedEvals = evalRes.data.map((e: any) => ({
          id: e.id.toString(),
          subjectId: e.subject.toString(),
          name: e.name,
          percentage: parseFloat(e.percentage),
          date: e.date
        }));
        setEvaluations(fetchedEvals);
        if (fetchedEvals.length > 0) {
          setSelectedEvaluationId(fetchedEvals[0].id);
        } else {
          setSelectedEvaluationId('');
        }

        // Fetch Students and filter by Subject's Grade and Section
        const studentsRes = await client.get('students/');
        const currentSubject = subjects.find(s => s.id === selectedSubjectId);

        const fetchedStudents = studentsRes.data
          .filter((s: any) => {
            if (!currentSubject) return false;
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
        console.error("Error fetching subject data", error);
      }
    };
    fetchData();
  }, [selectedSubjectId]);

  // Fetch Grades when Evaluation changes
  useEffect(() => {
    if (!selectedEvaluationId) {
      setGrades([]);
      setGradeInputs({});
      return;
    }

    const fetchGrades = async () => {
      try {
        const res = await client.get(`grades/?evaluation_id=${selectedEvaluationId}`);
        const fetchedGrades = res.data.map((g: any) => ({
          id: g.id.toString(),
          studentId: g.student.toString(),
          subjectId: g.subject_id?.toString() || '',
          evaluationName: g.evaluation_name || '',
          score: parseFloat(g.score),
          date: g.evaluation_date || ''
        }));
        setGrades(fetchedGrades);

        // Initialize inputs with existing grades
        const inputs: { [key: string]: number } = {};
        fetchedGrades.forEach((g: any) => {
          inputs[g.studentId] = g.score;
        });
        setGradeInputs(inputs);

      } catch (error) {
        console.error("Error fetching grades", error);
      }
    };
    fetchGrades();
  }, [selectedEvaluationId]);

  const handleCreateEvaluation = async () => {
    if (!newEvalName || !newEvalDate || !newEvalPercentage || !selectedSubjectId) return;

    try {
      await client.post('evaluations/', {
        subject: selectedSubjectId,
        name: newEvalName,
        date: newEvalDate,
        percentage: parseFloat(newEvalPercentage)
      });
      alert("Evaluación creada exitosamente");
      setIsCreating(false);
      setNewEvalName('');
      setNewEvalPercentage('');

      // Refresh evaluations
      const evalRes = await client.get(`evaluations/?subject_id=${selectedSubjectId}`);
      const fetchedEvals = evalRes.data.map((e: any) => ({
        id: e.id.toString(),
        subjectId: e.subject.toString(),
        name: e.name,
        percentage: parseFloat(e.percentage),
        date: e.date
      }));
      setEvaluations(fetchedEvals);
      // Select the new one (last one usually)
      if (fetchedEvals.length > 0) {
        setSelectedEvaluationId(fetchedEvals[fetchedEvals.length - 1].id);
      }

    } catch (error: any) {
      console.error("Error creating evaluation", error);
      alert(`Error al crear evaluación: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedEvaluationId) return;

    try {
      // Process each student's grade
      const promises = students.map(async (student) => {
        const score = gradeInputs[student.id];
        if (score === undefined || score === null) return; // Skip if no input

        const existingGrade = grades.find(g => g.studentId === student.id);

        if (existingGrade) {
          // Update
          if (existingGrade.score !== score) {
            await client.put(`grades/${existingGrade.id}/`, {
              student: student.id,
              evaluation: selectedEvaluationId,
              score: score
            });
          }
        } else {
          // Create
          await client.post('grades/', {
            student: student.id,
            evaluation: selectedEvaluationId,
            score: score
          });
        }
      });

      await Promise.all(promises);
      alert("Calificaciones guardadas exitosamente");

      // Refresh grades
      const res = await client.get(`grades/?evaluation_id=${selectedEvaluationId}`);
      const fetchedGrades = res.data.map((g: any) => ({
        id: g.id.toString(),
        studentId: g.student.toString(),
        subjectId: g.subject_id?.toString() || '',
        evaluationName: g.evaluation_name || '',
        score: parseFloat(g.score),
        date: g.evaluation_date || ''
      }));
      setGrades(fetchedGrades);

    } catch (error) {
      console.error("Error saving grades", error);
      alert("Error al guardar calificaciones");
    }
  };

  const selectedEvaluation = evaluations.find(e => e.id === selectedEvaluationId);
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Crear Nueva Evaluación</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <input
              type="text"
              value={selectedSubject?.name || ''}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Evaluación</label>
            <input
              type="text"
              value={newEvalName}
              onChange={e => setNewEvalName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Ej: Proyecto Final"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={newEvalDate}
              onChange={e => setNewEvalDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje (%)</label>
            <input
              type="number"
              value={newEvalPercentage}
              onChange={e => setNewEvalPercentage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="20"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setIsCreating(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleCreateEvaluation} className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-800">Guardar Evaluación</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Calificaciones</h1>
        <Link to="/docente/resumen" className="text-primary font-medium hover:underline">Volver al Resumen</Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluación</label>
            <select
              value={selectedEvaluationId}
              onChange={(e) => setSelectedEvaluationId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
              disabled={evaluations.length === 0}
            >
              {evaluations.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            {evaluations.length === 0 && <p className="text-xs text-red-500 mt-1">No hay evaluaciones creadas.</p>}
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex justify-center items-center gap-2 transition-colors"
            >
              <Plus size={18} /> Nueva Evaluación
            </button>
          </div>
        </div>

        {selectedEvaluation && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <Calendar className="text-yellow-700" size={20} />
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm font-bold text-yellow-800">Fecha de Evaluación:</span>
              <span className="text-sm text-yellow-900">{new Date(selectedEvaluation.date).toLocaleDateString('es-VE')}</span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <p className="text-blue-800 font-medium">Período Académico: 2025 - 2026 (Lapso 1)</p>
        </div>

        <table className="w-full text-left text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3 border-b">Cédula</th>
              <th className="px-6 py-3 border-b">Estudiante</th>
              <th className="px-6 py-3 border-b w-32 text-center">Nota (0-20)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-500 font-mono">{student.cedula}</td>
                <td className="px-6 py-3 font-medium">{student.name}</td>
                <td className="px-6 py-3">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={gradeInputs[student.id] !== undefined ? gradeInputs[student.id] : ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setGradeInputs(prev => ({ ...prev, [student.id]: isNaN(val) ? 0 : val }));
                    }}
                    disabled={!selectedEvaluationId}
                    className="w-full text-center border border-gray-300 rounded p-1 focus:ring-primary focus:border-primary font-bold text-gray-800 disabled:bg-gray-100"
                  />
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No hay estudiantes en esta sección.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end gap-4">
          <Link to="/docente/resumen" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2 transition-colors">
            Volver al Resumen
          </Link>
          <button
            onClick={handleSaveGrades}
            disabled={!selectedEvaluationId}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 flex items-center gap-2 shadow-lg transition-colors disabled:bg-gray-400"
          >
            <Save size={20} />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
