import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Subject, ScheduleItem } from '../../types';
import { Plus, Save, Edit, Check, X, Trash2 } from 'lucide-react';

interface Schedule {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
}

export const ClerkSubjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('1er Año');
  const [newSection, setNewSection] = useState('A');

  // Schedule State
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newScheduleDay, setNewScheduleDay] = useState('Lunes');
  const [newScheduleStart, setNewScheduleStart] = useState('07:00');
  const [newScheduleEnd, setNewScheduleEnd] = useState('08:30');
  const [newScheduleRoom, setNewScheduleRoom] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      const subject = subjects.find(s => s.id.toString() === selectedSubjectId);
      if (subject) {
        setSchedules(subject.schedules || []);
      }
    } else {
      setSchedules([]);
    }
  }, [selectedSubjectId, subjects]);

  const fetchSubjects = async () => {
    try {
      const res = await client.get('subjects/');
      setSubjects(res.data);
      if (res.data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(res.data[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching subjects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newName) return;
    try {
      const res = await client.post('subjects/', {
        name: newName,
        grade_level: newGrade,
        section: newSection
      });
      alert("Asignatura creada exitosamente");
      setIsCreating(false);
      setNewName('');
      fetchSubjects();
      setSelectedSubjectId(res.data.id.toString());
    } catch (error) {
      console.error("Error creating subject", error);
      alert("Error al crear asignatura");
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedSubjectId) return;
    try {
      await client.post('schedules/', {
        subject: selectedSubjectId,
        day: newScheduleDay,
        start_time: newScheduleStart,
        end_time: newScheduleEnd,
        room: newScheduleRoom || 'Sin Aula'
      });
      fetchSubjects(); // Refresh to get updated nested schedules
    } catch (error) {
      console.error("Error adding schedule", error);
      alert("Error al agregar horario");
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("¿Eliminar este horario?")) return;
    try {
      await client.delete(`schedules/${scheduleId}/`);
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting schedule", error);
    }
  };

  const selectedSubject = subjects.find(s => s.id.toString() === selectedSubjectId);

  if (loading) return <div className="p-8 text-center">Cargando asignaturas...</div>;

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
            setNewName('');
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {isCreating ? 'Nueva Asignatura' : 'Seleccionar Asignatura'}
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

            <div className="space-y-6">
              {!isCreating ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary cursor-pointer"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade_level} "{s.section}")</option>
                    ))}
                  </select>
                  {selectedSubject && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-600"><span className="font-bold">Grado:</span> {selectedSubject.grade_level}</p>
                      <p className="text-sm text-gray-600"><span className="font-bold">Sección:</span> {selectedSubject.section}</p>
                      <p className="text-sm text-gray-600"><span className="font-bold">Docente:</span> {selectedSubject.teacher ? `ID: ${selectedSubject.teacher}` : 'Sin asignar'}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary"
                      placeholder="Ej: Matemáticas"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grado / Año</label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    >
                      <option>1er Año</option>
                      <option>2do Año</option>
                      <option>3er Año</option>
                      <option>4to Año</option>
                      <option>5to Año</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sección</label>
                    <div className="flex gap-2">
                      {['A', 'B', 'C', 'D'].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setNewSection(sec)}
                          className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${newSection === sec
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateSubject}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-800 shadow-sm"
                    >
                      <Save size={16} /> Crear
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Column */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Horario de Clases</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedSubject ? `${selectedSubject.name} - ${selectedSubject.grade_level} "${selectedSubject.section}"` : 'Seleccione una asignatura'}
                </p>
              </div>

              {selectedSubject && !isEditingSchedule && (
                <button
                  onClick={() => setIsEditingSchedule(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit size={16} /> Modificar Horario
                </button>
              )}
              {isEditingSchedule && (
                <button
                  onClick={() => setIsEditingSchedule(false)}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm"
                >
                  Finalizar Edición
                </button>
              )}
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">Día</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">Inicio</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">Fin</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">Aula</th>
                    {isEditingSchedule && <th className="px-6 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td className="px-6 py-4 font-medium text-gray-900">{schedule.day}</td>
                      <td className="px-6 py-4 text-gray-600">{schedule.start_time}</td>
                      <td className="px-6 py-4 text-gray-600">{schedule.end_time}</td>
                      <td className="px-6 py-4 text-gray-600">{schedule.room || '-'}</td>
                      {isEditingSchedule && (
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {schedules.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay horarios asignados.</td>
                    </tr>
                  )}

                  {isEditingSchedule && (
                    <tr className="bg-blue-50">
                      <td className="px-6 py-3">
                        <select
                          value={newScheduleDay}
                          onChange={e => setNewScheduleDay(e.target.value)}
                          className="w-full p-1 border border-blue-200 rounded text-sm"
                        >
                          <option>Lunes</option>
                          <option>Martes</option>
                          <option>Miércoles</option>
                          <option>Jueves</option>
                          <option>Viernes</option>
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="time"
                          value={newScheduleStart}
                          onChange={e => setNewScheduleStart(e.target.value)}
                          className="w-full p-1 border border-blue-200 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="time"
                          value={newScheduleEnd}
                          onChange={e => setNewScheduleEnd(e.target.value)}
                          className="w-full p-1 border border-blue-200 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={newScheduleRoom}
                          onChange={e => setNewScheduleRoom(e.target.value)}
                          placeholder="Aula"
                          className="w-full p-1 border border-blue-200 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={handleAddSchedule}
                          className="text-white bg-blue-600 hover:bg-blue-700 p-1.5 rounded shadow-sm"
                        >
                          <Plus size={16} />
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
