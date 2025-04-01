import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable format with safety checks
export function formatDate(date: string | Date | null | undefined) {
  // Return placeholder for null/undefined values
  if (!date) return "Дата не указана";

  try {
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date received:', date);
      return "Некорректная дата";
    }

    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return "Ошибка даты";
  }
}

// Format a time to a human-readable format with safety checks
export function formatTime(date: string | Date | null | undefined) {
  if (!date) return "Время не указано";

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid time received:', date);
      return "Некорректное время";
    }

    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting time:', error, date);
    return "Ошибка времени";
  }
}

// Format datetime to readable format
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "Дата/время не указаны";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid datetime received:', dateString);
      return "Некорректные дата/время";
    }

    return `${formatDate(date)}, ${formatTime(date)}`;
  } catch (error) {
    console.error('Error formatting datetime:', error, dateString);
    return "Ошибка даты/времени";
  }
}

// Calculate time difference between two dates in minutes
export function getTimeDifferenceInMinutes(start: string, end: string): number {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('Invalid dates for time difference:', { start, end });
      return 0;
    }

    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  } catch (error) {
    console.error('Error calculating time difference:', error, { start, end });
    return 0;
  }
}

// Calculate how many minutes passed since a given date
export function getMinutesPassed(dateString: string): number {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid date for minutes passed:', dateString);
      return 0;
    }

    const now = new Date();
    return Math.round((now.getTime() - date.getTime()) / (1000 * 60));
  } catch (error) {
    console.error('Error calculating minutes passed:', error, dateString);
    return 0;
  }
}

// Rest of your utility functions remain the same
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин.`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ч.`;
  }

  return `${hours} ч. ${remainingMinutes} мин.`;
}

// Get color for status
export function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'completed':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'booked':
      return 'bg-violet-100 text-violet-800 border-violet-200';
    case 'class':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'maintenance':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Get user-friendly status name
export function getStatusName(status: string): string {
  switch (status) {
    case 'available':
      return 'Доступно';
    case 'pending':
      return 'Ожидание';
    case 'confirmed':
      return 'Подтверждено';
    case 'cancelled':
      return 'Отменено';
    case 'completed':
      return 'Завершено';
    case 'booked':
      return 'Забронировано';
    case 'class':
      return 'Занятие';
    case 'maintenance':
      return 'Техобслуживание';
    case 'overdue':
      return 'Просрочено';
    default:
      return status;
  }
}

// The rest of your utility functions...
export async function fetchWithAuth<T>(
    url: string,
    method: string = 'GET',
    body?: any
): Promise<ApiResponse<T>> {
  // Implementation unchanged
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Request failed with status ${response.status}`
      };
    }

    return { success: true, data: data as T };
  } catch (error) {
    console.error('API request error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Define the common API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function generateQRValue(bookingId: number, accessCode: string): string {
  return `booking:${bookingId}:${accessCode}`;
}

export function isBookingActive(start: string, end: string): boolean {
  try {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('Invalid dates for booking active check:', { start, end });
      return false;
    }

    return now >= startDate && now <= endDate;
  } catch (error) {
    console.error('Error checking if booking is active:', error, { start, end });
    return false;
  }
}

export function isBookingUpcoming(start: string): boolean {
  try {
    const now = new Date();
    const startDate = new Date(start);

    if (isNaN(startDate.getTime())) {
      console.warn('Invalid date for booking upcoming check:', start);
      return false;
    }

    return startDate > now;
  } catch (error) {
    console.error('Error checking if booking is upcoming:', error, start);
    return false;
  }
}

export function isBookingOverdue(end: string): boolean {
  try {
    const now = new Date();
    const endDate = new Date(end);

    if (isNaN(endDate.getTime())) {
      console.warn('Invalid date for booking overdue check:', end);
      return false;
    }

    return endDate < now;
  } catch (error) {
    console.error('Error checking if booking is overdue:', error, end);
    return false;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}