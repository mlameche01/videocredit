import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { BuyCreditsModal } from './components/BuyCreditsModal.tsx';
import { UploadVideoModal } from './components/UploadVideoModal.tsx';

import { HomeView } from './views/HomeView.tsx';
import { WatchView } from './views/WatchView.tsx';
import { WalletView } from './views/WalletView.tsx';
import { CreatorStudioView } from './views/CreatorStudioView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { HistoryView } from './views/HistoryView.tsx';
import { HelpView } from './views/HelpView.tsx';

const AppContent: React.FC = () => {
  const { activeView } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Global Header */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onCloseMobile={() => setIsSidebarOpen(false)} />

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeView === 'home' && <HomeView />}
          {activeView === 'watch' && <WatchView />}
          {activeView === 'wallet' && <WalletView />}
          {activeView === 'studio' && <CreatorStudioView />}
          {activeView === 'admin' && <AdminView />}
          {activeView === 'history' && <HistoryView />}
          {activeView === 'help' && <HelpView />}
        </main>
      </div>

      {/* Global Modals */}
      <BuyCreditsModal />
      <UploadVideoModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
