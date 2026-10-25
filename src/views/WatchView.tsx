import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Video, Comment } from '../types/index.ts';
import { VideoPlayer } from '../components/VideoPlayer.tsx';
import { ReportModal } from '../components/ReportModal.tsx';
import {
  ThumbsUp,
  Share2,
  Bookmark,
  AlertTriangle,
  Coins,
  CheckCircle2,
  Send,
  HeartHandshake,
  MessageSquare,
  Play,
} from 'lucide-react';

export const WatchView: React.FC = () => {
  const { currentVideoId, openVideo, currentUser, showToast, refreshCurrentUser } = useApp();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const fetchVideoDetails = async () => {
    if (!currentVideoId) return;
    try {
      const res = await fetch(`/api/videos/${currentVideoId}`);
      const data = await res.json();
      if (data.video) {
        setVideo(data.video);
        setComments(data.comments || []);
      }

      // Fetch related
      const allRes = await fetch('/api/videos');
      const allData = await allRes.json();
      if (allData.videos) {
        setRelatedVideos(allData.videos.filter((v: Video) => v.id !== currentVideoId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVideoDetails();
  }, [currentVideoId]);

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-neutral-500">
        Chargement du lecteur vidéo...
      </div>
    );
  }

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const res = await fetch(`/api/videos/${video.id}/like`, { method: 'POST' });
      const data = await res.json();
      setVideo((prev) => (prev ? { ...prev, likes: data.likes } : null));
      setHasLiked(true);
      showToast('Merci pour votre mention J’aime !', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Lien de la vidéo copié dans le presse-papier !', 'info');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/videos/${video.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setNewComment('');
        showToast('Commentaire publié !', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16 animate-fade-in">
      {/* LEFT 2 COLUMNS: VIDEO PLAYER & DETAILS & COMMENTS */}
      <div className="lg:col-span-2 space-y-5">
        {/* Real-time Video Player */}
        <VideoPlayer
          video={video}
          onCreditBilled={() => {
            fetchVideoDetails();
            refreshCurrentUser();
          }}
        />

        {/* Video Title & Actions */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              {video.category}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
              <Coins className="w-3 h-3" /> 1 crédit / minute
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white leading-tight">
            {video.title}
          </h1>

          {/* Channel Bar & Social Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-neutral-200 dark:border-neutral-800">
            {/* Creator Info */}
            <div className="flex items-center gap-3">
              <img
                src={video.creatorAvatar}
                alt={video.creatorName}
                className="w-11 h-11 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-900 dark:text-white">
                  <span>{video.creatorName}</span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Partenaire monétisé (50% direct)
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSubscribed(!isSubscribed);
                  showToast(
                    isSubscribed ? 'Désabonné de la chaîne' : 'Abonné avec succès !',
                    'info'
                  );
                }}
                className={`ml-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSubscribed
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:scale-105 shadow-sm'
                }`}
              >
                {isSubscribed ? 'Abonné ✓' : "S'abonner"}
              </button>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  hasLiked
                    ? 'bg-indigo-600 text-white border-transparent'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{video.likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Partager</span>
              </button>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Signaler la vidéo"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description Card */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 text-xs sm:text-sm space-y-2">
            <div className="flex items-center gap-3 font-semibold text-neutral-700 dark:text-neutral-300 text-xs">
              <span>{video.views} vues</span>
              <span>•</span>
              <span className="text-emerald-500 font-bold">{video.paidMinutes} minutes rémunérées</span>
              <span>•</span>
              <span>Publiée le {new Date(video.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <p
              className={`text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line ${
                isDescExpanded ? '' : 'line-clamp-3'
              }`}
            >
              {video.description}
            </p>
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-xs font-bold text-indigo-500 hover:underline"
            >
              {isDescExpanded ? 'Moins afficher' : 'Afficher plus...'}
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neutral-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              {comments.length} Commentaires
            </h3>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-3">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-300 dark:border-neutral-700"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Ajouter un commentaire constructif..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publier</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3 pt-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-xs sm:text-sm">
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {comment.userName}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RELATED VIDEOS */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
          Vidéos recommandées
        </h3>
        <div className="space-y-3">
          {relatedVideos.map((item) => (
            <div
              key={item.id}
              onClick={() => openVideo(item.id)}
              className="flex gap-3 p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer transition-all group"
            >
              <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-neutral-950 shrink-0">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-white font-mono text-[10px]">
                  {Math.floor(item.durationSeconds / 60)}:
                  {item.durationSeconds % 60 < 10 ? '0' : ''}
                  {item.durationSeconds % 60}
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-500 transition-colors">
                  {item.title}
                </h4>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {item.creatorName}
                </div>
                <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <Coins className="w-3 h-3" /> 1 crédit / min
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        videoId={video.id}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
