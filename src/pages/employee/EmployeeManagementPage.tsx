import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Briefcase, Copy, Edit, Loader2, MailOpen, Plus, Search, Trash2, User, UserCog, UserMinus, UserPlus } from "lucide-react";

// Form schema for adding a new employee
const employeeFormSchema = z.object({
    fullName: z.string().min(2, "ФИО должно содержать не менее 2 символов"),
    department: z.string().min(2, "Отдел должен содержать не менее 2 символов"),
    isManager: z.boolean().default(false),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

// Updated interface to match API response
interface StaffMember {
    id: number;
    username: string;
    full_name: string;
    email: string;
    department: string;
    internal_id: string;
    status: string;
    is_supervisor?: boolean;
}

const EmployeeManagementPage = () => {
    const { user, createEmployee } = useAuth();
    const [employees, setEmployees] = useState<StaffMember[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [newEmployeeCredentials, setNewEmployeeCredentials] = useState<{
        employeeId: string;
        password: string;
    } | null>(null);

    // Form control
    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema),
        defaultValues: {
            fullName: "",
            department: user?.department || "",
            isManager: false,
        },
    });

    // Fetch staff members from backend API
    useEffect(() => {
        const fetchStaffMembers = async () => {
            setIsLoadingStaff(true);
            setLoadError(null);

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error("Authentication token not found");
                }

                console.log("Fetching staff members from API...");
                const response = await fetch("http://localhost:5321/api/staff/subordinates", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch staff: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Staff data loaded:", data);
                setEmployees(data);
            } catch (error) {
                console.error("Error loading staff members:", error);
                setLoadError(error instanceof Error ? error.message : "Failed to load staff members");
                toast.error("Не удалось загрузить список сотрудников");
            } finally {
                setIsLoadingStaff(false);
            }
        };

        fetchStaffMembers();
    }, []);

    // Filter employees based on search term
    const filteredEmployees = employees.filter(
        (employee) =>
            employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.internal_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Split by active status
    const activeEmployees = filteredEmployees.filter(emp => emp.status === "active");
    const inactiveEmployees = filteredEmployees.filter(emp => emp.status !== "active");

    // Handle form submission
    const onSubmit = async (data: EmployeeFormValues) => {
        setIsLoading(true);

        try {
            const result = await createEmployee(data.fullName, data.department, data.isManager);

            if (result.success && result.employeeId && result.password) {
                toast.success("Сотрудник успешно создан");

                // Save credentials for display to the user
                setNewEmployeeCredentials({
                    employeeId: result.employeeId,
                    password: result.password
                });

                // Add new employee to the list - this would be replaced by a re-fetch in production
                const newEmployee: StaffMember = {
                    id: parseInt(result.employeeId),
                    username: data.fullName.split(' ')[0].toLowerCase(),
                    full_name: data.fullName,
                    email: `${data.fullName.split(' ')[0].toLowerCase()}@example.com`,
                    department: data.department,
                    internal_id: result.employeeId,
                    status: "active",
                    is_supervisor: data.isManager
                };

                setEmployees([...employees, newEmployee]);

                // Reset form
                form.reset();
            } else {
                toast.error(result.error || "Не удалось создать сотрудника");
            }
        } catch (error) {
            console.error("Error creating employee:", error);
            toast.error("Произошла ошибка при создании сотрудника");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Скопировано в буфер обмена");
    };

    // Handle employee status change
    const toggleEmployeeStatus = (empId: number) => {
        // In a real app, this would make an API call to update the status
        setEmployees(
            employees.map(emp =>
                emp.id === empId ? { ...emp, status: emp.status === "active" ? "inactive" : "active" } : emp
            )
        );

        toast.success("Статус сотрудника изменен");
    };

    return (
        <PageLayout role="employee">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Управление сотрудниками</h1>
                        <p className="text-muted-foreground">
                            Добавление и управление сотрудниками вашего отдела
                        </p>
                    </div>
                    <Button onClick={() => setIsAddEmployeeOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Добавить сотрудника
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Поиск сотрудников..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoadingStaff ? (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin mr-3" />
                        <span className="text-lg">Загрузка списка сотрудников...</span>
                    </div>
                ) : loadError ? (
                    <Card>
                        <CardContent className="p-6 text-center text-destructive">
                            <p className="mb-4">Ошибка загрузки данных: {loadError}</p>
                            <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Tabs defaultValue="active">
                        <TabsList className="mb-6">
                            <TabsTrigger value="active">Активные сотрудники ({activeEmployees.length})</TabsTrigger>
                            <TabsTrigger value="inactive">Неактивные сотрудники ({inactiveEmployees.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="active" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Активные сотрудники</CardTitle>
                                    <CardDescription>Список всех активных сотрудников вашего отдела</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {activeEmployees.length > 0 ? (
                                        <div className="space-y-4">
                                            {activeEmployees.map((employee) => (
                                                <div key={employee.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium text-lg">{employee.full_name}</h3>
                                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                                    Активен
                                                                </Badge>
                                                                {employee.is_supervisor && (
                                                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                                                        Руководитель
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <MailOpen className="h-4 w-4" />
                                                                <span>{employee.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Briefcase className="h-4 w-4" />
                                                                <span>Отдел: {employee.department}</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                ID: {employee.internal_id}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Редактировать
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => toggleEmployeeStatus(employee.id)}
                                                            >
                                                                <UserMinus className="h-4 w-4 mr-1" />
                                                                Деактивировать
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            {searchTerm ? "По вашему запросу ничего не найдено" : "Список активных сотрудников пуст"}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="inactive" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Неактивные сотрудники</CardTitle>
                                    <CardDescription>Список всех неактивных сотрудников вашего отдела</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {inactiveEmployees.length > 0 ? (
                                        <div className="space-y-4">
                                            {inactiveEmployees.map((employee) => (
                                                <div key={employee.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium text-lg">{employee.full_name}</h3>
                                                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                                                    Неактивен
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <MailOpen className="h-4 w-4" />
                                                                <span>{employee.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Briefcase className="h-4 w-4" />
                                                                <span>Отдел: {employee.department}</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                ID: {employee.internal_id}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="default" size="sm" onClick={() => toggleEmployeeStatus(employee.id)}>
                                                                <UserPlus className="h-4 w-4 mr-1" />
                                                                Активировать
                                                            </Button>
                                                            <Button variant="destructive" size="sm">
                                                                <Trash2 className="h-4 w-4 mr-1" />
                                                                Удалить
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            {searchTerm ? "По вашему запросу ничего не найдено" : "Список неактивных сотрудников пуст"}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            {/* Add Employee Dialog */}
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Добавить нового сотрудника</DialogTitle>
                        <DialogDescription>
                            Заполните информацию о новом сотруднике. Учетные данные будут сгенерированы автоматически.
                        </DialogDescription>
                    </DialogHeader>

                    {newEmployeeCredentials ? (
                        <>
                            <div className="border rounded-md p-4 bg-green-50 space-y-3">
                                <div className="text-green-700 font-medium text-center mb-2">Сотрудник успешно создан!</div>

                                <div className="flex justify-between items-center">
                                    <div className="text-sm font-medium">ID сотрудника:</div>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-white px-2 py-1 rounded border">{newEmployeeCredentials.employeeId}</code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyToClipboard(newEmployeeCredentials.employeeId)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-sm font-medium">Временный пароль:</div>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-white px-2 py-1 rounded border">{newEmployeeCredentials.password}</code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyToClipboard(newEmployeeCredentials.password)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="text-xs text-muted-foreground mt-2">
                                    Сохраните эти данные. Сотрудник должен использовать их для первого входа в систему.
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                    setNewEmployeeCredentials(null);
                                    setIsAddEmployeeOpen(false);
                                }}>
                                    Закрыть
                                </Button>
                                <Button onClick={() => {
                                    setNewEmployeeCredentials(null);
                                    form.reset();
                                }}>
                                    Добавить еще
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ФИО сотрудника</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Иванов Иван Иванович" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Полное имя сотрудника
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Отдел</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Отдел разработки" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Отдел, в котором будет работать сотрудник
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isManager"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Права руководителя
                                                </FormLabel>
                                                <FormDescription>
                                                    Сотрудник будет иметь права на управление другими сотрудниками
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                                        Отмена
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Создать сотрудника
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
};

export default EmployeeManagementPage;