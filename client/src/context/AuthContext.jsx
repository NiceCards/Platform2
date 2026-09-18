import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nicecards_token') || null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('nicecards_token')));
  const [profileLoading, setProfileLoading] = useState(false);

  // On mount, if a token exists try to restore the profile.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setProfileLoading(true);
    api
      .get('/profile')
      .then((res) => {
        if (!cancelled) setUser(res.data.user);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) {
          setProfileLoading(false);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('nicecards_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}!`);
    return res.data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const res = await api.post('/signup', payload);
    localStorage.setItem('nicecards_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    toast.success('Account created successfully. Welcome!');
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nicecards_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const res = await api.put('/profile', payload);
    setUser((prev) => ({ ...prev, ...res.data.user }));
    toast.success(res.data.message || 'Profile updated successfully');
    return res.data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, profileLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const authErrorMessage = getErrorMessage;
