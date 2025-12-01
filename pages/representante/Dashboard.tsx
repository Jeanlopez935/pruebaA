
import React, { useState } from 'react';
import { MOCK_STUDENTS, MOCK_GRADES, MOCK_PAYMENTS, BCV_RATE } from '../../constants';
import { Users, AlertCircle, TrendingUp } from 'lucide-react';

export const RepresentativeDashboard = () => {
  const [selectedStudentId, setSelectedStudentId] = useState(MOCK_STUDENTS[0].id);
  const selectedStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId)!;
  
  // Logic to find pending payments
  const pendingPayments = MOCK_PAYMENTS.filter(p => p.studentId === selectedStudentId && p.status !== 'verified');
  
  // Logic for recent grades
  const recentGrades = MOCK_GRADES.filter(g => g.studentId === selectedStudentId);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-8">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hola, {selectedStudent.name}</h1>
          <p className="text-gray-500">Resumen académico del Año Escolar Actual</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm font-medium text-gray-600 pl-2">Seleccionar Estudiante:</span>
          <select 
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer"
          >
            {MOCK_STUDENTS.map(student => (
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
                    <p className="font-medium text-gray-900">{grade.evaluationName}</p>
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
