import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Plus, Edit, Save, X, BookOpen, Trash2, Eye, EyeOff } from 'lucide-react';
import { Subject } from '../../types';

export const ClerkTeachers = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '', // Cedula
    email: '',
    phone_number: '',
    address: '',
    password: '',
    specialty: ''
  });

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await client.get('teachers/');
      setTeachers(res.data);
    } catch (error) {
      console.error("Error fetching teachers", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await client.get('subjects/');
      setSubjects(res.data);
    } catch (error) {
      console.error("Error fetching subjects", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (teacher: any) => {
    setFormData({
      first_name: teacher.user.first_name,
      last_name: teacher.user.last_name,
      username: teacher.user.username,
      email: teacher.user.email,
      phone_number: teacher.user.phone_number,
      address: teacher.user.address,
      password: '', // Don't show hash
      specialty: teacher.specialty
    });
    setSelectedTeacherId(teacher.id);
    setIsEditing(true);
    setIsCreating(true); // Reuse form
  };

  const handleSubjectAssignment = async (subjectId: string, assign: boolean) => {
    if (!selectedTeacherId) return;
    try {
      await client.patch(`subjects/${subjectId}/`, {
        teacher: assign ? selectedTeacherId : null
      });
      fetchSubjects(); // Refresh to show update
    } catch (error) {
      console.error("Error updating subject assignment", error);
      alert("Error al asignar/desasignar materia");
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedTeacherId) {
        // Update Teacher
        // 1. Update User
        const teacher = teachers.find(t => t.id === selectedTeacherId);
        if (teacher && teacher.user) {
          const userUpdateData: any = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone_number,
            address: formData.address,
          };
          if (formData.password) {
            userUpdateData.password = formData.password;
          }
          await client.patch(`users/${teacher.user.id}/`, userUpdateData);
        }

        // 2. Update Teacher Profile
        await client.patch(`teachers/${selectedTeacherId}/`, {
          specialty: formData.specialty
        });

        alert("Docente actualizado exitosamente");
      } else {
        // Create Teacher
        // 1. Create User
        const userRes = await client.post('users/', {
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          address: formData.address,
          role: 'DOCENTE'
        });

        const userId = userRes.data.id;

        // 2. Create Teacher Profile
        try {
          await client.post('teachers/', {
            user_id: userId,
            specialty: formData.specialty
          });
        } catch (error) {
          console.error("Error creating teacher profile, rolling back user...", error);
          await client.delete(`users/${userId}/`);
          throw error;
        }
        alert("Docente creado exitosamente");
      }

      setIsCreating(false);
      setIsEditing(false);
      setSelectedTeacherId(null);
      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        phone_number: '',
        address: '',
        password: '',
        specialty: ''
      });
      fetchTeachers();

    } catch (error: any) {
      console.error("Error saving teacher", error);
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data)
        : "Error desconocido";
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Docentes</h1>
        {!isCreating && (
          <button
            onClick={() => {
              setIsCreating(true);
              setIsEditing(false);
              setFormData({
                first_name: '', last_name: '', username: '', email: '',
                phone_number: '', address: '', password: '', specialty: ''
              });
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors"
          >
            <Plus size={20} /> Agregar Nuevo Docente
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Docente' : 'Registrar Nuevo Docente'}</h2>
            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            {/* Personal Data */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Carlos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Sánchez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cédula de Identidad (Usuario)</label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="V-XX.XXX.XXX"
                    disabled={isEditing} // Cannot change username/cedula easily
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="04XX-XXXXXXX"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Habitación</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    rows={2}
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                  <input
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Matemáticas, Historia"
                  />
                </div>
              </div>
            </section>

            {/* Access Credentials */}
            <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Credenciales de Acceso</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">Usuario (Cédula)</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-blue-200 rounded-lg bg-white"
                    disabled
                    value={formData.username || 'Se usará la Cédula'}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                  </label>
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 border border-blue-200 rounded-lg bg-white font-mono pr-10"
                    placeholder={isEditing ? "Dejar en blanco para mantener actual" : "Ingrese contraseña"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </section>

            {/* Subjects Assignment (Only in Edit Mode) */}
            {isEditing && (
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen size={20} /> Asignaturas y Secciones
                </h3>
                <p className="text-sm text-gray-500 mb-4">Seleccione las asignaturas que impartirá este docente.</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjects.map(subject => {
                    const isAssigned = subject.teacherId === selectedTeacherId;
                    return (
                      <div
                        key={subject.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${isAssigned
                            ? 'bg-blue-100 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        onClick={() => handleSubjectAssignment(subject.id, !isAssigned)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${isAssigned ? 'bg-primary border-primary' : 'border-gray-300 bg-white'
                            }`}>
                            {isAssigned && <Check size={14} className="text-white" />}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isAssigned ? 'text-blue-900' : 'text-gray-700'}`}>
                              {subject.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {subject.grade} "{subject.section}"
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

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
                onClick={handleSubmit}
                className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-800 flex items-center gap-2 shadow-md transition-colors"
              >
                <Save size={20} /> {isEditing ? 'Actualizar Docente' : 'Guardar Docente'}
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
                <th className="px-6 py-4 font-bold text-gray-700">Especialidad</th>
                <th className="px-6 py-4 font-bold text-gray-700 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {teacher.user ? `${teacher.user.first_name} ${teacher.user.last_name}` : 'Sin Usuario'}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-500">
                    {teacher.user ? teacher.user.username : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{teacher.specialty}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(teacher)}
                      className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay docentes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
