import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/languageContext";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="w-10 h-8"
      >
        EN
      </Button>
      <Button
        variant={language === 'fr' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('fr')}
        className="w-10 h-8"
      >
        FR
      </Button>
    </div>
  );
}