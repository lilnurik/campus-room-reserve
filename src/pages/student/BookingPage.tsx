import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock, CalendarPlus, Search, Filter, Info, Users,
  BookOpen, Loader2, CheckCircle, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { roomsApi, Room, TimeSlot, BookingRequest, Booking } from "@/services/api";
import { useTranslation } from "@/context/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper functions
const formatTime = (isoString: string) => {
  try {
    // Parse the ISO string to get a Date object
    const date = new Date(isoString);

    // Format hours and minutes with leading zeros
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Return in HH:MM format
    return `${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting time:", e, "Input:", isoString);
    return "00:00";
  }
};

const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

const BookingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomIdFromUrl = searchParams.get('roomId');

  // State variables
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingPurpose, setBookingPurpose] = useState("");
  const [attendees, setAttendees] = useState<number>(1);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Pagination for rooms
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(6);
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  // Categories for filtering
  const categories = [
    { id: "all", label: t("booking.allRooms") || "Все аудитории" },
    { id: "lecture", label: t("booking.lectureRooms") || "Лекционные" },
    { id: "laboratory", label: t("booking.labRooms") || "Лабораторные" },
    { id: "computer", label: t("booking.computerRooms") || "Компьютерные" }
  ];

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error(t("common.authRequired") || "Требуется авторизация");
      navigate('/login');
    }
  }, []);

  // Load rooms when component mounts
  useEffect(() => {
    const loadRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const response = await roomsApi.getRooms();
        if (response.success && response.data) {
          setRooms(response.data);
          setFilteredRooms(response.data);

          // If a room ID was provided in the URL, select that room
          if (roomIdFromUrl) {
            const room = response.data.find(r => r.id === roomIdFromUrl);
            if (room) {
              setSelectedRoom(room);
              loadTimeSlots(room.id, formatDate(date || new Date()));
            }
          }
        } else {
          toast.error(response.error || t("booking.errorLoadingRooms") || "Ошибка загрузки аудиторий");
        }
      } catch (error) {
        console.error('Error loading rooms:', error);
        toast.error(t("booking.errorLoadingRooms") || "Ошибка загрузки аудиторий");
      } finally {
        setIsLoadingRooms(false);
      }
    };

    loadRooms();
  }, [roomIdFromUrl]);

  // Filter rooms when category or search changes
  useEffect(() => {
    if (!rooms.length) return;

    let filtered = [...rooms];

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(room => room.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room =>
          room.name.toLowerCase().includes(query) ||
          (room.building && room.building.toLowerCase().includes(query)) ||
          (room.description && room.description.toLowerCase().includes(query))
      );
    }

    setFilteredRooms(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [rooms, activeCategory, searchQuery]);

  // Load time slots when date changes or room is selected
  useEffect(() => {
    if (selectedRoom && date) {
      loadTimeSlots(selectedRoom.id, formatDate(date));
    }
  }, [selectedRoom, date]);

  // Function to load time slots for a specific room and date
  const loadTimeSlots = async (roomId: string, date: string) => {
    setIsLoadingTimeSlots(true);
    setAvailableTimeSlots([]);
    setSelectedTimeSlot(null);

    try {
      const response = await roomsApi.getRoomAvailability(roomId, date);
      if (response.success && response.data) {
        // Filter for only available time slots
        const availableSlots = response.data.timeSlots.filter(slot => slot.isAvailable);
        setAvailableTimeSlots(availableSlots);
      } else {
        toast.error(response.error || t("booking.errorLoadingAvailability") || "Ошибка загрузки расписания");
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast.error(t("booking.errorLoadingAvailability") || "Ошибка загрузки расписания");
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  // Function to select a room and load its availability
  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    if (date) {
      loadTimeSlots(room.id, formatDate(date));
    }
  };

  // Function to book a room
  const handleBookRoom = async () => {
    if (!selectedRoom || !date || !selectedTimeSlot || !bookingPurpose) {
      toast.error(t("booking.missingInformation") || "Заполните все необходимые поля");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Extract just the time parts (HH:MM) without any ISO date formatting
      const startTime = formatTime(selectedTimeSlot.start);
      const endTime = formatTime(selectedTimeSlot.end);

      // Format date as YYYY-MM-DD
      const dateString = format(date, 'yyyy-MM-dd');

      // Log what we're sending
      console.log("Booking details:", {
        room: selectedRoom.name,
        date: dateString,
        startTime,
        endTime,
        purpose: bookingPurpose,
        attendees
      });

      const bookingData: BookingRequest = {
        roomId: selectedRoom.id,
        date: dateString,
        startTime: startTime,
        endTime: endTime,
        purpose: bookingPurpose,
        attendees: attendees
      };

      const response = await roomsApi.createBooking(bookingData);
      if (response.success && response.data) {
        setBookingConfirmed(true);
        setCreatedBooking(response.data);
        toast.success(t("booking.bookingSuccess") || "Бронирование успешно создано");
      } else {
        const errorMessage = response.error || t("booking.bookingFailed") || "Ошибка при создании бронирования";
        setBookingError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = error instanceof Error ? error.message : t("booking.bookingFailed") || "Ошибка при создании бронирования";
      setBookingError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Reset selected time slot when date changes
      setSelectedTimeSlot(null);
    }
  };

  const handleBookingFinished = () => {
    setShowBookingDialog(false);
    setBookingConfirmed(false);
    setSelectedTimeSlot(null);
    setBookingPurpose("");
    setAttendees(1);
    setCreatedBooking(null);
    setBookingError(null);

    // Navigate back to dashboard
    navigate('/student/dashboard');
  };

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
      <PageLayout role="student">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("booking.title") || "Бронирование аудитории"}</h1>
            <p className="text-muted-foreground">
              {t("booking.subtitle") || "Выберите дату, время и аудиторию для бронирования"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t("booking.selectDate") || "Выберите дату"}</CardTitle>
                <CardDescription>{t("booking.selectDateDesc") || "Выберите день для бронирования"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    disabled={(date) => {
                      // Disable dates in the past or more than 7 days in the future
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      // Next week's limit
                      const nextWeek = addDays(today, 7);

                      return date < today || date > nextWeek;
                    }}
                    locale={ru}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t("booking.availableRooms") || "Доступные аудитории"}</CardTitle>
                <CardDescription>
                  {date ? (
                      `${t("booking.availableRoomsFor") || "Доступные аудитории на"} ${format(date, 'PP', { locale: ru })}`
                  ) : (
                      t("booking.selectDateToSeeRooms") || "Выберите дату, чтобы увидеть доступные аудитории"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("booking.searchRooms") || "Поиск аудиторий..."}
                        type="search"
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <TabsList className="mb-4 flex overflow-auto">
                    {categories.map(category => (
                        <TabsTrigger key={category.id} value={category.id}>
                          {category.label}
                        </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="space-y-4">
                    {isLoadingRooms ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="ml-2">{t("common.loading") || "Загрузка..."}</span>
                        </div>
                    ) : currentRooms.length > 0 ? (
                        <div className="space-y-4">
                          {currentRooms.map(room => (
                              <Card
                                  key={room.id}
                                  className={`cursor-pointer transition-colors hover:bg-accent ${selectedRoom?.id === room.id ? 'border-primary' : ''}`}
                                  onClick={() => handleRoomSelect(room)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h3 className="font-medium">{room.name}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        {room.category}, {t("rooms.capacity") || "Вместимость"}: {room.capacity}
                                      </p>
                                      {room.building && (
                                          <p className="text-sm text-muted-foreground">{room.building}</p>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm">
                                        <Info className="h-4 w-4 mr-1" />
                                        {t("booking.details") || "Детали"}
                                      </Button>
                                      <Button
                                          size="sm"
                                          variant={selectedRoom?.id === room.id ? "default" : "outline"}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRoomSelect(room);
                                          }}
                                      >
                                        {selectedRoom?.id === room.id ? (
                                            <><CheckCircle className="h-4 w-4 mr-1" /> {t("booking.selected") || "Выбрано"}</>
                                        ) : (
                                            <><CalendarPlus className="h-4 w-4 mr-1" /> {t("booking.select") || "Выбрать"}</>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                          ))}

                          {/* Pagination controls */}
                          {filteredRooms.length > roomsPerPage && (
                              <div className="flex items-center justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => goToPage(page)}
                                        className="h-8 w-8 p-0"
                                    >
                                      {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                          )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {t("booking.noRoomsFound") || "Аудитории не найдены"}
                        </div>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Time slot selection */}
          {selectedRoom && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("booking.selectTime") || "Выберите время"}: {selectedRoom.name}
                  </CardTitle>
                  <CardDescription>
                    {t("booking.availableTimesFor") || "Доступное время на"} {date ? format(date, 'PP', { locale: ru }) : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTimeSlots ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">{t("common.loading") || "Загрузка..."}</span>
                      </div>
                  ) : availableTimeSlots.length > 0 ? (
                      <div className="space-y-4">
                        <RadioGroup
                            value={selectedTimeSlot?.id || ""}
                            onValueChange={(value) => {
                              const slot = availableTimeSlots.find(slot => slot.id === value);
                              setSelectedTimeSlot(slot || null);
                            }}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {availableTimeSlots.map(slot => (
                                <div key={slot.id} className="flex items-center space-x-2">
                                  <RadioGroupItem value={slot.id} id={slot.id} />
                                  <Label htmlFor={slot.id} className="cursor-pointer">
                                    {formatTime(slot.start)} - {formatTime(slot.end)}
                                  </Label>
                                </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                  ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                        <p>{t("booking.noAvailableTimeSlots") || "Нет доступных временных слотов на выбранную дату"}</p>
                        <p className="text-sm">{t("booking.tryAnotherDay") || "Пожалуйста, выберите другой день"}</p>
                      </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between">
                  <div>
                    {selectedTimeSlot && (
                        <Badge variant="outline" className="text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(selectedTimeSlot.start)} - {formatTime(selectedTimeSlot.end)}
                        </Badge>
                    )}
                  </div>
                  <Button
                      disabled={!selectedTimeSlot}
                      onClick={() => setShowBookingDialog(true)}
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    {t("booking.bookRoom") || "Забронировать аудиторию"}
                  </Button>
                </CardFooter>
              </Card>
          )}
        </div>

        {/* Booking confirmation dialog */}
        <Dialog open={showBookingDialog} onOpenChange={(open) => {
          if (!open && !bookingConfirmed) {
            setShowBookingDialog(false);
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {bookingConfirmed
                    ? (t("booking.bookingConfirmed") || "Бронирование подтверждено")
                    : (t("booking.confirmBooking") || "Подтверждение бронирования")}
              </DialogTitle>
              <DialogDescription>
                {bookingConfirmed
                    ? (t("booking.bookingSuccessDesc") || "Ваше бронирование было успешно создано")
                    : (t("booking.enterDetailsDesc") || "Введите дополнительную информацию для бронирования")}
              </DialogDescription>
            </DialogHeader>

            {bookingConfirmed ? (
                <div className="space-y-4 py-4">
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg">
                      {t("booking.bookingSuccessTitle") || "Бронирование успешно создано"}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("booking.bookingReference") || "Номер бронирования"}:
                      <span className="font-mono ml-1">
                          {createdBooking ? `BK-${createdBooking.id}` : `BK-${Math.floor(Math.random() * 10000)}`}
                      </span>
                    </p>
                  </div>

                  <div className="border rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("booking.room") || "Аудитория"}:</span>
                      <span className="font-medium">{selectedRoom?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("booking.date") || "Дата"}:</span>
                      <span className="font-medium">{date ? format(date, 'PP', { locale: ru }) : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("booking.time") || "Время"}:</span>
                      <span className="font-medium">
                    {selectedTimeSlot ? `${formatTime(selectedTimeSlot.start)} - ${formatTime(selectedTimeSlot.end)}` : ''}
                  </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("booking.purpose") || "Цель"}:</span>
                      <span className="font-medium">{bookingPurpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("booking.attendees") || "Количество участников"}:</span>
                      <span className="font-medium">{attendees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("booking.status") || "Статус"}:</span>
                      <span className="font-medium text-yellow-600">
                          {t("booking.pendingApproval") || "Ожидает подтверждения"}
                      </span>
                    </div>
                  </div>
                </div>
            ) : (
                <div className="space-y-4 py-4">
                  <div className="border rounded-md p-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">{t("booking.selectedRoom") || "Выбранная аудитория"}:</p>
                      <p>{selectedRoom?.name} ({selectedRoom?.category})</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("booking.selectedDateTime") || "Выбранные дата и время"}:</p>
                      <p>
                        {date ? format(date, 'PP', { locale: ru }) : ''},
                        {selectedTimeSlot ? ` ${formatTime(selectedTimeSlot.start)} - ${formatTime(selectedTimeSlot.end)}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="booking-purpose">{t("booking.bookingPurpose") || "Цель бронирования"}*</Label>
                      <Textarea
                          id="booking-purpose"
                          placeholder={t("booking.enterPurpose") || "Введите цель бронирования..."}
                          value={bookingPurpose}
                          onChange={(e) => setBookingPurpose(e.target.value)}
                          required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="attendees">{t("booking.attendees") || "Количество участников"}*</Label>
                      <div className="flex gap-2 items-center">
                        <Select
                            value={attendees.toString()}
                            onValueChange={(value) => setAttendees(parseInt(value))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("booking.selectAttendees") || "Выберите количество"} />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: Math.min(selectedRoom?.capacity || 10, 30) }, (_, i) => i + 1).map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("booking.maxCapacity") || "Максимальная вместимость"}: {selectedRoom?.capacity}
                      </p>
                    </div>
                  </div>

                  {bookingError && (
                      <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md text-sm">
                        <AlertCircle className="h-4 w-4 inline-block mr-2" />
                        {bookingError}
                      </div>
                  )}
                </div>
            )}

            <DialogFooter>
              {bookingConfirmed ? (
                  <Button onClick={handleBookingFinished}>
                    {t("booking.returnToDashboard") || "Вернуться на главную"}
                  </Button>
              ) : (
                  <>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isBooking}>
                        {t("common.cancel") || "Отмена"}
                      </Button>
                    </DialogClose>
                    <Button
                        onClick={handleBookRoom}
                        disabled={isBooking || !bookingPurpose || attendees <= 0}
                    >
                      {isBooking ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.loading") || "Загрузка..."}</>
                      ) : (
                          <>{t("booking.confirmBookingAction") || "Подтвердить бронирование"}</>
                      )}
                    </Button>
                  </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
  );
};

export default BookingPage;