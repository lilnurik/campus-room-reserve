
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '@/utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateElement: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ru',
  setLanguage: () => {},
  t: (key: string) => key,
  translateElement: (text: string) => text,
});

export const useTranslation = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('ru');
  
  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language);
    // When language changes, update all text elements with translation attributes
    translatePageContent();
  }, [language]);
  
  // Translate function for keys in the translations object
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key;
      }
    }
    
    return typeof result === 'string' ? result : key;
  };
  
  // Function to translate arbitrary text
  const translateElement = (text: string): string => {
    // If current language is Russian (default), return original text
    if (language === 'ru') return text;
    
    // Check if we have a translation for this text in our dictionary
    for (const key in translations.ru) {
      const ruSection = translations.ru[key];
      if (typeof ruSection === 'object') {
        for (const subKey in ruSection) {
          if (ruSection[subKey] === text && translations.en[key]?.[subKey]) {
            return translations.en[key][subKey];
          }
        }
      } else if (ruSection === text && translations.en[key]) {
        return translations.en[key];
      }
    }
    
    // If no translation is found, use simple dictionary replacement for common words
    // This is a basic fallback for text not in our translations object
    return replaceCommonWords(text, language);
  };
  
  // Function to translate the entire page content
  const translatePageContent = () => {
    // Select all elements with text content
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, button, a, label, li');
    
    textElements.forEach(element => {
      // Skip elements with data-no-translate attribute
      if (element.getAttribute('data-no-translate') !== null) return;
      
      // Skip elements with only whitespace or no children
      if (!element.textContent?.trim()) return;
      
      // Check if this is a leaf node (contains text directly)
      if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
        const originalText = element.textContent;
        if (!originalText) return;
        
        // Store original text if not already stored
        if (!element.getAttribute('data-original-text')) {
          element.setAttribute('data-original-text', originalText);
        }
        
        // If switching to Russian, restore original text
        if (language === 'ru') {
          const originalStored = element.getAttribute('data-original-text');
          if (originalStored) {
            element.textContent = originalStored;
          }
        } else if (language === 'en') {
          // Translate to English
          const translatedText = translateElement(originalText);
          element.textContent = translatedText;
        }
      }
    });
  };
  
  // Simple dictionary replacement for common Russian words to English
  const replaceCommonWords = (text: string, targetLang: Language): string => {
    if (targetLang === 'ru') return text;
    
    const commonRussianToEnglish: Record<string, string> = {
      'Главная': 'Home',
      'Профиль': 'Profile',
      'Бронирование': 'Booking',
      'История': 'History',
      'Выйти': 'Logout',
      'Студент': 'Student',
      'Охранник': 'Guard',
      'Администратор': 'Administrator',
      'Аудитория': 'Classroom',
      'Ключ': 'Key',
      'Забронировать': 'Book',
      'Доступные': 'Available',
      'Сохранить': 'Save',
      'Отменить': 'Cancel',
      'Подтвердить': 'Confirm',
      'Дашборд': 'Dashboard',
      'Настройки': 'Settings',
      'Пользователи': 'Users',
      'Аудитории': 'Rooms',
      'Мои бронирования': 'My Bookings',
      'Текущие брони': 'Current Bookings',
      'Управление ключами': 'Key Management',
      'Управление бронями': 'Booking Management',
      'Поиск': 'Search',
      'Фильтр': 'Filter',
      // Add more common words as needed
    };
    
    // Replace all occurrences of Russian words with English equivalents
    let translatedText = text;
    Object.entries(commonRussianToEnglish).forEach(([russian, english]) => {
      translatedText = translatedText.replace(new RegExp(russian, 'g'), english);
    });
    
    return translatedText;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateElement }}>
      {children}
    </LanguageContext.Provider>
  );
};
