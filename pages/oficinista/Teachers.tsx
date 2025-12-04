import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Plus, Edit, Save, X, BookOpen, Trash2, Eye, EyeOff, Check, Search } from 'lucide-react';
import { Subject } from '../../types';
import { CedulaInput } from '../../components/CedulaInput';
import { isValidName, isValidText } from '../../utils/validation';

export const ClerkTeachers = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New State for Creation Mode
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');

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

    if (name === 'first_name' || name === 'last_name') {
      if (isValidName(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'address' || name === 'specialty') {
      if (isValidText(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      // For other fields (email, phone, etc.), just basic text validation or specific regex if needed
      // For now, apply basic text validation to prevent spam
      if (isValidText(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleEditClick = (teacher: any) => {
    setFormData({
      first_name: teacher.user.first_name,
      last_name: teacher.user.last_name,
      username: teacher.user.username,
      email: teacher.user.email,
      phone_number: teacher.user.phone_number,
      address: teacher.user.address,
      password: teacher.user.visible_password || '', // Show visible password
      specialty: teacher.specialty
    });
    setSelectedTeacherId(teacher.id);
    setIsEditing(true);
    setIsCreating(true); // Reuse form
  };

  const handleSubjectAssignment = async (subjectId: string, assign: boolean) => {
    if (isEditing && selectedTeacherId) {
      // Edit Mode: Immediate Update
      try {
        await client.patch(`subjects/${subjectId}/`, {
          teacher: assign ? selectedTeacherId : null
        });
        fetchSubjects(); // Refresh to show update
      } catch (error) {
        console.error("Error updating subject assignment", error);
        alert("Error al asignar/desasignar materia");
      }
    } else {
      // Create Mode: Local State Update
      if (assign) {
        setSelectedSubjectIds(prev => [...prev, subjectId]);
      } else {
        setSelectedSubjectIds(prev => prev.filter(id => id !== subjectId));
      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.first_name || !formData.last_name || !formData.username ||
      !formData.email || !formData.phone_number || !formData.address || !formData.specialty) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (!isEditing && !formData.password) {
      alert("La contraseña es obligatoria para nuevos docentes");
      return;
    }

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
        let newTeacherId = '';

        // 2. Create Teacher Profile
        try {
          const teacherRes = await client.post('teachers/', {
            user_id: userId,
            specialty: formData.specialty
          });
          newTeacherId = teacherRes.data.id;
        } catch (error) {
          console.error("Error creating teacher profile, rolling back user...", error);
          await client.delete(`users/${userId}/`);
          throw error;
        }

        // 3. Assign Subjects (if any selected)
        if (selectedSubjectIds.length > 0 && newTeacherId) {
          await Promise.all(selectedSubjectIds.map(subjectId =>
            client.patch(`subjects/${subjectId}/`, { teacher: newTeacherId })
          ));
        }

        alert("Docente creado exitosamente");
      }

      setIsCreating(false);
      setIsEditing(false);
      setSelectedTeacherId(null);
      setSelectedSubjectIds([]);
      setSubjectSearchTerm('');
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
      fetchSubjects(); // Refresh subjects to show new assignments

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
                  <CedulaInput
                    value={formData.username}
                    onChange={(val) => setFormData(prev => ({ ...prev, username: val }))}
                    placeholder="12.345.678"
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

            {/* Subjects Assignment (Always visible now) */}
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BookOpen size={20} /> Asignaturas y Secciones
                  </h3>
                  <p className="text-sm text-gray-500">Seleccione las asignaturas que impartirá este docente.</p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar asignatura..."
                    value={subjectSearchTerm}
                    onChange={(e) => setSubjectSearchTerm(e.target.value)}
                    className="w-full pl-9 p-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {subjects
                  .filter(subject => {
                    // Filter 1: Must have schedule
                    if (!subject.schedules || subject.schedules.length === 0) return false;

                    // Filter 2: Search term
                    const term = subjectSearchTerm.toLowerCase();
                    const matchName = subject.name.toLowerCase().includes(term);
                    const matchGrade = subject.grade_level.toLowerCase().includes(term);
                    const matchSection = subject.section.toLowerCase().includes(term);

                    return matchName || matchGrade || matchSection;
                  })
                  .map(subject => {
                    // Determine assignment status
                    let isAssigned = false;
                    if (isEditing && selectedTeacherId) {
                      isAssigned = String(subject.teacher) === String(selectedTeacherId);
                    } else {
                      isAssigned = selectedSubjectIds.includes(subject.id);
                    }

                    // Check if assigned to ANOTHER teacher (and not this one)
                    const assignedToOther = subject.teacher && String(subject.teacher) !== String(selectedTeacherId);

                    return (
                      <div
                        key={subject.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${isAssigned
                          ? 'bg-blue-100 border-blue-300 shadow-sm'
                          : assignedToOther
                            ? 'bg-gray-100 border-gray-200 opacity-60'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        onClick={() => {
                          if (assignedToOther && !isAssigned) {
                            if (!confirm("Esta asignatura ya tiene un docente asignado. ¿Desea reasignarla?")) return;
                          }
                          handleSubjectAssignment(subject.id, !isAssigned);
                        }}
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
                              {subject.grade_level} "{subject.section}"
                            </p>
                            {assignedToOther && (
                              <p className="text-[10px] text-red-500 font-bold">Ocupado</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {subjects.filter(s => s.schedules && s.schedules.length > 0).length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No hay asignaturas con horario disponible. Cree asignaturas y horarios primero.
                  </div>
                )}
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
          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, cédula o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
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
              {teachers.filter(teacher => {
                const fullName = teacher.user ? `${teacher.user.first_name} ${teacher.user.last_name}` : '';
                const username = teacher.user ? teacher.user.username : '';
                const specialty = teacher.specialty || '';
                const term = searchTerm.toLowerCase();

                return fullName.toLowerCase().includes(term) ||
                  username.includes(term) ||
                  specialty.toLowerCase().includes(term);
              }).map(teacher => (
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
                      onClick={() => alert(`Contraseña de ${teacher.user.first_name}: ${teacher.user.visible_password || 'No visible'}`)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Ver Contraseña"
                    >
                      <Eye size={18} />
                    </button>
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
