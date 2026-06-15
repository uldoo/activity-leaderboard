import type { ReactNode } from 'react';
import { CalendarDays, Crown, Trophy, Users } from 'lucide-react';
import { SEASON_END_DATE, formatKoreanDate } from '../lib/date';
import { getMonthlyLeaderboard, type MemberScore } from '../lib/scoring';

type ScoreSummaryProps = {
  scores: MemberScore[];
  monthLabel: string;
  daysRemaining: number;
};

type SummaryItem = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: string;
};

export function ScoreSummary({ scores, monthLabel, daysRemaining }: ScoreSummaryProps) {
  const seasonLeader = scores[0];
  const monthlyLeader = getMonthlyLeaderboard(scores)[0];
  const totalSeasonScore = scores.reduce((sum, entry) => sum + entry.seasonScore, 0);

  const items: SummaryItem[] = [
    {
      label: '참여자',
      value: `${scores.length.toLocaleString()}명`,
      detail: `시즌 누적 ${totalSeasonScore.toLocaleString()}점`,
      icon: <Users className="h-5 w-5" aria-hidden="true" />,
      tone: 'bg-skysoft text-blue-700',
    },
    {
      label: '시즌 1위',
      value: seasonLeader ? seasonLeader.member.name : '-',
      detail: seasonLeader ? `${seasonLeader.seasonScore.toLocaleString()}점` : '아직 점수가 없어요',
      icon: <Crown className="h-5 w-5" aria-hidden="true" />,
      tone: 'bg-yellow-100 text-amber-700',
    },
    {
      label: `${monthLabel} 1위`,
      value: monthlyLeader ? monthlyLeader.member.name : '-',
      detail: monthlyLeader ? `${monthlyLeader.monthScore.toLocaleString()}점` : '이번 달 기록 없음',
      icon: <Trophy className="h-5 w-5" aria-hidden="true" />,
      tone: 'bg-peach text-orange-700',
    },
    {
      label: '시즌 종료',
      value: `${daysRemaining.toLocaleString()}일 남음`,
      detail: formatKoreanDate(SEASON_END_DATE),
      icon: <CalendarDays className="h-5 w-5" aria-hidden="true" />,
      tone: 'bg-mint text-emerald-700',
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="점수 요약">
      {items.map((item) => (
        <article key={item.label} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-slate-400">{item.label}</p>
              <p className="mt-1 truncate text-2xl font-black text-ink">{item.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{item.detail}</p>
            </div>
            <div className={['flex h-10 w-10 items-center justify-center rounded-xl', item.tone].join(' ')}>
              {item.icon}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
