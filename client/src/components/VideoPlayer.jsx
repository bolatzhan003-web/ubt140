import { useState, useEffect, useRef } from 'react';
import { FiCheckCircle, FiPlay, FiAward } from 'react-icons/fi';

export default function VideoPlayer({ url, initialPercent = 0, onProgress }) {
  const [percent, setPercent] = useState(initialPercent || 0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  // Sync initial percent if updated externally
  useEffect(() => {
    if (initialPercent > percent) {
      setPercent(initialPercent);
    }
  }, [initialPercent]);

  const getYouTubeId = (urlStr) => {
    if (!urlStr) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = urlStr.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = getYouTubeId(url);

  // Initialize YouTube Iframe API listener without touching native player controls
  useEffect(() => {
    if (!videoId) return;

    // Load YouTube API script if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const iframeId = `yt-player-${videoId}`;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      const elem = document.getElementById(iframeId);
      if (!elem) return;

      try {
        playerRef.current = new window.YT.Player(iframeId, {
          events: {
            onStateChange: (event) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }
            }
          }
        });
      } catch (err) {
        // Player init error ignored
      }
    };

    let checkTimer = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkTimer);
        setupPlayer();
      }
    }, 250);

    return () => {
      clearInterval(checkTimer);
      clearInterval(intervalRef.current);
    };
  }, [videoId]);

  // Track progress while playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          setCurrentTime(cur);
          if (dur > 0) {
            setDuration(dur);
            const calculatedPercent = Math.min(100, Math.round((cur / dur) * 100));
            setPercent(prev => {
              const maxPct = Math.max(prev, calculatedPercent);
              if (maxPct !== prev) {
                onProgress?.({
                  percent: maxPct,
                  currentTime: Math.round(cur),
                  duration: Math.round(dur)
                });
              }
              return maxPct;
            });
          }
        }
      }, 1500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, onProgress]);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6 text-center border border-slate-800">
        <svg className="w-16 h-16 mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="font-medium text-slate-300">Бейнесабақ көрсетілмейді</p>
        <p className="text-xs text-slate-500 mt-1">Бейнежазба сілтемесі дұрыс емес немесе жүктелмеген</p>
      </div>
    );
  }

  const isCompleted = percent >= 80;

  return (
    <div className="space-y-3">
      {/* 100% Standard Native YouTube Embed */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl border border-slate-200">
        <iframe
          id={`yt-player-${videoId}`}
          className="w-full h-full border-0"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Video Watch Progress Tracker Pill */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isCompleted ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <FiCheckCircle size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              {percent}%
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {isCompleted ? 'Сабақ қаралған деп есептелді' : 'Бейнесабақты көру барысы'}
              </span>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                isCompleted 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border border-sky-200'
              }`}>
                {percent}% қаралды
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isCompleted 
                ? 'Жетістікке қосылды! Келесі сабаққа өте аласыз.'
                : 'Сабақ аяқталуы үшін видеоны кемінде 80% қараңыз.'}
            </p>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full sm:w-48 bg-slate-100 rounded-full h-2 overflow-hidden flex-shrink-0 border border-slate-200/60">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCompleted ? 'bg-emerald-500' : 'bg-sky-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
