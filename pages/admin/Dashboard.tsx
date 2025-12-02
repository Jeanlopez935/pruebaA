import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Payment } from '../../types';

export const AdminDashboard = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await client.get('payments/');
        setPayments(response.data);
      } catch (error) {
        console.error("Error fetching payments", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const verifiedCount = payments.filter(p => p.status === 'VERIFIED').length;

  if (isLoading) return <div>Cargando...</div>;

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
              <p className="text-gray-500 text-sm">Pagos Verificados</p>
              <p className="text-3xl font-bold text-gray-900">{verifiedCount}</p>
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
                <th className="px-6 py-3">ID Alumno</th>
                <th className="px-6 py-3">Concepto</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Monto ($)</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.slice(0, 5).map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{payment.student}</td>
                  <td className="px-6 py-4">{payment.concept}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(payment.date_reported).toLocaleDateString()}</td>
                  <td className="px-6 py-4">${payment.amount_usd}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${payment.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        payment.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      {payment.status === 'PENDING' ? 'Pendiente' : payment.status === 'VERIFIED' ? 'Verificado' : 'Rechazado'}
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