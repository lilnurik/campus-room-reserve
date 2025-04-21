import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    Briefcase,
    Copy,
    Edit,
    Loader2,
    MailOpen,
    Search,
    Trash2,
    UserMinus,
    UserPlus,
    AlertTriangle,
    Key,
    User
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Form schema for adding a new employee
const employeeFormSchema = z.object({
    fullName: z.string().min(2, "ФИО должно содержать не менее 2 символов"),
    email: z.string().email("Введите корректный email"),
    department: z.string().min(2, "Отдел должен содержать не менее 2 символов"),
    internalId: z.string().optional(),
    isSupervisor: z.boolean().default(false),
});

// Form schema for editing an employee
const editEmployeeFormSchema = z.object({
    fullName: z.string().min(2, "ФИО должно содержать не менее 2 символов"),
    email: z.string().email("Введите корректный email"),
    department: z.string().min(2, "Отдел должен содержать не менее 2 символов"),
    isSupervisor: z.boolean().default(false),
    status: z.string(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
type EditEmployeeFormValues = z.infer<typeof editEmployeeFormSchema>;

// Staff member interface matching API response
interface StaffMember {
    id: number;
    username: string;
    full_name: string;
    email: string;
    department: string;
    internal_id: string;
    status: string;
    is_supervisor?: boolean;
    has_set_password?: boolean; // Track if employee has set their own password
    temporary_password?: string; // Store temporary password if they haven't set one
}

const EmployeeManagementPage = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<StaffMember[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
    const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<StaffMember | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [newEmployeeCredentials, setNewEmployeeCredentials] = useState<{
        username: string;
        employeeId: string;
        password: string;
    } | null>(null);
    const [viewCredentialsFor, setViewCredentialsFor] = useState<StaffMember | null>(null);
    const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);

    // Add employee form
    const addForm = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            department: user?.department || "",
            internalId: "",
            isSupervisor: false,
        },
    });

    // Edit employee form
    const editForm = useForm<EditEmployeeFormValues>({
        resolver: zodResolver(editEmployeeFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            department: "",
            isSupervisor: false,
            status: "active",
        },
    });

    // Fetch staff members from backend API
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

            // Simulate has_set_password field for demonstration (this should come from the API)
            // In a real app, this would be part of the API response
            const processedStaff = data.map((staff: StaffMember) => ({
                ...staff,
                // For example purposes, let's assume staff with IDs less than certain number haven't set passwords
                has_set_password: staff.id % 3 !== 0, // just for demo
            }));

            setEmployees(processedStaff);
        } catch (error) {
            console.error("Error loading staff members:", error);
            setLoadError(error instanceof Error ? error.message : "Failed to load staff members");
            toast.error("Не удалось загрузить список сотрудников");
        } finally {
            setIsLoadingStaff(false);
        }
    };

    useEffect(() => {
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

    // Handle add employee form submission
    const onAddSubmit = async (data: EmployeeFormValues) => {
        setIsLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error("Authentication token not found");
            }

            const payload = {
                full_name: data.fullName,
                email: data.email,
                department: data.department,
                internal_id: data.internalId || undefined, // Only include if provided
                is_supervisor: data.isSupervisor
            };

            console.log("Creating new employee:", payload);

            const response = await fetch("http://localhost:5321/api/staff/create", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Creation response:", result);
                toast.success(result.message || "Сотрудник успешно создан");

                // Handle the actual response format
                if (result.staff) {
                    // Save credentials for display to the user
                    setNewEmployeeCredentials({
                        username: result.staff.username,
                        employeeId: result.staff.id.toString(),
                        password: result.staff.temporary_password
                    });

                    // Add new employee to the list with temporary password
                    const newEmployee: StaffMember = {
                        ...result.staff,
                        status: "active",
                        is_supervisor: data.isSupervisor,
                        has_set_password: false // New employee hasn't set password yet
                    };

                    setEmployees([...employees, newEmployee]);
                }

                // Reset form
                addForm.reset();
            } else {
                toast.error(result.detail || result.message || "Не удалось создать сотрудника");
            }
        } catch (error) {
            console.error("Error creating employee:", error);
            toast.error("Произошла ошибка при создании сотрудника");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle edit employee form submission
    const onEditSubmit = async (data: EditEmployeeFormValues) => {
        if (!selectedEmployee) return;

        setIsLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error("Authentication token not found");
            }

            const payload = {
                full_name: data.fullName,
                email: data.email,
                department: data.department,
                is_supervisor: data.isSupervisor,
                status: data.status
            };

            console.log(`Updating employee ${selectedEmployee.id}:`, payload);

            const response = await fetch(`http://localhost:5321/api/staff/${selectedEmployee.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Информация о сотруднике обновлена");
                setIsEditEmployeeOpen(false);
                fetchStaffMembers(); // Refresh the list
            } else {
                toast.error(result.detail || result.message || "Не удалось обновить информацию");
            }
        } catch (error) {
            console.error("Error updating employee:", error);
            toast.error("Произошла ошибка при обновлении данных");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle employee deletion
    const handleDeleteEmployee = async () => {
        if (!selectedEmployee) return;

        setIsLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error("Authentication token not found");
            }

            console.log(`Deleting employee ${selectedEmployee.id}`);

            const response = await fetch(`http://localhost:5321/api/staff/${selectedEmployee.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                toast.success("Сотрудник удален");
                setIsDeleteConfirmOpen(false);
                fetchStaffMembers(); // Refresh the list
            } else {
                const result = await response.json();
                toast.error(result.detail || result.message || "Не удалось удалить сотрудника");
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error("Произошла ошибка при удалении сотрудника");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle employee status change
    const toggleEmployeeStatus = async (employee: StaffMember) => {
        setIsLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error("Authentication token not found");
            }

            const newStatus = employee.status === "active" ? "inactive" : "active";

            const payload = {
                full_name: employee.full_name,
                email: employee.email,
                department: employee.department,
                is_supervisor: employee.is_supervisor || false,
                status: newStatus
            };

            console.log(`Updating employee ${employee.id} status to ${newStatus}`);

            const response = await fetch(`http://localhost:5321/api/staff/${employee.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(`Статус сотрудника изменен на "${newStatus === "active" ? "активен" : "неактивен"}"`);
                fetchStaffMembers(); // Refresh the list
            } else {
                const result = await response.json();
                toast.error(result.detail || result.message || "Не удалось изменить статус");
            }
        } catch (error) {
            console.error("Error updating employee status:", error);
            toast.error("Произошла ошибка при изменении статуса");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Скопировано в буфер обмена");
    };

    // Open edit employee dialog
    const openEditDialog = (employee: StaffMember) => {
        setSelectedEmployee(employee);
        editForm.reset({
            fullName: employee.full_name,
            email: employee.email,
            department: employee.department,
            isSupervisor: employee.is_supervisor || false,
            status: employee.status
        });
        setIsEditEmployeeOpen(true);
    };

    // Open delete confirmation dialog
    const openDeleteDialog = (employee: StaffMember) => {
        setSelectedEmployee(employee);
        setIsDeleteConfirmOpen(true);
    };

    // Open credentials dialog
    const showCredentials = (employee: StaffMember) => {
        setViewCredentialsFor(employee);
        setIsCredentialsDialogOpen(true);
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
                            <Button onClick={() => fetchStaffMembers()}>Попробовать снова</Button>
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
                                                                {!employee.has_set_password && (
                                                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                                                        Новый пользователь
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
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <User className="h-4 w-4" />
                                                                <span>Логин: {employee.username}</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                ID: {employee.internal_id}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                            {!employee.has_set_password && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                                                    onClick={() => showCredentials(employee)}
                                                                >
                                                                    <Key className="h-4 w-4 mr-1" />
                                                                    Учетные данные
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(employee)}
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Редактировать
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => toggleEmployeeStatus(employee)}
                                                                disabled={isLoading}
                                                            >
                                                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <User className="h-4 w-4" />
                                                                <span>Логин: {employee.username}</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                ID: {employee.internal_id}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                            {!employee.has_set_password && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                                                    onClick={() => showCredentials(employee)}
                                                                >
                                                                    <Key className="h-4 w-4 mr-1" />
                                                                    Учетные данные
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(employee)}
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Редактировать
                                                            </Button>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => toggleEmployeeStatus(employee)}
                                                                disabled={isLoading}
                                                            >
                                                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                <UserPlus className="h-4 w-4 mr-1" />
                                                                Активировать
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => openDeleteDialog(employee)}
                                                            >
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
                                    <div className="text-sm font-medium">Логин:</div>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-white px-2 py-1 rounded border">{newEmployeeCredentials.username}</code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyToClipboard(newEmployeeCredentials.username)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

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
                                    addForm.reset();
                                }}>
                                    Добавить еще
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <Form {...addForm}>
                            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                                <FormField
                                    control={addForm.control}
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
                                    control={addForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="employee@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={addForm.control}
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
                                    control={addForm.control}
                                    name="internalId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Внутренний ID (необязательно)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="12345" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Внутренний идентификатор компании (если есть)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={addForm.control}
                                    name="isSupervisor"
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

            {/* Edit Employee Dialog */}
            <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Редактировать данные сотрудника</DialogTitle>
                        <DialogDescription>
                            Внесите необходимые изменения в информацию о сотруднике.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                            <FormField
                                control={editForm.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ФИО сотрудника</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Отдел</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="isSupervisor"
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

                            <FormField
                                control={editForm.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Статус</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите статус" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Активный</SelectItem>
                                                <SelectItem value="inactive">Неактивный</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditEmployeeOpen(false)}>
                                    Отмена
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Сохранить изменения
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* View Credentials Dialog */}
            <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Учетные данные сотрудника</DialogTitle>
                        <DialogDescription>
                            Данные для входа сотрудника {viewCredentialsFor?.full_name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="border rounded-md p-4 bg-amber-50 space-y-3">
                        <div className="text-amber-700 font-medium mb-2">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Сотрудник еще не сменил временный пароль
              </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Логин:</div>
                            <div className="flex items-center gap-2">
                                <code className="bg-white px-2 py-1 rounded border">{viewCredentialsFor?.username}</code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(viewCredentialsFor?.username || "")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Временный пароль:</div>
                            <div className="flex items-center gap-2">
                                <code className="bg-white px-2 py-1 rounded border">{viewCredentialsFor?.temporary_password || "********"}</code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(viewCredentialsFor?.temporary_password || "")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground mt-2">
                            Передайте эти данные сотруднику для первого входа в систему.
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsCredentialsDialogOpen(false)}>
                            Закрыть
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удаление сотрудника</AlertDialogTitle>
                        <AlertDialogDescription>
                            <div className="flex items-start gap-2 mb-2">
                                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                                <span>
                  Вы уверены, что хотите удалить сотрудника <strong>{selectedEmployee?.full_name}</strong>? Это действие не может быть отменено.
                </span>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteEmployee}
                            disabled={isLoading}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
};

export default EmployeeManagementPage;