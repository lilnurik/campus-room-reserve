import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Search, Info, Loader2, Users, ClockIcon, AlertTriangle, WrenchIcon } from "lucide-react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageLayout from "@/components/PageLayout";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";

// Services
import { roomsApi } from "@/services/api";

// Interfaces
interface Room {
    id: string | number;
    name: string;
    category: string;
    capacity: number;
    status: string;
    building?: string;
}

interface TimeSlot {
    id: string;
    start: string; // HH:MM
    end: string;   // HH:MM
    isAvailable: boolean;
}

interface StaffMember {
    id: number;
    username: string;
    full_name: string;
    email: string;
    department: string;
    internal_id: string;
    status: string;
}

const BookingPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    // State for rooms and date/time
    const [date, setDate] = useState<Date>(new Date());
    const [searchTerm, setSearchTerm] = useState("");
    const [rooms, setRooms] = useState<Room[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    // Staff state
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [showEmployeeSelect, setShowEmployeeSelect] = useState(true); // По умолчанию показываем
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [searchEmployee, setSearchEmployee] = useState("");

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
    const [loadingStaff, setLoadingStaff] = useState(false);

    // Booking form
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [purpose, setPurpose] = useState("");
    const [attendees, setAttendees] = useState<number>(1);

    // Tab filtering
    const [activeTab, setActiveTab] = useState("all");

    // Current date/time and user
    const [currentDateTime, setCurrentDateTime] = useState("2025-05-02 04:53:12");
    const [currentUser, setCurrentUser] = useState("lilnurik");

    // Load rooms and staff on initial render
    useEffect(() => {
        console.log("Component mounted - loading initial data");
        loadRooms();
        // Запрашиваем список сотрудников сразу при открытии страницы
        loadStaffMembers();
    }, []);

    // Load time slots when date or room changes
    useEffect(() => {
        if (date && selectedRoom) {
            loadTimeSlots();
        }
    }, [date, selectedRoom]);

    // Load rooms
    const loadRooms = async () => {
        setLoadingRooms(true);
        try {
            const response = await roomsApi.getAll();
            if (response.success && response.data) {
                setRooms(response.data);
            } else {
                toast.error(response.error || "Failed to load rooms");
            }
        } catch (error) {
            console.error("Error loading rooms:", error);
            toast.error("Failed to load rooms");
        } finally {
            setLoadingRooms(false);
        }
    };

    // Load staff members directly with fetch
    const loadStaffMembers = async () => {
        setLoadingStaff(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No auth token available");
                toast.error("Требуется авторизация");
                return;
            }

            console.log("Fetching staff members from /api/staff/subordinates");

            // Напрямую делаем запрос на API
            const response = await fetch("http://localhost:5321/api/staff/subordinates", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            console.log("Staff API response status:", response.status);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Staff members loaded:", data);
            setStaffMembers(data);

            // Выбираем всех сотрудников по умолчанию
            if (data && data.length > 0) {
                setSelectedEmployees(data.map(staff => staff.id));
            }
        } catch (error) {
            console.error("Error loading staff members:", error);
            toast.error("Не удалось загрузить список сотрудников");
        } finally {
            setLoadingStaff(false);
        }
    };

    // Load time slots
    const loadTimeSlots = async () => {
        setLoadingTimeSlots(true);
        try {
            if (!date || !selectedRoom) return;
            const formattedDate = format(date, "yyyy-MM-dd");
            const response = await roomsApi.getRoomAvailability(selectedRoom, formattedDate);

            if (response.success && response.data && response.data.timeSlots) {
                const formattedTimeSlots = response.data.timeSlots.map((slot: any, idx: number) => ({
                    id: idx.toString(),
                    start: format(new Date(slot.start), "HH:mm"),
                    end: format(new Date(slot.end), "HH:mm"),
                    isAvailable: slot.isAvailable,
                }));
                setTimeSlots(formattedTimeSlots);
            } else {
                setTimeSlots([
                    { id: "1", start: "09:00", end: "10:30", isAvailable: true },
                    { id: "2", start: "10:45", end: "12:15", isAvailable: true },
                    { id: "3", start: "12:30", end: "14:00", isAvailable: true },
                ]);
                if (response.error) {
                    toast.error(response.error || "Failed to load availability");
                }
            }
        } catch (error) {
            console.error("Error loading time slots:", error);
            toast.error("Failed to load time slots");
        } finally {
            setLoadingTimeSlots(false);
        }
    };

    // Filter rooms based on search and tab
    // Modified to filter out rooms with status "unavailable"
    const filteredRooms = rooms.filter((room) => {
        // First, filter out rooms with status "unavailable"
        if (room.status === "unavailable") {
            return false;
        }

        const matchesSearch =
            room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab =
            activeTab === "all" ||
            (activeTab === "lecture" && room.category === "lecture") ||
            (activeTab === "seminar" && room.category === "seminar") ||
            (activeTab === "other" && !["lecture", "seminar"].includes(room.category));

        return matchesSearch && matchesTab;
    });

    // Filter staff based on search
    const filteredStaff = staffMembers.filter(staff =>
        staff.full_name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
        staff.internal_id.toLowerCase().includes(searchEmployee.toLowerCase())
    );

    // Toggle staff selection
    const toggleEmployeeSelection = (employeeId: number) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    // Submit booking - always to /api/bookings/bulk endpoint
    const handleBookingSubmit = async () => {
        if (!selectedRoom || !selectedTimeSlot || !purpose || !date) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        setLoading(true);
        try {
            const slot = timeSlots.find((s) => s.id === selectedTimeSlot);
            if (!slot) {
                toast.error("Некорректный временной слот");
                setLoading(false);
                return;
            }

            const dateStr = format(date, "yyyy-MM-dd");
            const startISO = new Date(`${dateStr}T${slot.start}:00`).toISOString();
            const endISO = new Date(`${dateStr}T${slot.end}:00`).toISOString();

            // Если выбраны сотрудники и есть список
            let staffIds: number[];
            if (showEmployeeSelect && selectedEmployees.length > 0) {
                staffIds = selectedEmployees;
            } else {
                // Бронируем только для текущего пользователя
                staffIds = user?.id ? [user.id] : [];
            }

            console.log("Sending booking request to /api/bookings/bulk with staff_ids:", staffIds);

            const token = localStorage.getItem("authToken");
            if (!token) {
                toast.error("Не авторизован. Пожалуйста, войдите снова.");
                setLoading(false);
                return;
            }

            const response = await fetch("http://localhost:5321/api/bookings/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    room_id: Number(selectedRoom),
                    start_time: startISO,
                    end_time: endISO,
                    purpose,
                    staff_ids: staffIds,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                if (staffIds.length > 1) {
                    toast.success(`Забронировано для ${staffIds.length} сотрудников`);
                } else {
                    toast.success(`Аудитория забронирована на ${format(date, "dd.MM.yyyy")} ${slot.start}-${slot.end}`);
                }

                // Reset form
                setSelectedRoom(null);
                setSelectedTimeSlot(null);
                setPurpose("");
                setAttendees(1);
            } else {
                toast.error(data?.error || data?.message || "Ошибка при бронировании");
            }
        } catch (error) {
            console.error("Booking error:", error);
            toast.error("Ошибка при отправке запроса на бронирование");
        } finally {
            setLoading(false);
        }
    };

    // Отображение списка сотрудников
    const renderStaffSelection = () => {
        if (!showEmployeeSelect) return null;

        return (
            <div className="mb-4">
                <Label className="mb-2 font-medium">Сотрудники отдела</Label>

                {loadingStaff ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredStaff.length > 0 ? (
                    <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
                        <div className="mb-2 flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                                Выбрано: {selectedEmployees.length} из {staffMembers.length}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (selectedEmployees.length === staffMembers.length) {
                                        setSelectedEmployees([]);
                                    } else {
                                        setSelectedEmployees(staffMembers.map(staff => staff.id));
                                    }
                                }}
                            >
                                {selectedEmployees.length === staffMembers.length ?
                                    "Снять выбор" : "Выбрать всех"}
                            </Button>
                        </div>

                        <div className="relative mb-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Поиск сотрудников..."
                                className="pl-8"
                                value={searchEmployee}
                                onChange={(e) => setSearchEmployee(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            {filteredStaff.map(staff => (
                                <div
                                    key={staff.id}
                                    className="flex items-center p-1 hover:bg-accent rounded"
                                >
                                    <Checkbox
                                        id={`staff-${staff.id}`}
                                        checked={selectedEmployees.includes(staff.id)}
                                        onCheckedChange={() => toggleEmployeeSelection(staff.id)}
                                        className="mr-2"
                                    />
                                    <Label
                                        htmlFor={`staff-${staff.id}`}
                                        className="text-sm cursor-pointer flex-1"
                                    >
                                        {staff.full_name}
                                        <span className="block text-xs text-muted-foreground">
                                          {staff.internal_id} • {staff.department}
                                        </span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 border rounded-md text-muted-foreground">
                        {staffMembers.length === 0 ? "Нет доступных сотрудников" : "Нет результатов поиска"}
                    </div>
                )}
            </div>
        );
    };

    // Custom status badge for rooms
    const RoomStatusBadge = ({ status }: { status: string }) => {
        if (status === "maintenance") {
            return (
                <Badge className="bg-orange-100 text-orange-800 ml-2 text-xs">
                    <WrenchIcon className="h-3 w-3 mr-1" />
                    На обслуживании
                </Badge>
            );
        }
        return null;
    };

    return (
        <PageLayout role="employee">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Бронирование помещений</h1>
                    <p className="text-muted-foreground">Выберите дату, время и аудиторию</p>
                </div>

                {/* Current user and date info */}
                <div className="text-sm text-muted-foreground text-right">
                    Пользователь: {currentUser} | {currentDateTime}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Дата</CardTitle>
                            <CardDescription>Выберите нужную дату</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(newDate) => {
                                    if (newDate) {
                                        setDate(newDate);
                                        setSelectedTimeSlot(null);
                                    }
                                }}
                                className="rounded-md border"
                                disabled={(d) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return d < today;
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* List of rooms */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Выберите аудиторию</CardTitle>
                            <CardDescription>Поиск и фильтр</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Поиск..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Tabs defaultValue="all" onValueChange={setActiveTab}>
                                <TabsList className="grid grid-cols-4 mb-4">
                                    <TabsTrigger value="all">Все</TabsTrigger>
                                    <TabsTrigger value="lecture">Лекции</TabsTrigger>
                                    <TabsTrigger value="seminar">Семинары</TabsTrigger>
                                    <TabsTrigger value="other">Другие</TabsTrigger>
                                </TabsList>

                                <ScrollArea className="h-64">
                                    {loadingRooms ? (
                                        <div className="flex justify-center py-6">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : filteredRooms.length > 0 ? (
                                        filteredRooms.map((room) => {
                                            const isOnMaintenance = room.status === "maintenance";
                                            return (
                                                <div
                                                    key={room.id}
                                                    className={`p-3 mb-2 border rounded-md ${
                                                        isOnMaintenance ?
                                                            "bg-orange-50 cursor-not-allowed opacity-75" :
                                                            "cursor-pointer " + (
                                                                selectedRoom === room.id.toString()
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "hover:bg-accent"
                                                            )
                                                    }`}
                                                    onClick={() => {
                                                        if (!isOnMaintenance) {
                                                            setSelectedRoom(room.id.toString());
                                                        }
                                                    }}
                                                >
                                                    <div className="font-medium flex items-center">
                                                        {room.name}
                                                        <RoomStatusBadge status={room.status} />
                                                    </div>
                                                    <div className="text-sm flex justify-between">
                                                        <span>
                                                            {room.category === "lecture"
                                                                ? "Лекционная"
                                                                : room.category === "seminar"
                                                                    ? "Семинарская"
                                                                    : "Прочее"}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Users className="h-3 w-3 mr-1" />
                                                            {room.capacity}
                                                        </span>
                                                    </div>
                                                    {isOnMaintenance && (
                                                        <div className="text-xs text-orange-700 mt-1 flex items-center">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Аудитория на обслуживании и недоступна для бронирования
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-sm text-muted-foreground py-6">
                                            Нет доступных аудиторий
                                        </div>
                                    )}
                                </ScrollArea>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Booking form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Детали бронирования</CardTitle>
                            <CardDescription>Заполните форму</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedRoom ? (
                                <>
                                    <Label className="mb-1">Аудитория:</Label>
                                    <div className="p-2 mb-3 border rounded bg-secondary">
                                        {rooms.find((r) => r.id.toString() === selectedRoom)?.name || ""}
                                    </div>

                                    <Label className="mb-1">Выбранная дата:</Label>
                                    <div className="p-2 mb-3 border rounded bg-secondary">
                                        {date ? format(date, "dd.MM.yyyy") : "Не выбрано"}
                                    </div>

                                    <Label className="mb-1">Временные слоты:</Label>
                                    {loadingTimeSlots ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {timeSlots.map((slot) => (
                                                <Button
                                                    key={slot.id}
                                                    variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                                                    onClick={() => setSelectedTimeSlot(slot.id)}
                                                    disabled={!slot.isAvailable}
                                                >
                                                    <ClockIcon className="mr-1 h-4 w-4" />
                                                    {slot.start}-{slot.end}
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <Label htmlFor="purpose" className="mb-1">Цель:</Label>
                                        <Textarea
                                            id="purpose"
                                            value={purpose}
                                            onChange={(e) => setPurpose(e.target.value)}
                                            placeholder="Например: совещание"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <Label htmlFor="attendees" className="mb-1">Участники:</Label>
                                        <Input
                                            id="attendees"
                                            type="number"
                                            min={1}
                                            value={attendees}
                                            onChange={(e) => setAttendees(parseInt(e.target.value, 10) || 1)}
                                        />
                                    </div>

                                    {/* Включаем отображение списка сотрудников */}
                                    <div className="mb-4">
                                        <div className="flex items-center mb-2">
                                            <Checkbox
                                                id="showEmployees"
                                                checked={showEmployeeSelect}
                                                onCheckedChange={(checked) => setShowEmployeeSelect(checked === true)}
                                                className="mr-2"
                                            />
                                            <Label htmlFor="showEmployees">Забронировать для сотрудников отдела</Label>
                                        </div>

                                        {/* Встроенный список сотрудников */}
                                        {renderStaffSelection()}
                                    </div>

                                    <Separator className="my-3" />

                                    <Button
                                        className="w-full"
                                        onClick={handleBookingSubmit}
                                        disabled={!selectedRoom || !selectedTimeSlot || !purpose || loading}
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Забронировать
                                    </Button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground">
                                    <Info className="h-12 w-12 mb-3" />
                                    Выберите аудиторию слева
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
};

export default BookingPage;