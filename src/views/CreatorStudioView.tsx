import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Video, PayoutRequest } from '../types/index.ts';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Coins,
  ArrowDownToLine,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Percent,
  Play,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

export const CreatorStudioView: React.FC = () => {
  const { currentUser, refreshCurrentUser, showToast, setIsUploadModalOpen, openVideo } = useApp();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Payout Modal state (Retrait exclusivement par Flexy)
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(10);
  const [payoutOperator, setPayoutOperator] = useState<'Mobilis' | 'Djezzy' | 'Ooredoo'>('Mobilis');
  const [creatorPhone, setCreatorPhone] = useState('0665123456');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Channel edit state
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [channelName, setChannelName] = useState(currentUser?.channelName || currentUser?.name || '');
  const [channelDesc, setChannelDesc] = useState(currentUser?.channelDescription || '');

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/creator/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || !creatorPhone.trim()) {
      showToast('Veuillez renseigner votre numéro de téléphone Flexy et le montant.', 'warning');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await fetch('/api/creator/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(payoutAmount),
          method: 'FLEXY',
          operator: payoutOperator,
          phoneNumber: creatorPhone.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Demande de retrait Flexy transmise à l’administrateur !', 'success');
        setIsPayoutModalOpen(false);
        await fetchAnalytics();
        await refreshCurrentUser();
      } else {
        showToast(data.error || 'Erreur lors de la demande de retrait Flexy', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur serveur', 'error');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette vidéo ?')) return;
    try {
      const res = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Vidéo supprimée', 'info');
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          channelDescription: channelDesc,
        }),
      });
      const data = await res.json();
      if (data.user) {
        showToast('Informations de votre chaîne mises à jour !', 'success');
        setIsEditingChannel(false);
        refreshCurrentUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const earnings = currentUser?.creatorEarnings || {
    totalEarned: 0,
    available: 0,
    pending: 0,
    totalWithdrawn: 0,
  };

  const minWithdrawal = analytics?.minWithdrawalThreshold || 20;

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-6xl mx-auto">
      {/* 1. CHANNEL HEADER BANNER */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <div
          className="h-36 sm:h-48 bg-gradient-to-r from-indigo-900 via-neutral-900 to-indigo-950 bg-cover bg-center relative"
          style={{
            backgroundImage: currentUser?.channelBanner
              ? `url(${currentUser.channelBanner})`
              : undefined,
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs" />
        </div>

        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 -mt-12 sm:-mt-14 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-xl"
            />
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{currentUser?.channelName || currentUser?.name}</span>
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-lg">
                {currentUser?.channelDescription || 'Créateur partenaire sur VideoCredit'}
              </p>
              <div className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />
                <span>Rémunération active : 50% sur chaque minute payée</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingChannel(!isEditingChannel)}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {isEditingChannel ? 'Fermer l’éditeur' : 'Modifier ma chaîne'}
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Upload className="w-4 h-4" />
              <span>Publier une vidéo</span>
            </button>
          </div>
        </div>

        {/* Channel Edit Form */}
        {isEditingChannel && (
          <form onSubmit={handleUpdateChannel} className="p-6 border-t border-neutral-200 dark:border-neutral-800 space-y-4 bg-neutral-50/50 dark:bg-neutral-800/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Nom public de la chaîne
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Bio / Description
                </label>
                <input
                  type="text"
                  value={channelDesc}
                  onChange={(e) => setChannelDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold"
            >
              Enregistrer les modifications
            </button>
          </form>
        )}
      </div>

      {/* 2. REVENUE METRICS & WITHDRAWAL (50/50) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available for Withdrawal */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                Solde Retirable
              </span>
              <div className="p-1.5 rounded-lg bg-white/20">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black mb-1">${earnings.available.toFixed(2)}</div>
            <div className="text-[11px] text-indigo-100">Prêt pour transfert immédiat</div>
          </div>
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={earnings.available < minWithdrawal}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-60 text-xs font-bold shadow transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Demander un retrait</span>
          </button>
        </div>

        {/* Total Earned */}
        <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Revenus Totaux (50%)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mb-1">
            ${earnings.totalEarned.toFixed(2)}
          </div>
          <p className="text-[11px] text-neutral-500">
            Total généré depuis l'inscription par minute de lecture.
          </p>
        </div>

        {/* Pending Clearance */}
        <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              En cours de validation
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mb-1">
            ${earnings.pending.toFixed(2)}
          </div>
          <p className="text-[11px] text-neutral-500">
            Demandes de virement en attente de traitement.
          </p>
        </div>

        {/* Total Paid Minutes */}
        <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Minutes Rémunérées
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mb-1">
            {analytics?.totalPaidMinutes ?? 0} min
          </div>
          <p className="text-[11px] text-neutral-500">
            Cumul des minutes entières visionnées et facturées.
          </p>
        </div>
      </div>

      {/* 3. VIDEOS MANAGEMENT TABLE */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Vidéos publiées & Rémunération par vidéo
            </h3>
            <p className="text-xs text-neutral-500">
              Chaque minute visionnée vous rapporte directement $0.05 USD
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            + Ajouter une vidéo
          </button>
        </div>

        {(!analytics?.videos || analytics.videos.length === 0) ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            Vous n'avez pas encore publié de vidéo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Vidéo</th>
                  <th className="py-2.5 px-3">Catégorie</th>
                  <th className="py-2.5 px-3">Vues</th>
                  <th className="py-2.5 px-3">Minutes Payées</th>
                  <th className="py-2.5 px-3">Revenus Générés (50%)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                {analytics.videos.map((vid: Video) => (
                  <tr key={vid.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-16 aspect-video rounded-lg object-cover"
                        />
                        <div className="font-bold text-neutral-900 dark:text-white max-w-xs truncate">
                          {vid.title}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-neutral-500">{vid.category}</td>
                    <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                      {vid.views} vues
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {vid.paidMinutes} min
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                      ${(vid.paidMinutes * 0.05).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openVideo(vid.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-500 hover:bg-indigo-500/10"
                          title="Visionner"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. PAYOUTS HISTORY TABLE */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Historique des demandes de retrait
            </h3>
            <p className="text-xs text-neutral-500">
              Virements USDT (TRC-20), BaridiMob Algérie et virements bancaires
            </p>
          </div>
        </div>

        {(!analytics?.payouts || analytics.payouts.length === 0) ? (
          <div className="text-center py-6 text-neutral-500 text-xs">
            Aucun retrait demandé pour l'instant.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">ID Retrait</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Opérateur Flexy</th>
                  <th className="py-2.5 px-3">Numéro Bénéficiaire</th>
                  <th className="py-2.5 px-3">Montant Retiré</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                {analytics.payouts.map((pay: PayoutRequest) => (
                  <tr key={pay.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                      {pay.id}
                    </td>
                    <td className="py-3 px-3 text-neutral-500">
                      {new Date(pay.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        📱 Flexy {pay.operator || 'Mobilis'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-800 dark:text-neutral-200">
                      {pay.phoneNumber || pay.accountDetails}
                    </td>
                    <td className="py-3 px-3 font-bold font-mono text-neutral-900 dark:text-white">
                      ${pay.amount.toFixed(2)} USD
                      <span className="text-[10px] text-neutral-400 font-normal block">
                        (~{pay.amountDzd || Math.round(pay.amount * 150)} DZD)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          pay.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : pay.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        }`}
                      >
                        {pay.status === 'PAID'
                          ? 'Transféré ✓'
                          : pay.status === 'PENDING'
                          ? 'En attente'
                          : 'Rejeté'}
                      </span>
                      {pay.txId && (
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          Réf: {pay.txId}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WITHDRAWAL REQUEST MODAL (FLEXY UNIQUEMENT) */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  📱
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    Demande de retrait (Flexy uniquement)
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Versement direct de vos gains sur votre puce téléphonique
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-900 dark:text-emerald-300 text-xs space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>Solde disponible : ${earnings.available.toFixed(2)} USD</span>
                  <span className="text-[11px] font-mono">
                    (~{Math.round(earnings.available * 150)} DZD)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                  Le retrait se fait <strong>uniquement en recharge Flexy</strong> envoyée par
                  l'administrateur vers votre numéro Mobilis, Djezzy ou Ooredoo.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  1. Opérateur mobile
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Mobilis', 'Djezzy', 'Ooredoo'] as const).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setPayoutOperator(op)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        payoutOperator === op
                          ? 'bg-emerald-600 text-white border-transparent shadow'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  2. Numéro de téléphone à créditer ({payoutOperator})
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 0665 12 34 56 ou 0770 12 34 56"
                  value={creatorPhone}
                  onChange={(e) => setCreatorPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    3. Montant à retirer
                  </label>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Équivalent : ~{Math.round(payoutAmount * 150)} DZD Flexy
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-400 font-bold">$</span>
                  <input
                    type="number"
                    step="1"
                    min={minWithdrawal || 5}
                    max={earnings.available}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono font-bold text-sm"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Seuil minimum : ${minWithdrawal || 5}.00 USD (~{Math.round((minWithdrawal || 5) * 150)} DZD)
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout || payoutAmount > earnings.available}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
                >
                  {isSubmittingPayout ? 'Transmission...' : `Valider la demande (~${Math.round(payoutAmount * 150)} DZD)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
