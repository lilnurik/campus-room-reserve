
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Download, File, Loader2, Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/context/LanguageContext";

// Mock booking history
const mockBookings = [
    {
        id: 1,
        room: "A101",
        room_category: "lecture",
        date: "2025-04-01",
        startTime: "10:00",
        endTime: "12:00",
        status: "completed",
        purpose: "Department Meeting"
    },
    {
        id: 2,
        room: "B202",
        room_category: "seminar",
        date: "2025-04-05",
        startTime: "14:00",
        endTime: "16:00",
        status: "cancelled",
        purpose: "Team Workshop"
    },
    {
        id: 3,
        room: "C301",
        room_category: "computer_lab",
        date: "2025-04-10",
        startTime: "09:00",
        endTime: "11:00",
        status: "upcoming",
        purpose: "Software Training"
    },
    {
        id: 4,
        room: "D401",
        room_category: "conference",
        date: "2025-04-15",
        startTime: "13:00",
        endTime: "15:00",
        status: "upcoming",
        purpose: "Client Presentation"
    }
];

// For department bookings (as manager)
const mockDepartmentBookings = [
    {
        id: 5,
        room: "A102",
        room_category: "lecture",
        date: "2025-04-02",
        startTime: "11:00",
        endTime: "13:00",
        status: "completed",
        purpose: "Department Meeting",
        employee: "Анна Иванова"
    },
    {
        id: 6,
        room: "B203",
        room_category: "seminar",
        date: "2025-04-07",
        startTime: "15:00",
        endTime: "17:00",
        status: "upcoming",
        purpose: "Team Planning",
        employee: "Дмитрий Петров"
    },
    {
        id: 7,
        room: "C302",
        room_category: "computer_lab",
        date: "2025-04-12",
        startTime: "10:00",
        endTime: "12:00",
        status: "upcoming",
        purpose: "Software Testing",
        employee: "Елена Сидорова"
    }
];

const HistoryPage = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState(mockBookings);
    const [departmentBookings, setDepartmentBookings] = useState(mockDepartmentBookings);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Fetch bookings (mock)
    useEffect(() => {
        const loadData = async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
        };

        loadData();
    }, []);

    // Apply filters to bookings
    const filteredBookings = bookings.filter(booking => {
        // Search term filter
        const matchesSearch =
            booking.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.purpose.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus =
            statusFilter === "all" ||
            booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Apply filters to department bookings
    const filteredDepartmentBookings = departmentBookings.filter(booking => {
        // Search term filter
        const matchesSearch =
            booking.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.employee.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus =
            statusFilter === "all" ||
            booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Завершено</Badge>;
            case "upcoming":
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Предстоит</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Отменено</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
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
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все статусы</SelectItem>
                                <SelectItem value="upcoming">Предстоящие</SelectItem>
                                <SelectItem value="completed">Завершенные</SelectItem>
                                <SelectItem value="cancelled">Отмененные</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <File className="mr-2 h-4 w-4" />
                            Экспорт
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="personal">
                    <TabsList className="mb-6">
                        <TabsTrigger value="personal">Мои бронирования</TabsTrigger>
                        <TabsTrigger value="department">Бронирования отдела</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Мои бронирования</CardTitle>
                                <CardDescription>
                                    Все аудитории, которые вы забронировали
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : filteredBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredBookings.map((booking) => (
                                            <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium text-lg">Аудитория {booking.room}</h3>
                                                            {getStatusBadge(booking.status)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{booking.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{booking.startTime} - {booking.endTime}</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            Цель: {booking.purpose}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm">
                                                            Подробнее
                                                        </Button>
                                                        {booking.status === "upcoming" && (
                                                            <Button variant="destructive" size="sm">
                                                                Отменить
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        {searchTerm || statusFilter !== "all"
                                            ? "Нет бронирований, соответствующих фильтрам"
                                            : "У вас еще нет бронирований"}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="department" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Бронирования отдела</CardTitle>
                                <CardDescription>
                                    Все бронирования сотрудников вашего отдела
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : filteredDepartmentBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredDepartmentBookings.map((booking) => (
                                            <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium text-lg">Аудитория {booking.room}</h3>
                                                            {getStatusBadge(booking.status)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{booking.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{booking.startTime} - {booking.endTime}</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            Сотрудник: <span className="font-medium">{booking.employee}</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            Цель: {booking.purpose}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm">
                                                            Подробнее
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        {searchTerm || statusFilter !== "all"
                                            ? "Нет бронирований, соответствующих фильтрам"
                                            : "В вашем отделе еще нет бронирований"}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PageLayout>
    );
};

export default HistoryPage;