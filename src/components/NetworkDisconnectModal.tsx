import React from 'react';
import { WifiOff, RefreshCw, AlertOctagon, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onReconnect: () => void;
  countdownSeconds?: number;
}

export const NetworkDisconnectModal: React.FC<Props> = ({ isOpen, onReconnect, countdownSeconds = 45 }) => {
  const [reconnecting, setReconnecting] = React.useState(false);

  const handleReconnect = () => {
    setReconnecting(true);
    setTimeout(() => {
      setReconnecting(false);
      onReconnect();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) onReconnect(); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md p-6 rounded-2xl bg-[#141123] border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-center text-[#e6dff9] space-y-4"
          >
        
        {/* Quick Close Button */}
        <button
          onClick={onReconnect}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Kapat & Bağlan"
        >
          <X className="w-4 h-4" />
        </button>
        
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
          <div className="flex justify-between text-[#9e8f78]">
            <span>KOPMA SÜRE AŞIMI (45s):</span>
            <span className="font-bold text-rose-400">{countdownSeconds}s KALDI</span>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
