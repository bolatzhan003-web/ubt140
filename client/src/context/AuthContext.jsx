import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('lms_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (loginIdentifier, password) => {
    const res = await api.post('/auth/login', { login: loginIdentifier, password });
    localStorage.setItem('lms_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, phone, password, email = null) => {
    const res = await api.post('/auth/register', { name, phone, password, email });
    localStorage.setItem('lms_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isInstructor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
