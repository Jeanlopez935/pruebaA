
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STUDENTS } from '../../constants';
import { Save, Plus, Calendar } from 'lucide-react';

export const TeacherGradeManagement = () => {
  const [evaluation, setEvaluation] = useState('Examen Parcial 1');
  const [date, setDate] = useState('2025-10-15');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSection, setSelectedSection] = useState('A');

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Crear Nueva Evaluación</h2>
        <div className="space-y-4">
          
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary">
              <option>Matemáticas</option>
              <option>Historia</option>
              <option>Biología</option>
              <option>Física</option>
              <option>Química</option>
              <option>Inglés</option>
            </select>
          </div>

          {/* Section Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sección</label>
            <div className="flex gap-3">
              {['A', 'B', 'C', 'D'].map(section => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`w-12 h-12 rounded-lg font-bold border transition-colors ${
                    selectedSection === section
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Evaluación</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Ej: Proyecto Final" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje (%)</label>
            <input type="number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="20" />
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setIsCreating(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-800">Guardar Evaluación</button>
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
            <select disabled className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
              <option>Matemáticas - 5to Grado A</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluación</label>
            <select 
              value={evaluation} 
              onChange={(e) => setEvaluation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
            >
              <option>Examen Parcial 1</option>
              <option>Trabajo Escrito</option>
            </select>
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

        <div className="flex items-center gap-4 mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <Calendar className="text-yellow-700" size={20} />
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-bold text-yellow-800">Fecha de Evaluación:</span>
            {isEditingDate ? (
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                onBlur={() => setIsEditingDate(false)}
                autoFocus
                className="p-1 border border-yellow-300 rounded bg-white text-sm"
              />
            ) : (
              <span className="text-sm text-yellow-900">{date}</span>
            )}
          </div>
          <button 
            onClick={() => setIsEditingDate(!isEditingDate)}
            className="text-xs text-primary font-bold hover:underline"
          >
            {isEditingDate ? 'Guardar' : 'Modificar fecha'}
          </button>
        </div>

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
            {MOCK_STUDENTS.map(student => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-500 font-mono">{student.cedula}</td>
                <td className="px-6 py-3 font-medium">{student.name}</td>
                <td className="px-6 py-3">
                  <input 
                    type="number" 
                    min="0" 
                    max="20"
                    defaultValue={Math.floor(Math.random() * 5) + 15}
                    className="w-full text-center border border-gray-300 rounded p-1 focus:ring-primary focus:border-primary font-bold text-gray-800"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end gap-4">
          <Link to="/docente/resumen" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2 transition-colors">
            Volver al Resumen
          </Link>
          <button className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 flex items-center gap-2 shadow-lg transition-colors">
            <Save size={20} />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
