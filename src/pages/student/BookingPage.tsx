
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CalendarPlus } from "lucide-react";

const BookingPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <PageLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Бронирование аудитории</h1>
          <p className="text-muted-foreground">
            Выберите дату, время и аудиторию для бронирования
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Выберите дату</CardTitle>
              <CardDescription>Выберите день для бронирования</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                disabled={(date) => {
                  // Disable dates in the past
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Доступные аудитории</CardTitle>
              <CardDescription>
                {date ? (
                  `Доступные аудитории на ${date.toLocaleDateString('ru-RU')}`
                ) : (
                  "Выберите дату, чтобы увидеть доступные аудитории"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Все аудитории</TabsTrigger>
                  <TabsTrigger value="lectures">Лекционные</TabsTrigger>
                  <TabsTrigger value="labs">Лабораторные</TabsTrigger>
                  <TabsTrigger value="computer">Компьютерные</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {date ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Аудитория 101</h3>
                            <p className="text-sm text-muted-foreground">Лекционная, 120 мест</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Clock className="h-4 w-4 mr-1" />
                              Расписание
                            </Button>
                            <Button size="sm">
                              <CalendarPlus className="h-4 w-4 mr-1" />
                              Забронировать
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Аудитория 205</h3>
                            <p className="text-sm text-muted-foreground">Компьютерная, 30 мест</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Clock className="h-4 w-4 mr-1" />
                              Расписание
                            </Button>
                            <Button size="sm">
                              <CalendarPlus className="h-4 w-4 mr-1" />
                              Забронировать
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Аудитория 310</h3>
                            <p className="text-sm text-muted-foreground">Лабораторная, 25 мест</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Clock className="h-4 w-4 mr-1" />
                              Расписание
                            </Button>
                            <Button size="sm">
                              <CalendarPlus className="h-4 w-4 mr-1" />
                              Забронировать
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Пожалуйста, выберите дату для просмотра доступных аудиторий
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="lectures" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Лекционные аудитории будут отображены здесь
                  </div>
                </TabsContent>
                
                <TabsContent value="labs" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Лабораторные аудитории будут отображены здесь
                  </div>
                </TabsContent>
                
                <TabsContent value="computer" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Компьютерные аудитории будут отображены здесь
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default BookingPage;
