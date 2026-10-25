import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReportModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ videoId, isOpen, onClose }) => {
  const { showToast } = useApp();
  const [reason, setReason] = useState('Contenu inapproprié ou illégal');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullReason = `${reason}${details ? ` - ${details}` : ''}`;
      const res = await fetch(`/api/videos/${videoId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: fullReason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Signalement enregistré. Notre équipe de modération va examiner le contenu.', 'success');
        onClose();
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l’envoi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-rose-500 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base text-neutral-900 dark:text-white">Signaler cette vidéo</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Motif principal :
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="Contenu inapproprié ou illégal">Contenu inapproprié ou violent</option>
              <option value="Atteinte aux droits d'auteur / Plagiat">Atteinte aux droits d'auteur (Copyright)</option>
              <option value="Tentative de fraude / Faux contenu">Tentative de fraude / Arnaque</option>
              <option value="Spam ou contenu trompeur">Spam ou titre mensonger</option>
              <option value="Autre motif">Autre motif</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Précisions supplémentaires (facultatif) :
            </label>
            <textarea
              rows={3}
              placeholder="Expliquez brièvement le problème..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Transmettre le signalement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
