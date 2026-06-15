import { Crown, Hash, ListChecks, Trophy, Users } from 'lucide-react';
import { getCurrentMonthBounds } from '../lib/date';
import { getMemberScores, getMonthlyLeaderboard, getRecentActivities } from '../lib/scoring';
import type { Activity, Member } from '../types/database';
import { RecentActivities } from './RecentActivities';

type AdminDashboardProps = {
  members: Member[];
  activities: Activity[];
};

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  gold = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  gold?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-zinc-500">{label}</p>
          <p className="mt-1 truncate text-2xl font-black text-white">{value}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-500">{detail}</p>
        </div>
        <div
          className={[
            'flex h-10 w-10 items-center justify-center rounded-xl border',
            gold ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-200' : 'border-white/10 bg-black text-zinc-200',
          ].join(' ')}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

export function AdminDashboard({ members, activities }: AdminDashboardProps) {
  const scores = getMemberScores(members, activities);
  const monthlyScores = getMonthlyLeaderboard(scores);
  const monthBounds = getCurrentMonthBounds();
  const monthActivities = activities.filter(
    (activity) =>
      activity.activity_date >= monthBounds.startDate && activity.activity_date < monthBounds.endDateExclusive,
  );
  const seasonTotal = scores.reduce((sum, entry) => sum + entry.seasonScore, 0);
  const monthTotal = monthActivities.reduce((sum, activity) => sum + activity.score, 0);
  const recentActivities = getRecentActivities(activities, members, 10);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="전체 참가자"
          value={`${members.length.toLocaleString()}명`}
          detail={`활성 ${members.filter((member) => member.is_active !== false).length.toLocaleString()}명`}
          icon={Users}
        />
        <StatCard
          label={`${monthBounds.label} 총점`}
          value={`${monthTotal.toLocaleString()}점`}
          detail={`${monthActivities.length.toLocaleString()}개 활동`}
          icon={Hash}
        />
        <StatCard
          label="시즌 총점"
          value={`${seasonTotal.toLocaleString()}점`}
          detail={`${activities.length.toLocaleString()}개 누적 활동`}
          icon={ListChecks}
        />
        <StatCard
          label="시즌 1위"
          value={scores[0]?.member.name ?? '-'}
          detail={scores[0] ? `${scores[0].seasonScore.toLocaleString()}점` : '기록 없음'}
          icon={Crown}
          gold
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-300 text-black">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-yellow-100">월간 1위</p>
              <p className="text-2xl font-black text-white">{monthlyScores[0]?.member.name ?? '-'}</p>
              <p className="text-sm font-bold text-yellow-100/70">
                {monthlyScores[0] ? `${monthlyScores[0].monthScore.toLocaleString()}점` : '기록 없음'}
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black text-zinc-100">
              <Crown className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500">시즌 1위</p>
              <p className="text-2xl font-black text-white">{scores[0]?.member.name ?? '-'}</p>
              <p className="text-sm font-bold text-zinc-500">
                {scores[0] ? `${scores[0].seasonScore.toLocaleString()}점` : '기록 없음'}
              </p>
            </div>
          </div>
        </article>
      </section>

      <RecentActivities activities={recentActivities} />
    </div>
  );
}
