
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, User, Calendar, CheckCircle, X, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import BookingCard from "@/components/BookingCard";

const AdminBookingsPage = () => {
  const { bookings, confirmBooking, cancelBooking, isLoading } = useBooking();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBookings, setFilteredBookings] = useState(bookings);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        booking.room.toLowerCase().includes(searchLower) ||
        (booking.student_name || "").toLowerCase().includes(searchLower) ||
        new Date(booking.start).toLocaleDateString().includes(searchTerm)
      );
    });
    setFilteredBookings(filtered);
  }, [searchTerm, bookings]);

  const handleConfirmBooking = async () => {
    if (selectedBooking === null) return;
    
    const success = await confirmBooking(selectedBooking);
    if (success) {
      toast.success("Бронирование подтверждено");
      setIsConfirmDialogOpen(false);
    }
  };

  const handleCancelBooking = async () => {
    if (selectedBooking === null) return;
    
    const success = await cancelBooking(selectedBooking);
    if (success) {
      toast.success("Бронирование отменено");
      setIsCancelDialogOpen(false);
    }
  };

  const getPendingBookings = () => filteredBookings.filter(b => b.status === 'pending');
  const getActiveBookings = () => filteredBookings.filter(b => b.status === 'confirmed' && new Date(b.start) <= new Date() && new Date(b.end) >= new Date());
  const getUpcomingBookings = () => filteredBookings.filter(b => b.status === 'confirmed' && new Date(b.start) > new Date());
  const getCompletedBookings = () => filteredBookings.filter(b => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.end) < new Date()));

  const renderBookingItem = (booking) => {
    const roomDetails = booking.room;
    const startDate = new Date(booking.start).toLocaleDateString();
    const startTime = new Date(booking.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const endTime = new Date(booking.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    return (
      <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">{roomDetails}</h3>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{startDate}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{startTime} - {endTime}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{booking.student_name || `Студент #${booking.student_id}`}</span>
            </div>
            {booking.status === 'confirmed' && booking.access_code && (
              <div className="text-sm font-medium text-green-600">
                Код доступа: {booking.access_code}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {booking.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(booking.id);
                    setIsConfirmDialogOpen(true);
                  }}
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Подтвердить
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(booking.id);
                    setIsCancelDialogOpen(true);
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Отклонить
                </Button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  setSelectedBooking(booking.id);
                  setIsCancelDialogOpen(true);
                }}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Отменить
              </Button>
            )}
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Детали
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление бронированиями</h1>
          <p className="text-muted-foreground">
            Просмотр и управление всеми бронированиями в системе
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск бронирований по аудитории, пользователю или дате..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="pending">Ожидание ({getPendingBookings().length})</TabsTrigger>
            <TabsTrigger value="active">Активные ({getActiveBookings().length})</TabsTrigger>
            <TabsTrigger value="upcoming">Предстоящие ({getUpcomingBookings().length})</TabsTrigger>
            <TabsTrigger value="completed">Завершенные ({getCompletedBookings().length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Все бронирования</CardTitle>
                <CardDescription>
                  Просмотр всех бронирований в системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => renderBookingItem(booking))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Бронирования не найдены</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ожидающие подтверждения</CardTitle>
                <CardDescription>
                  Бронирования, которые требуют подтверждения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getPendingBookings().length > 0 ? (
                    getPendingBookings().map(booking => renderBookingItem(booking))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Нет бронирований, ожидающих подтверждения</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Активные бронирования</CardTitle>
                <CardDescription>
                  Бронирования, которые активны в данный момент
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getActiveBookings().length > 0 ? (
                    getActiveBookings().map(booking => renderBookingItem(booking))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Нет активных бронирований</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Предстоящие бронирования</CardTitle>
                <CardDescription>
                  Бронирования, которые подтверждены и ещё не начались
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingBookings().length > 0 ? (
                    getUpcomingBookings().map(booking => renderBookingItem(booking))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Нет предстоящих бронирований</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Завершенные бронирования</CardTitle>
                <CardDescription>
                  Бронирования, которые уже завершились
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getCompletedBookings().length > 0 ? (
                    getCompletedBookings().map(booking => renderBookingItem(booking))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Нет завершенных бронирований</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirm Booking Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение бронирования</DialogTitle>
            <DialogDescription>
              Вы действительно хотите подтвердить это бронирование? После подтверждения будет сгенерирован код доступа.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleConfirmBooking}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Подтверждение...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Подтвердить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отмена бронирования</DialogTitle>
            <DialogDescription>
              Вы действительно хотите отменить это бронирование? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отмена бронирования...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Отменить бронирование
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default AdminBookingsPage;
