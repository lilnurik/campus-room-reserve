
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, UserCog, UserMinus, Mail } from "lucide-react";

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Управление пользователями</h1>
            <p className="text-muted-foreground">
              Просмотр и управление аккаунтами пользователей системы
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить пользователя
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск пользователей по имени или email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="students">
          <TabsList className="mb-6">
            <TabsTrigger value="students">Студенты</TabsTrigger>
            <TabsTrigger value="guards">Охранники</TabsTrigger>
            <TabsTrigger value="admins">Администраторы</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Студенты</CardTitle>
                <CardDescription>
                  Список всех студентов в системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Иван Иванов</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активен</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>ivan@example.com</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Факультет: Информатики и вычислительной техники</p>
                          <p>Группа: ИВТ-301</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <UserCog className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button variant="destructive" size="sm">
                          <UserMinus className="h-4 w-4 mr-1" />
                          Деактивировать
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Мария Петрова</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активен</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>maria@example.com</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Факультет: Экономики и менеджмента</p>
                          <p>Группа: ЭК-202</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <UserCog className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button variant="destructive" size="sm">
                          <UserMinus className="h-4 w-4 mr-1" />
                          Деактивировать
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Александр Смирнов</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активен</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>alex@example.com</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Факультет: Информатики и вычислительной техники</p>
                          <p>Группа: ИВТ-405</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <UserCog className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button variant="destructive" size="sm">
                          <UserMinus className="h-4 w-4 mr-1" />
                          Деактивировать
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Охранники</CardTitle>
                <CardDescription>
                  Список всех охранников в системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Сергей Петров</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активен</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>sergey@example.com</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Корпус: #3</p>
                          <p>Смена: Дневная (8:00 - 20:00)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <UserCog className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button variant="destructive" size="sm">
                          <UserMinus className="h-4 w-4 mr-1" />
                          Деактивировать
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Анатолий Кузнецов</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активен</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>anatoliy@example.com</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Корпус: #1</p>
                          <p>Смена: Ночная (20:00 - 8:00)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <UserCog className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button variant="destructive" size="sm">
                          <UserMinus className="h-4 w-4 mr-1" />
                          Деактивировать
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Администраторы</CardTitle>
                <CardDescription>
                  Список всех администраторов в системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Елена Волкова</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активен</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>elena@example.com</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Должность: Главный администратор</p>
                          <p>Отдел: IT-поддержка</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <UserCog className="h-4 w-4 mr-1" />
                          Редактировать
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

export default UsersPage;
