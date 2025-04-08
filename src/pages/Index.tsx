import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Key,
  Shield,
  User,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  Award,
  Code,
  Github,
  Lightbulb,
  ChevronsRight,
  Headphones,
  MessageCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Index = () => {
  const [currentTime, setCurrentTime] = useState("2025-04-08 08:45:25");
  const [stats, setStats] = useState({
    rooms: 23,
    bookings: 186,
    users: 142,
    universities: 1
  });

  // Update time periodically
  useEffect(() => {
    // Starting with provided time
    setCurrentTime("2025-04-08 08:45:25");

    const interval = setInterval(() => {
      const now = new Date();
      const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
      setCurrentTime(formattedDate);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
      <div className="min-h-screen flex flex-col">
        {/* Test Mode Banner */}
        <div className="bg-red-500 text-white py-2 px-4 text-center font-medium animate-pulse">
          Система работает в тестовом режиме. Возможны технические перебои в работе.
        </div>

        {/* Header */}
        <header className="border-b border-border py-4 px-6 bg-white dark:bg-slate-900 shadow-sm">
          <div className="container flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-primary">UniBooker</h1>
            </div>
            <div className="space-x-2">
              <Button variant="outline" asChild>
                <Link to="/login">Войти</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link to="/register">Зарегистрироваться</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero section */}
        <section className="py-16 px-6 flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-b from-background to-secondary/30">
          <div className="container max-w-4xl space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Система бронирования помещений университета
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Удобное бронирование комнат, аудиторий и спортивных комплексов для учебы и мероприятий
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button size="lg" asChild className="animate-slide-in">
                <Link to="/login">Забронировать помещение</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="animate-slide-in delay-100">
                <Link to="/about">Подробнее о системе</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 bg-primary text-primary-foreground">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <p className="text-3xl font-bold">{stats.rooms}</p>
                <p className="text-sm opacity-90">Аудиторий</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{stats.bookings}</p>
                <p className="text-sm opacity-90">Бронирований</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{stats.users}</p>
                <p className="text-sm opacity-90">Пользователей</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{stats.universities}</p>
                <p className="text-sm opacity-90">Университет</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 bg-card">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Возможности системы</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-lg shadow-sm border border-border transform transition-transform hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Для студентов</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Calendar className="shrink-0 text-primary mt-1" size={16} />
                    <span>Бронирование в один клик</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="shrink-0 text-primary mt-1" size={16} />
                    <span>Удобный выбор времени</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Key className="shrink-0 text-primary mt-1" size={16} />
                    <span>QR-код для доступа</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageCircle className="shrink-0 text-primary mt-1" size={16} />
                    <span>Уведомления о бронировании</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="shrink-0 text-primary mt-1" size={16} />
                    <span>История всех бронирований</span>
                  </li>
                </ul>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm border border-border transform transition-transform hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Для охранников</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Key className="shrink-0 text-primary mt-1" size={16} />
                    <span>Управление ключами</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="shrink-0 text-primary mt-1" size={16} />
                    <span>Контроль просроченных броней</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Building2 className="shrink-0 text-primary mt-1" size={16} />
                    <span>Статус комнат в реальном времени</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="shrink-0 text-primary mt-1" size={16} />
                    <span>Проверка прав доступа</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Headphones className="shrink-0 text-primary mt-1" size={16} />
                    <span>Техническая поддержка 24/7</span>
                  </li>
                </ul>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm border border-border transform transition-transform hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Для администраторов</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Calendar className="shrink-0 text-primary mt-1" size={16} />
                    <span>Управление расписанием</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="shrink-0 text-primary mt-1" size={16} />
                    <span>Контроль пользователей</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Building2 className="shrink-0 text-primary mt-1" size={16} />
                    <span>Аналитика использования</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Code className="shrink-0 text-primary mt-1" size={16} />
                    <span>Интеграция с расписанием</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lightbulb className="shrink-0 text-primary mt-1" size={16} />
                    <span>Отчеты и статистика</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-6 bg-background">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Регистрация</h3>
                <p className="text-muted-foreground">Зарегистрируйтесь в системе или войдите с вашими учетными данными</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Выбор помещения</h3>
                <p className="text-muted-foreground">Выберите свободное помещение и удобное время</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ChevronsRight className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Подтверждение</h3>
                <p className="text-muted-foreground">Получите подтверждение и уникальный код доступа</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Key className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">4. Получение ключа</h3>
                <p className="text-muted-foreground">Предъявите код охраннику и получите ключ от помещения</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Начните пользоваться прямо сейчас</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Присоединяйтесь к нашей системе и упростите процесс бронирования университетских помещений
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/login">Войти в систему</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground" asChild>
                <Link to="/register">Зарегистрироваться</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Test Mode Alert */}
        <section className="py-8 px-6 bg-background">
          <div className="container">
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
              <AlertTitle className="text-red-600 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                Тестовый режим
              </AlertTitle>
              <AlertDescription className="text-red-600/90">
                Система работает в тестовом режиме. Данные могут быть сброшены или изменены в любое время.
                По всем вопросам обращайтесь к администратору.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-6 bg-card">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  UniBooker
                </h3>
                <p className="text-muted-foreground">
                  Современная система для управления бронированием университетских помещений
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Навигация</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-muted-foreground hover:text-primary">Главная</Link></li>
                  <li><Link to="/login" className="text-muted-foreground hover:text-primary">Вход</Link></li>
                  <li><Link to="/register" className="text-muted-foreground hover:text-primary">Регистрация</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Контакты</h3>
                <address className="not-italic text-muted-foreground">
                  <p>Email: support@unibooker.edu</p>
                  <p>Телефон: +7 (999) 123-45-67</p>
                  <p className="mt-2">
                    Текущая дата и время (UTC): <span className="font-mono">{currentTime}</span>
                  </p>
                  <p>
                    Текущий пользователь: <span className="font-medium">lilnurik</span>
                  </p>
                </address>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-center md:text-left text-muted-foreground">
                © 2025 UniBooker - Система бронирования помещений университета
              </p>
              <div className="flex items-center gap-2">
                <a
                    href="https://github.com/lilnurik"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Github size={18} />
                  <span>Разработано <span className="font-medium">lilnurik</span></span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
};

export default Index;