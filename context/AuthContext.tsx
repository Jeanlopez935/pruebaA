
import React, { useState, createContext, useContext, useEffect } from 'react';
import { User, Role } from '../types';
import client from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);

  const mapRole = (backendRole: string): Role => {
    switch (backendRole) {
      case 'REPRESENTANTE': return 'representante';
      case 'DOCENTE': return 'docente';
      case 'ADMINISTRADOR': return 'admin';
      case 'OFICINISTA': return 'oficinista';
      default: return 'representante';
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.post('auth/login/', { username, password });
      const { token, user: userData } = response.data;

      // Map backend user to frontend user
      const mappedUser: User = {
        id: userData.id.toString(),
        name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
        role: mapRole(userData.role),
        username: userData.username
      };

      setUser(mappedUser);
      localStorage.setItem('ueagru_user', JSON.stringify(mappedUser));
      localStorage.setItem('ueagru_token', token);
    } catch (err: any) {
      console.error("Login error", err);
      const msg = err.response?.data?.error || "Credenciales inválidas";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await client.post('auth/logout/');
    } catch (e) {
      console.error("Logout error", e);
    }
    setUser(null);
    localStorage.removeItem('ueagru_user');
    localStorage.removeItem('ueagru_token');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await client.get('auth/me/');
        const userData = response.data;
        const mappedUser: User = {
          id: userData.id.toString(),
          name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
          role: mapRole(userData.role),
          username: userData.username
        };
        setUser(mappedUser);
      } catch (error) {
        // If session is invalid, clear user
        setUser(null);
        localStorage.removeItem('ueagru_user');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};
