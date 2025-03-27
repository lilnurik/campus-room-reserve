import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, BookOpen, CalendarClock, BookMarked, Mail, Key, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/context/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, UserProfileData } from "@/services/api"; // Import from your API file

const ProfilePage = () => {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Fetch the user profile data when the component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authApi.getCurrentUserProfile();

        if (response.success && response.data) {
          console.log("Profile data received:", response.data);
          setProfileData(response.data);

          // Store essential data in localStorage as a fallback
          localStorage.setItem('userName', response.data.fullName);
          localStorage.setItem('userEmail', response.data.email);
          localStorage.setItem('studentId', response.data.studentId);
        } else {
          console.error("Failed to load profile:", response.error);
          toast.error(t('profile.fetchError') || 'Не удалось загрузить данные профиля');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(t('profile.fetchError') || 'Не удалось загрузить данные профиля');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fallback to stored data if API request fails
  const userData = profileData || {
    studentId: user?.studentId || localStorage.getItem('studentId') || "lilnurik",
    fullName: user?.name || localStorage.getItem('userName') || "lilnurik",
    username: "lilnurik", // Using the login you provided
    email: user?.email || localStorage.getItem('userEmail') || "lilnurik@example.com",
    faculty: user?.faculty || localStorage.getItem('faculty') || "Информатики и вычислительной техники",
    group: user?.group || localStorage.getItem('group') || "ИВТ-301",
    course: user?.course || localStorage.getItem('course') || "3",
    academicYear: user?.year || localStorage.getItem('year') || "2024-2025",
    status: user?.status || localStorage.getItem('status') || "Активный студент",
    role: "student",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2025-03-27T11:41:17Z" // Using the exact time you provided
  };

  const handlePasswordDialogOpen = () => {
    setPasswordDialogOpen(true);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handlePasswordChange = async () => {
    if (!oldPassword) {
      setPasswordError(t('profile.oldPasswordRequired') || 'Введите текущий пароль');
      return;
    }

    if (!newPassword) {
      setPasswordError(t('profile.newPasswordRequired') || 'Введите новый пароль');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.passwordsDoNotMatch') || 'Пароли не совпадают');
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await authApi.changePassword(oldPassword, newPassword);

      if (response.success) {
        toast.success(t('profile.passwordChanged') || 'Пароль успешно изменен');
        setPasswordDialogOpen(false);
      } else {
        setPasswordError(response.error || t('profile.passwordChangeError') || 'Не удалось изменить пароль');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(t('profile.passwordChangeError') || 'Не удалось изменить пароль');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Format the last login time
  const formatLastLogin = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
      <PageLayout role="student">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('profile.title') || 'Профиль студента'}</h1>
            <p className="text-muted-foreground">
              {t('profile.subtitle') || 'Ваша личная информация'}
            </p>
          </div>

          {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">{t('common.loading') || 'Загрузка...'}</span>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="" alt="Profile" />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                          {userData.fullName?.charAt(0).toUpperCase() || 'S'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle>{userData.fullName}</CardTitle>
                    <CardDescription>{userData.email}</CardDescription>
                    <CardDescription className="mt-1">ID: {userData.studentId}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('profile.faculty') || 'Факультет'}</p>
                        <p className="text-sm text-muted-foreground">{userData.faculty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('profile.group') || 'Группа'}</p>
                        <p className="text-sm text-muted-foreground">{userData.group}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <CalendarClock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('profile.course') || 'Курс'}</p>
                        <p className="text-sm text-muted-foreground">{userData.course} курс, {userData.academicYear} уч.г.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <BookMarked className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('profile.status') || 'Статус'}</p>
                        <p className="text-sm text-muted-foreground">{userData.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                      <CalendarClock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('profile.lastLogin') || 'Последний вход'}</p>
                        <p className="text-sm text-muted-foreground">{formatLastLogin(userData.lastLogin)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>{t('profile.accountSettings') || 'Настройки аккаунта'}</CardTitle>
                    <CardDescription>
                      {t('profile.accountSettingsDesc') || 'Управление настройками вашего аккаунта'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">{t('profile.emailPreferences') || 'Контактная информация'}</h3>
                      <div className="border rounded-md divide-y">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{t('profile.email') || 'Email'}</p>
                              <p className="text-sm text-muted-foreground">{userData.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-medium">{t('profile.security') || 'Безопасность'}</h3>
                      <div className="border rounded-md">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Key className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{t('profile.changePassword') || 'Сменить пароль'}</p>
                              <p className="text-sm text-muted-foreground">
                                {t('profile.changePasswordDesc') || 'Обновить ваш пароль для безопасности аккаунта'}
                              </p>
                            </div>
                          </div>
                          <Button
                              variant="outline"
                              size="sm"
                              disabled={isChangingPassword}
                              onClick={handlePasswordDialogOpen}
                          >
                            {t('profile.change') || 'Изменить'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground mt-4 bg-muted p-3 rounded-md">
                      <p>{t('profile.dataInfo') || 'Информация о вашей учетной записи получена из системы регистрации студентов. Если данные неверны, обратитесь в деканат вашего факультета.'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
          )}
        </div>

        {/* Password Change Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('profile.changePassword') || 'Изменить пароль'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {passwordError && (
                  <div className="bg-destructive/10 p-3 rounded-md text-sm text-destructive">
                    {passwordError}
                  </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="old-password">{t('profile.oldPassword') || 'Текущий пароль'}</Label>
                <Input
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('profile.newPassword') || 'Новый пароль'}</Label>
                <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('profile.confirmPassword') || 'Подтвердите пароль'}</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => setPasswordDialogOpen(false)}
                  disabled={isChangingPassword}
              >
                {t('common.cancel') || 'Отмена'}
              </Button>
              <Button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
              >
                {isChangingPassword ?
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('common.loading') || 'Загрузка...'}</> :
                    (t('common.save') || 'Сохранить')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
  );
};

export default ProfilePage;