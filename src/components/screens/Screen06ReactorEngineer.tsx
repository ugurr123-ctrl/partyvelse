import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen06ReactorEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { diagnostic } = state;

  // No line selected by default! Starts null unless already selected
  const [selectedLine, setSelectedLine] = useState<'reaktor' | 'sogutucu' | 'anten' | 'yonlendirme' | null>(
    (diagnostic.engineerSuggestedLine as any) || null
  );

  const [coolingValveAngle, setCoolingValveAngle] = useState<number>(diagnostic.engineerValveAngle || 45);
  const [pressureThrottleToggled, setPressureThrottleToggled] = useState<boolean>(
    diagnostic.engineerThrottleActive || false
  );

  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: diagnostic.isSolved ? 'success' : 'idle',
    msg: diagnostic.isSolved ? 'Reaktör basınca tahliye edildi! Devreler stabil.' : '',
  });

  const circuitModules = [
    { key: 'reaktor', code: 'CIR-01', name: 'Ana Reaktör', icon: 'cyclone' },
    { key: 'sogutucu', code: 'CIR-02', name: 'Soğutucu Çekirdek', icon: 'mode_fan' },
    { key: 'anten', code: 'CIR-03', name: 'Anten Ünitesi', icon: 'satellite_alt' },
    { key: 'yonlendirme', code: 'CIR-04', name: 'İtki ve Yönlendirme', icon: 'navigation' },
  ] as const;

  const handleSelectLine = (key: 'reaktor' | 'sogutucu' | 'anten' | 'yonlendirme') => {
    if (diagnostic.isSolved) return;
    setSelectedLine(key);

    if (onAction) {
      onAction('diagnostic_engineer_select_line', { line: key });
    } else {
      onUpdate((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          engineerSuggestedLine: key,
        },
      }));
    }
  };

  const handlePurgePressure = () => {
    if (diagnostic.isSolved || !selectedLine) return;

    if (onAction) {
      onAction('diagnostic_engineer_purge', {
        line: selectedLine,
        valveAngle: coolingValveAngle,
        throttleActive: pressureThrottleToggled,
      });
      return;
    }

    // Local fallback check
    const isBreakerUnlocked = diagnostic.captainSelectedBreaker === diagnostic.correctBreaker;
    if (!isBreakerUnlocked) {
      setFeedback({
        type: 'error',
        msg: 'Güvenlik kilidi devrede! Kaptan ana şebekeden bu hattın güvenlik kesicisini açmadan tahliye vanası çalıştırılamaz.',
      });
      return;
    }

    if (selectedLine !== diagnostic.faultyLine) {
      setFeedback({
        type: 'error',
        msg: 'Hatalı hat tahliyesi! Seçilen devrede çoklu arıza koşulları oluşmamış. Sağlam devreye müdahale edildi. Bütünlük -%10, Süre -15 sn!',
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
      return;
    }

    if (coolingValveAngle !== diagnostic.targetValveAngle) {
      setFeedback({
        type: 'error',
        msg: 'Müdahale başarısız: Soğutma valfi doğru açıda değil. Termal şok riski nedeniyle tahliye güvenlik sistemi tarafından durduruldu.',
      });
      return;
    }

    if (!pressureThrottleToggled) {
      setFeedback({
        type: 'error',
        msg: 'Müdahale başarısız: Basınç tahliyesi devre dışı. Hat basıncı boşaltılmadan devre açılamaz.',
      });
      return;
    }

    // All successful
    const updatedLines = {
      ...diagnostic.lines,
      [diagnostic.faultyLine]: {
        ...diagnostic.lines[diagnostic.faultyLine],
        temp: 54,
        press: 50,
        noise: 36,
        status: 'stabil' as const,
      },
    };

    setFeedback({
      type: 'success',
      msg: 'MÜDAHALE TAMAMLANDI! Arızalı devre başarıyla tahliye edildi ve soğutuldu. Reaktör dengelendi!',
    });

    onUpdate((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        lines: updatedLines,
        engineerActionTaken: true,
        engineerSuggestedLine: selectedLine,
        engineerValveAngle: coolingValveAngle,
        engineerThrottleActive: pressureThrottleToggled,
        isSolved: true,
      },
    }));
  };

  const selectedMod = circuitModules.find((m) => m.key === selectedLine);
  const selectedTelemetry = selectedLine ? diagnostic.lines[selectedLine] : null;

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Sub-header & Role Identification */}
      <div className="pt-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30 shadow-sm">
            <span className="material-symbols-outlined text-[15px]">build</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MÜHENDİS KONSOLU</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#2b273b] border border-[#00eefc]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
            <span className="font-mono text-[9px] text-[#00eefc] font-bold uppercase">4 HAT CANLI SENSÖR</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-sora text-2xl font-bold text-white tracking-tight">Ölçümleri</span>
          <span className="font-sora text-2xl font-extrabold text-[#00eefc] tracking-tight drop-shadow-[0_0_12px_rgba(0,238,252,0.4)]">
            Karşılaştır
          </span>
        </div>
        <p className="text-xs text-[#d5c4ac] font-mono">
          Sensörleri inceleyin, Kaptana aktarın ve arızalı hattı seçerek tahliye uygulayın.
        </p>
      </div>

      {/* 4 Circuits Live Telemetry Comparative Matrix */}
      <div className="mt-3 w-full rounded-2xl bg-[#0f0c1e] p-3 shadow-2xl border border-white/10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00eefc]">table_chart</span>
            DEVRE TELEMETRİ MATRİSİ
          </span>
          <span className="text-[9px] font-mono text-[#d5c4ac]">
            {selectedLine ? `${selectedMod?.code} SEÇİLİ` : 'SEÇİM YOK'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {circuitModules.map((mod) => {
            const data = diagnostic.lines[mod.key];
            const isSelected = selectedLine === mod.key;
            const isSolved = diagnostic.isSolved && data?.status === 'stabil';

            return (
              <button
                key={mod.key}
                type="button"
                onClick={() => handleSelectLine(mod.key)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00eefc]/15 border-[#00eefc] shadow-[0_0_14px_rgba(0,238,252,0.3)] ring-1 ring-[#00eefc]'
                    : isSolved
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-[#1c192c] border-white/5 hover:bg-[#25223a]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#00eefc]">{mod.code}</span>
                    <span className="text-[10px] text-zinc-300 font-medium truncate max-w-[85px]">{mod.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse"></span>
                  )}
                </div>

                {/* Sensor Metrics Readout */}
                <div className="grid grid-cols-3 gap-1 my-2 bg-[#120f24] p-1.5 rounded-lg border border-white/5">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-[#d5c4ac]">ISI</span>
                    <span className={`text-[10px] font-mono font-bold ${data.temp >= 80 || data.temp <= -10 ? 'text-rose-400' : 'text-[#ffdba0]'}`}>
                      {data.temp}°C
                    </span>
                  </div>
                  <div className="flex flex-col items-center border-x border-white/5">
                    <span className="text-[8px] font-mono text-[#d5c4ac]">BASINÇ</span>
                    <span className={`text-[10px] font-mono font-bold ${data.press <= 40 || data.press >= 70 ? 'text-rose-400' : 'text-[#00eefc]'}`}>
                      {data.press}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-[#d5c4ac]">PARAZİT</span>
                    <span className={`text-[10px] font-mono font-bold ${data.noise >= 60 ? 'text-rose-400' : 'text-[#dab5ff]'}`}>
                      {data.noise}dB
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#d5c4ac]">DURUM:</span>
                  <span className={isSolved ? 'text-emerald-400 font-bold' : isSelected ? 'text-[#00eefc] font-bold' : 'text-zinc-400'}>
                    {isSolved ? 'DENGELENDİ' : isSelected ? 'SEÇİLDİ' : 'İNCELE'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical Intervention Console (Active when a line is selected) */}
      <div className={`mt-3 rounded-2xl bg-[#1c192c] p-3.5 flex flex-col gap-3 shadow-xl border transition-all ${
        selectedLine ? 'border-[#00eefc]/30' : 'border-white/5 opacity-75'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00eefc]">tune</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
              TAHLİYE KONTROLLERİ {selectedMod ? `// ${selectedMod.code}` : ''}
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">
            {diagnostic.unlockedBreaker ? (
              <span className="text-emerald-400 font-bold">KESİCİ DEVRE DIŞI</span>
            ) : (
              <span className="text-[#ffb703]">KAPTAN KİLİDİ BEKLENİYOR</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Soğutma Valfi Açısı (Rotary Selectors) */}
          <div className="rounded-xl bg-[#201d30] p-2.5 flex flex-col justify-between border border-white/5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#d5c4ac] uppercase font-bold">Soğutma Valfi</span>
              <span className="font-mono text-[10px] text-[#00eefc] font-bold">{coolingValveAngle}°</span>
            </div>

            {/* Valve Angle Dial Buttons */}
            <div className="grid grid-cols-4 gap-1 my-2">
              {[45, 90, 135, 180].map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setCoolingValveAngle(angle)}
                  className={`py-1.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    coolingValveAngle === angle
                      ? 'bg-[#00eefc] text-[#002022] shadow-[0_0_8px_rgba(0,238,252,0.4)]'
                      : 'bg-[#2b273b] text-[#d5c4ac] hover:bg-[#353147]'
                  }`}
                >
                  {angle}°
                </button>
              ))}
            </div>

            <div className="text-[9px] font-mono text-[#d5c4ac] text-center">
              Kaptanın talimatına göre ayarlayın
            </div>
          </div>

          {/* Basınç Tahliyesi Anahtarı */}
          <div className="rounded-xl bg-[#201d30] p-2.5 flex flex-col justify-between border border-white/5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#d5c4ac] uppercase font-bold">Basınç Tahliyesi</span>
              <span className={`font-mono text-[9px] font-bold ${pressureThrottleToggled ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {pressureThrottleToggled ? 'AKTİF' : 'KAPALI'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPressureThrottleToggled(!pressureThrottleToggled)}
              className={`w-full py-2 my-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                pressureThrottleToggled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                  : 'bg-[#2b273b] text-[#d5c4ac] border-white/5 hover:bg-[#353147]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {pressureThrottleToggled ? 'check_circle' : 'toggle_off'}
              </span>
              <span>{pressureThrottleToggled ? 'TAHLİYE AKTİF' : 'TAHLİYE AÇ'}</span>
            </button>

            <div className="text-[9px] font-mono text-[#d5c4ac] text-center">
              Tahliye vanasını devreye sokar
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {(state.feedbackMessage || feedback.msg) && (
        <div className={`mt-3 p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
          (state.feedbackState === 'success' || (!state.feedbackState && feedback.type === 'success'))
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {state.feedbackMessage || feedback.msg}
        </div>
      )}

      {/* Action Trigger */}
      <div className="mt-3 flex flex-col gap-1.5">
        {!diagnostic.isSolved ? (
          <>
            <button
              onClick={handlePurgePressure}
              disabled={!selectedLine}
              className={`w-full h-14 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                !selectedLine
                  ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed opacity-60 shadow-none'
                  : 'bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 cursor-pointer'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">air</span>
              <span>
                {!selectedLine 
                  ? 'ÖNCE DEVRE / HAT SEÇİN' 
                  : `${selectedMod?.code || ''} İçin Tahliyeyi Uygula`}
              </span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-zinc-400">
              <span className="material-symbols-outlined text-[14px]">info</span>
              <span className="text-[11px] font-mono">
                {!selectedLine 
                  ? 'Sensörleri karşılaştırıp arızalı devreyi işaretleyin' 
                  : 'Kaptan kesiciyi açmadan tahliye uygulanamaz'}
              </span>
            </div>
          </>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>REAKTÖR DENGELENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
