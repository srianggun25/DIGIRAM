import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '../types';
import { mockUsers } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (userId: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        if (!response.ok) {
          throw new Error('Gagal memuat pengguna dari server');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.warn('Fallback to mock users due to API error:', error);
        setUsers(mockUsers);
      }
    };

    loadUsers();
  }, []);

  const login = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('User tidak ditemukan di server');
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      const fallback = mockUsers.find((u) => u.id === userId);
      if (fallback) {
        setUser(fallback);
        return;
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
