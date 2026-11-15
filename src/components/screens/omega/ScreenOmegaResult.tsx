import React from 'react';
import { MissionState } from '../../../types/game';
import { getTeamOperationMeta } from '../../../services/omegaGameEngine';
import { Trophy, AlertOctagon, RotateCcw, Users, LogOut } from 'lucide-react';

interface Props {
  state: MissionState;
  onRestartGame: () => void;
  onBackToEntry?: () => void;
}

export const ScreenOmegaResult: React.FC<Props> = ({ state, onRestartGame, onBackToEntry }) => {
  const isSuccess = state.outcomeType === 'tam_basari';
  const omega = state.omegaData;
  const playerCount: 3 | 4 =
    state.targetPlayerCount === 3 || omega?.playerCount === 3 ? 3 : 4;
  const themeMeta = getTeamOperationMeta(omega?.themeId || state.operationTheme);
  const stats = omega?.teamStats;
  const breakdown = state.scoreBreakdown;

  return (
    <div className="w-full max-w-[460px] mx-auto bg-[#141123] text-[#e6dff9] rounded-3xl border border-white/10 shadow-2xl p-5 flex flex-col gap-4 select-none">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="min-w-0">
          <p className="text-[11px] font-mono text-[#9e8f78] uppercase tracking-wider truncate">
            {themeMeta.shortTitle} · {playerCount} Kişilik Operasyon Raporu ({state.completedTasksCount || 0}/5 Aşama)
          </p>
          <h1
            className={`font-sora text-xl font-extrabold mt-0.5 ${
              isSuccess ? 'text-emerald-300' : 'text-rose-400'
            }`}
          >
            {isSuccess ? 'Tahliye Başarıyla Tamamlandı' : 'Sistem Kritik Hata Verdi'}
          </h1>
        </div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
            isSuccess
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
          }`}
        >
          {isSuccess ? <Trophy className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2 font-mono tabular-nums text-center">
        <div className="p-3 rounded-2xl bg-[#1c192c] border border-white/10">
          <span className="text-[10px] text-[#9e8f78] block">TOPLAM PUAN</span>
          <span className="text-lg font-bold text-[#ffb703] block mt-0.5">
            {state.finalScore ?? 0}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-[#1c192c] border border-white/10">
          <span className="text-[10px] text-[#9e8f78] block">GÖVDE</span>
          <span className="text-lg font-bold text-[#00eefc] block mt-0.5">
            %{state.hullIntegrity}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-[#1c192c] border border-white/10">
          <span className="text-[10px] text-[#9e8f78] block">KALAN SÜRE</span>
          <span className="text-lg font-bold text-white block mt-0.5">
            {state.timeLeftSeconds}s
          </span>
        </div>
      </div>

      {/* Team Contribution Stats */}
      {stats && (
        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#00eefc]" />
              <span>Ekip Katkı Özeti</span>
            </span>
            <span className="font-mono text-rose-300 tabular-nums">
              Toplam Hata: {stats.mistakesCount}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
            <div className="px-2.5 py-2 rounded-xl bg-[#0f0c1e] flex items-center justify-between">
              <span className="text-[#ffb703]">Komutan</span>
              <span className="font-bold text-white">{stats.captainOps} hamle</span>
            </div>
            <div className="px-2.5 py-2 rounded-xl bg-[#0f0c1e] flex items-center justify-between">
              <span className="text-[#00eefc]">Mühendis</span>
              <span className="font-bold text-white">{stats.muhendisOps} hamle</span>
            </div>
            <div className="px-2.5 py-2 rounded-xl bg-[#0f0c1e] flex items-center justify-between">
              <span className="text-[#dab5ff]">Kriptolog</span>
              <span className="font-bold text-white">{stats.kriptologOps} hamle</span>
            </div>
            {playerCount === 4 && (
              <div className="px-2.5 py-2 rounded-xl bg-[#0f0c1e] flex items-center justify-between">
                <span className="text-emerald-300">Güvenlik</span>
                <span className="font-bold text-white">{stats.guvenlikOps} hamle</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      {breakdown && (
        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/10 text-xs font-mono space-y-1.5 tabular-nums">
          <div className="flex justify-between text-[#d5c4ac]">
            <span>Tamamlanan Aşama Puanı</span>
            <span>+{breakdown.tasksScore}</span>
          </div>
          <div className="flex justify-between text-[#d5c4ac]">
            <span>Zaman Bonusu</span>
            <span>+{breakdown.timeBonus}</span>
          </div>
          <div className="flex justify-between text-[#d5c4ac]">
            <span>Gövde Bütünlüğü Bonusu</span>
            <span>+{breakdown.hullBonus}</span>
          </div>
          <div className="flex justify-between text-[#d5c4ac]">
            <span>Kurtarılan Mürettebat ({state.rescuedCrewCount} kişi)</span>
            <span>+{breakdown.crewBonus}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onRestartGame}
          className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#ffb703] hover:bg-[#ffc633] text-[#271900] font-sora text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Aynı Ekiple Yeni Tur Başlat</span>
        </button>
        {onBackToEntry && (
          <button
            type="button"
            onClick={onBackToEntry}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1c192c] hover:bg-[#25213a] border border-white/10 text-[#00eefc] font-sora text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Ana Girişe Dön</span>
          </button>
        )}
      </div>
    </div>
  );
};
