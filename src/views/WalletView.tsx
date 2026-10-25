import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { LedgerEntry, PaymentOrder } from '../types/index.ts';
import {
  Coins,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Filter,
  CheckCircle2,
  AlertCircle,
  Percent,
} from 'lucide-react';

export const WalletView: React.FC = () => {
  const { currentUser, setIsBuyModalOpen, settings, refreshCurrentUser } = useApp();
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchWalletData = async () => {
    try {
      const [ledgerRes, ordersRes] = await Promise.all([
        fetch('/api/ledger'),
        fetch('/api/orders'),
      ]);
      const ledgerData = await ledgerRes.json();
      const ordersData = await ordersRes.json();
      if (ledgerData.ledger) setLedger(ledgerData.ledger);
      if (ordersData.orders) setOrders(ordersData.orders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const creditValue = settings?.creditFiatValue || 0.1;
  const currentCredits = currentUser?.credits ?? 0;
  const estimatedHours = Math.floor(currentCredits / 60);
  const estimatedMins = currentCredits % 60;
  const fiatEquivalent = (currentCredits * creditValue).toFixed(2);

  const filteredLedger = ledger.filter((entry) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PURCHASES') return entry.type === 'CREDIT_PURCHASE';
    if (filterType === 'WATCH') return entry.type === 'MINUTE_DEBIT';
    return true;
  });

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-6xl mx-auto">
      {/* 1. WALLET TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main Balance Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Solde de crédits disponible
            </span>
            <div className="p-2 rounded-xl bg-white/15">
              <Coins className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-1 mb-6">
            <div className="text-4xl font-black tracking-tight flex items-baseline gap-2">
              <span>{currentCredits}</span>
              <span className="text-lg font-semibold text-emerald-200">Crédits</span>
            </div>
            <div className="text-xs text-emerald-100 font-medium">
              Valeur équivalente : ~${fiatEquivalent} USD ({settings?.platformName})
            </div>
          </div>

          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Recharger mon solde (Crypto / Flexy)</span>
          </button>
        </div>

        {/* Watch Time Equivalent */}
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Temps de visionnage
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-1">
              {estimatedHours}h {estimatedMins}min
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Consommation exacte : 1 crédit par minute active de lecture. La mise en pause arrête
              immédiatement le décompte.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Calcul certifié côté serveur</span>
          </div>
        </div>

        {/* Revenue Split Guarantee Card */}
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Partage équitable
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-1">
              50% / 50%
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Pour chaque crédit consommé, 50% revient directement au créateur de la vidéo, sans
              intermédiaire opaque.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400">
            Écriture comptable double-entrée non modifiable
          </div>
        </div>
      </div>

      {/* 2. RECENT PURCHASES & RECHARGES TABLE */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Dernières commandes de crédits
            </h3>
            <p className="text-xs text-neutral-500">
              Suivi en temps réel des dépôts Cryptomonnaies et Flexy
            </p>
          </div>
          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            + Nouvelle recharge
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-6 text-xs text-neutral-400">
            Aucune commande de recharge pour l'instant.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">ID Commande</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Pack & Crédits</th>
                  <th className="py-2.5 px-3">Méthode</th>
                  <th className="py-2.5 px-3">Montant</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                      {ord.id}
                    </td>
                    <td className="py-3 px-3 text-neutral-500">
                      {new Date(ord.createdAt).toLocaleDateString('fr-FR')} {new Date(ord.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{ord.credits} crédits
                      </span>
                      <div className="text-[10px] text-neutral-400">{ord.packName}</div>
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                      {ord.paymentMethod === 'CRYPTO' ? (
                        <span>₿ Crypto ({ord.cryptoDetails?.cryptoCurrency} {ord.cryptoDetails?.network})</span>
                      ) : (
                        <span>📱 Flexy ({ord.flexyDetails?.operator})</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-neutral-900 dark:text-white">
                      ${ord.amountFiat.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : ord.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        }`}
                      >
                        {ord.status === 'CONFIRMED'
                          ? 'Confirmé ✓'
                          : ord.status === 'PENDING'
                          ? 'En attente'
                          : 'Rejeté'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. COMPLETE AUDITABLE FINANCIAL LEDGER */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Grand livre des transactions (Ledger)
            </h3>
            <p className="text-xs text-neutral-500">
              Historique inaltérable de tous les débits par minute et des crédits achetés
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterType('WATCH')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'WATCH'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              Visionnages
            </button>
            <button
              onClick={() => setFilterType('PURCHASES')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'PURCHASES'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              Achats
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Date & Heure</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Impact Crédits</th>
                <th className="py-2.5 px-3 text-right">Valeur Fiat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
              {filteredLedger.map((entry) => (
                <tr key={entry.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <td className="py-3 px-3 text-neutral-500 font-mono text-[11px]">
                    {new Date(entry.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.type === 'CREDIT_PURCHASE'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : entry.type === 'MINUTE_DEBIT'
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}
                    >
                      {entry.type === 'CREDIT_PURCHASE' && <ArrowDownLeft className="w-3 h-3" />}
                      {entry.type === 'MINUTE_DEBIT' && <ArrowUpRight className="w-3 h-3" />}
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-800 dark:text-neutral-200">
                    <div>{entry.description}</div>
                    {entry.videoTitle && (
                      <div className="text-[10px] text-neutral-400">Vidéo : {entry.videoTitle}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold font-mono">
                    {entry.creditDelta > 0 ? (
                      <span className="text-emerald-500">+{entry.creditDelta} cr</span>
                    ) : entry.creditDelta < 0 ? (
                      <span className="text-rose-500">{entry.creditDelta} cr</span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white">
                    ${entry.amountFiat.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
