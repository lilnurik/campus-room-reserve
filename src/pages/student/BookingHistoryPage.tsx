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
  BookOpen, Loader2, RefreshCw, Building, BookMarked
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { roomsApi, Booking } from "@/services/api";
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
      // ... continuing from before
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load bookings
  useEffect(() => {
    loadBookings();
  }, []);

  // Filter bookings when tab changes
  useEffect(() => {
    filterBookings(activeTab);
  }, [activeTab, bookings]);

  const loadBookings = async () => {
    setIsLoading(true);

    try {
      const response = await roomsApi.getUserBookings();

      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        toast.error("Ошибка загрузки бронирований");
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Ошибка загрузки бронирований");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBookings = async () => {
    setIsRefreshing(true);

    try {
      const response = await roomsApi.getUserBookings();

      if (response.success && response.data) {
        setBookings(response.data);
        toast.success("Данные обновлены");
      } else {
        toast.error("Ошибка обновления данных");
      }
    } catch (error) {
      console.error("Error refreshing bookings:", error);
      toast.error("Ошибка обновления данных");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterBookings = (tab: string) => {
    switch (tab) {
      case "pending":
        setFilteredBookings(bookings.filter(b => b.status === 'pending'));
        break;
      case "approved":
        setFilteredBookings(bookings.filter(b => b.status === 'approved' || b.status === 'given'));
        break;
      case "completed":
        setFilteredBookings(bookings.filter(b => b.status === 'taken'));
        break;
      case "rejected":
        setFilteredBookings(bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled'));
        break;
      case "all":
      default:
        setFilteredBookings(bookings);
        break;
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsCancelling(true);

    try {
      const response = await roomsApi.cancelBooking(selectedBooking.id);

      if (response.success) {
        // Update booking in local state
        const updatedBookings = bookings.map(b =>
            b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b
        );

        setBookings(updatedBookings);
        filterBookings(activeTab);
        toast.success("Бронирование успешно отменено");
      } else {
        toast.error(response.error || "Ошибка при отмене бронирования");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
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

  return (
      <PageLayout role="student">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("bookingHistory.title") || "История бронирований"}</h1>
              <p className="text-muted-foreground">
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
            <TabsList className="mb-4">
              <TabsTrigger value="all">{t("bookingHistory.tabs.all") || "Все"}</TabsTrigger>
              <TabsTrigger value="pending">{t("bookingHistory.tabs.pending") || "Ожидающие"}</TabsTrigger>
              <TabsTrigger value="approved">{t("bookingHistory.tabs.approved") || "Подтвержденные"}</TabsTrigger>
              <TabsTrigger value="completed">{t("bookingHistory.tabs.completed") || "Завершенные"}</TabsTrigger>
              <TabsTrigger value="rejected">{t("bookingHistory.tabs.rejected") || "Отклоненные"}</TabsTrigger>
            </TabsList>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">{t("common.loading") || "Загрузка..."}</span>
                </div>
            ) : filteredBookings.length > 0 ? (
                <Card>
                  <CardContent className="pt-6">
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
                                  {booking.attendees} {booking.attendees === 1 ? 'участник' : 'участников'}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(booking.status)}

                                {booking.status === 'approved' && booking.secret_code && (
                                    <div className="mt-1 text-xs font-mono">
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
                  </CardContent>
                </Card>
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