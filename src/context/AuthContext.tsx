
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { LoginResponseDto, ValidateStudentIdResponseDto } from '@/types/api';

// Types for users
export type Role = 'student' | 'guard' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  student_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  isLoading: boolean;
  registerStudent: (
    studentId: string, 
    name: string, 
    email: string, 
    password: string, 
    phone?: string
  ) => Promise<{success: boolean, error?: string}>;
  validateStudentId: (studentId: string) => Promise<{
    success: boolean, 
    data?: ValidateStudentIdResponseDto, 
    error?: string
  }>;
}

// Mock data - simple test users
const MOCK_USERS = [
  { id: 1, name: "Иван Иванов", email: "ivan@example.com", role: "student" as Role, student_id: "U12345" },
  { id: 2, name: "Сергей Петров", email: "sergey@example.com", role: "guard" as Role },
  { id: 3, name: "Елена Волкова", email: "elena@example.com", role: "admin" as Role }
];

// Valid student IDs in the system (for mock)
const VALID_STUDENT_IDS = ["U12345", "U23456", "U34567", "U45678", "U56789"];

// Password is 'password' for all users in this demo
const MOCK_PASSWORD = 'password';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{success: boolean, error?: string}> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call the API
      // const response = await authApi.login({ email, password });
      
      // For demo purposes, we'll use mock data
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundUser = MOCK_USERS.find(user => user.email === email);
      
      if (foundUser && password === MOCK_PASSWORD) {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        localStorage.setItem('authToken', 'mock-jwt-token');
        toast.success(`Добро пожаловать, ${foundUser.name}!`);
        
        // Redirect based on role
        switch (foundUser.role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'guard':
            navigate('/guard/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
        }
        
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Неверный email или пароль' };
      }
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Произошла неизвестная ошибка' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    toast.info('Вы вышли из системы');
    navigate('/login');
  };
  
  const validateStudentId = async (studentId: string): Promise<{
    success: boolean, 
    data?: ValidateStudentIdResponseDto, 
    error?: string
  }> => {
    try {
      // In a real app, this would call the API
      // const response = await authApi.validateStudentId({ student_id: studentId });
      
      // For demo purposes, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      const isValid = VALID_STUDENT_IDS.includes(studentId);
      
      if (isValid) {
        // Mock response data
        return {
          success: true,
          data: {
            exists: true,
            name: studentId === "U12345" ? "Иван Иванов" : undefined,
            department: studentId === "U12345" ? "Компьютерные науки" : undefined
          }
        };
      } else {
        return {
          success: false,
          error: "ID студента не найден в системе"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Произошла ошибка при проверке ID студента"
      };
    }
  };
  
  const registerStudent = async (
    studentId: string, 
    name: string, 
    email: string, 
    password: string, 
    phone?: string
  ): Promise<{success: boolean, error?: string}> => {
    try {
      // In a real app, this would call the API
      // const response = await authApi.registerStudent({ 
      //   student_id: studentId, 
      //   name, 
      //   email, 
      //   password,
      //   phone 
      // });
      
      // For demo purposes, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Check if email is already used
      const emailExists = MOCK_USERS.some(user => user.email === email);
      
      if (emailExists) {
        return {
          success: false,
          error: "Этот email уже используется"
        };
      }
      
      // In a real app, the backend would create the user
      // For our mock demo, we just return success
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Произошла ошибка при регистрации"
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      registerStudent,
      validateStudentId
    }}>
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
