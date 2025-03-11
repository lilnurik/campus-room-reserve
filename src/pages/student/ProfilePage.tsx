
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit, Settings, BookOpen, CalendarClock, BookMarked } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <PageLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Профиль студента</h1>
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
                  <AvatarFallback className="text-4xl">
                    {user?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Факультет</p>
                  <p className="text-sm text-muted-foreground">Информатики и вычислительной техники</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Группа</p>
                  <p className="text-sm text-muted-foreground">ИВТ-301</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Курс</p>
                  <p className="text-sm text-muted-foreground">3 курс, 2023-2024 уч.г.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <BookMarked className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Статус</p>
                  <p className="text-sm text-muted-foreground">Активный студент</p>
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
                        Получать уведомления о бронированиях на email
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Настроить
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Напоминания</p>
                      <p className="text-sm text-muted-foreground">
                        Получать напоминания о предстоящих бронированиях
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

export default ProfilePage;
