
import React, { useState } from 'react';
import { MOCK_PAYMENTS, MOCK_STUDENTS, MOCK_REPRESENTATIVES } from '../../constants';
import { Search, Filter, X, Download, User, FileText, CreditCard } from 'lucide-react';

export const AdminPaymentHistory = () => {
  const [selectedPayment, setSelectedPayment] = useState<typeof MOCK_PAYMENTS[0] | null>(null);

  const getStudentInfo = (studentId: string) => {
    const student = MOCK_STUDENTS.find(s => s.id === studentId);
    return student ? `${student.name} (${student.grade} "${student.section}")` : 'Estudiante Desconocido';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Historial General de Pagos</h1>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por alumno, cédula o referencia..." 
            className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
          <Filter size={20} /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Alumno</th>
              <th className="px-6 py-3">Concepto</th>
              <th className="px-6 py-3 text-right">Monto</th>
              <th className="px-6 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_PAYMENTS.map(payment => (
              <tr 
                key={payment.id} 
                onClick={() => setSelectedPayment(payment)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 text-gray-500">{payment.date}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{getStudentInfo(payment.studentId)}</td>
                <td className="px-6 py-4">{payment.concept}</td>
                <td className="px-6 py-4 text-right font-bold">${payment.amountUsd}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    payment.status === 'verified' ? 'bg-green-100 text-green-700' :
                    payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {payment.status === 'verified' ? 'Aprobado' : payment.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Detalle Completo del Pago</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-800 uppercase mb-3 flex items-center gap-2">
                      <CreditCard size={16} /> Información del Pago
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Estado:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase ${
                          selectedPayment.status === 'verified' ? 'bg-green-200 text-green-800' :
                          selectedPayment.status === 'rejected' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {selectedPayment.status === 'verified' ? 'Aprobado' : selectedPayment.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha Reporte:</span>
                        <span className="font-medium text-gray-900">{selectedPayment.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Referencia:</span>
                        <span className="font-mono font-medium text-gray-900">{selectedPayment.reference || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monto USD:</span>
                        <span className="font-bold text-green-600 text-lg">${selectedPayment.amountUsd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monto Bs:</span>
                        <span className="font-bold text-gray-700">Bs. {selectedPayment.amountBs.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                      <User size={16} /> Datos del Alumno
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-lg text-gray-900">{getStudentInfo(selectedPayment.studentId)}</p>
                      <p className="text-gray-500">Cédula: {MOCK_STUDENTS.find(s => s.id === selectedPayment.studentId)?.cedula}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                      <FileText size={16} /> Datos de Facturación
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="block text-xs text-gray-500 uppercase">Razón Social</span>
                        <span className="font-medium text-gray-900">{selectedPayment.billingName || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 uppercase">RIF / Cédula</span>
                        <span className="font-medium text-gray-900">{selectedPayment.rif || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 uppercase">Dirección</span>
                        <span className="font-medium text-gray-900">{selectedPayment.billingAddress || 'No especificado'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 mt-2">
                        <div>
                          <span className="block text-xs text-gray-500 uppercase">Teléfono</span>
                          <span className="font-medium text-gray-900">{selectedPayment.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 uppercase">Email</span>
                          <span className="font-medium text-gray-900 truncate" title={selectedPayment.email}>{selectedPayment.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Comprobante de Pago</label>
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 flex flex-col items-center justify-center min-h-[150px]">
                      <div className="text-center p-4">
                        <Download className="mx-auto mb-2 text-gray-300" size={32} />
                        <p className="text-sm text-gray-500">Vista previa no disponible</p>
                      </div>
                      <button className="w-full py-2 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                        <Download size={16} /> Descargar Imagen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setSelectedPayment(null)} 
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
