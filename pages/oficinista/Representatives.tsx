
import React, { useState } from 'react';
import { MOCK_REPRESENTATIVES, MOCK_STUDENTS } from '../../constants';
import { Search, Edit, UserMinus, Plus, Lock, X } from 'lucide-react';

export const ClerkRepresentatives = () => {
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const selectedRep = MOCK_REPRESENTATIVES.find(r => r.id === selectedRepId);
  const assignedStudents = selectedRep ? MOCK_STUDENTS.filter(s => s.parentId === selectedRep.id) : [];

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 relative">
      {/* List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800 mb-3">Lista de Representantes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-9 p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {MOCK_REPRESENTATIVES.map(rep => (
            <div 
              key={rep.id}
              onClick={() => setSelectedRepId(rep.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedRepId === rep.id ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
            >
              <p className="font-bold text-gray-900">{rep.name}</p>
              <p className="text-xs text-gray-500">{rep.cedula}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto p-8">
        {selectedRep ? (
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRep.name}</h2>
                <p className="text-gray-500">C.I: {selectedRep.cedula}</p>
              </div>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                <Lock size={16} /> Contraseña
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase">Teléfono</label>
                <p className="font-medium">{selectedRep.phone}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase">Email</label>
                <p className="font-medium">{selectedRep.email}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-bold uppercase">Dirección</label>
                <p className="font-medium">{selectedRep.address}</p>
              </div>
              <div className="col-span-2 pt-2">
                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                  <Edit size={14} /> Editar Información
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Hijos Asignados</h3>
                <button className="px-3 py-1.5 bg-green-600 text-white text-sm font-bold rounded-lg flex items-center gap-1 hover:bg-green-700 transition-colors">
                  <Plus size={16} /> Agregar Hijos
                </button>
              </div>
              
              <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Cédula</th>
                    <th className="px-4 py-2">Grado/Sec</th>
                    <th className="px-4 py-2">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignedStudents.map(student => (
                    <tr key={student.id}>
                      <td className="px-4 py-3">{student.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{student.cedula}</td>
                      <td className="px-4 py-3">{student.grade} "{student.section}"</td>
                      <td className="px-4 py-3">
                        <button className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="Quitar">
                          <UserMinus size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Seleccione un representante para gestionar
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Gestionar Contraseña</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
              Está cambiando la contraseña para el representante: <span className="font-bold text-gray-800 block mt-1">{selectedRep?.name}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Ingrese nueva contraseña"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Repita la contraseña"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setShowPasswordModal(false)} 
                className="px-4 py-2 border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setShowPasswordModal(false)} 
                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
              >
                Actualizar Contraseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
