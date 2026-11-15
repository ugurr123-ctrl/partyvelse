import React from 'react';
import { MissionState } from '../../../types/game';
import { getOmegaRoleMeta, getTeamOperationMeta } from '../../../services/omegaGameEngine';
import { Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  state: MissionState;
  onConfirmRole: () => void;
}

export const ScreenOmegaRoleIntro: React.FC<Props> = ({ state, onConfirmRole }) => {
  const playerCount: 3 | 4 = state.targetPlayerCount === 3 || state.omegaData?.playerCount === 3 ? 3 : 4;
  const meta = getOmegaRoleMeta(state.myRole, playerCount);
  const themeMeta = getTeamOperationMeta(state.operationTheme);
  const myConfirmed = Boolean(state.players[state.myRole]?.roleConfirmed);

  const detailColorClass =
    state.myRole === 'kaptan'
      ? 'text-[#ffb703]'
      : state.myRole === 'muhendis'
      ? 'text-[#00eefc]'
      : state.myRole === 'kriptolog'
      ? 'text-[#dab5ff]'
      : 'text-emerald-300';

  const roleDetails: Record<string, { sees: string[]; asks: string[] }> = {
    kaptan: {
      sees: [
        'Aşama 1: 5 sektörün arıza kuralı ve arızalı sektörün 4 glif etiketi',
        'Aşama 2: Harmonik bant modu (DAR/GENİŞ/DARBE), bant anahtarı ve hedef osilatör A/B',
        'Aşama 3: 12 MW 4-baralı hedef güç dağılımı ve taşıyıcı bant (HF-1..HF-4)',
        'Aşama 4: Acil kriz protokol kodu (DELTA-3/SIGMA-7/OMEGA-9) ve hedef basınç (PSI)',
        playerCount === 3
          ? 'Aşama 5: Güvenli tahliye rotası, yakıt/itki hedefi + 3P modda tüm savunma kilitleri'
          : 'Aşama 5: Güvenli tahliye rotası, yakıt, yardımcı itki ve kapak mandalı (M1-M3)',
      ],
      asks: [
        'Mühendisten S1–S5 tüm sensörleri, parazit dB / rezonans sapmasını ve kapak PIN’ini iste',
        'Kriptologdan Aşama 1 valf+pompa, Aşama 3 duvar/etiket ve Aşama 4 şalter sırasını al',
        playerCount === 3
          ? '3P ekipte savunma kilitlerini (kanal, filtre, kadran, kapak) zamanında mühürle'
          : 'Güvenlik Şefi ile polarite, parazit hattı, 4. seviye duvar ve yama işlemlerini koordine et',
      ],
    },
    muhendis: {
      sees: [
        'Aşama 1: S1–S5 canlı ısı, basınç, yük ve titreşim telemetrisi + valf & pompa (1–5) paneli',
        'Aşama 2: Osilatör A/B ayarlayıcı ve gizli parazit dB + rezonans sapması ekranı',
        'Aşama 3: 12 MW 4-baralı güç matrisi (İtki / Kalkan / Yaşam / Soğutma)',
        'Aşama 4: 3 adımlı sıralı şalter zinciri (R1/R2/R3) ve acil basınç valfi (PSI)',
        'Aşama 5: Ana yakıt + yardımcı itki konsolu ve tıkalı kapak (H1–H4) + 2 haneli kapak PIN’i',
      ],
      asks: [
        'Komutandan sektör kuralını, osilatör A/B hedeflerini, 12 MW planı, PSI ve yakıt oranlarını al',
        'Kriptologdan valf+pompayı ve Aşama 4’te basılacak kesin 3 şalter sırasını öğren',
      ],
    },
    kriptolog: {
      sees: [
        'Aşama 1: 6 sembollü glif tablosu ve PIN dönüşüm kuralı (yer değiştir / +1 kaydır)',
        'Aşama 2: Anahtar-frekans tablosu (K1/K2/K3) ve gereken filtre rölesi (F1–F3)',
        'Aşama 3: Ağırlıklı 12 MW sağlama çarpanı, güvenlik duvarı (1–4) ve doğrulama etiketi (A–D)',
        'Aşama 4: Protokol şalter kitabı (3 röle sırası + bypass token)',
        'Aşama 5: Rota fırlatma ön-kodları (bileşik kod için Mühendisten kapak PIN’ini ekle)',
      ],
      asks: [
        'Komutandan 4 glifi, bant anahtarını, 12 MW değerlerini, protokol kodunu ve rotayı iste',
        'Mühendisten Aşama 2 parazit+sapmayı ve Aşama 5 2 haneli kapak PIN’ini al',
      ],
    },
    guvenlik: {
      sees: [
        'Aşama 1: Kalkan polaritesi (ALFA/BETA/GAMA) ve alt kanal kilidi (X1–X3)',
        'Aşama 2: Parazit kaynağı radarı (İç / Dış / Çapraz Hat) ve filtre rölesi (F1–F3)',
        'Aşama 3: Saldırı radar kadranı, 4 seviyeli güvenlik duvarı ve ikincil etiket (A–D)',
        'Aşama 4: Hasarlı bölme tespiti (B1–B4) ve Kriptolog ihlal tokenı kilidi',
        'Aşama 5: Tahliye kapağı (H1–H4) ve güvenlik mandalı (M1–M3) son mühürleme paneli',
      ],
      asks: [
        'Kriptologdan polarite + alt kanalı, filtre rölesini, duvar seviyesi + etiketi ve bypass tokenını al',
        'Mühendisten tıkalı kapak numarasını (H1–H4), Komutandan mandal kodunu (M1–M3) al',
      ],
    },
  };

  const detail = roleDetails[state.myRole] || roleDetails.kaptan;

  return (
    <div className="w-full max-w-[460px] mx-auto bg-[#141123] text-[#e6dff9] rounded-3xl border border-white/10 shadow-2xl p-5 flex flex-col gap-4 select-none">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="min-w-0">
          <p className="text-xs font-mono text-[#9e8f78] uppercase tracking-wider truncate">
            {themeMeta.shortTitle} · {playerCount} Kişi · 5 Aşamalı Brifing
          </p>
          <h1 className={`font-sora text-xl font-bold mt-0.5 truncate ${detailColorClass}`}>
            {meta.title}
          </h1>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-[#201d30] border border-white/10 flex items-center justify-center shrink-0">
          <ShieldCheck className={`w-6 h-6 ${detailColorClass}`} />
        </div>
      </div>

      <p className="text-sm text-[#d5c4ac] leading-relaxed">
        {meta.summary}
      </p>

      <div className="flex flex-col gap-3">
        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00eefc] mb-2">
            <Eye className="w-4 h-4" />
            <span>Senin Ekranında Görünenler (5 Aşama)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#e6dff9] leading-relaxed">
            {detail.sees.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#ffb703] mb-2">
            <EyeOff className="w-4 h-4" />
            <span>Ekip Arkadaşlarından İsteyeceklerin</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#d5c4ac] leading-relaxed">
            {detail.asks.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        onClick={onConfirmRole}
        disabled={myConfirmed}
        className={`w-full min-h-[48px] px-4 py-3 rounded-xl font-sora text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          myConfirmed
            ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 cursor-default'
            : 'bg-[#ffb703] hover:bg-[#ffc633] text-[#271900]'
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>
          {myConfirmed
            ? 'Rol Onaylandı · Diğer Oyuncular Bekleniyor'
            : 'Rolümü Anladım, Göreve Başla'}
        </span>
      </button>
    </div>
  );
};
