import { CalendarDays } from 'lucide-react';
import { SEASON_END_DATE, SEASON_START_DATE, formatKoreanDate, getSeasonProgress } from '../lib/date';

export function SeasonProgress() {
  const progress = getSeasonProgress();

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-200">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {progress.label}
          </div>
          <h2 className="text-lg font-black text-white">시즌 진행률</h2>
          <p className="mt-1 text-sm font-semibold text-zinc-500">
            {formatKoreanDate(SEASON_START_DATE)} - {formatKoreanDate(SEASON_END_DATE)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-3xl font-black text-yellow-200">{progress.progressPercent}%</p>
          <p className="text-xs font-bold text-zinc-500">
            {progress.elapsedDays.toLocaleString()} / {progress.totalDays.toLocaleString()}일
          </p>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-900">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-yellow-200 to-white"
          style={{ width: `${progress.progressPercent}%` }}
        />
      </div>
    </section>
  );
}
