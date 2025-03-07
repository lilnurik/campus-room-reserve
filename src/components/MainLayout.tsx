
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Calendar, ClipboardList, Home, LogOut, Menu, Settings, Shield, User } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Function to get navigation links based on user role
  const getNavigationLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { name: 'Главная', path: '/student', icon: <Home className="mr-2 h-5 w-5" /> },
          { name: 'Забронировать', path: '/student/booking', icon: <Calendar className="mr-2 h-5 w-5" /> },
          { name: 'Мои бронирования', path: '/student/my-bookings', icon: <ClipboardList className="mr-2 h-5 w-5" /> }
        ];
      case 'guard':
        return [
          { name: 'Главная', path: '/guard', icon: <Home className="mr-2 h-5 w-5" /> },
          { name: 'Бронирования', path: '/guard/bookings', icon: <ClipboardList className="mr-2 h-5 w-5" /> }
        ];
      case 'admin':
        return [
          { name: 'Главная', path: '/admin', icon: <Home className="mr-2 h-5 w-5" /> },
          { name: 'Бронирования', path: '/admin/bookings', icon: <ClipboardList className="mr-2 h-5 w-5" /> },
          { name: 'Настройки', path: '/admin/settings', icon: <Settings className="mr-2 h-5 w-5" /> }
        ];
      default:
        return [];
    }
  };

  const navigationLinks = getNavigationLinks();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'student':
        return <User className="h-4 w-4" />;
      case 'guard':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <Settings className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleName = () => {
    switch (user?.role) {
      case 'student':
        return 'Студент';
      case 'guard':
        return 'Охранник';
      case 'admin':
        return 'Администратор';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full py-6">
                  <div className="px-2 mb-6">
                    <h2 className="text-lg font-semibold mb-1">Campus Room Reserve</h2>
                    {user && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        {getRoleIcon()}
                        <span className="ml-1.5">{getRoleName()}</span>
                      </div>
                    )}
                  </div>
                  <nav className="flex-1">
                    {navigationLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start mb-1"
                        onClick={() => {
                          navigate(link.path);
                          setIsOpen(false);
                        }}
                      >
                        {link.icon}
                        {link.name}
                      </Button>
                    ))}
                  </nav>
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        navigate('/');
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Выйти
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 
              className="text-xl font-semibold ml-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              Campus Room Reserve
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                className="flex items-center"
                onClick={() => navigate(link.path)}
              >
                {link.icon}
                <span className="hidden lg:inline">{link.name}</span>
              </Button>
            ))}
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center p-2">
                  <div className="ml-2 space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {getRoleIcon()}
                      <span className="ml-1">{getRoleName()}</span>
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/${user.role}`)}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Главная</span>
                </DropdownMenuItem>
                {user.role === 'student' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/student/booking')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Забронировать</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/student/my-bookings')}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      <span>Мои бронирования</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="py-4 px-4 border-t border-slate-200 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          © {new Date().getFullYear()} Campus Room Reserve. Все права защищены.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
