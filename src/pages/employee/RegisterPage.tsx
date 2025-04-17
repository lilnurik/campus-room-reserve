
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/context/LanguageContext";

// Validation schema for the employee ID check
const employeeIdFormSchema = z.object({
    employeeId: z.string().min(3, "ID сотрудника должен содержать не менее 3 цифр").max(3, "ID сотрудника должен содержать не более 3 цифр"),
});

// Validation schema for password step
const passwordFormSchema = z.object({
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

type EmployeeIdFormValues = z.infer<typeof employeeIdFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const RegisterPage = () => {
    const navigate = useNavigate();
    const { registerEmployee, validateEmployeeId } = useAuth();
    const { t } = useTranslation();
    const [step, setStep] = useState<'id' | 'password'>('id');
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [employeeId, setEmployeeId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Form for employee ID
    const employeeIdForm = useForm<EmployeeIdFormValues>({
        resolver: zodResolver(employeeIdFormSchema),
        defaultValues: {
            employeeId: "",
        },
    });

    // Form for password
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    // Handle employee ID validation
    const onEmployeeIdSubmit = async (data: EmployeeIdFormValues) => {
        setLoading(true);
        setError(null);

        try {
            const response = await validateEmployeeId(data.employeeId);

            if (response.success && response.data) {
                setEmployeeData(response.data.employee_info);
                setEmployeeId(data.employeeId);
                setStep('password');
            } else {
                setError(response.error || "Не удалось проверить ID сотрудника");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка при проверке ID");
            console.error("Error validating employee ID:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle password submission
    const onPasswordSubmit = async (data: PasswordFormValues) => {
        setLoading(true);
        setError(null);

        try {
            const response = await registerEmployee(employeeId, data.password);

            if (response.success) {
                toast.success("Регистрация успешно завершена");
                navigate("/login");
            } else {
                setError(response.error || "Ошибка при регистрации");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка при регистрации");
            console.error("Error during employee registration:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="w-full max-w-sm mx-auto lg:w-96">
                    <div className="mb-6 text-center">
                        <img
                            src="https://turin.uz/wp-content/uploads/2021/05/TTPU_15_en-2048x475.png"
                            alt="TTPU Logo"
                            className="h-16 mx-auto mb-4"
                        />
                        <h1 className="text-2xl font-bold">UniBooker</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {t('landingPage.subtitle')}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{step === 'id' ? "Регистрация сотрудника" : "Создание пароля"}</CardTitle>
                            <CardDescription>
                                {step === 'id'
                                    ? "Введите ваш ID сотрудника из 3 цифр"
                                    : "Придумайте пароль для вашей учетной записи"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {step === 'id' ? (
                                <Form {...employeeIdForm}>
                                    <form onSubmit={employeeIdForm.handleSubmit(onEmployeeIdSubmit)} className="space-y-4">
                                        <FormField
                                            control={employeeIdForm.control}
                                            name="employeeId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ID сотрудника</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="123" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Проверить
                                        </Button>
                                    </form>
                                </Form>
                            ) : (
                                <>
                                    {employeeData && (
                                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                            <p className="font-medium text-sm mb-1">Подтвердите информацию о сотруднике:</p>
                                            <p className="text-sm">ФИО: <span className="font-medium">{employeeData.full_name}</span></p>
                                            <p className="text-sm">Отдел: <span className="font-medium">{employeeData.department}</span></p>
                                            <p className="text-sm">Руководитель: <span className="font-medium">{employeeData.manager_name}</span></p>
                                        </div>
                                    )}

                                    <Form {...passwordForm}>
                                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                            <FormField
                                                control={passwordForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Пароль</FormLabel>
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
                                                        <FormLabel>Подтверждение пароля</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => setStep('id')}
                                                    disabled={loading}
                                                >
                                                    Назад
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="flex-1"
                                                    disabled={loading}
                                                >
                                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    Завершить
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                            <div className="text-center text-sm">
                                Уже зарегистрированы?{" "}
                                <Link to="/login" className="font-medium text-primary hover:underline">
                                    Войти в систему
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            <div className="relative flex-1 hidden w-0 lg:block">
                <img
                    className="absolute inset-0 object-cover w-full h-full"
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                    alt="University building"
                />
            </div>
        </div>
    );
};

export default RegisterPage;