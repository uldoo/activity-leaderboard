import { Clock3 } from 'lucide-react';
import { formatKoreanDate, formatKoreanDateTime } from '../lib/date';
import type { ActivityWithMember } from '../types/database';

type RecentActivitiesProps = {
  activities: ActivityWithMember[];
  loading?: boolean;
};

export function RecentActivities({ activities, loading = false }: RecentActivitiesProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">최근 활동</h2>
          <p className="text-sm font-semibold text-zinc-500">created_at 기준 최신순</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-400/30 bg-yellow-400/10 text-yellow-200">
          <Clock3 className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" aria-label="최근 활동 로딩 중">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-zinc-900" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black px-4 py-8 text-center font-bold text-zinc-500">
          아직 활동 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <article key={activity.id} className="flex gap-3 rounded-xl border border-white/10 bg-black px-3 py-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-2xl">
                {activity.member?.profile_emoji ?? '🙂'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="font-black text-white">{activity.member?.name ?? '삭제된 참여자'}</p>
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 text-xs font-black text-yellow-200">
                    +{activity.score.toLocaleString()}점
                  </span>
                  {activity.category ? (
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs font-bold text-zinc-400">
                      {activity.category}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm font-semibold text-zinc-300">
                  {activity.activity_type} · {formatKoreanDate(activity.activity_date)}
                </p>
                {activity.memo ? <p className="mt-1 truncate text-sm text-zinc-500">{activity.memo}</p> : null}
                <p className="mt-1 text-xs font-semibold text-zinc-600">
                  등록 {formatKoreanDateTime(activity.created_at)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
