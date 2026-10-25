import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Home,
  Compass,
  Wallet,
  History,
  Clapperboard,
  ShieldAlert,
  HelpCircle,
  Coins,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onCloseMobile: () => void }> = ({
  isOpen,
  onCloseMobile,
}) => {
  const { activeView, setActiveView, currentUser, t, setIsBuyModalOpen } = useApp();

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'wallet', label: t.wallet, icon: Wallet, badge: `${currentUser?.credits ?? 0} cr` },
    { id: 'history', label: t.history, icon: History },
    {
      id: 'studio',
      label: t.studio,
      icon: Clapperboard,
      sub: 'Part 50%',
      show: true,
    },
    {
      id: 'admin',
      label: t.adminRole,
      icon: ShieldAlert,
      sub: 'Compta 50/50',
      show: true,
    },
    { id: 'help', label: t.help, icon: HelpCircle },
  ];

  const handleNav = (viewId: any) => {
    setActiveView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.sub && !item.badge && (
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {item.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Credit Info Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-neutral-900 border border-indigo-500/20 text-white shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" /> Modèle Équitable
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                50 / 50
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-3">
              1 minute = 1 crédit. 50% reversé au créateur, 50% pour la plateforme. Zéro pub intrusive.
            </p>
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Coins className="w-3.5 h-3.5" />
              Recharger des crédits
            </button>
          </div>
        </div>

        {/* User Info footer */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 px-2">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-9 h-9 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                {currentUser?.name}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <span className="capitalize">{currentUser?.role}</span> •{' '}
                <span className="text-emerald-500 font-bold">{currentUser?.credits} cr</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
