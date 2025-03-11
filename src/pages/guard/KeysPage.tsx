import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Key, Lock, Search, Unlock, AlertCircle, Clock } from "lucide-react";

const KeysPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageLayout role="guard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление ключами</h1>
          <p className="text-muted-foreground">
            Контроль доступа к аудиториям и выдача ключей
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по номеру аудитории..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="available">
          <TabsList className="mb-6">
            <TabsTrigger value="available">Доступные ключи</TabsTrigger>
            <TabsTrigger value="issued">Выданные ключи</TabsTrigger>
            <TabsTrigger value="maintenance">На обслуживании</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Доступные ключи</CardTitle>
                <CardDescription>
                  Ключи, которые в данный момент находятся на посту охраны
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 101</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Доступен
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Key className="h-4 w-4" />
                          <span>Ключ #101-A</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Тип: Стандартный</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm">
                          <Unlock className="h-4 w-4 mr-1" />
                          Выдать ключ
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 102</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Доступен
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Key className="h-4 w-4" />
                          <span>Ключ #102-A</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Тип: Стандартный</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm">
                          <Unlock className="h-4 w-4 mr-1" />
                          Выдать ключ
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 310</h3>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Доступен
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Key className="h-4 w-4" />
                          <span>Ключ #310-A</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Тип: Электронный</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm">
                          <Unlock className="h-4 w-4 mr-1" />
                          Выдать ключ
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issued" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Выданные ключи</CardTitle>
                <CardDescription>
                  Ключи, которые были выданы посетителям
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 205</h3>
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                            <Key className="h-3 w-3 mr-1" />
                            Выдан
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Key className="h-4 w-4" />
                          <span>Ключ #205-A</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Выдан: Иван Иванов (14:30 - 16:00)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Lock className="h-4 w-4 mr-1" />
                          Принять ключ
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 111</h3>
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                            <Key className="h-3 w-3 mr-1" />
                            Выдан
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Key className="h-4 w-4" />
                          <span>Ключ #111-A</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Выдан: Елена Смирнова (13:00 - 15:30)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Lock className="h-4 w-4 mr-1" />
                          Принять ключ
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ключи на обслуживании</CardTitle>
                <CardDescription>
                  Ключи, которые временно недоступны из-за обслуживания
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Аудитория 201</h3>
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            На обслуживании
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Key className="h-4 w-4" />
                          <span>Ключ #201-A</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Причина: Замена замка</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Ожидаемое возвращение: 17.05.2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default KeysPage;
