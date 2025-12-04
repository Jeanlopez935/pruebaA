import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Student, Grade, Payment } from '../../types';
import { Users, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RepresentativeDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [recentGrades, setRecentGrades] = useState<Grade[]>([]);
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
    if (!selectedStudentId) return;

    const fetchData = async () => {
      try {
        // Fetch Payments
        const paymentsRes = await client.get(`payments/?student_id=${selectedStudentId}`);
        const payments = paymentsRes.data.map((p: any) => ({
          id: p.id.toString(),
          studentId: p.student.toString(),
          concept: p.concept,
          amountUsd: parseFloat(p.amount_usd),
          amountBs: parseFloat(p.amount_bs),
          status: p.status === 'PENDING' ? 'pending' : p.status === 'VERIFIED' ? 'verified' : 'rejected',
          date: p.date_reported,
          reference: p.reference_number,
          adminNote: p.admin_note
        })).filter((p: any) => p.status !== 'verified');
        setPendingPayments(payments);

        // Fetch Grades
        const gradesRes = await client.get(`grades/?student_id=${selectedStudentId}`);
        const grades = gradesRes.data.map((g: any) => ({
          studentId: g.student.toString(),
          subjectId: g.subject_id?.toString() || '',
          evaluationName: g.evaluation_name || 'Evaluación',
          score: parseFloat(g.score),
          date: g.evaluation_date || new Date().toISOString()
        }));
        setRecentGrades(grades);

      } catch (error) {
        console.error("Error fetching student data", error);
      }
    };
    fetchData();
  }, [selectedStudentId]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE');
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando información...</div>;
  }

  if (!selectedStudent) {
    return <div className="p-8 text-center">No se encontraron estudiantes asociados.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hola, {user?.name}</h1>
          <p className="text-gray-500">Usted está viendo la información del estudiante: <span className="font-bold text-primary">{selectedStudent.name}</span></p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm font-medium text-gray-600 pl-2">Seleccionar Estudiante:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer"
          >
            {students.map(student => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert Section */}
      {pendingPayments.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-4">
          <AlertCircle className="text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-800">Usted tiene pagos pendientes</h3>
            <p className="text-red-700 text-sm mt-1">
              Existen {pendingPayments.length} pagos que requieren su atención. Por favor verifique la sección de pagos.
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="#/rep/calificaciones" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
            <TrendingUp size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Ver Calificaciones</h3>
            <p className="text-gray-500">Consulte el rendimiento académico detallado.</p>
          </div>
        </a>

        <a href="#/rep/horarios" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
            <Users size={32} /> {/* Using Users icon as placeholder for Schedule if Calendar not available */}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Horario de Clases</h3>
            <p className="text-gray-500">Visualice el horario escolar semanal.</p>
          </div>
        </a>
      </div>

      {/* Quick Stats / Recent Grades */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Calificaciones Recientes
          </h3>
          <div className="space-y-4 flex-1">
            {recentGrades.length > 0 ? (
              recentGrades.map((grade, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Evaluación {grade.evaluationName}</p>
                    <p className="text-xs text-gray-500">{formatDate(grade.date)}</p>
                  </div>
                  <div className={`font-bold text-lg ${grade.score >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                    {grade.score}/20
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center min-h-[100px]">
                <p className="text-gray-500 italic">No hay calificaciones recientes.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-primary text-white p-6 rounded-xl shadow-md flex flex-col">
          <h3 className="font-bold text-lg mb-2">Información del Estudiante</h3>
          <div className="space-y-4 mt-4">
            <div className="flex justify-between border-b border-blue-800 pb-2">
              <span className="text-blue-200">Grado/Año:</span>
              <span className="font-medium">{selectedStudent.grade}</span>
            </div>
            <div className="flex justify-between border-b border-blue-800 pb-2">
              <span className="text-blue-200">Sección:</span>
              <span className="font-medium">{selectedStudent.section}</span>
            </div>
            <div className="flex justify-between border-b border-blue-800 pb-2">
              <span className="text-blue-200">Cédula:</span>
              <span className="font-medium">{selectedStudent.cedula}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
