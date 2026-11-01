import React, { useState } from 'react';
import { MissionState, ENVIRONMENTS } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen05ReactorCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { diagnostic, activeEnvironment } = state;
  const envInfo = ENVIRONMENTS[activeEnvironment];

  // No breaker is pre-selected by default! Starts null unless already selected in room state
  const [selectedBreaker, setSelectedBreaker] = useState<'K1' | 'K2' | 'K3' | 'K4' | null>(
    diagnostic.captainSelectedBreaker || null
  );

  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: diagnostic.isSolved ? 'success' : 'idle',
    msg: diagnostic.isSolved ? `${diagnostic.captainSelectedBreaker || 'Kesici'} Devre Dışı • Reaktör Kararlı` : '',
  });

  const handleSelectBreaker = (id: 'K1' | 'K2' | 'K3' | 'K4') => {
    if (diagnostic.isSolved) return;
    setSelectedBreaker(id);
    onUpdate((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        captainSelectedBreaker: id,
      },
    }));
  };

  const handleUnlockAction = () => {
    if (diagnostic.isSolved || !selectedBreaker) return;

    if (onAction) {
      onAction('diagnostic_captain_breaker', { breaker: selectedBreaker });
      return;
    }

    if (selectedBreaker === diagnostic.correctBreaker) {
      const willSolve = diagnostic.engineerActionTaken && 
        diagnostic.engineerSuggestedLine === diagnostic.faultyLine;
      setFeedback({
        type: 'success',
        msg: willSolve 
          ? `GÜVENLİK KİLİDİ AÇILDI! ${selectedBreaker} kesicisi devreyi izole etti. Reaktör dengelendi!`
          : `GÜVENLİK KİLİDİ AÇILDI (${selectedBreaker})! Devre akımı kesildi. Mühendisin tahliye müdahalesi bekleniyor.`,
      });
      onUpdate((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          captainSelectedBreaker: selectedBreaker,
          unlockedBreaker: selectedBreaker,
          isSolved: willSolve,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: `Hatalı kesici seçimi (${selectedBreaker})! İzole edilen hatta aktif bir anomali bulunmuyor; sağlam sistemin enerjisi kesildi. Bütünlük -%10, Süre -15 sn!`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
        diagnostic: {
          ...prev.diagnostic,
          captainSelectedBreaker: selectedBreaker,
        },
      }));
    }
  };

  const isUnlocked = diagnostic.unlockedBreaker === selectedBreaker && selectedBreaker !== null;

  // Circuit modules metadata
  const circuitModules = [
    { key: 'reaktor', code: 'CIR-01', name: 'Ana Reaktör', icon: 'cyclone' },
    { key: 'sogutucu', code: 'CIR-02', name: 'Soğutucu Çekirdek', icon: 'mode_fan' },
    { key: 'anten', code: 'CIR-03', name: 'Anten Ünitesi', icon: 'satellite_alt' },
    { key: 'yonlendirme', code: 'CIR-04', name: 'İtki ve Yönlendirme', icon: 'navigation' },
  ] as const;

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      <div className="w-full flex flex-col gap-3 pt-1">
        
        {/* Sub-header & Role Indicator */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb703]/20 text-[#ffb703] border border-[#ffb703]/30 shadow-[0_0_12px_rgba(255,183,3,0.25)]">
              <span className="material-symbols-outlined text-[15px]">military_tech</span>
              <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN KONSOLU</span>
            </div>
            <span className="text-[10px] font-mono text-[#00eefc] px-2.5 py-0.5 rounded-lg bg-[#00eefc]/10 border border-[#00eefc]/20">
              {envInfo.badge}
            </span>
          </div>
          <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight leading-tight mt-0.5">
            Arızalı Devreyi <span className="text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.5)]">Teşhis Et</span>
          </h2>
          <p className="text-xs text-[#d5c4ac] font-mono">
            Mühendisin sensör ölçümlerini kurallarla karşılaştırın ve doğru kesiciyi açın.
          </p>
        </div>

        {/* Space Station Circuit to Breaker Wiring Matrix */}
        <div className="w-full rounded-2xl bg-[#0f0c1e] p-3.5 flex flex-col gap-2.5 shadow-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white">
              <span className="material-symbols-outlined text-[16px] text-[#ffb703]">account_tree</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
                DEVRE – KESİCİ ŞEMASI
              </span>
            </div>
            <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">
              4 MODÜL BAĞLANTISI
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {circuitModules.map((mod) => {
              const breaker = diagnostic.lineBreakerMap[mod.key];
              const isEngineerFocus = diagnostic.engineerSuggestedLine === mod.key;
              const isTargetBreakerSelected = selectedBreaker === breaker;
              const isModuleSolved = diagnostic.isSolved && diagnostic.lines[mod.key]?.status === 'stabil';

              return (
                <div 
                  key={mod.key}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isModuleSolved
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : isTargetBreakerSelected
                      ? 'bg-[#ffb703]/10 border-[#ffb703]/60 shadow-[0_0_10px_rgba(255,183,3,0.2)]'
                      : 'bg-[#1c192c] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#00eefc] font-bold">{mod.code}</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      isTargetBreakerSelected 
                        ? 'bg-[#ffb703] text-[#271900]' 
                        : 'bg-[#2b273b] text-white border border-white/10'
                    }`}>
                      {breaker}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 my-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#d5c4ac]">{mod.icon}</span>
                    <span className="text-xs text-white font-medium truncate">{mod.name}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[9px] font-mono text-[#d5c4ac]">DURUM:</span>
                    {isEngineerFocus ? (
                      <span className="text-[9px] font-mono font-bold text-[#ffb703] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-ping"></span>
                        MÜHENDİS İNCELİYOR
                      </span>
                    ) : isModuleSolved ? (
                      <span className="text-[9px] font-mono font-bold text-emerald-400">STABİL</span>
                    ) : (
                      <span className="text-[9px] font-mono text-[#d5c4ac]">AKTİF</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Protocol & Captain's Purge Instructions */}
        <div className="w-full rounded-2xl bg-[#1c192c] p-3.5 flex flex-col gap-2.5 shadow-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#ffb703]">
              <span className="material-symbols-outlined text-[16px]">rule</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#ffdba0] font-bold">
                {envInfo.name.toUpperCase()} ARIZA KURALI
              </span>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-widest font-bold">
              KAPTAN KILAVUZU
            </span>
          </div>

          <div className="text-xs text-[#e6dff9] font-medium leading-relaxed bg-[#201d30] p-2.5 rounded-xl border border-white/5">
            {envInfo.conditionNote}
          </div>

          {/* Reference Criteria */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#ffdba0] text-[16px] mb-0.5">thermostat</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Sıcaklık Eşiği</span>
              <span className="font-sora text-xs text-[#ffdba0] font-bold">
                {activeEnvironment === 'buzul_istasyonu' ? '≤ -10°C' : '≥ 80°C'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px] mb-0.5">speed</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Basınç Eşiği</span>
              <span className="font-sora text-xs text-[#00eefc] font-bold">
                {activeEnvironment === 'buzul_istasyonu' ? '≥ 70 kPa' : '≤ 40 kPa'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#dab5ff] text-[16px] mb-0.5">airwave</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Parazit Eşiği</span>
              <span className="font-sora text-xs text-[#dab5ff] font-bold">
                {activeEnvironment === 'buzul_istasyonu' ? '≥ 60 dB' : '≥ 65 dB'}
              </span>
            </div>
          </div>

          {/* Verbal Instruction for Engineer Valve Angle */}
          <div className="bg-[#26223a] p-2.5 rounded-xl border border-[#ffb703]/20 flex items-start gap-2">
            <span className="material-symbols-outlined text-[#ffb703] text-[18px] mt-0.5 shrink-0">chat</span>
            <div className="flex flex-col gap-0.5 text-[11px] leading-snug">
              <span className="font-bold text-[#ffdba0]">Mühendise İletilecek Tahliye Kuralı:</span>
              <span className="text-[#d5c4ac]">
                Doğru kesici açıldıktan sonra Soğutma Valfi <strong className="text-[#00eefc]">{diagnostic.targetValveAngle}°</strong> konumuna getirilmeli ve <strong className="text-[#ffb703]">Basınç Tahliyesi AKTİF</strong> edilmelidir. Mühendise bu parametreleri sözlü aktarın.
              </span>
            </div>
          </div>
        </div>

        {/* Partner Communication Banner */}
        <div className="w-full px-3.5 py-2.5 rounded-xl bg-[#2b273b] flex items-center justify-between shadow-md border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00eefc]/20 flex items-center justify-center text-[#00eefc]">
              <span className="material-symbols-outlined text-[18px]">engineering</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#d5c4ac]">Mühendis İletişimi</span>
              <span className="font-mono text-xs font-bold text-white">
                {diagnostic.engineerActionTaken ? (
                  <span className="text-emerald-400">
                    Fiziksel Tahliye Uygulandı ({diagnostic.engineerSuggestedLine?.toUpperCase() || ''})
                  </span>
                ) : diagnostic.engineerSuggestedLine ? (
                  <span className="text-[#ffb703]">
                    {diagnostic.engineerSuggestedLine.toUpperCase()} devresini bildirdi
                  </span>
                ) : (
                  <span className="text-[#00eefc]">Ölçüm alıyor / İletişim bekleniyor</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#d5c4ac]">
            <span className={`w-2 h-2 rounded-full ${diagnostic.engineerActionTaken ? 'bg-emerald-400' : 'bg-[#00eefc] animate-ping'}`}></span>
          </div>
        </div>

        {/* Breaker Selection Console (K1 - K4) */}
        <div className="w-full rounded-2xl bg-[#0f0c1e] p-3.5 flex flex-col gap-2.5 shadow-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase text-[#d5c4ac] tracking-wider font-bold">KESİCİ SEÇİMİ</span>
              <span className="text-[10px] text-zinc-400 font-mono">({selectedBreaker ? `${selectedBreaker} Seçili` : 'Seçim Yapılmadı'})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-emerald-400' : selectedBreaker ? 'bg-[#ffb703]' : 'bg-zinc-500'}`}></span>
              <span className="font-mono text-[9px] text-[#ffb703] font-bold uppercase">
                {isUnlocked ? 'KİLİT AÇIK' : 'GÜVENLİK KİLİDİ'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(['K1', 'K2', 'K3', 'K4'] as const).map((id) => {
              const isSelected = selectedBreaker === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectBreaker(id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#ffb703]/25 border-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.4)] scale-102' 
                      : 'bg-[#201d30] border-white/5 text-[#d5c4ac] hover:bg-[#2b273b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#ffb703]">
                    {isSelected ? 'toggle_on' : 'toggle_off'}
                  </span>
                  <span className={`font-mono text-xs font-bold mt-1 uppercase ${isSelected ? 'text-[#ffb703]' : 'text-white'}`}>
                    {id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Alert if any */}
        {(state.feedbackMessage || feedback.msg) && (
          <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
            (state.feedbackState === 'success' || (!state.feedbackState && feedback.type === 'success'))
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            {state.feedbackMessage || feedback.msg}
          </div>
        )}

        {/* Primary Action Button */}
        {!diagnostic.isSolved ? (
          <div className="w-full flex flex-col items-center gap-1.5 pt-1">
            <button
              onClick={handleUnlockAction}
              disabled={!selectedBreaker}
              className={`w-full h-14 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                !selectedBreaker
                  ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed opacity-60 shadow-none'
                  : 'bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 active:shadow-[0_2px_0_#6b4b00] cursor-pointer'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {!selectedBreaker ? 'lock' : isUnlocked ? 'lock_open' : 'key'}
              </span>
              <span>
                {!selectedBreaker 
                  ? 'KESİCİ SEÇİMİ BEKLENİYOR' 
                  : isUnlocked 
                  ? `${selectedBreaker} Açıldı (Mühendis Bekleniyor)` 
                  : `${selectedBreaker} Güvenlik Kilidini Aç`}
              </span>
            </button>
            <div className="flex items-center gap-1.5 text-zinc-400 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">info</span>
              <span className="text-[11px] font-mono">
                {!selectedBreaker 
                  ? 'Müdahale için şüpheli devreye bağlı K1–K4 kesicisini seçin' 
                  : 'Yanlış kesici seçimi gövde bütünlüğünü düşürür'}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>REAKTÖR DENGELENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}

      </div>
    </div>
  );
};
