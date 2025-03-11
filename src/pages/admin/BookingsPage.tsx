
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, User, Calendar, CheckCircle, X, Calendar as CalendarIcon } from "lucide-react";

const AdminBookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

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

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="pending">Ожидание</TabsTrigger>
            <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
            <TabsTrigger value="completed">Завершенные</TabsTrigger>
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
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 205</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>15.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>14:30 - 16:00</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Иван Иванов (Студент)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Детали
                        </Button>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Отменить
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 101</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>15.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>13:00 - 15:30</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Елена Смирнова (Преподаватель)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Детали
                        </Button>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Отменить
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 310</h3>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Подтверждено</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>17.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>16:00 - 17:30</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Александр Петров (Студент)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Детали
                        </Button>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Отменить
                        </Button>
                      </div>
                    </div>
                  </div>
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
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 205</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>15.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>14:30 - 16:00 (Осталось 45 минут)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Иван Иванов (Студент)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Детали
                        </Button>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Отменить
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 101</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>15.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>13:00 - 15:30 (Осталось 1 час 15 минут)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Елена Смирнова (Преподаватель)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Детали
                        </Button>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Отменить
                        </Button>
                      </div>
                    </div>
                  </div>
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
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 401</h3>
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Ожидание</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>18.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>11:00 - 13:00</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Мария Петрова (Студент)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Подтвердить
                        </Button>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </div>
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
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 310</h3>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Подтверждено</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>17.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>16:00 - 17:30</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Александр Петров (Студент)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Детали
                        </Button>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Отменить
                        </Button>
                      </div>
                    </div>
                  </div>
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
                  <div className="border rounded-lg p-4 opacity-75 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 310</h3>
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Завершено</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>10.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>13:00 - 14:30</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Иван Иванов (Студент)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Детали
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 opacity-75 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 205</h3>
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Завершено</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>5.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>15:00 - 17:00</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Мария Петрова (Студент)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Детали
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdminBookingsPage;
