import { createContext, useContext, useState, ReactNode } from 'react';
import { LanguageCode, t } from './translations';

// Define the context types
type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  translate: (key: Parameters<typeof t>[0]) => string;
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the provider props
type LanguageProviderProps = {
  children: ReactNode;
  initialLanguage?: LanguageCode;
};

// Create a provider component
export function LanguageProvider({ children, initialLanguage = 'en' }: LanguageProviderProps) {
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);

  // Helper function to get translations based on current language
  const translate = (key: Parameters<typeof t>[0]) => t(key, language);

  // Value for the context provider
  const value = {
    language,
    setLanguage,
    translate
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}