import React from 'react';
import { MOCK_PAYMENTS } from '../../constants';
import { CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const pendingCount = MOCK_PAYMENTS.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pagos Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pagos Verificados (Mes)</p>
              <p className="text-3xl font-bold text-gray-900">124</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <h3 className="font-bold text-lg">Acceso Rápido</h3>
          <p className="text-blue-100 text-sm mb-4">Verificación de pagos pendientes</p>
          <Link to="/admin/verificacion" className="bg-white text-blue-600 py-2 rounded-lg font-bold text-center hover:bg-blue-50 transition-colors">
            Ir a Verificar
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reportes Recientes</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3">Alumno</th>
                <th className="px-6 py-3">Concepto</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_PAYMENTS.slice(0, 5).map((payment, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 font-medium text-gray-900">Estudiante ID {payment.studentId}</td>
                  <td className="px-6 py-4">{payment.concept}</td>
                  <td className="px-6 py-4 text-gray-500">{payment.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      payment.status === 'verified' ? 'bg-green-100 text-green-700' :
                      payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status === 'pending' ? 'Pendiente' : payment.status === 'verified' ? 'Verificado' : 'Rechazado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};