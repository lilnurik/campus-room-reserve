
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";

// Profile data schema
const profileFormSchema = z.object({
    name: z.string().min(2, "ФИО должно содержать минимум 2 символа"),
    email: z.string().email("Введите корректный email"),
    phone: z.string().optional(),
});

// Password change schema
const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string().min(6, "Подтверждение пароля должно содержать минимум 6 символов"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Profile form
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            phone: "",
        },
    });

    // Password form
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Handle profile update
    const onProfileSubmit = async (data: ProfileFormValues) => {
        setLoading(true);

        try {
            // In a real app, this would call an API
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success("Профиль успешно обновлен");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Ошибка обновления профиля");
        } finally {
            setLoading(false);
        }
    };

    // Handle password update
    const onPasswordSubmit = async (data: PasswordFormValues) => {
        setLoading(true);

        try {
            // In a real app, this would call an API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reset form and close dialog
            passwordForm.reset();
            setIsPasswordDialogOpen(false);

            toast.success("Пароль успешно изменен");
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Ошибка изменения пароля");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout role="employee">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('profile.title')}</h1>
                    <p className="text-muted-foreground">
                        {t('profile.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Account Summary */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>{t('profile.account')}</CardTitle>
                            <CardDescription>
                                {t('profile.accountDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                                        {user?.name ? user.name.substring(0, 2).toUpperCase() : "UN"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium text-lg">{user?.name || "Сотрудник"}</h3>
                                    <p className="text-sm text-muted-foreground">{user?.email || "employee@example.com"}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Информация об аккаунте</h4>
                                <Separator />
                                <div className="grid grid-cols-2 gap-y-2 text-sm pt-2">
                                    <div className="text-muted-foreground">Роль</div>
                                    <div>Сотрудник</div>

                                    <div className="text-muted-foreground">ID сотрудника</div>
                                    <div>{user?.employee_id || "123"}</div>

                                    <div className="text-muted-foreground">Отдел</div>
                                    <div>{user?.department || "IT"}</div>

                                    <div className="text-muted-foreground">Руководитель</div>
                                    <div>{user?.manager_name || "Андрей Смирнов"}</div>

                                    <div className="text-muted-foreground">Дата регистрации</div>
                                    <div>01.04.2025</div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        {t('profile.changePassword')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>{t('profile.changePassword')}</DialogTitle>
                                        <DialogDescription>
                                            {t('profile.changePasswordDescription')}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...passwordForm}>
                                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                            <FormField
                                                control={passwordForm.control}
                                                name="currentPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('profile.currentPassword')}</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={passwordForm.control}
                                                name="newPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('profile.newPassword')}</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={passwordForm.control}
                                                name="confirmPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('profile.confirmPassword')}</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="submit" disabled={loading}>
                                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    {t('common.save')}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>

                            <Button variant="destructive" onClick={logout} className="w-full">
                                {t('common.logout')}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Right column - Profile Edit */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t('profile.userInformation')}</CardTitle>
                            <CardDescription>
                                {t('profile.userInformationDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ФИО</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Иванов Иван Иванович" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Ваше полное имя
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={profileForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="example@example.com" type="email" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Электронная почта для уведомлений
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={profileForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Телефон</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+7 (XXX) XXX-XX-XX" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Телефон для связи (необязательно)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="pt-4">
                                        <Button type="submit" disabled={loading}>
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {t('common.saveChanges')}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
};

export default ProfilePage;