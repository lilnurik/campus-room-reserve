import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import {ValidateStudentIdResponseDto} from "@/types/api.ts";

// Types for users
export type Role = 'student' | 'security' | 'admin' | 'staff';

export interface User {
  manager_name: string;
  employee_id: string;
  name: string;
  is_manager: any;
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  internal_id?: string;  // For staff
  department?: string;   // For staff
  is_supervisor?: boolean; // For staff
  group?: string;        // For students
  course?: number;       // For students
  faculty?: string;      // For students
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
  validateEmployeeId: (employeeId: string) => Promise<{
    success: boolean,
    data?: any,
    error?: string
  }>;
  registerEmployee: (
      employeeId: string,
      password: string
  ) => Promise<{success: boolean, error?: string}>;
  createEmployee: (
      fullName: string,
      department: string,
      isManager: boolean
  ) => Promise<{success: boolean, employeeId?: string, password?: string, error?: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored token on mount and try to get user info
    const token = localStorage.getItem('authToken');
    if (token) {
      loadUserProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Load user profile with the stored token
  const loadUserProfile = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.getProfile();

      if (response.success) {
        const userData = {
          id: response.data.id,
          username: response.data.username,
          full_name: response.data.fullName || response.data.username,
          email: response.data.email,
          role: response.data.role,
          // Staff specific fields
          internal_id: response.data.internal_id,
          department: response.data.department,
          is_supervisor: response.data.is_supervisor,
          // Student specific fields
          group: response.data.group,
          course: response.data.course,
          faculty: response.data.faculty
        };

        setUser(userData);

        // Check if this is first login for staff
        if (response.data.role === 'staff' && response.data.is_first_login) {
          setIsFirstLogin(true);
        }
      } else {
        // If profile fetch fails, clear token and user data
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{success: boolean, error?: string}> => {
    setIsLoading(true);

    try {
      const response = await authApi.login({
        username,
        password
      });

      if (response.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);

        const userData = {
          id: response.data.id || 0,
          username: username,
          full_name: response.data.full_name || username,
          email: response.data.email || '',
          role: response.data.role,
          // Staff specific fields
          internal_id: response.data.internal_id,
          department: response.data.department,
          is_supervisor: response.data.is_supervisor,
          // Student specific fields
          group: response.data.group,
          course: response.data.course,
          faculty: response.data.faculty
        };

        setUser(userData);

        // Check if staff member's first login
        if (response.data.role === 'staff' && response.data.is_first_login) {
          setIsFirstLogin(true);
          // Navigate to password change page instead of dashboard
          navigate('/change-password');
        } else {
          // Regular navigation based on role
          navigateByRole(response.data.role);
        }

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Invalid credentials' };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsFirstLogin(false);
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Navigate based on user role
  const navigateByRole = (role: Role) => {
    switch (role) {
      case 'student':
        navigate('/student/dashboard');
        break;
      case 'security':
        navigate('/guard/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'staff':
        navigate('/employee/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  // Student related methods
  const validateStudentId = async (studentId: string) => {
    try {
      return await authApi.checkStudentId(studentId);
    } catch (error) {
      console.error('Error validating student ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error validating student ID'
      };
    }
  };

  const registerStudent = async (studentId: string, password: string) => {
    try {
      return await authApi.completeRegistration(studentId, password);
    } catch (error) {
      console.error('Error registering student:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during registration'
      };
    }
  };

  // Staff related methods
  const validateStaffId = async (internalId: string) => {
    try {
      return await authApi.checkStaffId(internalId);
    } catch (error) {
      console.error('Error validating staff ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error validating staff ID'
      };
    }
  };

  const registerStaff = async (internalId: string, password: string) => {
    try {
      return await authApi.completeStaffRegistration(internalId, password);
    } catch (error) {
      console.error('Error registering staff:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during registration'
      };
    }
  };

  const changeFirstLoginPassword = async (newPassword: string) => {
    try {
      const response = await authApi.changeFirstTimePassword(newPassword);

      if (response.success) {
        setIsFirstLogin(false);
        toast.success('Password changed successfully');
        // Navigate to appropriate dashboard
        if (user) {
          navigateByRole(user.role);
        }
      }

      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error changing password'
      };
    }
  };

  // Staff management methods (for supervisors)
  const createStaffMember = async (staffData: {
    full_name: string,
    email: string,
    department: string,
    internal_id: string,
    is_supervisor: boolean
  }) => {
    try {
      return await authApi.createStaff(staffData);
    } catch (error) {
      console.error('Error creating staff member:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating staff member'
      };
    }
  };

  return (
      <AuthContext.Provider value={{
        user,
        login,
        logout,
        isLoading,
        isFirstLogin,
        registerStudent,
        validateStudentId,
        registerStaff,
        validateStaffId,
        changeFirstLoginPassword,
        createStaffMember
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