import React, { useState, useEffect } from 'react';
import { MissionState, Role } from '../../../types/game';
import {
  getOmegaRoleMeta,
  getOmegaRolesForCount,
  getTeamOperationMeta,
} from '../../../services/omegaGameEngine';
import {
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Shield,
  KeyRound,
  Compass,
  Minus,
  Plus,
  Send,
  Lock,
  Flame,
  Waves,
  Zap,
  RotateCcw,
} from 'lucide-react';

interface Props {
  state: MissionState;
  onAction: (actionType: string, data: any) => void;
}

const INTERFERENCE_LABELS: Record<'IC_HAT' | 'DIS_HAT' | 'CAPRAZ_HAT', string> = {
  IC_HAT: 'İç Hat Paraziti',
  DIS_HAT: 'Dış Hat Paraziti',
  CAPRAZ_HAT: 'Çapraz Modül Paraziti',
};

export const ScreenOmegaPlay: React.FC<Props> = ({ state, onAction }) => {
  const omega = state.omegaData;
  const role: Role = state.myRole;
  const playerCount: 3 | 4 =
    state.targetPlayerCount === 3 || omega?.playerCount === 3 ? 3 : 4;
  const meta = getOmegaRoleMeta(role, playerCount);
  const themeMeta = getTeamOperationMeta(omega?.themeId || state.operationTheme);
  const activeRoles = getOmegaRolesForCount(playerCount);

  const roleAccentClass =
    role === 'kaptan'
      ? 'text-[#ffb703]'
      : role === 'muhendis'
      ? 'text-[#00eefc]'
      : role === 'kriptolog'
      ? 'text-[#dab5ff]'
      : 'text-emerald-300';

  // Stage 1 local inputs
  const [pinInput, setPinInput] = useState(omega?.stage1.kriptologSubmittedPin || '');
  const [rawGlyphDigits, setRawGlyphDigits] = useState<number[]>([]);
  const [calcSectorIdx, setCalcSectorIdx] = useState<number>(0);
  const [valveAngle, setValveAngle] = useState<45 | 90 | 135 | 180>(
    omega?.stage1.muhendisValveAngle || 45
  );
  const [pumpTier, setPumpTier] = useState<1 | 2 | 3 | 4 | 5>(
    omega?.stage1.muhendisPumpTier || 1
  );
  const [polarity, setPolarity] = useState<'ALFA' | 'BETA' | 'GAMA'>(
    omega?.stage1.shieldPolarity || 'ALFA'
  );
  const [subChannel, setSubChannel] = useState<'X1' | 'X2' | 'X3'>(
    omega?.stage1.shieldSubChannel || 'X1'
  );

  // Stage 2 local inputs
  const [oscA, setOscA] = useState<number>(omega?.stage2.muhendisOscA ?? 3);
  const [oscB, setOscB] = useState<number>(omega?.stage2.muhendisOscB ?? 3);
  const [calcKey, setCalcKey] = useState<'K1' | 'K2' | 'K3'>('K1');
  const [calcNoise, setCalcNoise] = useState<number>(18);
  const [calcDrift, setCalcDrift] = useState<number>(2);
  const [freqInput, setFreqInput] = useState(omega?.stage2.kriptologFreqCode || '');
  const [pulseModeInput, setPulseModeInput] = useState<'P-1' | 'P-2' | 'P-3'>(
    omega?.stage2.kriptologPulseMode || 'P-1'
  );
  const [sourceInput, setSourceInput] = useState<'IC_HAT' | 'DIS_HAT' | 'CAPRAZ_HAT'>(
    omega?.stage2.defenseSource || 'IC_HAT'
  );
  const [filterRelayInput, setFilterRelayInput] = useState<'F1' | 'F2' | 'F3'>(
    omega?.stage2.defenseFilterRelay || 'F1'
  );

  // Stage 3 local inputs (12 MW 4-bar)
  const [itki, setItki] = useState(omega?.stage3.muhendisItki ?? 3);
  const [kalkan, setKalkan] = useState(omega?.stage3.muhendisKalkan ?? 3);
  const [yasam, setYasam] = useState(omega?.stage3.muhendisYasam ?? 3);
  const [sogutma, setSogutma] = useState(omega?.stage3.muhendisSogutma ?? 3);
  const [checksumInput, setChecksumInput] = useState(omega?.stage3.kriptologChecksum || '');
  const [bandInput, setBandInput] = useState<'HF-1' | 'HF-2' | 'HF-3' | 'HF-4'>(
    omega?.stage3.kriptologBand || 'HF-1'
  );
  const [calcItki, setCalcItki] = useState(3);
  const [calcKalkan, setCalcKalkan] = useState(3);
  const [calcYasam, setCalcYasam] = useState(3);
  const [calcSogutma, setCalcSogutma] = useState(3);
  const [quadrantInput, setQuadrantInput] = useState<'KUZEY' | 'DOGU' | 'GUNEY' | 'BATI'>(
    omega?.stage3.defenseQuadrant || 'KUZEY'
  );
  const [firewallInput, setFirewallInput] = useState<1 | 2 | 3 | 4>(
    omega?.stage3.defenseFirewallLevel || 1
  );
  const [cipherTagInput, setCipherTagInput] = useState<'A' | 'B' | 'C' | 'D'>(
    omega?.stage3.defenseCipherTag || 'A'
  );

  // Stage 4 local inputs
  const [relaySeqInput, setRelaySeqInput] = useState<Array<'R1' | 'R2' | 'R3'>>(
    omega?.stage4.muhendisRelaySeq || []
  );
  const [emergencyPsiInput, setEmergencyPsiInput] = useState<number>(
    omega?.stage4.muhendisEmergencyPsi ?? 60
  );
  const [kripTokenInput, setKripTokenInput] = useState(omega?.stage4.kriptologBreachToken || '');
  const [defenseBulkheadInput, setDefenseBulkheadInput] = useState<'B1' | 'B2' | 'B3' | 'B4'>(
    omega?.stage4.defenseBulkhead || 'B1'
  );
  const [defenseTokenInput, setDefenseTokenInput] = useState(omega?.stage4.defenseTokenInput || '');

  // Stage 5 local inputs
  const [routeInput, setRouteInput] = useState<'ALFA' | 'BETA' | 'GAMA'>(
    omega?.stage5.captainSelectedRoute || 'ALFA'
  );
  const [fuelInput, setFuelInput] = useState(omega?.stage5.muhendisFuelPct ?? 50);
  const [auxPowerInput, setAuxPowerInput] = useState(omega?.stage5.muhendisAuxPower ?? 20);
  const [beaconInput, setBeaconInput] = useState(omega?.stage5.kriptologLaunchCode || '');
  const [hatchInput, setHatchInput] = useState<'H1' | 'H2' | 'H3' | 'H4'>(
    omega?.stage5.defenseClearedHatch || 'H1'
  );
  const [latchInput, setLatchInput] = useState<'M1' | 'M2' | 'M3'>(
    omega?.stage5.defenseLatchCode || 'M1'
  );

  useEffect(() => {
    if (!omega) return;
    setValveAngle(omega.stage1.muhendisValveAngle);
    setPumpTier(omega.stage1.muhendisPumpTier);
    if (omega.stage1.shieldPolarity) setPolarity(omega.stage1.shieldPolarity);
    if (omega.stage1.shieldSubChannel) setSubChannel(omega.stage1.shieldSubChannel);
    if (omega.stage1.kriptologSubmittedPin) setPinInput(omega.stage1.kriptologSubmittedPin);

    setOscA(omega.stage2.muhendisOscA);
    setOscB(omega.stage2.muhendisOscB);
    if (omega.stage2.kriptologFreqCode) setFreqInput(omega.stage2.kriptologFreqCode);
    if (omega.stage2.kriptologPulseMode) setPulseModeInput(omega.stage2.kriptologPulseMode);
    if (omega.stage2.defenseSource) setSourceInput(omega.stage2.defenseSource);
    if (omega.stage2.defenseFilterRelay) setFilterRelayInput(omega.stage2.defenseFilterRelay);

    setItki(omega.stage3.muhendisItki);
    setKalkan(omega.stage3.muhendisKalkan);
    setYasam(omega.stage3.muhendisYasam);
    setSogutma(omega.stage3.muhendisSogutma);
    if (omega.stage3.kriptologChecksum) setChecksumInput(omega.stage3.kriptologChecksum);
    if (omega.stage3.kriptologBand) setBandInput(omega.stage3.kriptologBand);
    if (omega.stage3.defenseQuadrant) setQuadrantInput(omega.stage3.defenseQuadrant);
    setFirewallInput(omega.stage3.defenseFirewallLevel);
    if (omega.stage3.defenseCipherTag) setCipherTagInput(omega.stage3.defenseCipherTag);

    setRelaySeqInput(omega.stage4.muhendisRelaySeq);
    setEmergencyPsiInput(omega.stage4.muhendisEmergencyPsi);
    if (omega.stage4.kriptologBreachToken) setKripTokenInput(omega.stage4.kriptologBreachToken);
    if (omega.stage4.defenseBulkhead) setDefenseBulkheadInput(omega.stage4.defenseBulkhead);
    if (omega.stage4.defenseTokenInput) setDefenseTokenInput(omega.stage4.defenseTokenInput);

    if (omega.stage5.captainSelectedRoute) setRouteInput(omega.stage5.captainSelectedRoute);
    setFuelInput(omega.stage5.muhendisFuelPct);
    setAuxPowerInput(omega.stage5.muhendisAuxPower);
    if (omega.stage5.kriptologLaunchCode) setBeaconInput(omega.stage5.kriptologLaunchCode);
    if (omega.stage5.defenseClearedHatch) setHatchInput(omega.stage5.defenseClearedHatch);
    if (omega.stage5.defenseLatchCode) setLatchInput(omega.stage5.defenseLatchCode);
  }, [state.roundId, omega?.activeStage]);

  useEffect(() => {
    if (!omega) return;
    if (!omega.stage4.muhendisStabilized && omega.stage4.muhendisRelaySeq.length === 0) {
      setRelaySeqInput([]);
    } else if (omega.stage4.muhendisRelaySeq.length > 0) {
      setRelaySeqInput(omega.stage4.muhendisRelaySeq);
    }
  }, [state.roundId, omega?.activeStage, omega?.stage4.muhendisStabilized, omega?.stage4.muhendisRelaySeq.length]);

  if (!omega) {
    return (
      <div className="w-full max-w-[460px] mx-auto p-6 rounded-3xl bg-[#141123] border border-white/10 text-center text-sm text-[#d5c4ac]">
        {themeMeta.shortTitle} görev verisi yükleniyor...
      </div>
    );
  }

  const stage = omega.activeStage;
  const s1 = omega.stage1;
  const s2 = omega.stage2;
  const s3 = omega.stage3;
  const s4 = omega.stage4;
  const s5 = omega.stage5;

  const isRoleDone = (r: Role): boolean => {
    if (stage === 1) {
      if (r === 'kaptan') {
        const capOk = Boolean(s1.captainSelectedSector);
        return playerCount === 3 ? capOk && s1.shieldSafetyUnlocked : capOk;
      }
      if (r === 'muhendis') return s1.muhendisPurgeReady;
      if (r === 'kriptolog') return s1.kriptologSubmittedPin.length === 4;
      return s1.shieldSafetyUnlocked;
    }
    if (stage === 2) {
      if (r === 'kaptan') {
        return playerCount === 3
          ? s2.captainWaveConfirmed && s2.defenseIsolated
          : s2.captainWaveConfirmed;
      }
      if (r === 'muhendis') return s2.muhendisTuned;
      if (r === 'kriptolog') return s2.kriptologSynced;
      return s2.defenseIsolated;
    }
    if (stage === 3) {
      if (r === 'kaptan') {
        return playerCount === 3
          ? s3.captainOrderConfirmed && s3.defenseLocked
          : s3.captainOrderConfirmed;
      }
      if (r === 'muhendis') return s3.muhendisLocked;
      if (r === 'kriptolog') return s3.kriptologLocked;
      return s3.defenseLocked;
    }
    if (stage === 4) {
      if (r === 'kaptan') {
        return playerCount === 3
          ? s4.captainAuthorized && s4.defenseContained
          : s4.captainAuthorized;
      }
      if (r === 'muhendis') return s4.muhendisStabilized;
      if (r === 'kriptolog') return s4.kriptologOverridden;
      return s4.defenseContained;
    }
    if (r === 'kaptan') {
      return playerCount === 3
        ? s5.captainFinalLocked && s5.defenseFinalSealed
        : s5.captainFinalLocked;
    }
    if (r === 'muhendis') return s5.muhendisThrusterArmed;
    if (r === 'kriptolog') return s5.kriptologBeaconSent;
    return s5.defenseFinalSealed;
  };

  // Stage 1 Kriptolog helpers from RAW 4 digits
  const pinDigits = pinInput.replace(/[^0-9]/g, '').slice(0, 4);
  const rawDigitSum =
    rawGlyphDigits.length === 4
      ? rawGlyphDigits.reduce((a, b) => a + b, 0)
      : null;
  const derivedValveAngle =
    rawDigitSum !== null
      ? rawDigitSum % 4 === 0
        ? 45
        : rawDigitSum % 4 === 1
        ? 90
        : rawDigitSum % 4 === 2
        ? 135
        : 180
      : null;
  const derivedPumpTier = rawDigitSum !== null ? (rawDigitSum % 5) + 1 : null;
  const derivedPolarity =
    rawDigitSum !== null
      ? rawDigitSum % 3 === 0
        ? 'ALFA'
        : rawDigitSum % 3 === 1
        ? 'BETA'
        : 'GAMA'
      : null;
  const derivedSubChannel =
    rawDigitSum !== null
      ? (['X1', 'X2', 'X3'] as const)[(rawDigitSum + calcSectorIdx) % 3]
      : null;

  // Stage 2 Kriptolog frequency calc
  const stage2CalcNumeric = (s2.keyBaseFreqMap[calcKey] || 0) + calcNoise + calcDrift;
  const stage2CalcCode = String(stage2CalcNumeric);
  const stage2DerivedPulse = (['P-1', 'P-2', 'P-3'] as const)[stage2CalcNumeric % 3];

  // Stage 3 Kriptolog checksum calc
  const computedStage3Checksum = String(
    ((calcItki * 2 + calcKalkan * 3 + calcYasam * 5 + calcSogutma * 7) * s3.checksumMultiplier) %
      900 +
      100
  );

  const stageTitle = themeMeta.stageTitles[stage - 1] || `Aşama ${stage}`;
  const mwTotal = itki + kalkan + yasam + sogutma;
  const mwRemaining = s3.totalBudgetMw - mwTotal;

  return (
    <div className="w-full max-w-[460px] mx-auto bg-[#141123] text-[#e6dff9] rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-5 flex flex-col gap-3.5 select-none">
      {/* Top Stage + Role Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="min-w-0">
          <p className="text-[11px] font-mono text-[#9e8f78] uppercase tracking-wider truncate">
            {themeMeta.shortTitle} · {playerCount} Oyuncu · Aşama {stage}/5
          </p>
          <h2 className="font-sora text-base sm:text-lg font-bold text-white truncate">
            {stageTitle}
          </h2>
        </div>
        <div className="text-right shrink-0">
          <span className={`font-sora text-xs font-bold block ${roleAccentClass}`}>
            {meta.shortTitle}
          </span>
          <span className="text-[11px] font-mono text-[#9e8f78] tabular-nums">
            Hata: {omega.teamStats.mistakesCount}
          </span>
        </div>
      </div>

      {/* Team Lock Status Bar */}
      <div className={`grid ${playerCount === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} gap-1.5`}>
        {activeRoles.map((r) => {
          const rMeta = getOmegaRoleMeta(r, playerCount);
          const done = isRoleDone(r);
          const isMe = r === role;
          return (
            <div
              key={r}
              className={`px-2.5 py-2 rounded-xl border text-center transition-colors ${
                done
                  ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                  : isMe
                  ? 'bg-[#201d30] border-[#ffb703]/60 text-white'
                  : 'bg-[#1c192c] border-white/10 text-[#9e8f78]'
              }`}
            >
              <span className="text-[11px] font-sora font-bold block truncate">
                {rMeta.shortTitle}
              </span>
              <span className="text-[10px] font-mono block mt-0.5">
                {done ? 'Kilitli' : isMe ? 'Sende' : 'Bekliyor'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live Feedback Strip */}
      {state.feedbackMessage && (
        <div
          className={`px-3 py-2.5 rounded-xl border text-xs flex items-start gap-2 ${
            state.feedbackState === 'error'
              ? 'bg-rose-500/15 border-rose-400/40 text-rose-200'
              : state.feedbackState === 'success'
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
              : 'bg-[#1c192c] border-white/10 text-[#d5c4ac]'
          }`}
        >
          {state.feedbackState === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#00eefc] shrink-0 mt-0.5" />
          )}
          <span className="leading-snug">{state.feedbackMessage}</span>
        </div>
      )}

      {/* ======================== STAGE 1: 5-Sektör Anomali + Offsetli 4-Glif ======================== */}
      {stage === 1 && role === 'kaptan' && (
        <div className="flex flex-col gap-3">
          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ffb703]">
              <Compass className="w-4 h-4" />
              <span>Arıza Teşhis Kuralı (Yalnızca Komutan Görür)</span>
            </div>
            <p className="text-sm font-medium text-white leading-snug">{s1.ruleDescription}</p>
            <p className="text-xs text-[#9e8f78]">
              Mühendisten S1–S5 tüm sektör değerlerini iste; yalnızca 3 şartı birden sağlayan sektör arızalıdır.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {s1.sectors.map((sec) => {
              const isPicked = s1.captainSelectedSector === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() =>
                    onAction('omega_s1_captain_select_sector', { sectorId: sec.id })
                  }
                  className={`min-h-[54px] p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isPicked
                      ? 'bg-emerald-500/20 border-emerald-400 text-white'
                      : 'bg-[#1c192c] hover:bg-[#25213a] border-white/10 text-[#e6dff9]'
                  }`}
                >
                  <div>
                    <span className="font-sora text-xs font-bold block">{sec.label}</span>
                    <span className="text-[11px] font-mono text-[#ffb703]">
                      {sec.glyphTag.join(' · ')}
                    </span>
                  </div>
                  {isPicked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {s1.captainSelectedSector && (
            <div className="p-3 rounded-2xl bg-[#0f0c1e] border border-[#ffb703]/40 text-center">
              <span className="text-[11px] font-mono text-[#9e8f78] block">
                KRİPTOLOGA OKUNACAK SEKTÖR ({s1.captainSelectedSector}) VE 4 GLİF
              </span>
              <span className="text-xl font-mono font-bold tracking-[0.35em] text-[#ffb703] block mt-1">
                {s1.sectors.find((s) => s.id === s1.captainSelectedSector)?.glyphTag.join(' ')}
              </span>
            </div>
          )}

          {playerCount === 3 && (
            <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>3P · Polarite &amp; Alt Kanal</span>
                </span>
                <span className="font-mono text-[#9e8f78]">Kriptologdan sor</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['ALFA', 'BETA', 'GAMA'] as const).map((pol) => (
                  <button
                    key={pol}
                    type="button"
                    onClick={() => setPolarity(pol)}
                    className={`min-h-[40px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                      polarity === pol
                        ? 'bg-[#00eefc]/20 border-[#00eefc] text-[#00eefc]'
                        : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                    }`}
                  >
                    {pol}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['X1', 'X2', 'X3'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSubChannel(ch)}
                    className={`min-h-[40px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                      subChannel === ch
                        ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                        : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  onAction('omega_s1_defense_lock_shield', {
                    polarity,
                    subChannel,
                    unlock: true,
                  })
                }
                disabled={s1.shieldSafetyUnlocked}
                className={`w-full min-h-[44px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
                  s1.shieldSafetyUnlocked
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                    : 'bg-[#ffb703] hover:bg-[#ffc633] text-[#271900]'
                }`}
              >
                {s1.shieldSafetyUnlocked
                  ? `Kalkan Kilitli (${s1.shieldPolarity} / ${s1.shieldSubChannel})`
                  : 'Polarite & Alt Kanalı Kilitle'}
              </button>
            </div>
          )}
        </div>
      )}

      {stage === 1 && role === 'muhendis' && (
        <div className="flex flex-col gap-3">
          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#00eefc] flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>5 Sektör Canlı Telemetri</span>
              </span>
              <span className="text-[#9e8f78]">Komutana Oku</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {s1.sectors.map((sec) => (
                <div
                  key={sec.id}
                  className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/10 flex flex-col gap-1"
                >
                  <span className="font-sora text-xs font-bold text-white">{sec.label}</span>
                  <div className="text-[11px] font-mono text-[#d5c4ac] tabular-nums space-y-0.5">
                    <div>{themeMeta.telemetryUnits.tempLabel.split(' ')[0]}: <strong className="text-[#ffb703]">{sec.temp}</strong></div>
                    <div>{themeMeta.telemetryUnits.pressLabel.split(' ')[0]}: <strong className="text-[#00eefc]">{sec.pressure}</strong></div>
                    <div>{themeMeta.telemetryUnits.radLabel.split(' ')[0]}: <strong className="text-rose-300">{sec.rad}</strong></div>
                    <div>{themeMeta.telemetryUnits.vibLabel.split(' ')[0]}: <strong className="text-emerald-300">{sec.vibration}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Valf Açısı &amp; Pompa Kademesi</span>
              <span className="font-mono text-[#9e8f78]">Kriptologdan al</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([45, 90, 135, 180] as const).map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setValveAngle(deg)}
                  className={`min-h-[42px] rounded-xl border font-mono text-xs font-bold tabular-nums cursor-pointer ${
                    valveAngle === deg
                      ? 'bg-[#00eefc]/20 border-[#00eefc] text-[#00eefc]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setPumpTier(tier)}
                  className={`min-h-[40px] rounded-xl border font-mono text-xs font-bold tabular-nums cursor-pointer ${
                    pumpTier === tier
                      ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  P{tier}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                onAction('omega_s1_muhendis_set_valve', {
                  angle: valveAngle,
                  pumpTier,
                  purge: true,
                })
              }
              disabled={s1.muhendisPurgeReady}
              className={`w-full min-h-[46px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
                s1.muhendisPurgeReady
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                  : 'bg-[#00eefc] hover:bg-[#3df3ff] text-[#002022]'
              }`}
            >
              {s1.muhendisPurgeReady
                ? `Kilitlendi (${s1.muhendisValveAngle}° / Pompa P${s1.muhendisPumpTier})`
                : `Valf ${valveAngle}° + Pompa P${pumpTier} Kilitle`}
            </button>
          </div>
        </div>
      )}

      {stage === 1 && role === 'kriptolog' && (
        <div className="flex flex-col gap-3">
          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#dab5ff] flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Glif Matrisi (Ham 4 Glifi İşaretle)</span>
              </span>
              {rawGlyphDigits.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRawGlyphDigits([])}
                  className="text-[#9e8f78] hover:text-white cursor-pointer"
                >
                  Sıfırla
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(s1.glyphCipherTable).map(([glyph, digit]) => (
                <button
                  key={glyph}
                  type="button"
                  onClick={() => {
                    if (rawGlyphDigits.length < 4) {
                      setRawGlyphDigits((prev) => [...prev, digit]);
                    }
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[#0f0c1e] hover:bg-[#201d30] border border-white/10 flex items-center justify-between font-mono cursor-pointer"
                >
                  <span className="text-lg text-[#dab5ff]">{glyph}</span>
                  <span className="text-sm font-bold text-white tabular-nums">{digit}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] font-mono text-[#9e8f78]">Arızalı Sektör:</span>
              <div className="flex gap-1">
                {(['S1', 'S2', 'S3', 'S4', 'S5'] as const).map((secLabel, idx) => (
                  <button
                    key={secLabel}
                    type="button"
                    onClick={() => setCalcSectorIdx(idx)}
                    className={`min-h-[34px] px-2 rounded-lg border font-mono text-[11px] font-bold cursor-pointer ${
                      calcSectorIdx === idx
                        ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                        : 'bg-[#0f0c1e] border-white/10 text-[#9e8f78]'
                    }`}
                  >
                    {secLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/10 text-[11px] font-mono space-y-1">
              <div className="text-[#ffb703] font-bold">
                Dönüşüm Kuralı: {s1.cipherRuleDescription}
              </div>
              <div className="text-[#d5c4ac] tabular-nums">
                Ham Rakamlar: {rawGlyphDigits.length > 0 ? rawGlyphDigits.join(' - ') : 'Komutan 4 glif okuyunca dokun'}
              </div>
              {rawDigitSum !== null && (
                <div className="pt-1 border-t border-white/10 text-emerald-300 space-y-0.5 tabular-nums">
                  <div>
                    Ham Toplam: {rawDigitSum} → Mühendis: <strong>{derivedValveAngle}° / Pompa P{derivedPumpTier}</strong>
                  </div>
                  <div>
                    Savunma: <strong>{derivedPolarity} / Alt Kanal {derivedSubChannel}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2">
            <label className="text-xs font-semibold text-white">
              Dönüştürülmüş 4 Haneli PIN Kodunu Gir
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="Örn: 4792"
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#0f0c1e] border border-white/15 focus:border-[#dab5ff] font-mono text-lg font-bold tracking-widest text-white outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() => onAction('omega_s1_kriptolog_submit_pin', { pin: pinDigits })}
                disabled={s1.kriptologSubmittedPin.length === 4}
                className={`min-h-[44px] px-4 rounded-xl font-sora text-xs font-bold cursor-pointer whitespace-nowrap ${
                  s1.kriptologSubmittedPin.length === 4
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                    : 'bg-[#dab5ff] hover:bg-[#e7d0ff] text-[#1a0b2e]'
                }`}
              >
                {s1.kriptologSubmittedPin.length === 4 ? 'PIN Kilitli' : 'PIN Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 1 && role === 'guvenlik' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <Shield className="w-4 h-4" />
            <span>Kalkan Polaritesi &amp; Alt Kanal Kilidi</span>
          </div>
          <p className="text-xs text-[#d5c4ac]">
            Kriptologdan ham glif toplamına göre çıkan Polarite ve Alt Kanalı (X1–X3) iste.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['ALFA', 'BETA', 'GAMA'] as const).map((pol) => (
              <button
                key={pol}
                type="button"
                onClick={() => setPolarity(pol)}
                className={`min-h-[44px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                  polarity === pol
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                }`}
              >
                {pol}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['X1', 'X2', 'X3'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setSubChannel(ch)}
                className={`min-h-[44px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                  subChannel === ch
                    ? 'bg-[#00eefc]/20 border-[#00eefc] text-[#00eefc]'
                    : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              onAction('omega_s1_defense_lock_shield', {
                polarity,
                subChannel,
                unlock: true,
              })
            }
            disabled={s1.shieldSafetyUnlocked}
            className={`w-full min-h-[48px] rounded-xl font-sora text-sm font-bold cursor-pointer ${
              s1.shieldSafetyUnlocked
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                : 'bg-emerald-400 hover:bg-emerald-300 text-[#032418]'
            }`}
          >
            {s1.shieldSafetyUnlocked
              ? `Kalkan Kilitli (${s1.shieldPolarity} / ${s1.shieldSubChannel})`
              : `${polarity} / ${subChannel} Kilitle`}
          </button>
        </div>
      )}

      {/* ======================== STAGE 2: Harmonik Frekans Kalibrasyonu ======================== */}
      {stage === 2 && role === 'kaptan' && (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ffb703]">
              <Waves className="w-4 h-4" />
              <span>Harmonik Dalga &amp; Osilatör Hedefi</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs tabular-nums">
              <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/10">
                <span className="text-[10px] text-[#9e8f78] block">OSİLATÖR A (MÜHENDİS)</span>
                <strong className="text-lg text-[#00eefc]">{s2.targetOscA}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/10">
                <span className="text-[10px] text-[#9e8f78] block">OSİLATÖR B (MÜHENDİS)</span>
                <strong className="text-lg text-[#00eefc]">{s2.targetOscB}</strong>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0f0c1e] border border-white/10 text-xs font-mono flex items-center justify-between">
              <span className="text-[#9e8f78]">Mod: <strong className="text-white">{s2.targetBandMode}</strong></span>
              <span className="text-[#dab5ff]">Anahtar (Kriptolog için): <strong>{s2.targetBandKey}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => onAction('omega_s2_captain_confirm_wave', {})}
              disabled={s2.captainWaveConfirmed}
              className={`w-full min-h-[46px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
                s2.captainWaveConfirmed
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                  : 'bg-[#ffb703] hover:bg-[#ffc633] text-[#271900]'
              }`}
            >
              {s2.captainWaveConfirmed ? 'Dalga Profili Onaylandı' : 'Harmonik Profili Onayla'}
            </button>
          </div>

          {playerCount === 3 && (
            <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-300">3P · Parazit İzolasyonu</span>
                <span className="font-mono text-rose-300 font-bold">
                  {INTERFERENCE_LABELS[s2.interferenceSource]}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['IC_HAT', 'DIS_HAT', 'CAPRAZ_HAT'] as const).map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSourceInput(src)}
                    className={`min-h-[40px] px-2 rounded-xl border font-mono text-[10px] font-bold cursor-pointer ${
                      sourceInput === src
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                    }`}
                  >
                    {src.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#9e8f78]">Filtre Rölesi (Kriptologdan):</span>
                <div className="flex gap-1.5">
                  {(['F1', 'F2', 'F3'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilterRelayInput(f)}
                      className={`min-h-[38px] px-3 rounded-lg border font-mono text-xs font-bold cursor-pointer ${
                        filterRelayInput === f
                          ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                          : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onAction('omega_s2_defense_isolate', {
                    source: sourceInput,
                    filterRelay: filterRelayInput,
                    lock: true,
                  })
                }
                disabled={s2.defenseIsolated}
                className={`w-full min-h-[44px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
                  s2.defenseIsolated
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-[#032418]'
                }`}
              >
                {s2.defenseIsolated ? 'Parazit İzole Edildi' : 'Filtre Rölesini Kilitle'}
              </button>
            </div>
          )}
        </div>
      )}

      {stage === 2 && role === 'muhendis' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
          <div className="p-3 rounded-xl bg-[#0f0c1e] border border-[#00eefc]/30 text-xs font-mono space-y-1 tabular-nums">
            <span className="text-[#9e8f78] block">KRİPTOLOGA OKUNACAK ÖLÇÜMLER:</span>
            <div className="flex items-center justify-between">
              <span>Parazit Gürültüsü: <strong className="text-[#ffb703]">{s2.measuredNoiseDb} dB</strong></span>
              <span>Sapma: <strong className="text-[#00eefc]">+{s2.resonanceDrift}</strong></span>
            </div>
          </div>

          {[
            { label: 'Osilatör A (Komutandan al)', val: oscA, set: setOscA },
            { label: 'Osilatör B (Komutandan al)', val: oscB, set: setOscB },
          ].map((row) => (
            <div
              key={row.label}
              className="p-3 rounded-xl bg-[#0f0c1e] border border-white/10 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-white block">{row.label}</span>
                <span className="font-mono text-base font-bold text-[#00eefc] tabular-nums">{row.val}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => row.set((v) => Math.max(1, v - 1))}
                  className="w-10 h-10 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/10 flex items-center justify-center text-white cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => row.set((v) => Math.min(9, v + 1))}
                  className="w-10 h-10 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/10 flex items-center justify-center text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              onAction('omega_s2_muhendis_tune', { oscA, oscB, lock: true })
            }
            disabled={s2.muhendisTuned}
            className={`w-full min-h-[48px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
              s2.muhendisTuned
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                : 'bg-[#00eefc] hover:bg-[#3df3ff] text-[#002022]'
            }`}
          >
            {s2.muhendisTuned ? `Osilatörler Kilitli (${s2.muhendisOscA} / ${s2.muhendisOscB})` : 'Osilatörleri Senkronize Et'}
          </button>
        </div>
      )}

      {stage === 2 && role === 'kriptolog' && (
        <div className="flex flex-col gap-3">
          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#dab5ff] font-bold">Frekans = Taban(Anahtar) + dB + Sapma</span>
              <span className="text-emerald-300 font-bold">Filtre Rölesi: {s2.requiredFilterRelay}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-xs tabular-nums">
              {(['K1', 'K2', 'K3'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setCalcKey(k)}
                  className={`min-h-[42px] rounded-xl border font-bold cursor-pointer ${
                    calcKey === k
                      ? 'bg-[#dab5ff]/20 border-[#dab5ff] text-white'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  {k}: {s2.keyBaseFreqMap[k]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[#9e8f78] w-full text-[10px]">PARAZİT dB (MÜHENDİS):</span>
                {[18, 24, 30, 36].map((db) => (
                  <button
                    key={db}
                    type="button"
                    onClick={() => setCalcNoise(db)}
                    className={`min-h-[34px] px-2 rounded-lg border font-bold cursor-pointer tabular-nums ${
                      calcNoise === db
                        ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                        : 'bg-[#0f0c1e] border-white/10 text-[#9e8f78]'
                    }`}
                  >
                    {db}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[#9e8f78] w-full text-[10px]">SAPMA (MÜHENDİS):</span>
                {[2, 4, 6].map((dr) => (
                  <button
                    key={dr}
                    type="button"
                    onClick={() => setCalcDrift(dr)}
                    className={`min-h-[34px] px-2.5 rounded-lg border font-bold cursor-pointer tabular-nums ${
                      calcDrift === dr
                        ? 'bg-[#00eefc]/20 border-[#00eefc] text-[#00eefc]'
                        : 'bg-[#0f0c1e] border-white/10 text-[#9e8f78]'
                    }`}
                  >
                    +{dr}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFreqInput(stage2CalcCode);
                setPulseModeInput(stage2DerivedPulse);
              }}
              className="min-h-[38px] px-3 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/10 text-xs font-mono text-[#dab5ff] cursor-pointer tabular-nums"
            >
              Hesap: {stage2CalcCode} Hz · Darbe: {stage2DerivedPulse} (Aktar)
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
            <div className="grid grid-cols-3 gap-2">
              {(['P-1', 'P-2', 'P-3'] as const).map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPulseModeInput(pm)}
                  className={`min-h-[42px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                    pulseModeInput === pm
                      ? 'bg-[#dab5ff]/20 border-[#dab5ff] text-[#dab5ff]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={freqInput}
                onChange={(e) => setFreqInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="3 Haneli Frekans"
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#0f0c1e] border border-white/15 font-mono text-base font-bold text-white outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() =>
                  onAction('omega_s2_kriptolog_sync', {
                    freqCode: freqInput,
                    pulseMode: pulseModeInput,
                    lock: true,
                  })
                }
                disabled={s2.kriptologSynced}
                className={`min-h-[44px] px-4 rounded-xl font-sora text-xs font-bold cursor-pointer whitespace-nowrap ${
                  s2.kriptologSynced
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                    : 'bg-[#dab5ff] hover:bg-[#e7d0ff] text-[#1a0b2e]'
                }`}
              >
                {s2.kriptologSynced ? 'Kilitli' : 'Frekans Kilitle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 2 && role === 'guvenlik' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-300">Tespit Edilen Parazit Hattı</span>
            <span className="font-mono font-bold text-rose-300">
              {INTERFERENCE_LABELS[s2.interferenceSource]}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['IC_HAT', 'DIS_HAT', 'CAPRAZ_HAT'] as const).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSourceInput(src)}
                className={`min-h-[44px] px-2 rounded-xl border font-mono text-[10px] font-bold cursor-pointer ${
                  sourceInput === src
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                }`}
              >
                {src.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[#9e8f78]">Filtre Rölesi (Kriptologdan):</span>
            <div className="flex gap-1.5">
              {(['F1', 'F2', 'F3'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterRelayInput(f)}
                  className={`min-h-[40px] px-3 rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                    filterRelayInput === f
                      ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onAction('omega_s2_defense_isolate', {
                source: sourceInput,
                filterRelay: filterRelayInput,
                lock: true,
              })
            }
            disabled={s2.defenseIsolated}
            className={`w-full min-h-[48px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
              s2.defenseIsolated
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                : 'bg-emerald-400 hover:bg-emerald-300 text-[#032418]'
            }`}
          >
            {s2.defenseIsolated ? 'Parazit İzole Edildi' : 'Parazit İzolasyonunu Kilitle'}
          </button>
        </div>
      )}

      {/* ======================== STAGE 3: 12 MW 4-Baralı Güç & Savunma ======================== */}
      {stage === 3 && role === 'kaptan' && (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
            <span className="text-xs font-semibold text-[#ffb703]">
              12 MW 4-Baralı Hedef Dağılım (Mühendis &amp; Kriptologa Oku)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono tabular-nums">
              <div className="p-2 rounded-xl bg-[#0f0c1e] border border-white/10">
                <span className="text-[10px] text-[#9e8f78] block">İTKİ</span>
                <span className="text-base font-bold text-[#ffb703]">{s3.targetItki} MW</span>
              </div>
              <div className="p-2 rounded-xl bg-[#0f0c1e] border border-white/10">
                <span className="text-[10px] text-[#9e8f78] block">KALKAN</span>
                <span className="text-base font-bold text-[#00eefc]">{s3.targetKalkan} MW</span>
              </div>
              <div className="p-2 rounded-xl bg-[#0f0c1e] border border-white/10">
                <span className="text-[10px] text-[#9e8f78] block">YAŞAM</span>
                <span className="text-base font-bold text-emerald-300">{s3.targetYasam} MW</span>
              </div>
              <div className="p-2 rounded-xl bg-[#0f0c1e] border border-white/10">
                <span className="text-[10px] text-[#9e8f78] block">SOĞUTMA</span>
                <span className="text-base font-bold text-sky-300">{s3.targetSogutma} MW</span>
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#0f0c1e] border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-[#9e8f78]">Taşıyıcı Bant (Kriptolog için):</span>
              <strong className="text-[#dab5ff]">{s3.carrierBand}</strong>
            </div>
            <button
              type="button"
              onClick={() => onAction('omega_s3_captain_confirm_orders', {})}
              disabled={s3.captainOrderConfirmed}
              className={`w-full min-h-[46px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
                s3.captainOrderConfirmed
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                  : 'bg-[#ffb703] hover:bg-[#ffc633] text-[#271900]'
              }`}
            >
              {s3.captainOrderConfirmed ? '12 MW Güç Emri Onaylandı' : '12 MW Güç Emrini Onayla'}
            </button>
          </div>

          {playerCount === 3 && (
            <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-300">3P · Tehdit Savunması</span>
                <span className="font-mono text-rose-300 font-bold">Radar: {s3.threatQuadrant}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['KUZEY', 'DOGU', 'GUNEY', 'BATI'] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuadrantInput(q)}
                    className={`min-h-[38px] rounded-xl border font-mono text-[11px] font-bold cursor-pointer ${
                      quadrantInput === q
                        ? 'bg-[#00eefc]/20 border-[#00eefc] text-[#00eefc]'
                        : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#9e8f78]">Duvar (1–4):</span>
                <div className="flex gap-1">
                  {([1, 2, 3, 4] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFirewallInput(lvl)}
                      className={`min-h-[36px] px-2.5 rounded-lg border font-mono text-xs font-bold cursor-pointer ${
                        firewallInput === lvl
                          ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                          : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                      }`}
                    >
                      S{lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#9e8f78]">Etiket (Kriptologdan):</span>
                <div className="flex gap-1">
                  {(['A', 'B', 'C', 'D'] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCipherTagInput(tag)}
                      className={`min-h-[36px] px-2.5 rounded-lg border font-mono text-xs font-bold cursor-pointer ${
                        cipherTagInput === tag
                          ? 'bg-[#dab5ff]/20 border-[#dab5ff] text-[#dab5ff]'
                          : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onAction('omega_s3_defense_lock', {
                    quadrant: quadrantInput,
                    firewallLevel: firewallInput,
                    cipherTag: cipherTagInput,
                    lock: true,
                  })
                }
                disabled={s3.defenseLocked}
                className={`w-full min-h-[44px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
                  s3.defenseLocked
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-[#032418]'
                }`}
              >
                {s3.defenseLocked ? 'Savunma Kilitlendi' : 'Tehdit Savunmasını Kilitle'}
              </button>
            </div>
          )}
        </div>
      )}

      {stage === 3 && role === 'muhendis' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#00eefc] flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>12 MW 4-Baralı Güç Matrisi</span>
            </span>
            <span
              className={`font-mono font-bold tabular-nums ${
                mwRemaining === 0 ? 'text-emerald-300' : mwRemaining < 0 ? 'text-rose-400' : 'text-[#ffb703]'
              }`}
            >
              {mwTotal}/12 MW
            </span>
          </div>

          {[
            { label: 'İtki Motorları', val: itki, set: setItki, colorClass: 'text-[#ffb703]' },
            { label: 'Kalkan Jeneratörü', val: kalkan, set: setKalkan, colorClass: 'text-[#00eefc]' },
            { label: 'Yaşam Desteği', val: yasam, set: setYasam, colorClass: 'text-emerald-300' },
            { label: 'Soğutma Çekirdeği', val: sogutma, set: setSogutma, colorClass: 'text-sky-300' },
          ].map((row) => (
            <div
              key={row.label}
              className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/10 flex items-center justify-between gap-2"
            >
              <div>
                <span className="text-xs font-semibold text-white block">{row.label}</span>
                <span className={`font-mono text-sm font-bold tabular-nums ${row.colorClass}`}>
                  {row.val} MW
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => row.set((v) => Math.max(0, v - 1))}
                  className="w-10 h-10 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/10 flex items-center justify-center text-white cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => row.set((v) => Math.min(12, v + 1))}
                  className="w-10 h-10 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/10 flex items-center justify-center text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              onAction('omega_s3_muhendis_allocate', {
                itki,
                kalkan,
                yasam,
                sogutma,
                lock: true,
              })
            }
            disabled={s3.muhendisLocked}
            className={`w-full min-h-[48px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
              s3.muhendisLocked
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                : 'bg-[#00eefc] hover:bg-[#3df3ff] text-[#002022]'
            }`}
          >
            {s3.muhendisLocked ? '12 MW Güç Matrisi Kilitli' : '12 MW Dağılımını Kilitle'}
          </button>
        </div>
      )}

      {stage === 3 && role === 'kriptolog' && (
        <div className="flex flex-col gap-3">
          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#9e8f78]">Çarpan: <strong className="text-[#dab5ff]">×{s3.checksumMultiplier}</strong></span>
              <span className="text-emerald-300 font-bold">
                Savunmaya İlet: S{s3.requiredFirewallLevel} / Etiket {s3.secondaryCipherTag}
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#d5c4ac]">
              Formül: ((İtki×2 + Kalkan×3 + Yaşam×5 + Soğutma×7) × {s3.checksumMultiplier}) mod 900 + 100
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              {[
                { label: 'İtki', val: calcItki, set: setCalcItki },
                { label: 'Kalkan', val: calcKalkan, set: setCalcKalkan },
                { label: 'Yaşam', val: calcYasam, set: setCalcYasam },
                { label: 'Soğut', val: calcSogutma, set: setCalcSogutma },
              ].map((item) => (
                <div key={item.label} className="p-2 rounded-xl bg-[#0f0c1e] border border-white/10 text-center">
                  <span className="text-[10px] font-mono text-[#9e8f78] block">{item.label}</span>
                  <div className="flex items-center justify-between mt-1">
                    <button
                      type="button"
                      onClick={() => item.set((v) => Math.max(0, v - 1))}
                      className="w-6 h-7 rounded bg-white/5 text-white cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold tabular-nums">{item.val}</span>
                    <button
                      type="button"
                      onClick={() => item.set((v) => Math.min(12, v + 1))}
                      className="w-6 h-7 rounded bg-white/5 text-white cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setChecksumInput(computedStage3Checksum)}
              className="min-h-[38px] px-3 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/10 text-xs font-mono text-[#dab5ff] cursor-pointer tabular-nums"
            >
              Hesaplanan Sağlama: {computedStage3Checksum} (Koda Aktar)
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              {(['HF-1', 'HF-2', 'HF-3', 'HF-4'] as const).map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => setBandInput(band)}
                  className={`min-h-[40px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                    bandInput === band
                      ? 'bg-[#dab5ff]/20 border-[#dab5ff] text-[#dab5ff]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  {band}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={checksumInput}
                onChange={(e) => setChecksumInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="3 Haneli Sağlama"
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#0f0c1e] border border-white/15 font-mono text-base font-bold text-white outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() =>
                  onAction('omega_s3_kriptolog_unlock', {
                    checksum: checksumInput,
                    band: bandInput,
                    lock: true,
                  })
                }
                disabled={s3.kriptologLocked}
                className={`min-h-[44px] px-4 rounded-xl font-sora text-xs font-bold cursor-pointer whitespace-nowrap ${
                  s3.kriptologLocked
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                    : 'bg-[#dab5ff] hover:bg-[#e7d0ff] text-[#1a0b2e]'
                }`}
              >
                {s3.kriptologLocked ? 'Köprü Açık' : 'Köprüyü Kilitle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 3 && role === 'guvenlik' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-300">Radar Tehdit Yönü</span>
            <span className="font-mono text-base font-bold text-rose-300">{s3.threatQuadrant}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['KUZEY', 'DOGU', 'GUNEY', 'BATI'] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuadrantInput(q)}
                className={`min-h-[42px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                  quadrantInput === q
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[#9e8f78]">Güvenlik Duvarı (Kriptologdan):</span>
            <div className="flex gap-1.5">
              {([1, 2, 3, 4] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFirewallInput(lvl)}
                  className={`min-h-[40px] px-3 rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                    firewallInput === lvl
                      ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  S{lvl}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[#9e8f78]">İkincil Etiket (Kriptologdan):</span>
            <div className="flex gap-1.5">
              {(['A', 'B', 'C', 'D'] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCipherTagInput(tag)}
                  className={`min-h-[40px] px-3 rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                    cipherTagInput === tag
                      ? 'bg-[#dab5ff]/20 border-[#dab5ff] text-[#dab5ff]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onAction('omega_s3_defense_lock', {
                quadrant: quadrantInput,
                firewallLevel: firewallInput,
                cipherTag: cipherTagInput,
                lock: true,
              })
            }
            disabled={s3.defenseLocked}
            className={`w-full min-h-[48px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
              s3.defenseLocked
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                : 'bg-emerald-400 hover:bg-emerald-300 text-[#032418]'
            }`}
          >
            {s3.defenseLocked ? 'Savunma Kalkanı Kilitli' : 'Savunma & Etiketi Kilitle'}
          </button>
        </div>
      )}

      {/* ======================== STAGE 4: Acil Kriz & Sıralı Röle Zinciri ======================== */}
      {stage === 4 && role === 'kaptan' && (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-2xl bg-[#1c192c] border border-rose-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>ACİL KRİZ PROTOKOLÜ</span>
              </span>
              <span className="font-mono font-bold text-[#00eefc] tabular-nums">
                Hedef PSI: {s4.targetEmergencyPsi}
              </span>
            </div>
            <p className="text-sm font-bold text-white">{s4.crisisTitle}</p>
            <div className="p-3 rounded-xl bg-[#0f0c1e] border border-[#ffb703]/40 flex items-center justify-between font-mono text-xs">
              <span className="text-[#9e8f78]">Protokol Kodu (Kriptologa İlet):</span>
              <strong className="text-base text-[#ffb703]">{s4.protocolCode}</strong>
            </div>
            <button
              type="button"
              onClick={() => onAction('omega_s4_captain_authorize', {})}
              disabled={s4.captainAuthorized}
              className={`w-full min-h-[46px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
                s4.captainAuthorized
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                  : 'bg-[#ffb703] hover:bg-[#ffc633] text-[#271900]'
              }`}
            >
              {s4.captainAuthorized ? 'Acil Protokol Yetkilendirildi' : 'Acil Protokol Yetkisini Onayla'}
            </button>
          </div>

          {playerCount === 3 && (
            <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-300">3P · Hasarlı Bölme Yaması</span>
                <span className="font-mono text-rose-300 font-bold">Bölme: {s4.breachedBulkhead}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['B1', 'B2', 'B3', 'B4'] as const).map((bh) => (
                  <button
                    key={bh}
                    type="button"
                    onClick={() => setDefenseBulkheadInput(bh)}
                    className={`min-h-[40px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                      defenseBulkheadInput === bh
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                    }`}
                  >
                    {bh}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={defenseTokenInput}
                  onChange={(e) => setDefenseTokenInput(e.target.value.toUpperCase())}
                  placeholder="Kriptolog Bypass Token"
                  className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#0f0c1e] border border-white/15 font-mono text-sm font-bold text-white uppercase outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    onAction('omega_s4_defense_contain', {
                      bulkhead: defenseBulkheadInput,
                      tokenInput: defenseTokenInput,
                      lock: true,
                    })
                  }
                  disabled={s4.defenseContained}
                  className={`min-h-[44px] px-4 rounded-xl font-sora text-xs font-bold cursor-pointer whitespace-nowrap ${
                    s4.defenseContained
                      ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                      : 'bg-emerald-400 hover:bg-emerald-300 text-[#032418]'
                  }`}
                >
                  {s4.defenseContained ? 'Mühürlü' : 'Bölmeyi Mühürle'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {stage === 4 && role === 'kriptolog' && (
        <div className="flex flex-col gap-3">
          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#dab5ff]">
              Protokol Şalter Kitabı (Komutandan Protokol Kodunu Sor)
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              {(['DELTA-3', 'SIGMA-7', 'OMEGA-9'] as const).map((code) => {
                const entry = s4.protocolRelayBook[code];
                return (
                  <div
                    key={code}
                    className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/10 flex items-center justify-between gap-2"
                  >
                    <strong className="text-[#ffb703]">{code}</strong>
                    <span className="text-[#00eefc]">{entry.seq.join(' → ')}</span>
                    <span className="text-emerald-300 font-bold">{entry.token}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2">
            <label className="text-xs font-semibold text-white">
              Bypass Token Gir (Mühendise şalter sırasını, savunmaya tokenı oku)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={kripTokenInput}
                onChange={(e) => setKripTokenInput(e.target.value.toUpperCase())}
                placeholder="Örn: VX-42"
                className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#0f0c1e] border border-white/15 font-mono text-base font-bold text-white uppercase outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  onAction('omega_s4_kriptolog_override', {
                    token: kripTokenInput,
                    lock: true,
                  })
                }
                disabled={s4.kriptologOverridden}
                className={`min-h-[44px] px-4 rounded-xl font-sora text-xs font-bold cursor-pointer whitespace-nowrap ${
                  s4.kriptologOverridden
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                    : 'bg-[#dab5ff] hover:bg-[#e7d0ff] text-[#1a0b2e]'
                }`}
              >
                {s4.kriptologOverridden ? 'Token Kilitli' : 'Token Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 4 && role === 'muhendis' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#00eefc]">Sıralı 3 Şalter Zinciri (Kriptologdan al)</span>
            <button
              type="button"
              onClick={() => setRelaySeqInput([])}
              className="text-[#9e8f78] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-[#0f0c1e] border border-white/10 font-mono text-sm font-bold text-center text-[#ffb703] tracking-widest">
            {relaySeqInput.length > 0 ? relaySeqInput.join(' → ') : 'Şalter Sırası Bekleniyor (3 Adım)'}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['R1', 'R2', 'R3'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  if (relaySeqInput.length < 3 && !s4.muhendisStabilized) {
                    setRelaySeqInput((prev) => [...prev, r]);
                  }
                }}
                className="min-h-[46px] rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/15 font-mono text-sm font-bold text-white cursor-pointer"
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-xs font-semibold text-white">Acil Tahliye Basıncı (Komutandan)</span>
            <div className="grid grid-cols-4 gap-2">
              {([60, 80, 100, 120] as const).map((psi) => (
                <button
                  key={psi}
                  type="button"
                  onClick={() => setEmergencyPsiInput(psi)}
                  className={`min-h-[42px] rounded-xl border font-mono text-xs font-bold tabular-nums cursor-pointer ${
                    emergencyPsiInput === psi
                      ? 'bg-[#00eefc]/20 border-[#00eefc] text-[#00eefc]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  {psi} PSI
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onAction('omega_s4_muhendis_stabilize', {
                relaySeq: relaySeqInput,
                emergencyPsi: emergencyPsiInput,
                lock: true,
              })
            }
            disabled={s4.muhendisStabilized}
            className={`w-full min-h-[48px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
              s4.muhendisStabilized
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                : 'bg-[#00eefc] hover:bg-[#3df3ff] text-[#002022]'
            }`}
          >
            {s4.muhendisStabilized ? 'Röle Zinciri Stabilize Edildi' : 'Şalter Sırası & Basıncı Kilitle'}
          </button>
        </div>
      )}

      {stage === 4 && role === 'guvenlik' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-300">İhlal Edilen Bölme</span>
            <span className="font-mono text-base font-bold text-rose-300">{s4.breachedBulkhead}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['B1', 'B2', 'B3', 'B4'] as const).map((bh) => (
              <button
                key={bh}
                type="button"
                onClick={() => setDefenseBulkheadInput(bh)}
                className={`min-h-[44px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                  defenseBulkheadInput === bh
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                }`}
              >
                {bh}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={defenseTokenInput}
              onChange={(e) => setDefenseTokenInput(e.target.value.toUpperCase())}
              placeholder="Kriptolog Token (Örn: VX-42)"
              className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#0f0c1e] border border-white/15 font-mono text-sm font-bold text-white uppercase outline-none"
            />
            <button
              type="button"
              onClick={() =>
                onAction('omega_s4_defense_contain', {
                  bulkhead: defenseBulkheadInput,
                  tokenInput: defenseTokenInput,
                  lock: true,
                })
              }
              disabled={s4.defenseContained}
              className={`min-h-[44px] px-4 rounded-xl font-sora text-xs font-bold cursor-pointer whitespace-nowrap ${
                s4.defenseContained
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-[#032418]'
              }`}
            >
              {s4.defenseContained ? 'Mühürlü' : 'Bölmeyi Kapat'}
            </button>
          </div>
        </div>
      )}

      {/* ======================== STAGE 5: Çift Kilitli Tahliye & Fırlatma ======================== */}
      {stage === 5 && role === 'kaptan' && (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#ffb703]">Güvenli Tahliye Emri</span>
              <span className="font-mono font-bold text-[#00eefc] tabular-nums">
                Yakıt %{s5.targetFuelPct} · İtki %{s5.targetAuxPower} · Mandal {s5.targetLatchCode}
              </span>
            </div>
            <p className="text-sm font-medium text-white leading-snug">
              Önerilen Rota: <strong className="text-[#ffb703]">{s5.recommendedRoute}</strong> — {s5.routeSummary}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['ALFA', 'BETA', 'GAMA'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRouteInput(r)}
                  className={`min-h-[44px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                    routeInput === r
                      ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                onAction('omega_s5_captain_route', { route: routeInput, lock: true })
              }
              disabled={s5.captainFinalLocked}
              className={`w-full min-h-[46px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
                s5.captainFinalLocked
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                  : 'bg-[#ffb703] hover:bg-[#ffc633] text-[#271900]'
              }`}
            >
              {s5.captainFinalLocked ? `Rota ${s5.captainSelectedRoute} Kilitli` : 'Tahliye Rotasını Onayla'}
            </button>
          </div>

          {playerCount === 3 && (
            <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-300">3P · Kapak &amp; Güvenlik Mandalı</span>
                <span className="font-mono text-[#9e8f78]">Mühendisten H1–H4</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['H1', 'H2', 'H3', 'H4'] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHatchInput(h)}
                    className={`min-h-[40px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                      hatchInput === h
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['M1', 'M2', 'M3'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setLatchInput(m)}
                    className={`min-h-[40px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                      latchInput === m
                        ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                        : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  onAction('omega_s5_defense_hatch', {
                    hatch: hatchInput,
                    latch: latchInput,
                    seal: true,
                  })
                }
                disabled={s5.defenseFinalSealed}
                className={`w-full min-h-[44px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
                  s5.defenseFinalSealed
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-[#032418]'
                }`}
              >
                {s5.defenseFinalSealed
                  ? `Mühürlendi (${s5.defenseClearedHatch} / ${s5.defenseLatchCode})`
                  : 'Kapağı & Mandalı Mühürle'}
              </button>
            </div>
          )}
        </div>
      )}

      {stage === 5 && role === 'muhendis' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
          <div className="p-3 rounded-xl bg-[#0f0c1e] border border-[#00eefc]/30 flex items-center justify-between text-xs font-mono tabular-nums">
            <div>
              <span className="text-[#9e8f78] block text-[10px]">KAPAK (SAVUNMAYA)</span>
              <strong className="text-base text-[#00eefc]">{s5.obstructedHatch}</strong>
            </div>
            <div className="text-right">
              <span className="text-[#9e8f78] block text-[10px]">KAPAK PIN (KRİPTOLOGA)</span>
              <strong className="text-base text-[#ffb703]">{s5.hatchPin}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#ffb703]" />
              <span>Ana Yakıt Oranı (Komutandan)</span>
            </span>
            <span className="font-mono text-lg font-bold text-[#ffb703] tabular-nums">
              %{fuelInput}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFuelInput((v) => Math.max(50, v - 5))}
              className="w-11 h-11 rounded-xl bg-[#0f0c1e] border border-white/10 flex items-center justify-center cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              {[65, 80, 95].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setFuelInput(pct)}
                  className={`min-h-[44px] rounded-xl border font-mono text-xs font-bold tabular-nums cursor-pointer ${
                    fuelInput === pct
                      ? 'bg-[#00eefc]/20 border-[#00eefc] text-[#00eefc]'
                      : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                  }`}
                >
                  %{pct}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFuelInput((v) => Math.min(100, v + 5))}
              className="w-11 h-11 rounded-xl bg-[#0f0c1e] border border-white/10 flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-semibold text-white">Yardımcı İtki Yüzdesi</span>
            <span className="font-mono text-base font-bold text-[#00eefc] tabular-nums">
              %{auxPowerInput}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[20, 30, 40].map((aux) => (
              <button
                key={aux}
                type="button"
                onClick={() => setAuxPowerInput(aux)}
                className={`min-h-[42px] rounded-xl border font-mono text-xs font-bold tabular-nums cursor-pointer ${
                  auxPowerInput === aux
                    ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                    : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                }`}
              >
                %{aux}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              onAction('omega_s5_muhendis_fuel', {
                fuelPct: fuelInput,
                auxPower: auxPowerInput,
                arm: true,
              })
            }
            disabled={s5.muhendisThrusterArmed}
            className={`w-full min-h-[48px] rounded-xl font-sora text-xs font-bold cursor-pointer ${
              s5.muhendisThrusterArmed
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                : 'bg-[#00eefc] hover:bg-[#3df3ff] text-[#002022]'
            }`}
          >
            {s5.muhendisThrusterArmed
              ? `İticiler Hazır (%${s5.muhendisFuelPct} / %${s5.muhendisAuxPower})`
              : `Ana Yakıt %${fuelInput} + İtki %${auxPowerInput} Kilitle`}
          </button>
        </div>
      )}

      {stage === 5 && role === 'kriptolog' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
          <span className="text-xs font-semibold text-[#dab5ff]">
            Bileşik Fırlatma Kodu = ROTA_KODU + "-" + KAPAK_PIN
          </span>
          <div className="space-y-1.5 font-mono text-xs">
            {(['ALFA', 'BETA', 'GAMA'] as const).map((r) => (
              <div
                key={r}
                className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/10 flex items-center justify-between"
              >
                <span className="text-[#9e8f78]">Rota {r} Ön-Kodu:</span>
                <strong className="text-[#ffb703]">{s5.routeLaunchCodes[r]}</strong>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#d5c4ac]">
            Komutandan seçilen rotayı, Mühendisten 2 haneli kapak PIN’ini alıp araya tire koy (örn: 6-A-6-48).
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={beaconInput}
              onChange={(e) => setBeaconInput(e.target.value.toUpperCase())}
              placeholder="Örn: 6-A-6-48"
              className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#0f0c1e] border border-white/15 font-mono text-sm font-bold text-white uppercase outline-none"
            />
            <button
              type="button"
              onClick={() =>
                onAction('omega_s5_kriptolog_beacon', { code: beaconInput, send: true })
              }
              disabled={s5.kriptologBeaconSent}
              className={`min-h-[44px] px-4 rounded-xl font-sora text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                s5.kriptologBeaconSent
                  ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                  : 'bg-[#dab5ff] hover:bg-[#e7d0ff] text-[#1a0b2e]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{s5.kriptologBeaconSent ? 'Gönderildi' : 'İşaretçiyi Ateşle'}</span>
            </button>
          </div>
        </div>
      )}

      {stage === 5 && role === 'guvenlik' && (
        <div className="p-4 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <Lock className="w-4 h-4" />
            <span>Son Tahliye Kapağı &amp; Mandal Kilidi</span>
          </div>
          <p className="text-xs text-[#d5c4ac]">
            Mühendisten tıkalı kapak numarasını (H1–H4), Komutandan mandal kodunu (M1–M3) al.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(['H1', 'H2', 'H3', 'H4'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHatchInput(h)}
                className={`min-h-[44px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                  hatchInput === h
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['M1', 'M2', 'M3'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setLatchInput(m)}
                className={`min-h-[44px] rounded-xl border font-mono text-xs font-bold cursor-pointer ${
                  latchInput === m
                    ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                    : 'bg-[#0f0c1e] border-white/10 text-[#d5c4ac]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              onAction('omega_s5_defense_hatch', {
                hatch: hatchInput,
                latch: latchInput,
                seal: true,
              })
            }
            disabled={s5.defenseFinalSealed}
            className={`w-full min-h-[48px] rounded-xl font-sora text-sm font-bold cursor-pointer ${
              s5.defenseFinalSealed
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                : 'bg-emerald-400 hover:bg-emerald-300 text-[#032418]'
            }`}
          >
            {s5.defenseFinalSealed
              ? `Mühürlü (${s5.defenseClearedHatch} / ${s5.defenseLatchCode})`
              : `${hatchInput} + ${latchInput} Kapağını Mühürle`}
          </button>
        </div>
      )}
    </div>
  );
};
