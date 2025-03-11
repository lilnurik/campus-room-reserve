
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Navigation, User } from "lucide-react";

const HistoryPage = () => {
  return (
    <PageLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">История бронирований</h1>
          <p className="text-muted-foreground">
            Просмотр всех ваших прошлых и активных бронирований
          </p>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
            <TabsTrigger value="past">Прошедшие</TabsTrigger>
            <TabsTrigger value="cancelled">Отмененные</TabsTrigger>
          </TabsList>

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
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 205</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>15.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>14:30 - 16:00 (Осталось 45 минут)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Navigation className="h-4 w-4" />
                          <span>Корпус 3, 2 этаж</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>5 участников</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:text-right">
                        <span className="text-sm font-medium">Код доступа</span>
                        <span className="font-mono text-lg font-bold">2580</span>
                        <span className="text-xs text-muted-foreground">Покажите этот код охраннику</span>
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
                  Бронирования, которые еще не начались
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 101</h3>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Подтверждено</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>17.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>10:00 - 12:00</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Navigation className="h-4 w-4" />
                          <span>Корпус 1, 1 этаж</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>15 участников</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:text-right">
                        <span className="text-sm font-medium">До начала</span>
                        <span className="font-medium">1 день 20 часов</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Прошедшие бронирования</CardTitle>
                <CardDescription>
                  История ваших завершенных бронирований
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 opacity-75">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 310</h3>
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Завершено</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>10.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>13:00 - 14:30</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Navigation className="h-4 w-4" />
                          <span>Корпус 3, 3 этаж</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 opacity-75">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 205</h3>
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Завершено</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>5.05.2024</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>15:00 - 17:00</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Navigation className="h-4 w-4" />
                          <span>Корпус 3, 2 этаж</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">У вас нет отмененных бронирований</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default HistoryPage;
