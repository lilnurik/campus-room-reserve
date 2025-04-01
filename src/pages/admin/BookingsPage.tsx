import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search, Clock, User, Calendar, CheckCircle, X,
  Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight,
  Filter, DownloadIcon, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

// Define booking interface based on API response
interface Booking {
  id: number;
  room_name: string;
  username: string;
  full_name: string;
  from_date: string;
  until_date: string;
  status: string;
  created_at: string;
  access_code?: string; // Optional field
}

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Status filter
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

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

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, selectedStatus, dateFilter]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredBookings.length / itemsPerPage));
  }, [filteredBookings, itemsPerPage]);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError("No authentication token found");
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/api/admin/bookings', {
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
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      console.error("Error fetching bookings:", err);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to bookings
  const applyFilters = () => {
    let result = [...bookings];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(booking =>
          booking.room_name.toLowerCase().includes(searchLower) ||
          booking.full_name.toLowerCase().includes(searchLower) ||
          booking.username.toLowerCase().includes(searchLower)
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

    setFilteredBookings(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle confirm booking
  const handleConfirmBooking = async () => {
    if (selectedBooking === null) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://127.0.0.1:5000/api/admin/bookings/${selectedBooking}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update local state to reflect the change
      setBookings(prevBookings =>
          prevBookings.map(booking =>
              booking.id === selectedBooking
                  ? { ...booking, status: 'approved' }
                  : booking
          )
      );

      toast.success("Booking has been confirmed");
    } catch (err) {
      console.error("Error confirming booking:", err);
      toast.error("Failed to confirm booking");
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (selectedBooking === null) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://127.0.0.1:5000/api/admin/bookings/${selectedBooking}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update local state to reflect the change
      setBookings(prevBookings =>
          prevBookings.map(booking =>
              booking.id === selectedBooking
                  ? { ...booking, status: 'rejected' }
                  : booking
          )
      );

      toast.success("Booking has been cancelled");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("Failed to cancel booking");
    } finally {
      setIsLoading(false);
      setIsCancelDialogOpen(false);
    }
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd.MM.yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'HH:mm');
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
    const startDate = formatDate(booking.from_date);
    const startTime = formatTime(booking.from_date);
    const endTime = formatTime(booking.until_date);
    const now = new Date();
    const bookingStart = parseISO(booking.from_date);
    const bookingEnd = parseISO(booking.until_date);

    const isActive = booking.status === 'approved' &&
        now >= bookingStart &&
        now <= bookingEnd;

    const isPending = booking.status === 'pending';

    return (
        <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">{booking.room_name}</h3>
                <StatusBadge status={booking.status} />
                {isActive && <Badge className="bg-blue-100 text-blue-800">Активно</Badge>}
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
  const getPendingBookings = () => filteredBookings.filter(b => b.status === 'pending');

  const getActiveBookings = () => filteredBookings.filter(b => {
    const now = new Date();
    const start = parseISO(b.from_date);
    const end = parseISO(b.until_date);
    return b.status === 'approved' && now >= start && now <= end;
  });

  const getUpcomingBookings = () => filteredBookings.filter(b => {
    const now = new Date();
    const start = parseISO(b.from_date);
    return b.status === 'approved' && now < start;
  });

  const getCompletedBookings = () => filteredBookings.filter(b => {
    const now = new Date();
    const end = parseISO(b.until_date);
    return b.status === 'completed' || (b.status === 'approved' && now > end);
  });

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
              <Button variant="outline" onClick={fetchBookings} disabled={isLoading}>
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
            </div>
          </div>

          {/* Search and filters row */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Поиск по аудитории, имени, ID..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                <Button variant="outline" className="mt-2" onClick={fetchBookings}>
                  Повторить запрос
                </Button>
              </div>
          ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">Все ({filteredBookings.length})</TabsTrigger>
                  <TabsTrigger value="pending">Ожидание ({getPendingBookings().length})</TabsTrigger>
                  <TabsTrigger value="active">Активные ({getActiveBookings().length})</TabsTrigger>
                  <TabsTrigger value="upcoming">Предстоящие ({getUpcomingBookings().length})</TabsTrigger>
                  <TabsTrigger value="completed">Завершенные ({getCompletedBookings().length})</TabsTrigger>
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
                                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Show first, last, current, and nearby pages
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

                                    return pagesToShow.map((page, idx) => {
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
                                  })}
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
                    <p className="text-sm font-medium text-muted-foreground">Пользователь</p>
                    <p>{detailBooking.full_name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID пользователя</p>
                    <p>{detailBooking.username}</p>
                  </div>

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
      </PageLayout>
  );
};

export default AdminBookingsPage;