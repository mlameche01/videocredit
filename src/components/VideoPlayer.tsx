import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Video } from '../types/index.ts';
import { useApp } from '../context/AppContext.tsx';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  Clock,
  HeartHandshake,
} from 'lucide-react';

interface VideoPlayerProps {
  video: Video;
  onCreditBilled?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onCreditBilled }) => {
  const { currentUser, updateUserCredits, setIsBuyModalOpen, showToast, settings } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSeconds || 600);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Billing Session & HUD state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [accumulatedSecondsInMinute, setAccumulatedSecondsInMinute] = useState(0);
  const [totalBilledMinutes, setTotalBilledMinutes] = useState(0);
  const [isSyncingHeartbeat, setIsSyncingHeartbeat] = useState(false);
  const [isBlockedNoCredits, setIsBlockedNoCredits] = useState(false);
  const [lowBalanceAlert, setLowBalanceAlert] = useState<string | null>(null);

  const isSelfWatch = currentUser?.id === video.creatorId;

  // Initialize Watch Session
  const initSession = useCallback(async () => {
    try {
      const res = await fetch('/api/watch/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setSessionToken(data.token);
        if (data.currentCredits !== undefined) {
          updateUserCredits(data.currentCredits);
        }
      }
    } catch (err) {
      console.error('Error starting watch session', err);
    }
  }, [video.id]);

  useEffect(() => {
    initSession();
    return () => {
      // End session on unmount
      if (sessionId) {
        fetch('/api/watch/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
      }
    };
  }, [video.id]);

  // Send Heartbeat to server
  const sendHeartbeat = useCallback(async () => {
    if (!sessionId || !sessionToken || !videoRef.current || videoRef.current.paused) {
      return;
    }

    setIsSyncingHeartbeat(true);
    try {
      const res = await fetch('/api/watch/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          videoId: video.id,
          currentTime: videoRef.current.currentTime,
          playbackRate: videoRef.current.playbackRate,
          token: sessionToken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateUserCredits(data.remainingCredits);
        setAccumulatedSecondsInMinute(data.accumulatedSecondsInCurrentMinute || 0);
        setTotalBilledMinutes(data.totalBilledMinutesThisSession || 0);

        if (data.justBilled) {
          if (!isSelfWatch) {
            showToast('1 minute de visionnage atteinte (-1 crédit débité)', 'info');
          }
          if (onCreditBilled) onCreditBilled();
        }

        if (data.warning) {
          setLowBalanceAlert(data.warning);
        } else {
          setLowBalanceAlert(null);
        }

        if (data.stopPlayback) {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          setIsBlockedNoCredits(true);
          showToast('Lecture arrêtée : solde de crédits insuffisant', 'error');
        }
      } else if (data.stopPlayback) {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
        setIsBlockedNoCredits(true);
      }
    } catch (err) {
      console.error('Heartbeat sync error', err);
    } finally {
      setIsSyncingHeartbeat(false);
    }
  }, [sessionId, sessionToken, video.id, isSelfWatch, onCreditBilled, showToast, updateUserCredits]);

  // Heartbeat interval: every 10 seconds of active playback
  useEffect(() => {
    if (!isPlaying || isBlockedNoCredits) return;

    const interval = setInterval(() => {
      sendHeartbeat();
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, isBlockedNoCredits, sendHeartbeat]);

  // Local second-by-second smooth progress ticker when video is playing
  useEffect(() => {
    if (!isPlaying || isBlockedNoCredits) return;

    const ticker = setInterval(() => {
      setAccumulatedSecondsInMinute((prev) => {
        const next = prev + 1;
        if (next >= 60) {
          // Send instant heartbeat when local minute rollover happens
          sendHeartbeat();
          return 0;
        }
        return next;
      });
    }, 1000 / playbackRate);

    return () => clearInterval(ticker);
  }, [isPlaying, isBlockedNoCredits, playbackRate, sendHeartbeat]);

  // Video element event listeners
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isBlockedNoCredits) {
      setIsBuyModalOpen(true);
      return;
    }

    if ((currentUser?.credits ?? 0) <= 0 && !isSelfWatch) {
      setIsBlockedNoCredits(true);
      setIsBuyModalOpen(true);
      return;
    }

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      // Inform server on pause so counting stops
      sendHeartbeat();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.durationSeconds);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      // Immediately notify server of seek
      sendHeartbeat();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const secondsToNextDebit = 60 - accumulatedSecondsInMinute;
  const minuteProgressPercent = (accumulatedSecondsInMinute / 60) * 100;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-neutral-800">
      {/* 1. TOP REAL-TIME MONETIZATION HUD BAR */}
      <div className="bg-neutral-900/95 border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Minute Watch Meter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Minute en cours :</span>
            <span className="font-mono text-emerald-400 font-bold">
              {accumulatedSecondsInMinute}s / 60s
            </span>
          </div>

          {/* Animated 60s Progress Pill */}
          <div className="w-28 h-2 rounded-full bg-neutral-800 overflow-hidden relative border border-neutral-700">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${minuteProgressPercent}%` }}
            />
          </div>

          <div className="hidden sm:flex items-center gap-1 text-neutral-400">
            <span>Prochain débit :</span>
            <span className="font-mono text-white font-medium">dans {secondsToNextDebit}s</span>
            <span className="text-emerald-500 font-semibold">(-1 crédit)</span>
          </div>
        </div>

        {/* Right: Live Split & Sync Status */}
        <div className="flex items-center gap-3">
          {/* 50/50 Revenue Split Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-medium">
            <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />
            <span>50% créateur ({video.creatorName}) / 50% plateforme</span>
          </div>

          {/* Anti-fraud Server Heartbeat status */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isSyncingHeartbeat
                  ? 'bg-amber-400 animate-ping'
                  : isPlaying
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-neutral-500'
              }`}
            />
            <span className="text-[11px] font-medium hidden sm:inline">
              {isSyncingHeartbeat ? 'Synchro...' : 'Décompte certifié'}
            </span>
          </div>

          {/* Quick Credits Balance Display */}
          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all font-semibold"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentUser?.credits ?? 0} cr</span>
            <span className="text-[10px] text-emerald-400 underline ml-0.5">+</span>
          </button>
        </div>
      </div>

      {/* 2. LOW BALANCE NOTIFICATION BANNER */}
      {lowBalanceAlert && !isBlockedNoCredits && (
        <div className="bg-amber-500/90 text-neutral-950 px-4 py-2 flex items-center justify-between text-xs font-semibold animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{lowBalanceAlert}</span>
          </div>
          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="px-2.5 py-1 rounded-md bg-neutral-950 text-white font-bold hover:bg-neutral-800 transition-all"
          >
            Acheter des crédits
          </button>
        </div>
      )}

      {/* 3. VIDEO CANVAS & OVERLAYS */}
      <div className="relative aspect-video bg-black flex items-center justify-center group">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          className="w-full h-full object-contain cursor-pointer"
          onClick={handlePlayPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            sendHeartbeat();
          }}
          playsInline
        />

        {/* INSUFFICIENT CREDITS BLOCKING OVERLAY */}
        {isBlockedNoCredits && (
          <div className="absolute inset-0 z-20 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4">
              <Coins className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Solde de crédits épuisé</h3>
            <p className="text-sm text-neutral-300 max-w-md mb-6 leading-relaxed">
              La lecture de cette vidéo requiert <strong className="text-white">1 crédit par minute</strong>.
              Chaque minute visionnée rémunère équitablement son créateur à hauteur de 50%.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsBuyModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4" />
                Recharger mon portefeuille
              </button>
              <button
                onClick={() => {
                  setIsBlockedNoCredits(false);
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition-all"
              >
                Recommencer au début
              </button>
            </div>
          </div>
        )}

        {/* PLAY / PAUSE BIG CENTER BUTTON WHEN PAUSED */}
        {!isPlaying && !isBlockedNoCredits && (
          <button
            onClick={handlePlayPause}
            className="absolute z-10 w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs transition-transform hover:scale-110"
            title="Lire la vidéo"
          >
            <Play className="w-7 h-7 ml-1" />
          </button>
        )}
      </div>

      {/* 4. CUSTOM INTUITIVE VIDEO CONTROLS */}
      <div className="bg-neutral-950 text-white px-4 py-3 space-y-2 border-t border-neutral-900">
        {/* Progress Timeline Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
          />
        </div>

        {/* Buttons and volume bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 transition-colors"
              title={isPlaying ? 'Mettre en pause' : 'Lecture'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10);
              }}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              title="-10 secondes"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Time display */}
            <div className="font-mono text-neutral-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 ml-2">
              <button onClick={toggleMute} className="text-neutral-400 hover:text-white">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed Toggle */}
            <button
              onClick={cyclePlaybackRate}
              className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-mono font-medium"
              title="Vitesse de lecture"
            >
              {playbackRate}x
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              title="Plein écran"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
