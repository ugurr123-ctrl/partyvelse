import React from 'react';
import { WifiOff, RefreshCw, AlertOctagon, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onReconnect: () => void;
}

export const NetworkDisconnectModal: React.FC<Props> = ({ isOpen, onReconnect }) => {
  const [reconnecting, setReconnecting] = React.useState(false);

  if (!isOpen) return null;

  const handleReconnect = () => {
    setReconnecting(true);
    setTimeout(() => {
      setReconnecting(false);
      onReconnect();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#141123] border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-center text-[#e6dff9] space-y-4 animate-scaleUp">
        
        {/* Animated warning beacon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.4)]">
          <WifiOff className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold tracking-wider uppercase">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>SUB-RÖLE BAĞLANTISI KOPTU</span>
          </div>
          <h3 className="text-xl font-bold font-sora text-white">
            İstasyon Ağı Askıya Alındı
          </h3>
          <p className="text-xs text-[#a59db8] max-w-xs mx-auto">
            Takım arkadaşınızla telemetri senkronizasyonu kesildi. <strong className="text-rose-300">Görev süresi duraklatıldı</strong> ve reaktör kontrolleri emniyet amacıyla kilitlendi.
          </p>
        </div>

        {/* Telemetry info card */}
        <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 text-xs text-left font-mono space-y-1.5">
          <div className="flex justify-between text-[#9e8f78]">
            <span>SİNYAL TAŞIYICI:</span>
            <span className="text-rose-400">0.00 GHz (KESİK)</span>
          </div>
          <div className="flex justify-between text-[#9e8f78]">
            <span>KONTROL PANELLERİ:</span>
            <span className="text-amber-400">EMNİYET KİLİDİ AKTİF</span>
          </div>
          <div className="flex justify-between text-[#9e8f78]">
            <span>GÖREV SAYACI:</span>
            <span className="text-[#00f0ff]">DURAKLATILDI (PAUSED)</span>
          </div>
        </div>

        {/* Reconnect button */}
        <button
          onClick={handleReconnect}
          disabled={reconnecting}
          className="w-full py-3.5 px-4 rounded-xl font-bold font-sora text-sm text-black bg-gradient-to-r from-[#ffb703] to-[#ff9e00] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${reconnecting ? 'animate-spin' : ''}`} />
          <span>{reconnecting ? 'Yeniden Bağlanılıyor...' : 'Yeniden Bağlan & Devam Et'}</span>
        </button>

        <p className="text-[11px] text-[#9e8f78]">
          (Bu ekran, gerçek uzay telsiz kopmalarını ve test senaryolarını doğrulamak için tasarlanmıştır.)
        </p>
      </div>
    </div>
  );
};
