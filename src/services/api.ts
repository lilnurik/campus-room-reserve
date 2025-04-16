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

// Interfaces
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
  roomId: string;
  date: string;  // YYYY-MM-DD
  timeSlots: TimeSlot[];
}

export interface Room {
  id: string;
  name: string;
  category: string;
  building?: string;
  description?: string;
  capacity: number;
  status: string;
  features?: string[];
  schedule?: {
    from_date: string;
    until_date: string;
    type: string;
    booking_id?: number;
  }[];
}

export interface BookingRequest {
  roomId: string;         // Room ID
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:MM
  endTime: string;        // HH:MM
  purpose: string;        // Purpose of booking
  attendees: number;      // Number of attendees
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

// Use relative URLs for API endpoints when working with the proxy
const API_BASE_URL = "https://room.turin.uz/";

// Enhanced helper function for handling API responses with detailed error logging
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    // Try to parse response as JSON
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          data
        });

        // Extract error message from response
        const errorMessage = data.message || data.error || data.msg || `Error ${response.status}: ${response.statusText}`;

        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: true,
        data
      };
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      console.error("Non-JSON response:", {
        status: response.status,
        statusText: response.statusText,
        body: text
      });

      return {
        success: false,
        error: `Server returned non-JSON response (${response.status}): ${response.statusText}`
      };
    }
  } catch (error) {
    console.error("Error parsing response:", error);
    return {
      success: false,
      error: "Failed to parse server response"
    };
  }
}




// Function to test the booking API directly
export const testBookingAPI = async () => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    console.error("No authentication token found");
    return { success: false, error: "No authentication token" };
  }

  // Create a test booking with ISO-formatted dates
  const testBooking = {
    room_id: 1,
    from_date: "2025-04-02T15:00:00.000Z",   // Full ISO format
    until_date: "2025-04-02T16:30:00.000Z",  // Full ISO format
    purpose: "API Testing",
    attendees: 2
  };

  try {
    const response = await fetch('/api/bookings/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testBooking)
    });

    const data = await response.json();
    console.log("API Test Response:", data);

    return { success: response.ok, data, error: response.ok ? undefined : data.error };
  } catch (error) {
    console.error("API Test Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Improved fetch function with authentication and error handling
async function fetchWithAuth<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
): Promise<ApiResponse<T>> {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/check-student-id')) {
      console.warn('No auth token available - API call may fail:', endpoint);
    }

    // Remove duplicate forward slashes in URL
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    console.log(`Fetching ${method} ${url}`);

    // Create request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Log the request payload for debugging
    if (body) {
      console.log('Request payload:', JSON.stringify(body, null, 2));
    }

    // Make the request
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    // Log response status for debugging
    console.log(`Response status: ${response.status}`);

    // Handle response
    return await handleResponse<T>(response);
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
    return fetchWithAuth<UserProfileData>('/api/auth/me/profile');
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
    return fetchWithAuth<{ message: string }>('/api/auth/change-password', 'POST', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }
};

// Rooms API
export const roomsApi = {
  getAll: () =>
      fetchWithAuth<Room[]>('/api/rooms/'),

  getById: (id: string) =>
      fetchWithAuth<Room>(`/api/rooms/${id}`),

  createRoom: async (roomData: {name: string, category: string, capacity: number, status: string}): Promise<ApiResponse<{message: string, id: number}>> => {
    return fetchWithAuth<{message: string, id: number}>('/api/admin/rooms', 'POST', roomData);
  },

  create: (room: RoomCreateDto) =>
      fetchWithAuth<Room>('/api/rooms', 'POST', room),

  updateRoom: async (roomId: string | number, roomData: any): Promise<ApiResponse<Room>> => {
    return fetchWithAuth<Room>(`/api/admin/room/${roomId}`, 'PUT', roomData);
  },

  delete: (id: string) =>
      fetchWithAuth<void>(`/api/rooms/${id}`, 'DELETE'),

  getRooms: async (): Promise<ApiResponse<Room[]>> => {
    return fetchWithAuth<Room[]>('/api/rooms/');
  },

  // Get rooms by category
  getRoomsByCategory: async (category: string): Promise<ApiResponse<Room[]>> => {
    return fetchWithAuth<Room[]>(`/api/rooms?category=${category}`);
  },

  createRoom: async (roomData: Partial<Room>): Promise<ApiResponse<{message: string, id: number}>> => {
    // Format the data to match what the backend expects
    const requestData = {
      name: roomData.name,
      category: roomData.category || roomData.type, // Support both field names
      capacity: roomData.capacity,
      status: roomData.status || 'available'
    };

    return fetchWithAuth<{message: string, id: number}>('/api/admin/rooms', 'POST', requestData);
  },

  // Get room availability for a specific date
  getRoomAvailability: async (roomId: string, date: string): Promise<ApiResponse<RoomAvailability>> => {
    return fetchWithAuth<RoomAvailability>(`/api/rooms/${roomId}/availability?date=${date}`);
  },

  // Update the createBooking function in api.ts
  // Update the createBooking function in api.ts
  createBooking: async (bookingData: BookingRequest): Promise<ApiResponse<Booking>> => {
    try {
      // Get the full date components
      const dateStr = bookingData.date; // YYYY-MM-DD

      // Create full ISO timestamps
      const startISO = new Date(`${dateStr}T${bookingData.startTime}:00Z`).toISOString();
      const endISO = new Date(`${dateStr}T${bookingData.endTime}:00Z`).toISOString();

      console.log("Creating booking with ISO dates:", {
        startISO,
        endISO
      });

      // Send with the field names from API documentation but using ISO formatted values
      const apiBookingData = {
        room_id: parseInt(bookingData.roomId),
        start_time: startISO,  // Full ISO string
        end_time: endISO,      // Full ISO string
        purpose: bookingData.purpose,
        attendees: bookingData.attendees
      };

      console.log("Sending to API:", apiBookingData);

      return fetchWithAuth<Booking>('/api/bookings/', 'POST', apiBookingData);
    } catch (error) {
      console.error("Error preparing booking data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to prepare booking data"
      };
    }
  }
  };


// Option 1: Improved standalone implementation using your fetchWithAuth utility
export const updateRoom = async (roomId: number | string, roomData: Partial<Room>): Promise<ApiResponse<Room>> => {
  // Format the data to match what the backend expects
  const requestData = {
    name: roomData.name,
    category: roomData.category || roomData.type, // Support both field names
    capacity: roomData.capacity,
    status: roomData.status
  };

  return fetchWithAuth<Room>(`/api/admin/room/${roomId}`, 'PUT', requestData);
};

// Option 2: Add this method to your existing roomsApi object
roomsApi.updateRoom = async (roomId: string | number, roomData: Partial<Room>): Promise<ApiResponse<Room>> => {
  // Format the data to match what the backend expects
  const requestData = {
    name: roomData.name,
    category: roomData.category || roomData.type, // Support both field names
    capacity: roomData.capacity,
    status: roomData.status
  };

  return fetchWithAuth<Room>(`/api/admin/room/${roomId}`, 'PUT', requestData);
};

// Bookings API
export const bookingsApi = {
  getAll: () =>
      fetchWithAuth<Booking[]>('/api/bookings/'),

  getById: (id: number) =>
      fetchWithAuth<Booking>(`/api/bookings/${id}`),

  getByUser: () =>
      fetchWithAuth<Booking[]>(`/api/bookings/user`),

  create: (booking: BookingCreateDto) =>
      fetchWithAuth<Booking>('/api/bookings/', 'POST', booking),

  update: (id: number, updates: BookingUpdateDto) =>
      fetchWithAuth<Booking>(`/api/bookings/${id}`, 'PUT', updates),

  approve: (id: number) =>
      fetchWithAuth<Booking>(`/api/admin/bookings/${id}/approve`, 'POST'),

  reject: (id: number) =>
      fetchWithAuth<Booking>(`/api/admin/bookings/${id}/reject`, 'POST'),

  cancel: (id: number) =>
      fetchWithAuth<Booking>(`/api/bookings/${id}/cancel`, 'POST'),

  issueKey: (id: number, accessCode: string) =>
      fetchWithAuth<Booking>(`/api/bookings/${id}/issue-key`, 'POST', { access_code: accessCode }),

  returnKey: (id: number) =>
      fetchWithAuth<Booking>(`/api/bookings/${id}/return-key`, 'POST'),

  validateAccessCode: (data: ValidateAccessCodeDto) =>
      fetchWithAuth<{valid: boolean}>('/api/bookings/validate-access-code', 'POST', data),

  getUserBookings: () =>
      fetchWithAuth<Booking[]>('/api/bookings/user'),
};

// Users API
export const usersApi = {
  getAll: () =>
      fetchWithAuth<any[]>('/api/admin/users'),

  getById: (id: number) =>
      fetchWithAuth<any>(`/api/admin/users/${id}`),

  create: (user: UserCreateDto) =>
      fetchWithAuth<any>('/api/admin/users', 'POST', user),

  update: (id: number, updates: UserUpdateDto) =>
      fetchWithAuth<any>(`/api/admin/users/${id}`, 'PUT', updates),

  delete: (id: number) =>
      fetchWithAuth<void>(`/api/admin/users/${id}`, 'DELETE'),

  changePassword: (id: number, data: {oldPassword: string, newPassword: string}) =>
      fetchWithAuth<void>(`/api/admin/users/${id}/change-password`, 'POST', data)
};

// Settings API
export const settingsApi = {
  getAll: () =>
      fetchWithAuth<Record<string, any>>('/api/settings'),

  update: (settings: Record<string, any>) =>
      fetchWithAuth<Record<string, any>>('/api/settings', 'PUT', settings)
};