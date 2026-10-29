import React, { useState } from 'react';
import { MissionState } from '../../types/game';
import { 
  Zap, 
  Send, 
  Plus, 
  Minus, 
  ShieldCheck, 
  HeartPulse, 
  Rocket, 
  CheckCircle2, 
  AlertCircle,
  Check 
} from 'lucide-react';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen16EnergyEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { totalBudget, engineerAllocation, lineLosses, isDraftShared, isLocked } = state.energy;
  const [allocation, setAllocation] = useState(engineerAllocation);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const totalUsed = allocation.yasamDestegi + allocation.itki + allocation.kalkan;
  const remainingBudget = totalBudget - totalUsed;

  // Net effective power after transmission line loss
  const effectivePower = {
    yasamDestegi: Math.max(0, allocation.yasamDestegi - lineLosses.yasamDestegi),
    itki: Math.max(0, allocation.itki - lineLosses.itki),
    kalkan: Math.max(0, allocation.kalkan - lineLosses.kalkan),
  };

  const handleAdjust = (system: 'yasamDestegi' | 'itki' | 'kalkan', delta: number) => {
    if (isLocked) return;
    const current = allocation[system];
    const next = current + delta;
    if (next < 0) return;
    if (delta > 0 && remainingBudget <= 0) return; // budget exceeded

    const updated = {
      ...allocation,
      [system]: next,
    };
    setAllocation(updated);

    onUpdate((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        engineerAllocation: updated,
        isDraftShared: false, // reset shared flag when values change
      },
    }));
  };

  const handleShareDraft = () => {
    if (remainingBudget < 0) {
      setFeedbackMsg('Hata: Enerji bütçesi (12 Birim) aşıldı!');
      return;
    }

    onUpdate((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        engineerAllocation: allocation,
        isDraftShared: true,
      },
    }));
    setFeedbackMsg('Enerji taslağı Kaptana başarıyla iletildi! Kaptanın asgari onay verip kilitlemesi bekleniyor.');
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 flex flex-col gap-3.5 text-[#e6dff9] animate-fadeIn">
      
      {/* Header tag */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping"></span>
          AŞAMA 3/4 • ENERJİ DAĞITIMI
        </span>
        <span className="text-[#00f0ff] font-bold">MÜHENDİS REAKTÖR KONTROLÜ</span>
      </div>

      {/* 12 Units Budget Counter */}
      <div className="p-4 rounded-xl bg-[#0f0c1e] border border-cyan-500/30 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-[#00f0ff] flex items-center justify-center border border-cyan-500/40">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#9e8f78] uppercase">TOPLAM ENERJİ BÜTÇESİ</span>
            <div className="text-xl font-bold font-sora text-white">
              {totalBudget} <span className="text-xs text-[#00f0ff]">BİRİM MW</span>
            </div>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-[10px] text-[#9e8f78] block">KALAN BÜTÇE</span>
          <span className={`text-xl font-bold ${remainingBudget === 0 ? 'text-emerald-400' : remainingBudget < 0 ? 'text-rose-400' : 'text-[#ffb703]'}`}>
            {remainingBudget} MW
          </span>
        </div>
      </div>

      {/* 3 System Sliders & Line Loss Math */}
      <div className="space-y-2.5">
        <span className="text-xs font-mono text-[#a59db8] uppercase font-bold flex items-center justify-between">
          <span>SİSTEM DAĞILIMI & HAT KAYIPLARI</span>
          <span className="text-[10px] text-amber-300">Hat kayıplarını hesaba kat!</span>
        </span>

        {/* 1. Yaşam Desteği */}
        <div className="p-3.5 rounded-xl bg-[#1c192c] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-white font-bold">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              YAŞAM DESTEĞİ
            </span>
            <span className="text-rose-400 text-[11px] font-bold">
              Hat Kaybı: -{lineLosses.yasamDestegi} MW
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust('yasamDestegi', -1)}
                disabled={isLocked || allocation.yasamDestegi <= 0}
                className="w-8 h-8 rounded-lg bg-[#201d30] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 text-center text-base font-bold font-mono text-white">
                {allocation.yasamDestegi}
              </span>
              <button
                type="button"
                onClick={() => handleAdjust('yasamDestegi', 1)}
                disabled={isLocked || remainingBudget <= 0}
                className="w-8 h-8 rounded-lg bg-[#201d30] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-right font-mono">
              <span className="text-[9px] text-[#9e8f78] block">NET ETKİLİ GÜÇ</span>
              <span className="text-sm font-bold text-emerald-400">
                {effectivePower.yasamDestegi} MW
              </span>
            </div>
          </div>
        </div>

        {/* 2. İtki Motorları */}
        <div className="p-3.5 rounded-xl bg-[#1c192c] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-white font-bold">
              <Rocket className="w-4 h-4 text-[#00f0ff]" />
              İTKİ MOTORLARI
            </span>
            <span className="text-rose-400 text-[11px] font-bold">
              Hat Kaybı: -{lineLosses.itki} MW
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust('itki', -1)}
                disabled={isLocked || allocation.itki <= 0}
                className="w-8 h-8 rounded-lg bg-[#201d30] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 text-center text-base font-bold font-mono text-white">
                {allocation.itki}
              </span>
              <button
                type="button"
                onClick={() => handleAdjust('itki', 1)}
                disabled={isLocked || remainingBudget <= 0}
                className="w-8 h-8 rounded-lg bg-[#201d30] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-right font-mono">
              <span className="text-[9px] text-[#9e8f78] block">NET ETKİLİ GÜÇ</span>
              <span className="text-sm font-bold text-[#00f0ff]">
                {effectivePower.itki} MW
              </span>
            </div>
          </div>
        </div>

        {/* 3. Gövde Kalkanı */}
        <div className="p-3.5 rounded-xl bg-[#1c192c] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              GÖVDE KALKANI
            </span>
            <span className="text-rose-400 text-[11px] font-bold">
              Hat Kaybı: -{lineLosses.kalkan} MW
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust('kalkan', -1)}
                disabled={isLocked || allocation.kalkan <= 0}
                className="w-8 h-8 rounded-lg bg-[#201d30] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 text-center text-base font-bold font-mono text-white">
                {allocation.kalkan}
              </span>
              <button
                type="button"
                onClick={() => handleAdjust('kalkan', 1)}
                disabled={isLocked || remainingBudget <= 0}
                className="w-8 h-8 rounded-lg bg-[#201d30] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-right font-mono">
              <span className="text-[9px] text-[#9e8f78] block">NET ETKİLİ GÜÇ</span>
              <span className="text-sm font-bold text-purple-300">
                {effectivePower.kalkan} MW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Routes Requirement Preview (Mühendis Bilgisi: İtki & Kalkan İhtiyaçları) */}
      <div className="p-3 rounded-xl bg-[#0f0c1e] border border-white/10 space-y-1.5 text-xs font-mono">
        <span className="text-[#a59db8] block font-bold uppercase text-[10px]">
          ROTALARIN GÜÇ ŞARTLARI (MÜHENDİS BİLGİSİ):
        </span>
        <div className="flex justify-between text-[11px] text-white">
          <span>Rota Alfa: <span className="text-[#00f0ff]">4 İtki</span>, <span className="text-purple-300">2 Kalkan</span></span>
          <span>{effectivePower.itki >= 4 && effectivePower.kalkan >= 2 ? '✓ UYGUN' : '✗ YETERSİZ'}</span>
        </div>
        <div className="flex justify-between text-[11px] text-white">
          <span>Rota Beta: <span className="text-[#00f0ff]">3 İtki</span>, <span className="text-purple-300">3 Kalkan</span></span>
          <span>{effectivePower.itki >= 3 && effectivePower.kalkan >= 3 ? '✓ UYGUN' : '✗ YETERSİZ'}</span>
        </div>
        <div className="flex justify-between text-[11px] text-white">
          <span>Rota Gama: <span className="text-[#00f0ff]">2 İtki</span>, <span className="text-purple-300">4 Kalkan</span></span>
          <span>{effectivePower.itki >= 2 && effectivePower.kalkan >= 4 ? '✓ UYGUN' : '✗ YETERSİZ'}</span>
        </div>
      </div>

      {/* Feedback Message */}
      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 animate-fadeIn">
          {feedbackMsg}
        </div>
      )}

      {/* Action Trigger */}
      {!isLocked ? (
        <button
          onClick={handleShareDraft}
          className="w-full py-3.5 px-4 rounded-xl font-bold font-sora text-sm text-black btn-3d-cyan flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25"
        >
          <Send className="w-4 h-4" />
          <span>ENERJİ TASLAĞINI KAPTANA PAYLAŞ</span>
        </button>
      ) : (
        <button
          onClick={onAdvancePhase}
          className="w-full py-3.5 px-4 rounded-xl font-bold font-sora text-sm text-black btn-3d-gold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 animate-bounce"
        >
          <Check className="w-4 h-4" />
          <span>KAPTAN KİLİTLEDİ • KURTARMAYA GEÇ</span>
        </button>
      )}

    </div>
  );
};
