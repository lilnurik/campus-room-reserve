
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Clock, PieChart, User } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [activeBookings, setActiveBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data loading
        const loadData = async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock data
            setActiveBookings([
                { id: 1, room: "A101", date: "2025-04-17", start: "10:00", end: "12:00", purpose: "Meeting" },
                { id: 2, room: "B202", date: "2025-04-18", start: "14:00", end: "16:00", purpose: "Workshop" },
            ]);

            setLoading(false);
        };

        loadData();
    }, []);

    return (
        <PageLayout role="employee">
            <div className="flex flex-col gap-6">
                {/* Welcome Section */}
                <section className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.welcomeMessage')}, {user?.name || 'Сотрудник'}!</h1>
                    <p className="text-muted-foreground">
                        {user?.department ? `Отдел: ${user.department}` : t('dashboard.dashboardDescription')}
                    </p>
                </section>

                {/* Quick Actions */}
                <section>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <Calendar className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-medium">{t('dashboard.bookRoom')}</h3>
                                    <p className="text-sm text-muted-foreground">Бронирование аудиторий и помещений</p>
                                    <Button className="w-full mt-2" variant="default" size="sm" asChild>
                                        <a href="/employee/booking">{t('common.book')}</a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <Clock className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-medium">{t('dashboard.viewHistory')}</h3>
                                    <p className="text-sm text-muted-foreground">Просмотр истории бронирований</p>
                                    <Button className="w-full mt-2" variant="outline" size="sm" asChild>
                                        <a href="/employee/history">{t('dashboard.viewAll')}</a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-medium">Управление сотрудниками</h3>
                                    <p className="text-sm text-muted-foreground">Добавление и управление сотрудниками</p>
                                    <Button className="w-full mt-2" variant="outline" size="sm" asChild>
                                        <a href="/employee/manage">Управление</a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-medium">{t('common.profile')}</h3>
                                    <p className="text-sm text-muted-foreground">Управление профилем и настройками</p>
                                    <Button className="w-full mt-2" variant="outline" size="sm" asChild>
                                        <a href="/employee/profile">{t('common.edit')}</a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Dashboard Content */}
                <section className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t('dashboard.currentBookings')}</CardTitle>
                            <CardDescription>
                                Ваши активные бронирования на ближайшее время
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    {t('common.loading')}...
                                </div>
                            ) : activeBookings.length > 0 ? (
                                <div className="space-y-4">
                                    {activeBookings.map((booking: any) => (
                                        <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h4 className="font-semibold">Аудитория {booking.room}</h4>
                                                    <div className="text-sm text-muted-foreground">
                                                        {booking.date}, {booking.start} - {booking.end}
                                                    </div>
                                                    <div className="text-sm mt-1">{booking.purpose}</div>
                                                </div>
                                                <Button variant="outline" size="sm">Подробнее</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    У вас нет активных бронирований
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Статистика отдела</CardTitle>
                            <CardDescription>
                                Использование помещений вашим отделом
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                            <div className="flex flex-col items-center text-center">
                                <PieChart className="h-20 w-20 text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Статистика будет доступна когда появятся первые бронирования
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </PageLayout>
    );
};

export default EmployeeDashboard;