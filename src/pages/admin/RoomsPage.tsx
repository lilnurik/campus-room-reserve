
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Search, Building, Pencil, Trash, LayoutGrid } from "lucide-react";
import { useBooking, RoomType, RoomStatus, Room } from "@/context/BookingContext";
import { toast } from "sonner";

const RoomsPage = () => {
  const { rooms, addRoom, updateRoom, deleteRoom, isLoading } = useBooking();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  
  // Filter for room type
  const [selectedType, setSelectedType] = useState<string>("all");
  // Filter for building
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  // Filter for status
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Состояние для новой комнаты
  const [newRoom, setNewRoom] = useState<Room>({
    id: "",
    name: "",
    building: "",
    capacity: 0,
    type: "lecture",
    features: [],
    status: "available",
    floor: 1,
    description: ""
  });

  // Состояние для редактируемой комнаты
  const [editedRoom, setEditedRoom] = useState<Room | null>(null);

  // Список доступных типов помещений
  const roomTypes = [
    { value: "lecture", label: "Лекционная" },
    { value: "computer_lab", label: "Компьютерная" },
    { value: "lab", label: "Лаборатория" },
    { value: "conference", label: "Конференц-зал" },
    { value: "sports", label: "Спортивный зал" },
    { value: "office", label: "Офисное помещение" },
    { value: "library", label: "Библиотека" },
    { value: "coworking", label: "Коворкинг" }
  ];

  // Список доступных особенностей помещений
  const availableFeatures = [
    { id: "projector", label: "Проектор" },
    { id: "computer", label: "Компьютер" },
    { id: "whiteboard", label: "Доска" },
    { id: "air_conditioning", label: "Кондиционер" },
    { id: "audio_system", label: "Аудиосистема" },
    { id: "video_conferencing", label: "Видеоконференции" },
    { id: "specialized_equipment", label: "Спец. оборудование" },
    { id: "ventilation", label: "Вентиляция" },
    { id: "safety_equipment", label: "Безопасность" },
    { id: "computers", label: "Компьютеры" },
    { id: "basketball_court", label: "Баскетбол" },
    { id: "volleyball_court", label: "Волейбол" },
    { id: "changing_rooms", label: "Раздевалки" },
    { id: "high_speed_internet", label: "Высокоскоростной интернет" },
    { id: "coffee_machine", label: "Кофемашина" },
    { id: "lounge_area", label: "Зона отдыха" },
    { id: "meeting_table", label: "Стол для совещаний" },
    { id: "printer", label: "Принтер" },
    { id: "quiet_zone", label: "Тихая зона" },
    { id: "bookshelves", label: "Книжные полки" }
  ];

  // Получаем уникальные здания из данных
  const uniqueBuildings = Array.from(new Set(rooms.map(room => room.building)));

  // Фильтрация комнат по всем параметрам
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.building.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || room.type === selectedType;
    const matchesBuilding = selectedBuilding === "all" || room.building === selectedBuilding;
    const matchesStatus = selectedStatus === "all" || room.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesBuilding && matchesStatus;
  });

  // Отображение типа помещения на русском языке
  const getRoomTypeLabel = (type: RoomType): string => {
    const typeItem = roomTypes.find(item => item.value === type);
    return typeItem?.label || type;
  };

  // Отображение статуса помещения на русском языке
  const getRoomStatusLabel = (status: RoomStatus): string => {
    switch (status) {
      case "available": return "Доступна";
      case "unavailable": return "Недоступна";
      case "maintenance": return "Обслуживание";
      default: return status;
    }
  };

  // Функция для получения класса цвета статуса
  const getStatusColorClass = (status: RoomStatus): string => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "unavailable": return "bg-red-100 text-red-800";
      case "maintenance": return "bg-amber-100 text-amber-800";
      default: return "";
    }
  };

  // Обработчик для формы добавления комнаты
  const handleAddRoom = async () => {
    if (!newRoom.id || !newRoom.name || !newRoom.building) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    
    const success = await addRoom(newRoom);
    if (success) {
      setIsAddRoomOpen(false);
      // Сбросить форму
      setNewRoom({
        id: "",
        name: "",
        building: "",
        capacity: 0,
        type: "lecture",
        features: [],
        status: "available",
        floor: 1,
        description: ""
      });
    }
  };

  // Обработчик для выбора функций комнаты
  const toggleFeature = (feature: string, isEdit: boolean = false) => {
    if (isEdit && editedRoom) {
      if (editedRoom.features.includes(feature)) {
        setEditedRoom({
          ...editedRoom,
          features: editedRoom.features.filter(f => f !== feature)
        });
      } else {
        setEditedRoom({
          ...editedRoom,
          features: [...editedRoom.features, feature]
        });
      }
    } else {
      if (newRoom.features.includes(feature)) {
        setNewRoom({
          ...newRoom,
          features: newRoom.features.filter(f => f !== feature)
        });
      } else {
        setNewRoom({
          ...newRoom,
          features: [...newRoom.features, feature]
        });
      }
    }
  };

  // Обработчик для открытия диалога редактирования
  const handleEditClick = (roomId: string) => {
    const roomToEdit = rooms.find(r => r.id === roomId);
    if (roomToEdit) {
      setEditedRoom({...roomToEdit});
      setActiveRoom(roomId);
    }
  };

  // Обработчик для сохранения изменений
  const handleSaveChanges = async () => {
    if (!editedRoom) return;
    
    const success = await updateRoom(editedRoom.id, editedRoom);
    if (success) {
      setActiveRoom(null);
      setEditedRoom(null);
    }
  };

  // Обработчик для открытия диалога удаления
  const handleDeleteClick = (roomId: string) => {
    setRoomToDelete(roomId);
    setIsDeleteDialogOpen(true);
  };

  // Обработчик для подтверждения удаления
  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    
    const success = await deleteRoom(roomToDelete);
    if (success) {
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  return (
    <PageLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Управление помещениями</h1>
            <p className="text-muted-foreground">
              Добавляйте, редактируйте и управляйте аудиториями и другими помещениями университета
            </p>
          </div>
          
          <Button onClick={() => setIsAddRoomOpen(true)} className="self-start md:self-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Добавить помещение
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-72">
            <Card>
              <CardHeader>
                <CardTitle>Фильтры</CardTitle>
                <CardDescription>Отфильтруйте список помещений</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Поиск</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Поиск по названию или ID"
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="building-filter">Корпус</Label>
                  <Select 
                    value={selectedBuilding}
                    onValueChange={setSelectedBuilding}
                  >
                    <SelectTrigger id="building-filter">
                      <SelectValue placeholder="Выберите корпус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все корпуса</SelectItem>
                      {uniqueBuildings.map((building, index) => (
                        <SelectItem key={index} value={building}>{building}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type-filter">Тип помещения</Label>
                  <Select 
                    value={selectedType}
                    onValueChange={setSelectedType}
                  >
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      {roomTypes.map((type, index) => (
                        <SelectItem key={index} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Статус</Label>
                  <Select 
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="available">Доступна</SelectItem>
                      <SelectItem value="unavailable">Недоступна</SelectItem>
                      <SelectItem value="maintenance">Обслуживание</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Список помещений</CardTitle>
                <CardDescription>
                  Всего помещений: {filteredRooms.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="table">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="table">Таблица</TabsTrigger>
                      <TabsTrigger value="grid">Плитка</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="table">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Название</TableHead>
                            <TableHead>Корпус</TableHead>
                            <TableHead>Этаж</TableHead>
                            <TableHead>Вместимость</TableHead>
                            <TableHead>Тип</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRooms.length > 0 ? (
                            filteredRooms.map((room) => (
                              <TableRow key={room.id}>
                                <TableCell className="font-medium">{room.id}</TableCell>
                                <TableCell>{room.name}</TableCell>
                                <TableCell>{room.building}</TableCell>
                                <TableCell>{room.floor || "-"}</TableCell>
                                <TableCell>{room.capacity}</TableCell>
                                <TableCell>{getRoomTypeLabel(room.type)}</TableCell>
                                <TableCell>
                                  <Badge 
                                    className={getStatusColorClass(room.status)}
                                  >
                                    {getRoomStatusLabel(room.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="icon" onClick={() => handleEditClick(room.id)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="text-red-500" onClick={() => handleDeleteClick(room.id)}>
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                Помещения не найдены
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="grid">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRooms.length > 0 ? (
                        filteredRooms.map((room) => (
                          <Card key={room.id} className="overflow-hidden">
                            <div className="h-32 bg-primary/10 flex items-center justify-center">
                              <Building className="h-16 w-16 text-primary/40" />
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">{room.name}</h3>
                                  <p className="text-sm text-muted-foreground">{room.building}, Этаж: {room.floor || "-"}</p>
                                </div>
                                <Badge 
                                  className={getStatusColorClass(room.status)}
                                >
                                  {getRoomStatusLabel(room.status)}
                                </Badge>
                              </div>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm">ID: <span className="font-medium">{room.id}</span></p>
                                <p className="text-sm">Вместимость: <span className="font-medium">{room.capacity}</span></p>
                                <p className="text-sm">Тип: <span className="font-medium">{getRoomTypeLabel(room.type)}</span></p>
                                {room.description && (
                                  <p className="text-sm mt-2">{room.description}</p>
                                )}
                              </div>
                              <div className="mt-3 flex flex-wrap gap-1">
                                {room.features.map((feature, index) => {
                                  const featureObj = availableFeatures.find(f => f.id === feature);
                                  return (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {featureObj?.label || feature}
                                    </Badge>
                                  );
                                })}
                              </div>
                              <div className="mt-4 flex justify-end space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditClick(room.id)}>
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Изменить
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteClick(room.id)}>
                                  <Trash className="h-3 w-3 mr-1" />
                                  Удалить
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          Помещения не найдены
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Диалог добавления нового помещения */}
      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Добавить новое помещение</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом помещении. Поля, отмеченные *, обязательны для заполнения.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-id">ID помещения *</Label>
                <Input 
                  id="room-id" 
                  placeholder="Например: A101" 
                  value={newRoom.id}
                  onChange={(e) => setNewRoom({...newRoom, id: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-name">Название *</Label>
                <Input 
                  id="room-name" 
                  placeholder="Название помещения" 
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-building">Корпус *</Label>
                <Select 
                  value={newRoom.building}
                  onValueChange={(value) => setNewRoom({...newRoom, building: value})}
                >
                  <SelectTrigger id="room-building">
                    <SelectValue placeholder="Выберите корпус" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueBuildings.map((building, index) => (
                      <SelectItem key={index} value={building}>{building}</SelectItem>
                    ))}
                    <SelectItem value="Главный корпус">Главный корпус</SelectItem>
                    <SelectItem value="Технический корпус">Технический корпус</SelectItem>
                    <SelectItem value="Административный корпус">Административный корпус</SelectItem>
                    <SelectItem value="Научный корпус">Научный корпус</SelectItem>
                    <SelectItem value="Спортивный комплекс">Спортивный комплекс</SelectItem>
                    <SelectItem value="Библиотека">Библиотека</SelectItem>
                    <SelectItem value="Студенческий центр">Студенческий центр</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-floor">Этаж</Label>
                <Input 
                  id="room-floor" 
                  type="number" 
                  min="0" 
                  placeholder="Номер этажа" 
                  value={newRoom.floor || ''}
                  onChange={(e) => setNewRoom({...newRoom, floor: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Вместимость *</Label>
                <Input 
                  id="room-capacity" 
                  type="number" 
                  min="1" 
                  placeholder="Количество мест" 
                  value={newRoom.capacity || ''}
                  onChange={(e) => setNewRoom({...newRoom, capacity: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-type">Тип помещения *</Label>
                <Select 
                  value={newRoom.type}
                  onValueChange={(value: any) => setNewRoom({...newRoom, type: value})}
                >
                  <SelectTrigger id="room-type">
                    <SelectValue placeholder="Выберите тип помещения" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type, index) => (
                      <SelectItem key={index} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="room-description">Описание</Label>
              <Textarea 
                id="room-description" 
                placeholder="Дополнительная информация о помещении" 
                value={newRoom.description || ''}
                onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Функции и оборудование</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Switch 
                      id={`feature-${feature.id}`} 
                      checked={newRoom.features.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                    />
                    <Label htmlFor={`feature-${feature.id}`}>{feature.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="room-status">Статус *</Label>
              <Select 
                value={newRoom.status}
                onValueChange={(value: any) => setNewRoom({...newRoom, status: value})}
              >
                <SelectTrigger id="room-status">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Доступна</SelectItem>
                  <SelectItem value="unavailable">Недоступна</SelectItem>
                  <SelectItem value="maintenance">Обслуживание</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoomOpen(false)} disabled={isLoading}>
              Отмена
            </Button>
            <Button onClick={handleAddRoom} disabled={isLoading}>
              {isLoading ? "Добавление..." : "Добавить помещение"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог для редактирования помещения */}
      <Dialog open={!!activeRoom} onOpenChange={(open) => !open && setActiveRoom(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать помещение</DialogTitle>
            <DialogDescription>
              Измените информацию о выбранном помещении.
            </DialogDescription>
          </DialogHeader>
          
          {editedRoom && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-room-id">ID помещения</Label>
                  <Input 
                    id="edit-room-id" 
                    value={editedRoom.id}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-room-name">Название</Label>
                  <Input 
                    id="edit-room-name" 
                    value={editedRoom.name}
                    onChange={(e) => setEditedRoom({...editedRoom, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-room-building">Корпус</Label>
                  <Select 
                    value={editedRoom.building}
                    onValueChange={(value) => setEditedRoom({...editedRoom, building: value})}
                  >
                    <SelectTrigger id="edit-room-building">
                      <SelectValue placeholder="Выберите корпус" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueBuildings.map((building, index) => (
                        <SelectItem key={index} value={building}>{building}</SelectItem>
                      ))}
                      <SelectItem value="Главный корпус">Главный корпус</SelectItem>
                      <SelectItem value="Технический корпус">Технический корпус</SelectItem>
                      <SelectItem value="Административный корпус">Административный корпус</SelectItem>
                      <SelectItem value="Научный корпус">Научный корпус</SelectItem>
                      <SelectItem value="Спортивный комплекс">Спортивный комплекс</SelectItem>
                      <SelectItem value="Библиотека">Библиотека</SelectItem>
                      <SelectItem value="Студенческий центр">Студенческий центр</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-room-floor">Этаж</Label>
                  <Input 
                    id="edit-room-floor" 
                    type="number" 
                    min="0" 
                    value={editedRoom.floor || ''}
                    onChange={(e) => setEditedRoom({...editedRoom, floor: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-room-capacity">Вместимость</Label>
                  <Input 
                    id="edit-room-capacity" 
                    type="number" 
                    min="1" 
                    value={editedRoom.capacity || ''}
                    onChange={(e) => setEditedRoom({...editedRoom, capacity: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-room-type">Тип помещения</Label>
                  <Select 
                    value={editedRoom.type}
                    onValueChange={(value: any) => setEditedRoom({...editedRoom, type: value})}
                  >
                    <SelectTrigger id="edit-room-type">
                      <SelectValue placeholder="Выберите тип помещения" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type, index) => (
                        <SelectItem key={index} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-room-description">Описание</Label>
                <Textarea 
                  id="edit-room-description" 
                  placeholder="Дополнительная информация о помещении" 
                  value={editedRoom.description || ''}
                  onChange={(e) => setEditedRoom({...editedRoom, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Функции и оборудование</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Switch 
                        id={`edit-feature-${feature.id}`} 
                        checked={editedRoom.features.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id, true)}
                      />
                      <Label htmlFor={`edit-feature-${feature.id}`}>{feature.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-room-status">Статус</Label>
                <Select 
                  value={editedRoom.status}
                  onValueChange={(value: any) => setEditedRoom({...editedRoom, status: value})}
                >
                  <SelectTrigger id="edit-room-status">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Доступна</SelectItem>
                    <SelectItem value="unavailable">Недоступна</SelectItem>
                    <SelectItem value="maintenance">Обслуживание</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveRoom(null)} disabled={isLoading}>
              Отмена
            </Button>
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить это помещение? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isLoading}>
              {isLoading ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default RoomsPage;
