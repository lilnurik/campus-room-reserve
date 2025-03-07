
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBooking, Room, TimeSlot } from '@/context/BookingContext';
import MainLayout from '@/components/MainLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import RoomCard from '@/components/RoomCard';
import TimeSlotCard from '@/components/TimeSlotCard';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { CalendarDays, CheckCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const BookingPage: React.FC = () => {
  const { user } = useAuth();
  const { rooms, getTimeSlots, createBooking, isLoading } = useBooking();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [newBookingId, setNewBookingId] = useState<number | null>(null);
  const [showQRDialog, setShowQRDialog] = useState<boolean>(false);
  const [confirmationDetails, setConfirmationDetails] = useState<{
    id: number;
    room: string;
    accessCode: string;
    start: string;
    end: string;
  } | null>(null);

  // Ensure user is a student
  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/');
    }
  }, [user, navigate]);

  // Update available time slots when room or date changes
  useEffect(() => {
    if (selectedRoom && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const slots = getTimeSlots(selectedRoom.id, dateStr);
      setAvailableTimeSlots(slots);
    }
  }, [selectedRoom, selectedDate, getTimeSlots]);

  const handleSubmit = async () => {
    if (!user || !selectedRoom || !selectedTimeSlot) return;
    
    try {
      const bookingData = {
        room: selectedRoom.id,
        start: selectedTimeSlot.start,
        end: selectedTimeSlot.end,
        student_id: user.id
      };
      
      const newBooking = await createBooking(bookingData);
      
      if (newBooking) {
        setNewBookingId(newBooking.id);
        setStep(3); // Move to confirmation step
        setConfirmationDetails({
          id: newBooking.id,
          room: selectedRoom.name,
          accessCode: newBooking.access_code || '',
          start: newBooking.start,
          end: newBooking.end
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedRoom(null);
    setSelectedDate(new Date());
    setSelectedTimeSlot(null);
    setNewBookingId(null);
    setConfirmationDetails(null);
  };

  const handleShowQR = () => {
    setShowQRDialog(true);
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="container mx-auto p-4 animate-fade-in">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/student')}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Забронировать комнату</h1>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                1
              </div>
              <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>
                Выбор комнаты
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full ${step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"} flex items-center justify-center font-medium`}>
                2
              </div>
              <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>
                Дата и время
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full ${step >= 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground"} flex items-center justify-center font-medium`}>
                3
              </div>
              <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>
                Подтверждение
              </span>
            </div>
          </div>
        </div>
        
        {/* Step 1: Room Selection */}
        {step === 1 && (
          <div className="animate-slide-in">
            <Card>
              <CardHeader>
                <CardTitle>Выберите комнату</CardTitle>
                <CardDescription>
                  Выберите комнату, которую хотите забронировать
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Все</TabsTrigger>
                    <TabsTrigger value="lecture">Лекционные</TabsTrigger>
                    <TabsTrigger value="computer_lab">Компьютерные</TabsTrigger>
                    <TabsTrigger value="other">Другие</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rooms
                        .filter(room => room.status === 'available')
                        .map(room => (
                          <RoomCard
                            key={room.id}
                            room={room}
                            onSelect={setSelectedRoom}
                            isSelected={selectedRoom?.id === room.id}
                          />
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="lecture" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rooms
                        .filter(room => room.status === 'available' && room.type === 'lecture')
                        .map(room => (
                          <RoomCard
                            key={room.id}
                            room={room}
                            onSelect={setSelectedRoom}
                            isSelected={selectedRoom?.id === room.id}
                          />
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="computer_lab" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rooms
                        .filter(room => room.status === 'available' && room.type === 'computer_lab')
                        .map(room => (
                          <RoomCard
                            key={room.id}
                            room={room}
                            onSelect={setSelectedRoom}
                            isSelected={selectedRoom?.id === room.id}
                          />
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="other" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rooms
                        .filter(room => room.status === 'available' && !['lecture', 'computer_lab'].includes(room.type))
                        .map(room => (
                          <RoomCard
                            key={room.id}
                            room={room}
                            onSelect={setSelectedRoom}
                            isSelected={selectedRoom?.id === room.id}
                          />
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => navigate('/student')}>
                  Отмена
                </Button>
                <Button onClick={handleNext} disabled={!selectedRoom}>
                  Далее
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
        
        {/* Step 2: Date and Time Selection */}
        {step === 2 && (
          <div className="animate-slide-in">
            <Card>
              <CardHeader>
                <CardTitle>Выберите дату и время</CardTitle>
                <CardDescription>
                  {selectedRoom?.name} • Выберите дату и доступный временной слот
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <CalendarDays className="h-5 w-5 mr-2 text-muted-foreground" />
                      <h3 className="font-medium">Дата бронирования</h3>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          // Disable past dates
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="mx-auto"
                      />
                    </div>
                    
                    {selectedDate && (
                      <div className="mt-2 text-center text-sm text-muted-foreground">
                        Выбрано: {formatDate(selectedDate.toISOString())}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                      <h3 className="font-medium">Доступное время</h3>
                    </div>
                    
                    <div className="h-[400px] overflow-y-auto pr-2 space-y-2">
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot, index) => (
                          <TimeSlotCard
                            key={index}
                            slot={slot}
                            onSelect={slot.status === 'available' ? setSelectedTimeSlot : undefined}
                            isSelected={selectedTimeSlot?.start === slot.start}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                          <p>Нет доступных слотов для выбранной даты</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Назад
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!selectedTimeSlot || isLoading}
                >
                  {isLoading ? 'Обработка...' : 'Забронировать'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
        
        {/* Step 3: Confirmation */}
        {step === 3 && confirmationDetails && (
          <div className="animate-slide-in">
            <Card>
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-center">Бронирование создано!</CardTitle>
                <CardDescription className="text-center">
                  Ваше бронирование находится на рассмотрении. Вы получите уведомление, когда оно будет подтверждено.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Помещение</div>
                      <div className="font-medium">{confirmationDetails.room}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Код доступа</div>
                      <div className="font-medium">{confirmationDetails.accessCode}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Дата</div>
                      <div className="font-medium">{formatDate(confirmationDetails.start)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Время</div>
                      <div className="font-medium">
                        {new Date(confirmationDetails.start).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(confirmationDetails.end).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleShowQR}
                    className="w-full md:w-auto"
                  >
                    Просмотреть QR-код
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  Создать новое бронирование
                </Button>
                <Button onClick={() => navigate('/student/my-bookings')}>
                  Мои бронирования
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
        
        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR-код для бронирования</DialogTitle>
              <DialogDescription>
                Покажите этот код охраннику при получении ключа
              </DialogDescription>
            </DialogHeader>
            {confirmationDetails && (
              <QRCodeDisplay
                bookingId={confirmationDetails.id}
                roomName={confirmationDetails.room}
                accessCode={confirmationDetails.accessCode}
                startTime={confirmationDetails.start}
                endTime={confirmationDetails.end}
                onClose={() => setShowQRDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default BookingPage;
