
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

export interface LoginResponseDto {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}
