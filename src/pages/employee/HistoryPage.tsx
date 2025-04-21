import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Calendar, Clock, Download, File, Key, Loader2, Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/context/LanguageContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";

// Types for API responses
interface Booking {
    id: number;
    room_id: number;
    room_name: string;
    room_category: string;
    room_building: string;
    date: string;
    start_time: string; // in HH:MM format
    end_time: string; // in HH:MM format
    from_date: string; // ISO format
    until_date: string; // ISO format
    purpose: string;
    creator_id: number;
    creator_name: string;
    is_creator: boolean;
    attendees_count: number;
    status: string;
    status_display: string;
    staff_ids: number[];
    staff_names: string[];
    created_at: string;
    can_request_key: boolean;
}

interface BookingResponse {
    bookings: Booking[];
    pagination: {
        current_page: number;
        per_page: number;
        total_pages: number;
        total_items: number;
    };
}

interface BookingDetailsProps {
    booking: Booking;
    onClose: () => void;
    onRequestKey: (bookingId: number) => void;
}

// Component to display booking details
const BookingDetails = ({ booking, onClose, onRequestKey }: BookingDetailsProps) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">Аудитория {booking.room_name}</h3>
                    <Badge
                        className={
                            booking.status === "completed" ? "bg-green-100 text-green-800" :
                                booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                                    booking.status === "key_issued" ? "bg-purple-100 text-purple-800" :
                                        booking.status === "key_requested" ? "bg-amber-100 text-amber-800" :
                                            "bg-blue-100 text-blue-800"
                        }
                    >
                        {booking.status_display}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.start_time} - {booking.end_time}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm">
                            <span className="text-muted-foreground">Категория:</span> {booking.room_category}
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Здание:</span> {booking.room_building}
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Участников:</span> {booking.attendees_count}
                        </div>
                    </div>
                </div>

                <div className="border-t pt-2 mt-2">
                    <h4 className="font-medium mb-1">Цель бронирования:</h4>
                    <p className="text-sm">{booking.purpose}</p>
                </div>

                {booking.staff_names && booking.staff_names.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                        <h4 className="font-medium mb-1">Участники:</h4>
                        <ul className="text-sm list-disc pl-5">
                            {booking.staff_names.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="border-t pt-2 mt-2">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Создатель:</span> {booking.creator_name}
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Создано:</span> {new Date(booking.created_at).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                {booking.can_request_key && (
                    <Button variant="default" onClick={() => onRequestKey(booking.id)}>
                        <Key className="mr-2 h-4 w-4" />
                        Запросить ключ
                    </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                    Закрыть
                </Button>
            </div>
        </div>
    );
};

const HistoryPage = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Dialog states
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isRequestingKey, setIsRequestingKey] = useState(false);

    // Fetch bookings from the API
    const fetchBookings = async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(
                `http://localhost:5321/api/bookings/staff/history?filter=${filterType}&page=${page}&per_page=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data: BookingResponse = await response.json();
            setBookings(data.bookings);
            setCurrentPage(data.pagination.current_page);
            setTotalPages(data.pagination.total_pages);
            setTotalItems(data.pagination.total_items);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
            setError(err instanceof Error ? err.message : 'Failed to load bookings');
            toast.error("Не удалось загрузить историю бронирований");
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchBookings();
    }, [filterType]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchBookings(page);
    };

    // Handle key request
    const handleRequestKey = async (bookingId: number) => {
        setIsRequestingKey(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(
                `http://localhost:5321/api/bookings/${bookingId}/request-key`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            toast.success("Запрос на получение ключа успешно отправлен");
            setIsDetailsOpen(false);

            // Refresh bookings list after key request
            fetchBookings(currentPage);
        } catch (err) {
            console.error("Failed to request key:", err);
            toast.error(err instanceof Error ? err.message : "Не удалось запросить ключ");
        } finally {
            setIsRequestingKey(false);
        }
    };

    // Apply local search filtering
    const filteredBookings = bookings.filter(booking =>
        booking.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.creator_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get status badge
    const getStatusBadge = (status: string, statusDisplay: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{statusDisplay}</Badge>;
            case "key_issued":
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{statusDisplay}</Badge>;
            case "key_requested":
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{statusDisplay}</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{statusDisplay}</Badge>;
            default:
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{statusDisplay}</Badge>;
        }
    };

    // Show booking details
    const showDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsDetailsOpen(true);
    };

    return (
        <PageLayout role="employee">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">История бронирований</h1>
                    <p className="text-muted-foreground">
                        Просмотр всех ваших бронирований аудиторий
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Поиск бронирований..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select
                            value={filterType}
                            onValueChange={(value) => {
                                setFilterType(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Фильтр" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все бронирования</SelectItem>
                                <SelectItem value="upcoming">Предстоящие</SelectItem>
                                <SelectItem value="current">Текущие</SelectItem>
                                <SelectItem value="past">Завершенные</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Мои бронирования</CardTitle>
                        <CardDescription>
                            Все аудитории, которые вы забронировали или в которых участвуете
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Ошибка</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : filteredBookings.length > 0 ? (
                            <div>
                                <div className="space-y-4">
                                    {filteredBookings.map((booking) => (
                                        <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-lg">Аудитория {booking.room_name}</h3>
                                                        {getStatusBadge(booking.status, booking.status_display)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{booking.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{booking.start_time} - {booking.end_time}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        Цель: {booking.purpose}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => showDetails(booking)}>
                                                        Подробнее
                                                    </Button>
                                                    {booking.can_request_key && (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleRequestKey(booking.id)}
                                                            disabled={isRequestingKey}
                                                        >
                                                            {isRequestingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            <Key className="mr-1 h-4 w-4" />
                                                            Запросить ключ
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                Предыдущая
                                            </Button>

                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </Button>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Следующая
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm
                                    ? "Нет бронирований, соответствующих поиску"
                                    : "У вас еще нет бронирований"}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Booking Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Детали бронирования</DialogTitle>
                        <DialogDescription>
                            Информация о забронированной аудитории
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking && (
                        <BookingDetails
                            booking={selectedBooking}
                            onClose={() => setIsDetailsOpen(false)}
                            onRequestKey={handleRequestKey}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
};

export default HistoryPage;