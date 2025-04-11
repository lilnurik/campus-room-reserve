import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  UserCheck,
  Users,
  ChevronUp,
  ChevronDown,
  Building,
  Calendar,
  MessageCircleWarning,
  Clock,
  BarChart3,
  Loader2,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLayout from "@/components/PageLayout";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatTime } from "@/lib/utils";
import { parseISO, differenceInDays, differenceInMinutes, isAfter, isBefore, isToday, subDays, format } from "date-fns";

// API endpoint base
const API_BASE_URL = '/api';

// Define interfaces for data types
interface Room {
  id: string | number;
  name: string;
  building: string;
  category: string;
  capacity: number;
  status?: string;
}

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Booking {
  id: number;
  room_id: number;
  room_name: string;
  room_capacity: number;
  room_category: string;
  username: string;
  full_name: string;
  from_date: string;
  until_date: string;
  status: string;
  secret_code?: string;
  purpose?: string;
  attendees?: number;
  created_at: string;
  building?: string;
  key_given?: boolean;
  key_taken?: boolean;
}

interface Violation {
  id: number;
  booking_id: number;
  user_id: number;
  username: string;
  full_name: string;
  room_name: string;
  violation_type: string;
  description: string;
  created_at: string;
  status: string;
}

interface Stats {
  activeBookings: number;
  activeUsers: number;
  availableRooms: number;
  bookingsTrend: string;
  usersTrend: string;
  totalRooms: number;
  recentUsers: User[];
  recentBookings: Booking[];
  activeKeys: Booking[];
  violationData: Violation[];
  statistics: {
    totalBookings: number;
    activeUserCount: number;
    roomUtilization: number;
    averageBookingTime: number;
    bookingTrend: string;
    userTrend: string;
    utilizationTrend: string;
    bookingTimeTrend: string;
  };
}

// Display user-friendly names for violation types
const violationTypeNames: Record<string, string> = {
  'late_return': 'Просроченный ключ',
  'property_damage': 'Повреждение имущества',
  'rule_violation': 'Нарушение правил',
  'unauthorized_access': 'Несанкционированный доступ',
  'noise_complaint': 'Жалобы на шум'
};

// Safe date parsing helper
const safeParseISO = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null;

  try {
    const date = parseISO(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return null;
    }
    return date;
  } catch (error) {
    console.warn("Error parsing date:", dateString, error);
    return null;
  }
};

// Safe date difference calculation
const safeDifferenceInDays = (dateA: Date | null, dateB: Date | null): number => {
  if (!dateA || !dateB) return 0;
  try {
    return differenceInDays(dateA, dateB);
  } catch (error) {
    console.warn("Error calculating difference in days:", error);
    return 0;
  }
};

const safeDifferenceInMinutes = (dateA: Date | null, dateB: Date | null): number => {
  if (!dateA || !dateB) return 0;
  try {
    return differenceInMinutes(dateA, dateB);
  } catch (error) {
    console.warn("Error calculating difference in minutes:", error);
    return 0;
  }
};

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState("overview");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  // Current user and time
  const [currentUser, setCurrentUser] = useState<string>("lilnurik");
  const [currentDateTime, setCurrentDateTime] = useState<string>(format(new Date(), "yyyy-MM-dd HH:mm:ss"));

  // Filter states
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");

  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");

  const [roomSearchQuery, setRoomSearchQuery] = useState<string>("");
  const [roomBuildingFilter, setRoomBuildingFilter] = useState<string>("all");

  // Fetch all data on component mount
  useEffect(() => {
    loadAllData();

    // Update current date time
    const interval = setInterval(() => {
      setCurrentDateTime(format(new Date(), "yyyy-MM-dd HH:mm:ss"));
    }, 60000); // update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate stats whenever data changes
  useEffect(() => {
    if (rooms.length > 0 && users.length > 0 && bookings.length > 0) {
      try {
        calculateStats();
      } catch (error) {
        console.error("Error calculating stats:", error);
        setError("Ошибка при расчете статистики. Пожалуйста, обновите страницу.");
      }
    }
  }, [rooms, users, bookings, violations]);

  // Load all data from the API
  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchRooms(),
        fetchUsers(),
        fetchBookings(),
        fetchViolations()
      ]);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
  };

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/admin/rooms`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Process room data to add status
      const roomsWithStatus = data.map((room: Room) => ({
        ...room,
        status: Math.random() > 0.2 ? "available" : "maintenance" // Mock status for now
      }));

      setRooms(roomsWithStatus);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      // Use dummy data if fetch fails
      const dummyRooms: Room[] = [
        { id: 1, name: "A101", building: "Главный корпус", category: "Учебная", capacity: 30, status: "available" },
        { id: 2, name: "A105", building: "Главный корпус", category: "Учебная", capacity: 25, status: "available" },
        { id: 3, name: "B201", building: "Библиотека", category: "Читальный зал", capacity: 40, status: "maintenance" },
        { id: 4, name: "B203", building: "Библиотека", category: "Конференц-зал", capacity: 15, status: "available" },
        { id: 5, name: "C305", building: "Лабораторный корпус", category: "Лаборатория", capacity: 20, status: "available" }
      ];
      setRooms(dummyRooms);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      // Use dummy data if fetch fails
      const dummyUsers: User[] = [
        { id: 1, username: "ivan", full_name: "Иван Иванов", email: "ivan@example.com", role: "student", status: "active", created_at: "2025-03-05T12:00:00" },
        { id: 2, username: "anna", full_name: "Анна Смирнова", email: "anna@example.com", role: "student", status: "active", created_at: "2025-03-06T10:00:00" },
        { id: 3, username: "petr", full_name: "Петр Сидоров", email: "petr@example.com", role: "student", status: "blocked", created_at: "2025-03-01T11:30:00" },
        { id: 201, username: "sergey", full_name: "Сергей Петров", email: "sergey@example.com", role: "security", status: "active", created_at: "2025-02-15T14:20:00" },
        { id: 301, username: "lilnurik", full_name: "Елена Волкова", email: "elena@example.com", role: "admin", status: "active", created_at: "2025-01-10T09:45:00" }
      ];
      setUsers(dummyUsers);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Process buildings if not provided and ensure dates are valid
      const processedBookings = data.map((booking: Booking) => {
        let building = "";
        if (booking.room_name && booking.room_name.includes(' - ')) {
          building = booking.room_name.split(' - ')[0];
        } else {
          building = "Основной корпус";
        }

        // Ensure dates are in proper format
        const from_date = booking.from_date || new Date().toISOString();
        const until_date = booking.until_date || new Date().toISOString();
        const created_at = booking.created_at || new Date().toISOString();

        return {
          ...booking,
          building: building,
          from_date,
          until_date,
          created_at
        };
      });

      setBookings(processedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      // Use dummy data if fetch fails
      const now = new Date();
      const dummyBookings: Booking[] = [
        {
          id: 101,
          room_id: 1,
          room_name: "A101",
          room_capacity: 30,
          room_category: "Учебная",
          username: "ivan",
          full_name: "Иван Иванов",
          from_date: format(subDays(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
          until_date: format(addHours(subDays(now, 1), 2), "yyyy-MM-dd'T'HH:mm:ss"),
          status: "confirmed",
          created_at: format(subDays(now, 2), "yyyy-MM-dd'T'HH:mm:ss"),
          building: "Главный корпус"
        },
        {
          id: 102,
          room_id: 4,
          room_name: "B203",
          room_capacity: 15,
          room_category: "Конференц-зал",
          username: "anna",
          full_name: "Анна Смирнова",
          from_date: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
          until_date: format(addHours(now, 2), "yyyy-MM-dd'T'HH:mm:ss"),
          status: "given",
          created_at: format(subDays(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
          building: "Библиотека"
        },
        {
          id: 103,
          room_id: 2,
          room_name: "A105",
          room_capacity: 25,
          room_category: "Учебная",
          username: "petr",
          full_name: "Петр Сидоров",
          from_date: format(addDays(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
          until_date: format(addHours(addDays(now, 1), 2), "yyyy-MM-dd'T'HH:mm:ss"),
          status: "pending",
          created_at: format(subDays(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
          building: "Главный корпус"
        },
        {
          id: 104,
          room_id: 5,
          room_name: "C305",
          room_capacity: 20,
          room_category: "Лаборатория",
          username: "ivan",
          full_name: "Иван Иванов",
          from_date: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
          until_date: format(addHours(now, 3), "yyyy-MM-dd'T'HH:mm:ss"),
          status: "given",
          created_at: format(subDays(now, 2), "yyyy-MM-dd'T'HH:mm:ss"),
          building: "Лабораторный корпус"
        },
        {
          id: 105,
          room_id: 3,
          room_name: "B201",
          room_capacity: 40,
          room_category: "Читальный зал",
          username: "anna",
          full_name: "Анна Смирнова",
          from_date: format(subDays(now, 5), "yyyy-MM-dd'T'HH:mm:ss"),
          until_date: format(addHours(subDays(now, 5), 2), "yyyy-MM-dd'T'HH:mm:ss"),
          status: "taken",
          created_at: format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss"),
          building: "Библиотека"
        }
      ];
      setBookings(dummyBookings);
    }
  };

  // Helper function to add hours to a date
  const addHours = (date: Date, hours: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  };

  // Helper function to add days to a date
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Fetch violations
  const fetchViolations = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Try to fetch from actual API
      try {
        const response = await fetch(`${API_BASE_URL}/admin/violations`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setViolations(data);
          return;
        }
      } catch (apiError) {
        console.warn("API endpoint for violations not available, using generated data");
      }

      // Generate mock violations if the API isn't available
      const now = new Date();
      const mockViolations: Violation[] = bookings
          .filter(b => b.status === 'given' || (b.status === 'approved' && Math.random() > 0.8))
          .slice(0, 5)
          .map((booking, index) => {
            const violationTypes = ['late_return', 'property_damage', 'rule_violation', 'unauthorized_access', 'noise_complaint'];
            const type = violationTypes[Math.floor(Math.random() * violationTypes.length)];

            let description = '';
            if (type === 'late_return') {
              const minutes = Math.floor(Math.random() * 180) + 15;
              description = `Просроченный ключ (${minutes} минут)`;
            } else {
              description = violationTypeNames[type] || 'Нарушение';
            }

            return {
              id: index + 1,
              booking_id: booking.id,
              user_id: booking.id,
              username: booking.username,
              full_name: booking.full_name,
              room_name: booking.room_name,
              violation_type: type,
              description: description,
              created_at: format(subDays(now, Math.floor(Math.random() * 5)), "yyyy-MM-dd'T'HH:mm:ss"),
              status: Math.random() > 0.3 ? 'pending' : 'resolved'
            };
          });

      setViolations(mockViolations);
    } catch (err) {
      console.error("Error fetching violations:", err);
      // Don't throw here so other data can still load
      setViolations([]);
    }
  };

  // Calculate all statistics from the loaded data
  const calculateStats = () => {
    const now = new Date();

    // Active bookings (approved or given today)
    const activeBookings = bookings.filter(b => {
      const fromDate = safeParseISO(b.from_date);
      const untilDate = safeParseISO(b.until_date);
      return (b.status === 'approved' || b.status === 'given') &&
          fromDate && untilDate &&
          isAfter(now, fromDate) &&
          isBefore(now, untilDate);
    });

    // Active users (users with active bookings + recently active)
    const usersWithActiveBookings = new Set(activeBookings.map(b => b.username));
    const recentlyActiveUsers = users.filter(u => {
      const createdDate = safeParseISO(u.created_at);
      return createdDate && safeDifferenceInDays(now, createdDate) < 30;
    });
    const activeUsernames = recentlyActiveUsers.map(u => u.username);
    const activeUsers = new Set([
      ...usersWithActiveBookings,
      ...activeUsernames
    ]);

    // Available rooms (total rooms minus rooms with active bookings)
    const roomsWithActiveBookings = new Set(activeBookings.map(b => b.room_id));
    const availableRooms = rooms.filter(r =>
        !roomsWithActiveBookings.has(r.id) && r.status !== 'maintenance'
    );

    // Active violations
    const activeViolations = violations.filter(v => v.status === 'pending');

    // Calculate trends - with safer date parsing
    const lastWeekBookings = bookings.filter(b => {
      const createdDate = safeParseISO(b.created_at);
      return createdDate && safeDifferenceInDays(now, createdDate) <= 7;
    });

    const previousWeekBookings = bookings.filter(b => {
      const createdDate = safeParseISO(b.created_at);
      return createdDate &&
          safeDifferenceInDays(now, createdDate) > 7 &&
          safeDifferenceInDays(now, createdDate) <= 14;
    });

    const bookingsTrend = lastWeekBookings.length > previousWeekBookings.length ? 'up' : 'down';
    const bookingTrendPercent = previousWeekBookings.length > 0
        ? Math.round((lastWeekBookings.length - previousWeekBookings.length) / previousWeekBookings.length * 100)
        : 0;

    // Users trend
    const lastWeekUsers = new Set(lastWeekBookings.map(b => b.username));
    const previousWeekUsers = new Set(previousWeekBookings.map(b => b.username));
    const usersTrend = lastWeekUsers.size > previousWeekUsers.size ? 'up' : 'down';
    const userTrendPercent = previousWeekUsers.size > 0
        ? Math.round((lastWeekUsers.size - previousWeekUsers.size) / previousWeekUsers.size * 100)
        : 0;

    // Recent users (created in the last week)
    const recentUsers = users
        .filter(u => {
          const createdDate = safeParseISO(u.created_at);
          return createdDate && safeDifferenceInDays(now, createdDate) <= 7;
        })
        .sort((a, b) => {
          const dateA = safeParseISO(a.created_at);
          const dateB = safeParseISO(b.created_at);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3);

    // Recent bookings
    const recentBookings = bookings
        .sort((a, b) => {
          const dateA = safeParseISO(a.created_at);
          const dateB = safeParseISO(b.created_at);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 4);

    // Active keys
    const activeKeys = bookings
        .filter(b => b.status === 'given' && !b.key_taken)
        .sort((a, b) => {
          const dateA = safeParseISO(a.from_date);
          const dateB = safeParseISO(b.from_date);
          if (!dateA || !dateB) return 0;
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 4);

    // Calculate room utilization percentage
    const roomUtilization = Math.round((roomsWithActiveBookings.size / (rooms.length || 1)) * 100);

    // Calculate average booking duration in hours
    const completedBookings = bookings.filter(b => b.status === 'taken' || b.status === 'completed');
    let totalDuration = 0;
    let validBookingCount = 0;

    completedBookings.forEach(booking => {
      const start = safeParseISO(booking.from_date);
      const end = safeParseISO(booking.until_date);
      if (start && end) {
        const durationMinutes = safeDifferenceInMinutes(end, start);
        totalDuration += durationMinutes;
        validBookingCount++;
      }
    });

    const averageBookingHours = validBookingCount > 0
        ? (totalDuration / validBookingCount / 60).toFixed(1)
        : "0.0";

    // Calculate booking time trend
    const lastWeekAvgDuration = calculateAverageDuration(lastWeekBookings);
    const previousWeekAvgDuration = calculateAverageDuration(previousWeekBookings);

    const bookingTimeTrend = lastWeekAvgDuration > previousWeekAvgDuration ? 'up' : 'down';
    const bookingTimeTrendPercent = previousWeekAvgDuration > 0
        ? Math.round((lastWeekAvgDuration - previousWeekAvgDuration) / previousWeekAvgDuration * 100)
        : 0;

    // Calculate room utilization trend
    const lastWeekUtilization = lastWeekBookings.length / (rooms.length * 7 || 1); // prevent division by zero
    const previousWeekUtilization = previousWeekBookings.length / (rooms.length * 7 || 1);

    const utilizationTrend = lastWeekUtilization > previousWeekUtilization ? 'up' : 'down';
    const utilizationTrendPercent = previousWeekUtilization > 0
        ? Math.round((lastWeekUtilization - previousWeekUtilization) / previousWeekUtilization * 100)
        : 0;

    // Set all calculated statistics
    setStats({
      activeBookings: activeBookings.length,
      activeUsers: activeUsers.size,
      availableRooms: availableRooms.length,
      violations: activeViolations.length,
      bookingsTrend: `${bookingTrendPercent > 0 ? '+' : ''}${bookingTrendPercent}%`,
      usersTrend: `${userTrendPercent > 0 ? '+' : ''}${userTrendPercent}%`,
      totalRooms: rooms.length,
      recentUsers,
      recentBookings,
      activeKeys,
      violationData: activeViolations.sort((a, b) => {
        const dateA = safeParseISO(a.created_at);
        const dateB = safeParseISO(b.created_at);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 3),
      statistics: {
        totalBookings: bookings.length,
        activeUserCount: activeUsers.size,
        roomUtilization: roomUtilization,
        averageBookingTime: parseFloat(averageBookingHours),
        bookingTrend: `${bookingTrendPercent > 0 ? '+' : ''}${bookingTrendPercent}%`,
        userTrend: `${userTrendPercent > 0 ? '+' : ''}${userTrendPercent}%`,
        utilizationTrend: `${utilizationTrendPercent > 0 ? '+' : ''}${utilizationTrendPercent}%`,
        bookingTimeTrend: `${bookingTimeTrendPercent > 0 ? '+' : ''}${bookingTimeTrendPercent}%`
      }
    });
  };

  // Helper function to calculate average duration for a set of bookings
  const calculateAverageDuration = (bookings: Booking[]) => {
    if (bookings.length === 0) return 0;

    let totalDuration = 0;
    let validBookingCount = 0;

    bookings.forEach(booking => {
      const start = safeParseISO(booking.from_date);
      const end = safeParseISO(booking.until_date);
      if (start && end) {
        const durationMinutes = safeDifferenceInMinutes(end, start);
        totalDuration += durationMinutes;
        validBookingCount++;
      }
    });

    return validBookingCount > 0 ? totalDuration / validBookingCount / 60 : 0; // average in hours
  };

  // Filter bookings for the bookings tab
  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      // Apply search filter
      const matchesSearch = bookingSearchQuery
          ? booking.room_name.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
          booking.full_name.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
          booking.username.toLowerCase().includes(bookingSearchQuery.toLowerCase())
          : true;

      // Apply status filter
      const matchesStatus = bookingStatusFilter === "all" || booking.status === bookingStatusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  // Filter users for the users tab
  const getFilteredUsers = () => {
    return users.filter(user => {
      // Apply search filter
      const matchesSearch = userSearchQuery
          ? user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
          : true;

      // Apply role filter
      const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  };

  // Filter rooms for the rooms tab
  const getFilteredRooms = () => {
    return rooms.filter(room => {
      // Apply search filter
      const matchesSearch = roomSearchQuery
          ? room.name.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
          room.category.toLowerCase().includes(roomSearchQuery.toLowerCase())
          : true;

      // Apply building filter
      const matchesBuilding = roomBuildingFilter === "all" || room.building === roomBuildingFilter;

      return matchesSearch && matchesBuilding;
    });
  };

  // Get unique buildings from rooms
  const getUniqueBuildings = () => {
    const uniqueBuildings = new Set(rooms.map(room => room.building));
    return Array.from(uniqueBuildings);
  };

  // Handle booking operations
  const handleApproveBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update local state
      setBookings(prevBookings =>
          prevBookings.map(booking =>
              booking.id === bookingId ? { ...booking, status: 'approved' } : booking
          )
      );

      // Recalculate stats
      calculateStats();

    } catch (err) {
      console.error("Error approving booking:", err);
      // Show error message
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update local state
      setBookings(prevBookings =>
          prevBookings.map(booking =>
              booking.id === bookingId ? { ...booking, status: 'rejected' } : booking
          )
      );

      // Recalculate stats
      calculateStats();

    } catch (err) {
      console.error("Error rejecting booking:", err);
      // Show error message
    }
  };

  return (
      <PageLayout role="admin">
        <div className="space-y-6">
          {/* Header and current user info */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Административная панель</h1>
              <p className="text-muted-foreground">
                Управление бронированиями, пользователями и помещениями
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Администратор: {currentUser}</div>
              <div>{currentDateTime}</div>
            </div>
          </div>

          {/* Refresh button */}
          <div className="flex justify-end">
            <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Обновить данные
            </Button>
          </div>

          {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Загрузка данных...</span>
              </div>
          ) : error ? (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                <p>{error}</p>
                <Button variant="outline" className="mt-2" onClick={loadAllData}>
                  Повторить запрос
                </Button>
              </div>
          ) : (
              <>
                {/* Overview Cards */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Активные брони</p>
                              <p className="text-3xl font-bold">{stats.activeBookings}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <div className="mt-4 flex items-center text-xs">
                            {stats.bookingsTrend.startsWith('+') ? (
                                <div className="flex items-center text-green-600">
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  <span>{stats.bookingsTrend}</span>
                                  <span className="text-muted-foreground ml-1">чем на прошлой неделе</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  <span>{stats.bookingsTrend}</span>
                                  <span className="text-muted-foreground ml-1">чем на прошлой неделе</span>
                                </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Активные пользователи</p>
                              <p className="text-3xl font-bold">{stats.activeUsers}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <div className="mt-4 flex items-center text-xs">
                            {stats.usersTrend.startsWith('+') ? (
                                <div className="flex items-center text-green-600">
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  <span>{stats.usersTrend}</span>
                                  <span className="text-muted-foreground ml-1">чем в прошлом месяце</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  <span>{stats.usersTrend}</span>
                                  <span className="text-muted-foreground ml-1">чем в прошлом месяце</span>
                                </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Доступные комнаты</p>
                              <p className="text-3xl font-bold">{stats.availableRooms}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Building className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <div className="mt-4 flex items-center text-xs">
                            <span className="text-muted-foreground">из {stats.totalRooms} комнат</span>
                          </div>
                        </CardContent>
                      </Card>


                    </div>
                )}

                {/* Main Content Tabs */}
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="bookings">Бронирования</TabsTrigger>
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                    <TabsTrigger value="rooms">Помещения</TabsTrigger>
                    <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    {stats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Recent Bookings */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Последние бронирования
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Комната</TableHead>
                                    <TableHead>Студент</TableHead>
                                    <TableHead>Дата</TableHead>
                                    <TableHead>Статус</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {stats.recentBookings.length > 0 ? (
                                      stats.recentBookings.map((booking) => (
                                          <TableRow key={booking.id}>
                                            <TableCell>{booking.room_name}</TableCell>
                                            <TableCell>{booking.full_name}</TableCell>
                                            <TableCell>{formatDate(booking.from_date)}</TableCell>
                                            <TableCell>
                                              <StatusBadge status={booking.status} />
                                            </TableCell>
                                          </TableRow>
                                      ))
                                  ) : (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                          Нет недавних бронирований
                                        </TableCell>
                                      </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                              <div className="mt-4 flex justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentTab("bookings")}
                                >
                                  Показать все
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Key Status */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Статус ключей
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Ключ</TableHead>
                                    <TableHead>Взят</TableHead>
                                    <TableHead>Студент</TableHead>
                                    <TableHead>Статус</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {stats.activeKeys.length > 0 ? (
                                      stats.activeKeys.map((key) => {
                                        const now = new Date();
                                        const endTime = safeParseISO(key.until_date);
                                        const isOverdue = endTime && now > endTime;

                                        return (
                                            <TableRow key={key.id}>
                                              <TableCell>{key.room_name}</TableCell>
                                              <TableCell>{formatTime(key.from_date)}</TableCell>
                                              <TableCell>{key.full_name}</TableCell>
                                              <TableCell>
                                                <StatusBadge status={isOverdue ? "overdue" : "confirmed"} />
                                              </TableCell>
                                            </TableRow>
                                        );
                                      })
                                  ) : (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                          Нет выданных ключей
                                        </TableCell>
                                      </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>

                          {/* New Accounts */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-primary" />
                                Новые пользователи
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {stats.recentUsers.length > 0 ? (
                                    stats.recentUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                          <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                              <UserCheck className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                              <p className="font-medium">{user.full_name}</p>
                                              <p className="text-xs text-muted-foreground">{formatDate(user.created_at)}</p>
                                            </div>
                                          </div>
                                          <span className="text-xs rounded-full px-2 py-1 bg-secondary">
                                  {user.role === "student" ? "Студент" :
                                      user.role === "security" ? "Охранник" : "Администратор"}
                                </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                      Нет новых пользователей за последнюю неделю
                                    </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>


                        </div>
                    )}
                  </TabsContent>

                  <TabsContent value="bookings">
                    <Card>
                      <CardHeader>
                        <CardTitle>Управление бронированиями</CardTitle>
                        <CardDescription>
                          Просмотр и управление всеми бронированиями в системе
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Поиск по комнате или студенту..."
                                className="pl-8"
                                value={bookingSearchQuery}
                                onChange={(e) => setBookingSearchQuery(e.target.value)}
                            />
                          </div>

                          <Select
                              value={bookingStatusFilter}
                              onValueChange={setBookingStatusFilter}
                          >
                            <SelectTrigger className="w-[180px]">
                              <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Статус" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Все статусы</SelectItem>
                              <SelectItem value="pending">Ожидающие</SelectItem>
                              <SelectItem value="approved">Подтвержденные</SelectItem>
                              <SelectItem value="rejected">Отклоненные</SelectItem>
                              <SelectItem value="given">Ключ выдан</SelectItem>
                              <SelectItem value="taken">Завершенные</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Комната</TableHead>
                                <TableHead>Студент</TableHead>
                                <TableHead>Дата</TableHead>
                                <TableHead>Время</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Действия</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getFilteredBookings().length > 0 ? (
                                  getFilteredBookings().slice(0, 10).map((booking) => (
                                      <TableRow key={booking.id}>
                                        <TableCell>{booking.id}</TableCell>
                                        <TableCell>{booking.room_name}</TableCell>
                                        <TableCell>{booking.full_name}</TableCell>
                                        <TableCell>{formatDate(booking.from_date)}</TableCell>
                                        <TableCell>{formatTime(booking.from_date)} - {formatTime(booking.until_date)}</TableCell>
                                        <TableCell>
                                          <StatusBadge status={booking.status} />
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex gap-2">
                                            {booking.status === "pending" && (
                                                <>
                                                  <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => handleApproveBooking(booking.id)}
                                                  >
                                                    Подтвердить
                                                  </Button>
                                                  <Button
                                                      size="sm"
                                                      variant="outline"
                                                      className="text-red-600 hover:text-red-700"
                                                      onClick={() => handleRejectBooking(booking.id)}
                                                  >
                                                    Отклонить
                                                  </Button>
                                                </>
                                            )}
                                            {booking.status === "approved" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleRejectBooking(booking.id)}
                                                >
                                                  Отменить
                                                </Button>
                                            )}
                                            {(booking.status === "given" || booking.status === "taken") && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                  Детали
                                                </Button>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                  ))
                              ) : (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">
                                      <div className="text-muted-foreground">
                                        Бронирования не найдены
                                      </div>
                                    </TableCell>
                                  </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="users">
                    <Card>
                      <CardHeader>
                        <CardTitle>Управление пользователями</CardTitle>
                        <CardDescription>
                          Просмотр и управление пользователями системы
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Поиск по имени или email..."
                                className="pl-8"
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                            />
                          </div>

                          <Select
                              value={userRoleFilter}
                              onValueChange={setUserRoleFilter}
                          >
                            <SelectTrigger className="w-[180px]">
                              <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Роль" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Все роли</SelectItem>
                              <SelectItem value="student">Студенты</SelectItem>
                              <SelectItem value="security">Охранники</SelectItem>
                              <SelectItem value="admin">Администраторы</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Имя</TableHead>
                                <TableHead>Логин</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Роль</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Действия</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getFilteredUsers().length > 0 ? (
                                  getFilteredUsers().slice(0, 10).map((user) => (
                                      <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.full_name}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                          {user.role === "student" ? "Студент" :
                                              user.role === "security" ? "Охранник" : "Администратор"}
                                        </TableCell>
                                        <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                      user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}>
                                    {user.status === "active" ? "Активен" : "Заблокирован"}
                                  </span>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex gap-2">
                                            <Button size="sm" variant="outline">Редактировать</Button>
                                            {user.status === "active" ? (
                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                  Блокировать
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                                                  Разблокировать
                                                </Button>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                  ))
                              ) : (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">
                                      <div className="text-muted-foreground">
                                        Пользователи не найдены
                                      </div>
                                    </TableCell>
                                  </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="rooms">
                    <Card>
                      <CardHeader>
                        <CardTitle>Управление помещениями</CardTitle>
                        <CardDescription>
                          Просмотр и управление помещениями университета
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Поиск по названию или типу..."
                                className="pl-8"
                                value={roomSearchQuery}
                                onChange={(e) => setRoomSearchQuery(e.target.value)}
                            />
                          </div>

                          <Select
                              value={roomBuildingFilter}
                              onValueChange={setRoomBuildingFilter}
                          >
                            <SelectTrigger className="w-[180px]">
                              <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Здание" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Все здания</SelectItem>
                              {getUniqueBuildings().map(building => (
                                  <SelectItem key={building} value={building}>{building}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Комната</TableHead>
                                <TableHead>Здание</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead>Вместимость</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Действия</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getFilteredRooms().length > 0 ? (
                                  getFilteredRooms().slice(0, 10).map((room) => (
                                      <TableRow key={room.id}>
                                        <TableCell>{room.name}</TableCell>
                                        <TableCell>{room.building}</TableCell>
                                        <TableCell>{room.category}</TableCell>
                                        <TableCell>{room.capacity}</TableCell>
                                        <TableCell>
                                          <StatusBadge status={room.status || 'available'} />
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex gap-2">
                                            <Button size="sm" variant="outline">Расписание</Button>
                                            {room.status === "available" ? (

                                              <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700">
                                              На обслуживание
                                              </Button>
                                              ) : (
                                              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                                              Включить
                                              </Button>
                                              )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                  ))
                              ) : (
                                  <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                      <div className="text-muted-foreground">
                                        Помещения не найдены
                                      </div>
                                    </TableCell>
                                  </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Аналитика использования</CardTitle>
                          <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardDescription>
                          Статистика использования системы бронирования
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {stats && (
                            <>
                              <div className="flex justify-center items-center h-64 bg-muted/20 rounded-md">
                                <p className="text-center text-muted-foreground">
                                  Здесь будет отображаться графическая аналитика <br/>
                                  Требуется добавление компонента графиков
                                </p>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                <Card>
                                  <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Всего бронирований</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-2xl font-bold">{stats.statistics.totalBookings}</p>
                                      <span className={`text-xs ${
                                          stats.statistics.bookingTrend.startsWith("+") ? "text-green-600" : "text-red-600"
                                      }`}>
                                {stats.statistics.bookingTrend}
                              </span>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Активные пользователи</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-2xl font-bold">{stats.statistics.activeUserCount}</p>
                                      <span className={`text-xs ${
                                          stats.statistics.userTrend.startsWith("+") ? "text-green-600" : "text-red-600"
                                      }`}>
                                {stats.statistics.userTrend}
                              </span>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Загруженность комнат</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-2xl font-bold">{stats.statistics.roomUtilization}%</p>
                                      <span className={`text-xs ${
                                          stats.statistics.utilizationTrend.startsWith("+") ? "text-green-600" : "text-red-600"
                                      }`}>
                                {stats.statistics.utilizationTrend}
                              </span>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Среднее время брони</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-2xl font-bold">{stats.statistics.averageBookingTime}ч</p>
                                      <span className={`text-xs ${
                                          stats.statistics.bookingTimeTrend.startsWith("+") ? "text-green-600" : "text-red-600"
                                      }`}>
                                {stats.statistics.bookingTimeTrend}
                              </span>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Additional analytics cards could go here */}
                                <Card className="col-span-2 sm:col-span-4">
                                  <CardContent className="p-4">
                                    <h3 className="font-medium mb-2">Самые популярные аудитории</h3>
                                    <div className="space-y-2">
                                      {rooms.slice(0, 3).map((room, index) => {
                                        const bookingsCount = bookings.filter(b => b.room_id === room.id).length;
                                        const percentage = rooms.length > 0 ? Math.round((bookingsCount / bookings.length) * 100) : 0;

                                        return (
                                            <div key={room.id} className="flex items-center gap-2">
                                              <div className="font-medium text-sm min-w-[100px]">{room.name}</div>
                                              <div className="flex-1 bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-primary rounded-full h-2"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                              </div>
                                              <div className="text-xs text-muted-foreground min-w-[40px] text-right">
                                                {percentage}%
                                              </div>
                                            </div>
                                        );
                                      })}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* System status and health section */}
                              <div className="mt-8">
                                <h3 className="font-medium mb-4">Системная информация</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="bg-muted/20 p-4 rounded-md">
                                    <p className="text-sm text-muted-foreground">Текущее время</p>
                                    <p className="font-mono text-sm mt-1">{currentDateTime}</p>
                                  </div>
                                  <div className="bg-muted/20 p-4 rounded-md">
                                    <p className="text-sm text-muted-foreground">Текущий пользователь</p>
                                    <p className="font-mono text-sm mt-1">{currentUser}</p>
                                  </div>
                                  <div className="bg-muted/20 p-4 rounded-md">
                                    <p className="text-sm text-muted-foreground">База данных</p>
                                    <p className="font-mono text-sm mt-1 text-green-600">Подключена</p>
                                  </div>
                                  <div className="bg-muted/20 p-4 rounded-md">
                                    <p className="text-sm text-muted-foreground">Последнее обновление</p>
                                    <p className="font-mono text-sm mt-1">
                                      {isRefreshing ? "Обновляется..." : (
                                          new Date().toLocaleTimeString("ru-RU", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                          })
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
          )}


        </div>
      </PageLayout>
  );
};

export default AdminDashboard;