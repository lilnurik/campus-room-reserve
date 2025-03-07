
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Format time to readable format
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format datetime to readable format
export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)}, ${formatTime(dateString)}`;
}

// Calculate time difference between two dates in minutes
export function getTimeDifferenceInMinutes(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
}

// Calculate how many minutes passed since a given date
export function getMinutesPassed(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  return Math.round((now.getTime() - date.getTime()) / (1000 * 60));
}

// Format minutes to readable duration
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

// Generate QR code value from booking ID and access code
export function generateQRValue(bookingId: number, accessCode: string): string {
  return `booking:${bookingId}:${accessCode}`;
}

// Check if a booking is active (current time is between start and end)
export function isBookingActive(start: string, end: string): boolean {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  return now >= startDate && now <= endDate;
}

// Check if a booking is upcoming (start time is in the future)
export function isBookingUpcoming(start: string): boolean {
  const now = new Date();
  const startDate = new Date(start);
  return startDate > now;
}

// Check if a booking is overdue (end time is in the past, but status is not completed)
export function isBookingOverdue(end: string): boolean {
  const now = new Date();
  const endDate = new Date(end);
  return endDate < now;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
