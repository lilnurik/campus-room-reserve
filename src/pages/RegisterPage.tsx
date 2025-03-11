
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

// Student ID validation schema (U followed by 5 digits)
const studentIdSchema = z.string().regex(/^U\d{5}$/, "ID студента должен быть в формате U12345");

const RegisterPage = () => {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingId, setIsValidatingId] = useState(false);
  const [idValidated, setIdValidated] = useState(false);
  const navigate = useNavigate();
  const { registerStudent, validateStudentId } = useAuth();

  const handleValidateId = async () => {
    try {
      // Validate student ID format
      const result = studentIdSchema.safeParse(studentId);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      setIsValidatingId(true);
      
      // Call API to validate student ID
      const validationResult = await validateStudentId(studentId);
      
      if (validationResult.success) {
        setIdValidated(true);
        toast.success("ID студента подтвержден");
        
        // Prefill name if provided by the API
        if (validationResult.data?.name) {
          setName(validationResult.data.name);
        }
      } else {
        toast.error(validationResult.error || "Указанный ID студента не найден в системе");
      }
    } catch (error) {
      toast.error("Ошибка при проверке ID студента");
    } finally {
      setIsValidatingId(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate student ID format again
    const idResult = studentIdSchema.safeParse(studentId);
    if (!idResult.success) {
      toast.error(idResult.error.errors[0].message);
      return;
    }
    
    // Validate all fields
    if (!name || !email || !password) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Пожалуйста, введите корректный email");
      return;
    }
    
    // Only proceed if student ID is validated
    if (!idValidated) {
      toast.error("Пожалуйста, подтвердите ID студента");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await registerStudent(studentId, name, email, password, phone);
      
      if (result.success) {
        toast.success("Регистрация успешна! Теперь вы можете войти в систему");
        navigate("/login");
      } else {
        toast.error(result.error || "Ошибка при регистрации");
      }
    } catch (error) {
      toast.error("Произошла ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Регистрация студента</CardTitle>
          <CardDescription>Создайте аккаунт для бронирования помещений</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="ID студента (U12345)"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={idValidated || isValidatingId}
                  required
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleValidateId}
                  disabled={isValidatingId || idValidated || !studentId}
                >
                  {isValidatingId ? "Проверка..." : idValidated ? "Подтвержден" : "Проверить ID"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Полное имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!idValidated}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!idValidated}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="Телефон (необязательно)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!idValidated}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!idValidated}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!idValidated}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading || !idValidated}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
            
            <div className="text-sm text-center">
              Уже есть аккаунт?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Войти
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
