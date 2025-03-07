
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Key, 
  Shield, 
  User, 
  Users, 
  Building2
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4 px-6 bg-white dark:bg-slate-900 shadow-sm">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">UniBooker</h1>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link to="/login">Войти</Link>
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
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-card">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Возможности системы</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
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
              </ul>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
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
                  <span>Статус комнат</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
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
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 bg-card">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 UniBooker - Система бронирования помещений университета</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
