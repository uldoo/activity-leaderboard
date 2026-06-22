import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCcw, Signal } from 'lucide-react';
import { Leaderboard } from '../components/Leaderboard';
import { Layout } from '../components/Layout';
import { RecentActivities } from '../components/RecentActivities';
import { SeasonProgress } from '../components/SeasonProgress';
import { getCurrentMonthBounds } from '../lib/date';
import { getMemberScores, getRecentActivities, getSeasonActivities } from '../lib/scoring';
import { supabase, supabaseConfigError } from '../lib/supabase';
import type { Activity, Member } from '../types/database';

export function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthBounds = useMemo(() => getCurrentMonthBounds(), []);

  const loadDashboard = useCallback(async (silent = false) => {
    if (!supabase) {
      setError(supabaseConfigError);
      setLoading(false);
      return;
    }

    if (!silent) {
      setLoading(true);
    }

    try {
      const [memberResult, activityResult] = await Promise.all([
        supabase.from('members').select('*').eq('is_active', true).order('created_at', { ascending: true }),
        supabase.from('activities').select('*').order('created_at', { ascending: false }),
      ]);

      if (memberResult.error) {
        throw memberResult.error;
      }

      if (activityResult.error) {
        throw activityResult.error;
      }

      setMembers(memberResult.data ?? []);
      setActivities(activityResult.data ?? []);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '대시보드 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();

    const client = supabase;

    if (!client) {
      return undefined;
    }

    const channel = client
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        void loadDashboard(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        void loadDashboard(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_rules' }, () => {
        void loadDashboard(true);
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setError('실시간 구독 연결이 불안정합니다. Supabase Realtime 설정을 확인해주세요.');
        }
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [loadDashboard]);

  const scores = useMemo(() => getMemberScores(members, activities), [activities, members]);
  const recentActivities = useMemo(
    () => getRecentActivities(getSeasonActivities(activities), members, 10),
    [activities, members],
  );

  return (
    <Layout wide>
      <div className="space-y-4 sm:space-y-6">
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-black text-yellow-200">
                <Signal className="h-4 w-4" aria-hidden="true" />
                LIVE LEADERBOARD
              </div>
              <h1 className="text-3xl font-black tracking-normal text-white sm:text-5xl">인류애 랭킹 보드</h1>
              <p className="mt-3 hidden max-w-2xl text-sm font-semibold leading-6 text-zinc-400 sm:block sm:text-base">
                시즌 누적 점수와 {monthBounds.label} 점수를 한눈에 확인하는 단톡방 리더보드입니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-black transition hover:bg-yellow-200"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              새로고침
            </button>
          </div>
        </section>

        {error ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-100 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="font-bold">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-black"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              다시 시도
            </button>
          </div>
        ) : null}

        <SeasonProgress />

        {loading ? (
          <section className="grid gap-4 lg:grid-cols-3" aria-label="랭킹 로딩 중">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-2xl bg-zinc-900" />
            ))}
          </section>
        ) : scores.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-12 text-center">
            <p className="text-4xl" aria-hidden="true">
              🏁
            </p>
            <h2 className="mt-3 text-xl font-black text-white">아직 랭킹 데이터가 없습니다.</h2>
            <p className="mt-2 font-semibold text-zinc-500">관리자 페이지에서 참가자와 점수를 등록하면 시작됩니다.</p>
          </section>
        ) : (
          <Leaderboard scores={scores} monthLabel={monthBounds.label} />
        )}

        <RecentActivities activities={recentActivities} loading={loading} />
      </div>
    </Layout>
  );
}
