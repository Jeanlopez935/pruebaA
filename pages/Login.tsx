
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { BG_IMAGE_URL } from '../constants';
import { School, User, Lock, HelpCircle } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('representante');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    // Simple mock logic for demo purposes
    login(username, role);
    
    switch (role) {
      case 'representante': navigate('/rep/dashboard'); break;
      case 'docente': navigate('/docente/dashboard'); break;
      case 'admin': navigate('/admin/dashboard'); break;
      case 'oficinista': navigate('/oficinista/dashboard'); break;
    }
  };

  const handleForgotPassword = () => {
    alert("Debe informar al personal educativo para la recuperación de su contraseña");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 bg-white shadow-2xl z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
              <School size={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenido a la Plataforma Educativa</h1>
            <p className="text-gray-500 mt-2">U.E. Adventista "Gral. Rafael Urdaneta"</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol de Usuario</label>
              <div className="grid grid-cols-2 gap-2">
                {(['representante', 'docente', 'admin', 'oficinista'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 text-sm font-medium rounded-md capitalize transition-colors ${
                      role === r 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

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
          src={BG_IMAGE_URL} 
          alt="Institución" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply backdrop-blur-[2px]"></div>
        <div className="absolute bottom-10 left-10 text-white p-6 max-w-xl">
          <h2 className="text-4xl font-bold mb-4">Excelencia Educativa</h2>
          <p className="text-lg text-gray-100">Formando líderes con valores cristianos para el futuro.</p>
        </div>
      </div>
    </div>
  );
};
