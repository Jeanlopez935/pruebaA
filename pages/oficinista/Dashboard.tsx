import React, { useEffect, useState } from 'react';
import { UserPlus, UserCog, Book } from 'lucide-react';
import client from '../../api/client';

export const ClerkDashboard = () => {
  const [stats, setStats] = useState({
    representatives: 0,
    teachers: 0,
    subjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [repsRes, teachersRes, subjectsRes] = await Promise.all([
          client.get('users/?role=REPRESENTANTE'),
          client.get('teachers/'),
          client.get('subjects/')
        ]);

        setStats({
          representatives: repsRes.data.length,
          teachers: teachersRes.data.length,
          subjects: subjectsRes.data.length
        });
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-500">Gestión de datos maestros de la institución.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
            <UserCog size={24} />
          </div>
          <h3 className="font-bold text-lg mb-1">Representantes</h3>
          <p className="text-sm text-gray-500 mb-4">Gestionar datos y asignación de alumnos.</p>
          <span className="text-3xl font-bold text-gray-900">{stats.representatives}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center text-green-600 mb-4">
            <UserPlus size={24} />
          </div>
          <h3 className="font-bold text-lg mb-1">Docentes</h3>
          <p className="text-sm text-gray-500 mb-4">Registro y asignación de cargas.</p>
          <span className="text-3xl font-bold text-gray-900">{stats.teachers}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center text-purple-600 mb-4">
            <Book size={24} />
          </div>
          <h3 className="font-bold text-lg mb-1">Asignaturas</h3>
          <p className="text-sm text-gray-500 mb-4">Control de horarios y secciones.</p>
          <span className="text-3xl font-bold text-gray-900">{stats.subjects}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Tareas Pendientes</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            Actualizar datos de contacto de 3 representantes.
          </li>
          <li className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Asignar horario a nueva sección de 1er Año.
          </li>
        </ul>
      </div>
    </div>
  );
};
