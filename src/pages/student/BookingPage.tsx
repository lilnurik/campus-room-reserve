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
import { format, addDays, parseISO, endOfWeek } from "date-fns";
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
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
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

  // Current user and datetime - set with the requested values
  const [currentDateTime] = useState("2025-05-02 05:09:43");
  const [currentUser] = useState("lilnurik");

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
  const [roomsPerPage] = useState(4); // Reduced from 6 to 4 for better mobile view
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

    // Filter out unavailable and maintenance rooms
    filtered = filtered.filter(room => room.status !== "unavailable");

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
    // Skip if room is under maintenance
    if (room.status === "maintenance") {
      toast.error("Аудитория на обслуживании и недоступна для бронирования");
      return;
    }

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

      // If a room is selected, load time slots for the new date
      if (selectedRoom) {
        loadTimeSlots(selectedRoom.id, formatDate(newDate));
      }
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

  // Custom status badge for rooms
  const RoomStatusBadge = ({ status }: { status: string }) => {
    if (status === "maintenance") {
      return (
          <Badge className="bg-orange-100 text-orange-800 ml-2 text-xs">
            На обслуживании
          </Badge>
      );
    }
    return null;
  };

  return (
      <PageLayout role="student">
        <div className="space-y-6 pb-10">
          {/* Page Title */}
          <div className="px-2 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("booking.title") || "Бронирование аудитории"}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("booking.subtitle") || "Выберите дату, время и аудиторию для бронирования"}
            </p>
          </div>

          {/* Current user and datetime display */}
          <div className="text-sm text-muted-foreground text-right px-2 sm:px-0">
            Current Date and Time (UTC): {currentDateTime} |
            Current User: {currentUser}
          </div>

          {/* Time Slot Selection - Now at the top and always visible */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">
                {t("booking.selectTime") || "Выберите время"}
                {selectedRoom && <span className="font-normal text-base ml-1">: {selectedRoom.name}</span>}
              </CardTitle>
              <CardDescription>
                {date
                    ? `${t("booking.availableTimesFor") || "Доступное время на"} ${format(date, 'PP', { locale: ru })}`
                    : t("booking.selectDateBelow") || "Выберите дату ниже, чтобы увидеть доступные слоты"}
                {!selectedRoom && <span className="block text-amber-500 mt-1">{t("booking.selectRoom") || "Выберите аудиторию ниже, чтобы увидеть доступные слоты"}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTimeSlots ? (
                  <div className="flex justify-center items-center h-24 sm:h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm">{t("common.loading") || "Загрузка..."}</span>
                  </div>
              ) : availableTimeSlots.length > 0 ? (
                  <div>
                    <RadioGroup
                        value={selectedTimeSlot?.id || ""}
                        onValueChange={(value) => {
                          const slot = availableTimeSlots.find(slot => slot.id === value);
                          setSelectedTimeSlot(slot || null);
                        }}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                        {availableTimeSlots.map(slot => (
                            <div key={slot.id} className="flex items-center space-x-2 bg-background hover:bg-accent rounded-md p-2 transition-colors">
                              <RadioGroupItem value={slot.id} id={slot.id} />
                              <Label htmlFor={slot.id} className="cursor-pointer text-sm">
                                {formatTime(slot.start)} - {formatTime(slot.end)}
                              </Label>
                            </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
              ) : (
                  <div className="text-center py-5 px-3 text-muted-foreground bg-background rounded-md">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                    <p className="text-sm">
                      {!selectedRoom
                          ? (t("booking.selectRoomToSeeSlots") || "Выберите аудиторию, чтобы увидеть доступные слоты")
                          : (t("booking.noAvailableTimeSlots") || "Нет доступных временных слотов на выбранную дату")}
                    </p>
                    {selectedRoom && (
                        <p className="text-xs mt-1">{t("booking.tryAnotherDay") || "Пожалуйста, выберите другой день"}</p>
                    )}
                  </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 border-t pt-4 pb-2">
              <div>
                {selectedTimeSlot && (
                    <Badge variant="outline" className="text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(selectedTimeSlot.start)} - {formatTime(selectedTimeSlot.end)}
                    </Badge>
                )}
                {selectedRoom && (
                    <Badge variant="outline" className="text-sm ml-0 mt-2 sm:ml-2 sm:mt-0">
                      <Info className="h-3 w-3 mr-1" />
                      {selectedRoom.name}
                    </Badge>
                )}
              </div>
              <Button
                  className="w-full sm:w-auto"
                  disabled={!selectedTimeSlot || !selectedRoom}
                  onClick={() => setShowBookingDialog(true)}
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                {t("booking.bookRoom") || "Забронировать аудиторию"}
              </Button>
            </CardFooter>
          </Card>

          {/* Calendar and Room Selection - Now in a flex container for better responsiveness */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar - Full width on mobile, sidebar on desktop */}
            <Card className="w-full lg:w-80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("booking.selectDate") || "Выберите дату"}</CardTitle>
                <CardDescription className="text-sm">{t("booking.selectDateDesc") || "Выберите день для бронирования"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    disabled={(date) => {
                      // Disable dates in the past or beyond the current week
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
                      return date < today || date > endOfCurrentWeek;
                    }}
                    locale={ru}
                />
              </CardContent>
            </Card>

            {/* Room Selection - Now takes remaining space */}
            <Card className="flex-1 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("booking.availableRooms") || "Доступные аудитории"}</CardTitle>
                <CardDescription className="text-sm">
                  {date ? (
                      `${t("booking.availableRoomsFor") || "Доступные аудитории на"} ${format(date, 'PP', { locale: ru })}`
                  ) : (
                      t("booking.selectDateToSeeRooms") || "Выберите дату, чтобы увидеть доступные аудитории"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search input and filter tabs */}
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("booking.searchRooms") || "Поиск аудиторий..."}
                        type="search"
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                    <TabsList className="mb-2 w-full h-auto flex flex-wrap justify-start">
                      {categories.map(category => (
                          <TabsTrigger
                              key={category.id}
                              value={category.id}
                              className="text-xs sm:text-sm py-1.5 px-2 h-auto flex-grow sm:flex-grow-0"
                          >
                            {category.label}
                          </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Room listing */}
                <div className="space-y-3">
                  {isLoadingRooms ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">{t("common.loading") || "Загрузка..."}</span>
                      </div>
                  ) : currentRooms.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 gap-3">
                          {currentRooms.map(room => {
                            const isMaintenanceRoom = room.status === "maintenance";
                            return (
                                <Card
                                    key={room.id}
                                    className={`transition-colors ${
                                        isMaintenanceRoom
                                            ? "border-orange-300 bg-orange-50 opacity-75"
                                            : `cursor-pointer hover:bg-accent ${selectedRoom?.id === room.id ? 'border-primary' : ''}`
                                    }`}
                                    onClick={() => !isMaintenanceRoom && handleRoomSelect(room)}
                                >
                                  <CardContent className="p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center">
                                          <h3 className="font-medium text-sm sm:text-base">{room.name}</h3>
                                          <RoomStatusBadge status={room.status} />
                                        </div>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                          {room.category}, {t("rooms.capacity") || "Вместимость"}: {room.capacity}
                                        </p>
                                        {room.building && (
                                            <p className="text-xs sm:text-sm text-muted-foreground">{room.building}</p>
                                        )}
                                        {isMaintenanceRoom && (
                                            <p className="text-xs text-orange-700 mt-1">
                                              Аудитория на обслуживании и недоступна для бронирования
                                            </p>
                                        )}
                                      </div>
                                      <div className="flex flex-row sm:flex-col md:flex-row gap-2 justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs px-2 sm:px-3"
                                            disabled={isMaintenanceRoom}
                                        >
                                          <Info className="h-3 w-3 mr-1" />
                                          {t("booking.details") || "Детали"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 text-xs px-2 sm:px-3"
                                            variant={selectedRoom?.id === room.id ? "default" : "outline"}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!isMaintenanceRoom) {
                                                handleRoomSelect(room);
                                              }
                                            }}
                                            disabled={isMaintenanceRoom}
                                        >
                                          {selectedRoom?.id === room.id ? (
                                              <><CheckCircle className="h-3 w-3 mr-1" /> {t("booking.selected") || "Выбрано"}</>
                                          ) : (
                                              <><CalendarPlus className="h-3 w-3 mr-1" /> {t("booking.select") || "Выбрать"}</>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                            );
                          })}
                        </div>

                        {/* Pagination controls - Simplified for mobile */}
                        {filteredRooms.length > roomsPerPage && (
                            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={prevPage}
                                  disabled={currentPage === 1}
                                  className="h-8 w-8 p-0"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>

                              {/* Show limited page numbers on mobile */}
                              <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                      // On mobile, show limited pages around current
                                      if (window.innerWidth < 640) {
                                        return page === 1 || page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1);
                                      }
                                      return true;
                                    })
                                    .map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => goToPage(page)}
                                            className="h-8 w-8 p-0 text-xs"
                                        >
                                          {page}
                                        </Button>
                                    ))}
                              </div>

                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={nextPage}
                                  disabled={currentPage === totalPages}
                                  className="h-8 w-8 p-0"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                        )}
                      </>
                  ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">{t("booking.noRoomsFound") || "Аудитории не найдены"}</p>
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking confirmation dialog */}
        <Dialog open={showBookingDialog} onOpenChange={(open) => {
          if (!open && !bookingConfirmed) {
            setShowBookingDialog(false);
          }
        }}>
          <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-4 sm:p-6 rounded-lg overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl">
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
                <div className="space-y-4 py-2">
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg">
                      {t("booking.bookingSuccessTitle") || "Бронирование успешно создано"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t("booking.bookingReference") || "Номер бронирования"}:
                      <span className="font-mono ml-1">
                    {createdBooking ? `BK-${createdBooking.id}` : `BK-${Math.floor(Math.random() * 10000)}`}
                  </span>
                    </p>
                  </div>

                  <div className="border rounded-md p-3 space-y-2 text-sm">
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
                <div className="space-y-3 py-2">
                  <div className="border rounded-md p-3 space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">{t("booking.selectedRoom") || "Выбранная аудитория"}:</p>
                      <p className="text-sm">{selectedRoom?.name} ({selectedRoom?.category})</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t("booking.selectedDateTime") || "Выбранные дата и время"}:</p>
                      <p className="text-sm">
                        {date ? format(date, 'PP', { locale: ru }) : ''},
                        {selectedTimeSlot ? ` ${formatTime(selectedTimeSlot.start)} - ${formatTime(selectedTimeSlot.end)}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="booking-purpose" className="text-sm">{t("booking.bookingPurpose") || "Цель бронирования"}*</Label>
                      <Textarea
                          id="booking-purpose"
                          placeholder={t("booking.enterPurpose") || "Введите цель бронирования..."}
                          value={bookingPurpose}
                          onChange={(e) => setBookingPurpose(e.target.value)}
                          required
                          className="resize-none min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="attendees" className="text-sm">{t("booking.attendees") || "Количество участников"}*</Label>
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

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
              {bookingConfirmed ? (
                  <Button
                      onClick={handleBookingFinished}
                      className="w-full sm:w-auto"
                  >
                    {t("booking.returnToDashboard") || "Вернуться на главную"}
                  </Button>
              ) : (
                  <>
                    <DialogClose asChild>
                      <Button
                          variant="outline"
                          disabled={isBooking}
                          className="w-full sm:w-auto order-2 sm:order-1"
                      >
                        {t("common.cancel") || "Отмена"}
                      </Button>
                    </DialogClose>
                    <Button
                        onClick={handleBookRoom}
                        disabled={isBooking || !bookingPurpose || attendees <= 0}
                        className="w-full sm:w-auto order-1 sm:order-2"
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