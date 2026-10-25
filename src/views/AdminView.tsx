import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Shield,
  TrendingUp,
  DollarSign,
  Coins,
  Percent,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Users,
  Film,
  FileText,
  Phone,
  RefreshCw,
  Search,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { PaymentOrder, PayoutRequest, User, Video, AuditSecurityLog } from '../types/index.ts';

export const AdminView: React.FC = () => {
  const { currentUser, settings, refreshSettings, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<
    'FINANCE' | 'FLEXY' | 'PAYOUTS' | 'USERS' | 'VIDEOS' | 'SETTINGS' | 'LOGS'
  >('FINANCE');

  const [report, setReport] = useState<any>(null);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [logs, setLogs] = useState<AuditSecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Platform settings form state
  const [creditVal, setCreditVal] = useState(settings?.creditFiatValue || 0.1);
  const [creatorPct, setCreatorPct] = useState(settings?.creatorSharePercentage || 50);
  const [platformPct, setPlatformPct] = useState(settings?.platformSharePercentage || 50);
  const [flexyMob, setFlexyMob] = useState(settings?.flexyTargetMobilis || '0666496676');
  const [flexyDjz, setFlexyDjz] = useState(settings?.flexyTargetDjezzy || '0784145118');
  const [flexyOor, setFlexyOor] = useState(settings?.flexyTargetOoredoo || '0558953440');
  const [cryptoEvm, setCryptoEvm] = useState(
    settings?.cryptoEvmAddress || settings?.cryptoEthAddress || '0xCD150992C7db67571fe90211509B659826544Bf6'
  );
  const [adminEmail, setAdminEmail] = useState(settings?.adminEmail || 'lamechemounir@gmail.com');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [repRes, ordRes, payRes, usrRes, vidRes, logRes] = await Promise.all([
        fetch('/api/admin/financial-report'),
        fetch('/api/orders'),
        fetch('/api/admin/payouts'),
        fetch('/api/admin/users'),
        fetch('/api/admin/videos'),
        fetch('/api/admin/logs'),
      ]);

      const repData = await repRes.json();
      const ordData = await ordRes.json();
      const payData = await payRes.json();
      const usrData = await usrRes.json();
      const vidData = await vidRes.json();
      const logData = await logRes.json();

      if (repData.report) setReport(repData.report);
      if (ordData.orders) setOrders(ordData.orders);
      if (payData.payouts) setPayouts(payData.payouts);
      if (usrData.users) setUsers(usrData.users);
      if (vidData.videos) setVideos(vidData.videos);
      if (logData.logs) setLogs(logData.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: 'Approuvé par administrateur suite à vérification' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Paiement validé et crédits alloués avec succès !', 'success');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = window.prompt('Motif du rejet (Ex: Transfert non reçu sur la puce) :');
    if (!reason) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Commande rejetée', 'info');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessPayout = async (payoutId: string, action: 'APPROVE' | 'REJECT') => {
    let txId: string | undefined = undefined;
    let reason: string | undefined = undefined;

    if (action === 'APPROVE') {
      txId = window.prompt('Numéro de transaction / Hash de transfert :') || 'TX_' + Date.now();
    } else {
      reason = window.prompt('Motif du rejet du retrait :') || 'Coordonnées invalides';
    }

    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, txId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(action === 'APPROVE' ? 'Retrait validé et payé !' : 'Retrait rejeté (fonds restitués)', 'success');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, { method: 'POST' });
      const data = await res.json();
      if (data.user) {
        showToast(`Statut utilisateur modifié : ${data.user.status}`, 'info');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditFiatValue: Number(creditVal),
          creatorSharePercentage: Number(creatorPct),
          platformSharePercentage: Number(platformPct),
          flexyTargetMobilis: flexyMob,
          flexyTargetDjezzy: flexyDjz,
          flexyTargetOoredoo: flexyOor,
          cryptoEthAddress: cryptoEvm,
          cryptoEvmAddress: cryptoEvm,
          adminEmail: adminEmail,
        }),
      });
      const data = await res.json();
      if (data.settings) {
        showToast('Paramètres de monétisation enregistrés !', 'success');
        refreshSettings();
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingFlexyOrders = orders.filter(
    (o) => o.paymentMethod === 'FLEXY' && o.status === 'PENDING'
  );
  const pendingPayouts = payouts.filter((p) => p.status === 'PENDING');
  const flaggedVideos = videos.filter((v) => v.isFlagged);

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold">Panneau d'Administration VideoCredit</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Sécurisé
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Contrôle comptable 50/50, validation Flexy, validation des retraits et anti-fraude.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser les flux</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-200 dark:border-neutral-800">
        {[
          { id: 'FINANCE', label: 'Comptabilité 50/50', icon: TrendingUp },
          {
            id: 'FLEXY',
            label: 'Validation Flexy',
            icon: Phone,
            badge: pendingFlexyOrders.length,
          },
          {
            id: 'PAYOUTS',
            label: 'Retraits Créateurs',
            icon: DollarSign,
            badge: pendingPayouts.length,
          },
          { id: 'USERS', label: 'Utilisateurs & Sécurité', icon: Users },
          {
            id: 'VIDEOS',
            label: 'Modération Vidéos',
            icon: Film,
            badge: flaggedVideos.length > 0 ? flaggedVideos.length : undefined,
          },
          { id: 'SETTINGS', label: 'Configuration & Packs', icon: Sliders },
          { id: 'LOGS', label: 'Journaux d’Audit', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: FINANCIAL 50/50 LEDGER */}
      {activeTab === 'FINANCE' && report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                Crédits Vendus
              </span>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">
                {report.totalCreditsSold.toLocaleString()} cr
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Total CA Brut : ${report.totalGrossRevenueFiat.toFixed(2)} USD
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                Minutes Visionnées
              </span>
              <div className="text-2xl font-black text-emerald-500">
                {report.totalMinutesWatched.toLocaleString()} min
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                1 crédit consommé / minute active
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 to-indigo-950 text-white shadow-lg border border-indigo-700/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Part Plateforme (50%)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                  Net Réalisé
                </span>
              </div>
              <div className="text-3xl font-black text-white">
                ${report.totalPlatformRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-indigo-200 mt-1">
                Revenu net enregistré à la minute
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-lg border border-emerald-700/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Part Créateurs (50%)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                  Pool Distribué
                </span>
              </div>
              <div className="text-3xl font-black text-white">
                ${report.totalCreatorRevenueEarned.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-200 mt-1">
                Reversé directement aux vidéastes
              </div>
            </div>
          </div>

          {/* Unconsumed Credits Liability Box */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Engagement crédits en circulation (Dette différée spectateurs)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Crédits achetés par les utilisateurs et non encore consommés en visionnage.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-neutral-900 dark:text-white">
                {report.totalActiveUserCredits} crédits (~${report.unearnedCreditLiabilityFiat} USD)
              </div>
              <div className="text-[10px] text-emerald-500 font-semibold">
                Provision comptable saine
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLEXY APPROVAL QUEUE (ALGERIA) */}
      {activeTab === 'FLEXY' && (
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Commandes Flexy soumises par les spectateurs
              </h3>
              <p className="text-xs text-neutral-500">
                Vérifiez la réception du transfert Flexy sur la puce officielle avant de valider l'attribution des crédits.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
              {pendingFlexyOrders.length} en attente
            </span>
          </div>

          {orders.filter((o) => o.paymentMethod === 'FLEXY').length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500">
              Aucune commande Flexy enregistrée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Commande</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Utilisateur</th>
                    <th className="py-2.5 px-3">Opérateur & Expéditeur</th>
                    <th className="py-2.5 px-3">Réf SMS / Transaction</th>
                    <th className="py-2.5 px-3">Crédits</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3 text-right">Action Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                  {orders
                    .filter((o) => o.paymentMethod === 'FLEXY')
                    .map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                          {ord.id}
                        </td>
                        <td className="py-3 px-3 text-neutral-500">
                          {new Date(ord.createdAt).toLocaleDateString('fr-FR')} {new Date(ord.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                          {ord.userName}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-indigo-500">{ord.flexyDetails?.operator}</span> •{' '}
                          <span className="font-mono">{ord.flexyDetails?.senderPhoneNumber}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-700 dark:text-neutral-300">
                          {ord.flexyDetails?.transactionReference}
                          {ord.flexyDetails?.receiptNote && (
                            <div className="text-[10px] text-neutral-400 italic">
                              "{ord.flexyDetails.receiptNote}"
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold font-mono text-emerald-500">
                          +{ord.credits} cr
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'CONFIRMED'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : ord.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {ord.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleConfirmOrder(ord.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Valider & Créditer</span>
                              </button>
                              <button
                                onClick={() => handleRejectOrder(ord.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 font-bold text-[11px]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-400">Traité</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREATOR PAYOUTS QUEUE */}
      {activeTab === 'PAYOUTS' && (
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Demandes de retrait créateurs (Flexy uniquement)
              </h3>
              <p className="text-xs text-neutral-500">
                Paiement direct par transfert de crédit téléphonique Flexy (Mobilis, Djezzy, Ooredoo)
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
              {pendingPayouts.length} en attente
            </span>
          </div>

          {payouts.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500">
              Aucune demande de retrait.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">ID Retrait</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Créateur</th>
                    <th className="py-2.5 px-3">Opérateur & Numéro</th>
                    <th className="py-2.5 px-3">Montant à transférer</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3 text-right">Action Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                  {payouts.map((pay) => (
                    <tr key={pay.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                        {pay.id}
                      </td>
                      <td className="py-3 px-3 text-neutral-500">
                        {new Date(pay.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                        {pay.creatorName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          📱 Flexy {pay.operator || 'Mobilis'}
                        </span>
                        <div className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                          {pay.phoneNumber || pay.accountDetails}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                        ${pay.amount.toFixed(2)} USD
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-[11px]">
                          (~{pay.amountDzd || Math.round(pay.amount * 150)} DZD Flexy)
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pay.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : pay.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {pay.status === 'PAID' ? 'Transféré ✓' : pay.status === 'PENDING' ? 'À envoyer' : 'Rejeté'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {pay.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleProcessPayout(pay.id, 'APPROVE')}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Flexy Envoyé</span>
                            </button>
                            <button
                              onClick={() => handleProcessPayout(pay.id, 'REJECT')}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 font-bold text-[11px]"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {pay.txId ? `Réf: ${pay.txId}` : 'Traité'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS & ANTI-FRAUD */}
      {activeTab === 'USERS' && (
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Gestion des utilisateurs & Comptes
              </h3>
              <p className="text-xs text-neutral-500">
                Surveillance des soldes et suspension des comptes suspects
              </p>
            </div>
            <div className="text-xs text-neutral-400">{users.length} comptes inscrits</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Utilisateur</th>
                  <th className="py-2.5 px-3">Rôle</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Solde Crédits</th>
                  <th className="py-2.5 px-3">Gains Créateur (50%)</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Anti-Fraude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-bold text-neutral-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize font-semibold text-neutral-700 dark:text-neutral-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-mono">{u.email}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-500">
                      {u.credits} cr
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                      ${u.creatorEarnings.totalEarned.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          u.status === 'active'
                            ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.status === 'active' ? 'Geler le compte' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: VIDEO MODERATION */}
      {activeTab === 'VIDEOS' && (
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Modération & Signalements de contenu
              </h3>
              <p className="text-xs text-neutral-500">
                Surveillance du catalogue et traitement des signalements utilisateurs
              </p>
            </div>
            {flaggedVideos.length > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                {flaggedVideos.length} vidéo(s) signalée(s)
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Vidéo</th>
                  <th className="py-2.5 px-3">Créateur</th>
                  <th className="py-2.5 px-3">Vues & Minutes</th>
                  <th className="py-2.5 px-3">Signalement</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                {videos.map((vid) => (
                  <tr key={vid.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-14 aspect-video rounded-lg object-cover"
                        />
                        <span className="font-bold text-neutral-900 dark:text-white max-w-xs truncate">
                          {vid.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      {vid.creatorName}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {vid.views} vues • {vid.paidMinutes} min
                    </td>
                    <td className="py-3 px-3">
                      {vid.isFlagged ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500">
                          {vid.flagReason || 'Signalée'}
                        </span>
                      ) : (
                        <span className="text-neutral-400">Aucun</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {vid.isFlagged && (
                        <button
                          onClick={async () => {
                            await fetch(`/api/videos/${vid.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ isFlagged: false }),
                            });
                            showToast('Signalement levé', 'info');
                            fetchAdminData();
                          }}
                          className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold"
                        >
                          Lever le signalement
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS & PACKS CONFIGURATION */}
      {activeTab === 'SETTINGS' && (
        <form
          onSubmit={handleSaveSettings}
          className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6"
        >
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Configuration de la monétisation et des passerelles
            </h3>
            <p className="text-xs text-neutral-500">
              Règles économiques globales appliquées côté serveur
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Valeur fiat d'un crédit (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={creditVal}
                onChange={(e) => setCreditVal(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Ex: $0.10 / min = $6.00 / heure
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Partage Créateur (%)
              </label>
              <input
                type="number"
                min="10"
                max="90"
                value={creatorPct}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCreatorPct(val);
                  setPlatformPct(100 - val);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Partage Plateforme (%)
              </label>
              <input
                type="number"
                disabled
                value={platformPct}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 font-mono text-sm opacity-80"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
              Numéros de téléphone officiels Flexy (Algérie)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Puce Mobilis
                </label>
                <input
                  type="text"
                  value={flexyMob}
                  onChange={(e) => setFlexyMob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Puce Djezzy
                </label>
                <input
                  type="text"
                  value={flexyDjz}
                  onChange={(e) => setFlexyDjz(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Puce Ooredoo
                </label>
                <input
                  type="text"
                  value={flexyOor}
                  onChange={(e) => setFlexyOor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
              Passerelle Crypto EVM & Contact Administrateur
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Adresse EVM de réception (ETH, Polygon, BSC, USDT ERC-20)
                </label>
                <input
                  type="text"
                  value={cryptoEvm}
                  onChange={(e) => setCryptoEvm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono select-all"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Supporte tous les réseaux EVM compatibles Ethereum
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Email Administrateur Principal
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Utilisé pour les alertes de sécurité et la comptabilité
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
          >
            Enregistrer la configuration globale
          </button>
        </form>
      )}

      {/* TAB 7: SECURITY & AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Journaux d'Audit & Sécurité (Anti-Fraude)
            </h3>
            <p className="text-xs text-neutral-500">
              Traces d'exécution des sessions de visionnage, vérification des dérives et approbations financières.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        log.severity === 'ALERT'
                          ? 'bg-rose-500/15 text-rose-500'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-500'
                          : 'bg-indigo-500/15 text-indigo-500'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                  <div className="text-neutral-800 dark:text-neutral-200">{log.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
