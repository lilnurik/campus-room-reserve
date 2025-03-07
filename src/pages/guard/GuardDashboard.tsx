import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, KeyRound, Search, CheckCircle, AlertTriangle, Filter } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import StatusBadge from "@/components/StatusBadge";
import { formatTime, formatDate } from "@/lib/utils";

// Mock bookings data
const mockBookings = [
  {
    id: 101,
    room: "A101",
    building: "Главный корпус",
    title: "Комната для групповых занятий",
    start: "2025-03-07T10:00:00",
    end: "2025-03-07T12:00:00",
    status: "confirmed",
    key_issued: false,
    student: { id: 1, name: "Иван Иванов", email: "ivan@example.com" },
    accessCode: "AB12CD"
  },
  {
    id: 102,
    room: "B203",
    building: "Библиотека",
    title: "Зал для самостоятельной работы",
    start: "2025-03-07T14:00:00",
    end: "2025-03-07T16:00:00",
    status: "confirmed",
    key_issued: true,
    key_returned: false,
    student: { id: 2, name: "Анна Смирнова", email: "anna@example.com" },
    accessCode: "XY34ZW"
  },
  {
    id: 103,
    room: "C305",
    building: "Лабораторный корпус",
    title: "Лаборатория",
    start: "2025-03-06T16:00:00",
    end: "2025-03-06T18:00:00",
    status: "confirmed",
    key_issued: true,
    key_returned: false,
    overdue: true,
    overdue_minutes: 120,
    student: { id: 3, name: "Петр Сидоров", email: "petr@example.com" },
    accessCode: "LM56NO"
  }
];

const GuardDashboard = () => {
  const [bookings, setBookings] = useState(mockBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");

  const handleKeyIssue = (bookingId: number) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, key_issued: true, key_returned: false } 
        : booking
    ));
  };

  const handleKeyReturn = (bookingId: number) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, key_returned: true } 
        : booking
    ));
  };

  // Filter bookings based on search and building
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.room.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         booking.student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = buildingFilter === "all" || booking.building.includes(buildingFilter);
    return matchesSearch && matchesBuilding;
  });

  return (
    <PageLayout role="guard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Панель Охранника</h1>
          <p className="text-muted-foreground">
            Управление ключами и контроль бронирований
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск по комнате или студенту..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select onValueChange={setBuildingFilter} defaultValue="all">
                <SelectTrigger className="w-full md:w-[200px]">
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <SelectValue placeholder="Корпус" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все корпуса</SelectItem>
                  <SelectItem value="Главный корпус">Главный корпус</SelectItem>
                  <SelectItem value="Библиотека">Библиотека</SelectItem>
                  <SelectItem value="Лабораторный корпус">Лабораторный корпус</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Tabs */}
        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Clock size={16} />
              Текущие
            </TabsTrigger>
            <TabsTrigger value="keys" className="flex items-center gap-2">
              <KeyRound size={16} />
              Выданные ключи
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex items-center gap-2">
              <AlertTriangle size={16} />
              Просроченные
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {filteredBookings.filter(b => b.status === "confirmed").length > 0 ? (
              <div className="space-y-4">
                {filteredBookings
                  .filter(b => b.status === "confirmed")
                  .map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{booking.room}</h3>
                              <StatusBadge status={booking.overdue ? "overdue" : booking.status} />
                            </div>
                            <p className="text-muted-foreground">{booking.building} - {booking.title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(booking.start)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTime(booking.start)} - {formatTime(booking.end)}
                              </span>
                            </div>
                            <p className="mt-2">
                              <span className="font-medium">Студент:</span> {booking.student.name}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Код доступа:</span> {booking.accessCode}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!booking.key_issued ? (
                              <Button onClick={() => handleKeyIssue(booking.id)} className="flex items-center gap-2">
                                <KeyRound size={16} />
                                Выдать ключ
                              </Button>
                            ) : !booking.key_returned ? (
                              <Button onClick={() => handleKeyReturn(booking.id)} variant="outline" className="flex items-center gap-2">
                                <CheckCircle size={16} />
                                Принять ключ
                              </Button>
                            ) : (
                              <Button disabled variant="outline" className="flex items-center gap-2">
                                <CheckCircle size={16} />
                                Ключ возвращен
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Нет текущих подтвержденных бронирований</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="keys">
            {filteredBookings.filter(b => b.key_issued && !b.key_returned).length > 0 ? (
              <div className="space-y-4">
                {filteredBookings
                  .filter(b => b.key_issued && !b.key_returned)
                  .map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{booking.room}</h3>
                              <StatusBadge status={booking.overdue ? "overdue" : "confirmed"} />
                            </div>
                            <p className="text-muted-foreground">{booking.building} - {booking.title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(booking.start)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTime(booking.start)} - {formatTime(booking.end)}
                              </span>
                            </div>
                            <p className="mt-2">
                              <span className="font-medium">Студент:</span> {booking.student.name}
                            </p>
                            {booking.overdue && (
                              <p className="text-red-500 font-medium mt-1">
                                Просрочено на {booking.overdue_minutes} мин.
                              </p>
                            )}
                          </div>
                          <Button onClick={() => handleKeyReturn(booking.id)} variant="outline" className="flex items-center gap-2">
                            <CheckCircle size={16} />
                            Принять ключ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Нет выданных ключей</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="overdue">
            {filteredBookings.filter(b => b.overdue).length > 0 ? (
              <div className="space-y-4">
                {filteredBookings
                  .filter(b => b.overdue)
                  .map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{booking.room}</h3>
                              <StatusBadge status="overdue" />
                            </div>
                            <p className="text-muted-foreground">{booking.building} - {booking.title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(booking.start)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTime(booking.start)} - {formatTime(booking.end)}
                              </span>
                            </div>
                            <p className="mt-2">
                              <span className="font-medium">Студент:</span> {booking.student.name}
                            </p>
                            <p className="text-red-500 font-medium mt-1">
                              Просрочено на {booking.overdue_minutes} мин.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!booking.key_returned && (
                              <Button onClick={() => handleKeyReturn(booking.id)} className="flex items-center gap-2">
                                <CheckCircle size={16} />
                                Принять ключ
                              </Button>
                            )}
                            <Button variant="outline" className="flex items-center gap-2">
                              <AlertTriangle size={16} />
                              Отметить нарушение
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Нет просроченных бронирований</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default GuardDashboard;
