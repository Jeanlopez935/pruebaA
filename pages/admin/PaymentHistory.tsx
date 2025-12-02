import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Payment } from '../../types';
import { Search, Filter, X, Download, User, FileText, CreditCard, Calendar, Plus, Save } from 'lucide-react';

export const AdminPaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  // Concept Creation State
  const [isCreatingConcept, setIsCreatingConcept] = useState(false);
  const [newConceptName, setNewConceptName] = useState('');
  const [newConceptAmount, setNewConceptAmount] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, dateFilter]);

  const fetchPayments = async () => {
    try {
      const response = await client.get('payments/');
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let result = payments;

    // Search (Name, Cedula, Reference)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        (p.student_name?.toLowerCase().includes(term) || '') ||
        (p.student_lastname?.toLowerCase().includes(term) || '') ||
        (p.representative_name?.toLowerCase().includes(term) || '') ||
        (p.representative_cedula?.toLowerCase().includes(term) || '') ||
        (p.reference_number?.toLowerCase().includes(term) || '')
      );
    }

    // Status
    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter);
    } else {
      // If ALL, show only VERIFIED and REJECTED (exclude PENDING)
      result = result.filter(p => p.status === 'VERIFIED' || p.status === 'REJECTED');
    }

    // Date
    if (dateFilter) {
      result = result.filter(p => p.date_reported.startsWith(dateFilter));
    }

    setFilteredPayments(result);
  };

  const handleCreateConcept = async () => {
    if (!newConceptName || !newConceptAmount) {
      alert("Por favor complete todos los campos");
      return;
    }
    try {
      await client.post('payment-concepts/', {
        name: newConceptName,
        amount_usd: parseFloat(newConceptAmount)
      });
      alert("Concepto de pago creado exitosamente. Ahora estará disponible para los representantes.");
      setIsCreatingConcept(false);
      setNewConceptName('');
      setNewConceptAmount('');
    } catch (error) {
      console.error("Error creating concept", error);
      alert("Error al crear concepto de pago");
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando historial...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Historial General de Pagos</h1>
        <button
          onClick={() => setIsCreatingConcept(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={20} /> Crear Mensualidad
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por alumno, cédula o referencia..."
            className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="VERIFIED">Aprobados</option>
            <option value="REJECTED">Rechazados</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Fecha y Hora</th>
              <th className="px-6 py-3">Alumno</th>
              <th className="px-6 py-3">Concepto</th>
              <th className="px-6 py-3 text-right">Monto</th>
              <th className="px-6 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPayments.map(payment => (
              <tr
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 text-gray-500">{new Date(payment.date_reported).toLocaleString()}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {payment.student_name} {payment.student_lastname}
                  <span className="block text-xs text-gray-500">{payment.student_grade} "{payment.student_section}"</span>
                </td>
                <td className="px-6 py-4">{payment.concept}</td>
                <td className="px-6 py-4 text-right font-bold">${payment.amount_usd}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${payment.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                    payment.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                    {payment.status === 'VERIFIED' ? 'Aprobado' : payment.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No se encontraron pagos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Detail Modal */}
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
                        <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase ${selectedPayment.status === 'VERIFIED' ? 'bg-green-200 text-green-800' :
                          selectedPayment.status === 'REJECTED' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                          {selectedPayment.status === 'VERIFIED' ? 'Aprobado' : selectedPayment.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha Reporte:</span>
                        <span className="font-medium text-gray-900">{new Date(selectedPayment.date_reported).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Referencia:</span>
                        <span className="font-medium text-gray-900">{selectedPayment.reference_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monto USD:</span>
                        <span className="font-bold text-green-600 text-lg">${selectedPayment.amount_usd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monto Bs:</span>
                        <span className="font-bold text-gray-700">Bs. {parseFloat(selectedPayment.amount_bs).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tasa Aplicada:</span>
                        <span className="text-gray-700">{selectedPayment.rate_applied}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                      <User size={16} /> Datos del Alumno
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-lg text-gray-900">{selectedPayment.student_name} {selectedPayment.student_lastname}</p>
                      <p className="text-gray-500">{selectedPayment.student_grade} "{selectedPayment.student_section}"</p>
                      <p className="text-gray-500 text-xs">C.I. / Escolar: <span className="font-medium text-gray-700">{selectedPayment.student_cedula || 'N/A'}</span></p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                      <User size={16} /> Detalles del Representante
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-gray-900">{selectedPayment.representative_name} {selectedPayment.representative_lastname}</p>
                      <p className="text-gray-500 text-xs">C.I.: <span className="font-medium text-gray-700">{selectedPayment.representative_cedula}</span></p>
                      <p className="text-gray-500 text-xs">Teléfono: <span className="font-medium text-gray-700">{selectedPayment.representative_phone || 'N/A'}</span></p>
                      <p className="text-gray-500 text-xs">Email: <span className="font-medium text-gray-700">{selectedPayment.representative_email || 'N/A'}</span></p>
                      <p className="text-gray-500 text-xs">Dirección: <span className="font-medium text-gray-700">{selectedPayment.representative_address || 'N/A'}</span></p>
                    </div>
                  </div>

                  {selectedPayment.status === 'REJECTED' && selectedPayment.admin_note && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="text-sm font-bold text-red-800 uppercase mb-2">Motivo del Rechazo</h4>
                      <p className="text-red-700 text-sm">{selectedPayment.admin_note}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                      <FileText size={16} /> Datos de Facturación
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="block text-xs text-gray-500 uppercase">Razón Social</span>
                        <span className="font-medium text-gray-900">{selectedPayment.billing_name || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 uppercase">RIF / Cédula</span>
                        <span className="font-medium text-gray-900">{selectedPayment.billing_id || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 uppercase">Dirección</span>
                        <span className="font-medium text-gray-900">{selectedPayment.billing_address || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Comprobante de Pago</label>
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 flex flex-col items-center justify-center min-h-[150px]">
                      {selectedPayment.proof_image ? (
                        <img src={selectedPayment.proof_image} alt="Comprobante" className="max-h-64 object-contain" />
                      ) : (
                        <div className="text-center p-4">
                          <Download className="mx-auto mb-2 text-gray-300" size={32} />
                          <p className="text-sm text-gray-500">Vista previa no disponible</p>
                        </div>
                      )}

                      {selectedPayment.proof_image && (
                        <a
                          href={selectedPayment.proof_image}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            // Trigger download programmatically
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
                          className="w-full mt-2 py-2 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Download size={16} /> Descargar Imagen
                        </a>
                      )}
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

      {/* Create Concept Modal */}
      {isCreatingConcept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Crear Mensualidad / Concepto</h3>
              <button onClick={() => setIsCreatingConcept(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Concepto</label>
                <input
                  type="text"
                  value={newConceptName}
                  onChange={(e) => setNewConceptName(e.target.value)}
                  placeholder="Ej: Mensualidad Marzo 2024"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto en USD</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={newConceptAmount}
                    onChange={(e) => setNewConceptAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsCreatingConcept(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateConcept}
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-800 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
