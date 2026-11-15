import React, { useState } from 'react';
import { Download, Smartphone, X, WifiOff } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="min-h-[40px] px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono font-bold"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Uygulamayı Kur</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="min-h-[40px] px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono font-bold"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Ana Ekrana Ekle</span>
        </button>

        {showIOSGuide && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowIOSGuide(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-[#141123] border border-emerald-400/40 p-5 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>iPhone / iPad Kurulumu</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#d5c4ac] leading-relaxed space-y-1.5">
                <span className="block">1. Safari alt çubuğundaki <strong>Paylaş</strong> simgesine dokun.</span>
                <span className="block">2. Aşağı kaydır ve <strong>Ana Ekrana Ekle</strong> seçeneğini seç.</span>
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#002022] font-sora text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Anlaşıldı
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 border border-amber-300 px-3 py-2 text-xs font-mono font-bold text-black shadow-2xl">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Çevrimdışı Mod — Yerel konsol aktif</span>
    </div>
  );
};
