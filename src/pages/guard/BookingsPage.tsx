
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Clock, DoorOpen, Search, User } from "lucide-react";

const BookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageLayout role="guard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Текущие бронирования</h1>
          <p className="text-muted-foreground">
            Управление доступом к аудиториям на основе бронирований
          </p>
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
        </div>

        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="upcoming">Ближайшие</TabsTrigger>
            <TabsTrigger value="pending">Ожидают подтверждения</TabsTrigger>
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
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 205</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>14:30 - 16:00 (Осталось 45 минут)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Иван Иванов (Студент)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="font-mono bg-slate-100 px-2 py-0.5 rounded">Код: 2580</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Check className="h-4 w-4 mr-1" />
                          Проверено
                        </Button>
                        <Button size="sm">
                          <DoorOpen className="h-4 w-4 mr-1" />
                          Открыть дверь
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 101</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активно</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>13:00 - 15:30 (Осталось 1 час 15 минут)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Елена Смирнова (Преподаватель)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="font-mono bg-slate-100 px-2 py-0.5 rounded">Код: 7432</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Check className="h-4 w-4 mr-1" />
                          Проверено
                        </Button>
                        <Button size="sm">
                          <DoorOpen className="h-4 w-4 mr-1" />
                          Открыть дверь
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
                <CardTitle>Ближайшие бронирования</CardTitle>
                <CardDescription>
                  Бронирования, которые начнутся в течение следующих 2 часов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 310</h3>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Подтверждено</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>16:00 - 17:30 (Начало через 30 минут)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Александр Петров (Студент)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="font-mono bg-slate-100 px-2 py-0.5 rounded">Код: 1234</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <DoorOpen className="h-4 w-4 mr-1" />
                          Подготовить аудиторию
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
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Нет бронирований, ожидающих подтверждения</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default BookingsPage;
