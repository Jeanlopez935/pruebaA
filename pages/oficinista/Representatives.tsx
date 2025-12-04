import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Search, Edit, UserMinus, Plus, Lock, X, Save, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CedulaInput } from '../../components/CedulaInput';
import { isValidName, isValidText } from '../../utils/validation';

export const ClerkRepresentatives = () => {
  const navigate = useNavigate();
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<number | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Assign Student State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Create Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '', // Cedula
    email: '',
    phone_number: '',
    address: '',
    password: ''
  });

  useEffect(() => {
    fetchRepresentatives();
  }, []);

  useEffect(() => {
    if (selectedRepId) {
      fetchAssignedStudents(selectedRepId);
    } else {
      setAssignedStudents([]);
    }
  }, [selectedRepId]);

  const fetchRepresentatives = async () => {
    try {
      const res = await client.get('users/?role=REPRESENTANTE');
      setRepresentatives(res.data);
    } catch (error) {
      console.error("Error fetching representatives", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedStudents = async (repId: number) => {
    try {
      const res = await client.get('students/');
      const students = res.data.filter((s: any) => s.representative === repId);
      setAssignedStudents(students);
    } catch (error) {
      console.error("Error fetching assigned students", error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await client.get('students/');
      setAllStudents(res.data);
    } catch (error) {
      console.error("Error fetching all students", error);
    }
  };

  useEffect(() => {
    if (showAssignModal) {
      fetchAllStudents();
    }
  }, [showAssignModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'first_name' || name === 'last_name') {
      if (isValidName(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'address') {
      if (isValidText(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      // For other fields (email, phone, etc.), just basic text validation
      if (isValidText(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleEditClick = () => {
    if (!selectedRepId) return;
    const rep = representatives.find(r => r.id === selectedRepId);
    if (!rep) return;

    setFormData({
      first_name: rep.first_name,
      last_name: rep.last_name,
      username: rep.username,
      email: rep.email,
      phone_number: rep.phone_number,
      address: rep.address,
      password: rep.visible_password || '' // Show visible password
    });
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.first_name || !formData.last_name || !formData.username ||
      !formData.email || !formData.phone_number || !formData.address) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (!isEditing && !formData.password) {
      alert("La contraseña es obligatoria para nuevos representantes");
      return;
    }

    try {
      if (isEditing && selectedRepId) {
        // Create a copy and remove password if empty to avoid validation error or overwriting with empty string
        const payload = { ...formData };
        if (!payload.password) {
          delete (payload as any).password;
        }
        await client.patch(`users/${selectedRepId}/`, payload);
        alert("Representante actualizado exitosamente");
      } else {
        await client.post('users/', {
          ...formData,
          role: 'REPRESENTANTE'
        });
        alert("Representante creado exitosamente");
      }

      setIsCreating(false);
      setIsEditing(false);
      setFormData({
        first_name: '', last_name: '', username: '', email: '',
        phone_number: '', address: '', password: ''
      });
      fetchRepresentatives();
    } catch (error) {
      console.error("Error saving representative", error);
      alert("Error al guardar representante. Verifique los datos.");
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedRepId || !newPassword) return;
    try {
      await client.patch(`users/${selectedRepId}/`, {
        password: newPassword
      });
      alert("Contraseña actualizada exitosamente");
      setShowPasswordModal(false);
      setNewPassword('');
      fetchRepresentatives();
    } catch (error) {
      console.error("Error updating password", error);
      alert("Error al actualizar contraseña");
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm("¿Está seguro de eliminar este estudiante? Esta acción no se puede deshacer.")) return;
    try {
      await client.delete(`students/${studentId}/`);
      if (selectedRepId) fetchAssignedStudents(selectedRepId);
    } catch (error) {
      console.error("Error deleting student", error);
      alert("Error al eliminar estudiante");
    }
  };

  const handleAssignStudent = async (studentId: number) => {
    if (!selectedRepId) return;
    try {
      await client.patch(`students/${studentId}/`, {
        representative: selectedRepId
      });
      alert("Estudiante asignado exitosamente");
      setShowAssignModal(false);
      fetchAssignedStudents(selectedRepId);
    } catch (error) {
      console.error("Error assigning student", error);
      alert("Error al asignar estudiante");
    }
  };

  const selectedRep = representatives.find(r => r.id === selectedRepId);

  const filteredStudents = allStudents.filter(s =>
    s.first_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.last_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.id_number.includes(studentSearch)
  );

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 relative">
      {/* List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-800">Representantes</h2>
            <button
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
                setFormData({
                  first_name: '', last_name: '', username: '', email: '',
                  phone_number: '', address: '', password: ''
                });
              }}
              className="p-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors"
              title="Agregar Nuevo"
            >
              <Plus size={18} />
            </button>
          </div>
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
          {representatives.map(rep => (
            <div
              key={rep.id}
              onClick={() => { setSelectedRepId(rep.id); setIsCreating(false); }}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedRepId === rep.id && !isCreating ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
            >
              <p className="font-bold text-gray-900">{rep.first_name} {rep.last_name}</p>
              <p className="text-xs text-gray-500">{rep.username}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail or Create Form */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto p-8">
        {isCreating ? (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Representante' : 'Registrar Nuevo Representante'}</h2>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                  <input name="first_name" value={formData.first_name} onChange={handleInputChange} type="text" className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                  <input name="last_name" value={formData.last_name} onChange={handleInputChange} type="text" className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cédula (Usuario)</label>
                  <CedulaInput
                    value={formData.username}
                    onChange={(val) => setFormData(prev => ({ ...prev, username: val }))}
                    placeholder="12.345.678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input name="phone_number" value={formData.phone_number} onChange={handleInputChange} type="text" className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" rows={2}></textarea>
                </div>
                <div className="col-span-2 bg-blue-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-blue-800 mb-2">{isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full p-3 border border-blue-200 rounded-lg"
                    placeholder={isEditing ? "Dejar en blanco para mantener" : "Ingrese contraseña"}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsCreating(false)} className="px-6 py-3 border border-gray-300 rounded-lg font-bold">Cancelar</button>
                <button onClick={handleSubmit} className="px-6 py-3 bg-primary text-white rounded-lg font-bold flex items-center gap-2">
                  <Save size={20} /> {isEditing ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        ) : selectedRep ? (
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRep.first_name} {selectedRep.last_name}</h2>
                <p className="text-gray-500">C.I: {selectedRep.username}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                >
                  <Edit size={16} /> Editar
                </button>
                <button
                  onClick={() => {
                    setNewPassword('');
                    setShowPasswordModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                >
                  <Lock size={16} /> Contraseña
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase">Teléfono</label>
                <p className="font-medium">{selectedRep.phone_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase">Email</label>
                <p className="font-medium">{selectedRep.email || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-bold uppercase">Dirección</label>
                <p className="font-medium">{selectedRep.address || 'N/A'}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Hijos Asignados</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/oficinista/estudiantes')}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <ExternalLink size={14} /> Gestionar
                  </button>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-800"
                  >
                    <Plus size={14} /> Asignar Estudiante
                  </button>
                </div>
              </div>

              <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Cédula</th>
                    <th className="px-4 py-2">Grado/Sec</th>
                    <th className="px-4 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignedStudents.map(student => (
                    <tr key={student.id}>
                      <td className="px-4 py-3">{student.first_name} {student.last_name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{student.id_number}</td>
                      <td className="px-4 py-3">{student.current_grade} "{student.section}"</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                          title="Eliminar Estudiante"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {assignedStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No hay estudiantes asignados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Seleccione un representante para gestionar o cree uno nuevo.
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Gestión de Contraseña</h3>

            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-800 font-bold mb-1">Contraseña Actual:</p>
              <p className="font-mono text-lg text-gray-900 select-all">
                {selectedRep?.visible_password || 'No visible (Encriptada)'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña (Opcional)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg pr-10"
                  placeholder="Nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg font-bold text-gray-700">Cancelar</button>
              <button onClick={handlePasswordReset} className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-800">Guardar</button>
            </div>
          </div>
        </div>
      )}
      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Asignar Estudiante</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar estudiante por nombre o cédula..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700">Nombre</th>
                    <th className="px-4 py-3 font-bold text-gray-700">Cédula</th>
                    <th className="px-4 py-3 font-bold text-gray-700">Representante Actual</th>
                    <th className="px-4 py-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map(student => {
                    const currentRep = representatives.find(r => r.id === student.representative);
                    const isAssignedToCurrent = student.representative === selectedRepId;

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{student.first_name} {student.last_name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{student.id_number}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {currentRep ? `${currentRep.first_name} ${currentRep.last_name}` : 'Sin Asignar'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isAssignedToCurrent ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                              Asignado
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`¿Está seguro de asignar a ${student.first_name} a este representante? Se eliminará del representante anterior.`)) {
                                  handleAssignStudent(student.id);
                                }
                              }}
                              className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-blue-800 transition-colors"
                            >
                              Asignar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No se encontraron estudiantes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
