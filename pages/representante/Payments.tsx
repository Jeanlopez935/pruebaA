import React, { useState, useRef, useEffect } from 'react';
import client from '../../api/client';
import { Student, Payment } from '../../types';
import { DollarSign, Upload, AlertTriangle, CheckCircle, Clock, X, FileText } from 'lucide-react';
import { isValidText } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';

interface PaymentConcept {
  id: number;
  name: string;
  amount_usd: string;
}

export const RepresentativePayments = () => {
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentConcepts, setPaymentConcepts] = useState<PaymentConcept[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [view, setView] = useState<'list' | 'report'>('list');
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedConceptId, setSelectedConceptId] = useState(''); // Can be "concept_ID" or "retry_ID"
  const [amountUsd, setAmountUsd] = useState<string>('0');
  const [formData, setFormData] = useState({
    billingName: '',
    reference: '',
    rif: '',
    billingAddress: '',
    phone: '',
    email: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Students
        const studentsRes = await client.get('students/');
        const fetchedStudents = studentsRes.data.map((s: any) => ({
          id: s.id.toString(),
          name: `${s.first_name} ${s.last_name}`,
          cedula: s.id_number,
          grade: s.current_grade,
          section: s.section,
          parentId: s.representative.toString()
        }));
        setStudents(fetchedStudents);
        if (fetchedStudents.length > 0 && !selectedStudentId) {
          setSelectedStudentId(fetchedStudents[0].id);
        }

        // Fetch Exchange Rate (Latest)
        // Fetch Exchange Rate (Latest from BCV)
        try {
          const rateRes = await client.get('rates/current/');
          if (rateRes.data.rate) {
            setExchangeRate(parseFloat(rateRes.data.rate));
          } else {
            setExchangeRate(36.5); // Fallback
          }
        } catch (e) {
          console.error("Error fetching rate", e);
          setExchangeRate(36.5);
        }

        // Fetch Payment Concepts
        const conceptsRes = await client.get('payment-concepts/');
        setPaymentConcepts(conceptsRes.data);

      } catch (error) {
        console.error("Error fetching initial data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchPayments = async () => {
      try {
        const res = await client.get(`payments/?student_id=${selectedStudentId}`);
        setPayments(res.data);
      } catch (error) {
        console.error("Error fetching payments", error);
      }
    };
    fetchPayments();
  }, [selectedStudentId]);

  const pendingPayments = payments.filter(p => p.status !== 'VERIFIED');
  const historyPayments = payments.filter(p => p.status === 'VERIFIED');
  const rejectedPayments = payments.filter(p => p.status === 'REJECTED');

  const formatBs = (amount: number) => `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (isValidText(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleConceptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedConceptId(value);

    if (value.startsWith('concept_')) {
      const conceptId = parseInt(value.split('_')[1]);
      const concept = paymentConcepts.find(c => c.id === conceptId);
      if (concept) {
        setAmountUsd(concept.amount_usd);
      }
    } else if (value.startsWith('retry_')) {
      const paymentId = parseInt(value.split('_')[1]);
      const payment = rejectedPayments.find(p => p.id === paymentId);
      if (payment) {
        setAmountUsd(payment.amount_usd.toString());
      }
    } else {
      setAmountUsd('0');
    }
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

  const handleSubmit = async () => {
    if (!selectedFile || !selectedStudentId || !selectedConceptId) return;

    const data = new FormData();
    data.append('student', selectedStudentId);
    data.append('amount_usd', amountUsd);
    data.append('amount_bs', (parseFloat(amountUsd) * exchangeRate).toFixed(2));
    data.append('rate_applied', exchangeRate.toString());

    // Determine concept logic
    let conceptText = '';
    if (selectedConceptId.startsWith('concept_')) {
      const conceptId = selectedConceptId.split('_')[1];
      data.append('payment_concept', conceptId);
      const concept = paymentConcepts.find(c => c.id === parseInt(conceptId));
      conceptText = concept ? concept.name : 'Pago';
    } else if (selectedConceptId.startsWith('retry_')) {
      const paymentId = selectedConceptId.split('_')[1];
      const payment = rejectedPayments.find(p => p.id === parseInt(paymentId));
      conceptText = payment ? `Reintento: ${payment.concept}` : 'Reintento Pago';
      // Ideally we might want to update the existing payment, but creating a new one is safer for history
    }
    data.append('concept', conceptText);

    data.append('reference_number', formData.reference);
    data.append('proof_image', selectedFile);
    data.append('billing_name', formData.billingName);
    data.append('billing_id', formData.rif);
    data.append('billing_address', formData.billingAddress);

    try {
      await client.post('payments/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Pago reportado exitosamente");
      setView('list');
      // Refresh payments
      const res = await client.get(`payments/?student_id=${selectedStudentId}`);
      setPayments(res.data);

      // Reset form
      setFormData({ billingName: '', reference: '', rif: '', billingAddress: '', phone: '', email: '' });
      setSelectedConceptId('');
      setAmountUsd('0');
      setSelectedFile(null);

    } catch (error) {
      console.error("Error reporting payment", error);
      alert("Error al reportar el pago");
    }
  };

  // Validation Logic
  const isFormValid =
    selectedConceptId !== '' &&
    parseFloat(amountUsd) > 0 &&
    formData.billingName.trim() !== '' &&
    formData.reference.trim() !== '' &&
    formData.rif.trim() !== '' &&
    formData.billingAddress.trim() !== '' &&
    selectedFile !== null;

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (students.length === 0) {
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
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concepto del Pago <span className="text-red-500">*</span></label>
              <select
                value={selectedConceptId}
                onChange={handleConceptChange}
                className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-primary focus:border-primary text-gray-900"
              >
                <option value="">Seleccione un concepto...</option>
                <optgroup label="Pagos Disponibles">
                  {paymentConcepts.map(concept => {
                    const isPendingOrVerified = payments.some(p =>
                      p.concept === concept.name && (p.status === 'PENDING' || p.status === 'VERIFIED')
                    );
                    if (isPendingOrVerified) return null;

                    return (
                      <option key={`concept_${concept.id}`} value={`concept_${concept.id}`}>
                        {concept.name} - ${concept.amount_usd}
                      </option>
                    );
                  })}
                </optgroup>
                {rejectedPayments.length > 0 && (
                  <optgroup label="Reintentar Pagos Rechazados">
                    {rejectedPayments.map(p => (
                      <option key={`retry_${p.id}`} value={`retry_${p.id}`}>
                        Reintentar: {p.concept} (${p.amount_usd})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <DollarSign className="text-primary" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Monto a Pagar</label>
              <div className="flex gap-4 items-baseline">
                <span className="text-2xl font-bold text-gray-900">${amountUsd}</span>
                <span className="text-gray-400">|</span>
                <span className="text-xl font-bold text-primary">
                  {formatBs(parseFloat(amountUsd || '0') * exchangeRate)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Tasa BCV Actual: {exchangeRate.toFixed(2)} Bs/$</p>
            </div>
          </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Número del RIF (V, J, E, G) <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select
                    value={formData.rif.split('-')[0] || 'V'}
                    onChange={(e) => {
                      const type = e.target.value;
                      const number = formData.rif.split('-')[1] || '';
                      setFormData(prev => ({ ...prev, rif: `${type}-${number}` }));
                    }}
                    className="p-3 border border-gray-300 bg-gray-50 rounded-lg focus:ring-primary focus:border-primary w-20"
                  >
                    <option value="V">V</option>
                    <option value="J">J</option>
                    <option value="E">E</option>
                    <option value="G">G</option>
                  </select>
                  <input
                    type="text"
                    value={formData.rif.split('-')[1] || ''}
                    onChange={(e) => {
                      const number = e.target.value.replace(/\D/g, ''); // Only numbers
                      const type = formData.rif.split('-')[0] || 'V';
                      setFormData(prev => ({ ...prev, rif: `${type}-${number}` }));
                    }}
                    placeholder="123456789"
                    className="flex-1 p-3 border border-gray-300 bg-white rounded-lg focus:ring-primary focus:border-primary text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Seleccione el tipo y escriba el número sin guiones.</p>
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
                setSelectedConceptId('');
                setAmountUsd('0');
                setSelectedFile(null);
              }}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`flex-1 py-3 font-bold rounded-lg shadow-md transition-all ${isFormValid
                ? 'bg-primary text-white hover:bg-blue-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Reportar Pago
            </button>
          </div>
        </div>
      </div >
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
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setView('report')}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-800 transition-colors"
        >
          + Reportar Nuevo Pago
        </button>
      </div>

      {/* Available Concepts */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-green-600" />
          Pagos Disponibles
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentConcepts.map(concept => {
            // Check if this concept is already pending or verified for the selected student
            const isPendingOrVerified = payments.some(p =>
              p.concept === concept.name && (p.status === 'PENDING' || p.status === 'VERIFIED')
            );

            if (isPendingOrVerified) return null;

            return (
              <div key={concept.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <p className="font-bold text-gray-900">{concept.name}</p>
                  <p className="text-green-600 font-bold">${concept.amount_usd}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedConceptId(`concept_${concept.id}`);
                    setAmountUsd(concept.amount_usd);
                    setView('report');
                  }}
                  className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-colors text-sm"
                >
                  Pagar
                </button>
              </div>
            );
          })}
          {paymentConcepts.filter(c => !payments.some(p => p.concept === c.name && (p.status === 'PENDING' || p.status === 'VERIFIED'))).length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
              No hay conceptos de pago disponibles.
            </div>
          )}
        </div>
      </section>

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
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {payment.status === 'REJECTED' ? 'Rechazado' : 'En Revisión'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right align-top font-bold">${payment.amount_usd}</td>
                      <td className="px-6 py-4 text-right text-gray-600 align-top">
                        <div>{formatBs(parseFloat(payment.amount_bs))}</div>
                        <div className="text-xs text-gray-400">Tasa: {parseFloat(payment.rate_applied).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 text-center align-top">
                        <button
                          className={`text-xs font-bold uppercase px-3 py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed`}
                          disabled
                        >
                          En Proceso
                        </button>
                      </td>
                    </tr>
                    {/* Admin Note Row for Rejected Payments */}
                    {payment.status === 'REJECTED' && payment.admin_note && (
                      <tr className="bg-red-50">
                        <td colSpan={5} className="px-6 py-3 text-sm border-t border-red-100">
                          <p className="font-bold text-red-800 mb-1">Nota del Administrador:</p>
                          <p className="text-red-700">{payment.admin_note}</p>
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
                  <td className="px-6 py-4 text-gray-500">{new Date(payment.date_reported).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">${payment.amount_usd}</td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    <div>{formatBs(parseFloat(payment.amount_bs))}</div>
                    <div className="text-xs text-gray-400">Tasa: {parseFloat(payment.rate_applied).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} /> Verificado
                    </span>
                  </td>
                </tr>
              ))}
              {historyPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay historial de pagos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// Simple Icon component wrapper
const HistoryIcon = () => <Clock size={20} className="text-gray-500" />;
