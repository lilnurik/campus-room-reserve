import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { authApi } from "@/services/api.ts";

// Updated student ID schema - based on backend requirements
// This can be modified to fit your exact student ID format
const studentIdSchema = z.string().min(3, "ID студента должен содержать минимум 3 символа");

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
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const navigate = useNavigate();

  const handleValidateId = async () => {
    try {
      // Validate format (this can be adjusted based on your requirements)
      const result = studentIdSchema.safeParse(studentId);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      setIsValidatingId(true);

      // Call the new backend endpoint to check student ID
      const response = await authApi.checkStudentId(studentId);

      if (response.success) {
        if (response.data.status === 'verified') {
          setIdValidated(true);
          toast.success("ID студента подтвержден");

          // Store student info from API response
          if (response.data.student_info) {
            setStudentInfo(response.data.student_info);
            // Pre-fill form fields if available
            if (response.data.student_info.full_name) {
              setName(response.data.student_info.full_name);
            }
            if (response.data.student_info.email) {
              setEmail(response.data.student_info.email);
            }
          }
        } else if (response.data.status === 'registered') {
          toast.info("Этот ID уже зарегистрирован. Пожалуйста, авторизуйтесь.");
          navigate("/login");
        } else {
          toast.error("Указанный ID студента не найден в системе");
        }
      } else {
        toast.error(response.error || "Ошибка при проверке ID студента");
      }
    } catch (error) {
      toast.error("Ошибка при проверке ID студента");
      console.error(error);
    } finally {
      setIsValidatingId(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate student ID format
    const idResult = studentIdSchema.safeParse(studentId);
    if (!idResult.success) {
      toast.error(idResult.error.errors[0].message);
      return;
    }

    // Validate password
    if (!password) {
      toast.error("Пожалуйста, введите пароль");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    // Only proceed if student ID is validated
    if (!idValidated) {
      toast.error("Пожалуйста, подтвердите ID студента");
      return;
    }

    setIsLoading(true);

    try {
      // Call the new endpoint to complete registration with password
      const result = await authApi.completeRegistration(studentId, password);

      if (result.success) {
        toast.success("Регистрация успешна! Теперь вы можете войти в систему");
        navigate("/login");
      } else {
        toast.error(result.error || "Ошибка при регистрации");
      }
    } catch (error) {
      toast.error("Произошла ошибка при регистрации");
      console.error(error);
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
                      placeholder="ID студента"
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

              {/* Show student info if validated */}
              {idValidated && studentInfo && (
                  <div className="bg-muted p-3 rounded-md">
                    <h3 className="font-medium mb-1">Информация о студенте:</h3>
                    <p><span className="font-medium">Имя:</span> {studentInfo.full_name}</p>
                    {studentInfo.email && <p><span className="font-medium">Email:</span> {studentInfo.email}</p>}
                    {studentInfo.group && <p><span className="font-medium">Группа:</span> {studentInfo.group}</p>}
                    {studentInfo.faculty && <p><span className="font-medium">Факультет:</span> {studentInfo.faculty}</p>}
                  </div>
              )}

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