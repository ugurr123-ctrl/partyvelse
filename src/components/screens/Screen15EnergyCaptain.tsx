import React, { useState } from 'react';
import { MissionState } from '../../types/game';
import { Zap, ShieldCheck, HeartPulse, Rocket, Lock, CheckCircle2, AlertTriangle, Check } from 'lucide-react';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen15EnergyCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { engineerAllocation, lineLosses, captainMinRequirements, isDraftShared, isLocked } = state.energy;
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: isLocked ? 'success' : 'idle',
    msg: isLocked ? 'Enerji aktarımı kilitlendi! Tüm hayati sistemler besleniyor.' : '',
  });

  // Calculate net effective power sent by engineer
  const effectivePower = {
    yasamDestegi: Math.max(0, engineerAllocation.yasamDestegi - lineLosses.yasamDestegi),
    itki: Math.max(0, engineerAllocation.itki - lineLosses.itki),
    kalkan: Math.max(0, engineerAllocation.kalkan - lineLosses.kalkan),
  };

  const handleLockEnergy = () => {
    if (!isDraftShared) {
      setFeedback({
        type: 'error',
        msg: 'Henüz Mühendisten onaylı enerji taslağı ulaşmadı! Mühendisin taslağı paylaşması bekleniyor.',
      });
      return;
    }

    // Check against secret captain minimum requirements
    const meetsLife = effectivePower.yasamDestegi >= captainMinRequirements.yasamDestegi;
    const meetsThrust = effectivePower.itki >= captainMinRequirements.itki;
    const meetsShield = effectivePower.kalkan >= captainMinRequirements.kalkan;

    if (meetsLife && meetsThrust && meetsShield) {
      setFeedback({
        type: 'success',
        msg: 'ENERJİ KİLİTLENDİ! Dağılım tüm hayati sistemlerin asgari sınırlarını karşılıyor. Kurtarma rotası açıldı!',
      });
      onUpdate((prev) => ({
        ...prev,
        energy: {
          ...prev.energy,
          isLocked: true,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: `YETERSİZ ENERJİ DAĞILIMI! Mühendisin paylaştığı net güç asgari eşikleri karşılamıyor. Mühendise güçleri artırmasını söyleyin! (Ceza: Gövde Bütünlüğü -%10, Süre -15 sn)`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 flex flex-col gap-3.5 text-[#e6dff9] animate-fadeIn">
      
      {/* Header tag */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#ffb703] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-ping"></span>
          AŞAMA 3/4 • ENERJİ DAĞITIMI
        </span>
        <span className="text-[#ffb703] font-bold">KAPTAN GÜÇ MATRİSİ</span>
      </div>

      {/* Secret Minimum Requirements (Kaptan Gizli Kılavuzu) */}
      <div className="p-4 rounded-xl bg-[#1c192c] border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold font-sora text-white">
            <Zap className="w-4 h-4 text-[#ffb703]" />
            <span>ASGARİ ETKİLİ GÜÇ İHTİYAÇLARI (GİZLİ)</span>
          </div>
          <span className="text-[10px] font-mono text-[#ffb703] font-bold">KAPTAN BELGESİ</span>
        </div>

        <p className="text-xs text-[#a59db8] leading-relaxed">
          Geminin çökmemesi ve mürettebatın ölmemesi için sistemlerin net etkili gücü en az şu değerlerde olmalıdır:
        </p>

        {/* 3 Minimum Thresholds */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded-lg bg-[#201d30] border border-white/5">
            <HeartPulse className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] text-[#9e8f78] block">YAŞAM DESTEĞİ</span>
            <span className="text-sm font-bold text-emerald-400">En Az {captainMinRequirements.yasamDestegi} Güç</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#201d30] border border-white/5">
            <Rocket className="w-4 h-4 text-[#00f0ff] mx-auto mb-1" />
            <span className="text-[10px] text-[#9e8f78] block">İTKİ MOTORLARI</span>
            <span className="text-sm font-bold text-[#00f0ff]">En Az {captainMinRequirements.itki} Güç</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#201d30] border border-white/5">
            <ShieldCheck className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-[10px] text-[#9e8f78] block">GÖVDE KALKANI</span>
            <span className="text-sm font-bold text-purple-300">En Az {captainMinRequirements.kalkan} Güç</span>
          </div>
        </div>
      </div>

      {/* Engineer's Shared Draft Readout */}
      <div className="p-4 rounded-xl bg-[#0f0c1e] border border-cyan-500/30 space-y-3 shadow-lg">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold">MÜHENDİSİN PAYLAŞTIĞI DAĞILIM</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isDraftShared ? 'bg-cyan-500/20 text-[#00f0ff]' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {isDraftShared ? 'TASLAK ULAŞTI' : 'TASLAK BEKLENİYOR'}
          </span>
        </div>

        <div className="space-y-2">
          {/* Yaşam Desteği Row */}
          <div className="p-2.5 rounded-lg bg-[#141123] border border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yaşam Desteği Net Güç:</span>
            </div>
            <span className={`font-bold text-sm ${
              effectivePower.yasamDestegi >= captainMinRequirements.yasamDestegi ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {effectivePower.yasamDestegi} Birim
            </span>
          </div>

          {/* İtki Row */}
          <div className="p-2.5 rounded-lg bg-[#141123] border border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Rocket className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>İtki Motorları Net Güç:</span>
            </div>
            <span className={`font-bold text-sm ${
              effectivePower.itki >= captainMinRequirements.itki ? 'text-[#00f0ff]' : 'text-rose-400'
            }`}>
              {effectivePower.itki} Birim
            </span>
          </div>

          {/* Kalkan Row */}
          <div className="p-2.5 rounded-lg bg-[#141123] border border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Gövde Kalkanı Net Güç:</span>
            </div>
            <span className={`font-bold text-sm ${
              effectivePower.kalkan >= captainMinRequirements.kalkan ? 'text-purple-300' : 'text-rose-400'
            }`}>
              {effectivePower.kalkan} Birim
            </span>
          </div>
        </div>

        <div className="text-[10px] text-[#9e8f78] text-center">
          (Not: Mühendisin hat kayıpları sadece mühendis ekranında hesaplanır; buradaki değerler sisteme ulaşan net etkili güçtür.)
        </div>
      </div>

      {/* Rescue Routes Preview (Kaptan Bilir: Kişi sayısı & Yolculuk Süresi) */}
      <div className="p-3.5 rounded-xl bg-[#1c192c] border border-white/10 space-y-2">
        <span className="text-xs font-bold font-sora text-white block">
          Tahliye Rotaları (Kaptan Bilgisi: Süre & Kişi Sayısı)
        </span>
        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-[#201d30] flex items-center justify-between">
            <span className="text-white font-bold">Rota Alfa:</span>
            <span className="text-[#ffb703]">18 Kişi Kurtarılır • Süre: 1.2 dk (Yüksek Risk)</span>
          </div>
          <div className="p-2 rounded-lg bg-[#201d30] flex items-center justify-between">
            <span className="text-white font-bold">Rota Beta:</span>
            <span className="text-[#00f0ff]">12 Kişi Kurtarılır • Süre: 2.5 dk (Dengeli)</span>
          </div>
          <div className="p-2 rounded-lg bg-[#201d30] flex items-center justify-between">
            <span className="text-white font-bold">Rota Gama:</span>
            <span className="text-purple-300">6 Kişi Kurtarılır • Süre: 4.0 dk (Güvenli)</span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.msg && (
        <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Action Button */}
      {!isLocked ? (
        <button
          onClick={handleLockEnergy}
          className="w-full py-3.5 px-4 rounded-xl font-bold font-sora text-sm text-black btn-3d-gold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
        >
          <Lock className="w-4 h-4" />
          <span>ENERJİYİ AKTAR VE KİLİTLE</span>
        </button>
      ) : (
        <button
          onClick={onAdvancePhase}
          className="w-full py-3.5 px-4 rounded-xl font-bold font-sora text-sm text-black btn-3d-cyan flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25 animate-bounce"
        >
          <Check className="w-4 h-4" />
          <span>ENERJİ KİLİTLENDİ • 4. AŞAMA KURTARMAYA GEÇ</span>
        </button>
      )}

    </div>
  );
};
