
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Filter, Search, Clock } from "lucide-react";
import BookingCard from "@/components/BookingCard";
import PageLayout from "@/components/PageLayout";
import { formatDate } from "@/lib/utils";

interface Booking {
  id: number;
  room: string;
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

const mockBookings: Booking[] = [
  {
    id: 1,
    room: "A101",
    student_id: "2020123456",
    student_name: "Иванов Иван",
    start: "2024-09-15T10:00:00",
    end: "2024-09-15T12:00:00",
    status: "confirmed",
    key_issued: true,
    key_returned: false,
    access_code: "1234",
    notes: "Групповое занятие",
    created_at: "2024-09-01T10:00:00",
    updated_at: "2024-09-01T10:00:00"
  },
  {
    id: 2,
    room: "B203",
    student_id: "2021654321",
    student_name: "Петрова Анна",
    start: "2024-09-16T14:00:00",
    end: "2024-09-16T16:00:00",
    status: "completed",
    key_issued: true,
    key_returned: true,
    access_code: "5678",
    notes: "Индивидуальная работа",
    created_at: "2024-09-02T10:00:00",
    updated_at: "2024-09-02T10:00:00"
  },
  {
    id: 3,
    room: "C305",
    student_id: "2019112233",
    student_name: "Сидоров Алексей",
    start: "2024-09-17T16:00:00",
    end: "2024-09-17T18:00:00",
    status: "cancelled",
    key_issued: false,
    key_returned: false,
    access_code: null,
    notes: "Отменено",
    created_at: "2024-09-03T10:00:00",
    updated_at: "2024-09-03T10:00:00"
  },
  {
    id: 4,
    room: "A105",
    student_id: "2022445566",
    student_name: "Смирнова Ольга",
    start: "2024-09-18T12:00:00",
    end: "2024-09-18T14:00:00",
    status: "pending",
    key_issued: false,
    key_returned: false,
    access_code: null,
    notes: "Ожидает подтверждения",
    created_at: "2024-09-04T10:00:00",
    updated_at: "2024-09-04T10:00:00"
  },
  {
    id: 5,
    room: "D401",
    student_id: "2020998877",
    student_name: "Иванов Дмитрий",
    start: "2024-09-19T09:00:00",
    end: "2024-09-19T11:00:00",
    status: "confirmed",
    key_issued: true,
    key_returned: false,
    access_code: "9012",
    notes: "Подготовка к конференции",
    created_at: "2024-09-05T10:00:00",
    updated_at: "2024-09-05T10:00:00"
  }
];

const BookingHistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const filteredBookings = mockBookings.filter((booking) => {
    const searchMatch =
      booking.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.student_name.toLowerCase().includes(searchQuery.toLowerCase());

    const filterMatch =
      filter === "all" || booking.status.toLowerCase() === filter;

    // Fix: Convert Date to string for comparison
    const dateMatch = !date || formatDate(booking.start) === formatDate(date.toISOString());

    return searchMatch && filterMatch && dateMatch;
  });

  return (
    <PageLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">История бронирований</h1>
          <p className="text-muted-foreground">
            Просматривайте и управляйте своими бронированиями
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <span>Поиск бронирований</span>
                </CardTitle>
                <CardDescription>
                  Ищите бронирования по номеру комнаты или имени студента
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking as any} />
                ))
              ) : (
                <Card className="p-4 text-center text-muted-foreground">
                  Нет бронирований, соответствующих вашим критериям.
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
                  Фильтруйте бронирования по статусу и дате
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Статус</h4>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                      <TabsTrigger value="all" onClick={() => setFilter("all")}>Все</TabsTrigger>
                      <TabsTrigger value="pending" onClick={() => setFilter("pending")}>Ожидающие</TabsTrigger>
                      <TabsTrigger value="confirmed" onClick={() => setFilter("confirmed")}>Подтвержденные</TabsTrigger>
                      <TabsTrigger value="completed" onClick={() => setFilter("completed")}>Завершенные</TabsTrigger>
                      <TabsTrigger value="cancelled" onClick={() => setFilter("cancelled")}>Отмененные</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Дата</h4>
                  <Card className="border-none shadow-none">
                    <CardContent className="grid gap-4 p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                      />
                      {date ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full justify-center"
                          onClick={() => setDate(undefined)}
                        >
                          Сбросить дату
                        </Button>
                      ) : (
                        <p className="text-center text-sm text-muted-foreground">
                          Выберите дату
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BookingHistoryPage;
