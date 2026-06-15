import { useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';
import { formatKoreanDate } from '../lib/date';
import { getMonthlyLeaderboard, RANK_RULES, type MemberScore } from '../lib/scoring';
import { RankBadge } from './RankBadge';

type LeaderboardProps = {
  scores: MemberScore[];
  monthLabel: string;
};

function TopCard({ entry, index }: { entry: MemberScore; index: number }) {
  const isFirst = index === 0;

  return (
    <article
      className={[
        'relative rounded-2xl border p-4',
        isFirst
          ? 'border-yellow-300/60 bg-gradient-to-br from-yellow-300/20 via-zinc-950 to-zinc-950 shadow-[0_0_60px_rgba(250,204,21,0.12)]'
          : 'border-white/10 bg-zinc-950',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black',
              isFirst ? 'bg-yellow-300 text-black' : 'bg-zinc-900 text-zinc-100',
            ].join(' ')}
          >
            {isFirst ? <Crown className="h-6 w-6" aria-hidden="true" /> : index + 1}
          </div>
          <div>
            <p className="text-3xl" aria-hidden="true">
              {entry.member.profile_emoji ?? '🙂'}
            </p>
            <h3 className="mt-1 text-lg font-black text-white">{entry.member.name}</h3>
          </div>
        </div>
        <RankBadge rank={entry.rank} size="sm" />
      </div>
      <p className="mt-4 text-4xl font-black text-white">{entry.seasonScore.toLocaleString()}</p>
      <p className="text-sm font-bold text-zinc-500">시즌 누적 점수</p>
    </article>
  );
}

function ScoreRow({ entry, mode }: { entry: MemberScore; mode: 'season' | 'month' }) {
  const rank = mode === 'season' ? entry.seasonRank : entry.monthlyRank;
  const score = mode === 'season' ? entry.seasonScore : entry.monthScore;

  return (
    <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-3 py-3">
      <div
        className={[
          'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black',
          rank === 1 ? 'bg-yellow-300 text-black' : 'bg-zinc-900 text-zinc-300',
        ].join(' ')}
      >
        {rank === 1 ? <Crown className="h-5 w-5" aria-hidden="true" /> : rank}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            {entry.member.profile_emoji ?? '🙂'}
          </span>
          <p className="truncate font-black text-white">{entry.member.name}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-500">
          <RankBadge rank={entry.rank} size="sm" />
          <span>월간 {entry.monthScore.toLocaleString()}점</span>
          {entry.recentActivity ? (
            <span className="truncate">
              최근 {entry.recentActivity.activity_type} · {formatKoreanDate(entry.recentActivity.activity_date)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-black text-white">{score.toLocaleString()}</p>
        <p className="text-xs font-bold text-zinc-500">points</p>
      </div>
    </div>
  );
}

export function Leaderboard({ scores, monthLabel }: LeaderboardProps) {
  const monthlyScores = getMonthlyLeaderboard(scores);
  const topThree = scores.slice(0, 3);
  const [mobileTab, setMobileTab] = useState<'season' | 'month'>('season');

  const mobileTabClass = (active: boolean) =>
    [
      'inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-black transition',
      active ? 'bg-white text-black' : 'border border-white/10 bg-zinc-950 text-zinc-400',
    ].join(' ');

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-200" aria-hidden="true" />
          <h2 className="text-xl font-black text-white">시즌 TOP 3</h2>
        </div>
        {topThree.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-10 text-center font-bold text-zinc-500">
            아직 랭킹 데이터가 없습니다.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {topThree.map((entry, index) => (
              <TopCard key={entry.member.id} entry={entry} index={index} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 grid grid-cols-2 gap-2 lg:hidden">
          <button type="button" onClick={() => setMobileTab('season')} className={mobileTabClass(mobileTab === 'season')}>
            <Medal className="h-4 w-4" aria-hidden="true" />
            전체 랭킹
          </button>
          <button type="button" onClick={() => setMobileTab('month')} className={mobileTabClass(mobileTab === 'month')}>
            <Medal className="h-4 w-4" aria-hidden="true" />
            {monthLabel}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={[mobileTab === 'season' ? 'block' : 'hidden', 'space-y-3 lg:block'].join(' ')}>
            <div className="hidden items-center gap-2 lg:flex">
              <Medal className="h-5 w-5 text-yellow-200" aria-hidden="true" />
              <h2 className="text-xl font-black text-white">전체 랭킹</h2>
            </div>
            {scores.map((entry) => (
              <ScoreRow key={entry.member.id} entry={entry} mode="season" />
            ))}
          </div>

          <div className={[mobileTab === 'month' ? 'block' : 'hidden', 'space-y-3 lg:block'].join(' ')}>
            <div className="hidden items-center gap-2 lg:flex">
              <Medal className="h-5 w-5 text-zinc-200" aria-hidden="true" />
              <h2 className="text-xl font-black text-white">{monthLabel} 랭킹</h2>
            </div>
            {monthlyScores.map((entry) => (
              <ScoreRow key={entry.member.id} entry={entry} mode="month" />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
        <h2 className="text-lg font-black text-white">랭크 기준표</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {RANK_RULES.map((rank) => (
            <div key={rank.name} className="rounded-xl border border-white/10 bg-black px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl" aria-hidden="true">
                  {rank.icon}
                </span>
                <span className="text-sm font-black text-white">{rank.name}</span>
              </div>
              <p className="mt-2 text-xs font-bold text-zinc-500">
                {rank.max === Number.POSITIVE_INFINITY
                  ? `${rank.min.toLocaleString()}점 이상`
                  : `${rank.min.toLocaleString()}-${rank.max.toLocaleString()}점`}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
