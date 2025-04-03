import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Clock, Navigation, User, XCircle,
  Loader2, Building, BookOpen, RefreshCw, AlertCircle,
  BookMarked
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, isEqual, differenceInHours, differenceInDays, differenceInMinutes } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { bookingsApi, Booking } from "@/services/api";
import { useTranslation } from "@/context/LanguageContext";
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

// Helper function to format date
const formatDate = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd.MM.yyyy', { locale: ru });
  } catch (e) {
    console.error("Error formatting date:", e, dateStr);
    return dateStr;
  }
};

// Helper function to format time
const formatTime = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'HH:mm', { locale: ru });
  } catch (e) {
    console.error("Error formatting time:", e, dateStr);
    return dateStr;
  }
};

// Function to get remaining time text
const getRemainingTimeText = (endTime: string) => {
  const now = new Date();
  const end = parseISO(endTime);

  const minutesLeft = differenceInMinutes(end, now);
  if (minutesLeft <= 0) return "Время истекло";

  if (minutesLeft < 60) {
    return `Осталось ${minutesLeft} ${getMinutesText(minutesLeft)}`;
  }

  const hoursLeft = Math.floor(minutesLeft / 60);
  const remainingMinutes = minutesLeft % 60;

  if (remainingMinutes === 0) {
    return `Осталось ${hoursLeft} ${getHoursText(hoursLeft)}`;
  }

  return `Осталось ${hoursLeft} ${getHoursText(hoursLeft)} ${remainingMinutes} ${getMinutesText(remainingMinutes)}`;
};

// Function to get time until start text
const getTimeUntilStart = (startTime: string) => {
  const now = new Date();
  const start = parseISO(startTime);

  const daysLeft = differenceInDays(start, now);
  if (daysLeft > 0) {
    const hoursLeft = differenceInHours(start, now) % 24;
    return `${daysLeft} ${getDaysText(daysLeft)} ${hoursLeft} ${getHoursText(hoursLeft)}`;
  }

  const hoursLeft = differenceInHours(start, now);
  if (hoursLeft > 0) {
    const minutesLeft = differenceInMinutes(start, now) % 60;
    return `${hoursLeft} ${getHoursText(hoursLeft)} ${minutesLeft} ${getMinutesText(minutesLeft)}`;
  }

  const minutesLeft = differenceInMinutes(start, now);
  return `${minutesLeft} ${getMinutesText(minutesLeft)}`;
};

// Helpers for Russian plurals
const getMinutesText = (minutes: number) => {
  if (minutes % 10 === 1 && minutes % 100 !== 11) return "минута";
  if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) return "минуты";
  return "минут";
};

const getHoursText = (hours: number) => {
  if (hours % 10 === 1 && hours % 100 !== 11) return "час";
  if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) return "часа";
  return "часов";
};

const getDaysText = (days: number) => {
  if (days % 10 === 1 && days % 100 !== 11) return "день";
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return "дня";
  return "дней";
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Подтверждено
          </Badge>
      );
    case 'pending':
      return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Ожидает подтверждения
          </Badge>
      );
    case 'rejected':
      return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Отклонено
          </Badge>
      );
    case 'cancelled':
      return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
            Отменено
          </Badge>
      );
    case 'given':
      return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Активно
          </Badge>
      );
    case 'taken':
      return (
          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
            Завершено
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

const HistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("active");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load bookings when component mounts
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Loading user bookings...");
      const response = await bookingsApi.getUserBookings();
      console.log("Bookings API response:", response);

      if (response.success && response.data) {
        console.log("Loaded bookings:", response.data);
        setBookings(response.data);
      } else {
        const errorMsg = response.error || "Failed to load bookings";
        console.error("Error loading bookings:", errorMsg);
        setError(errorMsg);
        toast.error("Ошибка загрузки бронирований");
      }
    } catch (error) {
      console.error("Exception loading bookings:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Ошибка загрузки бронирований");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBookings = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      console.log("Refreshing user bookings...");
      const response = await bookingsApi.getUserBookings();

      if (response.success && response.data) {
        setBookings(response.data);
        toast.success("Данные обновлены");
      } else {
        setError(response.error || "Failed to refresh bookings");
        toast.error("Ошибка обновления данных");
      }
    } catch (error) {
      console.error("Exception refreshing bookings:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Ошибка обновления данных");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsCancelling(true);
    setError(null);

    try {
      console.log(`Cancelling booking with ID: ${selectedBooking.id}`);
      const response = await bookingsApi.cancel(selectedBooking.id);

      if (response.success) {
        // Update booking in local state
        const updatedBookings = bookings.map(b =>
            b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b
        );

        setBookings(updatedBookings);
        toast.success("Бронирование успешно отменено");
      } else {
        setError(response.error || "Failed to cancel booking");
        toast.error(response.error || "Ошибка при отмене бронирования");
      }
    } catch (error) {
      console.error("Exception cancelling booking:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Ошибка при отмене бронирования");
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
      setSelectedBooking(null);
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const canBeCancelled = (booking: Booking) => {
    return booking.status === 'pending' || booking.status === 'approved';
  };

  // Filter bookings based on active tab
  const getActiveBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const start = parseISO(booking.from_date);
      const end = parseISO(booking.until_date);
      return (booking.status === 'approved' || booking.status === 'given') &&
          isAfter(end, now) &&
          isBefore(now, end) &&
          isAfter(now, start);
    });
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const start = parseISO(booking.from_date);
      return (booking.status === 'approved' || booking.status === 'pending') &&
          isAfter(start, now);
    });
  };

  const getPastBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const end = parseISO(booking.until_date);
      return (booking.status === 'approved' || booking.status === 'taken') &&
          isBefore(end, now);
    });
  };

  const getCancelledBookings = () => {
    return bookings.filter(booking => {
      return booking.status === 'cancelled' || booking.status === 'rejected';
    });
  };

  // Get current bookings based on active tab
  const getCurrentBookings = () => {
    switch (activeTab) {
      case 'active':
        return getActiveBookings();
      case 'upcoming':
        return getUpcomingBookings();
      case 'past':
        return getPastBookings();
      case 'cancelled':
        return getCancelledBookings();
      default:
        return [];
    }
  };

  const currentBookings = getCurrentBookings();

  return (
      <PageLayout role="student">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">История бронирований</h1>
              <p className="text-muted-foreground">
                Просмотр всех ваших прошлых и активных бронирований
              </p>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={refreshBookings}
                disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="active">Активные</TabsTrigger>
              <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
              <TabsTrigger value="past">Прошедшие</TabsTrigger>
              <TabsTrigger value="cancelled">Отмененные</TabsTrigger>
            </TabsList>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Загрузка...</span>
                </div>
            ) : error ? (
                <Card>
                  <CardContent className="py-6">
                    <div className="text-center text-destructive">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-medium text-lg mb-1">Ошибка</h3>
                      <p className="mb-4">{error}</p>
                      <Button onClick={loadBookings}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Попробовать снова
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            ) : (
                <>
                  <TabsContent value="active" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Активные бронирования</CardTitle>
                        <CardDescription>
                          Бронирования, которые активны в данный момент
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {currentBookings.length > 0 ? (
                            <div className="space-y-4">
                              {currentBookings.map(booking => (
                                  <div key={booking.id} className="border rounded-lg p-4">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-medium text-lg">{booking.room_name}</h3>
                                          {getStatusBadge(booking.status)}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <CalendarDays className="h-4 w-4" />
                                          <span>{formatDate(booking.from_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Clock className="h-4 w-4" />
                                          <span>
                                    {formatTime(booking.from_date)} - {formatTime(booking.until_date)} ({getRemainingTimeText(booking.until_date)})
                                  </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Building className="h-4 w-4" />
                                          <span>{booking.room_category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <User className="h-4 w-4" />
                                          <span>{booking.attendees} {
                                            booking.attendees === 1 ? 'участник' :
                                                (booking.attendees >= 2 && booking.attendees <= 4) ? 'участника' : 'участников'
                                          }</span>
                                        </div>
                                        {booking.purpose && (
                                            <div className="text-sm text-muted-foreground mt-2">
                                              <div className="font-medium">Цель:</div>
                                              <div className="truncate max-w-md">{booking.purpose}</div>
                                            </div>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-2 md:text-right">
                                        {booking.secret_code && (
                                            <>
                                              <span className="text-sm font-medium">Код доступа</span>
                                              <span className="font-mono text-lg font-bold">{booking.secret_code}</span>
                                              <span className="text-xs text-muted-foreground">Покажите этот код охраннику</span>
                                            </>
                                        )}
                                        <div className="flex gap-2 justify-end mt-auto">
                                          <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => navigate(`/student/bookings/${booking.id}`)}
                                          >
                                            <BookOpen className="h-4 w-4 mr-1" />
                                            Детали
                                          </Button>

                                          {canBeCancelled(booking) && (
                                              <Button
                                                  variant="destructive"
                                                  size="sm"
                                                  onClick={() => openCancelDialog(booking)}
                                              >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Отменить
                                              </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                              ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">У вас нет активных бронирований</p>
                              <Button
                                  variant="outline"
                                  className="mt-4"
                                  onClick={() => navigate('/student/booking')}
                              >
                                <BookMarked className="h-4 w-4 mr-2" />
                                Забронировать аудиторию
                              </Button>
                            </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="upcoming" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Предстоящие бронирования</CardTitle>
                        <CardDescription>
                          Бронирования, которые еще не начались
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {currentBookings.length > 0 ? (
                            <div className="space-y-4">
                              {currentBookings.map(booking => (
                                  <div key={booking.id} className="border rounded-lg p-4">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-medium text-lg">{booking.room_name}</h3>
                                          {getStatusBadge(booking.status)}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <CalendarDays className="h-4 w-4" />
                                          <span>{formatDate(booking.from_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Clock className="h-4 w-4" />
                                          <span>{formatTime(booking.from_date)} - {formatTime(booking.until_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Building className="h-4 w-4" />
                                          <span>{booking.room_category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <User className="h-4 w-4" />
                                          <span>{booking.attendees} {
                                            booking.attendees === 1 ? 'участник' :
                                                (booking.attendees >= 2 && booking.attendees <= 4) ? 'участника' : 'участников'
                                          }</span>
                                        </div>
                                        {booking.purpose && (
                                            <div className="text-sm text-muted-foreground mt-2">
                                              <div className="font-medium">Цель:</div>
                                              <div className="truncate max-w-md">{booking.purpose}</div>
                                            </div>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-2 md:text-right">
                                        <span className="text-sm font-medium">До начала</span>
                                        <span className="font-medium">{getTimeUntilStart(booking.from_date)}</span>

                                        <div className="flex gap-2 justify-end mt-auto">
                                          <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => navigate(`/student/bookings/${booking.id}`)}
                                          >
                                            <BookOpen className="h-4 w-4 mr-1" />
                                            Детали
                                          </Button>

                                          {canBeCancelled(booking) && (
                                              <Button
                                                  variant="destructive"
                                                  size="sm"
                                                  onClick={() => openCancelDialog(booking)}
                                              >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Отменить
                                              </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                              ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">У вас нет предстоящих бронирований</p>
                              <Button
                                  variant="outline"
                                  className="mt-4"
                                  onClick={() => navigate('/student/booking')}
                              >
                                <BookMarked className="h-4 w-4 mr-2" />
                                Забронировать аудиторию
                              </Button>
                            </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Прошедшие бронирования</CardTitle>
                        <CardDescription>
                          История ваших завершенных бронирований
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {currentBookings.length > 0 ? (
                            <div className="space-y-4">
                              {currentBookings.map(booking => (
                                  <div key={booking.id} className="border rounded-lg p-4 opacity-75">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-medium text-lg">{booking.room_name}</h3>
                                          {getStatusBadge(booking.status)}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <CalendarDays className="h-4 w-4" />
                                          <span>{formatDate(booking.from_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Clock className="h-4 w-4" />
                                          <span>{formatTime(booking.from_date)} - {formatTime(booking.until_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Building className="h-4 w-4" />
                                          <span>{booking.room_category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <User className="h-4 w-4" />
                                          <span>{booking.attendees} {
                                            booking.attendees === 1 ? 'участник' :
                                                (booking.attendees >= 2 && booking.attendees <= 4) ? 'участника' : 'участников'
                                          }</span>
                                        </div>
                                        {booking.purpose && (
                                            <div className="text-sm text-muted-foreground mt-2">
                                              <div className="font-medium">Цель:</div>
                                              <div className="truncate max-w-md">{booking.purpose}</div>
                                            </div>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-2 md:text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/student/bookings/${booking.id}`)}
                                        >
                                          <BookOpen className="h-4 w-4 mr-1" />
                                          Детали
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                              ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">У вас нет прошедших бронирований</p>
                            </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="cancelled" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Отмененные бронирования</CardTitle>
                        <CardDescription>
                          Бронирования, которые были отменены или отклонены
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {currentBookings.length > 0 ? (
                            <div className="space-y-4">
                              {currentBookings.map(booking => (
                                  <div key={booking.id} className="border rounded-lg p-4 opacity-75">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-medium text-lg">{booking.room_name}</h3>
                                          {getStatusBadge(booking.status)}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <CalendarDays className="h-4 w-4" />
                                          <span>{formatDate(booking.from_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Clock className="h-4 w-4" />
                                          <span>{formatTime(booking.from_date)} - {formatTime(booking.until_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Building className="h-4 w-4" />
                                          <span>{booking.room_category}</span>
                                        </div>
                                        {booking.purpose && (
                                            <div className="text-sm text-muted-foreground mt-2">
                                              <div className="font-medium">Цель:</div>
                                              <div className="truncate max-w-md">{booking.purpose}</div>
                                            </div>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-2 md:text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/student/bookings/${booking.id}`)}
                                        >
                                          <BookOpen className="h-4 w-4 mr-1" />
                                          Детали
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                              ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">У вас нет отмененных бронирований</p>
                            </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
            )}
          </Tabs>
        </div>

        {/* Cancel Booking Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Подтверждение отмены</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите отменить бронирование аудитории {selectedBooking?.room_name}?
                <br />
                Это действие нельзя будет отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>Отмена</AlertDialogCancel>
              <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleCancelBooking();
                  }}
                  disabled={isCancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isCancelling ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Отмена бронирования...</>
                ) : (
                    'Да, отменить бронирование'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageLayout>
  );
};

export default HistoryPage;