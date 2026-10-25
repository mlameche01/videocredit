import React from 'react';
import { HelpCircle, Percent, Coins, ShieldCheck, Phone, Zap, FileText } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-4xl mx-auto text-xs sm:text-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            Centre d'aide & Règles de Monétisation
          </h1>
          <p className="text-xs text-neutral-500">
            Guide officiel du modèle économique équitable VideoCredit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Règle : 1 Minute = 1 Crédit
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
            Le décompte s'effectue sur le temps réel de lecture effectif, validé par des heartbeats
            sécurisés toutes les 10 secondes. Mettre la vidéo en pause arrête immédiatement le compteur.
            Fermer l'onglet ou changer d'appareil préserve votre solde sans risque de double débit.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
            <Percent className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Répartition 50% Créateur / 50% Plateforme
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
            Pour chaque crédit consommé (valeur de référence : $0.10 USD), exactement $0.05 est versé
            au portefeuille du créateur de la vidéo, et $0.05 est alloué au maintien de
            l'infrastructure serveur et de la bande passante.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Recharge Flexy (Algérie)
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
            Les spectateurs résidant en Algérie peuvent recharger leur solde par transfert de crédit
            téléphonique Flexy (Mobilis, Djezzy, Ooredoo). En l'absence d'API bancaire universelle,
            chaque demande fait l'objet d'un contrôle manuel rigoureux par notre équipe comptable avant
            crédit.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Paiements Cryptomonnaies (USDT, BTC, ETH)
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
            Les recharges cryptos s'appuient sur des adresses dédiées avec confirmation automatique via
            webhooks signés cryptographiquement. Aucun crédit n'est jamais alloué sans vérification de
            la confirmation sur la blockchain.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2 md:col-span-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            Retrait des Revenus Créateurs : Uniquement en Flexy
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
            Conformément aux règles de la plateforme, le versement des gains des créateurs de contenu
            s'effectue <strong>exclusivement par recharge téléphonique Flexy</strong> (Mobilis, Djezzy, Ooredoo).
            Le créateur indique son opérateur et son numéro de téléphone, et l'administrateur procède
            au transfert du crédit correspondant au solde demandé.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>Politique Anti-Fraude & Auto-visionnages</span>
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Pour garantir l'intégrité financière du système, un créateur visionnant ses propres vidéos ne
          génère aucun revenu de créateur et ne débite aucun crédit (mode prévisualisation gratuite).
          Toute détection d'artifice de lecture (scripts automatisés, sauts anormaux dans le temps)
          entraîne la suspension immédiate du compte et la restitution des crédits.
        </p>
      </div>
    </div>
  );
};
