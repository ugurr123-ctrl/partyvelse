import React, { useState } from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onUpdate: ((updater: (prev: MissionState) => MissionState) => void) | React.Dispatch<React.SetStateAction<MissionState>>;
  onStartGame: () => void;
  isOnline?: boolean;
  isHost?: boolean;
  onToggleMyReady?: () => void;
}

export const ScreenKarantinaLobby: React.FC<Props> = ({
  state,
  onUpdate,
  onStartGame,
  onToggleMyReady,
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const corridorImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnpcwo_ZxJPoe92kifGLAnFmVHdp75oooqqQG03hodNcvLkW5SgvmC0fNEVxcZ6mD6zaeTgjanhmKO1gVFZFWgopPKivk2XM4EU_hVxHbYRYvsAbX-opRk08z-HuTNtCDoY_pEOhdLes0Dns5r1IKl_NKahdzHpdBeXtJq8KhDzMpsniRrf9bA8nvXKHji7w59FnjN8hmxinEUE08Se9kvyWycSnsDLX7k6YRQ9xI';
  const selinAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJxWZpXXTG3IVNha6Wp1S6HKkQeGKihQ-74RmrOmNT0qeJC5mB9zZj665TPHJPzyY-JpvmNMhw-Nr1ZJyzAgBoi7CA-lMBcFlO0y2EDvhZ8HVfVIlRPAm8tlq-NUUsqcL1PJk1eqyuc-b2nNeh-sYoomuQyY-RDh7L8OMLdFof-l0Xdie3jemYRygUV7iR3Nif6b9pm8F5azyt8EMqifc5EOPlRZYhSL4BAg12eHc';
  const baranAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIAgwGSA-euuAp5TlOVoIAlpkrP-8CfhQkPNmR5b-S1bVBlWoWTz7bFFjAYm4WDEXg3McTOJhtmTK041sz_P1US2DB_7t4GdZAUEZSHuWDAylIuW66pjcvyEnF1UOa-PI00PnoVvDzPO7Sb2XLddGTzXpqq_jVVL7wTaiuHBibx0eQtXJerTOjekkVS8gMuFec7tuQdFip_tujXIvrve0f1pPKs2tNOScV_Kwa8Pg';

  const copyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(state.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    onStartGame();
  };

  return (
    <div className="w-full max-w-[440px] mx-auto min-h-[calc(100vh-80px)] bg-[#110e1e] text-[#e6dff9] flex flex-col justify-between select-none font-sans pb-6 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#141123]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onUpdate((prev) => ({ ...prev, status: 'entry' }))}
            className="w-10 h-10 rounded-xl bg-[#201d30] border border-white/10 flex items-center justify-center text-cyan-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#ffb703] uppercase">
              <span>KARANTİNA 2088 // PROTOKOLÜ</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] text-cyan-300 font-bold">
                ● SEC-4
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Protokol Odası</h1>
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[#ffdba0]">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-3 flex flex-col gap-3">
        {/* Threat Level Strip */}
        <section className="bg-[#1c192c] border border-white/5 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-pulse"></span>
            <span className="font-bold text-amber-300 uppercase">SEVİYE 4 BİYO-TEHDİT // LOBİ AKTİF</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-300">
            <span className="material-symbols-outlined text-[14px]">cell_tower</span>
            <span className="text-[10px] font-bold uppercase">KORUMALI HAT</span>
          </div>
        </section>

        {/* Room Code Card */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[#ffb703]">
              <span className="material-symbols-outlined text-[20px]">key</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase block">GÜVENLİ ODA KODU</span>
              <span className="text-lg font-mono font-black text-white tracking-wider">
                {state.roomCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyCode}
              className="p-2 rounded-lg bg-[#201d30] border border-white/10 hover:border-white/20 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition-all"
              title="Kodu Kopyala"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'KOPYALANDI' : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-lg bg-[#201d30] border border-white/10 hover:border-white/20 text-[#d5c4ac] hover:text-white transition-all"
              title="QR Kod"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            </button>
          </div>
        </div>

        {/* Sector-09 Visual Corridor Banner */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-[#0a0815]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${corridorImg}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#110e1e] via-black/40 to-transparent"></div>

          {/* Top Overlays */}
          <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-[9px] font-mono text-red-300 font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              KONTAMİNASYON
            </span>
            <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/20 text-[9px] font-mono text-white font-bold uppercase">
              SEKTÖR-09 DERİN İZOLASYON
            </span>
          </div>

          {/* Bottom Overlays */}
          <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 font-bold">
              <span className="material-symbols-outlined text-[14px]">air</span>
              <span>BASINÇ ODASI KİLİTLİ</span>
            </div>
            <div className="text-[10px] font-mono text-[#ffb703] font-bold">
              OTO-KORUMA: 03:45
            </div>
          </div>
        </div>

        {/* 3 Parameter Tiles */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 text-center">
            <span className="material-symbols-outlined text-cyan-400 text-[18px] block mx-auto">group</span>
            <div className="text-[8px] font-mono text-[#9e8f78] uppercase mt-1">KAPASİTE</div>
            <div className="text-xs font-bold text-white mt-0.5">2 Oyuncu</div>
          </div>

          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 text-center">
            <span className="material-symbols-outlined text-[#ffb703] text-[18px] block mx-auto">layers</span>
            <div className="text-[8px] font-mono text-[#9e8f78] uppercase mt-1">OPERASYON</div>
            <div className="text-xs font-bold text-white mt-0.5">4 Aşama</div>
          </div>

          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 text-center">
            <span className="material-symbols-outlined text-purple-300 text-[18px] block mx-auto">sync_alt</span>
            <div className="text-[8px] font-mono text-[#9e8f78] uppercase mt-1">MODALİTE</div>
            <div className="text-xs font-bold text-white mt-0.5">Asimetrik</div>
          </div>
        </div>

        {/* Operatives Squad Pod */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-white uppercase">GÖREVLİ EKİP BİRİMİ</span>
            <span className="text-cyan-400">2/2 KADRO DOLU</span>
          </div>

          {/* Selin (LİDER / BİYOLOG) */}
          <div className="bg-[#201d30] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-cyan-400/40">
                <img src={selinAvatar} alt="Selin" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-cyan-400 border border-black"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{state.players?.kaptan?.name || 'Selin'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8px] font-mono font-bold uppercase">
                    LİDER
                  </span>
                </div>
                <div className="text-[11px] text-cyan-300 font-medium">Laboratuvar Şefi / Biyolog</div>
                <div className="text-[10px] text-[#9e8f78] flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[11px] text-cyan-400">biotech</span>
                  <span>Antidot &amp; Dekontaminasyon</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              {state.myRole === 'kaptan' ? (
                <button
                  type="button"
                  onClick={onToggleMyReady}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    state.players?.kaptan?.ready
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                  }`}
                >
                  ● {state.players?.kaptan?.ready ? 'HAZIR' : 'HAZIRLAN'}
                </button>
              ) : (
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  state.players?.kaptan?.ready
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-[#9e8f78]'
                }`}>
                  ● {state.players?.kaptan?.ready ? 'HAZIR' : 'BEKLİYOR'}
                </span>
              )}
              <span className="text-[8px] font-mono text-[#9e8f78] mt-1">GECİKME: 12ms</span>
            </div>
          </div>

          {/* Baran (OPERATÖR / GÜVENLİK) */}
          <div className="bg-[#201d30] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-400/40">
                <img src={baranAvatar} alt="Baran" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#ffb703] border border-black"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{state.players?.muhendis?.name || 'Baran'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#ffb703] text-[8px] font-mono font-bold uppercase">
                    OPERATÖR
                  </span>
                </div>
                <div className="text-[11px] text-amber-200 font-medium">Tesis Güvenlik Operatörü</div>
                <div className="text-[10px] text-[#9e8f78] flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[11px] text-amber-400">shield</span>
                  <span>Kilit Açma &amp; Savunma</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              {state.myRole === 'muhendis' ? (
                <button
                  type="button"
                  onClick={onToggleMyReady}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    state.players?.muhendis?.ready
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                  }`}
                >
                  ● {state.players?.muhendis?.ready ? 'HAZIR' : 'HAZIRLAN'}
                </button>
              ) : (
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  state.players?.muhendis?.ready
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-[#9e8f78]'
                }`}>
                  ● {state.players?.muhendis?.ready ? 'HAZIR' : 'BEKLİYOR'}
                </span>
              )}
              <span className="text-[8px] font-mono text-[#9e8f78] mt-1">GECİKME: 19ms</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-1">
          {/* Primary Button */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] bg-[repeating-linear-gradient(45deg,#ffb703,#ffb703_12px,#ffa000_12px,#ffa000_24px)] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110"
          >
            <span className="material-symbols-outlined text-[20px]">lock_open</span>
            <span>PROTOKOLÜ BAŞLAT &gt;</span>
          </button>

          {/* Invite Friend */}
          <button
            type="button"
            onClick={copyCode}
            className="w-full py-3 px-4 rounded-xl font-sora font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-[#1c192c] border border-white/10 hover:border-white/20 text-[#e6dff9] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Arkadaşını Davet Et / Yedek Operatör</span>
          </button>
        </div>

        {/* Footer Radio Frequency */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#9e8f78] px-1 pt-1">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
            <span>TELSİZ FREKANSI: 142.85 MHz [AKTİF]</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">lock</span>
            <span>AES-256</span>
          </div>
        </div>
      </main>

      {/* Share / QR Modal */}
      {showShareModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowShareModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-[#1c192c] border border-white/10 rounded-2xl p-5 max-w-sm w-full flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[#ffb703]">
              <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase">Operasyon Bağlantı Kodu</h3>
              <p className="text-xs text-[#9e8f78] mt-1">2. Oyuncunun bu kodla katılması yeterlidir.</p>
            </div>
            <div className="p-3 bg-white rounded-xl">
              <div className="w-36 h-36 border-4 border-black flex flex-col items-center justify-center text-black font-mono font-black text-xl">
                <span>{state.roomCode}</span>
                <span className="text-[10px] text-slate-600 mt-1">SEC-04</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#201d30] border border-white/10 text-white font-mono text-xs font-bold"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
