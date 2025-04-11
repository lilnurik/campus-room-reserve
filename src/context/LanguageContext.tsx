import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '@/utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateElement: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ru',  // Default to Russian
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
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en' || savedLanguage === 'uz')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language);
    // When language changes, update all text elements with translation attributes
    translatePageContent();

    // Force re-render of components by updating document language
    document.documentElement.lang = language;

    console.log("Language changed to:", language); // Debug log
  }, [language]);

  // Translate function for keys in the translations object
  const t = (key: string): string => {
    if (!key) return '';

    const keys = key.split('.');
    let result: any = translations[language];

    if (!result) {
      console.warn(`No translations found for language: ${language}`);
      return key;
    }

    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  };

  // Function to translate arbitrary text
  const translateElement = (text: string): string => {
    if (!text) return '';

    // If current language is Russian, return original text
    if (language === 'ru') return text;

    // Check if we have a translation for this text in our dictionary
    for (const key in translations.ru) {
      const ruSection = translations.ru[key];
      if (typeof ruSection === 'object') {
        for (const subKey in ruSection) {
          if (ruSection[subKey] === text && translations[language]?.[key]?.[subKey]) {
            return translations[language][key][subKey];
          }
        }
      } else if (ruSection === text && translations[language]?.[key]) {
        return translations[language][key];
      }
    }

    // If no translation is found, use a basic fallback replacement
    return replaceCommonWords(text, language);
  };

  // Function to translate the entire page content
  const translatePageContent = () => {
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
        } else {
          // Translate to selected language
          const translatedText = translateElement(originalText);
          element.textContent = translatedText;
        }
      }
    });
  };

  // Simple dictionary replacement for common words
  const replaceCommonWords = (text: string, targetLang: Language): string => {
    if (targetLang === 'ru') return text;

    const commonRussianToOther: Record<string, Partial<Record<Language, string>>> = {
      'Главная': { en: 'Home', uz: 'Asosiy', ru: 'Главная' },
      'Профиль': { en: 'Profile', uz: 'Profil', ru: 'Профиль' },
      'Бронирование': { en: 'Booking', uz: 'Bron qilish', ru: 'Бронирование' },
      'История': { en: 'History', uz: 'Tarix', ru: 'История' },
      'Выйти': { en: 'Logout', uz: 'Chiqish', ru: 'Выйти' },
      'Студент': { en: 'Student', uz: 'Talaba', ru: 'Студент' },
      'Охранник': { en: 'Guard', uz: 'Qorovul', ru: 'Охранник' },
      'Администратор': { en: 'Administrator', uz: 'Administrator', ru: 'Администратор' },
      'Аудитория': { en: 'Classroom', uz: 'Auditoriya', ru: 'Аудитория' },
      'Ключ': { en: 'Key', uz: 'Kalit', ru: 'Ключ' },
      'Войти': { en: 'Login', uz: 'Kirish', ru: 'Войти' },
      'Зарегистрироваться': { en: 'Register', uz: 'Ro\'yxatdan o\'tish', ru: 'Зарегистрироваться' },
      // Plus all the other existing translations
    };

    let translatedText = text;
    Object.entries(commonRussianToOther).forEach(([russian, translations]) => {
      if (translations[targetLang]) {
        translatedText = translatedText.replace(
            new RegExp(russian, 'g'),
            translations[targetLang]!
        );
      }
    });

    return translatedText;
  };

  return (
      <LanguageContext.Provider value={{ language, setLanguage, t, translateElement }}>
        {children}
      </LanguageContext.Provider>
  );
};