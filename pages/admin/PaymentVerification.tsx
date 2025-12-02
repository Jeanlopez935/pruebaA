import React, { useState, useEffect } from 'react';
import { Check, X, Download, MessageSquare } from 'lucide-react';
import client from '../../api/client';
import { Payment } from '../../types';

export const AdminPaymentVerification = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await client.get('payments/?status=PENDING');
      const pending = response.data.filter((p: Payment) => p.status === 'PENDING');
      setPayments(pending);
      if (pending.length > 0 && !selectedPaymentId) {
        setSelectedPaymentId(pending[0].id);
      }
    } catch (error) {
      console.error("Error fetching payments", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayment = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!selectedPaymentId) return;

    if (status === 'REJECTED' && !adminNote.trim()) {
      alert("Debe ingresar un motivo para rechazar el pago.");
      return;
    }

    try {
      await client.patch(`payments/${selectedPaymentId}/`, {
        status,
        admin_note: adminNote
      });

      // Remove from list
      setPayments(prev => prev.filter(p => p.id !== selectedPaymentId));
      setSelectedPaymentId(null);
      setAdminNote('');
      alert(`Pago ${status === 'VERIFIED' ? 'Aprobado' : 'Rechazado'} exitosamente`);
    } catch (error) {
      console.error("Error processing payment", error);
      alert("Error al procesar el pago");
    }
  };

  const selectedPayment = payments.find(p => p.id === selectedPaymentId);

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6">
      {/* List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-bold text-gray-700">Pagos por Revisar ({payments.length})</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {payments.map(payment => (
            <div
              key={payment.id}
              onClick={() => setSelectedPaymentId(payment.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${selectedPaymentId === payment.id ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex justify-between mb-1">
                <span className="font-bold text-gray-900">${payment.amount_usd}</span>
                <span className="text-xs text-gray-500">{new Date(payment.date_reported).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-600">{payment.concept}</p>
              <p className="text-xs text-gray-400 mt-1">Ref: {payment.reference_number || 'N/A'}</p>
            </div>
          ))}
          {payments.length === 0 && (
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
              <div className="space-y-6">
                {/* Student & Representative */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Datos Académicos</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-bold">Alumno:</span> {selectedPayment.student_name} {selectedPayment.student_lastname}</p>
                    <p className="text-sm text-gray-600">{selectedPayment.student_grade} "{selectedPayment.student_section}"</p>
                    <p className="text-sm text-gray-600">C.I. / Escolar: {selectedPayment.student_cedula || 'N/A'}</p>
                    <p className="text-sm"><span className="font-bold">Representante:</span> {selectedPayment.representative_name} {selectedPayment.representative_lastname}</p>
                    <p className="text-sm text-gray-600">C.I.: {selectedPayment.representative_cedula}</p>
                  </div>
                </div>

                {/* Payment Data */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-bold text-blue-800 uppercase mb-3">Datos del Pago</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700"><span className="font-bold text-gray-900">Concepto:</span> {selectedPayment.concept}</p>
                    <p className="text-sm text-gray-700"><span className="font-bold text-gray-900">Referencia:</span> {selectedPayment.reference_number}</p>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Monto ($)</p>
                        <p className="text-lg font-bold text-green-600">${selectedPayment.amount_usd}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Monto (Bs)</p>
                        <p className="text-lg font-bold text-gray-700">Bs. {selectedPayment.amount_bs}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tasa: {selectedPayment.rate_applied}</p>
                  </div>
                </div>

                {/* Billing Data */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Datos de Facturación y Contacto</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-bold">Razón Social:</span> {selectedPayment.billing_name || 'N/A'}</p>
                    <p><span className="font-bold">RIF/C.I.:</span> {selectedPayment.billing_id || 'N/A'}</p>
                    <p><span className="font-bold">Dirección:</span> {selectedPayment.billing_address || 'N/A'}</p>
                    <div className="border-t border-gray-200 my-2 pt-2"></div>
                    <p><span className="font-bold">Teléfono:</span> {selectedPayment.billing_phone || selectedPayment.representative_phone || 'N/A'}</p>
                    <p><span className="font-bold">Email:</span> {selectedPayment.billing_email || selectedPayment.representative_email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Comprobante de Pago</label>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 flex flex-col items-center justify-center min-h-[300px]">
                  {selectedPayment.proof_image ? (
                    <img src={selectedPayment.proof_image} alt="Comprobante" className="max-h-96 object-contain" />
                  ) : (
                    <div className="text-center p-8 text-gray-400">
                      <Download size={48} className="mx-auto mb-2 opacity-50" />
                      Sin Imagen
                    </div>
                  )}

                  {selectedPayment.proof_image && (
                    <a
                      href={selectedPayment.proof_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        fetch(selectedPayment.proof_image!)
                          .then(response => response.blob())
                          .then(blob => {
                            const blobUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.download = selectedPayment.proof_image!.split('/').pop() || 'comprobante';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(blobUrl);
                          })
                          .catch(console.error);
                      }}
                      className="w-full mt-4 py-3 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      <Download size={16} /> Descargar Imagen
                    </a>
                  )}
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
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                ></textarea>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => handleProcessPayment('REJECTED')}
                  className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 flex items-center gap-2"
                >
                  <X size={20} /> Rechazar
                </button>
                <button
                  onClick={() => handleProcessPayment('VERIFIED')}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md"
                >
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