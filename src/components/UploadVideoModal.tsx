import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Clapperboard, UploadCloud, CheckCircle2, Sparkles } from 'lucide-react';

const PRESET_SAMPLE_VIDEOS = [
  {
    name: 'Tears of Steel (Sci-Fi 4K)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    duration: 734,
    category: 'Cinéma & Art',
  },
  {
    name: 'Elephants Dream (Animation)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumb: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    duration: 653,
    category: 'Documentaire',
  },
  {
    name: 'Big Buck Bunny (Animation 3D)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumb: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    duration: 596,
    category: 'Jeux Vidéo',
  },
  {
    name: 'For Bigger Blazes (Nature / Action)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumb: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    duration: 900,
    category: 'Tech & Dév',
  },
];

export const UploadVideoModal: React.FC<{ onVideoUploaded?: () => void }> = ({ onVideoUploaded }) => {
  const { isUploadModalOpen, setIsUploadModalOpen, currentUser, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tech & Dév');
  const [videoUrl, setVideoUrl] = useState(PRESET_SAMPLE_VIDEOS[0].url);
  const [thumbnailUrl, setThumbnailUrl] = useState(PRESET_SAMPLE_VIDEOS[0].thumb);
  const [durationSeconds, setDurationSeconds] = useState(PRESET_SAMPLE_VIDEOS[0].duration);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isUploadModalOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_SAMPLE_VIDEOS[0]) => {
    setVideoUrl(preset.url);
    setThumbnailUrl(preset.thumb);
    setDurationSeconds(preset.duration);
    setCategory(preset.category);
    if (!title) setTitle(preset.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !videoUrl) {
      showToast('Titre, description et vidéo sont requis', 'warning');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + 25;
      });
    }, 200);

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          videoUrl,
          thumbnailUrl,
          durationSeconds,
        }),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();
      if (data.success) {
        showToast('Votre vidéo a été publiée avec monétisation 1 crédit/min activée !', 'success');
        setIsUploadModalOpen(false);
        setTitle('');
        setDescription('');
        if (onVideoUploaded) onVideoUploaded();
      } else {
        showToast(data.error || 'Erreur lors de la publication', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur serveur lors de la publication', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Publier une nouvelle vidéo
              </h2>
              <p className="text-xs text-neutral-500">
                Monétisation active : 1 crédit/min (50% pour vous)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Source vidéo (Exemples HD prêts ou URL personnalisée) :
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {PRESET_SAMPLE_VIDEOS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    videoUrl === preset.url
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <img
                    src={preset.thumb}
                    alt={preset.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate text-[11px]">{preset.name}</div>
                    <div className="text-[10px] text-neutral-400">
                      {Math.floor(preset.duration / 60)} min
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Titre de la vidéo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Formation complète Développeur Full-Stack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Décrivez le contenu de votre vidéo, les chapitres..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs"
              >
                <option value="Tech & Dév">Tech & Dév</option>
                <option value="Documentaire">Documentaire</option>
                <option value="Cybersécurité">Cybersécurité</option>
                <option value="Cinéma & Art">Cinéma & Art</option>
                <option value="Finance & Crypto">Finance & Crypto</option>
                <option value="Jeux Vidéo">Jeux Vidéo</option>
                <option value="Éducation">Éducation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Durée (secondes)
              </label>
              <input
                type="number"
                min={30}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              URL flux vidéo (MP4/HLS)
            </label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Miniature (Thumbnail URL)
            </label>
            <input
              type="url"
              required
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs"
            />
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-neutral-500 font-semibold">
                <span>Transcodage et sécurisation du flux...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Traitement en cours...' : 'Publier et monétiser'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
