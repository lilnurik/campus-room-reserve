
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookingCard from '@/components/BookingCard';
import { Building, CalendarPlus, ClipboardList } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserBookings, cancelBooking } = useBooking();
  const navigate = useNavigate();
  
  // Ensure user is a student
  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  const userBookings = getUserBookings(user.id);
  const activeBookings = userBookings.filter(b => 
    ['confirmed', 'pending'].includes(b.status)
  ).slice(0, 2);

  return (
    <MainLayout>
      <div className="container mx-auto p-4 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Здравствуйте, {user.name}!</h1>
          <p className="text-muted-foreground">Панель управления студента</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Последние бронирования</CardTitle>
              <CardDescription>Ваши текущие и предстоящие бронирования</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking}
                      showCancelButton
                      onCancel={cancelBooking}
                      onViewDetails={() => navigate(`/student/booking/${booking.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>У вас нет активных бронирований</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/student/my-bookings')}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Все бронирования
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>Что хотите сделать?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start h-auto py-4"
                onClick={() => navigate('/student/booking')}
              >
                <CalendarPlus className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div>Забронировать комнату</div>
                  <div className="text-xs text-primary-foreground/70">
                    Создать новое бронирование
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-4"
                onClick={() => navigate('/student/my-bookings')}
              >
                <ClipboardList className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div>Мои бронирования</div>
                  <div className="text-xs text-muted-foreground">
                    Просмотр и управление
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Доступные помещения</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Лекционные залы</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center text-muted-foreground">
                  <Building className="h-5 w-5 mr-2" />
                  <span>12 доступных комнат</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/student/booking')}
                >
                  Просмотреть и забронировать
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Компьютерные классы</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center text-muted-foreground">
                  <Building className="h-5 w-5 mr-2" />
                  <span>8 доступных комнат</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/student/booking')}
                >
                  Просмотреть и забронировать
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Конференц-залы</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center text-muted-foreground">
                  <Building className="h-5 w-5 mr-2" />
                  <span>5 доступных комнат</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/student/booking')}
                >
                  Просмотреть и забронировать
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentDashboard;
