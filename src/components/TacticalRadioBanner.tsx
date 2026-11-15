import React, { useEffect, useState, useRef } from 'react';
import { Radio, Mic, Volume2, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role } from '../types/game';
import { syncService, RadioTransmission } from '../services/multiplayerSync';
import { soundManager } from '../services/soundEffects';

interface Props {
  onOpenRadio: () => void;
  myRole?: Role;
}

export const TacticalRadioBanner: React.FC<Props> = ({ onOpenRadio, myRole }) => {
  const [activeTransmission, setActiveTransmission] = useState<RadioTransmission | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const myRoleRef = useRef<Role | undefined>(myRole);

  useEffect(() => {
    myRoleRef.current = myRole;
  }, [myRole]);

  const playClip = (transmission: RadioTransmission) => {
    if (!transmission.audioDataUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    try {
      const audio = new Audio(transmission.audioDataUrl);
      audioRef.current = audio;
      audio.onended = () => {
        soundManager.playRogerBeep();
        audioRef.current = null;
      };
      audio.play().catch(() => {
        // Autoplay blocked before gesture — user can click Dinle button on banner
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout> | null = null;

    const unsub = syncService.subscribeRadio((transmission) => {
      // Don't show incoming notification banner for our own locally sent transmissions
      if (syncService.isLocallySentRadio(transmission.id)) {
        return;
      }

      soundManager.playRadioSquelch();

      if (transmission.audioDataUrl) {
        if (
          !soundManager.isMuted() &&
          transmission.senderRole !== myRoleRef.current &&
          syncService.tryClaimRadioAudioPlayback(transmission.id)
        ) {
          setTimeout(() => playClip(transmission), 150);
        }
      } else {
        setTimeout(() => {
          soundManager.playRogerBeep();
        }, 200);
      }

      setActiveTransmission(transmission);

      if (dismissTimer) clearTimeout(dismissTimer);
      const visibleMs = transmission.audioDurationMs
        ? Math.max(5500, transmission.audioDurationMs + 2500)
        : 5000;
      dismissTimer = setTimeout(() => {
        setActiveTransmission((curr) => (curr?.id === transmission.id ? null : curr));
      }, visibleMs);
    });

    return () => {
      if (dismissTimer) clearTimeout(dismissTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      unsub();
    };
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
          <div className="p-3 rounded-2xl bg-[#14102b]/95 border-2 border-[#ffb703] shadow-[0_0_30px_rgba(255,183,3,0.45)] backdrop-blur-xl flex items-center justify-between gap-2.5 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff9800] to-[#ffb703] text-black flex items-center justify-center shrink-0 shadow-[0_0_15px_#ffb703] animate-pulse">
                <Radio className="w-5 h-5 stroke-[2.2]" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="font-bold text-[#ffb703] flex items-center gap-1 truncate">
                    <Mic className="w-3 h-3 text-[#ffb703] shrink-0" />
                    <span className="truncate">{activeTransmission.senderName}</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-[#00eefc] font-semibold shrink-0">{activeTransmission.frequency}</span>
                </div>
                <p className="font-manrope text-xs font-semibold text-white truncate leading-tight mt-0.5">
                  {activeTransmission.audioDataUrl ? activeTransmission.message : `"${activeTransmission.message}"`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {activeTransmission.audioDataUrl && (
                <button
                  type="button"
                  onClick={() => playClip(activeTransmission)}
                  className="px-2 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-sora font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  title="Sesi Tekrar Dinle"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Dinle</span>
                </button>
              )}

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
