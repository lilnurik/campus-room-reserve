import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import {
    CalendarClock, MapPin, Users, Clock, AlertCircle,
    CheckCircle, XCircle, ArrowLeft, Loader2, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/context/LanguageContext";
import { roomsApi, Booking } from "@/services/api";
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

// Helper function to format date time
const formatDateTime = (dateStr: string) => {
    try {
        const date = parseISO(dateStr);
        return format(date, 'PPp', { locale: ru });
    } catch (e) {
        return dateStr;
    }
};

// Get status badge for the booking
const getStatusBadge = (status: string, t: (key: string) => string) => {
    switch (status) {
        case 'approved':
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t("bookingDetails.approved") || "Подтверждено"}
                </Badge>
            );
        case 'pending':
            return (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    <Clock className="h-3 w-3 mr-1" />
                    {t("bookingDetails.pending") || "Ожидает подтверждения"}
                </Badge>
            );
        case 'rejected':
            return (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <XCircle className="h-3 w-3 mr-1" />
                    {t("bookingDetails.rejected") || "Отклонено"}
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {t("bookingDetails.cancelled") || "Отменено"}
                </Badge>
            );
        case 'given':
            return (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t("booking.keyIssued") || "Ключ выдан"}
                </Badge>
            );
        case 'taken':
            return (
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t("booking.keyReturned") || "Ключ возвращен"}
                </Badge>
            );
        default:
            return <Badge>{status}</Badge>;
    }
};

// Status message and description
const getStatusInfo = (status: string, t: (key: string) => string) => {
    switch (status) {
        case 'approved':
            return {
                message: t("bookingDetails.approvedMessage") || "Бронирование подтверждено",
                description: t("bookingDetails.approvedDesc") || "Ваше бронирование подтверждено и готово к использованию"
            };
        case 'pending':
            return {
                message: t("bookingDetails.pendingMessage") || "Ожидает подтверждения",
                description: t("bookingDetails.pendingDesc") || "Ваше бронирование ожидает подтверждения администратором"
            };
        case 'rejected':
            return {
                message: t("bookingDetails.rejectedMessage") || "Бронирование отклонено",
                description: t("bookingDetails.rejectedDesc") || "Ваше бронирование было отклонено. Пожалуйста, выберите другое время или аудиторию"
            };
        case 'cancelled':
            return {
                message: t("bookingDetails.cancelledMessage") || "Бронирование отменено",
                description: t("bookingDetails.cancelledDesc") || "Вы отменили это бронирование"
            };
        case 'given':
            return {
                message: t("booking.keyIssued") || "Ключ выдан",
                description: "Ключ был выдан и аудитория доступна для использования"
            };
        case 'taken':
            return {
                message: t("booking.keyReturned") || "Ключ возвращен",
                description: "Ключ был возвращен и бронирование завершено"
            };
        default:
            return {
                message: status,
                description: ""
            };
    }
};

// Status icon component
const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'approved':
        case 'given':
        case 'taken':
            return <CheckCircle className="h-8 w-8 text-green-600" />;
        case 'pending':
            return <Clock className="h-8 w-8 text-yellow-600" />;
        case 'rejected':
            return <XCircle className="h-8 w-8 text-red-600" />;
        case 'cancelled':
            return <AlertCircle className="h-8 w-8 text-slate-600" />;
        default:
            return <AlertCircle className="h-8 w-8 text-slate-600" />;
    }
};

const BookingDetailsPage = () => {
    const { t } = useTranslation();
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    // Load booking details
    useEffect(() => {
        if (!bookingId) {
            navigate('/student/bookings');
            return;
        }

        const loadBooking = async () => {
            setIsLoading(true);
            try {
                const response = await roomsApi.getBookingById(parseInt(bookingId));
                if (response.success && response.data) {
                    setBooking(response.data);
                } else {
                    toast.error(t("bookingDetails.errorLoading") || "Ошибка загрузки данных бронирования");
                    setTimeout(() => navigate('/student/bookings'), 2000);
                }
            } catch (error) {
                console.error('Error loading booking:', error);
                toast.error(t("bookingDetails.errorLoading") || "Ошибка загрузки данных бронирования");
                setTimeout(() => navigate('/student/bookings'), 2000);
            } finally {
                setIsLoading(false);
            }
        };

        loadBooking();
    }, [bookingId, navigate]);

    // Function to cancel booking
    const handleCancelBooking = async () => {
        if (!booking) return;

        setIsCancelling(true);
        try {
            const response = await roomsApi.cancelBooking(booking.id);
            if (response.success) {
                toast.success(t("bookingDetails.cancelSuccess") || "Бронирование успешно отменено");
                setBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
                setShowCancelDialog(false);
            } else {
                toast.error(response.error || t("bookingDetails.cancelError") || "Ошибка при отмене бронирования");
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            toast.error(t("bookingDetails.cancelError") || "Ошибка при отмене бронирования");
        } finally {
            setIsCancelling(false);
        }
    };

    // Check if booking can be cancelled
    const canBeCancelled = (booking: Booking) => {
        return booking.status === 'pending' || booking.status === 'approved';
    };

    // Get status information
    const statusInfo = booking ? getStatusInfo(booking.status, t) : { message: "", description: "" };

    return (
        <PageLayout role="student">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/student/bookings')}
                                className="mr-1"
                            >
                                <ArrowLeft size={18} />
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {t("bookingDetails.title") || "Детали бронирования"}
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            {t("bookingDetails.subtitle") || "Информация о вашем бронировании"}
                        </p>
                    </div>

                    {booking && canBeCancelled(booking) && (
                        <Button
                            variant="destructive"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("bookingDetails.cancelBooking") || "Отменить бронирование"}
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">{t("common.loading") || "Загрузка..."}</span>
                    </div>
                ) : booking ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{booking.room_name}</CardTitle>
                                        <CardDescription>
                                            {booking.room_category}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(booking.status, t)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2 p-3 border rounded-md">
                                        <CalendarClock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">{t("bookingDetails.dateTime") || "Дата и время"}</p>
                                            <p className="text-sm">{formatDateTime(booking.from_date)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                до {formatDateTime(booking.until_date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 p-3 border rounded-md">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">{t("bookingDetails.location") || "Местоположение"}</p>
                                            <p className="text-sm">{booking.room_name}</p>
                                            <p className="text-sm text-muted-foreground">{booking.room_category}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">{t("bookingDetails.bookingDetails") || "Информация о бронировании"}</h3>
                                    <Separator />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 pt-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("bookingDetails.purpose") || "Цель бронирования"}</p>
                                            <p>{booking.purpose || "Не указана"}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("bookingDetails.attendees") || "Количество участников"}</p>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{booking.attendees}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("bookingDetails.bookingId") || "Номер бронирования"}</p>
                                            <p className="font-mono">BK-{booking.id}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("bookingDetails.created") || "Создано"}</p>
                                            <p>{formatDateTime(booking.created_at)}</p>
                                        </div>

                                        {booking.secret_code && booking.status === 'approved' && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">{t("booking.accessCode") || "Код доступа"}</p>
                                                <p className="font-mono">{booking.secret_code}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("bookingDetails.status") || "Статус бронирования"}</CardTitle>
                                <CardDescription>
                                    {t("bookingDetails.currentStatus") || "Текущий статус вашего бронирования"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex justify-center mb-4">
                                    <div className={`rounded-full p-3 ${
                                        booking.status === 'approved' ? 'bg-green-100' :
                                            booking.status === 'pending' ? 'bg-yellow-100' :
                                                booking.status === 'rejected' ? 'bg-red-100' :
                                                    booking.status === 'cancelled' ? 'bg-slate-100' :
                                                        booking.status === 'given' ? 'bg-blue-100' :
                                                            booking.status === 'taken' ? 'bg-purple-100' :
                                                                'bg-slate-100'
                                    }`}>
                                        <StatusIcon status={booking.status} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-center">
                                        {statusInfo.message}
                                    </h3>

                                    <p className="text-sm text-muted-foreground text-center mt-2">
                                        {statusInfo.description}
                                    </p>
                                </div>

                                {booking.status === 'approved' && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <CalendarClock className="h-4 w-4 mr-2" />
                                        {t("bookingDetails.addToCalendar") || "Добавить в календарь"}
                                    </Button>
                                )}

                                {canBeCancelled(booking) && (
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => setShowCancelDialog(true)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t("bookingDetails.cancelBooking") || "Отменить бронирование"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-lg font-medium">
                            {t("bookingDetails.notFound") || "Бронирование не найдено"}
                        </h2>
                        <p className="text-muted-foreground">
                            {t("bookingDetails.notFoundDesc") || "Запрашиваемое бронирование не найдено или у вас нет к нему доступа"}
                        </p>
                        <Button className="mt-4" onClick={() => navigate('/student/dashboard')}>
                            {t("bookingDetails.backToDashboard") || "Вернуться на главную"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Cancel Booking Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("bookingDetails.confirmCancel") || "Подтвердите отмену"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("bookingDetails.cancelWarning") || "Вы уверены, что хотите отменить это бронирование? Это действие нельзя отменить."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t("common.cancel") || "Отмена"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleCancelBooking();
                            }}
                            disabled={isCancelling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isCancelling ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.loading") || "Загрузка..."}</>
                            ) : (
                                t("bookingDetails.confirmCancelAction") || "Да, отменить бронирование"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
};

export default BookingDetailsPage;