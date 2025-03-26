
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Key, Lock, Search, Unlock, AlertCircle, Clock, Loader2 } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Interface for key data
interface RoomKey {
  id: string;
  room_id: string;
  room_name: string;
  key_type: 'standard' | 'electronic' | 'master';
  status: 'available' | 'issued' | 'maintenance';
  issued_to?: {
    id: number;
    name: string;
    booking_id?: number;
    time_range?: string;
  };
  maintenance_reason?: string;
  maintenance_until?: string;
  last_updated: string;
}

const KeysPage = () => {
  const { rooms, bookings, issueKey, returnKey } = useBooking();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeKey, setActiveKey] = useState<RoomKey | null>(null);
  const [notes, setNotes] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAccessCodeError, setIsAccessCodeError] = useState(false);
  
  // Mock keys data - in a real implementation, this would come from an API
  const [keys, setKeys] = useState<RoomKey[]>([]);

  useEffect(() => {
    // Generate mock keys from rooms data
    const mockKeys: RoomKey[] = [];
    
    rooms.forEach(room => {
      // Each room has one key
      mockKeys.push({
        id: `${room.id}-A`,
        room_id: room.id,
        room_name: room.name,
        key_type: room.type === 'lecture' || room.type === 'conference' ? 'electronic' : 'standard',
        status: 'available',
        last_updated: new Date().toISOString()
      });
    });
    
    // Add some keys in different statuses
    if (rooms.length > 0) {
      // Find active bookings with issued keys
      const activeBookingsWithKeys = bookings.filter(b => 
        b.key_issued && !b.key_returned && b.status === 'confirmed'
      );
      
      // Mark keys as issued for those bookings
      activeBookingsWithKeys.forEach(booking => {
        const keyIndex = mockKeys.findIndex(k => k.room_id === booking.room);
        if (keyIndex !== -1) {
          mockKeys[keyIndex] = {
            ...mockKeys[keyIndex],
            status: 'issued',
            issued_to: {
              id: booking.student_id,
              name: booking.student_name || `Студент #${booking.student_id}`,
              booking_id: booking.id,
              time_range: `${new Date(booking.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(booking.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
            }
          };
        }
      });
      
      // Mark a couple of keys as under maintenance
      if (mockKeys.length > 3) {
        mockKeys[2] = {
          ...mockKeys[2],
          status: 'maintenance',
          maintenance_reason: 'Замена замка',
          maintenance_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };
      }
    }
    
    setKeys(mockKeys);
  }, [rooms, bookings]);

  // Filter keys based on search term and status
  const filterKeys = (status: 'available' | 'issued' | 'maintenance') => {
    return keys
      .filter(key => {
        const matchesSearch = 
          key.room_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          key.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          key.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch && key.status === status;
      })
      .sort((a, b) => a.room_id.localeCompare(b.room_id));
  };
  
  const availableKeys = filterKeys('available');
  const issuedKeys = filterKeys('issued');
  const maintenanceKeys = filterKeys('maintenance');

  // Function to issue a key
  const handleIssueKey = (key: RoomKey) => {
    setActiveKey(key);
    setNotes("");
    setAccessCode("");
    setIsAccessCodeError(false);
    setIsDialogOpen(true);
  };

  // Function to return a key
  const handleReturnKey = async (key: RoomKey) => {
    if (!key.issued_to?.booking_id) {
      toast.error("Информация о бронировании не найдена");
      return;
    }
    
    setIsLoading(true);
    
    const success = await returnKey(key.issued_to.booking_id);
    if (success) {
      toast.success("Ключ успешно возвращен");
      
      // Update local state
      setKeys(keys.map(k => 
        k.id === key.id 
          ? {...k, status: 'available', issued_to: undefined} 
          : k
      ));
    }
    
    setIsLoading(false);
  };

  // Function to confirm issuing a key to a specific user (from dialog)
  const handleConfirmIssueKey = async () => {
    if (!activeKey) return;
    
    setIsLoading(true);
    setIsAccessCodeError(false);
    
    // Find a booking that matches this room
    const matchingBooking = bookings.find(b => 
      b.room === activeKey.room_id && 
      b.status === 'confirmed' && 
      !b.key_issued
    );
    
    if (matchingBooking) {
      // Verify access code
      if (!accessCode) {
        setIsAccessCodeError(true);
        toast.error("Необходимо ввести код доступа");
        setIsLoading(false);
        return;
      }
      
      // Check if access code matches
      if (matchingBooking.access_code !== accessCode) {
        setIsAccessCodeError(true);
        toast.error("Неверный код доступа");
        setIsLoading(false);
        return;
      }
      
      const success = await issueKey(matchingBooking.id, accessCode);
      
      if (success) {
        // Update local state
        setKeys(keys.map(k => 
          k.id === activeKey.id 
            ? {
                ...k, 
                status: 'issued', 
                issued_to: {
                  id: matchingBooking.student_id,
                  name: matchingBooking.student_name || `Студент #${matchingBooking.student_id}`,
                  booking_id: matchingBooking.id,
                  time_range: `${new Date(matchingBooking.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(matchingBooking.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                }
              } 
            : k
        ));
        
        toast.success("Ключ успешно выдан");
        setIsDialogOpen(false);
      }
    } else {
      // No matching booking found
      toast.error("Не найдено подтвержденное бронирование для этой аудитории или код доступа не сгенерирован");
    }
    
    setIsLoading(false);
  };

  return (
    <PageLayout role="guard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление ключами</h1>
          <p className="text-muted-foreground">
            Контроль доступа к аудиториям и выдача ключей
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по номеру аудитории..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="available">
          <TabsList className="mb-6">
            <TabsTrigger value="available">Доступные ключи ({availableKeys.length})</TabsTrigger>
            <TabsTrigger value="issued">Выданные ключи ({issuedKeys.length})</TabsTrigger>
            <TabsTrigger value="maintenance">На обслуживании ({maintenanceKeys.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Доступные ключи</CardTitle>
                <CardDescription>
                  Ключи, которые в данный момент находятся на посту охраны
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableKeys.length > 0 ? (
                    availableKeys.map((key) => (
                      <div key={key.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">{key.room_name}</h3>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Доступен
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Key className="h-4 w-4" />
                              <span>Ключ #{key.id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Lock className="h-4 w-4" />
                              <span>Тип: {key.key_type === 'electronic' ? 'Электронный' : 'Стандартный'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleIssueKey(key)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Unlock className="h-4 w-4 mr-1" />
                              )}
                              Выдать ключ
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Нет доступных ключей</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issued" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Выданные ключи</CardTitle>
                <CardDescription>
                  Ключи, которые были выданы посетителям
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {issuedKeys.length > 0 ? (
                    issuedKeys.map((key) => (
                      <div key={key.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">{key.room_name}</h3>
                              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                                <Key className="h-3 w-3 mr-1" />
                                Выдан
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Key className="h-4 w-4" />
                              <span>Ключ #{key.id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Lock className="h-4 w-4" />
                              <span>
                                Выдан: {key.issued_to?.name || "Неизвестно"}
                                {key.issued_to?.time_range && ` (${key.issued_to.time_range})`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReturnKey(key)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Lock className="h-4 w-4 mr-1" />
                              )}
                              Принять ключ
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Нет выданных ключей</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ключи на обслуживании</CardTitle>
                <CardDescription>
                  Ключи, которые временно недоступны из-за обслуживания
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceKeys.length > 0 ? (
                    maintenanceKeys.map((key) => (
                      <div key={key.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">{key.room_name}</h3>
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                На обслуживании
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Key className="h-4 w-4" />
                              <span>Ключ #{key.id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Lock className="h-4 w-4" />
                              <span>Причина: {key.maintenance_reason || "Неизвестно"}</span>
                            </div>
                            {key.maintenance_until && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Ожидаемое возвращение: {new Date(key.maintenance_until).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Нет ключей на обслуживании</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog for issuing a key */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выдача ключа</DialogTitle>
            <DialogDescription>
              Для выдачи ключа необходимо ввести код доступа, который студент получил после подтверждения бронирования администратором.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="accessCode" className="text-sm font-medium">
                Код доступа
              </label>
              <Input
                id="accessCode"
                placeholder="Введите код доступа"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setIsAccessCodeError(false);
                }}
                className={isAccessCodeError ? "border-red-500" : ""}
              />
              {isAccessCodeError && (
                <p className="text-sm text-red-500">
                  Неверный код доступа. Попросите студента показать код из его бронирования.
                </p>
              )}
            </div>
            
            <Textarea
              placeholder="Комментарий к выдаче ключа (необязательно)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleConfirmIssueKey}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Обработка...
                </>
              ) : (
                "Выдать ключ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default KeysPage;
