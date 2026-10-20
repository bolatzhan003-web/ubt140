import { useState, useRef } from 'react';
import { FiUploadCloud, FiTrash2, FiLink, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Compress image to optimized 16:9 Web JPEG Data URL so it persists permanently in Supabase
function compressImage(file, maxWidth = 800, maxHeight = 450, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality compressed JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function CoverImageUpload({ value, onChange, label = 'Курс мұқабасы (Обложка 16:9)' }) {
  const [compressing, setCompressing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Тек сурет файлдарын (PNG, JPG, WEBP) таңдаңыз');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Сурет көлемі 15 МБ-тан аспауы тиіс');
      return;
    }

    setCompressing(true);
    try {
      // Compress and convert to permanent base64 Data URL (immune to container restarts)
      const compressedDataUrl = await compressImage(file);
      onChange(compressedDataUrl);
      toast.success('Мұқаба таңдалды және оңтайландырылды!');
    } catch (err) {
      console.error('Compression error:', err);
      // Fallback to basic file reader
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target.result);
        toast.success('Мұқаба таңдалды!');
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
        >
          <FiLink size={12} /> {showUrlInput ? 'Файл арқылы жүктеу' : 'URL сілтемесі арқылы'}
        </button>
      </div>

      {showUrlInput ? (
        <div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... немесе сурет сілтемесі"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
          />
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
          />

          {value ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900 shadow-sm">
              <img
                src={value}
                alt="Course cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl shadow-lg hover:bg-slate-100 transition-all flex items-center gap-1.5"
                >
                  <FiUploadCloud size={14} /> Басқа сурет таңдау
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-rose-700 transition-all flex items-center gap-1.5"
                >
                  <FiTrash2 size={14} /> Өшіру
                </button>
              </div>

              {compressing && (
                <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  Сурет оңтайландырылуда...
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/50 rounded-2xl aspect-video flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center group ${
                compressing ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-50 group-hover:bg-sky-100 text-sky-600 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                <FiUploadCloud size={24} />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Компьютерден немесе телефоннан мұқаба суретін жүктеу
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Ұсынылатын формат 16:9. PNG, JPG, WEBP
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
