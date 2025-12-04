import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Plus, Edit, Save, X, Calendar, Book, Clock, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { CedulaInput } from '../../components/CedulaInput';
import { isValidName } from '../../utils/validation';

export const ClerkStudents = () => {
  const location = useLocation();
  const [students, setStudents] = useState<any[]>([]);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic'>('personal');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    id_number: '',
    birth_date: '',
    current_grade: '',
    section: '',
    representative: ''
  });

  useEffect(() => {
    fetchData();
    // Check for query params (redirect from Representatives)
    const params = new URLSearchParams(location.search);
    if (params.get('create') === 'true') {
      setIsCreating(true);
      setIsEditing(false);
      const repId = params.get('repId');
      if (repId) {
        setFormData(prev => ({ ...prev, representative: repId }));
      }
    }
  }, [location]);

  useEffect(() => {
    if (formData.current_grade && formData.section) {
      fetchSubjects(formData.current_grade, formData.section);
    } else {
      setSubjects([]);
    }
  }, [formData.current_grade, formData.section]);

  const fetchData = async () => {
    try {
      const [studentsRes, repsRes] = await Promise.all([
        client.get('students/'),
        client.get('users/?role=REPRESENTANTE')
      ]);
      setStudents(studentsRes.data);
      setRepresentatives(repsRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (grade: string, section: string) => {
    try {
      // Fetch all subjects and filter client side (or backend if supported)
      // Ideally backend: /api/subjects/?grade=X&section=Y
      const res = await client.get('subjects/');
      const filtered = res.data.filter((s: any) => s.grade_level === grade && s.section === section);
      setSubjects(filtered);
    } catch (error) {
      console.error("Error fetching subjects", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (student: any) => {
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      id_number: student.id_number,
      birth_date: student.birth_date,
      current_grade: student.current_grade,
      section: student.section,
      representative: student.representative.toString()
    });
    setSelectedStudentId(student.id);
    setIsEditing(true);
    setIsCreating(true);
    setActiveTab('personal');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.first_name || !formData.last_name || !formData.id_number ||
      !formData.birth_date || !formData.current_grade || !formData.section || !formData.representative) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      if (isEditing && selectedStudentId) {
        await client.patch(`students/${selectedStudentId}/`, formData);
        alert("Estudiante actualizado exitosamente");
      } else {
        await client.post('students/', formData);
        alert("Estudiante creado exitosamente");
      }

      setIsCreating(false);
      setIsEditing(false);
      setSelectedStudentId(null);
      setFormData({
        first_name: '', last_name: '', id_number: '', birth_date: '',
        current_grade: '', section: '', representative: ''
      });
      fetchData();
    } catch (error) {
      console.error("Error saving student", error);
      alert("Error al guardar estudiante");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Use shared validation utility
    if (isValidName(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h1>
        {!isCreating && (
          <button
            onClick={() => {
              setIsCreating(true);
              setIsEditing(false);
              setFormData({
                first_name: '', last_name: '', id_number: '', birth_date: '',
                current_grade: '', section: '', representative: ''
              });
            }}
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
              {isEditing ? 'Editar Estudiante' : 'Registrar Nuevo Estudiante'}
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

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            {activeTab === 'personal' ? (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleNameChange}
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Ana Lucía"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleNameChange}
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cédula de Identidad / Escolar</label>
                  <CedulaInput
                    value={formData.id_number}
                    onChange={(val) => setFormData(prev => ({ ...prev, id_number: val }))}
                    placeholder="12.345.678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                  <input
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año / Grado</label>
                  <select
                    name="current_grade"
                    value={formData.current_grade}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="1er Año">1er Año</option>
                    <option value="2do Año">2do Año</option>
                    <option value="3er Año">3er Año</option>
                    <option value="4to Año">4to Año</option>
                    <option value="5to Año">5to Año</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sección</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Representante</label>
                  <select
                    name="representative"
                    value={formData.representative}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                  >
                    <option value="">Seleccionar Representante...</option>
                    {representatives.map(rep => (
                      <option key={rep.id} value={rep.id}>
                        {rep.first_name} {rep.last_name} ({rep.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-3">
                  <Book className="text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Asignación Automática</p>
                    <p className="text-xs text-blue-700">
                      El estudiante será inscrito en las siguientes asignaturas correspondientes a
                      <span className="font-bold"> {formData.current_grade} Sección "{formData.section}"</span>.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Horario Académico Preliminar</h3>

                  {subjects.length > 0 ? (
                    <div className="space-y-4">
                      {subjects.map(subject => (
                        <div key={subject.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-primary">{subject.name}</h4>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              {subject.teacher ? 'Docente Asignado' : 'Sin Docente'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {subject.schedules && subject.schedules.length > 0 ? (
                              subject.schedules.map((sch: any) => (
                                <div key={sch.id} className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock size={14} />
                                  <span className="font-medium">{sch.day}:</span>
                                  <span>{sch.start_time} - {sch.end_time}</span>
                                  <span className="text-gray-400">({sch.room})</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 italic">Sin horario definido</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {formData.current_grade && formData.section
                        ? "No hay asignaturas registradas para este grado y sección."
                        : "Seleccione Grado y Sección en la pestaña anterior para ver las asignaturas."}
                    </div>
                  )}
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
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save size={20} /> {isEditing ? 'Actualizar Estudiante' : 'Guardar Estudiante'}
                </button>
              )}
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
                placeholder="Buscar por nombre, apellido o cédula..."
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
                <th className="px-6 py-4 font-bold text-gray-700">Grado/Sec</th>
                <th className="px-6 py-4 font-bold text-gray-700 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.filter(student =>
                student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.id_number.includes(searchTerm)
              ).map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{student.first_name} {student.last_name}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{student.id_number}</td>
                  <td className="px-6 py-4 text-gray-600">{student.current_grade} "{student.section}"</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(student)}
                      className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay estudiantes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
