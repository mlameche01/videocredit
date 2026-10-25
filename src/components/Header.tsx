import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Coins,
  Search,
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  Video as VideoIcon,
  Shield,
  Wallet,
  Menu,
  ChevronDown,
  Sparkles,
  PlaySquare,
} from 'lucide-react';
import { Language } from '../utils/i18n.ts';

export const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    switchUserRole,
    settings,
    theme,
    setTheme,
    language,
    setLanguage,
    t,
    setActiveView,
    setIsBuyModalOpen,
    setIsUploadModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('home');
    }
  };

  const isLowBalance = (currentUser?.credits ?? 0) <= 3;

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b backdrop-blur-md transition-colors bg-white/90 border-neutral-200 dark:bg-neutral-900/90 dark:border-neutral-800">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 max-w-7xl mx-auto gap-2 sm:gap-4">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <PlaySquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
                  {settings?.platformName || 'VideoCredit'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  1 Min = 1 Cr
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          </div>
        </form>

        {/* Right: Actions, Balance Badge, Role Switcher, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Credit Balance Badge & Quick Top Up */}
          <div className="flex items-center">
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all border shadow-sm ${
                isLowBalance
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20 hover:scale-[1.02]'
              }`}
              title="Cliquer pour recharger vos crédits"
            >
              <Coins className="w-4 h-4 text-emerald-500" />
              <span>
                {currentUser?.credits ?? 0} <span className="hidden sm:inline">{t.credits}</span>
              </span>
              <span className="hidden xs:inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-600 text-white">
                + {t.buyCredits}
              </span>
            </button>
          </div>

          {/* Quick Demo Switcher (Crucial for testing Viewer vs Creator vs Admin) */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all"
              title="Changer de rôle pour tester la plateforme"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden lg:inline text-neutral-500 dark:text-neutral-400">Rôle :</span>
              <span className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                {currentUser?.role === 'viewer'
                  ? t.viewer
                  : currentUser?.role === 'creator'
                  ? t.creator
                  : t.adminRole}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl p-2 z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Tester les perspectives
                </div>
                <button
                  onClick={() => {
                    switchUserRole('usr_viewer_1');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  <UserIcon className="w-4 h-4 text-sky-500" />
                  <div>
                    <div className="font-semibold">Karim Mansour (Spectateur)</div>
                    <div className="text-[10px] text-neutral-400">Solde crédits, lecteur, avis</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    switchUserRole('usr_creator_1');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  <VideoIcon className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-semibold">Amine DevLab (Créateur)</div>
                    <div className="text-[10px] text-neutral-400">Studio 50% revenus, retraits</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    switchUserRole('usr_admin_1');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  <Shield className="w-4 h-4 text-violet-500" />
                  <div>
                    <div className="font-semibold">Mounir Lamèche (Admin)</div>
                    <div className="text-[10px] text-neutral-400">lamechemounir@gmail.com • Validation Flexy</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Upload Button for creators/admins */}
          {(currentUser?.role === 'creator' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              title="Publier une vidéo"
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>Publier</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Changer de thème"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
              title="Langue / Language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">{language}</span>
            </button>
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl p-1 z-50">
                <button
                  onClick={() => {
                    setLanguage('fr');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium ${
                    language === 'fr' ? 'bg-indigo-500/10 text-indigo-500 font-bold' : ''
                  }`}
                >
                  🇫🇷 Français
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium ${
                    language === 'en' ? 'bg-indigo-500/10 text-indigo-500 font-bold' : ''
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium ${
                    language === 'ar' ? 'bg-indigo-500/10 text-indigo-500 font-bold' : ''
                  }`}
                >
                  🇩🇿 العربية
                </button>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div
            onClick={() => setActiveView(currentUser?.role === 'creator' ? 'studio' : 'wallet')}
            className="cursor-pointer flex items-center gap-2 pl-1 group"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 group-hover:ring-2 group-hover:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
