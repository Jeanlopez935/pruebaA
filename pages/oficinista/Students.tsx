
import React, { useState } from 'react';
import { MOCK_STUDENTS } from '../../constants';
import { Plus, Edit, Save, X, Calendar, Book } from 'lucide-react';

export const ClerkStudents = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic'>('personal');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h1>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors"
          >
            <Plus size={20} /> Agregar Nuevo Estudiante
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'personal' ? 'Datos del Estudiante' : 'Asignación Académica'}
            </h2>
            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'personal' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              1. Datos Personales
            </button>
            <button 
              onClick={() => setActiveTab('academic')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'academic' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              2. Asignaturas y Horarios
            </button>
          </div>
          
          <form className="space-y-8">
            {activeTab === 'personal' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Ej: Ana Lucía" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Ej: Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cédula de Identidad / Escolar</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="V-XX.XXX.XXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                  <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año / Grado</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white">
                    <option>Seleccionar...</option>
                    <option>5to Grado</option>
                    <option>1er Año</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sección</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white">
                    <option>Seleccionar...</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-3">
                  <Book className="text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Asignación Masiva</p>
                    <p className="text-xs text-blue-700">El estudiante heredará las asignaturas base de su grado y sección.</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Asignaturas Individuales</h3>
                  <div className="space-y-3">
                    {['Matemáticas', 'Lenguaje', 'Historia', 'Inglés', 'Deportes'].map((subj, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
                          <span className="font-medium text-gray-700">{subj}</span>
                        </div>
                        <button type="button" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                          <Calendar size={16} /> Horario Individual
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-100 transition-colors">
                    + Agregar Asignatura Extra
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              {activeTab === 'personal' ? (
                <button 
                  type="button"
                  onClick={() => setActiveTab('academic')}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-800 shadow-md transition-colors"
                >
                  Siguiente
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-3 bg-success text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save size={20} /> Guardar Estudiante
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Nombre</th>
                <th className="px-6 py-4 font-bold text-gray-700">Cédula</th>
                <th className="px-6 py-4 font-bold text-gray-700">Grado/Sec</th>
                <th className="px-6 py-4 font-bold text-gray-700 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_STUDENTS.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{student.cedula}</td>
                  <td className="px-6 py-4 text-gray-600">{student.grade} "{student.section}"</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
