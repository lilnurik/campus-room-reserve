import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { User, KeyRound, Shield, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LoginPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (!result.success) {
        toast.error(result.error || t('auth.invalidCredentials'));
      }
      // If successful, the AuthContext will handle the redirection
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-end mb-2">
              <LanguageSwitcher />
            </div>
            <img
                src="https://turin.uz/wp-content/uploads/2021/05/TTPU_15_en-2048x475.png"
                alt="TTPU Logo"
                className="h-15 max-w-[220px] mx-auto object-contain mb-2"
            />
            <CardTitle className="text-2xl font-bold text-primary">{t('auth.loginTitle')}</CardTitle>
            <CardDescription>{t('auth.loginDescription')}</CardDescription>
          </CardHeader>

          <Tabs defaultValue={role} onValueChange={setRole} className="w-full">
            <TabsList className="grid grid-cols-2 mx-auto w-[350px]">
              <TabsTrigger value="student" className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {t('auth.studentRole')}
              </TabsTrigger>
              <TabsTrigger value="employee" className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {t('auth.staffRole')}
              </TabsTrigger>
              {/*<TabsTrigger value="security" className="flex items-center gap-1">*/}
              {/*  <KeyRound className="w-4 h-4" />*/}
              {/*  {t('auth.guardRole')}*/}
              {/*</TabsTrigger>*/}
              {/*<TabsTrigger value="admin" className="flex items-center gap-1">*/}
              {/*  <Shield className="w-4 h-4" />*/}
              {/*  {t('auth.adminRole')}*/}
              {/*</TabsTrigger>*/}
            </TabsList>

            <TabsContent value="student">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder={t('auth.studentIdPlaceholder')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.loggingIn') : t('auth.login')}
                  </Button>

                  <div className="text-sm text-center">
                    {t('auth.newStudent')}{" "}
                    <Link to="/register" className="text-primary hover:underline">
                      {t('auth.register')}
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="employee">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder={t('auth.staffIdPlaceholder') || "3-digit Staff ID"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.loggingIn') : t('auth.loginAsStaff')}
                  </Button>

                  <div className="text-sm text-center">
                    {t('auth.newStaff') || "New staff member?"}{" "}
                    <Link to="/staff-register" className="text-primary hover:underline">
                      {t('auth.register')}
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="security">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder={t('auth.usernamePlaceholder')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.loggingIn') : t('auth.loginAsGuard')}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder={t('auth.usernamePlaceholder')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.loggingIn') : t('auth.loginAsAdmin')}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
  );
};

export default LoginPage;