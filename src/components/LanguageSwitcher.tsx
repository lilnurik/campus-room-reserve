import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();

  // Get the language code to display on button
  const displayLanguage = () => {
    switch(language) {
      case 'ru': return 'РУ';
      case 'en': return 'EN';
      case 'uz': return 'UZ';
      default: return 'UZ';
    }
  };

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 h-9 px-3">
            <Globe size={16} />
            {displayLanguage()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
              onClick={() => setLanguage('ru')}
              className={language === 'ru' ? 'bg-accent text-accent-foreground' : ''}
          >
            Русский (RU)
          </DropdownMenuItem>
          <DropdownMenuItem
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'bg-accent text-accent-foreground' : ''}
          >
            English (EN)
          </DropdownMenuItem>
          <DropdownMenuItem
              onClick={() => setLanguage('uz')}
              className={language === 'uz' ? 'bg-accent text-accent-foreground' : ''}
          >
            O'zbekcha (UZ)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
};

export default LanguageSwitcher;