
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_STUDENTS, MOCK_PAYMENTS, BCV_RATE } from '../../constants';
import { DollarSign, Upload, AlertTriangle, CheckCircle, Clock, X, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RepresentativePayments = () => {
  const { user } = useAuth();
  
  // Filter students belonging to this parent
  const myStudents = MOCK_STUDENTS.filter(s => s.parentId === user?.id);
  
  const [selectedStudentId, setSelectedStudentId] = useState(myStudents.length > 0 ? myStudents[0].id : '');
  const [view, setView] = useState<'list' | 'report'>('list');
  
  // Update selected student if user changes or on initial load
  useEffect(() => {
    if (myStudents.length > 0 && !myStudents.find(s => s.id === selectedStudentId)) {
      setSelectedStudentId(myStudents[0].id);
    }
  }, [user, myStudents, selectedStudentId]);

  // Form State
  const [reportConcept, setReportConcept] = useState('');
  const [formData, setFormData] = useState({
    billingName: '', // Nombre o Razón Social
    reference: '',   // Referencia Bancaria
    rif: '',         // Número del RIF
    billingAddress: '', // Dirección Fiscal
    phone: '',       // Número Telefónico
    email: ''        // Correo Electrónico
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const payments = MOCK_PAYMENTS.filter(p => p.studentId === selectedStudentId);
  const pendingPayments = payments.filter(p => p.status !== 'verified');
  const historyPayments = payments.filter(p => p.status === 'verified');

  // Filter payments that can be reported (Unpaid or Rejected)
  // Excludes 'pending' (In Review) and 'verified'
  const reportablePayments = payments.filter(p => p.status === 'unpaid' || p.status === 'rejected');

  const selectedPaymentForReport = reportablePayments.find(p => p.id === reportConcept);

  // Helper to format currency
  const formatBs = (amount: number) => `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validation Logic
  const isFormValid = 
    reportConcept !== '' && 
    formData.billingName.trim() !== '' &&
    formData.reference.trim() !== '' && 
    formData.rif.trim() !== '' &&
    formData.billingAddress.trim() !== '' &&
    formData.email.trim() !== '' && 
    formData.phone.trim() !== '' && 
    selectedFile !== null;

  if (myStudents.length === 0) {
    return <div className="p-8 text-center text-gray-500">No tiene estudiantes asignados.</div>;
  }

  if (view === 'report') {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-primary p-6 text-white">
          <h2 className="text-2xl font-bold">Reportar un Pago</h2>
          <p className="text-blue-100 mt-1">Complete los datos para verificar su pago y generar la factura fiscal.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alumno</label>
              <select 
                value={selectedStudentId}
                disabled
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
              >
                {myStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concepto del Pago <span className="text-red-500">*</span></label>
              <select 
                value={reportConcept}
                onChange={(e) => setReportConcept(e.target.value)}
                className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-primary focus:border-primary text-gray-900"
              >
                <option value="">Seleccione un pago pendiente...</option>
                {reportablePayments.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.concept} (${p.amountUsd}) {p.status === 'rejected' ? '(Rechazado - Reintentar)' : ''}
                  </option>
                ))}
              </select>
              {reportablePayments.length === 0 && (
                <p className="text-xs text-green-600 mt-1">¡Estás al día! No tienes pagos pendientes por reportar.</p>
              )}
            </div>
          </div>

          {selectedPaymentForReport && (
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
               <div className="bg-white p-2 rounded-full shadow-sm">
                 <DollarSign className="text-primary" />
               </div>
               <div>
                 <p className="text-sm font-semibold text-gray-700">Monto a Pagar:</p>
                 <p className="text-xl font-bold text-primary">
                   ${selectedPaymentForReport.amountUsd.toFixed(2)} 
                   <span className="text-sm font-normal text-gray-600"> / {formatBs(selectedPaymentForReport.amountUsd * BCV_RATE)}</span>
                 </p>
                 <p className="text-xs text-gray-500 mt-1">Tasa BCV Actual: {BCV_RATE.toFixed(2)} Bs/$</p>
               </div>
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante de Pago <span className="text-red-500">*</span></label>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept="image/png, image/jpeg, application/pdf"
            />
            
            {!selectedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 bg-white rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary transition-colors mb-3" />
                <p className="text-gray-700 font-medium group-hover:text-primary">Haga clic para subir el comprobante</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG o PDF hasta 5MB</p>
              </div>
            ) : (
              <div className="border-2 border-solid border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileText className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={clearFile}
                  className="p-2 hover:bg-green-100 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Datos para Facturación Fiscal</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre o Razón Social <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="billingName"
                  value={formData.billingName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo o Razón Social" 
                  className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-primary focus:border-primary text-gray-900" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia Bancaria <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Ingrese todos los dígitos" 
                  className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-primary focus:border-primary text-gray-900" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número del RIF (V, J, E) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="rif"
                  value={formData.rif}
                  onChange={handleInputChange}
                  placeholder="Ej: V-12345678-9" 
                  className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-primary focus:border-primary text-gray-900" 
                />
                <p className="text-xs text-gray-500 mt-1">V: Natural, J: Jurídico, E: Extranjero</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  placeholder="Dirección fiscal asociada al RIF" 
                  className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-primary focus:border-primary text-gray-900" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Telefónico de Contacto <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="04XX-XXXXXXX" 
                  className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-primary focus:border-primary text-gray-900" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico de Contacto <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com" 
                  className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-primary focus:border-primary text-gray-900" 
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              onClick={() => {
                setView('list');
                setFormData({ billingName: '', reference: '', rif: '', billingAddress: '', email: '', phone: '' });
                setReportConcept('');
                setSelectedFile(null);
              }}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              disabled={!isFormValid}
              className={`flex-1 py-3 font-bold rounded-lg shadow-md transition-all ${
                isFormValid 
                  ? 'bg-primary text-white hover:bg-blue-800' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Reportar Pago
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h2>
          <p className="text-gray-500">Historial y reporte de pagos por alumno</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Seleccionar Estudiante:</label>
          <select 
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:ring-primary focus:border-primary flex-1"
          >
            {myStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Pending Payments */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-500" />
          Pagos Pendientes / En Revisión
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Concepto</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium text-right">Monto ($)</th>
                  <th className="px-6 py-3 font-medium text-right">Monto (Bs)</th>
                  <th className="px-6 py-3 font-medium text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingPayments.map(payment => (
                  <React.Fragment key={payment.id}>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900 align-top">{payment.concept}</td>
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'rejected' 
                            ? 'bg-red-100 text-red-800' 
                            : payment.status === 'unpaid'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status === 'rejected' ? 'Rechazado' : payment.status === 'unpaid' ? 'Pendiente' : 'En Revisión'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right align-top font-bold">${payment.amountUsd}</td>
                      <td className="px-6 py-4 text-right text-gray-600 align-top">
                        <div>{formatBs(payment.amountUsd * BCV_RATE)}</div>
                        <div className="text-xs text-gray-400">Tasa BCV Actual: {BCV_RATE.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 text-center align-top">
                        <button 
                          onClick={() => {
                            setReportConcept(payment.id); // Pre-select if re-reporting or reporting specific
                            setView('report');
                          }}
                          className={`text-xs font-bold uppercase px-3 py-2 rounded-lg ${
                            (payment.status === 'rejected' || payment.status === 'unpaid') 
                            ? 'bg-primary text-white hover:bg-blue-800' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={payment.status === 'pending' || payment.status === 'verified'}
                        >
                          {payment.status === 'rejected' ? 'Reportar Pago' : payment.status === 'unpaid' ? 'Reportar Pago' : 'En Proceso'}
                        </button>
                      </td>
                    </tr>
                    {/* Admin Note Row for Rejected Payments */}
                    {payment.status === 'rejected' && payment.adminNote && (
                      <tr className="bg-red-50">
                        <td colSpan={5} className="px-6 py-3 text-sm border-t border-red-100">
                          <p className="font-bold text-red-800 mb-1">Nota del Administrador:</p>
                          <p className="text-red-700">{payment.adminNote}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {pendingPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay pagos pendientes en este momento.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* History */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HistoryIcon />
          Historial de Pagos Realizados
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Concepto</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium text-right">Monto ($)</th>
                <th className="px-6 py-3 font-medium text-right">Monto (Bs)</th>
                <th className="px-6 py-3 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyPayments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{payment.concept}</td>
                  <td className="px-6 py-4 text-gray-500">{payment.date}</td>
                  <td className="px-6 py-4 text-right">${payment.amountUsd}</td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {/* Use historical rate if available, otherwise fallback */}
                    <div>{formatBs(payment.amountBs)}</div>
                    {payment.exchangeRate && (
                      <div className="text-xs text-gray-400">Tasa: {payment.exchangeRate.toFixed(2)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} /> Verificado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// Simple Icon component wrapper
const HistoryIcon = () => <Clock size={20} className="text-gray-500" />;
