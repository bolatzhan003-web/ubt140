export default function VideoPlayer({ url }) {
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

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl border border-slate-200">
      <iframe
        className="w-full h-full border-0"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
