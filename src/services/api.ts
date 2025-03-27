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
  ValidateStudentIdResponseDto,
  ValidateAccessCodeDto
} from "@/types/api";
import { Booking, Room } from "@/context/BookingContext";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserProfileData {
  studentId: string;
  username: string;
  fullName: string;
  email: string;
  faculty: string;
  group: string;
  course: number | string;
  academicYear: string;
  status: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}


export interface TimeSlot {
  id: string;
  start: string; // ISO timestamp
  end: string;   // ISO timestamp
  isAvailable: boolean;
}

export interface RoomAvailability {
  roomId: number;
  date: string;  // YYYY-MM-DD
  timeSlots: TimeSlot[];
}

export interface Room {
  id: number;
  name: string;
  category: string;
  capacity: number;
  status: string;
  schedule: {
    from_date: string;
    until_date: string;
    type: string;
    booking_id?: number;
  }[];
}

export interface BookingRequest {
  room_id: number;
  start_time: string; // ISO timestamp
  end_time: string;   // ISO timestamp
  purpose: string;
  attendees: number;
}

export interface Booking {
  id: number;
  room_id: number;
  room_name: string;
  room_category: string;
  room_capacity: number;
  from_date: string;
  until_date: string;
  purpose: string;
  attendees: number;
  status: string;
  secret_code?: string;
  created_at: string;
}


// Base API URL - should be configured from environment variables in production
const API_BASE_URL = "";

// Helper function for handling API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`
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
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');

    // Base URL for the request - ensure endpoint starts with /
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    // Create request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No auth token available - some API calls may fail');
    }

    // Log request info (for debugging)
    console.log(`Fetching ${method} ${url}`);

    // Make the request
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    // Handle response
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      // Handle auth errors specially
      if (response.status === 401) {
        console.error('Authentication error - token may be invalid or expired');
        return {
          success: false,
          error: 'Authentication failed. Please log in again.'
        };
      }

      // Handle other errors
      return {
        success: false,
        error: `Error ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Authentication API
export const authApi = {
  login: (credentials: LoginDto) =>
      fetchWithAuth<LoginResponseDto>('/api/auth/login', 'POST', credentials),

  logout: () =>
      fetchWithAuth<void>('/api/auth/logout', 'POST'),

  getCurrentUser: () =>
      fetchWithAuth<LoginResponseDto['user']>('/api/auth/me'),

  // First step: Validate student ID against Excel file
  checkStudentId: (studentId: string) =>
      fetchWithAuth<ValidateStudentIdResponseDto>('/api/auth/check-student-id', 'POST', { username: studentId }),

  // Second step: Complete registration with password
  completeRegistration: (studentId: string, password: string) =>
      fetchWithAuth<{message: string}>('/api/auth/complete-registration', 'POST', {
        username: studentId,
        password: password
      }),

  // Keep the old methods for backward compatibility
  registerStudent: (data: RegisterStudentDto) =>
      fetchWithAuth<LoginResponseDto>('/api/auth/register', 'POST', {
        username: data.studentId,
        password: data.password
      }),

  validateStudentId: (data: ValidateStudentIdDto) =>
      fetchWithAuth<ValidateStudentIdResponseDto>('/api/auth/check-student-id', 'POST', {
        username: data.studentId
      }),

  getCurrentUserProfile: async (): Promise<ApiResponse<UserProfileData>> => {
    try {
      const response = await fetchWithAuth('/api/auth/me/profile');
      return response;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { success: false, error: 'Failed to fetch profile data' };
    }
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await fetchWithAuth('/api/auth/change-password', 'POST', {
        old_password: oldPassword,
        new_password: newPassword
      });
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }
};

// Rest of the file stays the same
// Rooms API

export const roomsApi = {
  getAll: () =>
      fetchWithAuth<Room[]>('/api/rooms/'),

  getById: (id: string) =>
      fetchWithAuth<Room>(`rooms/${id}`),

  create: (room: RoomCreateDto) =>
      fetchWithAuth<Room>('/rooms', 'POST', room),

  update: (id: string, updates: RoomUpdateDto) =>
      fetchWithAuth<Room>(`/rooms/${id}`, 'PUT', updates),

  delete: (id: string) =>
      fetchWithAuth<void>(`/rooms/${id}`, 'DELETE'),

  getRooms: async (): Promise<ApiResponse<Room[]>> => {
    return fetchWithAuth<Room[]>('/api/rooms/');
  },

  // Get rooms by category
  getRoomsByCategory: async (category: string): Promise<ApiResponse<Room[]>> => {
    return fetchWithAuth<Room[]>(`/api/rooms?category=${category}`);
  },

  // Get room availability for a specific date
  getRoomAvailability: async (roomId: string, date: string): Promise<ApiResponse<RoomAvailability>> => {
    return fetchWithAuth<RoomAvailability>(`/api/rooms/${roomId}/availability?date=${date}`);
  },

  // Create a booking
  createBooking: async (bookingData: BookingRequest): Promise<ApiResponse<{ id: string; message: string }>> => {
    return fetchWithAuth<{ id: string; message: string }>('/api/bookings', 'POST', bookingData);
  }
};


// Do the same for all other API objects (bookingsApi, usersApi, etc.)
// Make sure all paths include the /api prefix
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

  confirm: (id: number) =>
      fetchWithAuth<Booking>(`/bookings/${id}/confirm`, 'POST'),

  cancel: (id: number) =>
      fetchWithAuth<Booking>(`/bookings/${id}/cancel`, 'POST'),

  issueKey: (id: number, accessCode: string) =>
      fetchWithAuth<Booking>(`/bookings/${id}/issue-key`, 'POST', { access_code: accessCode }),

  returnKey: (id: number) =>
      fetchWithAuth<Booking>(`/bookings/${id}/return-key`, 'POST'),

  validateAccessCode: (data: ValidateAccessCodeDto) =>
      fetchWithAuth<{valid: boolean}>('/bookings/validate-access-code', 'POST', data),

  getUserBookings: () =>
      fetchWithAuth<Booking[]>('/api/bookings/user-bookings'),

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