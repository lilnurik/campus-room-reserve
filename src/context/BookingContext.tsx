import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { bookingsApi, roomsApi } from '@/services/api';
import { toast } from 'sonner';

// Context and provider implementation
export const BookingContext = createContext<BookingContextType>({} as BookingContextType);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to convert login response bookings to our format
  const convertLoginBookings = (loginBookings: any[]): Booking[] => {
    return loginBookings.map(booking => ({
      id: booking.id,
      roomId: booking.room_id,
      roomName: booking.name,
      roomCategory: booking.category,
      roomCapacity: booking.capacity,
      start: booking.from_date || booking.start,
      end: booking.until_date || booking.end,
      status: booking.status,
      secretCode: booking.secret_code,
      createdAt: booking.created_at
    }));
  };

  // Initialize from login data
  useEffect(() => {
    const loginData = localStorage.getItem('loginResponse');
    if (loginData) {
      try {
        const userData = JSON.parse(loginData);
        if (userData.bookings && Array.isArray(userData.bookings)) {
          setBookings(convertLoginBookings(userData.bookings));
        }
      } catch (error) {
        console.error("Error parsing login data:", error);
      }
    }

    // Still load rooms and fresh bookings
    refreshRooms();
    refreshBookings();
  }, []);

  const refreshBookings = async () => {
    try {
      setIsRefreshing(true);
      const response = await bookingsApi.getUserBookings();

      if (response.success && response.data) {
        setBookings(convertLoginBookings(response.data));
      } else {
        console.error("Failed to fetch bookings:", response.error);
      }
    } catch (error) {
      console.error("Error refreshing bookings:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshRooms = async () => {
    try {
      const response = await roomsApi.getAll();

      if (response.success && response.data) {
        setRooms(response.data);
      } else {
        console.error("Failed to fetch rooms:", response.error);
      }
    } catch (error) {
      console.error("Error refreshing rooms:", error);
    }
  };

  // Rest of your context implementation...

  return (
      <BookingContext.Provider value={{
        bookings,
        rooms,
        isLoading,
        isRefreshing,
        refreshBookings,
        // Other methods...
      }}>
        {children}
      </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);