import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, UserCog, UserMinus, Mail, Loader2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Define user interface based on the API response
interface User {
  id: number;
  username: string;
  full_name: string;
  role: "admin" | "security" | "student";
  email: string;
  group: string | null;
  course: number | null;
  status: "active" | "inactive";
  faculty: string | null;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form state for new user
  const [newUser, setNewUser] = useState({
    username: "",
    full_name: "",
    role: "student",
    email: "",
    group: "",
    course: "",
    faculty: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError("Не удалось найти токен авторизации");
        setLoading(false);
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке данных");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on the search term
  const filteredUsers = users.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.group && user.group.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.faculty && user.faculty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Split users by role
  const students = filteredUsers.filter(user => user.role === "student");
  const guards = filteredUsers.filter(user => user.role === "security");
  const admins = filteredUsers.filter(user => user.role === "admin");

  // Handle user status change
  const handleStatusChange = async (userId: number, newStatus: "active" | "inactive") => {
    try {
      // In a real implementation, you would call your API to update the user status
      // For now, let's update the local state
      setUsers(users.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
      ));

      toast.success(`Статус пользователя успешно изменен на ${newStatus === "active" ? "активный" : "неактивный"}`);
    } catch (err) {
      toast.error("Не удалось изменить статус пользователя");
      console.error("Error changing user status:", err);
    }
  };

  // Handle user edit
  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    setIsEditUserOpen(true);
  };

  // Handle adding a new user
  const handleAddUser = async () => {
    // In a real implementation, this would call your API to create a new user
    toast.success("Пользователь успешно добавлен");
    setIsAddUserOpen(false);
    // Reset form
    setNewUser({
      username: "",
      full_name: "",
      role: "student",
      email: "",
      group: "",
      course: "",
      faculty: "",
      password: "",
    });
  };

  // Render user card based on role
  const renderUserCard = (user: User) => {
    const isActive = user.status === "active";

    return (
        <div key={user.id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">{user.full_name}</h3>
                <Badge className={isActive ?
                    "bg-green-100 text-green-800 hover:bg-green-100" :
                    "bg-red-100 text-red-800 hover:bg-red-100"}>
                  {isActive ? "Активен" : "Неактивен"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>

              {/* Render different details based on user role */}
              {user.role === "student" && (
                  <div className="text-sm text-muted-foreground">
                    <p>ID: {user.username}</p>
                    <p>Факультет: {user.faculty || "Не указан"}</p>
                    <p>Группа: {user.group || "Не указана"}</p>
                    <p>Курс: {user.course || "Не указан"}</p>
                  </div>
              )}

              {user.role === "security" && (
                  <div className="text-sm text-muted-foreground">
                    <p>ID: {user.username}</p>
                    <p>Роль: Охранник</p>
                  </div>
              )}

              {user.role === "admin" && (
                  <div className="text-sm text-muted-foreground">
                    <p>ID: {user.username}</p>
                    <p>Роль: Администратор</p>
                  </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                <UserCog className="h-4 w-4 mr-1" />
                Редактировать
              </Button>
              {user.role !== "admin" && (
                  <Button
                      variant={isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleStatusChange(user.id, isActive ? "inactive" : "active")}
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    {isActive ? "Деактивировать" : "Активировать"}
                  </Button>
              )}
            </div>
          </div>
        </div>
    );
  };

  return (
      <PageLayout role="admin">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Управление пользователями</h1>
              <p className="text-muted-foreground">
                Просмотр и управление аккаунтами пользователей системы
              </p>
            </div>
            <Button onClick={() => setIsAddUserOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить пользователя
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Поиск пользователей по имени или email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchUsers}>Обновить</Button>
          </div>

          {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Загрузка данных...</span>
              </div>
          ) : error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
          ) : (
              <Tabs defaultValue="students">
                <TabsList className="mb-6">
                  <TabsTrigger value="students">Студенты ({students.length})</TabsTrigger>
                  <TabsTrigger value="guards">Охранники ({guards.length})</TabsTrigger>
                  <TabsTrigger value="admins">Администраторы ({admins.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Студенты</CardTitle>
                      <CardDescription>
                        Список всех студентов в системе
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {students.length > 0 ? (
                            students.map(student => renderUserCard(student))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                              {searchTerm ? "По вашему запросу ничего не найдено" : "Список студентов пуст"}
                            </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="guards" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Охранники</CardTitle>
                      <CardDescription>
                        Список всех охранников в системе
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {guards.length > 0 ? (
                            guards.map(guard => renderUserCard(guard))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                              {searchTerm ? "По вашему запросу ничего не найдено" : "Список охранников пуст"}
                            </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="admins" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Администраторы</CardTitle>
                      <CardDescription>
                        Список всех администраторов в системе
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {admins.length > 0 ? (
                            admins.map(admin => renderUserCard(admin))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                              {searchTerm ? "По вашему запросу ничего не найдено" : "Список администраторов пуст"}
                            </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
          )}
        </div>

        {/* Add user dialog */}
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Добавить нового пользователя</DialogTitle>
              <DialogDescription>
                Заполните информацию о новом пользователе
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">ID пользователя</Label>
                  <Input
                      id="username"
                      placeholder="Например: 12345"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Роль</Label>
                  <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Студент</SelectItem>
                      <SelectItem value="security">Охранник</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">ФИО</Label>
                <Input
                    id="full_name"
                    placeholder="Полное имя пользователя"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>

              {newUser.role === "student" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="faculty">Факультет</Label>
                        <Input
                            id="faculty"
                            placeholder="Факультет"
                            value={newUser.faculty}
                            onChange={(e) => setNewUser({...newUser, faculty: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="group">Группа</Label>
                        <Input
                            id="group"
                            placeholder="Группа"
                            value={newUser.group}
                            onChange={(e) => setNewUser({...newUser, group: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Курс</Label>
                      <Select
                          value={newUser.course.toString()}
                          onValueChange={(value) => setNewUser({...newUser, course: value})}
                      >
                        <SelectTrigger id="course">
                          <SelectValue placeholder="Выберите курс" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 курс</SelectItem>
                          <SelectItem value="2">2 курс</SelectItem>
                          <SelectItem value="3">3 курс</SelectItem>
                          <SelectItem value="4">4 курс</SelectItem>
                          <SelectItem value="5">5 курс</SelectItem>
                          <SelectItem value="6">6 курс</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Отмена</Button>
              <Button onClick={handleAddUser}>Добавить пользователя</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit user dialog */}
        {currentUser && (
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Редактировать пользователя</DialogTitle>
                  <DialogDescription>
                    Измените информацию о пользователе "{currentUser.full_name}"
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-username">ID пользователя</Label>
                      <Input
                          id="edit-username"
                          value={currentUser.username}
                          disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Роль</Label>
                      <Input
                          id="edit-role"
                          value={currentUser.role === "admin" ? "Администратор" :
                              currentUser.role === "security" ? "Охранник" : "Студент"}
                          disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-full_name">ФИО</Label>
                    <Input
                        id="edit-full_name"
                        placeholder="Полное имя пользователя"
                        value={currentUser.full_name}
                        onChange={(e) => setCurrentUser({...currentUser, full_name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                        id="edit-email"
                        type="email"
                        placeholder="email@example.com"
                        value={currentUser.email}
                        onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-password">Новый пароль (оставьте пустым, чтобы не менять)</Label>
                    <Input
                        id="edit-password"
                        type="password"
                        placeholder="Новый пароль"
                    />
                  </div>

                  {currentUser.role === "student" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-faculty">Факультет</Label>
                            <Input
                                id="edit-faculty"
                                placeholder="Факультет"
                                value={currentUser.faculty || ""}
                                onChange={(e) => setCurrentUser({...currentUser, faculty: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-group">Группа</Label>
                            <Input
                                id="edit-group"
                                placeholder="Группа"
                                value={currentUser.group || ""}
                                onChange={(e) => setCurrentUser({...currentUser, group: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-course">Курс</Label>
                          <Select
                              value={currentUser.course?.toString() || ""}
                              onValueChange={(value) => setCurrentUser({...currentUser, course: Number(value)})}
                          >
                            <SelectTrigger id="edit-course">
                              <SelectValue placeholder="Выберите курс" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 курс</SelectItem>
                              <SelectItem value="2">2 курс</SelectItem>
                              <SelectItem value="3">3 курс</SelectItem>
                              <SelectItem value="4">4 курс</SelectItem>
                              <SelectItem value="5">5 курс</SelectItem>
                              <SelectItem value="6">6 курс</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Статус</Label>
                    <Select
                        value={currentUser.status}
                        onValueChange={(value: "active" | "inactive") => setCurrentUser({...currentUser, status: value})}
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активен</SelectItem>
                        <SelectItem value="inactive">Неактивен</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Отмена</Button>
                  <Button onClick={() => {
                    toast.success("Пользователь успешно обновлен");
                    setIsEditUserOpen(false);
                  }}>Сохранить изменения</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        )}
      </PageLayout>
  );
};

export default UsersPage;