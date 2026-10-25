import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, PlatformSettings } from '../types/index.ts';
import { Language, translations } from '../utils/i18n.ts';

export type ActiveView = 'home' | 'watch' | 'wallet' | 'studio' | 'admin' | 'history' | 'help';

interface AppContextType {
  currentUser: User | null;
  settings: PlatformSettings | null;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: typeof translations['fr'];
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  currentVideoId: string | null;
  openVideo: (videoId: string) => void;
  isBuyModalOpen: boolean;
  setIsBuyModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  switchUserRole: (userId: string) => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  updateUserCredits: (newCredits: number) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('videocredit_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });
  const [language, setLanguage] = useState<Language>('fr');
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>('vid_1');
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const t = translations[language];

  // Toggle dark/light class on document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('videocredit_theme', theme);
    } catch {}
  }, [theme]);

  // RTL handling for Arabic
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [language]);

  const showToast = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshCurrentUser = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching current user', err);
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings', err);
    }
  };

  const switchUserRole = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        showToast(`Connecté en tant que : ${data.user.name} (${data.user.role})`, 'success');
        if (data.user.role === 'admin' && activeView !== 'admin') {
          // Keep active view or let user navigate
        }
      }
    } catch (err) {
      console.error('Error switching user', err);
    }
  };

  const updateUserCredits = (newCredits: number) => {
    setCurrentUser((prev) => (prev ? { ...prev, credits: newCredits } : null));
  };

  const openVideo = (videoId: string) => {
    setCurrentVideoId(videoId);
    setActiveView('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    refreshCurrentUser();
    refreshSettings();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        settings,
        theme,
        setTheme,
        language,
        setLanguage,
        t,
        activeView,
        setActiveView,
        currentVideoId,
        openVideo,
        isBuyModalOpen,
        setIsBuyModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isUploadModalOpen,
        setIsUploadModalOpen,
        switchUserRole,
        refreshCurrentUser,
        refreshSettings,
        updateUserCredits,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-bounce backdrop-blur-md border border-neutral-700 bg-neutral-900/95 text-white">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === 'success'
                ? 'bg-emerald-500'
                : toast.type === 'error'
                ? 'bg-rose-500'
                : toast.type === 'warning'
                ? 'bg-amber-500'
                : 'bg-indigo-500'
            }`}
          />
          {toast.msg}
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
