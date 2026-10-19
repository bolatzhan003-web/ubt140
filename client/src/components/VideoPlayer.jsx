import { useState, useEffect, useRef } from 'react';
import { 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolumeX, 
  FiMaximize, 
  FiMinimize, 
  FiRotateCcw,
  FiRotateCw 
} from 'react-icons/fi';

export default function VideoPlayer({ url }) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Extract YouTube ID
  const getYouTubeId = (urlStr) => {
    if (!urlStr) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = urlStr.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = getYouTubeId(url);

  // Load YouTube IFrame Player API
  useEffect(() => {
    if (!videoId) return;

    // Load API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let checkInterval = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const playerElementId = `yt-player-${videoId}`;
      const elem = document.getElementById(playerElementId);
      if (!elem) return;

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }

      try {
        playerRef.current = new window.YT.Player(playerElementId, {
          width: '100%',
          height: '100%',
          videoId: videoId,
          playerVars: {
            controls: 0,             // Hides default YouTube controls entirely
            modestbranding: 1,       // Removes large YouTube logo
            rel: 0,                  // No external recommended videos
            showinfo: 0,             // No title or author link
            iv_load_policy: 3,       // No popups or annotations
            disablekb: 1,            // Prevents keyboard shortcut opening on youtube
            fs: 0,                   // Disables YouTube internal fullscreen button
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              setIsReady(true);
              setDuration(event.target.getDuration() || 0);
            },
            onStateChange: (event) => {
              // YT.PlayerState.PLAYING is 1, PAUSED is 2
              if (event.data === 1) {
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }
            }
          }
        });
      } catch (err) {
        console.error('Player init err:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevHandler = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevHandler === 'function') prevHandler();
        initPlayer();
      };

      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 150);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      clearInterval(timerRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  // Track playback time
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const current = playerRef.current.getCurrentTime();
          setCurrentTime(current);
          const dur = playerRef.current.getDuration();
          if (dur && dur !== duration) setDuration(dur);
        }
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, duration]);

  // Controls Handlers
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e) => {
    const seekTo = parseFloat(e.target.value);
    setCurrentTime(seekTo);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seekTo, true);
    }
  };

  const skipSeconds = (seconds) => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      const current = playerRef.current.getCurrentTime();
      const newTime = Math.max(0, Math.min(duration, current + seconds));
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      playerRef.current.setVolume(volume);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolume = (e) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(val);
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (!isFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    const isCurrentlyFs = isFullscreen || Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    if (!isCurrentlyFs) {
      // Enter fullscreen: try Native API first with iOS / Android prefixes
      const req = elem.requestFullscreen ||
                  elem.webkitRequestFullscreen ||
                  elem.webkitEnterFullscreen ||
                  elem.mozRequestFullScreen ||
                  elem.msRequestFullscreen;
      if (req) {
        try {
          const p = req.call(elem);
          if (p && typeof p.catch === 'function') {
            p.catch(() => setIsFullscreen(true));
          }
        } catch {
          setIsFullscreen(true);
        }
      }
      // Always activate CSS full viewport for guaranteed mobile coverage
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      const exit = document.exitFullscreen ||
                   document.webkitExitFullscreen ||
                   document.mozCancelFullScreen ||
                   document.msExitFullscreen;
      if (exit && (document.fullscreenElement || document.webkitFullscreenElement)) {
        try { exit.call(document).catch(() => {}); } catch {}
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!videoId) {
    return (
      <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
        Видео недоступно
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`yt-player-container select-none group bg-black transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none flex items-center justify-center'
          : 'relative aspect-video rounded-2xl overflow-hidden shadow-xl'
      }`}
    >
      {/* 
        YouTube Player Target (Исходный размер 100% без зума):
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <div
          id={`yt-player-${videoId}`}
          className="w-full h-full pointer-events-none select-none"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {/* 
        Strict Transparent Click Shield across entire video area:
        Clicking on the video toggles play/pause inside the platform.
        It is IMPOSSIBLE to click any YouTube link, title or watermark.
      */}
      <div
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center select-none"
      >
        {!isPlaying && isReady && (
          <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <FiPlay size={28} className="ml-1" />
          </div>
        )}
      </div>

      {/* 
        Custom Platform Native Control Bar:
        100% rendered by UBT140.KZ, with no YouTube branding or redirect buttons.
      */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Timeline Slider */}
        <div className="relative mb-3 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-4">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="p-1 text-white hover:text-blue-400 transition-colors"
              title={isPlaying ? 'Пауза' : 'Воспроизведение'}
            >
              {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
            </button>

            {/* Skip 10 sec backwards */}
            <button
              onClick={() => skipSeconds(-10)}
              className="text-slate-300 hover:text-white transition-colors"
              title="Назад 10 сек"
            >
              <FiRotateCcw size={16} />
            </button>

            {/* Skip 10 sec forward */}
            <button
              onClick={() => skipSeconds(10)}
              className="text-slate-300 hover:text-white transition-colors"
              title="Вперед 10 сек"
            >
              <FiRotateCw size={16} />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="text-slate-300 hover:text-white">
                {isMuted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Time display */}
            <span className="text-[11px] font-mono text-slate-300 font-semibold">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Brand watermark inside platform */}
            <span className="text-[11px] font-bold text-blue-400/80 tracking-wider">
              UBT140 PLAYER
            </span>

            {/* Platform Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 text-slate-300 hover:text-white transition-colors"
              title="На весь экран"
            >
              {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
