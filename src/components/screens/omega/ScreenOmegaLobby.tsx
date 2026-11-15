import React, { useState } from 'react';
import { MissionState, Role } from '../../../types/game';
import {
  getOmegaRoleMeta,
  getOmegaRolesForCount,
  generateOmegaData,
  getTeamOperationMeta,
} from '../../../services/omegaGameEngine';
import { soundManager } from '../../../services/soundEffects';
import { Copy, Check, Link2, Share2, Users, ShieldCheck, ArrowLeftRight, Play, Radio, QrCode } from 'lucide-react';
import { InviteQRCode } from '../../InviteQRCode';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onStartGame: () => void;
  onLeaveToEntry?: () => void;
  isOnline?: boolean;
  isHost?: boolean;
  onToggleMyReady?: () => void;
  onSelectRole?: (role: Role) => void;
}

export const ScreenOmegaLobby: React.FC<Props> = ({
  state,
  onUpdate,
  onStartGame,
  onLeaveToEntry,
  isOnline = false,
  isHost = true,
  onToggleMyReady,
  onSelectRole,
}) => {
  const playerCount: 3 | 4 = state.targetPlayerCount === 3 || state.omegaData?.playerCount === 3 ? 3 : 4;
  const roles = getOmegaRolesForCount(playerCount) as Role[];
  const themeMeta = getTeamOperationMeta(state.operationTheme);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [radioOk, setRadioOk] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const copyText = (text: string, type: 'code' | 'link') => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopyInvite = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('room', state.roomCode);
      copyText(url.toString(), 'link');
    } else {
      copyText(state.roomCode, 'code');
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('room', state.roomCode);
    const msg = `${themeMeta.title} (${playerCount} Kişilik · 5 Aşamalı Takım Operasyonu) başladı!\nOda Kodu: ${state.roomCode}\nKatılım Linki: ${url.toString()}\nNot: Ekranlara bakmak yasak, sesli iletişimle oynanır.`;
    const link = document.createElement('a');
    link.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const handleRolePick = (targetRole: Role) => {
    if (isOnline && onSelectRole) {
      onSelectRole(targetRole);
      return;
    }
    onUpdate((prev) => ({
      ...prev,
      myRole: targetRole,
    }));
  };

  const handleToggleSlotReady = (slotRole: Role) => {
    if (isOnline) {
      if (slotRole === state.myRole && onToggleMyReady) {
        onToggleMyReady();
      } else {
        soundManager.playError();
      }
      return;
    }
    onUpdate((prev) => {
      const currentSlot = prev.players[slotRole] || {
        id: `local_${slotRole}`,
        name: getOmegaRoleMeta(slotRole, playerCount).defaultName,
        role: slotRole,
        ready: false,
        connected: true,
      };
      return {
        ...prev,
        players: {
          ...prev.players,
          [slotRole]: {
            ...currentSlot,
            ready: !currentSlot.ready,
            connected: true,
          },
        },
      };
    });
  };

  const handleReadyAllLocal = () => {
    if (isOnline) return;
    onUpdate((prev) => {
      const nextPlayers = { ...prev.players };
      for (const r of roles) {
        const existing = nextPlayers[r];
        const meta = getOmegaRoleMeta(r, playerCount);
        nextPlayers[r] = {
          id: existing?.id || `local_${r}`,
          name: existing?.name || meta.defaultName,
          role: r,
          ready: true,
          connected: true,
        };
      }
      return {
        ...prev,
        omegaData: prev.omegaData || generateOmegaData(playerCount, themeMeta.id),
        players: nextPlayers,
      };
    });
    soundManager.playSuccess();
  };

  const connectedCount = roles.filter((r) => {
    if (!isOnline) return true;
    const slot = state.players[r];
    return Boolean(slot?.connected && slot?.id);
  }).length;

  const readyCount = roles.filter((r) => Boolean(state.players[r]?.ready)).length;
  const allReady = connectedCount === playerCount && readyCount === playerCount;
  const mySlotReady = Boolean(state.players[state.myRole]?.ready);

  return (
    <div className="w-full max-w-[460px] mx-auto bg-[#141123] text-[#e6dff9] rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-5 flex flex-col gap-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="min-w-0">
          <p className="text-[11px] font-mono text-[#00eefc] uppercase tracking-wider truncate">
            {themeMeta.shortTitle} · {playerCount} Kişilik Takım Lobisi · 5 Aşama
          </p>
          <h1 className="font-sora text-lg font-bold text-white truncate">
            {themeMeta.title}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => (onLeaveToEntry ? onLeaveToEntry() : onUpdate((prev) => ({ ...prev, status: 'entry' })))}
          className="px-3 py-2 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/10 text-xs font-medium text-[#d5c4ac] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Girişe Dön
        </button>
      </div>

      {/* Room Code & Invite Strip */}
      <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono text-[#9e8f78] block">ODA KODU</span>
            <span className="font-mono text-2xl font-extrabold tracking-wider text-[#ffb703] tabular-nums">
              {state.roomCode}
            </span>
          </div>
          <div className="text-right font-mono text-xs tabular-nums">
            <span className="text-[#9e8f78] block">EKİP DURUMU</span>
            <span className="font-bold text-[#00eefc]">
              {connectedCount}/{playerCount} Bağlı · {readyCount}/{playerCount} Hazır
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => copyText(state.roomCode, 'code')}
            className="min-h-[42px] px-2.5 py-2 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/10 text-xs font-medium text-white flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {copied === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#ffb703]" />}
            <span>{copied === 'code' ? 'Kopyalandı' : 'Kodu Al'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopyInvite}
            className="min-h-[42px] px-2.5 py-2 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-white/10 text-xs font-medium text-white flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {copied === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-[#00eefc]" />}
            <span>{copied === 'link' ? 'Link Hazır' : 'Davet Linki'}</span>
          </button>
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="min-h-[42px] px-2.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-xs font-medium text-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Paylaş</span>
          </button>
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="min-h-[42px] px-2.5 py-2 rounded-xl bg-[#201d30] hover:bg-[#2b273b] border border-amber-400/30 text-xs font-medium text-amber-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <QrCode className="w-3.5 h-3.5 text-[#ffb703]" />
            <span>QR Kod</span>
          </button>
        </div>
      </div>

      {showQrModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQrModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
        >
          <div className="p-6 rounded-2xl bg-[#141123] border border-[#00eefc]/40 flex flex-col items-center gap-3 text-center max-w-xs shadow-2xl">
            <span className="text-xs font-mono text-[#00eefc] uppercase font-bold">
              {themeMeta.shortTitle} TAKIM QR KODU
            </span>
            <InviteQRCode roomCode={state.roomCode} />
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Role Slots (3 or 4 Players) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-[#9e8f78] px-1">
          <span className="font-semibold text-[#e6dff9] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#ffb703]" />
            <span>Ekip Rolleri ({playerCount} Oyuncu)</span>
          </span>
          {!isOnline && (
            <button
              type="button"
              onClick={handleReadyAllLocal}
              className="text-[#00eefc] hover:underline font-medium cursor-pointer"
            >
              Tüm Ekibi Hazırla
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {roles.map((r) => {
            const meta = getOmegaRoleMeta(r, playerCount);
            const slot = state.players[r];
            const isMine = state.myRole === r;
            const isConnected = !isOnline || Boolean(slot?.connected && slot?.id);
            const isReady = Boolean(slot?.ready);

            return (
              <div
                key={r}
                className={`p-3 rounded-2xl border transition-colors flex items-center justify-between gap-3 ${
                  isMine
                    ? 'bg-[#201d30] border-[#ffb703]/60'
                    : 'bg-[#1c192c] border-white/10'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-sora font-bold text-white truncate">
                      {meta.shortTitle}
                    </span>
                    <span className="text-[#9e8f78]">·</span>
                    <span className="text-[#d5c4ac] truncate">
                      {slot?.name || meta.waitingName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9e8f78] mt-0.5 line-clamp-1">
                    {isMine ? 'Senin aktif rolün' : isConnected ? 'Ekip üyesi bağlı' : 'Oyuncu bekleniyor'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isMine && (
                    <button
                      type="button"
                      onClick={() => handleRolePick(r)}
                      title={`${meta.shortTitle} rolüne geç`}
                      className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-[#d5c4ac] hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Geç</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleSlotReady(r)}
                    disabled={isOnline && !isMine}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      isReady
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                        : 'bg-[#0f0c1e] border-white/15 text-[#d5c4ac] hover:text-white'
                    } ${isOnline && !isMine ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isReady ? 'Hazır' : isConnected ? 'Bekliyor' : 'Boş'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Action Footer */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            if (isOnline) {
              if (allReady && isHost) {
                onStartGame();
              } else if (!allReady) {
                onToggleMyReady?.();
              }
            } else {
              if (!allReady) {
                handleReadyAllLocal();
              } else {
                onStartGame();
              }
            }
          }}
          disabled={isOnline && allReady && !isHost}
          className={`w-full min-h-[48px] px-4 py-3 rounded-xl font-sora text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            allReady && (!isOnline || isHost)
              ? 'bg-[#ffb703] hover:bg-[#ffc633] text-[#271900] shadow-lg'
              : 'bg-[#201d30] hover:bg-[#2b273b] border border-[#ffb703]/40 text-[#ffb703]'
          } ${isOnline && allReady && !isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>
            {allReady
              ? isOnline && !isHost
                ? 'Oda Lideri Başlatmayı Bekliyor...'
                : `Operasyonu Başlat (${playerCount} Oyuncu)`
              : !mySlotReady
              ? 'Hazır Olduğunu Onayla'
              : isOnline
              ? `Diğer Oyuncular Bekleniyor (${readyCount}/${playerCount})`
              : 'Tüm Ekibi Hazırla'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playRadioChirp();
            setRadioOk(true);
            setTimeout(() => setRadioOk(false), 1800);
          }}
          className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[#1c192c] hover:bg-[#25213a] border border-white/10 text-xs font-medium text-[#00eefc] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{radioOk ? 'Sesli Telsiz Bağlantısı Doğrulandı' : 'Ekip Telsizini Sına'}</span>
        </button>
      </div>
    </div>
  );
};
