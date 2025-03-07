
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar as CalendarIcon, Clock, User, Building, UsersRound } from "lucide-react";
import RoomCard from "@/components/RoomCard";
import TimeSlotCard from "@/components/TimeSlotCard";
import PageLayout from "@/components/PageLayout";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { formatDate, formatTime, formatDuration, getStatusColor, getTimeDifferenceInMinutes, generateId } from "@/lib/utils";

// Define interfaces
interface Room {
  id: string;
  name: string;
  building: string;
  title: string;
  capacity: number;
  features: string[];
  status: "available" | "maintenance" | "unavailable";
  type: string;
}

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  status: "available" | "booked" | "class" | "maintenance";
}

interface Booking {
  id: string;
  room: Room;
  student_id: string;
  student_name: string;
  start: string;
  end: string;
  status: string;
  key_issued: boolean;
  key_returned: boolean;
  access_code: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockRooms: Room[] = [
  {
    id: "1",
    name: "А101",
    building: "Главный корпус",
    title: "Лекционная аудитория",
    capacity: 120,
    features: ["Проектор", "Компьютер", "Микрофон"],
    status: "available",
    type: "lecture"
  },
  {
    id: "2",
    name: "Б203",
    building: "Корпус Б",
    title: "Компьютерный класс",
    capacity: 30,
    features: ["Компьютеры", "Интерактивная доска"],
    status: "available",
    type: "computer"
  },
  {
    id: "3",
    name: "В305",
    building: "Корпус В",
    title: "Семинарская комната",
    capacity: 25,
    features: ["Круглый стол", "Флипчарт"],
    status: "available",
    type: "seminar"
  },
  {
    id: "4",
    name: "Г407",
    building: "Корпус Г",
    title: "Лаборатория",
    capacity: 20,
    features: ["Лабораторное оборудование", "Компьютеры"],
    status: "available",
    type: "lab"
  }
];

const mockTimeSlots: TimeSlot[] = [
  {
    id: "1",
    start: "2024-09-15T08:00:00",
    end: "2024-09-15T09:30:00",
    status: "available"
  },
  {
    id: "2",
    start: "2024-09-15T10:00:00",
    end: "2024-09-15T11:30:00",
    status: "booked"
  },
  {
    id: "3",
    start: "2024-09-15T12:00:00",
    end: "2024-09-15T13:30:00",
    status: "class"
  },
  {
    id: "4",
    start: "2024-09-15T14:00:00",
    end: "2024-09-15T15:30:00",
    status: "available"
  },
  {
    id: "5",
    start: "2024-09-15T16:00:00",
    end: "2024-09-15T17:30:00",
    status: "maintenance"
  }
];

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  // Filter rooms based on search query
  const filteredRooms = mockRooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle room selection
  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setStep(2);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (selectedRoom && selectedTimeSlot) {
      const newBooking: Booking = {
        id: generateId(),
        room: selectedRoom,
        student_id: "2020123456",
        student_name: "Иванов Иван",
        start: selectedTimeSlot.start,
        end: selectedTimeSlot.end,
        status: "confirmed",
        key_issued: false,
        key_returned: false,
        access_code: (Math.floor(1000 + Math.random() * 9000)).toString(),
        notes: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setBooking(newBooking);
      setBookingConfirmed(true);
      setStep(3);
    }
  };

  // Reset booking process
  const handleNewBooking = () => {
    setSelectedRoom(null);
    setSelectedTimeSlot(null);
    setBookingConfirmed(false);
    setBooking(null);
    setStep(1);
  };

  return (
    <PageLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Бронирование помещений</h1>
          <p className="text-muted-foreground">
            Выберите удобное время и место для ваших занятий
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Процесс бронирования</CardTitle>
            <CardDescription>
              Следуйте этим шагам для бронирования помещения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-white" : "bg-muted"}`}>1</div>
                <span>Выбор помещения</span>
              </div>
              <div className="hidden md:block w-8 h-0.5 bg-muted"></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-white" : "bg-muted"}`}>2</div>
                <span>Выбор времени</span>
              </div>
              <div className="hidden md:block w-8 h-0.5 bg-muted"></div>
              <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-white" : "bg-muted"}`}>3</div>
                <span>Подтверждение</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <span>Поиск помещений</span>
                  </CardTitle>
                  <CardDescription>
                    Найдите подходящее помещение для вашего мероприятия
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Поиск помещений..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onSelect={() => handleRoomSelect(room)}
                    />
                  ))
                ) : (
                  <Card className="p-4 text-center text-muted-foreground">
                    Нет помещений, соответствующих вашим критериям.
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <span>Фильтры</span>
                  </CardTitle>
                  <CardDescription>
                    Фильтруйте помещения по различным параметрам
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Дата</h4>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDate(date.toISOString())}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => newDate && setDate(newDate)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Тип помещения</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Любой</Badge>
                      <Badge variant="outline">Лекционная</Badge>
                      <Badge variant="outline">Компьютерный класс</Badge>
                      <Badge variant="outline">Семинарская</Badge>
                      <Badge variant="outline">Лаборатория</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Вместимость</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Любая</Badge>
                      <Badge variant="outline">До 30 человек</Badge>
                      <Badge variant="outline">30-60 человек</Badge>
                      <Badge variant="outline">60-100 человек</Badge>
                      <Badge variant="outline">Более 100 человек</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && selectedRoom && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <span>{selectedRoom.name} - {selectedRoom.title}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                    Изменить помещение
                  </Button>
                </CardTitle>
                <CardDescription>
                  {selectedRoom.building} · Вместимость: {selectedRoom.capacity} чел.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Выберите время</h3>
                  <div className="space-y-3">
                    {mockTimeSlots.map((timeSlot) => (
                      <TimeSlotCard
                        key={timeSlot.id}
                        slot={timeSlot}
                        onSelect={() => handleTimeSlotSelect(timeSlot)}
                        isSelected={selectedTimeSlot?.id === timeSlot.id}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Назад
                  </Button>
                  <Button
                    onClick={handleConfirmBooking}
                    disabled={!selectedTimeSlot || selectedTimeSlot.status !== "available"}
                  >
                    Продолжить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && booking && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Информация о бронировании</span>
                </CardTitle>
                <CardDescription>
                  Ваше бронирование успешно оформлено
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Помещение</h3>
                    <p className="text-lg font-medium">{booking.room.name} - {booking.room.title}</p>
                    <p className="text-sm text-muted-foreground">{booking.room.building}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Дата и время</h3>
                    <p className="text-lg font-medium">{formatDate(booking.start)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(booking.start)} - {formatTime(booking.end)} ({formatDuration(getTimeDifferenceInMinutes(booking.start, booking.end))})
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Студент</h3>
                    <p className="text-lg font-medium">{booking.student_name}</p>
                    <p className="text-sm text-muted-foreground">ID: {booking.student_id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Код доступа</h3>
                    <p className="text-lg font-medium">{booking.access_code}</p>
                    <p className="text-sm text-muted-foreground">Предъявите QR-код при входе</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-4">
                  <Button
                    variant="outline"
                    className="mb-4"
                    onClick={() => setShowQRCode(true)}
                  >
                    Показать QR-код
                  </Button>
                  <Button onClick={handleNewBooking}>
                    Новое бронирование
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Код доступа к помещению</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center py-4">
              <QRCodeDisplay 
                bookingId={parseInt(booking?.id || "0")}
                roomName={booking?.room.name || ""}
                accessCode={booking?.access_code || ""}
                startTime={booking?.start || ""}
                endTime={booking?.end || ""}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setShowQRCode(false)}>
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default BookingPage;
