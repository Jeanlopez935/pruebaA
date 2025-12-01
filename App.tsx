
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Role } from './types';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { RepresentativeDashboard } from './pages/representante/Dashboard';
import { RepresentativeGrades } from './pages/representante/Grades';
import { RepresentativeSchedule } from './pages/representante/Schedule';
import { RepresentativePayments } from './pages/representante/Payments';
import { TeacherDashboard } from './pages/docente/Dashboard';
import { TeacherGradesSummary } from './pages/docente/GradesSummary';
import { TeacherGradeManagement } from './pages/docente/GradeManagement';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminPaymentVerification } from './pages/admin/PaymentVerification';
import { AdminPaymentHistory } from './pages/admin/PaymentHistory';
import { ClerkDashboard } from './pages/oficinista/Dashboard';
import { ClerkRepresentatives } from './pages/oficinista/Representatives';
import { ClerkTeachers } from './pages/oficinista/Teachers';
import { ClerkSubjects } from './pages/oficinista/Subjects';
import { ClerkStudents } from './pages/oficinista/Students';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Protected Route Wrapper ---
interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
};

// --- Main App Component ---
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Representative Routes */}
          <Route path="/rep/*" element={
            <ProtectedRoute allowedRoles={['representante']}>
              <Layout role="representante">
                <Routes>
                  <Route path="dashboard" element={<RepresentativeDashboard />} />
                  <Route path="calificaciones" element={<RepresentativeGrades />} />
                  <Route path="horarios" element={<RepresentativeSchedule />} />
                  <Route path="pagos" element={<RepresentativePayments />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/docente/*" element={
            <ProtectedRoute allowedRoles={['docente']}>
              <Layout role="docente">
                <Routes>
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="resumen" element={<TeacherGradesSummary />} />
                  <Route path="gestion" element={<TeacherGradeManagement />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout role="admin">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="verificacion" element={<AdminPaymentVerification />} />
                  <Route path="historial" element={<AdminPaymentHistory />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Clerk Routes */}
          <Route path="/oficinista/*" element={
            <ProtectedRoute allowedRoles={['oficinista']}>
              <Layout role="oficinista">
                <Routes>
                  <Route path="dashboard" element={<ClerkDashboard />} />
                  <Route path="estudiantes" element={<ClerkStudents />} />
                  <Route path="representantes" element={<ClerkRepresentatives />} />
                  <Route path="docentes" element={<ClerkTeachers />} />
                  <Route path="asignaturas" element={<ClerkSubjects />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
