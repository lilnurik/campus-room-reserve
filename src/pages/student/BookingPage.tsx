import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Clock, Building, MapPin, UserCheck, Check } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import RoomCard from "@/components/RoomCard";
import TimeSlotCard from "@/components/TimeSlotCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCodeDisplay from "@/components/QRCodeDisplay";

// Mock rooms data
const mockRooms = [
  {
    id: 1,
    name: "A101",
    building: "Главный корпус",
    title: "Комната для групповых занятий",
    capacity: 30,
    features: ["Wi-Fi", "Проектор", "Флипчарт"],
    status: "available",
    type: "classroom"
  },
  {
    id: 2,
    name: "B203",
    building: "Библиотека",
    title: "Зал для самостоятельной работы",
    capacity: 15,
    features: ["Wi-Fi", "Тихая зона", "Компьютеры"],
    status: "available",
    type: "study_room"
  },
  {
    id: 3,
    name: "C305",
    building: "Лабораторный корпус",
    title: "Лаборатория",
    capacity: 20,
    features: ["Wi-Fi", "Лабораторное оборудование", "Компьютеры"],
    status: "available",
    type: "lab"
  },
  {
    id: 4,
    name: "A105",
    building: "Главный корпус",
    title: "Учебная аудитория",
    capacity: 25,
    features: ["Wi-Fi", "Проектор", "Интерактивная доска"],
    status: "available",
    type: "classroom"
  }
];

// Mock time slots data
const mockTimeSlots = [
  { id: 1, start: "08:00", end: "10:00", status: "available" },
  { id: 2, start: "10:00", end: "12:00", status: "class" },
  { id: 3, start: "12:00", end: "14:00", status: "available" },
  { id: 4, start: "14:00", end: "16:00", status: "available" },
  { id: 5, start: "16:00", end: "18:00", status: "booked" },
  { id: 6, start: "18:00", end: "20:00", status: "available" }
];

const BookingPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [building, setBuilding] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoom(roomId);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlotId: number) => {
    setSelectedTimeSlot(timeSlotId);
  };

  const handleBookingRequest = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmBooking = () => {
    setConfirmDialogOpen(false);
    
    // In a real app, this would send the booking request to the backend
    // For now, we'll simulate a successful booking
    setTimeout(() => {
      setBookingCode("BOOKING123456");
      setSuccessDialogOpen(true);
    }, 500);
  };

  const filteredRooms = mockRooms.filter(room => 
    building === "all" || room.building.includes(building)
  );

  const selectedRoomData = mockRooms.find(room => room.id === selectedRoom);
  
  return (
    <PageLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Бронирование помещения</h1>
          <p className="text-muted-foreground">
            Выберите дату, помещение и время для бронирования
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Date and Filters */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Выберите дату
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ru}
                  className="rounded-md border"
                />
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  {date ? (
                    `Выбрано: ${format(date, "PPP", { locale: ru })}`
                  ) : (
                    "Пожалуйста, выберите дату"
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Фильтры
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="building-select">
                      Корпус
                    </label>
                    <Select value={building} onValueChange={setBuilding}>
                      <SelectTrigger id="building-select">
                        <SelectValue placeholder="Выберите корпус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все корпуса</SelectItem>
                        <SelectItem value="Главный корпус">Главный корпус</SelectItem>
                        <SelectItem value="Библиотека">Библиотека</SelectItem>
                        <SelectItem value="Лабораторный корпус">Лабораторный корпус</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Room Selection */}
          <Card className="h-min">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {selectedRoom ? "Выбрано помещение" : "Выберите помещение"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRoom ? (
                <>
                  <RoomCard 
                    room={selectedRoomData!} 
                    onSelect={() => {}}
                    isSelected={true}
                  />
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setSelectedRoom(null)}
                  >
                    Изменить выбор
                  </Button>
                </>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map(room => (
                      <RoomCard 
                        key={room.id} 
                        room={room} 
                        onSelect={() => handleRoomSelect(room.id)}
                        isSelected={room.id === selectedRoom}
                      />
                    ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      Нет доступных помещений для выбранных параметров
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Time Slots Selection */}
          <Card className="h-min">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {selectedRoom ? "Выберите время" : "Сначала выберите помещение"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRoom ? (
                <div className="space-y-3">
                  {mockTimeSlots.map(slot => (
                    <TimeSlotCard
                      key={slot.id}
                      slot={slot}
                      onSelect={() => handleTimeSlotSelect(slot.id)}
                      isSelected={slot.id === selectedTimeSlot}
                    />
                  ))}
                  {selectedTimeSlot && (
                    <Button
                      className="w-full mt-4"
                      onClick={handleBookingRequest}
                    >
                      Забронировать
                    </Button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Для просмотра доступного времени, сначала выберите помещение
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Trends - Optional Bottom Section */}
        <Tabs defaultValue="popular">
          <TabsList className="mb-4">
            <TabsTrigger value="popular">Популярные помещения</TabsTrigger>
            <TabsTrigger value="recommended">Рекомендуемые</TabsTrigger>
          </TabsList>
          
          <TabsContent value="popular">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockRooms.slice(0, 4).map(room => (
                <Card key={room.id} className="card-hover">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {room.building}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {room.title}
                    </p>
                    <div className="flex justify-between mt-3 items-center">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        98% занятость
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recommended">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockRooms.slice(2, 4).concat(mockRooms.slice(0, 2)).map(room => (
                <Card key={room.id} className="card-hover">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {room.building}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {room.title}
                    </p>
                    <div className="flex justify-between mt-3 items-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Рекомендовано
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение бронирования</DialogTitle>
            <DialogDescription>
              Пожалуйста, проверьте данные бронирования
            </DialogDescription>
          </DialogHeader>
          {selectedRoom && selectedTimeSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Помещение</p>
                  <p className="text-base">{selectedRoomData?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Корпус</p>
                  <p className="text-base">{selectedRoomData?.building}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Дата</p>
                  <p className="text-base">{date && format(date, "PPP", { locale: ru })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Время</p>
                  <p className="text-base">
                    {mockTimeSlots.find(slot => slot.id === selectedTimeSlot)?.start} - 
                    {mockTimeSlots.find(slot => slot.id === selectedTimeSlot)?.end}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Нажимая "Подтвердить", вы соглашаетесь с правилами бронирования помещений.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleConfirmBooking} className="flex items-center gap-2">
              <Check size={16} />
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Бронирование успешно</DialogTitle>
            <DialogDescription>
              Ваше бронирование успешно создано
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Помещение забронировано</p>
              <p className="text-sm text-muted-foreground mt-1">
                Для доступа в помещение используйте QR-код или код доступа
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <QRCodeDisplay 
                bookingId={123}
                roomName={selectedRoomData?.name || ""}
                accessCode={bookingCode}
                startTime={mockTimeSlots.find(slot => slot.id === selectedTimeSlot)?.start || ""}
                endTime={mockTimeSlots.find(slot => slot.id === selectedTimeSlot)?.end || ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => window.location.href = "/student/dashboard"} className="w-full">
              Перейти к бронированиям
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default BookingPage;
