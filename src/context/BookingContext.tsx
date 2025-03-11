import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Types for bookings
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'overdue';

export interface Booking {
  id: number;
  room: string;
  student_id: number;
  student_name?: string;
  start: string;
  end: string;
  status: BookingStatus;
  key_issued: boolean;
  key_returned?: boolean;
  qr_code?: string;
  access_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type RoomType = 'lecture' | 'computer_lab' | 'lab' | 'conference' | 'sports' | 'office' | 'library' | 'coworking';
export type RoomStatus = 'available' | 'unavailable' | 'maintenance';

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: RoomType;
  features: string[];
  status: RoomStatus;
  description?: string;
  floor?: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  status: 'available' | 'booked' | 'class' | 'maintenance';
  booking_id?: number;
}

interface BookingContextType {
  bookings: Booking[];
  rooms: Room[];
  getTimeSlots: (roomId: string, date: string) => TimeSlot[];
  getUserBookings: (userId: number) => Booking[];
  createBooking: (booking: Partial<Booking>) => Promise<Booking | null>;
  updateBooking: (id: number, updates: Partial<Booking>) => Promise<boolean>;
  cancelBooking: (id: number) => Promise<boolean>;
  issueKey: (bookingId: number) => Promise<boolean>;
  returnKey: (bookingId: number) => Promise<boolean>;
  addRoom: (room: Room) => Promise<boolean>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<boolean>;
  deleteRoom: (id: string) => Promise<boolean>;
  isLoading: boolean;
}

// Mock data
const MOCK_ROOMS: Room[] = [
  { 
    id: "A101", 
    name: "Лекционный зал А101", 
    building: "Главный корпус", 
    capacity: 100, 
    type: "lecture", 
    features: ["projector", "computer", "whiteboard"], 
    status: "available",
    floor: 1 
  },
  { 
    id: "B202", 
    name: "Компьютерный класс B202", 
    building: "Технический корпус", 
    capacity: 30, 
    type: "computer_lab", 
    features: ["computers", "whiteboard", "air_conditioning"], 
    status: "available",
    floor: 2 
  },
  { 
    id: "C303", 
    name: "Конференц-зал C303", 
    building: "Административный корпус", 
    capacity: 50, 
    type: "conference", 
    features: ["projector", "audio_system", "video_conferencing"], 
    status: "available",
    floor: 3 
  },
  { 
    id: "D404", 
    name: "Лаборатория D404", 
    building: "Научный корпус", 
    capacity: 25, 
    type: "lab", 
    features: ["specialized_equipment", "ventilation", "safety_equipment"], 
    status: "maintenance",
    floor: 4 
  },
  { 
    id: "GYM01", 
    name: "Спортзал", 
    building: "Спортивный комплекс", 
    capacity: 200, 
    type: "sports", 
    features: ["basketball_court", "volleyball_court", "changing_rooms"], 
    status: "available",
    floor: 1 
  },
  { 
    id: "LIB01", 
    name: "Читальный зал", 
    building: "Библиотека", 
    capacity: 50, 
    type: "library", 
    features: ["quiet_zone", "computers", "bookshelves"], 
    status: "available",
    floor: 2 
  },
  { 
    id: "CW001", 
    name: "Коворкинг", 
    building: "Студенческий центр", 
    capacity: 40, 
    type: "coworking", 
    features: ["high_speed_internet", "coffee_machine", "lounge_area"], 
    status: "available",
    floor: 1 
  },
  { 
    id: "OFF101", 
    name: "Офисное помещение", 
    building: "Административный корпус", 
    capacity: 10, 
    type: "office", 
    features: ["air_conditioning", "meeting_table", "printer"], 
    status: "available",
    floor: 1 
  }
];

const generateMockBookings = (): Booking[] => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0];
  
  return [
    {
      id: 101,
      room: "A101",
      student_id: 1,
      student_name: "Иван Иванов",
      start: `${today}T08:00:00`,
      end: `${today}T10:00:00`,
      status: "confirmed",
      key_issued: false,
      created_at: `${today}T07:30:00`,
      updated_at: `${today}T07:35:00`,
      access_code: "1234-5678"
    },
    {
      id: 102,
      room: "A101",
      student_id: 2,
      student_name: "Анна Смирнова",
      start: `${today}T12:00:00`,
      end: `${today}T14:00:00`,
      status: "pending",
      key_issued: false,
      created_at: `${today}T07:30:00`,
      updated_at: `${today}T07:35:00`
    },
    {
      id: 103,
      room: "B202",
      student_id: 1,
      student_name: "Иван Иванов",
      start: `${today}T16:00:00`,
      end: `${today}T18:00:00`,
      status: "confirmed",
      key_issued: true,
      key_returned: false,
      created_at: `${today}T10:00:00`,
      updated_at: `${today}T11:00:00`,
      access_code: "5678-1234"
    },
    {
      id: 104,
      room: "C303",
      student_id: 2,
      student_name: "Анна Смирнова",
      start: `${tomorrow}T09:00:00`,
      end: `${tomorrow}T11:00:00`,
      status: "pending",
      key_issued: false,
      created_at: `${today}T09:00:00`,
      updated_at: `${today}T09:05:00`
    },
    {
      id: 105,
      room: "GYM01",
      student_id: 1,
      student_name: "Иван Иванов",
      start: `${yesterday}T18:00:00`,
      end: `${yesterday}T20:00:00`,
      status: "overdue",
      key_issued: true,
      key_returned: false,
      created_at: `${yesterday}T14:00:00`,
      updated_at: `${yesterday}T14:05:00`,
      access_code: "9876-5432"
    }
  ] as Booking[];
};

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

const yesterday = getYesterday();

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(generateMockBookings());
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getTimeSlots = (roomId: string, date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const roomBookings = bookings.filter(b => 
      b.room === roomId && 
      b.start.includes(date) && 
      (b.status === 'confirmed' || b.status === 'pending')
    );
    
    for (let hour = 8; hour < 21; hour++) {
      const start = `${date}T${hour.toString().padStart(2, '0')}:00:00`;
      const end = `${date}T${(hour + 1).toString().padStart(2, '0')}:00:00`;
      
      const conflictingBooking = roomBookings.find(booking => {
        const bookingStart = new Date(booking.start).getTime();
        const bookingEnd = new Date(booking.end).getTime();
        const slotStart = new Date(start).getTime();
        const slotEnd = new Date(end).getTime();
        
        return (slotStart < bookingEnd && slotEnd > bookingStart);
      });
      
      if (conflictingBooking) {
        slots.push({
          start,
          end,
          status: 'booked',
          booking_id: conflictingBooking.id
        });
      } else {
        if (hour % 3 === 0 && hour > 9 && hour < 18) {
          slots.push({
            start,
            end,
            status: 'class'
          });
        } else {
          slots.push({
            start,
            end,
            status: 'available'
          });
        }
      }
    }
    
    return slots;
  };

  const getUserBookings = (userId: number): Booking[] => {
    return bookings.filter(booking => booking.student_id === userId);
  };

  const createBooking = async (bookingData: Partial<Booking>): Promise<Booking | null> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!user || user.role !== 'student') {
      toast.error('Только студенты могут создавать бронирования');
      setIsLoading(false);
      return null;
    }
    
    const roomSlots = getTimeSlots(bookingData.room || '', bookingData.start?.split('T')[0] || '');
    const startTime = new Date(bookingData.start || '').getTime();
    const endTime = new Date(bookingData.end || '').getTime();
    
    const conflictingSlots = roomSlots.filter(slot => {
      const slotStart = new Date(slot.start).getTime();
      const slotEnd = new Date(slot.end).getTime();
      return (
        (startTime >= slotStart && startTime < slotEnd) || 
        (endTime > slotStart && endTime <= slotEnd) ||
        (startTime <= slotStart && endTime >= slotEnd)
      ) && slot.status !== 'available';
    });
    
    if (conflictingSlots.length > 0) {
      toast.error('Выбранное время недоступно для бронирования');
      setIsLoading(false);
      return null;
    }
    
    const newBooking: Booking = {
      id: Math.max(...bookings.map(b => b.id), 0) + 1,
      room: bookingData.room || '',
      student_id: user.id,
      student_name: user.name,
      start: bookingData.start || '',
      end: bookingData.end || '',
      status: 'pending',
      key_issued: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      access_code: Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000)
    };
    
    setBookings([...bookings, newBooking]);
    toast.success('Запрос на бронирование отправлен');
    setIsLoading(false);
    return newBooking;
  };

  const updateBooking = async (id: number, updates: Partial<Booking>): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bookingIndex = bookings.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) {
      toast.error('Бронирование не найдено');
      setIsLoading(false);
      return false;
    }
    
    const updatedBookings = [...bookings];
    updatedBookings[bookingIndex] = {
      ...updatedBookings[bookingIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    setBookings(updatedBookings);
    toast.success('Бронирование обновлено');
    setIsLoading(false);
    return true;
  };

  const cancelBooking = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const bookingIndex = bookings.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) {
      toast.error('Бронирование не найдено');
      setIsLoading(false);
      return false;
    }
    
    if (['completed', 'cancelled'].includes(bookings[bookingIndex].status)) {
      toast.error('Невозможно отменить это бронирование');
      setIsLoading(false);
      return false;
    }
    
    if (bookings[bookingIndex].key_issued && !bookings[bookingIndex].key_returned) {
      toast.error('Невозможно отменить бронирование, так как ключ уже выдан');
      setIsLoading(false);
      return false;
    }
    
    const updatedBookings = [...bookings];
    updatedBookings[bookingIndex] = {
      ...updatedBookings[bookingIndex],
      status: 'cancelled',
      updated_at: new Date().toISOString()
    };
    
    setBookings(updatedBookings);
    toast.success('Бронирование отменено');
    setIsLoading(false);
    return true;
  };

  const issueKey = async (bookingId: number): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
      toast.error('Бронирование не найдено');
      setIsLoading(false);
      return false;
    }
    
    if (bookings[bookingIndex].status !== 'confirmed') {
      toast.error('Ключ можно выдать только для подтвержденного бронирования');
      setIsLoading(false);
      return false;
    }
    
    if (bookings[bookingIndex].key_issued) {
      toast.error('Ключ уже выдан');
      setIsLoading(false);
      return false;
    }
    
    const updatedBookings = [...bookings];
    updatedBookings[bookingIndex] = {
      ...updatedBookings[bookingIndex],
      key_issued: true,
      updated_at: new Date().toISOString()
    };
    
    setBookings(updatedBookings);
    toast.success('Ключ выдан');
    setIsLoading(false);
    return true;
  };

  const returnKey = async (bookingId: number): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
      toast.error('Бронирование не найдено');
      setIsLoading(false);
      return false;
    }
    
    if (!bookings[bookingIndex].key_issued) {
      toast.error('Ключ не был выдан');
      setIsLoading(false);
      return false;
    }
    
    if (bookings[bookingIndex].key_returned) {
      toast.error('Ключ уже возвращен');
      setIsLoading(false);
      return false;
    }
    
    const updatedBookings = [...bookings];
    updatedBookings[bookingIndex] = {
      ...updatedBookings[bookingIndex],
      key_returned: true,
      status: 'completed',
      updated_at: new Date().toISOString()
    };
    
    setBookings(updatedBookings);
    toast.success('Ключ возвращен');
    setIsLoading(false);
    return true;
  };

  const addRoom = async (room: Room): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (rooms.some(r => r.id === room.id)) {
      toast.error('Помещение с таким ID уже существует');
      setIsLoading(false);
      return false;
    }
    
    setRooms([...rooms, room]);
    toast.success('Помещение добавлено');
    setIsLoading(false);
    return true;
  };

  const updateRoom = async (id: string, updates: Partial<Room>): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const roomIndex = rooms.findIndex(r => r.id === id);
    
    if (roomIndex === -1) {
      toast.error('Помещение не найдено');
      setIsLoading(false);
      return false;
    }
    
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      ...updates
    };
    
    setRooms(updatedRooms);
    toast.success('Информация о помещении обновлена');
    setIsLoading(false);
    return true;
  };

  const deleteRoom = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const hasBookings = bookings.some(b => 
      b.room === id && 
      ['pending', 'confirmed'].includes(b.status)
    );
    
    if (hasBookings) {
      toast.error('Невозможно удалить помещение с активными бронированиями');
      setIsLoading(false);
      return false;
    }
    
    setRooms(rooms.filter(r => r.id !== id));
    toast.success('Помещение удалено');
    setIsLoading(false);
    return true;
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      rooms,
      getTimeSlots,
      getUserBookings,
      createBooking,
      updateBooking,
      cancelBooking,
      issueKey,
      returnKey,
      addRoom,
      updateRoom,
      deleteRoom,
      isLoading
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
