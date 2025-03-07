
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Types for users
type Role = 'student' | 'guard' | 'admin';

interface User {
  id: number;
  name: string;
  email?: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Mock data
const MOCK_USERS = [
  { id: 1, name: "Иван Иванов", email: "ivan@example.com", role: "student" as Role },
  { id: 2, name: "Анна Смирнова", email: "anna@example.com", role: "student" as Role },
  { id: 201, name: "Сергей Петров", email: "sergey@example.com", role: "guard" as Role },
  { id: 301, name: "Елена Волкова", email: "elena@example.com", role: "admin" as Role }
];

// Password is 'password' for all users in this demo
const MOCK_PASSWORD = 'password';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = MOCK_USERS.find(user => user.email === email);
    
    if (foundUser && password === MOCK_PASSWORD) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      toast.success(`Добро пожаловать, ${foundUser.name}!`);
      setIsLoading(false);
      return true;
    } else {
      toast.error('Неверный email или пароль');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Вы вышли из системы');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
