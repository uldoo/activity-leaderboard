import { Crown, MessageCircle } from 'lucide-react';
import { formatKoreanDate } from '../lib/date';
import type { MemberScore } from '../lib/scoring';
import { RankBadge } from './RankBadge';

type RankingCardProps = {
  entry: MemberScore;
  mode: 'season' | 'monthly';
  position: number;
  highlight?: boolean;
};

export function RankingCard({ entry, mode, position, highlight = false }: RankingCardProps) {
  const primaryScore = mode === 'season' ? entry.seasonScore : entry.monthScore;
  const primaryLabel = mode === 'season' ? '시즌 점수' : '월간 점수';
  const recentText = entry.recentActivity
    ? `${entry.recentActivity.activity_type} · ${entry.recentActivity.score}점 · ${formatKoreanDate(
        entry.recentActivity.activity_date,
      )}`
    : '아직 활동 없음';

  return (
    <article
      className={[
        'relative overflow-hidden rounded-2xl border p-4 shadow-card transition hover:-translate-y-0.5',
        highlight
          ? 'border-yellow-300 bg-gradient-to-br from-white via-yellow-50 to-orange-100 shadow-board'
          : 'border-orange-100 bg-white',
      ].join(' ')}
    >
      {highlight ? (
        <div className="absolute right-3 top-3 rounded-full bg-honey px-2 py-1 text-xs font-black text-amber-900">
          1위
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        <div
          className={[
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black',
            highlight ? 'bg-honey text-amber-900' : 'bg-peach text-orange-700',
          ].join(' ')}
          aria-label={`${position}위`}
        >
          {highlight ? <Crown className="h-6 w-6" aria-hidden="true" /> : position}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 pr-12">
            <span className="text-3xl" aria-hidden="true">
              {entry.member.profile_emoji ?? '🙂'}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black sm:text-lg">{entry.member.name}</h3>
              <RankBadge rank={entry.rank} size="sm" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-bold text-slate-500">{primaryLabel}</p>
              <p className="text-2xl font-black text-ink">{primaryScore.toLocaleString()}점</p>
            </div>
            <div className="rounded-xl bg-orange-50 px-3 py-2">
              <p className="text-xs font-bold text-orange-500">
                {mode === 'season' ? '월간 점수' : '시즌 누적'}
              </p>
              <p className="text-2xl font-black text-orange-700">
                {(mode === 'season' ? entry.monthScore : entry.seasonScore).toLocaleString()}점
              </p>
            </div>
          </div>

          <p className="mt-3 flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-500">
            <MessageCircle className="h-4 w-4 shrink-0 text-mandarin" aria-hidden="true" />
            <span className="truncate">{recentText}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
