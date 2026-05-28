"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Settings, Sun, Moon, Monitor, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function PreferencesTab() {
  const t = useTranslations("AccountSettings");
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const themes = [
    {
      value: "light",
      label: t("ThemeLight"),
      description: t("ThemeLightDesc"),
      icon: <Sun className="h-5 w-5 text-amber-500" />,
      mockup: (
        <div className="w-full h-16 bg-zinc-50 border rounded-lg p-2 flex flex-col justify-between select-none">
          <div className="h-2 w-8 bg-zinc-300 rounded" />
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-zinc-200 rounded" />
            <div className="h-1.5 w-3/4 bg-zinc-200 rounded" />
          </div>
        </div>
      ),
    },
    {
      value: "dark",
      label: t("ThemeDark"),
      description: t("ThemeDarkDesc"),
      icon: <Moon className="h-5 w-5 text-indigo-400" />,
      mockup: (
        <div className="w-full h-16 bg-zinc-950 border border-zinc-800 rounded-lg p-2 flex flex-col justify-between select-none">
          <div className="h-2 w-8 bg-zinc-700 rounded" />
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-zinc-800 rounded" />
            <div className="h-1.5 w-3/4 bg-zinc-800 rounded" />
          </div>
        </div>
      ),
    },
    {
      value: "system",
      label: t("ThemeSystem"),
      description: t("ThemeSystemDesc"),
      icon: <Monitor className="h-5 w-5 text-teal-500" />,
      mockup: (
        <div className="w-full h-16 bg-zinc-100 dark:bg-zinc-900 border rounded-lg p-2 flex flex-col justify-between overflow-hidden relative select-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-950 border-l border-zinc-800" />
          <div className="relative z-10 h-2 w-8 bg-zinc-400 dark:bg-zinc-600 rounded" />
          <div className="relative z-10 space-y-1">
            <div className="h-1.5 w-full bg-zinc-300 dark:bg-zinc-800 rounded" />
            <div className="h-1.5 w-3/4 bg-zinc-300 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      ),
    },
  ];

  const languages = [
    { code: "vi", label: "Tiếng Việt", sub: "Vietnamese", flag: "🇻🇳" },
    { code: "en", label: "English", sub: "English", flag: "🇺🇸" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Card className="border border-border/80 shadow-md overflow-hidden bg-card/45 backdrop-blur-md">
        <CardHeader className="bg-muted/40 border-b border-border/50 py-4 px-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg font-bold">{t("Preferences")}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{t("PreferencesDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          {/* THEME SELECTION SECTION */}
          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
              {t("Appearance")}
            </Label>
            
            <div className="grid gap-4 sm:grid-cols-3">
              {themes.map((item) => {
                const isActive = theme === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTheme(item.value)}
                    className={`group text-left border rounded-2xl p-4 space-y-3 cursor-pointer transition-all duration-300 hover:shadow-md ${
                      isActive 
                        ? "border-primary bg-primary/[0.02] shadow-sm ring-1 ring-primary/30" 
                        : "border-border/80 bg-background/55 hover:border-border/50"
                    }`}
                  >
                    {/* Visual mockup of the theme */}
                    {item.mockup}
                    
                    {/* Details and check indicator */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-foreground flex items-center gap-1.5 select-none">
                          {item.icon}
                          {item.label}
                        </span>
                        <p className="text-xxs text-muted-foreground select-none">{item.description}</p>
                      </div>
                      
                      {isActive && (
                        <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow select-none">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-border/60" />
          
          {/* LANGUAGE SELECTION SECTION */}
          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
              {t("Language")}
            </Label>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              {languages.map((lang) => {
                const isActive = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onLanguageChange(lang.code)}
                    className={`flex-1 flex items-center justify-between border rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-sm ${
                      isActive 
                        ? "border-primary bg-primary/[0.02] shadow-sm ring-1 ring-primary/30" 
                        : "border-border/80 bg-background/55 hover:border-border/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">{lang.flag}</span>
                      <div className="text-left space-y-0.5">
                        <span className="font-bold text-sm text-foreground select-none">{lang.label}</span>
                        <p className="text-xxs text-muted-foreground select-none">{lang.sub}</p>
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow select-none">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
