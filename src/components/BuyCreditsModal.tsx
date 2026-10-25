import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CreditPack, PaymentOrder } from '../types/index.ts';
import {
  X,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Clock,
  ExternalLink,
  Phone,
  AlertCircle,
  Zap,
  ArrowRight,
  RefreshCw,
  QrCode,
} from 'lucide-react';

export const BuyCreditsModal: React.FC = () => {
  const {
    isBuyModalOpen,
    setIsBuyModalOpen,
    currentUser,
    refreshCurrentUser,
    showToast,
    settings,
  } = useApp();

  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CRYPTO' | 'FLEXY'>('CRYPTO');

  // Crypto form state
  const [cryptoCurrency, setCryptoCurrency] = useState<'USDT' | 'BTC' | 'ETH'>('USDT');
  const [cryptoNetwork, setCryptoNetwork] = useState<'TRC20' | 'ERC20' | 'Bitcoin'>('TRC20');

  // Flexy form state
  const [operator, setOperator] = useState<'Mobilis' | 'Djezzy' | 'Ooredoo'>('Mobilis');
  const [senderPhone, setSenderPhone] = useState('');
  const [flexyReference, setFlexyReference] = useState('');
  const [receiptNote, setReceiptNote] = useState('');

  // Active created order
  const [activeOrder, setActiveOrder] = useState<PaymentOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 mins

  // Fetch packs
  useEffect(() => {
    if (isBuyModalOpen) {
      fetch('/api/packs')
        .then((res) => res.json())
        .then((data) => {
          if (data.packs) {
            setPacks(data.packs);
            if (!selectedPack && data.packs.length > 1) {
              // Default to standard popular pack
              setSelectedPack(data.packs[1]);
            }
          }
        })
        .catch(console.error);
    }
  }, [isBuyModalOpen]);

  // Order countdown timer
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'PENDING') return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeOrder]);

  if (!isBuyModalOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateCryptoOrder = async () => {
    if (!selectedPack) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: selectedPack.id,
          cryptoCurrency,
          network: cryptoNetwork,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(data.order);
        setTimeRemaining(900);
        showToast('Commande Crypto initialisée. Veuillez effectuer le transfert.', 'info');
      } else {
        showToast(data.error || 'Erreur lors de la création de la commande', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur réseau', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateCryptoConfirm = async () => {
    if (!activeOrder) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${activeOrder.id}/simulate-crypto-confirm`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(data.order);
        await refreshCurrentUser();
        showToast(`Paiement confirmé ! ${data.order.credits} crédits ont été ajoutés à votre compte.`, 'success');
      } else {
        showToast(data.error || 'Erreur lors de la validation', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFlexyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPack) return;
    if (!senderPhone || !flexyReference) {
      showToast('Veuillez remplir le numéro expéditeur et la référence de transaction.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders/flexy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: selectedPack.id,
          operator,
          senderPhoneNumber: senderPhone,
          transactionReference: flexyReference,
          receiptNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(data.order);
        showToast(data.message, 'success');
      } else {
        showToast(data.error || 'Erreur lors de la soumission Flexy', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur serveur', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetOrder = () => {
    setActiveOrder(null);
    setSenderPhone('');
    setFlexyReference('');
    setReceiptNote('');
  };

  const closeModal = () => {
    setIsBuyModalOpen(false);
    resetOrder();
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Convert USD to approximate DZD for Flexy guidance
  const estimatedDzdPrice = selectedPack ? Math.round(selectedPack.priceFiat * 150) : 750;

  let targetFlexyNumber = settings?.flexyTargetMobilis || '0666496676';
  if (operator === 'Djezzy') targetFlexyNumber = settings?.flexyTargetDjezzy || '0784145118';
  if (operator === 'Ooredoo') targetFlexyNumber = settings?.flexyTargetOoredoo || '0558953440';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Recharger mon portefeuille VideoCredit
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                1 minute de visionnage = 1 crédit • 50% reversé aux créateurs
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* If no active order yet, show Pack Selector & Payment Method Selection */}
          {!activeOrder && (
            <>
              {/* 1. SELECT CREDIT PACK */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                  1. Choisissez votre pack de crédits
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packs.map((pack) => {
                    const isSelected = selectedPack?.id === pack.id;
                    return (
                      <div
                        key={pack.id}
                        onClick={() => setSelectedPack(pack)}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md shadow-indigo-600/10'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/30 dark:bg-neutral-800/20'
                        }`}
                      >
                        {pack.badge && (
                          <span
                            className={`absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              pack.popular
                                ? 'bg-indigo-600 text-white'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {pack.badge}
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-neutral-900 dark:text-white">
                            {pack.name}
                          </span>
                          <span className="text-base font-extrabold text-neutral-900 dark:text-white">
                            ${pack.priceFiat.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{pack.credits} Crédits</span>
                          <span className="text-[11px] text-neutral-400 font-normal">
                            ({Math.floor(pack.credits / 60)}h{pack.credits % 60}m)
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {pack.tagline}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. CHOOSE PAYMENT GATEWAY */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                  2. Moyen de paiement sécurisé
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CRYPTO')}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                      paymentMethod === 'CRYPTO'
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                      ₿
                    </div>
                    <div>
                      <div className="text-sm font-bold text-neutral-900 dark:text-white">
                        Cryptomonnaies
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        USDT (TRC20), BTC, ETH
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('FLEXY')}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                      paymentMethod === 'FLEXY'
                        ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-neutral-900 dark:text-white">
                        Flexy (Algérie)
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Mobilis, Djezzy, Ooredoo
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. GATEWAY SPECIFIC FORM */}
              {paymentMethod === 'CRYPTO' && (
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Sélection de l'actif crypto
                    </span>
                    <span className="text-[11px] text-indigo-500 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Confirmation Webhook automatisée
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['USDT', 'BTC', 'ETH'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => {
                          setCryptoCurrency(curr);
                          if (curr === 'USDT') setCryptoNetwork('ERC20');
                          else if (curr === 'BTC') setCryptoNetwork('Bitcoin');
                          else setCryptoNetwork('ERC20');
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          cryptoCurrency === curr
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent shadow'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>

                  {cryptoCurrency === 'USDT' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-neutral-500">Réseau :</span>
                      <button
                        type="button"
                        onClick={() => setCryptoNetwork('ERC20')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          cryptoNetwork === 'ERC20'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        EVM / ERC-20 (Ethereum, Polygon, BSC)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCryptoNetwork('TRC20')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          cryptoNetwork === 'TRC20'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        TRC-20
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleCreateCryptoOrder}
                    disabled={isSubmitting || !selectedPack}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Générer l'adresse de paiement ({selectedPack?.priceFiat.toFixed(2)} USD)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {paymentMethod === 'FLEXY' && (
                <form
                  onSubmit={handleSubmitFlexyOrder}
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-4"
                >
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Procédure de recharge Flexy sécurisée :
                    </div>
                    <p className="leading-relaxed">
                      1. Envoyez <strong>~{estimatedDzdPrice} DZD</strong> de Flexy au numéro officiel{' '}
                      <strong>{targetFlexyNumber}</strong> ({operator}).<br />
                      2. Renseignez votre numéro et la référence SMS reçue ci-dessous.<br />
                      3. Notre service valide le versement et crédite immédiatement{' '}
                      <strong>{selectedPack?.credits} crédits</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['Mobilis', 'Djezzy', 'Ooredoo'] as const).map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setOperator(op)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          operator === op
                            ? 'bg-emerald-600 text-white border-transparent'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Numéro de téléphone expéditeur (ayant envoyé le Flexy)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 0665 12 34 56"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Référence de transaction (Code SMS reçu)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: MOB-984210 ou DJZ-771"
                        value={flexyReference}
                        onChange={(e) => setFlexyReference(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Remarque ou détail (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Envoyé à 14h20 depuis l'agence..."
                        value={receiptNote}
                        onChange={(e) => setReceiptNote(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedPack}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Soumettre la demande Flexy ({selectedPack?.credits} crédits)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}

          {/* ACTIVE ORDER DISPLAY (CRYPTO OR FLEXY IN PROGRESS) */}
          {activeOrder && (
            <div className="space-y-5 animate-fade-in">
              {/* Status Header */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  activeOrder.status === 'CONFIRMED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {activeOrder.status === 'CONFIRMED' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Clock className="w-6 h-6 text-amber-500 animate-spin" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {activeOrder.status === 'CONFIRMED'
                        ? 'Paiement confirmé avec succès !'
                        : activeOrder.paymentMethod === 'CRYPTO'
                        ? 'En attente de paiement sur la blockchain'
                        : 'Demande Flexy soumise à la comptabilité'}
                    </div>
                    <div className="text-xs opacity-90">
                      Commande #{activeOrder.id} • {activeOrder.packName}
                    </div>
                  </div>
                </div>

                {activeOrder.status === 'PENDING' && activeOrder.paymentMethod === 'CRYPTO' && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Expire dans</div>
                    <div className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                      {formatCountdown(timeRemaining)}
                    </div>
                  </div>
                )}
              </div>

              {/* CRYPTO ORDER DETAILS */}
              {activeOrder.paymentMethod === 'CRYPTO' && activeOrder.cryptoDetails && (
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                    <span className="text-xs text-neutral-500">Montant exact à envoyer :</span>
                    <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                      {activeOrder.cryptoDetails.amountCrypto} ({activeOrder.cryptoDetails.network})
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1">
                      Adresse de dépôt :
                    </label>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700">
                      <span className="font-mono text-xs text-neutral-900 dark:text-white break-all flex-1 select-all">
                        {activeOrder.cryptoDetails.depositAddress}
                      </span>
                      <button
                        onClick={() => handleCopy(activeOrder.cryptoDetails?.depositAddress || '')}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-1 transition-colors"
                      >
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copié' : 'Copier'}</span>
                      </button>
                    </div>
                  </div>

                  {activeOrder.status === 'PENDING' && (
                    <div className="pt-2 space-y-3">
                      {/* Live Sandbox simulation button */}
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-bold flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-indigo-500" />
                            Simulation Sandbox Immédiate :
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Tester l'attribution automatique sans transférer de véritables tokens.
                          </div>
                        </div>
                        <button
                          onClick={handleSimulateCryptoConfirm}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all whitespace-nowrap"
                        >
                          Simuler Webhook
                        </button>
                      </div>
                    </div>
                  )}

                  {activeOrder.status === 'CONFIRMED' && (
                    <div className="pt-2">
                      <button
                        onClick={closeModal}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow transition-all"
                      >
                        Fermer et profiter de mes crédits
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* FLEXY ORDER DETAILS */}
              {activeOrder.paymentMethod === 'FLEXY' && activeOrder.flexyDetails && (
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-3">
                  <div className="text-xs space-y-1.5 text-neutral-600 dark:text-neutral-400">
                    <div>
                      Opérateur : <strong className="text-neutral-900 dark:text-white">{activeOrder.flexyDetails.operator}</strong>
                    </div>
                    <div>
                      Numéro expéditeur : <strong className="text-neutral-900 dark:text-white">{activeOrder.flexyDetails.senderPhoneNumber}</strong>
                    </div>
                    <div>
                      Référence fournie : <strong className="text-neutral-900 dark:text-white">{activeOrder.flexyDetails.transactionReference}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300">
                    💡 <strong>Note pour le test :</strong> Vous pouvez basculer en mode <em>Administrateur</em> via le menu déroulant en haut de l'écran pour inspecter et valider cette transaction Flexy d'un simple clic !
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={resetOrder}
                      className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold"
                    >
                      Nouvelle recharge
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 text-xs font-bold"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
