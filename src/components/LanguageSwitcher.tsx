
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="flex items-center gap-1"
    >
      <Globe size={16} />
      {language === 'ru' ? 'EN' : 'РУ'}
    </Button>
  );
};

export default LanguageSwitcher;
