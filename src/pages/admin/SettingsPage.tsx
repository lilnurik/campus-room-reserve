
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Bell, Shield, Database, Mail, Settings as SettingsIcon, Save } from "lucide-react";

const SettingsPage = () => {
  return (
    <PageLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки системы</h1>
          <p className="text-muted-foreground">
            Управление глобальными настройками системы бронирования
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="booking">Бронирование</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
            <TabsTrigger value="maintenance">Обслуживание</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Общие настройки</CardTitle>
                <CardDescription>
                  Настройки, влияющие на всю систему в целом
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="system-name">Название системы</Label>
                    <Input id="system-name" defaultValue="UniBooker" />
                    <p className="text-sm text-muted-foreground">Отображается в заголовке и на странице входа</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email администратора</Label>
                    <Input id="admin-email" defaultValue="admin@university.edu" type="email" />
                    <p className="text-sm text-muted-foreground">Используется для системных уведомлений и обратной связи</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Приветственное сообщение</Label>
                    <Textarea id="welcome-message" defaultValue="Добро пожаловать в систему бронирования аудиторий университета!" />
                    <p className="text-sm text-muted-foreground">Отображается на главной странице</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance-mode">Режим технического обслуживания</Label>
                      <p className="text-sm text-muted-foreground">Закрывает доступ к системе для всех, кроме администраторов</p>
                    </div>
                    <Switch id="maintenance-mode" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить настройки
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="booking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Настройки бронирования</CardTitle>
                <CardDescription>
                  Управление правилами и ограничениями для бронирований
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-booking-time">Минимальное время бронирования (мин)</Label>
                      <Input id="min-booking-time" defaultValue="30" type="number" min="15" step="15" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-booking-time">Максимальное время бронирования (мин)</Label>
                      <Input id="max-booking-time" defaultValue="180" type="number" min="30" step="15" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-advance-days">Максимальное количество дней для предварительного бронирования</Label>
                      <Input id="max-advance-days" defaultValue="14" type="number" min="1" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buffer-time">Буферное время между бронированиями (мин)</Label>
                      <Input id="buffer-time" defaultValue="15" type="number" min="0" step="5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="require-approval">Требовать подтверждение администратора</Label>
                      <p className="text-sm text-muted-foreground">Все бронирования должны быть одобрены администратором</p>
                    </div>
                    <Switch id="require-approval" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow-recurring">Разрешить повторяющиеся бронирования</Label>
                      <p className="text-sm text-muted-foreground">Позволяет пользователям создавать бронирования на несколько дней</p>
                    </div>
                    <Switch id="allow-recurring" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow-cancel">Разрешить отмену бронирований</Label>
                      <p className="text-sm text-muted-foreground">Пользователи могут отменять свои бронирования</p>
                    </div>
                    <Switch id="allow-cancel" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить настройки
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
                <CardDescription>
                  Управление системой уведомлений для пользователей
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email уведомления</Label>
                      <p className="text-sm text-muted-foreground">Отправлять уведомления на email пользователям</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reminder-notifications">Напоминания</Label>
                      <p className="text-sm text-muted-foreground">Отправлять напоминания о предстоящих бронированиях</p>
                    </div>
                    <Switch id="reminder-notifications" defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Время напоминания (мин до начала)</Label>
                    <Input id="reminder-time" defaultValue="30" type="number" min="5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="admin-notifications">Уведомления администраторам</Label>
                      <p className="text-sm text-muted-foreground">Отправлять уведомления администраторам о новых бронированиях</p>
                    </div>
                    <Switch id="admin-notifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="guard-notifications">Уведомления охранникам</Label>
                      <p className="text-sm text-muted-foreground">Отправлять уведомления охранникам о предстоящих бронированиях</p>
                    </div>
                    <Switch id="guard-notifications" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить настройки
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Настройки безопасности</CardTitle>
                <CardDescription>
                  Управление безопасностью системы и доступом пользователей
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor-auth">Двухфакторная аутентификация</Label>
                      <p className="text-sm text-muted-foreground">Требовать двухфакторную аутентификацию для входа в систему</p>
                    </div>
                    <Switch id="two-factor-auth" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="strong-passwords">Строгие требования к паролям</Label>
                      <p className="text-sm text-muted-foreground">Требовать сложные пароли (минимум 8 символов, буквы, цифры, спецсимволы)</p>
                    </div>
                    <Switch id="strong-passwords" defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Таймаут сессии (мин)</Label>
                    <Input id="session-timeout" defaultValue="30" type="number" min="5" />
                    <p className="text-sm text-muted-foreground">Время бездействия, после которого сессия завершается</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ip-restriction">Ограничение по IP</Label>
                      <p className="text-sm text-muted-foreground">Разрешить доступ только с IP-адресов университета</p>
                    </div>
                    <Switch id="ip-restriction" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowed-ips">Разрешенные IP-адреса</Label>
                    <Textarea id="allowed-ips" placeholder="192.168.1.0/24, 10.0.0.0/8" />
                    <p className="text-sm text-muted-foreground">Список разрешенных IP-адресов или диапазонов (если включено ограничение по IP)</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить настройки
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Обслуживание системы</CardTitle>
                <CardDescription>
                  Инструменты для обслуживания и мониторинга системы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Резервное копирование</h3>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Последнее резервное копирование: 15.05.2024 03:00</p>
                        <p className="text-sm text-muted-foreground">Следующее резервное копирование: 16.05.2024 03:00</p>
                      </div>
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Создать резервную копию
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Журналы системы</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Журнал входов в систему</p>
                        <Button variant="outline" size="sm">Скачать</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Журнал бронирований</p>
                        <Button variant="outline" size="sm">Скачать</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Журнал ошибок</p>
                        <Button variant="outline" size="sm">Скачать</Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Состояние системы</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Онлайн</Badge>
                        <p className="text-sm">Веб-сервер</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Онлайн</Badge>
                        <p className="text-sm">База данных</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Онлайн</Badge>
                        <p className="text-sm">Сервис уведомлений</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-red-600">Опасная зона</h3>
                      <p className="text-sm text-muted-foreground">Эти действия могут привести к потере данных или нарушению работы системы</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          Очистить все бронирования
                        </Button>
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          Сбросить настройки
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

export default SettingsPage;
