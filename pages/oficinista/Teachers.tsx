
import React, { useState } from 'react';
import { MOCK_TEACHERS } from '../../constants';
import { Plus, Edit, Save, X, BookOpen, Trash2 } from 'lucide-react';

export const ClerkTeachers = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [assignments, setAssignments] = useState([
    { id: 1, subject: 'Matemáticas', grade: '5to Grado', sections: { A: true, B: true, C: false, D: false } }
  ]);

  const addAssignment = () => {
    setAssignments([...assignments, { id: Date.now(), subject: '', grade: '', sections: { A: false, B: false, C: false, D: false } }]);
  };

  const removeAssignment = (id: number) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Docentes</h1>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors"
          >
            <Plus size={20} /> Agregar Nuevo Docente
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Docente</h2>
            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <form className="space-y-8">
            {/* Personal Data */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Ej: Carlos" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Ej: Sánchez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cédula de Identidad</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="V-XX.XXX.XXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="04XX-XXXXXXX" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                  <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="correo@ejemplo.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Habitación</label>
                  <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" rows={2}></textarea>
                </div>
              </div>
            </section>

            {/* Academic Assignments */}
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen className="text-primary" size={20} />
                  Asignaturas y Secciones
                </h3>
                <button type="button" onClick={addAssignment} className="text-sm font-bold text-primary hover:underline">
                  + Agregar Asignación
                </button>
              </div>
              
              <div className="space-y-4">
                {assignments.map((assign, index) => (
                  <div key={assign.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
                    <button 
                      type="button" 
                      onClick={() => removeAssignment(assign.id)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asignatura</label>
                        <select className="w-full p-2 border border-gray-300 rounded bg-white text-sm">
                          <option>Seleccionar...</option>
                          <option>Matemáticas</option>
                          <option>Historia</option>
                          <option>Biología</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grado/Año</label>
                        <select className="w-full p-2 border border-gray-300 rounded bg-white text-sm">
                          <option>Seleccionar...</option>
                          <option>1er Año</option>
                          <option>2do Año</option>
                          <option>3er Año</option>
                          <option>4to Año</option>
                          <option>5to Año</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Secciones</label>
                      <div className="flex gap-4">
                        {['A', 'B', 'C', 'D'].map(sec => (
                          <label key={sec} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <span className="text-sm font-medium text-gray-700">{sec}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Access Credentials */}
            <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Credenciales de Acceso</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">Usuario (Cédula)</label>
                  <input type="text" className="w-full p-3 border border-blue-200 rounded-lg bg-white" disabled value="V-XX.XXX.XXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">Contraseña Temporal</label>
                  <input type="text" className="w-full p-3 border border-blue-200 rounded-lg bg-white font-mono" value="Docente2025*" />
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-800 flex items-center gap-2 shadow-md transition-colors"
              >
                <Save size={20} /> Guardar Cambios
              </button>
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
                <th className="px-6 py-4 font-bold text-gray-700 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_TEACHERS.map(teacher => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{teacher.cedula}</td>
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
