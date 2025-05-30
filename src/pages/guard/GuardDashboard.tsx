import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar, Clock, KeyRound, Search, CheckCircle, AlertTriangle,
  Filter, Loader2, RefreshCw, X, BookOpen, PhoneCall
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatDate } from "@/lib/utils";
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
import { differenceInMinutes, parseISO, subDays, isAfter } from "date-fns";

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'approved':
      return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Подтверждено
          </Badge>
      );
    case 'pending':
      return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Ожидает подтверждения
          </Badge>
      );
    case 'rejected':
      return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <X className="h-3 w-3 mr-1" />
            Отклонено
          </Badge>
      );
    case 'cancelled':
      return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
            <X className="h-3 w-3 mr-1" />
            Отменено
          </Badge>
      );
    case 'given':
      return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <KeyRound className="h-3 w-3 mr-1" />
            Ключ выдан
          </Badge>
      );
    case 'taken':
      return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ключ возвращен
          </Badge>
      );
    case 'overdue':
      return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Просрочено
          </Badge>
      );
    default:
      return (
          <Badge variant="outline">
            {status}
          </Badge>
      );
  }
};

// Define booking interface based on the actual API response
interface Booking {
  id: number;
  name: string;          // This is the room name in the API response
  username: string;
  full_name: string;
  from_date: string;
  until_date: string;
  status: string;
  secret_code: string | null;
  building?: string;
  key_given?: boolean;
  key_taken?: boolean;
  overdue?: boolean;
  overdue_minutes?: number;
}

const API_BASE_URL = 'http://localhost:5321/api';

const GuardDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Updated current user and date/time format as requested
  const [currentUser, setCurrentUser] = useState<string>("lilnurik");
  const [currentDateTime, setCurrentDateTime] = useState<string>("2025-05-02 05:57:15");

  // Dialog states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  // Helper function to check if a date is within the last week
  const isWithinLastWeek = (dateString: string) => {
    const date = parseISO(dateString);
    const oneWeekAgo = subDays(new Date(), 7);
    return isAfter(date, oneWeekAgo);
  };

  // Fetch current user info and update time
  useEffect(() => {
    // In a real app, you'd fetch the current user from an API or auth service
    // For demo purposes, we're using hardcoded values
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
      setCurrentDateTime(formatted);
    };

    // Set the fixed datetime as requested
    setCurrentDateTime("2025-05-02 05:57:15");
    setCurrentUser("lilnurik");

    const interval = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Extract unique buildings once bookings are loaded
  useEffect(() => {
    if (bookings.length > 0) {
      const uniqueBuildings = Array.from(new Set(
          bookings
              .map(b => b.building || '')
              .filter(b => b !== '')
      ));
      setBuildings(uniqueBuildings);
    }
  }, [bookings]);

  // Function to fetch bookings from the API
  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError("No authentication token found");
        toast.error("Требуется авторизация");
        navigate('/login');
        return;
      }

      // Use the correct API endpoint with the full path
      const response = await fetch(`${API_BASE_URL}/security/bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      // Process the data to add overdue information
      const now = new Date();
      const processedBookings = data.map((booking: Booking) => {
        try {
          const endTime = parseISO(booking.until_date);
          const isOverdue = booking.status === 'given' && now > endTime;

          // Extract building from name if possible
          let building = 'Основной корпус';
          if (booking.name && booking.name.includes(' - ')) {
            const parts = booking.name.split(' - ');
            building = parts[0];
          }

          return {
            ...booking,
            overdue: isOverdue,
            overdue_minutes: isOverdue ? differenceInMinutes(now, endTime) : 0,
            building: building
          };
        } catch (err) {
          console.error("Error processing booking:", booking, err);
          return booking;
        }
      });

      console.log("Processed bookings:", processedBookings);
      setBookings(processedBookings);

    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      toast.error(`Ошибка загрузки данных: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh bookings
  const refreshBookings = async () => {
    setIsRefreshing(true);
    await fetchBookings();
    setIsRefreshing(false);
    toast.success("Данные обновлены");
  };

  // Function to issue a key
  const handleKeyIssue = async (booking: Booking) => {
    setIsProcessing(true);
    setApiResponse(null);

    try {
      const token = localStorage.getItem('authToken');

      // Prepare the request payload exactly as shown in the API documentation
      const payload = {
        username: booking.username,
        name: booking.name,             // This is the room name from the API
        secret_code_to_security: booking.secret_code
      };

      console.log("Sending key issue request with payload:", payload);

      // Use the correct API endpoint for giving keys
      const response = await fetch(`${API_BASE_URL}/security/give_keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Get the response data
      const responseData = await response.json().catch(() => ({ message: 'Failed to parse response' }));
      console.log("Key issue response:", responseData);

      // Store the API response for debugging
      setApiResponse(JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
      }

      // Update local state only if the API call was successful
      setBookings(bookings.map(b =>
          b.id === booking.id
              ? { ...b, status: 'given', key_given: true, key_taken: false }
              : b
      ));

      toast.success("Ключ успешно выдан");
      // Close dialog on success
      setShowIssueDialog(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error("Error issuing key:", err);
      toast.error(`Ошибка при выдаче ключа: ${err instanceof Error ? err.message : "Unknown error"}`);
      // Don't close dialog on error so user can see the error message
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to return a key
  const handleKeyReturn = async (booking: Booking) => {
    setIsProcessing(true);
    setApiResponse(null);

    try {
      const token = localStorage.getItem('authToken');

      // Prepare the request payload according to the API backend code
      // NOTE: Per backend, name is the ROOM name, not the student name!
      const payload = {
        username: booking.username,
        name: booking.name   // This should be room name according to backend code
      };

      console.log("Sending key return request with payload:", payload);

      // Use the correct API endpoint for returning keys
      const response = await fetch(`${API_BASE_URL}/security/key_taked`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Get the response data
      const responseData = await response.json().catch(() => ({ message: 'Failed to parse response' }));
      console.log("Key return response:", responseData);

      // Store the API response for debugging
      setApiResponse(JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
      }

      // Update local state only if the API call was successful
      setBookings(bookings.map(b =>
          b.id === booking.id
              ? { ...b, status: 'taken', key_taken: true }
              : b
      ));

      toast.success("Ключ успешно возвращен");
      // Close dialog on success
      setShowReturnDialog(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error("Error returning key:", err);
      toast.error(`Ошибка при возврате ключа: ${err instanceof Error ? err.message : "Unknown error"}`);
      // Don't close dialog on error so user can see the error message
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter bookings based on search and building
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
        (booking.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.secret_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.username || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBuilding = buildingFilter === "all" ||
        (booking.building || '').includes(buildingFilter);

    return matchesSearch && matchesBuilding;
  });

  // Get current bookings (approved and not given yet) from the last week and sort newest first
  const currentBookings = filteredBookings
      .filter(b =>
          b.status === "approved" &&
          !b.key_given &&
          isWithinLastWeek(b.from_date)
      )
      .sort((a, b) => {
        // Sort by from_date in descending order (newest first)
        return new Date(b.from_date).getTime() - new Date(a.from_date).getTime();
      });

  // Get bookings with issued keys that haven't been returned
  const issuedKeyBookings = filteredBookings
      .filter(b => b.status === "given" && !b.key_taken)
      .sort((a, b) => new Date(b.from_date).getTime() - new Date(a.from_date).getTime());

  // Get overdue bookings
  const overdueBookings = filteredBookings
      .filter(b => b.overdue)
      .sort((a, b) => new Date(b.from_date).getTime() - new Date(a.from_date).getTime());

  return (
      <PageLayout role="guard">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Панель Охранника</h1>
              <p className="text-muted-foreground">
                Управление ключами и контроль бронирований
              </p>
            </div>

            <div className="text-right text-sm text-muted-foreground">
              <div>Current User's Login: {currentUser}</div>
              <div>Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {currentDateTime}</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Всего бронирований: {bookings.length} |
              Актуальные подтверждения: {currentBookings.length} |
              Выдано ключей: {issuedKeyBookings.length}
              {overdueBookings.length > 0 && (
                  <span className="text-red-600"> | Просрочено: {overdueBookings.length}</span>
              )}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={refreshBookings}
                disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Поиск по комнате, студенту, логину или коду..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select
                    onValueChange={setBuildingFilter}
                    defaultValue="all"
                    disabled={buildings.length === 0}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <SelectValue placeholder="Корпус" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все корпуса</SelectItem>
                    {buildings.map(building => (
                        <SelectItem key={building} value={building}>{building}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Tabs */}
          {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Загрузка...</span>
              </div>
          ) : error ? (
              <Card>
                <CardContent className="py-6">
                  <div className="text-center text-destructive">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-1">Ошибка</h3>
                    <p className="mb-4">{error}</p>
                    <Button onClick={fetchBookings}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Попробовать снова
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ) : (
              <Tabs defaultValue="current">
                <TabsList className="mb-4">
                  <TabsTrigger value="current" className="flex items-center gap-2">
                    <Clock size={16} />
                    Текущие
                    {currentBookings.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-xs">
                    {currentBookings.length}
                  </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="keys" className="flex items-center gap-2">
                    <KeyRound size={16} />
                    Выданные ключи
                    {issuedKeyBookings.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-xs">
                    {issuedKeyBookings.length}
                  </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="overdue" className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Просроченные
                    {overdueBookings.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs">
                    {overdueBookings.length}
                  </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="current">
                  {currentBookings.length > 0 ? (
                      <div className="space-y-4">
                        {currentBookings.map(booking => (
                            <Card key={booking.id}>
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-lg">{booking.name}</h3>
                                      <StatusBadge status={booking.status} />
                                    </div>
                                    <p className="text-muted-foreground">{booking.building || 'Основной корпус'}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(booking.from_date)}
                              </span>
                                      <span className="flex items-center gap-1">
                                <Clock size={14} />
                                        {formatTime(booking.from_date)} - {formatTime(booking.until_date)}
                              </span>
                                    </div>
                                    <p className="mt-2">
                                      <span className="font-medium">Студент:</span> {booking.full_name || 'Не указано'}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium">Логин:</span> {booking.username || 'Не указан'}
                                    </p>
                                    {booking.secret_code && (
                                        <p className="text-sm font-mono bg-gray-100 p-1 mt-2 rounded inline-block">
                                          <span className="font-medium">Код доступа:</span> {booking.secret_code}
                                        </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                          setSelectedBooking(booking);
                                          setShowIssueDialog(true);
                                          setApiResponse(null);
                                        }}
                                        className="flex items-center gap-2"
                                        disabled={!booking.secret_code}
                                    >
                                      <KeyRound size={16} />
                                      Выдать ключ
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                  ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">Нет актуальных подтвержденных бронирований за последнюю неделю</p>
                        </CardContent>
                      </Card>
                  )}
                </TabsContent>

                <TabsContent value="keys">
                  {issuedKeyBookings.length > 0 ? (
                      <div className="space-y-4">
                        {issuedKeyBookings.map(booking => (
                            <Card key={booking.id} className={booking.overdue ? 'border-red-200' : ''}>
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-lg">{booking.name}</h3>
                                      <StatusBadge status={booking.overdue ? "overdue" : booking.status} />
                                    </div>
                                    <p className="text-muted-foreground">{booking.building || 'Основной корпус'}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(booking.from_date)}
                              </span>
                                      <span className="flex items-center gap-1">
                                <Clock size={14} />
                                        {formatTime(booking.from_date)} - {formatTime(booking.until_date)}
                              </span>
                                    </div>
                                    <p className="mt-2">
                                      <span className="font-medium">Студент:</span> {booking.full_name || 'Не указано'}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium">Логин:</span> {booking.username || 'Не указан'}
                                    </p>
                                    {booking.overdue && (
                                        <p className="text-red-500 font-medium mt-1">
                                          Просрочено на {booking.overdue_minutes} мин.
                                        </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                          setSelectedBooking(booking);
                                          setShowReturnDialog(true);
                                          setApiResponse(null);
                                        }}
                                        variant={booking.overdue ? "default" : "outline"}
                                        className="flex items-center gap-2"
                                    >
                                      <CheckCircle size={16} />
                                      Принять ключ
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                  ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">Нет выданных ключей</p>
                        </CardContent>
                      </Card>
                  )}
                </TabsContent>

                <TabsContent value="overdue">
                  {overdueBookings.length > 0 ? (
                      <div className="space-y-4">
                        {overdueBookings.map(booking => (
                            <Card key={booking.id} className="border-red-200">
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-lg">{booking.name}</h3>
                                      <StatusBadge status="overdue" />
                                    </div>
                                    <p className="text-muted-foreground">{booking.building || 'Основной корпус'}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(booking.from_date)}
                              </span>
                                      <span className="flex items-center gap-1">
                                <Clock size={14} />
                                        {formatTime(booking.from_date)} - {formatTime(booking.until_date)}
                              </span>
                                    </div>
                                    <p className="mt-2">
                                      <span className="font-medium">Студент:</span> {booking.full_name || 'Не указано'}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium">Логин:</span> {booking.username || 'Не указан'}
                                    </p>
                                    <p className="text-red-500 font-medium mt-1">
                                      Просрочено на {booking.overdue_minutes} мин.
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                          setSelectedBooking(booking);
                                          setShowReturnDialog(true);
                                          setApiResponse(null);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                      <CheckCircle size={16} />
                                      Принять ключ
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                  ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">Нет просроченных бронирований</p>
                        </CardContent>
                      </Card>
                  )}
                </TabsContent>
              </Tabs>
          )}
        </div>

        {/* Issue Key Dialog */}
        <AlertDialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Выдача ключа</AlertDialogTitle>
              <AlertDialogDescription>
                Вы собираетесь выдать ключ от аудитории <strong>{selectedBooking?.name}</strong> студенту <strong>{selectedBooking?.full_name}</strong>.
                <br /><br />
                <div className="space-y-2">
                  <p><strong>Логин студента:</strong> {selectedBooking?.username}</p>
                  <p><strong>Код доступа:</strong> <span className="font-mono font-bold">{selectedBooking?.secret_code}</span></p>
                </div>
                <br />
                Убедитесь, что студент предоставил правильный код доступа.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {apiResponse && (
                <div className="bg-red-50 p-3 rounded border border-red-200 mt-2 mb-2">
                  <h4 className="font-semibold text-red-700 mb-1">Ответ сервера:</h4>
                  <pre className="whitespace-pre-wrap text-xs font-mono text-red-800 overflow-auto max-h-32">
                {apiResponse}
              </pre>
                </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Отмена</AlertDialogCancel>
              <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    if (selectedBooking) {
                      handleKeyIssue(selectedBooking);
                    }
                  }}
                  disabled={isProcessing || !selectedBooking?.secret_code}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isProcessing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Выдача ключа...</>
                ) : (
                    'Подтвердить выдачу ключа'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Return Key Dialog */}
        <AlertDialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Возврат ключа</AlertDialogTitle>
              <AlertDialogDescription>
                Вы подтверждаете возврат ключа от аудитории <strong>{selectedBooking?.name}</strong>?
                <br /><br />
                <div className="space-y-2">
                  <p><strong>Студент:</strong> {selectedBooking?.full_name}</p>
                  <p><strong>Логин студента:</strong> {selectedBooking?.username}</p>
                </div>

                {selectedBooking?.overdue && (
                    <div className="mt-2 text-red-500">
                      Обратите внимание: возврат просрочен на {selectedBooking.overdue_minutes} минут!
                    </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {apiResponse && (
                <div className="bg-red-50 p-3 rounded border border-red-200 mt-2 mb-2">
                  <h4 className="font-semibold text-red-700 mb-1">Ответ сервера:</h4>
                  <pre className="whitespace-pre-wrap text-xs font-mono text-red-800 overflow-auto max-h-32">
                {apiResponse}
              </pre>
                </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Отмена</AlertDialogCancel>
              <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    if (selectedBooking) {
                      handleKeyReturn(selectedBooking);
                    }
                  }}
                  disabled={isProcessing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isProcessing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Обработка...</>
                ) : (
                    'Подтвердить возврат ключа'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageLayout>
  );
};

export default GuardDashboard;