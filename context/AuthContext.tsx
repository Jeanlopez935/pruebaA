
import React, { useState, createContext, useContext, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children?: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (username: string, role: Role) => {
    // Simulating login with mock user data
    const mockUser: User = {
      id: 'u1',
      name: role === 'representante' ? 'Ana María Rojas' : 
            role === 'docente' ? 'Prof. Carlos Sánchez' : 
            role === 'admin' ? 'Administrador Principal' : 'Oficinista General',
      role: role,
      username: username
    };
    setUser(mockUser);
    localStorage.setItem('ueagru_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ueagru_user');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const stored = localStorage.getItem('ueagru_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse user from local storage", error);
          localStorage.removeItem('ueagru_user');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
