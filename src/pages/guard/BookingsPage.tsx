import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Clock, DoorOpen, Search, User, X, Loader2, KeyRound } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { formatDistanceToNow, parseISO, isBefore, isAfter } from "date-fns";
import { ru } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BookingsPage = () => {
  const { bookings, rooms, updateBooking, issueKey, returnKey, isLoading, refreshBookings } = useBooking();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [isCheckingBooking, setIsCheckingBooking] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isVerifyingDialog, setIsVerifyingDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Call refreshBookings only once (or control it with a stable dependency)
  useEffect(() => {
    refreshBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterBookings = (status: string) => {
    const now = new Date();

    return bookings
        .filter(booking => {
          const matchesSearch =
              booking.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (booking.access_code && booking.access_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (booking.student_name && booking.student_name.toLowerCase().includes(searchTerm.toLowerCase()));

          const bookingStart = parseISO(booking.start);
          const bookingEnd = parseISO(booking.end);

          if (status === 'active') {
            return (
                matchesSearch &&
                booking.status === 'confirmed' &&
                isAfter(now, bookingStart) &&
                isBefore(now, bookingEnd)
            );
          } else if (status === 'upcoming') {
            return (
                matchesSearch &&
                booking.status === 'confirmed' &&
                isAfter(bookingStart, now) &&
                isBefore(bookingStart, new Date(now.getTime() + 2 * 60 * 60 * 1000)) // Next 2 hours
            );
          } else if (status === 'pending') {
            return matchesSearch && booking.status === 'pending';
          }

          return false;
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  const activeBookings = filterBookings('active');
  const upcomingBookings = filterBookings('upcoming');
  const pendingBookings = filterBookings('pending');

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : roomId;
  };

  const getTimeInfo = (booking: typeof bookings[0]) => {
    const now = new Date();
    const start = parseISO(booking.start);
    const end = parseISO(booking.end);

    if (isAfter(now, start) && isBefore(now, end)) {
      return `${formatDistanceToNow(end, { locale: ru, addSuffix: true })}`;
    } else {
      return `${formatDistanceToNow(start, { locale: ru, addSuffix: true })}`;
    }
  };

  const openVerifyDialog = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setAccessCode("");
    setIsVerifyingDialog(true);
  };

  const handleVerifyBooking = async (bookingId: number) => {
    setIsCheckingBooking(true);
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) {
      toast.error("Бронирование не найдено");
      setIsCheckingBooking(false);
      return;
    }

    if (booking.key_issued && !booking.key_returned) {
      const success = await returnKey(bookingId);
      if (success) {
        toast.success("Ключ успешно возвращен");
      }
    } else if (!booking.key_issued) {
      openVerifyDialog(bookingId);
    }

    setIsCheckingBooking(false);
  };

  const handleIssueKey = async () => {
    if (!selectedBookingId || !accessCode) {
      toast.error("Необходимо указать код доступа");
      return;
    }

    setIsCheckingBooking(true);
    const success = await issueKey(selectedBookingId, accessCode);

    if (success) {
      toast.success("Ключ успешно выдан");
      setIsVerifyingDialog(false);
      setSelectedBookingId(null);
      setAccessCode("");
    }

    setIsCheckingBooking(false);
  };

  const handleApproveBooking = async (bookingId: number) => {
    const success = await updateBooking(bookingId, {
      status: 'confirmed',
      notes: notes.trim() ? notes : undefined,
    });

    if (success) {
      toast.success("Бронирование подтверждено");
      setActiveBookingId(null);
      setNotes("");
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    const success = await updateBooking(bookingId, {
      status: 'cancelled',
      notes: notes.trim() ? notes : undefined,
    });

    if (success) {
      toast.success("Бронирование отклонено");
      setActiveBookingId(null);
      setNotes("");
    }
  };

  const handleOpenDoor = (roomId: string) => {
    toast.success(`Дверь аудитории ${getRoomName(roomId)} открыта`);
  };

  return (
      <PageLayout role="guard">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Текущие бронирования</h1>
            <p className="text-muted-foreground">Управление доступом к аудиториям на основе бронирований</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Поиск по номеру аудитории или коду бронирования..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => refreshBookings()} variant="outline" size="icon" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
            </Button>
          </div>

          <Tabs defaultValue="active">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Активные ({activeBookings.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Ближайшие ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="pending">Ожидают подтверждения ({pendingBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Активные бронирования</CardTitle>
                  <CardDescription>Бронирования, которые активны в данный момент</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeBookings.length > 0 ? (
                        activeBookings.map((booking) => (
                            <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-lg">{getRoomName(booking.room)}</h3>
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                {new Date(booking.start).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                      -{" "}
                                      {new Date(booking.end).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}{" "}
                                      ({getTimeInfo(booking)})
                              </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{booking.student_name || `Студент #${booking.student_id}`}</span>
                                  </div>
                                  {booking.access_code && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                                          Код: {booking.access_code}
                                        </div>
                                      </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                      variant={booking.key_issued ? "outline" : "default"}
                                      size="sm"
                                      onClick={() => handleVerifyBooking(booking.id)}
                                      disabled={isCheckingBooking}
                                  >
                                    {isCheckingBooking ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                        <KeyRound className="h-4 w-4 mr-1" />
                                    )}
                                    {booking.key_issued ? "Ключ выдан" : "Выдать ключ"}
                                  </Button>
                                  <Button size="sm" onClick={() => handleOpenDoor(booking.room)}>
                                    <DoorOpen className="h-4 w-4 mr-1" />
                                    Открыть дверь
                                  </Button>
                                </div>
                              </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
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
                  <CardTitle>Ближайшие бронирования</CardTitle>
                  <CardDescription>Бронирования, которые начнутся в течение следующих 2 часов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingBookings.length > 0 ? (
                        upcomingBookings.map((booking) => (
                            <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-lg">{getRoomName(booking.room)}</h3>
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                      Подтверждено
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                {new Date(booking.start).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                      -{" "}
                                      {new Date(booking.end).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}{" "}
                                      ({getTimeInfo(booking)})
                              </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{booking.student_name || `Студент #${booking.student_id}`}</span>
                                  </div>
                                  {booking.access_code && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                                          Код: {booking.access_code}
                                        </div>
                                      </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleOpenDoor(booking.room)}>
                                    <DoorOpen className="h-4 w-4 mr-1" />
                                    Подготовить аудиторию
                                  </Button>
                                </div>
                              </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Нет ближайших бронирований</p>
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
                  <CardDescription>Бронирования, которые требуют вашего подтверждения</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingBookings.length > 0 ? (
                        pendingBookings.map((booking) => (
                            <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-lg">{getRoomName(booking.room)}</h3>
                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                      Ожидает подтверждения
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                {new Date(booking.start).toLocaleDateString()}{" "}
                                      {new Date(booking.start).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}{" "}
                                      -{" "}
                                      {new Date(booking.end).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                              </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{booking.student_name || `Студент #${booking.student_id}`}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Запрос создан: {new Date(booking.created_at).toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setActiveBookingId(booking.id);
                                        setNotes("");
                                      }}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Подтвердить
                                  </Button>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-500"
                                      onClick={() => {
                                        setActiveBookingId(booking.id);
                                        setNotes("");
                                      }}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Отклонить
                                  </Button>
                                </div>
                              </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Нет бронирований, ожидающих подтверждения</p>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={!!activeBookingId} onOpenChange={(open) => !open && setActiveBookingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Подтверждение бронирования</DialogTitle>
              <DialogDescription>
                Вы собираетесь подтвердить или отклонить бронирование. При желании вы можете добавить комментарий.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Textarea
                  placeholder="Комментарий к бронированию (необязательно)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveBookingId(null)} disabled={isLoading}>
                Отмена
              </Button>
              <Button
                  variant="destructive"
                  onClick={() => activeBookingId && handleRejectBooking(activeBookingId)}
                  disabled={isLoading}
              >
                {isLoading ? "Обработка..." : "Отклонить"}
              </Button>
              <Button onClick={() => activeBookingId && handleApproveBooking(activeBookingId)} disabled={isLoading}>
                {isLoading ? "Обработка..." : "Подтвердить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isVerifyingDialog} onOpenChange={(open) => !open && setIsVerifyingDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Проверка кода доступа</DialogTitle>
              <DialogDescription>Введите код доступа, предоставленный студентом, для выдачи ключа.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Input
                  placeholder="Введите код доступа"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => {
                    setIsVerifyingDialog(false);
                    setSelectedBookingId(null);
                    setAccessCode("");
                  }}
                  disabled={isCheckingBooking}
              >
                Отмена
              </Button>
              <Button onClick={handleIssueKey} disabled={isCheckingBooking || !accessCode}>
                {isCheckingBooking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Проверка...
                    </>
                ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-1" />
                      Выдать ключ
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
  );
};

export default BookingsPage;