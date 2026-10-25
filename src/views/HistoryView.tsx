import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { LedgerEntry } from '../types/index.ts';
import { History, Clock, Coins, Play, Film } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { openVideo } = useApp();
  const [historyItems, setHistoryItems] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ledger')
      .then((res) => res.json())
      .then((data) => {
        if (data.ledger) {
          const watchEntries = data.ledger.filter((l: LedgerEntry) => l.type === 'MINUTE_DEBIT');
          setHistoryItems(watchEntries);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            Historique de visionnage & Minutes facturées
          </h1>
          <p className="text-xs text-neutral-500">
            Relevé exhaustif de chaque minute de contenu visionnée et débitée
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-400">Chargement de l'historique...</div>
      ) : historyItems.length === 0 ? (
        <div className="p-8 text-center rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 text-xs">
          Aucune vidéo visionnée pour l'instant. Choisissez une vidéo sur l'accueil pour tester le décompte en direct !
        </div>
      ) : (
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-white">
                    {item.videoTitle || 'Vidéo VideoCredit'}
                  </div>
                  <div className="text-neutral-500 flex items-center gap-2 mt-0.5">
                    <span>Créateur : {item.creatorName || 'Partenaire'}</span>
                    <span>•</span>
                    <span className="font-mono">{new Date(item.timestamp).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold font-mono text-rose-500 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> -1 crédit
                </span>
                {item.videoId && (
                  <button
                    onClick={() => openVideo(item.videoId!)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Revoir</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
