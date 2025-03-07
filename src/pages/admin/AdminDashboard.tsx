import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  UserCheck, 
  Users, 
  ChevronUp, 
  Building, 
  Calendar, 
  MessageCircleWarning,
  Clock,
  BarChart3
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState("overview");

  return (
    <PageLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Административная панель</h1>
          <p className="text-muted-foreground">
            Управление бронированиями, пользователями и помещениями
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Активные брони</p>
                  <p className="text-3xl font-bold">24</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-green-600">
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>12% больше</span>
                <span className="text-muted-foreground ml-1">чем на прошлой неделе</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Активные пользователи</p>
                  <p className="text-3xl font-bold">142</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-green-600">
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>8% больше</span>
                <span className="text-muted-foreground ml-1">чем в прошлом месяце</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Доступные комнаты</p>
                  <p className="text-3xl font-bold">18</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs">
                <span className="text-muted-foreground">из 25 комнат</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Нарушения</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <MessageCircleWarning className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-red-600">
                <span>Требуется внимание</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="bookings">Бронирования</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="rooms">Помещения</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Последние бронирования
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Комната</TableHead>
                        <TableHead>Студент</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { room: "A101", student: "Иван Иванов", date: "2025-03-07", status: "confirmed" },
                        { room: "B203", student: "Анна Смирнова", date: "2025-03-07", status: "pending" },
                        { room: "A105", student: "Дмитрий Петров", date: "2025-03-08", status: "confirmed" },
                        { room: "C305", student: "Елена Козлова", date: "2025-03-08", status: "overdue" },
                      ].map((booking, i) => (
                        <TableRow key={i}>
                          <TableCell>{booking.room}</TableCell>
                          <TableCell>{booking.student}</TableCell>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell>
                            <StatusBadge status={booking.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" size="sm">Показать все</Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Key Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Статус ключей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ключ</TableHead>
                        <TableHead>Взят</TableHead>
                        <TableHead>Студент</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { key: "A101", time: "10:00", student: "Иван Иванов", status: "active" },
                        { key: "B203", time: "11:30", student: "Анна Смирнова", status: "active" },
                        { key: "C305", time: "09:15", student: "Петр Сидоров", status: "overdue" },
                      ].map((key, i) => (
                        <TableRow key={i}>
                          <TableCell>{key.key}</TableCell>
                          <TableCell>{key.time}</TableCell>
                          <TableCell>{key.student}</TableCell>
                          <TableCell>
                            <StatusBadge status={key.status === "active" ? "confirmed" : "overdue"} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" size="sm">Показать все</Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* New Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Новые пользователи
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Екатерина Новикова", date: "2025-03-06", role: "student" },
                      { name: "Михаил Соколов", date: "2025-03-05", role: "student" },
                      { name: "Ольга Морозова", date: "2025-03-05", role: "guard" },
                    ].map((user, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(user.date)}</p>
                          </div>
                        </div>
                        <span className="text-xs rounded-full px-2 py-1 bg-secondary">
                          {user.role === "student" ? "Студент" : "Охранник"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Violations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircleWarning className="h-5 w-5 text-red-600" />
                    Нарушения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { 
                        name: "Петр Сидоров", 
                        room: "C305", 
                        date: "2025-03-06", 
                        issue: "Просроченный ключ (120 минут)" 
                      },
                      { 
                        name: "Елена Козлова", 
                        room: "A105", 
                        date: "2025-03-05", 
                        issue: "Повреждение имущества" 
                      },
                      { 
                        name: "Андрей Волков", 
                        room: "B201", 
                        date: "2025-03-04", 
                        issue: "Несоблюдение правил" 
                      },
                    ].map((violation, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div>
                          <p className="font-medium">{violation.name} - {violation.room}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(violation.date)}</p>
                          <p className="text-sm text-red-600 mt-1">{violation.issue}</p>
                        </div>
                        <Button size="sm" variant="outline">Рассмотреть</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Управление бронированиями</CardTitle>
                <CardDescription>
                  Просмотр и управление всеми бронированиями в системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Комната</TableHead>
                        <TableHead>Студент</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Время</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: 101, room: "A101", student: "Иван Иванов", date: "2025-03-07", time: "10:00-12:00", status: "confirmed" },
                        { id: 102, room: "B203", student: "Анна Смирнова", date: "2025-03-07", time: "14:00-16:00", status: "pending" },
                        { id: 103, room: "A105", student: "Дмитрий Петров", date: "2025-03-08", time: "09:00-11:00", status: "confirmed" },
                        { id: 104, room: "C305", student: "Елена Козлова", date: "2025-03-08", time: "16:00-18:00", status: "overdue" },
                        { id: 105, room: "B201", student: "Андрей Волков", date: "2025-03-09", time: "12:00-14:00", status: "pending" },
                      ].map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.id}</TableCell>
                          <TableCell>{booking.room}</TableCell>
                          <TableCell>{booking.student}</TableCell>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell>{booking.time}</TableCell>
                          <TableCell>
                            <StatusBadge status={booking.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {booking.status === "pending" && (
                                <Button size="sm" variant="outline">Подтвердить</Button>
                              )}
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                Отменить
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>
                  Просмотр и управление пользователями системы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: 1, name: "Иван Иванов", email: "ivan@example.com", role: "student", status: "active" },
                        { id: 2, name: "Анна Смирнова", email: "anna@example.com", role: "student", status: "active" },
                        { id: 3, name: "Петр Сидоров", email: "petr@example.com", role: "student", status: "blocked" },
                        { id: 201, name: "Сергей Петров", email: "sergey@example.com", role: "guard", status: "active" },
                        { id: 301, name: "Елена Волкова", email: "elena@example.com", role: "admin", status: "active" },
                      ].map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.role === "student" ? "Студент" : user.role === "guard" ? "Охранник" : "Администратор"}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {user.status === "active" ? "Активен" : "Заблокирован"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Редактировать</Button>
                              {user.status === "active" ? (
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  Блокировать
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                                  Разблокировать
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle>Управление помещениями</CardTitle>
                <CardDescription>
                  Просмотр и управление помещениями университета
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Комната</TableHead>
                        <TableHead>Здание</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Вместимость</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { room: "A101", building: "Главный корпус", type: "Учебная", capacity: 30, status: "available" },
                        { room: "A105", building: "Главный корпус", type: "Учебная", capacity: 25, status: "available" },
                        { room: "B201", building: "Библиотека", type: "Читальный зал", capacity: 40, status: "maintenance" },
                        { room: "B203", building: "Библиотека", type: "Конференц-зал", capacity: 15, status: "available" },
                        { room: "C305", building: "Лабораторный корпус", type: "Лаборатория", capacity: 20, status: "available" },
                      ].map((room, i) => (
                        <TableRow key={i}>
                          <TableCell>{room.room}</TableCell>
                          <TableCell>{room.building}</TableCell>
                          <TableCell>{room.type}</TableCell>
                          <TableCell>{room.capacity}</TableCell>
                          <TableCell>
                            <StatusBadge status={room.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Расписание</Button>
                              {room.status === "available" ? (
                                <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700">
                                  На обслуживание
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                                  Включить
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Аналитика использования</CardTitle>
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  Статистика использования системы бронирования
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-64 bg-muted/20 rounded-md">
                  <p className="text-center text-muted-foreground">
                    Здесь будет отображаться графическая аналитика <br/>
                    Требуется добавление компонента графиков
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: "Всего бронирований", value: "186", change: "+12%" },
                    { label: "Активные пользователи", value: "142", change: "+8%" },
                    { label: "Загруженность комнат", value: "72%", change: "+5%" },
                    { label: "Среднее время брони", value: "1.4ч", change: "-3%" },
                  ].map((stat, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <span className={`text-xs ${
                            stat.change.startsWith("+") ? "text-green-600" : "text-red-600"
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;

