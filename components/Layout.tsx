
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  CalendarDays, 
  CreditCard, 
  LogOut, 
  BookOpen, 
  Users, 
  FileText, 
  CheckSquare, 
  History, 
  UserCog,
  School
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
}

export const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  const renderNavItems = () => {
    switch (role) {
      case 'representante':
        return (
          <>
            <NavItem to="/rep/dashboard" icon={<LayoutDashboard size={20} />} label="Inicio" active={isActive('dashboard')} />
            <NavItem to="/rep/calificaciones" icon={<GraduationCap size={20} />} label="Calificaciones" active={isActive('calificaciones')} />
            <NavItem to="/rep/horarios" icon={<CalendarDays size={20} />} label="Horarios" active={isActive('horarios')} />
            <NavItem to="/rep/pagos" icon={<CreditCard size={20} />} label="Pagos" active={isActive('pagos')} />
          </>
        );
      case 'docente':
        return (
          <>
            <NavItem to="/docente/dashboard" icon={<LayoutDashboard size={20} />} label="Inicio" active={isActive('dashboard')} />
            <NavItem to="/docente/resumen" icon={<FileText size={20} />} label="Calificaciones" active={isActive('resumen')} />
          </>
        );
      case 'admin':
        return (
          <>
            <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Inicio" active={isActive('dashboard')} />
            <NavItem to="/admin/verificacion" icon={<CheckSquare size={20} />} label="Verificar Pagos" active={isActive('verificacion')} />
            <NavItem to="/admin/historial" icon={<History size={20} />} label="Historial Pagos" active={isActive('historial')} />
          </>
        );
      case 'oficinista':
        return (
          <>
            <NavItem to="/oficinista/dashboard" icon={<LayoutDashboard size={20} />} label="Inicio" active={isActive('dashboard')} />
            <NavItem to="/oficinista/estudiantes" icon={<GraduationCap size={20} />} label="Estudiantes" active={isActive('estudiantes')} />
            <NavItem to="/oficinista/representantes" icon={<UserCog size={20} />} label="Representantes" active={isActive('representantes')} />
            <NavItem to="/oficinista/docentes" icon={<Users size={20} />} label="Docentes" active={isActive('docentes')} />
            <NavItem to="/oficinista/asignaturas" icon={<BookOpen size={20} />} label="Asignaturas" active={isActive('asignaturas')} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 fixed h-full z-10 left-0 top-0">
        <div className="p-6 flex flex-col items-center border-b border-gray-100">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white mb-3">
             {/* Using Lucide icon as placeholder for logo */}
             <School size={32} />
          </div>
          <h2 className="font-bold text-center text-primary leading-tight">U.E.A. Gral. Rafael Urdaneta</h2>
        </div>

        <div className="p-4">
          <div className="mb-6 px-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Menú</p>
          </div>
          <nav className="space-y-1">
            {renderNavItems()}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-gray-100">
          {user && (
            <div className="flex items-center gap-3 mb-4 px-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-primary text-white shadow-md' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    {icon}
    {label}
  </Link>
);
