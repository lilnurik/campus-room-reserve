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

  // Add or update this function in your BookingContext.tsx
  const addRoom = async (roomData: Room): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Call the API to create the room
      const response = await roomsApi.createRoom(roomData);

      if (response.success) {
        // Add the created room to local state with the new ID
        const newRoom = {
          ...roomData,
          id: response.data?.id.toString() || roomData.id // Use returned ID or fallback
        };

        setRooms(prevRooms => [...prevRooms, newRoom]);
        toast.success(t('rooms.addSuccess'));
        return true;
      } else {
        toast.error(response.error || t('rooms.addError'));
        return false;
      }
    } catch (error) {
      console.error("Error adding room:", error);
      toast.error(t('rooms.addError'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add this to your existing BookingContext methods

  const updateRoom = async (roomId: string, roomData: Room): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Format the data to match backend expectations
      const formattedData = {
        name: roomData.name,
        category: roomData.type, // Map type to category as the API expects
        capacity: roomData.capacity,
        status: roomData.status
      };

      const response = await roomsApi.updateRoom(roomId, formattedData);

      if (response.success) {
        // Update the room in the local state
        setRooms(prevRooms =>
            prevRooms.map(room => room.id === roomId ? { ...room, ...roomData } : room)
        );
        toast.success(t('rooms.updateSuccess'));
        return true;
      } else {
        toast.error(response.error || t('rooms.updateError'));
        return false;
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error(t('rooms.updateError'));
      return false;
    } finally {
      setIsLoading(false);
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
        updateRoom,
        // Other methods...
      }}>
        {children}
      </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);