
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit, Settings, Building, ClipboardList, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const GuardProfilePage = () => {
  const { user } = useAuth();

  return (
    <PageLayout role="guard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Профиль охранника</h1>
          <p className="text-muted-foreground">
            Управление личной информацией и настройками
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="text-4xl bg-blue-100 text-blue-700">
                    {user?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Должность</p>
                  <p className="text-sm text-muted-foreground">Охранник</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Корпус</p>
                  <p className="text-sm text-muted-foreground">Корпус #3</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Смена</p>
                  <p className="text-sm text-muted-foreground">Дневная (8:00 - 20:00)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Стаж работы</p>
                  <p className="text-sm text-muted-foreground">3 года</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Редактировать профиль
              </Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Настройки аккаунта</CardTitle>
              <CardDescription>
                Управление настройками вашего аккаунта и предпочтениями
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Уведомления</h3>
                <div className="border rounded-md divide-y">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Email уведомления</p>
                      <p className="text-sm text-muted-foreground">
                        Получать уведомления о новых бронированиях на email
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Настроить
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Оповещения</p>
                      <p className="text-sm text-muted-foreground">
                        Получать оповещения о посетителях в реальном времени
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Настроить
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Безопасность</h3>
                <div className="border rounded-md divide-y">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Сменить пароль</p>
                      <p className="text-sm text-muted-foreground">
                        Обновить ваш пароль для безопасности аккаунта
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Изменить
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Двухфакторная аутентификация</p>
                      <p className="text-sm text-muted-foreground">
                        Добавьте дополнительный уровень защиты для вашего аккаунта
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Настроить
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className="gap-2">
                <Settings className="h-4 w-4" />
                Сохранить настройки
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default GuardProfilePage;
