import React from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onConfirmRole: () => void;
}

export const ScreenKarantinaBioRole: React.FC<Props> = ({ onConfirmRole }) => {
  const visorImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuBUbjzYWz2kxu_8NqGqLbrbNumu5sd_tkkfn6P7yJLnQUEVUeIS8hkXUIltC4rB9xx2YbVw728gGkhplUCq1_lnOE_9uTNHtmRUBL_mAZY5Xf7hz_wibd4xLh8n01vYTWgpRPIVGqqLqS7HVrChHd0d4iHEI1hF9k68bWVTcuq0nuXX4bi35NiHAI-OF_uBmIUXDBZxZUpbTfTlwEvQHu56JJ3sM4gKJfv6i09W8';

  return (
    <div className="w-full max-w-[440px] mx-auto min-h-[calc(100vh-80px)] bg-[#110e1e] text-[#e6dff9] flex flex-col justify-between select-none font-sans pb-6 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#141123]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#201d30] border border-white/10 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-[20px]">biotech</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#ffb703] uppercase">
              <span>KARANTİNA 2088 // PROTOKOLÜ</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] text-cyan-300 font-bold">
                ● SEC-4
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Biyo Tehdit Analizi</h1>
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[#ffdba0]">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
      </header>

      {/* Main Dossier Content */}
      <main className="flex-1 px-4 py-3 flex flex-col gap-3">
        {/* Confidential Document HUD Strip */}
        <div className="flex items-center justify-between bg-[#1c192c] border border-white/5 px-3 py-2 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold text-cyan-300 uppercase">SANA ÖZEL // GİZLİ GÖREV DOSYASI</span>
          </div>
          <div className="flex items-center gap-1 text-[#9e8f78]">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>KLASÖR #88-B</span>
          </div>
        </div>

        {/* Hero Role Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">biotech</span>
            <span>ATANAN KİMLİK: KOD-BIO-01</span>
          </div>
          <h2 className="text-3xl font-extrabold text-cyan-400 tracking-tight leading-none uppercase mt-0.5 shadow-cyan-500/20">
            BAŞ BİYOLOGSUN
          </h2>
          <p className="text-xs text-[#d5c4ac] mt-1.5 leading-relaxed">
            Patojen şifreleri sende. Tesis kilitleri ve kapı erişimleri ise <strong className="text-white">Güvenlik Operatöründe</strong>.
          </p>
        </div>

        {/* Visual Dossier Card */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-xl bg-[#0a0815]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${visorImg}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#110e1e] via-[#110e1e]/40 to-transparent"></div>

          {/* Overlays */}
          <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">biotech</span>
              DNA SPEKTROMETRE
            </span>
            <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-[9px] font-mono text-red-300 font-bold uppercase">
              ● BİO-TEHLİKE SEVİYE 4
            </span>
          </div>

          <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-cyan-400 text-[18px]">dna</span>
              <div>
                <span className="text-[9px] font-mono text-[#9e8f78] uppercase block">DİZİLİM ANALİZİ</span>
                <span className="text-xs font-bold text-white uppercase">SARS-Ω88 MUTANT SUŞU</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-black/70 border border-white/10 text-[10px] font-mono text-cyan-300 font-bold">
              98.4% DOĞRULUK
            </span>
          </div>
        </div>

        {/* Critical Task Protocols (3/3 ZORUNLU) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold px-1">
            <span className="text-white uppercase">KRİTİK GÖREV PROTOKOLLERİ</span>
            <span className="text-[#ffb703]">3/3 ZORUNLU</span>
          </div>

          {/* Faz 1 */}
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">screen_search_desktop</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">1. Patojen Mutasyonunu Tara</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-mono font-bold uppercase">FAZ 1</span>
              </div>
              <p className="text-[11px] text-[#d5c4ac] leading-snug mt-0.5">
                Virüsün nükleotid dizilimini ve rezonans dalgasını tara. Verileri telsizden Operatöre ilet.
              </p>
            </div>
          </div>

          {/* Faz 2 */}
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">science</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">2. Sentetik Panzehiri Sentezle</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#ffb703] text-[8px] font-mono font-bold uppercase">FAZ 2</span>
              </div>
              <p className="text-[11px] text-[#d5c4ac] leading-snug mt-0.5">
                Doğru kimyasal bileşenleri reaktörde titreştirerek santrifüjü aşırı ısınmadan stabilize et.
              </p>
            </div>
          </div>

          {/* Faz 3 */}
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">air</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">3. Dekontaminasyon Protokolü</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8px] font-mono font-bold uppercase">FAZ 3</span>
              </div>
              <p className="text-[11px] text-[#d5c4ac] leading-snug mt-0.5">
                Sektör 4 hava kilitlerindeki zehirli gazı vakumla ve tahliye vanasını zamanında mühürle.
              </p>
            </div>
          </div>
        </div>

        {/* Partner Connection Bar */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
              <span className="material-symbols-outlined text-[16px]">security</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono font-bold text-white">Oyuncu 2 (Güvenlik Operatörü)</div>
              <div className="text-[10px] text-[#9e8f78] truncate">Hazırlandı... Sinyal onayı bekleniyor.</div>
            </div>
          </div>
          <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase">ŞİFRELİ KANAL 02</span>
        </div>

        {/* Confirm Role Action Button */}
        <button
          type="button"
          onClick={onConfirmRole}
          className="w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] bg-gradient-to-r from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110 mt-1"
        >
          <span className="material-symbols-outlined text-[20px]">verified</span>
          <span>ROLÜMÜ ANLADIM &gt;</span>
        </button>
      </main>
    </div>
  );
};
