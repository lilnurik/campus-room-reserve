import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle, Calendar, Clock, CheckCircle, XCircle,
  BookOpen, Loader2, RefreshCw, Building, BookMarked, User
} from "lucide-react";
import { format, parseISO } from "date-fns";
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
const formatDateTime = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch (e) {
    console.error("Error formatting date:", e, dateStr);
    return dateStr;
  }
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
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
            <XCircle className="h-3 w-3 mr-1" />
            Отклонено
          </Badge>
      );
    case 'cancelled':
      return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Отменено
          </Badge>
      );
    case 'given':
      return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <BookMarked className="h-3 w-3 mr-1" />
            Ключ выдан
          </Badge>
      );
    case 'taken':
      return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <BookMarked className="h-3 w-3 mr-1" />
            Ключ возвращен
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

const BookingHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
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

  // Filter bookings when tab changes or when bookings are updated
  useEffect(() => {
    console.log("Filtering bookings for tab:", activeTab);
    console.log("Total bookings:", bookings.length);
    filterBookings(activeTab);
  }, [activeTab, bookings]);

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
        toast.error(t("bookingHistory.loadError") || "Ошибка загрузки бронирований");
      }
    } catch (error) {
      console.error("Exception loading bookings:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error(t("bookingHistory.loadError") || "Ошибка загрузки бронирований");
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
      console.log("Refresh response:", response);

      if (response.success && response.data) {
        console.log("Setting refreshed bookings:", response.data);
        setBookings(response.data);
        toast.success(t("bookingHistory.refreshSuccess") || "Данные обновлены");
      } else {
        const errorMsg = response.error || "Failed to refresh bookings";
        console.error("Error refreshing bookings:", errorMsg);
        setError(errorMsg);
        toast.error(t("bookingHistory.refreshError") || "Ошибка обновления данных");
      }
    } catch (error) {
      console.error("Exception refreshing bookings:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error(t("bookingHistory.refreshError") || "Ошибка обновления данных");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterBookings = (tab: string) => {
    if (!bookings || bookings.length === 0) {
      setFilteredBookings([]);
      return;
    }

    let filtered: Booking[];

    switch (tab) {
      case "pending":
        filtered = bookings.filter(b => b.status === 'pending');
        break;
      case "approved":
        filtered = bookings.filter(b => b.status === 'approved' || b.status === 'given');
        break;
      case "completed":
        filtered = bookings.filter(b => b.status === 'taken');
        break;
      case "rejected":
        filtered = bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled');
        break;
      case "all":
      default:
        filtered = [...bookings];
        break;
    }

    console.log(`Filtered bookings for tab "${tab}":`, filtered.length);
    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsCancelling(true);
    setError(null);

    try {
      console.log(`Cancelling booking with ID: ${selectedBooking.id}`);
      const response = await bookingsApi.cancel(selectedBooking.id);
      console.log("Cancel response:", response);

      if (response.success) {
        // Update booking in local state
        const updatedBookings = bookings.map(b =>
            b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b
        );

        console.log("Updating bookings after cancellation");
        setBookings(updatedBookings);
        toast.success(t("bookingHistory.cancelSuccess") || "Бронирование успешно отменено");
      } else {
        const errorMsg = response.error || "Failed to cancel booking";
        console.error("Error cancelling booking:", errorMsg);
        setError(errorMsg);
        toast.error(errorMsg || t("bookingHistory.cancelError") || "Ошибка при отмене бронирования");
      }
    } catch (error) {
      console.error("Exception cancelling booking:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error(t("bookingHistory.cancelError") || "Ошибка при отмене бронирования");
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
      setSelectedBooking(null);
    }
  };

  const openCancelDialog = (booking: Booking) => {
    console.log("Opening cancel dialog for booking:", booking);
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const canBeCancelled = (booking: Booking) => {
    return booking.status === 'pending' || booking.status === 'approved';
  };

  // Function to render booking cards for mobile view
  const renderBookingCard = (booking: Booking) => {
    return (
        <Card key={booking.id} className="mb-4">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Room and Status */}
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{booking.room_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.room_category}, {booking.room_capacity} мест
                    </div>
                  </div>
                </div>
                <div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Date and Time */}
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm">{formatDateTime(booking.from_date)}</div>
                  <div className="text-xs text-muted-foreground">
                    до {formatDateTime(booking.until_date)}
                  </div>
                </div>
              </div>

              {/* Purpose and Attendees */}
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm truncate" title={booking.purpose}>
                    {booking.purpose || "Цель не указана"}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {booking.attendees} {
                    booking.attendees === 1 ? 'участник' :
                        (booking.attendees >= 2 && booking.attendees <= 4) ? 'участника' : 'участников'
                  }
                  </div>
                </div>
              </div>

              {/* Secret Code if available */}
              {booking.status === 'approved' && booking.secret_code && (
                  <div className="bg-gray-100 rounded p-2 text-sm font-mono">
                    Код доступа: {booking.secret_code}
                  </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end mt-2">
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
          </CardContent>
        </Card>
    );
  };

  return (
      <PageLayout role="student">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("bookingHistory.title") || "История бронирований"}</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {t("bookingHistory.subtitle") || "Просмотр и управление вашими бронированиями аудиторий"}
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

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex flex-wrap gap-1 h-auto">
              <TabsTrigger value="all" className="px-3 py-1.5 h-auto text-sm">
                {t("bookingHistory.tabs.all") || "Все"}
              </TabsTrigger>
              <TabsTrigger value="pending" className="px-3 py-1.5 h-auto text-sm">
                {t("bookingHistory.tabs.pending") || "Ожидающие"}
              </TabsTrigger>
              <TabsTrigger value="approved" className="px-3 py-1.5 h-auto text-sm">
                {t("bookingHistory.tabs.approved") || "Подтвержденные"}
              </TabsTrigger>
              <TabsTrigger value="completed" className="px-3 py-1.5 h-auto text-sm">
                {t("bookingHistory.tabs.completed") || "Завершенные"}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="px-3 py-1.5 h-auto text-sm">
                {t("bookingHistory.tabs.rejected") || "Отклоненные"}
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">{t("common.loading") || "Загрузка..."}</span>
                </div>
            ) : error ? (
                <Card>
                  <CardContent className="py-6">
                    <div className="text-center text-destructive">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <h3 className="font-medium text-lg mb-1">{t("common.error") || "Ошибка"}</h3>
                      <p className="mb-4">{error}</p>
                      <Button onClick={loadBookings}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("common.retry") || "Попробовать снова"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            ) : filteredBookings && filteredBookings.length > 0 ? (
                <>
                  {/* Mobile card view */}
                  <div className="md:hidden">
                    {filteredBookings.map(booking => renderBookingCard(booking))}
                  </div>

                  {/* Desktop table view */}
                  <div className="hidden md:block">
                    <Card>
                      <CardContent className="pt-6 overflow-auto">
                        <div className="min-w-full overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Аудитория</TableHead>
                                <TableHead>Дата и время</TableHead>
                                <TableHead>Цель</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredBookings.map(booking => (
                                  <TableRow key={booking.id}>
                                    <TableCell className="font-medium">
                                      <div className="flex items-start gap-2">
                                        <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div>
                                          <div>{booking.room_name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {booking.room_category}, {booking.room_capacity} мест
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-start gap-2">
                                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div>
                                          <div>{formatDateTime(booking.from_date)}</div>
                                          <div className="text-xs text-muted-foreground">
                                            до {formatDateTime(booking.until_date)}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="max-w-xs truncate" title={booking.purpose}>
                                        {booking.purpose || "Не указана"}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {booking.attendees} {
                                        booking.attendees === 1 ? 'участник' :
                                            (booking.attendees >= 2 && booking.attendees <= 4) ? 'участника' : 'участников'
                                      }
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(booking.status)}

                                      {booking.status === 'approved' && booking.secret_code && (
                                          <div className="mt-1 text-xs font-mono bg-gray-100 rounded p-1 max-w-fit">
                                            Код: {booking.secret_code}
                                          </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
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
                                    </TableCell>
                                  </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
            ) : (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t("bookingHistory.noBookings") || "Нет бронирований"}</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                        {activeTab === "all"
                            ? (t("bookingHistory.noBookingsDesc") || "У вас пока нет бронирований аудиторий. Создайте новое бронирование, чтобы оно появилось в этом списке.")
                            : (t("bookingHistory.noCategoryBookings") || "В данной категории нет бронирований.")}
                      </p>
                      <Button onClick={() => navigate('/student/booking')}>
                        <BookMarked className="h-4 w-4 mr-2" />
                        {t("bookingHistory.createNew") || "Забронировать аудиторию"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            )}
          </Tabs>
        </div>

        {/* Cancel Booking Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("bookingHistory.confirmCancel") || "Подтверждение отмены"}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("bookingHistory.confirmCancelDesc") || "Вы уверены, что хотите отменить бронирование аудитории"} {selectedBooking?.room_name}?
                <br />
                {t("bookingDetails.cancelWarning") || "Это действие нельзя будет отменить."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>{t("common.cancel") || "Отмена"}</AlertDialogCancel>
              <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleCancelBooking();
                  }}
                  disabled={isCancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isCancelling ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("bookingHistory.cancelling") || "Отмена бронирования..."}</>
                ) : (
                    t("bookingHistory.cancelAction") || 'Да, отменить бронирование'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageLayout>
  );
};

export default BookingHistoryPage;