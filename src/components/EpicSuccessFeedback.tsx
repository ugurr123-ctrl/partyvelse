import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  show: boolean;
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
}

export const EpicSuccessFeedback: React.FC<Props> = ({
  show,
  title = 'GÖREV BAŞARIYLA TAMAMLANDI!',
  subtitle = 'Tüm kritik sistemler stabilize edildi • Tam İzolasyon Sağlandı',
  onComplete,
}) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
          {/* 1. Golden Ambient Screen Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.75, 0.3, 0],
            }}
            transition={{ 
              duration: 1.4, 
              times: [0, 0.15, 0.5, 1],
              ease: 'easeOut' 
            }}
            className="absolute inset-0 bg-gradient-to-b from-[#ffb703]/35 via-[#ffc107]/20 to-[#ff9800]/30 mix-blend-screen"
          />

          {/* 2. Radial Golden Flare Core */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ 
              scale: [0.2, 1.6, 2.4], 
              opacity: [0, 0.9, 0] 
            }}
            transition={{ 
              duration: 1.2, 
              ease: 'easeOut' 
            }}
            className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,#fff5cc_0%,#ffb703_35%,rgba(255,183,3,0)_70%)] blur-xl"
          />

          {/* 3. Expanding Tactical Shockwave Ring 1 */}
          <motion.div
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-72 h-72 rounded-full border-4 border-amber-300 shadow-[0_0_60px_#ffb703]"
          />

          {/* 4. Expanding Tactical Shockwave Ring 2 (delayed) */}
          <motion.div
            initial={{ scale: 0.1, opacity: 0.8 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 1.3, delay: 0.15, ease: 'easeOut' }}
            className="absolute w-60 h-60 rounded-full border-2 border-yellow-200 border-dashed shadow-[0_0_40px_rgba(255,220,100,0.8)]"
          />

          {/* 5. Center Epic Banner with Trophy & Sparkles */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 35 }}
            animate={{ 
              scale: [0.6, 1.08, 1],
              opacity: 1, 
              y: 0 
            }}
            exit={{ 
              scale: 0.9, 
              opacity: 0, 
              y: -25,
              transition: { duration: 0.3 }
            }}
            transition={{ 
              duration: 0.55, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="relative z-10 flex flex-col items-center text-center px-6 py-4 mx-4 max-w-sm sm:max-w-md rounded-2xl bg-[#141123]/95 border-2 border-[#ffb703] shadow-[0_0_45px_rgba(255,183,3,0.55),inset_0_1px_2px_rgba(255,255,255,0.4)] backdrop-blur-xl"
          >
            {/* Top Glowing Trophy Icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 350, damping: 15 }}
              className="w-14 h-14 -mt-10 mb-2 rounded-2xl bg-gradient-to-tr from-[#ff9e00] via-[#ffb703] to-[#ffe066] border-2 border-white/60 flex items-center justify-center text-black shadow-[0_0_30px_#ffb703]"
            >
              <Trophy className="w-7 h-7 fill-current stroke-[2.2]" />
            </motion.div>

            {/* Sparkles Ribbon */}
            <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[10px] font-black tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>KRİTİK HEDEF DOĞRULANDI</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            {/* Main Title */}
            <h2 className="font-sora text-lg sm:text-2xl font-black text-white uppercase tracking-tight drop-shadow-[0_2px_12px_rgba(255,183,3,0.7)] leading-tight">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="font-manrope text-xs sm:text-sm text-amber-100/90 mt-1.5 leading-snug font-medium">
              {subtitle}
            </p>

            {/* Micro telemetry footer */}
            <div className="mt-3 pt-2 border-t border-amber-500/30 w-full flex items-center justify-between text-[10px] font-mono text-amber-300/80">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>MÜHÜR VE BÜTÜNLÜK %100</span>
              </span>
              <span className="text-white font-bold">TAM ETKİ // ZEIT</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
