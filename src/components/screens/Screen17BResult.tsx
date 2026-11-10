import React, { useEffect, useRef, useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onRestartGame: () => void;
  onLobbyReturn?: () => void;
}

export const Screen17BResult: React.FC<Props> = ({ state, onRestartGame, onLobbyReturn }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [replayRotate, setReplayRotate] = useState(0);
  
  // Local toggle to allow previewing both Victory and Failure in real-time
  const [previewOutcome, setPreviewOutcome] = useState<'basarisizlik' | 'tam_basari'>(
    state.outcomeType === 'basarisizlik' ? 'basarisizlik' : 'tam_basari'
  );

  const isFailure = previewOutcome === 'basarisizlik';
  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';

  const { rescuedCrewCount, timeLeftSeconds, hullIntegrity, completedTasksCount, finalScore, scoreBreakdown } = state;

  const minutes = Math.floor(timeLeftSeconds / 60).toString().padStart(2, '0');
  const seconds = (timeLeftSeconds % 60).toString().padStart(2, '0');

  // Interactive Particle Canvas (Golden Stardust for Victory, Red Ash / Sparks for Failure)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 700);

    const victoryColors = ['#FFB703', '#FFDBA0', '#00EEFC', '#D3FBFF', '#DAB5FF'];
    const failureColors = ['#FF5252', '#FFB4AB', '#93000A', '#FF7961', '#4D1B1B'];
    const activeColors = isFailure ? failureColors : victoryColors;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
    }> = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: isFailure ? (Math.random() * 0.6 + 0.2) : (-Math.random() * 0.7 - 0.2),
        color: activeColors[Math.floor(Math.random() * activeColors.length)],
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * 0.003 + p.size) * 0.01;

        if (isFailure && p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        } else if (!isFailure && p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(0.9, p.alpha));
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isFailure]);

  const handleReplayClick = () => {
    setReplayRotate(prev => prev + 360);
    setTimeout(() => {
      onRestartGame();
    }, 300);
  };

  const handleLobbyClick = () => {
    if (onLobbyReturn) {
      onLobbyReturn();
    } else {
      onRestartGame();
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col relative overflow-hidden select-none animate-fadeIn text-[#e6dff9] pb-8 font-sans">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 w-full h-full opacity-60" />

      {/* Outcome Switcher Bar */}
      <div className="relative z-40 px-margin pt-2 flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
          SONUÇ PROTOKOLÜ:
        </div>
        <div className="flex items-center gap-1 bg-[#363246]/80 p-0.5 rounded-lg border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setPreviewOutcome('basarisizlik')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              isFailure 
                ? 'bg-[#93000a] text-[#ffdad6] shadow-sm' 
                : 'text-[#d5c4ac] hover:text-[#e6dff9]'
            }`}
          >
            Süre Bitti / Hata
          </button>
          <button
            type="button"
            onClick={() => setPreviewOutcome('tam_basari')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              !isFailure 
                ? 'bg-[#ffb703] text-[#422c00] shadow-sm' 
                : 'text-[#d5c4ac] hover:text-[#e6dff9]'
            }`}
          >
            Zafer / Yüzey
          </button>
        </div>
      </div>

      {isFailure ? (
        /* ================= FAILURE SCREEN ================= */
        <>
          {/* Ambient Red Glows */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#93000a]/25 blur-[100px] z-10"></div>
          <div className="pointer-events-none absolute top-48 left-1/4 w-72 h-72 rounded-full bg-[#ffb4ab]/15 blur-[90px] z-10"></div>

          {/* Hero Disaster Banner */}
          <div className="relative w-full overflow-hidden flex flex-col justify-end px-margin pb-6 pt-4">
            <div 
              className="absolute inset-0 bg-cover bg-center filter grayscale-[20%] brightness-75 contrast-125" 
              style={{ 
                backgroundImage: isGolgeProtokolu
                  ? "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKew8RBVUmN_zzrCJysCoPzV-WuLmVo4_AyOJrg4ZTH2DqTvPYKv5WIdQJ2-VA1Wz70qs8QLAsu7Of8kkiiCxKD_7nzwUkoogrHKfNZOOeL__HaVG8MXaxPr7RAnDmXej9qPiS6_FDlAuHCPA0HyEwj0-XdXaVjg_L5C4bwj3bcS2sREnpotusgQ4fYKfJ3zngo8II1S-liPAvf7Fk_B-8npeLBj0sq10yUaPWdXs')"
                  : isDerinBasinc 
                  ? "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC9b35NxzN22mF68b0VIuOmkrLgFiHJ2bTlmVYYjlkNhZeQOL6s1BtaST818lCZHg-evpYtgdGhmGjbbIuvRZ-aQbDo0_ssc-LdFRJgNZcWCGMXfN3__IrB-EsuG1DVp3AjO20rHsCtiJPmz_vbi3fRx_Cp9PduCYCkZ0lVU2b4sybsYdOW04Z-5OHEIjnhXPh0m6YY-dyARgsH4RZqPmQliIX6VVx88g9gBiSqfTQ')"
                  : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYYRGcO-qooDGua9vJuMZ2UEE08MvX5onD4i79wD2nvA3dJx_NAS9TVasc1xx7SyqUqQ81wencqyzUcSsWmO4yW2SqXX62FN40vwns_ZtNVO5CTYbm9JpYpR5cbXGRInJoxSk4kGHMGy2qgUNTXc0e_4FhyvKE-B44ZGvRhhXA_aVVSUN23Cl7w0yybN7HKHcS3N9U2V_BBVophbF86YGvun2K3eA-XeEkNYF-3DE')" 
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#141123]/90 via-[#141123]/60 to-[#141123] z-0"></div>
            <div className="absolute inset-0 bg-radial-at-t from-[#ffb4ab]/20 via-transparent to-[#141123] z-0"></div>

            {/* Badges & Titles */}
            <div className="relative z-10 flex flex-col items-center text-center mt-2">
              <div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-[#93000a]/50 border border-[#ffb4ab]/30 backdrop-blur-md mb-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping"></span>
                <span className="material-symbols-outlined text-[15px] text-[#ffb4ab]">
                  {isGolgeProtokolu ? 'crisis_alert' : isDerinBasinc ? 'warning' : 'sensors_off'}
                </span>
                <span className="font-mono text-[10px] text-[#ffdad6] uppercase tracking-widest font-bold">
                  {isGolgeProtokolu 
                    ? 'ALARM TETİKLENDİ // SIFIR GİZLİLİK' 
                    : isDerinBasinc 
                    ? 'KOD: KIRMIZI ALARM // GÖVDE DELİNDİ' 
                    : 'PROTOKOL İHLALİ // FAULT-99'}
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="font-sora text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffb4ab] via-red-400 to-red-600 uppercase tracking-tight drop-shadow-[0_4px_16px_rgba(255,180,171,0.35)]">
                {isGolgeProtokolu 
                  ? 'TESPİT EDİLDİNİZ: ALARM ÇALDI!' 
                  : isDerinBasinc 
                  ? 'KRİTİK BASINÇ ÇÖKMESİ!' 
                  : 'GÖREV BAŞARISIZ'}
              </h2>
              <span className="font-mono text-[10px] text-[#ffb4ab] uppercase tracking-widest font-bold mt-1">
                {isGolgeProtokolu 
                  ? 'GÖREV BAŞARISIZ // PROTOKOL ÇÖKTÜ' 
                  : isDerinBasinc 
                  ? 'GÖREV BAŞARISIZ // PROTOKOL İPTAL' 
                  : 'TAHLİYE BAŞARISIZ // SÜRE TÜKENDİ'}
              </span>
              <p className="text-[13px] text-[#d5c4ac] max-w-[310px] mt-2 font-medium leading-relaxed">
                {isGolgeProtokolu
                  ? 'Güvenlik duvarı rezonansı aşıldı ve Megacorp güvenlik güçleri sunucu odasını kilitledi. Operasyon açığa çıktı.'
                  : isDerinBasinc 
                  ? 'Gövde bütünlüğü sıfırlandı. Okyanus basıncı batiskaf izolasyonunu aştı.'
                  : 'Sinyal tamamen koptu. İstasyon gövdesi parçalandı ve kaçış kapsülü rota dışına savruldu.'}
              </p>
            </div>
          </div>

          {/* Derin Basınç Failure Quick Telemetry Ticker Strip */}
          {isDerinBasinc && (
            <div className="relative z-30 px-margin">
              <div className="grid grid-cols-3 bg-[#201d30] px-space-md py-space-xs rounded-xl border border-white/5 shadow-md">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-[#9e8f78] uppercase font-bold">DERİNLİK</span>
                  <span className="font-mono text-[11px] text-[#ffb4ab] font-bold">-1250 METRE</span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="font-mono text-[10px] text-[#9e8f78] uppercase font-bold">BAROMETRİK</span>
                  <span className="font-mono text-[11px] text-[#ffb703] font-bold">85.2 ATM</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-mono text-[10px] text-[#9e8f78] uppercase font-bold">MÜRETTEBAT</span>
                  <span className="font-mono text-[11px] text-[#ffb4ab] font-bold">2/2 CEVAPSIZ</span>
                </div>
              </div>
            </div>
          )}

          {/* Failure Plaque Console Frame */}
          <div className="relative z-30 px-margin flex flex-col gap-space-md mt-3 pb-8">
            <div className="relative w-full rounded-xl bg-[#201d30]/90 border border-[#93000a]/40 backdrop-blur-xl p-5 shadow-2xl flex flex-col items-center overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffb4ab] to-transparent opacity-90"></div>

              {isDerinBasinc ? (
                /* Derin Basınç Kara Kutu Dökümü */
                <div className="w-full flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[#ffb703] text-[18px]">terminal</span>
                      <span className="font-sora text-[16px] text-[#ffdba0] font-bold">Kara Kutu Dökümü</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-[#9e8f78] font-bold">ANALİZ #409</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1c192c]">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[#ffb4ab] text-[18px]">compress</span>
                        <span className="text-[12px] text-[#e6dff9] font-medium">Başarısızlık Nedeni</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#ffb4ab] text-right font-bold">85.2 ATM Hidrostatik Basınç</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1c192c]">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[#00dbe9] text-[18px]">south</span>
                        <span className="text-[12px] text-[#e6dff9] font-medium">Kaybedilen Derinlik</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#00dbe9] text-right font-bold">-1250m Abisal Çukur</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1c192c]">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[#ffb703] text-[18px]">crisis_alert</span>
                        <span className="text-[12px] text-[#e6dff9] font-medium">Görev Aşaması</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#ffb703] text-right font-bold">6. Görev (Acil Tahliye)</span>
                    </div>
                  </div>

                  {/* Hydrostatic Pressure Loss Gauge */}
                  <div className="flex flex-col gap-space-xs bg-[#1c192c] rounded-xl p-3 shadow-md mt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase text-[#9e8f78] font-bold">HİDROSTATİK BASINÇ EŞİĞİ</span>
                      <span className="font-mono text-[11px] text-[#ffb4ab] font-bold">%142 (AŞILDI)</span>
                    </div>
                    <div className="flex items-center gap-1 w-full h-3 py-0.5">
                      <div className="h-full flex-1 rounded-sm bg-[#00eefc]"></div>
                      <div className="h-full flex-1 rounded-sm bg-[#00eefc]"></div>
                      <div className="h-full flex-1 rounded-sm bg-[#00eefc]"></div>
                      <div className="h-full flex-1 rounded-sm bg-[#ffb703]"></div>
                      <div className="h-full flex-1 rounded-sm bg-[#ffb703]"></div>
                      <div className="h-full flex-1 rounded-sm bg-[#ffb4ab] animate-pulse"></div>
                      <div className="h-full flex-1 rounded-sm bg-[#ffb4ab]"></div>
                    </div>
                    <div className="flex items-center justify-between text-[#9e8f78] font-mono text-[9px]">
                      <span>0 ATM (GÜVENLİ)</span>
                      <span>60 ATM (LİMİT)</span>
                      <span className="text-[#ffb4ab] font-bold">85.2 ATM (ÇÖKME)</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Zero Rescued */
                <div className="flex flex-col items-center">
                  <div className="w-13 h-13 rounded-2xl bg-[#93000a]/30 border border-[#ffb4ab]/40 flex items-center justify-center text-[#ffb4ab] mb-1 shadow-inner">
                    <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      running_with_errors
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-sora text-[36px] text-[#ffb4ab] drop-shadow-[0_2px_12px_rgba(255,180,171,0.5)] font-black">
                      0
                    </span>
                    <span className="font-sora text-[20px] text-[#d5c4ac]/70 font-bold">
                      / 10
                    </span>
                  </div>
                  <span className="font-sora text-[15px] text-[#ffb4ab] font-semibold tracking-wide uppercase mt-0.5">
                    Kişi Kurtarıldı
                  </span>
                </div>
              )}

              {/* Offline Crew Members Section */}
              <div className="w-full grid grid-cols-2 gap-space-md mt-4 pt-3 border-t border-white/10">
                {/* Ece Card */}
                <div className="flex flex-col items-center bg-[#1c192c] border border-[#93000a]/30 rounded-lg p-3 group shadow-sm">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg mb-2 grayscale brightness-75">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="Ece" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjneeJLFuxwZXqCp9n0nolhcFqV8kIP4eP-bUHd_IS7Q56A2X1NsM_e7NpsGLqiH7V5QrjjzpODzs5lrX4cklFH9pE_2TWW3o-Vky9Bh5x5m5eB4kagmjjFkp8VmwGC2abL5fOIrUDXQli8anUR_1d-X19wWdQHYpuu9S90yPmwsRRs6lq-bTSQEYMKg3QUN4x7S_gVJDosZoXIEWN4Q_k6i1PGRLr6CCJ1AJDNb0" 
                    />
                    <div className="absolute inset-0 bg-red-950/40"></div>
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ffb4ab] text-[#690005] flex items-center justify-center shadow font-bold text-[10px]">
                      ✕
                    </div>
                  </div>
                  <span className="font-sora text-[14px] text-[#e6dff9] font-bold">
                    {state.players.kaptan.name || (isGolgeProtokolu ? 'Ajan Ece' : isDerinBasinc ? 'Dümenci Ece' : 'Ece')}
                  </span>
                  <span className="font-mono text-[9px] text-[#ffb4ab] uppercase mt-0.5 px-2 py-0.5 rounded-full bg-[#93000a]/30 font-bold">
                    {isGolgeProtokolu ? 'AJAN // AÇIĞA ÇIKTI' : isDerinBasinc ? 'DÜMENCİ // KAYIP' : 'KAYIP // ÇEVRİMDIŞI'}
                  </span>
                </div>

                {/* Mert Card */}
                <div className="flex flex-col items-center bg-[#1c192c] border border-[#93000a]/30 rounded-lg p-3 group shadow-sm">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg mb-2 grayscale brightness-75">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="Mert" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSDGyHEo6C57QfHLfzHn6fHpATwZ_E4dRftmOaQg_x3YXnw8n7tnNeqdE0gOgdK4VaiihLM8bAzh7zjRdQTf2oT_bgIlocy1EBKvKWfyuPCVDxlhRBYRDtYYxvKlhwJBCILE5AC2lTlb9bHIVuVNyegbFuVtMWeYkciEfgUS4vXS62n5FqJqbZrC-1o66H4IPlTdRWp4LXOQ-1UtYt-Lpi5fl3prglhdDKxNsDJo8" 
                    />
                    <div className="absolute inset-0 bg-red-950/40"></div>
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ffb4ab] text-[#690005] flex items-center justify-center shadow font-bold text-[10px]">
                      ✕
                    </div>
                  </div>
                  <span className="font-sora text-[14px] text-[#e6dff9] font-bold">
                    {state.players.muhendis.name || (isGolgeProtokolu ? 'Hacker Mert' : isDerinBasinc ? 'Makinist Mert' : 'Mert')}
                  </span>
                  <span className="font-mono text-[9px] text-[#ffb4ab] uppercase mt-0.5 px-2 py-0.5 rounded-full bg-[#93000a]/30 font-bold">
                    {isGolgeProtokolu ? 'HACKER // BAĞLANTI KESİLDİ' : isDerinBasinc ? 'MAKİNİST // KAYIP' : 'KAYIP // ÇEVRİMDIŞI'}
                  </span>
                </div>
              </div>

              {/* Tactical Hint Capsule */}
              <div className="w-full mt-3 p-3 rounded-lg bg-[#1c192c] border border-white/5 text-left">
                <div className="flex items-center gap-1.5 text-[#ffb703] font-bold font-mono text-[10px] uppercase mb-1">
                  <span className="material-symbols-outlined text-[15px]">lightbulb</span>
                  <span>TAKTIK İPUCU // KOORDİNASYON</span>
                </div>
                <p className="text-[12px] text-[#d5c4ac] leading-relaxed">
                  {isGolgeProtokolu 
                    ? 'Ajan lazer ve prizma koordinatlarını Hackerın sayımıyla eşleştirmeli, kasa PIN kodunu (8429) telsiz teyidiyle girmelidir.'
                    : isDerinBasinc 
                    ? 'Dümenci yükseliş açısını telsizden söylemeden önce makinist balast vanalarını aceleyle tahliye etmemelidir.'
                    : 'Tahsis edilen 5 dakikalık kurtarma penceresi doldu veya gövde bütünlüğü kritik seviyenin altına indi. Yaşam destek üniteleri devre dışı kaldı.'}
                </p>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-col gap-space-sm pt-2">
              <button 
                type="button"
                onClick={handleReplayClick}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 via-[#ff5252] to-rose-600 text-white font-sora text-[15px] uppercase tracking-wide flex items-center justify-center gap-space-sm shadow-[0_6px_0_#690005,0_12px_24px_rgba(255,180,171,0.25)] transition-all active:translate-y-[4px] cursor-pointer font-bold"
              >
                <span>GÖREVİ TEKRAR DENE (AYNI EKİPLE)</span>
                <span 
                  className="material-symbols-outlined text-[22px] transition-transform duration-500"
                  style={{ transform: `rotate(${replayRotate}deg)` }}
                >
                  replay
                </span>
              </button>

              <button 
                type="button"
                onClick={handleLobbyClick}
                className="w-full py-3.5 px-6 rounded-xl bg-[#2b273b] hover:bg-[#363246] text-[#00dbe9] font-sora text-[14px] uppercase tracking-wide flex items-center justify-center gap-space-xs transition-all active:scale-[0.98] shadow-md cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                <span>Lobiye dön</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* ================= VICTORY & RESCUE SCREEN ================= */
        <>
          {/* Ambient Cinematic Glows */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#ffb703]/20 blur-[100px] z-10"></div>
          <div className="pointer-events-none absolute top-48 left-1/4 w-72 h-72 rounded-full bg-[#00eefc]/15 blur-[90px] z-10"></div>

          {/* Hero Surface Vista Banner */}
          <div className="relative w-full overflow-hidden flex flex-col justify-end px-margin pb-6 pt-4">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: isGolgeProtokolu
                  ? "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCcKdmzA5fLYgkZNcrWrNTWssT_5KAXMD0GhaWSMeBsETI8WdTjiMkxDb5xTdsdOzBpMx7NufDqykJLKgxKSh6y-FK21HcFPm_Ew8BcoKLKAT9Bia8cTAV2nyxU-c9GW5TZF2cmP9tgyupZ5JZvIwZD3A_wpMyG3reZtagooUEolhR37NUgag8GwNHla4SW0aJ7GKw9Hn_Ea8Qo5GGAkRoC0bojdjKBHenx17gqVBA')"
                  : isDerinBasinc
                  ? "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCE-9gfU-dfcEF8Of7tsZsCM7MOK3TzaYb2Zv2mcFW2u8-uyb1uEy6PeYCz1vUiVe7WD3e86_Giu4LqZd2wvF5cBwVBXuNtLEQyWbj49msuXHhzqAG-yYuCzHTDFUzG3TftIIdQrDt3OsjdF94p55kNgYcuSu6dGOdN87AqMctJLTz7HVgyZwiBvOOZptbKc5TKytMbyO-bnW9awcYYXtKzxdBL-WjfN65t9EXmf58')"
                  : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDB5PMnrENFEBX_4_Mx2ng-zsSNRYqs8cQjvvNs1NFqsvBgF13Uecoxse0KnNOrll-BZ6eZnBINmmVgmSVVC_GHJvJvE7krXBhNfqwAUx-9-WB1gR8g3o8040FEih9Bca3nQRjCPLr2PHhJx7H82iVIol8H4vFRx-ftgOWWLaonLtkxk22wMtEiWEAwgu_hLgtNYjraQiFc1mR3k7qAiXHxzPz6Cv6NjFPawPcXRT8')"
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#141123]/80 via-[#141123]/40 to-[#141123] z-0"></div>
            <div className="absolute inset-0 bg-radial-at-t from-[#ffb703]/10 via-transparent to-[#141123] z-0"></div>

            {/* Dynamic Status Banner & Titles */}
            <div className="relative z-10 flex flex-col items-center text-center mt-2">
              <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-[#201d30]/80 backdrop-blur-md mb-2 shadow-md border border-white/10">
                <span className="material-symbols-outlined text-[14px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isGolgeProtokolu ? 'verified' : isDerinBasinc ? 'celebration' : 'workspace_premium'}
                </span>
                <span className="font-mono text-[10px] text-[#ffba27] uppercase tracking-widest font-bold">
                  {isGolgeProtokolu 
                    ? 'OPERASYON TAMAMLANDI // S-RANK // %100 GİZLİLİK' 
                    : isDerinBasinc 
                    ? 'GÖREV BAŞARILI // SEVİYE S-RANK' 
                    : 'GÖREV PROTOKOLÜ: KUSURSUZ TAHLİYE'}
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="font-sora text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffdea9] via-[#ffb703] to-amber-500 uppercase tracking-tight drop-shadow-[0_4px_16px_rgba(255,183,3,0.35)]">
                {isGolgeProtokolu 
                  ? 'İZ BIRAKMADAN KAÇTINIZ!' 
                  : isDerinBasinc 
                  ? 'BİRLİKTE YÜZEYE ÇIKTINIZ!' 
                  : 'BİRLİKTE KURTULDUNUZ'}
              </h2>
              <p className="text-[13px] text-[#00eefc] max-w-[310px] mt-1 font-medium leading-relaxed">
                {isGolgeProtokolu
                  ? 'Megacorp veri kasası sıfır alarmla boşaltıldı. Siber izler silindi, operasyon kusursuz tamamlandı.'
                  : isDerinBasinc 
                  ? 'Okyanus hendeklerini aştınız, HİDRO-04 batiskafı güvenle gün ışığına ulaştı.'
                  : 'Doğru kararlar, tüm mürettebat kurtuldu. Harika bir ekip oldunuz!'}
              </p>
            </div>
          </div>

          {/* Content Stream Container */}
          <div className="relative z-30 px-margin flex flex-col gap-space-md -mt-1 pb-8">
            <div className="relative w-full rounded-xl bg-[#201d30]/90 backdrop-blur-xl p-5 shadow-2xl flex flex-col items-center overflow-hidden border border-white/10">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffb703] to-transparent opacity-80"></div>

              {/* Top Summary Banner */}
              <div className="w-full flex items-center justify-between bg-[#0f0c1e]/90 px-space-md py-2.5 rounded-lg border border-white/5">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-[#ffb703]/20 flex items-center justify-center text-[#ffb703]">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase text-[#9e8f78] font-bold">GÖREV PROTOKOLÜ</span>
                    <span className="font-sora text-[14px] text-[#e6dff9] font-bold">Tam Kurtarma Başarısı</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-[#00eefc] uppercase font-bold block">EŞZAMANLILIK</span>
                  <span className="font-sora text-[15px] text-[#ffb703] font-bold">%100 UYUM</span>
                </div>
              </div>

              {/* Key Readouts Matrix */}
              <div className="w-full grid grid-cols-3 gap-space-xs mt-3">
                <div className="bg-[#1c192c] px-space-sm py-2 rounded-lg flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-[#00eefc] text-[18px]">
                    {isGolgeProtokolu ? 'folder_zip' : isDerinBasinc ? 'scuba_diving' : 'groups'}
                  </span>
                  <span className="font-mono text-[9px] text-[#d5c4ac] uppercase mt-1">
                    {isGolgeProtokolu ? 'ÇEKİLEN VERİ' : isDerinBasinc ? 'AŞILAN DERİNLİK' : 'KURTARILAN'}
                  </span>
                  <span className="font-sora text-[15px] text-[#00eefc] font-bold">
                    {isGolgeProtokolu ? '128 TB' : isDerinBasinc ? '1250 M' : `${rescuedCrewCount}/10`}
                  </span>
                </div>
                <div className="bg-[#1c192c] px-space-sm py-2 rounded-lg flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-[#ffb703] text-[18px]">security</span>
                  <span className="font-mono text-[9px] text-[#d5c4ac] uppercase mt-1">
                    {isGolgeProtokolu ? 'GİZLİLİK ORANI' : 'GÖVDE SAĞLIĞI'}
                  </span>
                  <span className="font-sora text-[15px] text-[#ffb703] font-bold">%{isGolgeProtokolu ? (state.stealthLevel ?? 100) : hullIntegrity}</span>
                </div>
                <div className="bg-[#1c192c] px-space-sm py-2 rounded-lg flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-[#00eefc] text-[18px]">timer</span>
                  <span className="font-mono text-[9px] text-[#d5c4ac] uppercase mt-1">KALAN SÜRE</span>
                  <span className="font-sora text-[15px] text-[#00eefc] font-bold">{minutes}:{seconds}</span>
                </div>
              </div>

              {/* Real Score Box & Formula Breakdown */}
              <div className="w-full mt-3 p-3 rounded-xl bg-[#0f0c1e] border border-white/10 flex flex-col items-center shadow-inner">
                <span className="text-[10px] font-mono text-[#ffb703] uppercase font-bold tracking-wider">HESAPLANAN SKOR</span>
                <span className="text-2xl font-sora font-extrabold text-white mt-0.5">
                  {finalScore ?? 0} PUAN
                </span>
                
                <div className="w-full grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-white/5 text-center font-mono text-[9px]">
                  <div className="flex flex-col">
                    <span className="text-[#d5c4ac]">Görev</span>
                    <span className="text-white font-bold">+{scoreBreakdown?.tasksScore ?? (completedTasksCount * 200)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#d5c4ac]">Süre</span>
                    <span className="text-[#00eefc] font-bold">+{scoreBreakdown?.timeBonus ?? (timeLeftSeconds * 2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#d5c4ac]">Bütünlük</span>
                    <span className="text-[#00eefc] font-bold">+{scoreBreakdown?.hullBonus ?? (hullIntegrity * 3)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#ffb703]">{isGolgeProtokolu ? 'Gizlilik' : 'Mürettebat'}</span>
                    <span className="text-[#ffb703] font-bold">+{scoreBreakdown?.crewBonus ?? (rescuedCrewCount * 50)}</span>
                  </div>
                </div>
              </div>

              {/* Crew Showcase Pods */}
              <div className="w-full flex flex-col gap-space-xs mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#9e8f78] uppercase font-bold">
                    {isGolgeProtokolu ? 'OPERASYON AJANLARI' : 'KAHRAMAN MÜRETTEBAT'}
                  </span>
                  <span className="font-mono text-[10px] text-[#ffba27] uppercase font-bold">2 / 2 OYUNCU CANLI</span>
                </div>
                <div className="grid grid-cols-2 gap-space-sm">
                  {/* Ece */}
                  <div className="bg-[#1c192c] p-space-sm rounded-lg flex items-center gap-space-sm">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img 
                        className="w-12 h-12 rounded-lg object-cover" 
                        alt="Ece" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcPjETe5MI452OUuJ3r4_Mk8ZU0BkUKORzp9r4seCjl6rBmuqBn9nvS0Ck8t0shBsBbspZduFYI_CQNQCc34Ik8fCWcUjZO2tjHkyPQZ7b_ahWXVASA6Fz5uE1zuAhxAEcYrtnyqYlM9dKAbG8AzWQ20K-GfVsDtiztToKr8NQISvGhJ47yamHheuo_gLgZpGgwXr2jo-st9r8JQSqsH9ti9zlTnIoJxNjQVw3toE"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00eefc] border-2 border-[#1c192c]"></div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-sora text-[13px] font-bold text-[#e6dff9] truncate">
                        {state.players.kaptan.name || (isGolgeProtokolu ? 'Ajan Ece' : isDerinBasinc ? 'Dümenci Ece' : 'Ece')}
                      </span>
                      <span className="text-[11px] text-[#ffba27] truncate font-medium">
                        {isGolgeProtokolu ? 'Sahadaki Ajan' : isDerinBasinc ? 'Kaptan / Dümenci' : 'Kaptan'}
                      </span>
                      <span className="font-mono text-[9px] text-[#d5c4ac] mt-0.5">
                        {isGolgeProtokolu ? '%100 Sessiz İntikal' : '%100 Navigasyon'}
                      </span>
                    </div>
                  </div>

                  {/* Mert */}
                  <div className="bg-[#1c192c] p-space-sm rounded-lg flex items-center gap-space-sm">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img 
                        className="w-12 h-12 rounded-lg object-cover" 
                        alt="Mert" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCipTg5khFIJHJFrxJj-3jTARQ70do2nyaG-tffFIOjmOaJeKVk4WWSd8GC4UHoDVKNl8JrNhhqjCwjBbTFLVevJN5cBcbgyPQkjDoHpLsefy2ihUNRpLea18wV1La4B3OE1uRssC-HQs8SZECflPFNLVFYcFbFHcctKdMy1s5SqOuWHYNAcLJoL0e-nPF3WDNDLdPjGj0OLeUYQoZJ4u2gwY1yIq6VSuPhwtGyTJw"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00eefc] border-2 border-[#1c192c]"></div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-sora text-[13px] font-bold text-[#e6dff9] truncate">
                        {state.players.muhendis.name || (isGolgeProtokolu ? 'Hacker Mert' : isDerinBasinc ? 'Makinist Mert' : 'Mert')}
                      </span>
                      <span className="text-[11px] text-[#00eefc] truncate font-medium">
                        {isGolgeProtokolu ? 'Gölge Hacker' : isDerinBasinc ? 'Makinist / Uzman' : 'Mühendis'}
                      </span>
                      <span className="font-mono text-[9px] text-[#d5c4ac] mt-0.5">
                        {isGolgeProtokolu ? '%100 Siber Körleme' : '%100 Basınç Takibi'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Celebration Highlight Banner */}
              <div className="w-full mt-3 bg-gradient-to-r from-[#ffb703]/20 via-[#2b273b] to-[#00eefc]/15 p-space-sm rounded-xl flex items-center justify-between shadow-lg border border-white/5">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-full bg-[#ffb703] flex items-center justify-center text-[#422c00] font-black">
                    <span className="material-symbols-outlined text-[18px]">military_tech</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sora text-[13px] text-[#ffdba0] font-bold">VIP Ödülü Açıldı</span>
                    <span className="text-[11px] text-[#d5c4ac]">+850 Prestij Puanı & Derinlik Brövesi</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#ffba27] bg-[#0f0c1e] px-2 py-0.5 rounded font-bold">ALINDI</span>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-col gap-space-sm pt-2">
              <button 
                type="button"
                onClick={handleReplayClick}
                className="w-full h-14 bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#422c00] font-sora text-[15px] font-extrabold rounded-xl flex items-center justify-center gap-space-sm shadow-[0_6px_20px_rgba(255,183,3,0.35)] active:translate-y-1 transition-all cursor-pointer shadow-[0_6px_0_#6b4b00]"
                id="btn-replay"
              >
                <span className="material-symbols-outlined text-[22px] font-bold">restart_alt</span>
                <span>Aynı Mürettebatla Yeniden Dal</span>
              </button>

              <button 
                type="button"
                onClick={handleLobbyClick}
                className="w-full h-12 bg-[#2b273b] text-[#00dbe9] hover:bg-[#363246] font-sora text-[14px] rounded-xl flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                <span>Lobiye dön</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
