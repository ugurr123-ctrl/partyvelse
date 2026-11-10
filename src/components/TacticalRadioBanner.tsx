import React, { useEffect, useState } from 'react';
import { Radio, Mic, Volume2, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncService, RadioTransmission } from '../services/multiplayerSync';
import { soundManager } from '../services/soundEffects';

interface Props {
  onOpenRadio: () => void;
}

export const TacticalRadioBanner: React.FC<Props> = ({ onOpenRadio }) => {
  const [activeTransmission, setActiveTransmission] = useState<RadioTransmission | null>(null);

  useEffect(() => {
    const unsub = syncService.subscribeRadio((transmission) => {
      // Play radio sound effects on incoming message
      soundManager.playRadioSquelch();
      setTimeout(() => {
        soundManager.playRogerBeep();
      }, 200);

      setActiveTransmission(transmission);

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setActiveTransmission((curr) => (curr?.id === transmission.id ? null : curr));
      }, 5000);

      return () => clearTimeout(timer);
    });

    return () => unsub();
  }, []);

  return (
    <AnimatePresence>
      {activeTransmission && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto"
        >
          <div className="p-3 rounded-2xl bg-[#14102b]/95 border-2 border-[#ffb703] shadow-[0_0_30px_rgba(255,183,3,0.45)] backdrop-blur-xl flex items-center justify-between gap-3 text-white">
            
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff9800] to-[#ffb703] text-black flex items-center justify-center shrink-0 shadow-[0_0_15px_#ffb703] animate-pulse">
                <Radio className="w-5 h-5 stroke-[2.2]" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="font-bold text-[#ffb703] flex items-center gap-1">
                    <Mic className="w-3 h-3 text-[#ffb703]" />
                    <span>{activeTransmission.senderName}</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-[#00eefc] font-semibold">{activeTransmission.frequency}</span>
                </div>
                <p className="font-manrope text-xs font-semibold text-white truncate leading-tight mt-0.5">
                  "{activeTransmission.message}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setActiveTransmission(null);
                  onOpenRadio();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#ffb703] hover:bg-[#ffc107] text-black font-sora font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <span>Cevapla</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => setActiveTransmission(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
