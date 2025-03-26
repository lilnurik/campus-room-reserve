
// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Room API Types
export interface RoomCreateDto {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: string;
  features: string[];
  status: string;
  floor?: number;
  description?: string;
}

export interface RoomUpdateDto {
  name?: string;
  building?: string;
  capacity?: number;
  type?: string;
  features?: string[];
  status?: string;
  floor?: number;
  description?: string;
}

// Booking API Types
export interface BookingCreateDto {
  room: string;
  student_id: number;
  start: string;
  end: string;
  notes?: string;
}

export interface BookingUpdateDto {
  status?: string;
  key_issued?: boolean;
  key_returned?: boolean;
  notes?: string;
  access_code?: string;
}

// User API Types
export interface UserCreateDto {
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  password: string;
}

export interface UserUpdateDto {
  name?: string;
  email?: string;
  department?: string;
  phone?: string;
  active?: boolean;
}

// Authentication API Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterStudentDto {
  student_id: string; // In format U12345
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ValidateStudentIdDto {
  student_id: string; // In format U12345
}

export interface ValidateStudentIdResponseDto {
  exists: boolean;
  name?: string;
  department?: string;
}

export interface LoginResponseDto {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    student_id?: string; // Added for students
  };
  token: string;
}

// New interface for validating access code
export interface ValidateAccessCodeDto {
  booking_id: number;
  access_code: string;
}

