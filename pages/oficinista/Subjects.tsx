
import React, { useState } from 'react';
import { Plus, Save, Edit, Check, X } from 'lucide-react';

export const ClerkSubjects = () => {
  const [selectedSection, setSelectedSection] = useState('D');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Asignaturas y Horarios</h1>
          <p className="text-gray-500">Crea, visualiza y modifica las asignaturas y sus horarios.</p>
        </div>
        <button 
          onClick={() => {
            setIsCreating(true);
            setIsEditingSchedule(false);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={20} /> Agregar Nueva Asignatura
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Edit Subject Column */}
        <div className="md:col-span-1">
          <div className={`bg-white p-6 rounded-xl shadow-sm border ${isCreating ? 'border-primary ring-1 ring-primary' : 'border-gray-200'} transition-all`}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-bold text-gray-900">
                {isCreating ? 'Nueva Asignatura' : 'Editar Asignatura'}
              </h3>
              {isCreating && (
                <button 
                  onClick={() => setIsCreating(false)} 
                  className="text-gray-400 hover:text-gray-600"
                  title="Cancelar creación"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {isCreating ? 'Ingrese los datos para la nueva materia.' : 'Modifica los detalles de la asignatura seleccionada.'}
            </p>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="subject-select">
                  {isCreating ? 'Nombre de la Asignatura' : 'Seleccionar Asignatura'}
                </label>
                {isCreating ? (
                  <input 
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary placeholder-gray-400"
                    placeholder="Ej: Geografía"
                    autoFocus
                  />
                ) : (
                  <select 
                    id="subject-select" 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary cursor-pointer"
                    defaultValue="matematicas-1"
                  >
                    <option value="matematicas-1">Matemáticas I</option>
                    <option value="historia">Historia</option>
                    <option value="lenguaje">Lenguaje</option>
                    <option value="biologia">Biología</option>
                  </select>
                )}
                
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Año/Grado:</span> 
                  {isCreating ? (
                    <select className="ml-2 p-1 border border-gray-300 rounded bg-white text-sm">
                      <option>1er Año</option>
                      <option>2do Año</option>
                      <option>3er Año</option>
                      <option>4to Año</option>
                      <option>5to Año</option>
                    </select>
                  ) : (
                    <span className="ml-1">1er Año</span>
                  )}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sección</label>
                <div className="flex gap-3">
                  {['A', 'B', 'C', 'D'].map((sec) => (
                    <button 
                      key={sec}
                      type="button" 
                      onClick={() => setSelectedSection(sec)}
                      className={`w-12 h-12 rounded-lg font-bold border transition-colors ${
                        selectedSection === sec 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm"
                >
                  <Save size={16} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Schedule Column */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Horario de Clases</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isCreating ? 'Definir horario para la nueva asignatura' : `Matemáticas I - 1er Año, Sección ${selectedSection}`}
                </p>
              </div>
              
              {!isEditingSchedule ? (
                <button 
                  onClick={() => setIsEditingSchedule(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit size={16} /> Modificar Horario
                </button>
              ) : (
                <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <button 
                    onClick={() => setIsEditingSchedule(false)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => setIsEditingSchedule(false)}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm"
                  >
                    Guardar Cambios
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">Día</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">Hora de Inicio</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">Hora de Fin</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">Aula</th>
                    {isEditingSchedule && <th className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {['Lunes', 'Miércoles', 'Viernes'].map((day, index) => (
                    <tr key={day}>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {isEditingSchedule ? (
                          <select className="p-1 border border-gray-300 rounded text-sm w-full bg-white" defaultValue={day}>
                            <option>Lunes</option>
                            <option>Martes</option>
                            <option>Miércoles</option>
                            <option>Jueves</option>
                            <option>Viernes</option>
                          </select>
                        ) : (
                          day
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {isEditingSchedule ? (
                          <input type="time" className="p-1 border border-gray-300 rounded text-sm bg-white" defaultValue={index === 1 ? "10:00" : "08:00"} />
                        ) : (
                          index === 1 ? "10:00 AM" : "08:00 AM"
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {isEditingSchedule ? (
                          <input type="time" className="p-1 border border-gray-300 rounded text-sm bg-white" defaultValue={index === 1 ? "11:30" : "09:30"} />
                        ) : (
                          index === 1 ? "11:30 AM" : "09:30 AM"
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {isEditingSchedule ? (
                          <input type="text" className="p-1 border border-gray-300 rounded text-sm w-20 bg-white" defaultValue={index === 2 ? "B-203" : "A-101"} />
                        ) : (
                          index === 2 ? "B-203" : "A-101"
                        )}
                      </td>
                      {isEditingSchedule && (
                        <td className="px-6 py-4 text-center">
                          <button className="text-red-500 hover:text-red-700">
                            <X size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {isEditingSchedule && (
                    <tr>
                      <td colSpan={5} className="px-6 py-3 text-center border-t border-dashed border-gray-200">
                        <button className="text-primary text-sm font-bold flex items-center justify-center gap-1 hover:underline mx-auto">
                          <Plus size={16} /> Agregar Bloque
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
