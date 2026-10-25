import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Video } from '../types/index.ts';
import {
  Play,
  Clock,
  Coins,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

const CATEGORIES = [
  'Tous',
  'Tech & Dév',
  'Documentaire',
  'Cybersécurité',
  'Cinéma & Art',
  'Finance & Crypto',
];

export const HomeView: React.FC = () => {
  const { openVideo, setIsBuyModalOpen, currentUser } = useApp();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const url =
        selectedCategory === 'Tous'
          ? '/api/videos'
          : `/api/videos?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. HERO HERO BANNER : THE 1 MIN = 1 CREDIT REVOLUTION */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 border border-neutral-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Le Nouveau Standard du Streaming Équitable</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            1 Minute = 1 Crédit.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              50% Reversé au Créateur.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Fini les publicités invasives et les algorithmes trompeurs. Vous rémunérez directement le
            créateur pour chaque minute réelle de visionnage. La pause arrête le compteur.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover:scale-105"
            >
              <Coins className="w-4 h-4" />
              <span>Recharger des crédits (Crypto & Flexy)</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Votre solde : {currentUser?.credits ?? 0} crédits</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. VIDEO CARDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse aspect-video" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          Aucune vidéo trouvée dans cette catégorie.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => openVideo(video.id)}
              className="group cursor-pointer flex flex-col space-y-3"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 shadow-md">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/85 text-white font-mono text-xs font-semibold backdrop-blur-xs">
                  {formatDuration(video.durationSeconds)}
                </div>

                {/* 1 Credit / Min Tag */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/80 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold backdrop-blur-md">
                  <Coins className="w-3 h-3 text-emerald-400" />
                  <span>1 crédit / min</span>
                </div>

                {/* Play hover button */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="flex gap-3 px-1">
                <img
                  src={video.creatorAvatar}
                  alt={video.creatorName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-300 dark:border-neutral-700"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {video.title}
                  </h3>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <span>{video.creatorName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {video.views} vues
                    </span>
                    <span>•</span>
                    <span className="text-emerald-500 font-semibold">
                      {video.paidMinutes} min rémunérées
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
