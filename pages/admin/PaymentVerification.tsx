import React, { useState } from 'react';
import { MOCK_PAYMENTS, BCV_RATE } from '../../constants';
import { Check, X, Download, MessageSquare } from 'lucide-react';

export const AdminPaymentVerification = () => {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    MOCK_PAYMENTS.find(p => p.status === 'pending')?.id || null
  );

  const pendingPayments = MOCK_PAYMENTS.filter(p => p.status === 'pending');
  const selectedPayment = MOCK_PAYMENTS.find(p => p.id === selectedPaymentId);

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6">
      {/* List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-bold text-gray-700">Pagos por Revisar ({pendingPayments.length})</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {pendingPayments.map(payment => (
            <div 
              key={payment.id}
              onClick={() => setSelectedPaymentId(payment.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${selectedPaymentId === payment.id ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex justify-between mb-1">
                <span className="font-bold text-gray-900">${payment.amountUsd}</span>
                <span className="text-xs text-gray-500">{payment.date}</span>
              </div>
              <p className="text-sm text-gray-600">{payment.concept}</p>
              <p className="text-xs text-gray-400 mt-1">Ref: {payment.reference || 'N/A'}</p>
            </div>
          ))}
          {pendingPayments.length === 0 && (
            <div className="p-8 text-center text-gray-500">No hay pagos pendientes.</div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
        {selectedPayment ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalles del Reporte</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Alumno</label>
                  <p className="text-lg font-medium">Sofía Rodríguez (5to A)</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Representante</label>
                  <p className="text-gray-800">Ana María Rojas</p>
                  <p className="text-sm text-gray-600">V-12.345.678</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Concepto</label>
                  <p className="text-gray-800">{selectedPayment.concept}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Monto ($)</label>
                    <p className="text-xl font-bold text-green-600">${selectedPayment.amountUsd}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Monto (Bs)</label>
                    <p className="text-xl font-bold text-gray-700">Bs. {selectedPayment.amountBs.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Comprobante</label>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                  {/* Placeholder image */}
                  <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400 mb-2">
                    Imagen del Recibo
                  </div>
                  <button className="w-full py-2 flex items-center justify-center gap-2 text-primary font-medium hover:bg-blue-50 rounded">
                    <Download size={16} /> Descargar Imagen
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nota para el Representante (Opcional)</label>
              <div className="flex gap-2 mb-6">
                <MessageSquare className="text-gray-400 mt-2" size={20} />
                <textarea 
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Escriba un motivo si va a rechazar..."
                  rows={2}
                ></textarea>
              </div>

              <div className="flex gap-4 justify-end">
                <button className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 flex items-center gap-2">
                  <X size={20} /> Rechazar
                </button>
                <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md">
                  <Check size={20} /> Aprobar Pago
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Seleccione un pago para ver detalles
          </div>
        )}
      </div>
    </div>
  );
};