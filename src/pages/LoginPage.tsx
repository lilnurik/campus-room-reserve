import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { User, KeyRound, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { authApi } from "@/services/api";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // In your login handler function:
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the login API
      const response = await authApi.login({
        username: username,
        password: password
      });

      if (response.success) {
        // Store token in localStorage - make sure it's just the token string
        // IMPORTANT: Make sure you're storing just the token value, not an object
        localStorage.setItem('authToken', response.data.token);

        // Optional: Log that token was saved
        console.log("Token saved successfully:", response.data.token.substring(0, 15) + '...');

        // Store other user data if needed
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userName', response.data.full_name);

        // Show success toast
        toast.success(`Добро пожаловать, ${response.data.full_name || username}!`);

        // Redirect based on role
        if (response.data.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (response.data.role === 'security') {
          navigate('/guard/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        toast.error(response.error || "Неверное имя пользователя или пароль");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Ошибка при входе в систему");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">UniBooker</CardTitle>
            <CardDescription>Войдите в систему бронирования помещений</CardDescription>
          </CardHeader>



          <Tabs defaultValue={role} onValueChange={setRole} className="w-full">


            <TabsContent value="student">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder="ID студента"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Вход..." : "Войти"}
                  </Button>

                  <div className="text-sm text-center">
                    Новый студент?{" "}
                    <Link to="/register" className="text-primary hover:underline">
                      Зарегистрироваться
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="guard">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Вход..." : "Войти как охранник"}
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
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Вход..." : "Войти как администратор"}
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