import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Import dynamique pour éviter les problèmes de chargement
    const initAuth = async () => {
      try {
        const { authApi } = await import('../services/api');
        const token = localStorage.getItem('token');
        if (token) {
          authApi.getMe()
            .then(setUser)
            .catch(() => {
              localStorage.removeItem('token');
            })
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { authApi } = await import('../services/api');
    const userData = await authApi.login(email, password);
    setUser(userData);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const { authApi } = await import('../services/api');
    const userData = await authApi.register(data);
    setUser(userData);
  };

  const logout = async () => {
    const { authApi } = await import('../services/api');
    await authApi.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
