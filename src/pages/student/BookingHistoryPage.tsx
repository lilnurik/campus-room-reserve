import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Calendar, Search, History, Clock } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { BookingCard } from "@/components/BookingCard";

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
    key_issued: true,
    accessCode: "AB12CD"
  },
  {
    id: 102,
    room: "B203",
    building: "Библиотека",
    title: "Зал для самостоятельной работы",
    start: "2025-03-08T14:00:00",
    end: "2025-03-08T16:00:00",
    status: "pending",
    key_issued: false,
    accessCode: "XY34ZW"
  },
  {
    id: 103,
    room: "A105", 
    building: "Главный корпус",
    title: "Учебная аудитория",
    start: "2025-03-06T09:00:00",
    end: "2025-03-06T11:00:00",
    status: "completed",
    key_issued: false,
    accessCode: "GH56IJ"
  },
  {
    id: 104,
    room: "C305",
    building: "Лабораторный корпус",
    title: "Лаборатория",
    start: "2025-03-05T16:00:00",
    end: "2025-03-05T18:00:00",
    status: "cancelled",
    key_issued: false,
    accessCode: "KL78MN"
  }
];

const BookingHistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = mockBookings.filter(booking => 
    booking.room.toLowerCase().includes(searchQuery.toLowerCase()) || 
    booking.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate bookings by status
  const activeBookings = filteredBookings.filter(booking => 
    booking.status === "confirmed" || booking.status === "pending"
  );
  
  const pastBookings = filteredBookings.filter(booking => 
    booking.status === "completed" || booking.status === "cancelled"
  );

  return (
    <PageLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">История бронирований</h1>
          <p className="text-muted-foreground">
            Просмотр всех ваших бронирований
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по названию комнаты, корпусу..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock size={16} />
              Текущие
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History size={16} />
              История
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Calendar size={16} />
              Все
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activeBookings.length > 0 ? (
              <div className="space-y-4">
                {activeBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} expanded />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    У вас нет активных бронирований
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {pastBookings.length > 0 ? (
              <div className="space-y-4">
                {pastBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} expanded />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    У вас нет истории бронирований
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="all">
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} expanded />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Бронирования не найдены
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Статистика бронирований</CardTitle>
            <CardDescription>
              Обзор ваших бронирований за последний месяц
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Всего бронирований</p>
                <p className="text-3xl font-bold">{mockBookings.length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Активных</p>
                <p className="text-3xl font-bold">{activeBookings.length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Завершено</p>
                <p className="text-3xl font-bold">{
                  mockBookings.filter(b => b.status === "completed").length
                }</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BookingHistoryPage;
