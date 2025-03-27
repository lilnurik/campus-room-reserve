
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CalendarCheck, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import BookingCard from "@/components/BookingCard";
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Mock data
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
  }
];

const StudentDashboard = () => {
  const { t } = useTranslation();
  const [activeBookings, setActiveBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For now, we'll use our mock data and sort it
    const now = new Date();
    
    const active = mockBookings.filter(booking => {
      const start = new Date(booking.start);
      const end = new Date(booking.end);
      return start <= now && end >= now;
    });
    
    const upcoming = mockBookings.filter(booking => {
      const start = new Date(booking.start);
      return start > now;
    });
    
    const past = mockBookings.filter(booking => {
      const end = new Date(booking.end);
      return end < now;
    });
    
    setActiveBookings(active);
    setUpcomingBookings(upcoming);
    setPastBookings(past);
  }, []);

  return (
    <PageLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button asChild className="self-start">
              <Link to="/student/booking" className="flex items-center gap-2">
                <Plus size={18} />
                {t('dashboard.bookRoom')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="text-primary" size={20} />
                {t('dashboard.currentBookings')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.currentBookingsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeBookings.length > 0 ? (
                activeBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  {t('dashboard.noActiveBookings')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="text-primary" size={20} />
                {t('dashboard.upcomingBookings')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.upcomingBookingsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  {t('dashboard.noUpcomingBookings')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarCheck className="text-primary" size={20} />
                {t('dashboard.bookingHistory')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.bookingHistoryDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  {t('dashboard.noPastBookings')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <Tabs defaultValue="rooms" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="rooms">{t('dashboard.popularRooms')}</TabsTrigger>
            <TabsTrigger value="times">{t('dashboard.availableNow')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rooms">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="card-hover">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <Calendar className="text-primary h-12 w-12 opacity-50" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">Комната A{i}01</h3>
                      <p className="text-sm text-muted-foreground">
                        {i === 1 ? "Главный корпус" : i === 2 ? "Лабораторный корпус" : "Библиотека"}
                      </p>
                      <div className="mt-2 flex items-center text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          {t('dashboard.available')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="times">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="card-hover">
                  <CardContent className="p-4">
                    <h3 className="font-medium">Комната B{i}02</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {i === 1 ? "Главный корпус" : i === 2 ? "Лабораторный корпус" : "Библиотека"}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Сейчас - 18:00
                      </span>
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/student/booking">Забронировать</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default StudentDashboard;
