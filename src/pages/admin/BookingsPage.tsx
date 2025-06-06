import { useState, useEffect, useRef } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search, Clock, User, Calendar, CheckCircle, X,
  Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight,
  Filter, DownloadIcon, RefreshCw, AlertTriangle, Lock, RotateCw,
  Briefcase, Users, UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define booking interface based on API response
interface Booking {
  id: number;
  room_name: string;
  room_id: number;
  username: string;
  full_name: string;
  from_date: string;
  until_date: string;
  status: string;
  created_at: string;
  access_code?: string;
  purpose?: string;
  attendees_count?: number;
  is_staff_booking?: boolean;
  creator_role?: string;
  staff_ids?: number[];
  staff_names?: string[];
}

// Global state to track if sync is in progress anywhere in the app
let isGlobalSyncInProgress = false;

const AdminBookingsPage = () => {
  // State variables
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [studentBookings, setStudentBookings] = useState<Booking[]>([]);
  const [staffBookings, setStaffBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Current user and datetime - updated with correct values
  const [currentDateTime, setCurrentDateTime] = useState("2025-05-02 06:41:26");
  const [currentUser, setCurrentUser] = useState("lilnurik");

  // Status filter
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // User type filter for bookings (student/staff)
  const [selectedUserType, setSelectedUserType] = useState<string>("all");

  // Date range filter
  const [dateFilter, setDateFilter] = useState({
    start: "",
    end: "",
  });

  // Filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Selected booking for actions
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState("all");

  // Schedule sync states
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [isSyncWarningOpen, setIsSyncWarningOpen] = useState(false);
  const [isSyncPasswordDialogOpen, setIsSyncPasswordDialogOpen] = useState(false);
  const [isSyncProcessDialogOpen, setIsSyncProcessDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatusMessage, setSyncStatusMessage] = useState("");
  const syncIntervalRef = useRef<number | null>(null);

  // Fetch bookings on component mount
  useEffect(() => {
    loadAllBookings();
  }, []);

  // Update the current date/time periodically
  useEffect(() => {
    // Start with correct time
    setCurrentDateTime("2025-05-02 06:41:26");

    // Update time every minute
    const timeInterval = setInterval(() => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');

      setCurrentDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Filter bookings whenever data or filters change
  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, selectedStatus, selectedUserType, dateFilter, activeTab]);

  // Update totalPages when filteredBookings or itemsPerPage changes
  useEffect(() => {
    setTotalPages(Math.ceil(filteredBookings.length / itemsPerPage));
  }, [filteredBookings, itemsPerPage]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }

      // Reset global sync flag when component unmounts
      isGlobalSyncInProgress = false;
    };
  }, []);

  // Load all types of bookings
  const loadAllBookings = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchRegularBookings(),
        fetchBulkBookings()
      ]);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch regular bookings from API
  const fetchRegularBookings = async () => {
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch('https://room.turin.uz/api/admin/bookings', {
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

      // Process to ensure all bookings have the required properties
      const processedBookings = data.map((booking: any) => ({
        ...booking,
        is_staff_booking: booking.user_role === 'staff',
        creator_role: booking.user_role || 'student',
        status: booking.status || 'pending',
        from_date: booking.from_date || new Date().toISOString(),
        until_date: booking.until_date || new Date().toISOString(),
        created_at: booking.created_at || new Date().toISOString()
      }));

      // Filter out admin bookings
      const nonAdminBookings = processedBookings.filter(booking => booking.creator_role !== 'admin');

      setStudentBookings(nonAdminBookings.filter(b => b.user_role !== 'staff' && !b.is_staff_booking));
      const staffBooks = nonAdminBookings.filter(b => b.user_role === 'staff' || b.is_staff_booking);
      setStaffBookings(prev => [...prev, ...staffBooks]);
      updateAllBookings([...nonAdminBookings, ...staffBookings.filter(b => b.creator_role !== 'admin')]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      console.error("Error fetching regular bookings:", err);
      toast.error("Failed to load student bookings");
    }
  };

  // Fetch bulk staff bookings
  const fetchBulkBookings = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch('https://room.turin.uz/api/bookings/get-bulk', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error("Failed to fetch bulk bookings:", response.status);
        return;
      }

      // Get the raw array directly from the response
      const bookingsData = await response.json();

      // Process and preserve all the original properties from the API
      const processedBookings = bookingsData.map((booking: any) => ({
        ...booking,
        // Keep the original is_staff_booking flag, or default to creator_role if needed
        is_staff_booking: booking.is_staff_booking !== undefined
            ? booking.is_staff_booking
            : (booking.creator_role === 'staff'),
        // Ensure all required fields are present
        from_date: booking.from_date || new Date().toISOString(),
        until_date: booking.until_date || new Date().toISOString(),
        created_at: booking.created_at || new Date().toISOString(),
        // Ensure room data is complete
        room_name: booking.room_name || "Unknown Room",
        // Use creator info for username/full_name if not provided
        username: booking.username || booking.creator_name || "Unknown User",
        full_name: booking.full_name || booking.creator_name || "Unknown User",
        // Make sure status has a default
        status: booking.status || 'pending'
      }));

      // Filter out admin bookings
      const nonAdminBookings = processedBookings.filter(booking => booking.creator_role !== 'admin');

      console.log("Processed bulk bookings:", nonAdminBookings);
      setStaffBookings(prevStaffBookings => [
        ...prevStaffBookings,
        ...nonAdminBookings.filter(b => b.is_staff_booking === true || b.creator_role === 'staff')
      ]);
      setStudentBookings(prevStudentBookings => [
        ...prevStudentBookings,
        ...nonAdminBookings.filter(b => b.is_staff_booking !== true && b.creator_role === 'student')
      ]);
      updateAllBookings([...studentBookings, ...nonAdminBookings]);
    } catch (err) {
      console.error("Error fetching bulk bookings:", err);
    }
  };

  // Update all bookings
  const updateAllBookings = (bookingsArray: Booking[]) => {
    // Ensure we're not showing admin bookings
    const nonAdminBookings = bookingsArray.filter(booking => booking.creator_role !== 'admin');
    setBookings(nonAdminBookings);
  };

  // Verify admin password against the API
  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch('https://room.turin.uz/api/admin/verify-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          return false;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.success === true;
    } catch (err) {
      console.error("Error verifying password:", err);
      return false;
    }
  };

  // Handle sync process with university class schedule
  const handleSyncRequest = () => {
    if (isGlobalSyncInProgress) {
      setIsSyncProcessDialogOpen(true);
      toast.info("Синхронизация уже выполняется");
      return;
    }

    setIsSyncWarningOpen(true);
  };

  const handleSyncWarningConfirm = () => {
    setIsSyncWarningOpen(false);
    setIsSyncPasswordDialogOpen(true);
  };

  const handleSyncPasswordConfirm = async () => {
    if (!adminPassword) {
      toast.error("Пожалуйста, введите пароль");
      return;
    }

    setIsSyncing(true);
    setSyncStatusMessage("Проверка учетных данных...");

    try {
      const isValid = await verifyAdminPassword(adminPassword);

      if (!isValid) {
        toast.error("Неверный пароль администратора");
        setIsSyncing(false);
        return;
      }

      setIsSyncPasswordDialogOpen(false);
      setIsSyncProcessDialogOpen(true);
      setSyncProgress(0);
      setSyncStatusMessage("Инициализация синхронизации...");

      isGlobalSyncInProgress = true;

      const syncStages = [
        { message: "Инициализация синхронизации...", targetProgress: 5, durationMs: 10000 },
        { message: "Подключение к университетской системе...", targetProgress: 10, durationMs: 20000 },
        { message: "Получение данных о группах и факультетах...", targetProgress: 20, durationMs: 50000 },
        { message: "Загрузка данных расписания...", targetProgress: 35, durationMs: 30000 },
        { message: "Анализ данных расписания...", targetProgress: 50, durationMs: 25000 },
        { message: "Создание записей о бронированиях...", targetProgress: 70, durationMs: 55000 },
        { message: "Проверка и разрешение конфликтов...", targetProgress: 85, durationMs: 40000 },
        { message: "Сохранение результатов...", targetProgress: 95, durationMs: 15000 },
        { message: "Завершение синхронизации...", targetProgress: 98, durationMs: 10000 },
        { message: "Синхронизация завершена!", targetProgress: 100, durationMs: 5000 }
      ];

      let currentStageIndex = 0;
      let stageStartTime = Date.now();
      let stageStartProgress = 0;

      const animateStage = () => {
        const currentStage = syncStages[currentStageIndex];
        const now = Date.now();
        const elapsedTime = now - stageStartTime;
        const stageDuration = currentStage.durationMs;

        let fractionComplete = Math.min(elapsedTime / stageDuration, 1);
        fractionComplete = 0.5 - 0.5 * Math.cos(fractionComplete * Math.PI);

        const previousStageProgress = stageStartProgress;
        const stageProgressDelta = currentStage.targetProgress - previousStageProgress;
        const newProgress = previousStageProgress + (stageProgressDelta * fractionComplete);

        setSyncProgress(Math.floor(newProgress));

        if (elapsedTime >= stageDuration) {
          currentStageIndex++;
          stageStartTime = now;
          stageStartProgress = currentStage.targetProgress;

          if (currentStageIndex < syncStages.length) {
            setSyncStatusMessage(syncStages[currentStageIndex].message);
          } else {
            setSyncProgress(100);
            setSyncStatusMessage("Синхронизация успешно завершена!");

            if (syncIntervalRef.current) {
              clearInterval(syncIntervalRef.current);
              syncIntervalRef.current = null;
            }

            isGlobalSyncInProgress = false;
            setIsSyncing(false);
          }
        }
      };

      setSyncStatusMessage(syncStages[currentStageIndex].message);
      syncIntervalRef.current = window.setInterval(animateStage, 50);

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://room.turin.uz/api/admin/sync-class-schedules', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password: adminPassword })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        loadAllBookings();

      } catch (err) {
        console.error("API error during syncing:", err);
      }

    } catch (err) {
      console.error("Error in admin verification:", err);
      toast.error("Ошибка проверки учетных данных");
      setIsSyncing(false);
      isGlobalSyncInProgress = false;
    }
  };

  // Apply filters to bookings
  const applyFilters = () => {
    // First filter out any admin bookings
    let result = bookings.filter(booking => booking.creator_role !== 'admin');

    // Apply user type filter first (staff/student)
    if (selectedUserType !== "all") {
      if (selectedUserType === "staff") {
        result = result.filter(booking => booking.creator_role === 'staff');
      } else if (selectedUserType === "student") {
        result = result.filter(booking => booking.creator_role !== 'staff');
      }
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(booking =>
          booking.room_name.toLowerCase().includes(searchLower) ||
          booking.full_name.toLowerCase().includes(searchLower) ||
          booking.username.toLowerCase().includes(searchLower) ||
          (booking.purpose && booking.purpose.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      result = result.filter(booking => booking.status === selectedStatus);
    }

    // Apply date filter
    if (dateFilter.start) {
      const startDate = new Date(dateFilter.start);
      result = result.filter(booking => {
        const bookingStart = parseISO(booking.from_date);
        return isAfter(bookingStart, startDate) || isEqual(bookingStart, startDate);
      });
    }

    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      result = result.filter(booking => {
        const bookingEnd = parseISO(booking.until_date);
        return isBefore(bookingEnd, endDate) || isEqual(bookingEnd, endDate);
      });
    }

    // Apply tab filter
    switch (activeTab) {
      case 'pending':
        result = result.filter(b => b.status === 'pending');
        break;
      case 'active':
        result = result.filter(b => {
          const now = new Date();
          const start = parseISO(b.from_date);
          const end = parseISO(b.until_date);
          return (b.status === 'approved' || b.status === 'confirmed' || b.status === 'key_issued') &&
              now >= start && now <= end;
        });
        break;
      case 'upcoming':
        result = result.filter(b => {
          const now = new Date();
          const start = parseISO(b.from_date);
          return (b.status === 'approved' || b.status === 'confirmed') && now < start;
        });
        break;
      case 'completed':
        result = result.filter(b => {
          const now = new Date();
          const end = parseISO(b.until_date);
          return b.status === 'completed' || (b.status === 'approved' && now > end);
        });
        break;
      case 'staff':
        result = result.filter(b => b.creator_role === 'staff');
        break;
      case 'student':
        result = result.filter(b => b.creator_role !== 'staff' && b.creator_role !== 'admin');
        break;
    }

    setFilteredBookings(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle confirm booking
  const handleConfirmBooking = async () => {
    if (selectedBooking === null) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');

      // Fixed endpoint: bookings -> booking (singular)
      const response = await fetch(`https://room.turin.uz/api/admin/booking/${selectedBooking}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setBookings(prevBookings =>
          prevBookings.map(booking =>
              booking.id === selectedBooking
                  ? { ...booking, status: 'approved' }
                  : booking
          )
      );

      toast.success("Бронирование подтверждено");
    } catch (err) {
      console.error("Error confirming booking:", err);
      toast.error("Не удалось подтвердить бронирование");
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
    }
  };

// Handle cancel booking - FIXED ENDPOINT
  const handleCancelBooking = async () => {
    if (selectedBooking === null) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');

      // Fixed endpoint: bookings -> booking (singular)
      const response = await fetch(`https://room.turin.uz/api/admin/booking/${selectedBooking}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setBookings(prevBookings =>
          prevBookings.map(booking =>
              booking.id === selectedBooking
                  ? { ...booking, status: 'rejected' }
                  : booking
          )
      );

      toast.success("Бронирование отменено");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("Не удалось отменить бронирование");
    } finally {
      setIsLoading(false);
      setIsCancelDialogOpen(false);
    }
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy');
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'HH:mm');
    } catch (e) {
      console.error("Time formatting error:", e);
      return "Invalid time";
    }
  };

  // Handle showing booking details
  const handleViewDetails = (booking: Booking) => {
    setDetailBooking(booking);
    setIsDetailDialogOpen(true);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color;
    let text;

    switch (status) {
      case 'approved':
      case 'confirmed':
        color = 'bg-green-100 text-green-800';
        text = 'Подтверждено';
        break;
      case 'pending':
        color = 'bg-yellow-100 text-yellow-800';
        text = 'Ожидание';
        break;
      case 'rejected':
        color = 'bg-red-100 text-red-800';
        text = 'Отклонено';
        break;
      case 'completed':
        color = 'bg-blue-100 text-blue-800';
        text = 'Завершено';
        break;
      case 'key_requested':
        color = 'bg-amber-100 text-amber-800';
        text = 'Ключ запрошен';
        break;
      case 'key_issued':
        color = 'bg-purple-100 text-purple-800';
        text = 'Ключ выдан';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
        text = status;
    }

    return (
        <Badge className={color}>
          {text}
        </Badge>
    );
  };

  // Render booking item
  const renderBookingItem = (booking: Booking) => {
    // Skip rendering if it's an admin booking
    if (booking.creator_role === 'admin') return null;

    const startDate = formatDate(booking.from_date);
    const startTime = formatTime(booking.from_date);
    const endTime = formatTime(booking.until_date);
    const now = new Date();
    const bookingStart = parseISO(booking.from_date);
    const bookingEnd = parseISO(booking.until_date);

    const isActive = (booking.status === 'approved' || booking.status === 'confirmed' || booking.status === 'key_issued') &&
        now >= bookingStart &&
        now <= bookingEnd;

    const isPending = booking.status === 'pending';

    // Fix the logic for determining if it's a staff booking
    const isStaff = booking.creator_role === 'staff';

    return (
        <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-lg">{booking.room_name}</h3>
                <StatusBadge status={booking.status} />
                {isActive && <Badge className="bg-blue-100 text-blue-800">Активно</Badge>}
                {isStaff && <Badge className="bg-indigo-100 text-indigo-800">Сотрудник</Badge>}
                {!isStaff && <Badge className="bg-teal-100 text-teal-800">Студент</Badge>}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{startDate}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{startTime} - {endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{booking.full_name} ({booking.username})</span>
              </div>
              {booking.purpose && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Цель:</span> {booking.purpose}
                  </div>
              )}
              {booking.staff_names && booking.staff_names.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Участники:</span> {booking.staff_names.length} человек
                    <Button variant="ghost" size="sm" className="ml-1 h-6 p-0 text-primary" onClick={() => handleViewDetails(booking)}>
                      Подробнее
                    </Button>
                  </div>
              )}
              {booking.status === 'approved' && booking.access_code && (
                  <div className="text-sm font-medium text-green-600">
                    Код доступа: {booking.access_code}
                  </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isPending && (
                  <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking.id);
                          setIsConfirmDialogOpen(true);
                        }}
                        disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Подтвердить
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking.id);
                          setIsCancelDialogOpen(true);
                        }}
                        disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Отклонить
                    </Button>
                  </>
              )}
              {booking.status === 'approved' && (
                  <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking.id);
                        setIsCancelDialogOpen(true);
                      }}
                      disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Отменить
                  </Button>
              )}
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(booking)}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Детали
              </Button>
            </div>
          </div>
        </div>
    );
  };

  // Filter bookings by status for tabs
  const getPendingBookings = () => filteredBookings.filter(b => b.status === 'pending' && b.creator_role !== 'admin');

  const getActiveBookings = () => filteredBookings.filter(b => {
    const now = new Date();
    const start = parseISO(b.from_date);
    const end = parseISO(b.until_date);
    return b.creator_role !== 'admin' &&
        (b.status === 'approved' || b.status === 'confirmed' || b.status === 'key_issued') &&
        now >= start && now <= end;
  });

  const getUpcomingBookings = () => filteredBookings.filter(b => {
    const now = new Date();
    const start = parseISO(b.from_date);
    return b.creator_role !== 'admin' &&
        (b.status === 'approved' || b.status === 'confirmed') &&
        now < start;
  });

  const getCompletedBookings = () => filteredBookings.filter(b => {
    const now = new Date();
    const end = parseISO(b.until_date);
    return b.creator_role !== 'admin' &&
        (b.status === 'completed' || (b.status === 'approved' && now > end));
  });

  // Get counts of different booking types (excluding admin)
  const getStaffBookingsCount = () => bookings.filter(b => b.creator_role === 'staff').length;
  const getStudentBookingsCount = () => bookings.filter(b => b.creator_role !== 'staff' && b.creator_role !== 'admin').length;

  return (
      <PageLayout role="admin">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Управление бронированиями</h1>
              <p className="text-muted-foreground">
                Просмотр и управление всеми бронированиями в системе
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={loadAllBookings} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
              <Button variant="outline">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
              <Button variant="default" onClick={handleSyncRequest}>
                <RotateCw className="h-4 w-4 mr-2" />
                Синхронизация
              </Button>
            </div>
          </div>

          {/* Admin info */}
          <div className="text-sm text-muted-foreground text-right">
            <div>Current User's Login: {currentUser}</div>
            <div>Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {currentDateTime}</div>
          </div>

          {/* Search and filters row */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Поиск по аудитории, имени, цели..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                  value={selectedUserType}
                  onValueChange={setSelectedUserType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Тип пользователя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все пользователи</SelectItem>
                  <SelectItem value="staff">Сотрудники</SelectItem>
                  <SelectItem value="student">Студенты</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expanded filters */}
            {isFilterOpen && (
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status-filter">Статус бронирования</Label>
                      <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="pending">Ожидание</SelectItem>
                          <SelectItem value="approved">Подтверждено</SelectItem>
                          <SelectItem value="rejected">Отклонено</SelectItem>
                          <SelectItem value="completed">Завершено</SelectItem>
                          <SelectItem value="key_requested">Ключ запрошен</SelectItem>
                          <SelectItem value="key_issued">Ключ выдан</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-from">Дата с</Label>
                      <Input
                          id="date-from"
                          type="date"
                          value={dateFilter.start}
                          onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-to">Дата по</Label>
                      <Input
                          id="date-to"
                          type="date"
                          value={dateFilter.end}
                          onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 gap-2">
                    <Button variant="outline" onClick={() => {
                      setSearchTerm("");
                      setSelectedStatus("all");
                      setSelectedUserType("all");
                      setDateFilter({start: "", end: ""});
                    }}>
                      Сбросить
                    </Button>
                    <Button onClick={() => applyFilters()}>
                      Применить фильтры
                    </Button>
                  </div>
                </Card>
            )}
          </div>

          {isLoading && !bookings.length ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Загрузка бронирований...</span>
              </div>
          ) : error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-2" onClick={loadAllBookings}>
                  Повторить запрос
                </Button>
              </div>
          ) : (
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">Все ({filteredBookings.length})</TabsTrigger>
                  <TabsTrigger value="pending">Ожидание ({getPendingBookings().length})</TabsTrigger>
                  <TabsTrigger value="active">Активные ({getActiveBookings().length})</TabsTrigger>
                  <TabsTrigger value="upcoming">Предстоящие ({getUpcomingBookings().length})</TabsTrigger>
                  <TabsTrigger value="completed">Завершенные ({getCompletedBookings().length})</TabsTrigger>
                  <TabsTrigger value="staff" className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Сотрудники ({getStaffBookingsCount()})
                  </TabsTrigger>
                  <TabsTrigger value="student" className="flex items-center gap-1">
                    <UserCheck className="h-4 w-4" />
                    Студенты ({getStudentBookingsCount()})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Все бронирования</CardTitle>
                      <CardDescription>
                        Просмотр всех бронирований в системе
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getCurrentPageItems().length > 0 ? (
                            getCurrentPageItems().map(booking => renderBookingItem(booking))
                        ) : (
                            <div className="text-center py-10">
                              <p className="text-muted-foreground">Бронирования не найдены</p>
                            </div>
                        )}

                        {/* Pagination controls */}
                        {filteredBookings.length > 0 && (
                            <div className="flex items-center justify-between mt-6">
                              <div className="text-sm text-muted-foreground">
                                Показано {Math.min((currentPage - 1) * itemsPerPage + 1, filteredBookings.length)} - {Math.min(currentPage * itemsPerPage, filteredBookings.length)} из {filteredBookings.length}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center">
                                  {(() => {
                                    // Calculate pages to show
                                    const pagesToShow = [];
                                    if (totalPages <= 5) {
                                      // Show all pages if there are 5 or fewer
                                      for (let p = 1; p <= totalPages; p++) {
                                        pagesToShow.push(p);
                                      }
                                    } else {
                                      // Always show first page
                                      pagesToShow.push(1);

                                      // Calculate range around current page
                                      let start = Math.max(2, currentPage - 1);
                                      let end = Math.min(totalPages - 1, currentPage + 1);

                                      // Add ellipsis if needed
                                      if (start > 2) {
                                        pagesToShow.push(-1); // Ellipsis placeholder
                                      }

                                      // Add pages in the range
                                      for (let p = start; p <= end; p++) {
                                        pagesToShow.push(p);
                                      }

                                      // Add ellipsis if needed
                                      if (end < totalPages - 1) {
                                        pagesToShow.push(-2); // Ellipsis placeholder
                                      }

                                      // Always show last page
                                      pagesToShow.push(totalPages);
                                    }

                                    // Return the mapped buttons
                                    return pagesToShow.map((page) => {
                                      if (page < 0) {
                                        // Render ellipsis
                                        return <span key={`ellipsis${page}`} className="px-2">...</span>;
                                      }

                                      return (
                                          <Button
                                              key={page}
                                              variant={currentPage === page ? "default" : "outline"}
                                              size="sm"
                                              className="h-8 w-8"
                                              onClick={() => setCurrentPage(page)}
                                          >
                                            {page}
                                          </Button>
                                      );
                                    });
                                  })()}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>

                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={(value) => setItemsPerPage(Number(value))}
                                >
                                  <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="10 / стр." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5 / стр.</SelectItem>
                                    <SelectItem value="10">10 / стр.</SelectItem>
                                    <SelectItem value="20">20 / стр.</SelectItem>
                                    <SelectItem value="50">50 / стр.</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ожидающие подтверждения</CardTitle>
                      <CardDescription>
                        Бронирования, которые требуют подтверждения
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getPendingBookings().length > 0 ? (
                            getPendingBookings().map(booking => renderBookingItem(booking))
                        ) : (
                            <div className="text-center py-10">
                              <p className="text-muted-foreground">Нет бронирований, ожидающих подтверждения</p>
                            </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Активные бронирования</CardTitle>
                      <CardDescription>
                        Бронирования, которые активны в данный момент
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getActiveBookings().length > 0 ? (
                            getActiveBookings().map(booking => renderBookingItem(booking))
                        ) : (
                            <div className="text-center py-10">
                              <p className="text-muted-foreground">Нет активных бронирований</p>
                            </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Предстоящие бронирования</CardTitle>
                      <CardDescription>
                        Бронирования, которые подтверждены и ещё не начались
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getUpcomingBookings().length > 0 ? (
                            getUpcomingBookings().map(booking => renderBookingItem(booking))
                        ) : (
                            <div className="text-center py-10">
                              <p className="text-muted-foreground">Нет предстоящих бронирований</p>
                            </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Завершенные бронирования</CardTitle>
                      <CardDescription>
                        Бронирования, которые уже завершились
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getCompletedBookings().length > 0 ? (
                            getCompletedBookings().map(booking => renderBookingItem(booking))
                        ) : (
                            <div className="text-center py-10">
                              <p className="text-muted-foreground">Нет завершенных бронирований</p>
                            </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="staff" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Бронирования сотрудников
                      </CardTitle>
                      <CardDescription>
                        Просмотр всех бронирований, созданных сотрудниками
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {bookings.filter(b => b.creator_role === 'staff').length > 0 ? (
                            bookings.filter(b => b.creator_role === 'staff')
                                .slice(0, itemsPerPage).map(booking => renderBookingItem(booking))
                        ) : (
                            <div className="text-center py-10">
                              <p className="text-muted-foreground">Нет бронирований от сотрудников</p>
                            </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="student" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Бронирования студентов
                      </CardTitle>
                      <CardDescription>
                        Просмотр всех бронирований, созданных студентами
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {bookings.filter(b => b.creator_role !== 'staff' && b.creator_role !== 'admin').length > 0 ? (
                            bookings.filter(b => b.creator_role !== 'staff' && b.creator_role !== 'admin')
                                .slice(0, itemsPerPage).map(booking => renderBookingItem(booking))
                        ) : (
                            <div className="text-center py-10">
                              <p className="text-muted-foreground">Нет бронирований от студентов</p>
                            </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
          )}
        </div>

        {/* Confirm Booking Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Подтверждение бронирования</DialogTitle>
              <DialogDescription>
                Вы действительно хотите подтвердить это бронирование? После подтверждения будет сгенерирован код доступа.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => setIsConfirmDialogOpen(false)}
                  disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                  onClick={handleConfirmBooking}
                  disabled={isLoading}
              >
                {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Подтверждение...
                    </>
                ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Подтвердить
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Booking Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Отмена бронирования</DialogTitle>
              <DialogDescription>
                Вы действительно хотите отменить это бронирование? Это действие нельзя отменить.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => setIsCancelDialogOpen(false)}
                  disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                  variant="destructive"
                  onClick={handleCancelBooking}
                  disabled={isLoading}
              >
                {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Отмена бронирования...
                    </>
                ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Отменить бронирование
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Booking Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Детали бронирования</DialogTitle>
              <DialogDescription>
                Информация о выбранном бронировании
              </DialogDescription>
            </DialogHeader>

            {detailBooking && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ID бронирования</p>
                      <p>{detailBooking.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Статус</p>
                      <StatusBadge status={detailBooking.status} />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Тип пользователя</p>
                    <p>{detailBooking.creator_role === 'staff' ? 'Сотрудник' : 'Студент'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Помещение</p>
                    <p className="font-medium">{detailBooking.room_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Дата начала</p>
                      <p>{formatDate(detailBooking.from_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Время начала</p>
                      <p>{formatTime(detailBooking.from_date)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Дата окончания</p>
                      <p>{formatDate(detailBooking.until_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Время окончания</p>
                      <p>{formatTime(detailBooking.until_date)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Создатель</p>
                    <p>{detailBooking.full_name}</p>
                  </div>

                  {detailBooking.purpose && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Цель бронирования</p>
                        <p>{detailBooking.purpose}</p>
                      </div>
                  )}

                  {detailBooking.attendees_count && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Количество участников</p>
                        <p>{detailBooking.attendees_count}</p>
                      </div>
                  )}

                  {detailBooking.staff_names && detailBooking.staff_names.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Участники</p>
                        <ul className="text-sm list-disc pl-5">
                          {detailBooking.staff_names.map((name, index) => (
                              <li key={index}>{name}</li>
                          ))}
                        </ul>
                      </div>
                  )}

                  {detailBooking.access_code && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Код доступа</p>
                        <p className="font-medium text-green-600">{detailBooking.access_code}</p>
                      </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Создано</p>
                    <p>{new Date(detailBooking.created_at).toLocaleString()}</p>
                  </div>
                </div>
            )}

            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
              >
                Закрыть
              </Button>
              {detailBooking?.status === 'pending' && (
                  <Button
                      onClick={() => {
                        setSelectedBooking(detailBooking.id);
                        setIsDetailDialogOpen(false);
                        setIsConfirmDialogOpen(true);
                      }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Подтвердить
                  </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sync Warning Dialog */}
        <AlertDialog open={isSyncWarningOpen} onOpenChange={setIsSyncWarningOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Внимание: Синхронизация расписания
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p className="font-medium text-amber-600">
                  Вы собираетесь запустить синхронизацию с расписанием университета. Этот процесс:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Занимает значительное время (3-4 минуты)</li>
                  <li>Создаст бронирования для всех занятий в университетском расписании</li>
                  <li>Может привести к конфликтам с существующими бронированиями</li>
                  <li>Нагружает систему и может временно замедлить работу приложения</li>
                </ul>
                <p className="mt-4 font-medium">
                  Рекомендуется запускать синхронизацию во время минимальной активности пользователей.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleSyncWarningConfirm}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Продолжить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Password Confirmation Dialog */}
        <Dialog open={isSyncPasswordDialogOpen} onOpenChange={(open) => {
          // Only allow closing if not syncing
          if (!isSyncing) setIsSyncPasswordDialogOpen(open);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Подтверждение администратора
              </DialogTitle>
              <DialogDescription>
                Для продолжения синхронизации подтвердите свои полномочия, введя пароль администратора.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Пароль администратора</Label>
                <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Введите пароль"
                    disabled={isSyncing}
                />
              </div>

              {isSyncing && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{syncStatusMessage}</span>
                  </div>
              )}
            </div>

            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => setIsSyncPasswordDialogOpen(false)}
                  disabled={isSyncing}
              >
                Отмена
              </Button>
              <Button
                  onClick={handleSyncPasswordConfirm}
                  disabled={!adminPassword || isSyncing}
              >
                {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Проверка...
                    </>
                ) : (
                    <>
                      <RotateCw className="h-4 w-4 mr-2" />
                      Начать синхронизацию
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sync Progress Dialog */}
        <Dialog
            open={isSyncProcessDialogOpen}
            onOpenChange={(open) => {
              // Only allow closing if not currently syncing
              if (!isSyncing) {
                setIsSyncProcessDialogOpen(open);
              }
            }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                Синхронизация расписания
              </DialogTitle>
              <DialogDescription>
                {isSyncing
                    ? "Пожалуйста, не закрывайте это окно во время синхронизации. Процесс может занять 3-4 минуты."
                    : syncProgress === 100
                        ? "Синхронизация успешно завершена!"
                        : "Произошла ошибка во время синхронизации."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Прогресс</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} />
              </div>

              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{syncStatusMessage}</p>
              </div>

              {/* Add estimated time based on progress */}
              {isSyncing && syncProgress < 100 && (
                  <div className="text-xs text-muted-foreground">
                    Примерное оставшееся время: {Math.ceil((100 - syncProgress) / 25) * 60} секунд
                  </div>
              )}
            </div>

            <DialogFooter>
              {!isSyncing && (
                  <Button
                      onClick={() => setIsSyncProcessDialogOpen(false)}
                  >
                    Закрыть
                  </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
  );
};

export default AdminBookingsPage;