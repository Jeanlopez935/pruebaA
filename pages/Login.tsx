
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { BG_IMAGE_URL } from '../constants';
import { School, User, Lock, HelpCircle, X } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, user, error } = useAuth();
  const navigate = useNavigate();

  // Redirect when user is authenticated
  React.useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'representante': navigate('/rep/dashboard'); break;
        case 'docente': navigate('/docente/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        case 'oficinista': navigate('/oficinista/dashboard'); break;
        default: navigate('/');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    await login(username, password);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 bg-white shadow-2xl z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center">
              <img src="/logoueagru.jpg.png" alt="Logo UEAGRU" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenido a la Plataforma Educativa</h1>
            <p className="text-gray-500 mt-2">U.E. Adventista "Gral. Rafael Urdaneta"</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario / Cédula</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-primary hover:text-blue-800 flex items-center gap-1"
              >
                <HelpCircle size={14} />
                ¿Olvidó su contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-[1.02]"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block w-1/2 lg:w-3/5 relative">
        <img
          src="/foto_ueagru.jpg.png"
          alt="Institución"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply backdrop-blur-[2px]"></div>
        <div className="absolute bottom-10 left-10 text-white p-6 max-w-xl">
          <h2 className="text-4xl font-bold mb-4">Excelencia Educativa</h2>
          <p className="text-lg text-gray-100">Formando líderes con valores cristianos para el futuro.</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="bg-primary p-6 text-white flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HelpCircle size={24} />
                </div>
                <h3 className="text-xl font-bold">Recuperación de Contraseña</h3>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6 text-center">
                <div className="w-20 h-20 mb-4 flex items-center justify-center mx-auto">
                  <img src="/logoueagru.jpg.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Por motivos de seguridad, la recuperación de contraseña debe realizarse presencialmente.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase">Instrucciones:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></span>
                    Diríjase a la <strong>Coordinación Administrativa</strong> de la institución.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></span>
                    Presente su <strong>Cédula de Identidad</strong> para validar su titularidad.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></span>
                    Solicite el restablecimiento de sus credenciales.
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowForgotPassword(false)}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-800 transition-all transform active:scale-95 shadow-lg shadow-blue-900/20"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
