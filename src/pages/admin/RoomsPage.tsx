
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
import { PlusCircle, Search, Settings, Building, Pencil, Trash, LayoutGrid } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

const RoomsPage = () => {
  const { rooms } = useBooking();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  
  // Состояние для новой комнаты
  const [newRoom, setNewRoom] = useState({
    id: "",
    name: "",
    building: "",
    capacity: 0,
    type: "lecture",
    features: [] as string[],
    status: "available" as "available" | "unavailable" | "maintenance"
  });

  // Фильтрация комнат по поисковому запросу
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработчик для формы добавления комнаты
  const handleAddRoom = () => {
    // Здесь будет логика отправки данных на бэкенд
    console.log("Adding new room:", newRoom);
    setIsAddRoomOpen(false);
    // Сбросить форму
    setNewRoom({
      id: "",
      name: "",
      building: "",
      capacity: 0,
      type: "lecture",
      features: [],
      status: "available"
    });
  };

  // Обработчик для выбора функций комнаты
  const toggleFeature = (feature: string) => {
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
  };

  return (
    <PageLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Управление аудиториями</h1>
            <p className="text-muted-foreground">
              Добавляйте, редактируйте и управляйте аудиториями университета
            </p>
          </div>
          
          <Button onClick={() => setIsAddRoomOpen(true)} className="self-start md:self-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Добавить аудиторию
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-72">
            <Card>
              <CardHeader>
                <CardTitle>Фильтры</CardTitle>
                <CardDescription>Отфильтруйте список аудиторий</CardDescription>
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
                  <Select defaultValue="all">
                    <SelectTrigger id="building-filter">
                      <SelectValue placeholder="Выберите корпус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все корпуса</SelectItem>
                      <SelectItem value="main">Главный корпус</SelectItem>
                      <SelectItem value="tech">Технический корпус</SelectItem>
                      <SelectItem value="admin">Административный корпус</SelectItem>
                      <SelectItem value="science">Научный корпус</SelectItem>
                      <SelectItem value="sport">Спортивный комплекс</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type-filter">Тип аудитории</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="lecture">Лекционная</SelectItem>
                      <SelectItem value="computer_lab">Компьютерная</SelectItem>
                      <SelectItem value="lab">Лаборатория</SelectItem>
                      <SelectItem value="conference">Конференц-зал</SelectItem>
                      <SelectItem value="sports">Спортивный зал</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Статус</Label>
                  <Select defaultValue="all">
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
                <CardTitle>Список аудиторий</CardTitle>
                <CardDescription>
                  Всего аудиторий: {filteredRooms.length}
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
                                <TableCell>{room.capacity}</TableCell>
                                <TableCell>
                                  {room.type === "lecture" && "Лекционная"}
                                  {room.type === "computer_lab" && "Компьютерная"}
                                  {room.type === "lab" && "Лаборатория"}
                                  {room.type === "conference" && "Конференц-зал"}
                                  {room.type === "sports" && "Спортивный зал"}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    className={
                                      room.status === "available" ? "bg-green-100 text-green-800" :
                                      room.status === "unavailable" ? "bg-red-100 text-red-800" :
                                      "bg-amber-100 text-amber-800"
                                    }
                                  >
                                    {room.status === "available" && "Доступна"}
                                    {room.status === "unavailable" && "Недоступна"}
                                    {room.status === "maintenance" && "Обслуживание"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="icon" onClick={() => setActiveRoom(room.id)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="text-red-500">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center">
                                Аудитории не найдены
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
                                  <p className="text-sm text-muted-foreground">{room.building}</p>
                                </div>
                                <Badge 
                                  className={
                                    room.status === "available" ? "bg-green-100 text-green-800" :
                                    room.status === "unavailable" ? "bg-red-100 text-red-800" :
                                    "bg-amber-100 text-amber-800"
                                  }
                                >
                                  {room.status === "available" && "Доступна"}
                                  {room.status === "unavailable" && "Недоступна"}
                                  {room.status === "maintenance" && "Обслуживание"}
                                </Badge>
                              </div>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm">ID: <span className="font-medium">{room.id}</span></p>
                                <p className="text-sm">Вместимость: <span className="font-medium">{room.capacity}</span></p>
                                <p className="text-sm">Тип: <span className="font-medium">
                                  {room.type === "lecture" && "Лекционная"}
                                  {room.type === "computer_lab" && "Компьютерная"}
                                  {room.type === "lab" && "Лаборатория"}
                                  {room.type === "conference" && "Конференц-зал"}
                                  {room.type === "sports" && "Спортивный зал"}
                                </span></p>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-1">
                                {room.features.map((feature, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature === "projector" && "Проектор"}
                                    {feature === "computer" && "Компьютер"}
                                    {feature === "whiteboard" && "Доска"}
                                    {feature === "air_conditioning" && "Кондиционер"}
                                    {feature === "audio_system" && "Аудиосистема"}
                                    {feature === "video_conferencing" && "Видеоконференции"}
                                    {feature === "specialized_equipment" && "Спец. оборудование"}
                                    {feature === "ventilation" && "Вентиляция"}
                                    {feature === "safety_equipment" && "Безопасность"}
                                    {feature === "computers" && "Компьютеры"}
                                    {feature === "basketball_court" && "Баскетбол"}
                                    {feature === "volleyball_court" && "Волейбол"}
                                    {feature === "changing_rooms" && "Раздевалки"}
                                  </Badge>
                                ))}
                              </div>
                              <div className="mt-4 flex justify-end space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setActiveRoom(room.id)}>
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Изменить
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          Аудитории не найдены
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

      {/* Диалог добавления новой аудитории */}
      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Добавить новую аудиторию</DialogTitle>
            <DialogDescription>
              Заполните информацию о новой аудитории. Все поля обязательны для заполнения.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-id">ID аудитории</Label>
                <Input 
                  id="room-id" 
                  placeholder="Например: A101" 
                  value={newRoom.id}
                  onChange={(e) => setNewRoom({...newRoom, id: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-name">Название</Label>
                <Input 
                  id="room-name" 
                  placeholder="Название аудитории" 
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-building">Корпус</Label>
                <Select 
                  value={newRoom.building}
                  onValueChange={(value) => setNewRoom({...newRoom, building: value})}
                >
                  <SelectTrigger id="room-building">
                    <SelectValue placeholder="Выберите корпус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Главный корпус">Главный корпус</SelectItem>
                    <SelectItem value="Технический корпус">Технический корпус</SelectItem>
                    <SelectItem value="Административный корпус">Административный корпус</SelectItem>
                    <SelectItem value="Научный корпус">Научный корпус</SelectItem>
                    <SelectItem value="Спортивный комплекс">Спортивный комплекс</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Вместимость</Label>
                <Input 
                  id="room-capacity" 
                  type="number" 
                  min="1" 
                  placeholder="Количество мест" 
                  value={newRoom.capacity || ''}
                  onChange={(e) => setNewRoom({...newRoom, capacity: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="room-type">Тип аудитории</Label>
              <Select 
                value={newRoom.type}
                onValueChange={(value: any) => setNewRoom({...newRoom, type: value})}
              >
                <SelectTrigger id="room-type">
                  <SelectValue placeholder="Выберите тип аудитории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Лекционная</SelectItem>
                  <SelectItem value="computer_lab">Компьютерная</SelectItem>
                  <SelectItem value="lab">Лаборатория</SelectItem>
                  <SelectItem value="conference">Конференц-зал</SelectItem>
                  <SelectItem value="sports">Спортивный зал</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Функции и оборудование</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="projector" 
                    checked={newRoom.features.includes("projector")}
                    onCheckedChange={() => toggleFeature("projector")}
                  />
                  <Label htmlFor="projector">Проектор</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="computer" 
                    checked={newRoom.features.includes("computer")}
                    onCheckedChange={() => toggleFeature("computer")}
                  />
                  <Label htmlFor="computer">Компьютер</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="whiteboard" 
                    checked={newRoom.features.includes("whiteboard")}
                    onCheckedChange={() => toggleFeature("whiteboard")}
                  />
                  <Label htmlFor="whiteboard">Доска</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="air_conditioning" 
                    checked={newRoom.features.includes("air_conditioning")}
                    onCheckedChange={() => toggleFeature("air_conditioning")}
                  />
                  <Label htmlFor="air_conditioning">Кондиционер</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="audio_system" 
                    checked={newRoom.features.includes("audio_system")}
                    onCheckedChange={() => toggleFeature("audio_system")}
                  />
                  <Label htmlFor="audio_system">Аудиосистема</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="video_conferencing" 
                    checked={newRoom.features.includes("video_conferencing")}
                    onCheckedChange={() => toggleFeature("video_conferencing")}
                  />
                  <Label htmlFor="video_conferencing">Видеоконференции</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="room-status">Статус</Label>
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
            <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddRoom}>
              Добавить аудиторию
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог для редактирования аудитории */}
      <Dialog open={!!activeRoom} onOpenChange={(open) => !open && setActiveRoom(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать аудиторию</DialogTitle>
            <DialogDescription>
              Измените информацию о выбранной аудитории.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center text-muted-foreground">
            Здесь будет форма редактирования аудитории.
            <p className="mt-2">ID аудитории: {activeRoom}</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveRoom(null)}>
              Отмена
            </Button>
            <Button>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default RoomsPage;
