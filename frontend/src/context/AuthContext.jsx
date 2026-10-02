import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('tryiton_auth_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tryiton_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [savedLooks, setSavedLooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Fetch full profile and saved looks
  const refreshProfile = useCallback(async (authToken = token) => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data.user);
        setSavedLooks(json.data.savedLooks || []);
        localStorage.setItem('tryiton_user', JSON.stringify(json.data.user));
      } else if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshProfile(token);
    }
  }, [token, refreshProfile]);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setToken(data.token);
      setUser(data.data.user);
      localStorage.setItem('tryiton_auth_token', data.token);
      localStorage.setItem('tryiton_user', JSON.stringify(data.data.user));
      await refreshProfile(data.token);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setToken(data.token);
      setUser(data.data.user);
      localStorage.setItem('tryiton_auth_token', data.token);
      localStorage.setItem('tryiton_user', JSON.stringify(data.data.user));
      await refreshProfile(data.token);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSavedLooks([]);
    localStorage.removeItem('tryiton_auth_token');
    localStorage.removeItem('tryiton_user');
  };

  // Save Look to Database
  const saveLook = async ({ costumeId, lookName, colorway, customParameters }) => {
    if (!token) throw new Error('Please sign in to save outfits to your wardrobe.');
    const res = await fetch(`${API_BASE_URL}/user/looks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ costumeId, lookName, colorway, customParameters })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save look');

    setSavedLooks(prev => [data.data, ...prev]);
    return data.data;
  };

  // Sync Measurements
  const syncMeasurements = async (measurements) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/user/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(measurements)
      });
    } catch (err) {
      console.error('Failed to sync measurements:', err);
    }
  };

  // Sync Avatar
  const syncAvatar = async (avatarData) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/user/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(avatarData)
      });
    } catch (err) {
      console.error('Failed to sync avatar:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user && token),
      savedLooks,
      loading,
      authError,
      login,
      register,
      logout,
      saveLook,
      syncMeasurements,
      syncAvatar,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
