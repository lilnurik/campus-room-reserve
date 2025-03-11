import { 
  ApiResponse, 
  RoomCreateDto, 
  RoomUpdateDto, 
  BookingCreateDto, 
  BookingUpdateDto,
  UserCreateDto,
  UserUpdateDto,
  LoginDto,
  LoginResponseDto,
  RegisterStudentDto,
  ValidateStudentIdDto,
  ValidateStudentIdResponseDto
} from "@/types/api";
import { Booking, Room } from "@/context/BookingContext";

// Base API URL - should be configured from environment variables in production
const API_BASE_URL = "/api";

// Helper function for handling API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error || `Error: ${response.status} ${response.statusText}`
    };
  }

  const data = await response.json();
  return {
    success: true,
    data
  };
}

// Generic fetch function with authentication
async function fetchWithAuth<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    // Get auth token from local storage
    const token = localStorage.getItem('authToken');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    return handleResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Authentication API
export const authApi = {
  login: (credentials: LoginDto) => 
    fetchWithAuth<LoginResponseDto>('/auth/login', 'POST', credentials),
  
  logout: () => 
    fetchWithAuth<void>('/auth/logout', 'POST'),
  
  getCurrentUser: () => 
    fetchWithAuth<LoginResponseDto['user']>('/auth/me'),
    
  registerStudent: (data: RegisterStudentDto) =>
    fetchWithAuth<LoginResponseDto>('/auth/register/student', 'POST', data),
    
  validateStudentId: (data: ValidateStudentIdDto) =>
    fetchWithAuth<ValidateStudentIdResponseDto>('/auth/validate-student-id', 'POST', data)
};

// Rooms API
export const roomsApi = {
  getAll: () => 
    fetchWithAuth<Room[]>('/rooms'),
  
  getById: (id: string) => 
    fetchWithAuth<Room>(`/rooms/${id}`),
  
  create: (room: RoomCreateDto) => 
    fetchWithAuth<Room>('/rooms', 'POST', room),
  
  update: (id: string, updates: RoomUpdateDto) => 
    fetchWithAuth<Room>(`/rooms/${id}`, 'PUT', updates),
  
  delete: (id: string) => 
    fetchWithAuth<void>(`/rooms/${id}`, 'DELETE'),
  
  getAvailability: (roomId: string, date: string) => 
    fetchWithAuth<Array<{start: string, end: string, status: string}>>(`/rooms/${roomId}/availability?date=${date}`)
};

// Bookings API
export const bookingsApi = {
  getAll: () => 
    fetchWithAuth<Booking[]>('/bookings'),
  
  getById: (id: number) => 
    fetchWithAuth<Booking>(`/bookings/${id}`),
  
  getByUser: (userId: number) => 
    fetchWithAuth<Booking[]>(`/bookings/user/${userId}`),
  
  create: (booking: BookingCreateDto) => 
    fetchWithAuth<Booking>('/bookings', 'POST', booking),
  
  update: (id: number, updates: BookingUpdateDto) => 
    fetchWithAuth<Booking>(`/bookings/${id}`, 'PUT', updates),
  
  cancel: (id: number) => 
    fetchWithAuth<Booking>(`/bookings/${id}/cancel`, 'POST'),
  
  issueKey: (id: number) => 
    fetchWithAuth<Booking>(`/bookings/${id}/issue-key`, 'POST'),
  
  returnKey: (id: number) => 
    fetchWithAuth<Booking>(`/bookings/${id}/return-key`, 'POST')
};

// Users API
export const usersApi = {
  getAll: () => 
    fetchWithAuth<any[]>('/users'),
  
  getById: (id: number) => 
    fetchWithAuth<any>(`/users/${id}`),
  
  create: (user: UserCreateDto) => 
    fetchWithAuth<any>('/users', 'POST', user),
  
  update: (id: number, updates: UserUpdateDto) => 
    fetchWithAuth<any>(`/users/${id}`, 'PUT', updates),
  
  delete: (id: number) => 
    fetchWithAuth<void>(`/users/${id}`, 'DELETE'),
  
  changePassword: (id: number, data: {oldPassword: string, newPassword: string}) => 
    fetchWithAuth<void>(`/users/${id}/change-password`, 'POST', data)
};

// Settings API
export const settingsApi = {
  getAll: () => 
    fetchWithAuth<Record<string, any>>('/settings'),
  
  update: (settings: Record<string, any>) => 
    fetchWithAuth<Record<string, any>>('/settings', 'PUT', settings)
};
