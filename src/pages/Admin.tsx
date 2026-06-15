import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, LogOut, RefreshCcw, ShieldCheck } from 'lucide-react';
import { ActivityHistory } from '../components/ActivityHistory';
import { ActivityRuleManager } from '../components/ActivityRuleManager';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminTabs, type AdminTab } from '../components/AdminTabs';
import { Layout } from '../components/Layout';
import { MemberManager } from '../components/MemberManager';
import { ScoreForm, type ScoreFormValues } from '../components/ScoreForm';
import { supabase, supabaseConfigError } from '../lib/supabase';
import type {
  Activity,
  ActivityInsert,
  ActivityRule,
  ActivityRuleInsert,
  ActivityRuleUpdate,
  ActivityUpdate,
  Member,
  MemberInsert,
  MemberUpdate,
} from '../types/database';

export function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [booting, setBooting] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityRules, setActivityRules] = useState<ActivityRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(supabase ? null : supabaseConfigError);

  const loadAdminData = useCallback(async (silent = false) => {
    if (!supabase) {
      setError(supabaseConfigError);
      setBooting(false);
      return;
    }

    if (!silent) {
      setMessage(null);
    }

    try {
      const [memberResult, activityResult, ruleResult] = await Promise.all([
        supabase.from('members').select('*').order('created_at', { ascending: true }),
        supabase.from('activities').select('*').order('created_at', { ascending: false }),
        supabase.from('activity_rules').select('*').order('sort_order', { ascending: true }),
      ]);

      if (memberResult.error) {
        throw memberResult.error;
      }

      if (activityResult.error) {
        throw activityResult.error;
      }

      if (ruleResult.error) {
        throw ruleResult.error;
      }

      setMembers(memberResult.data ?? []);
      setActivities(activityResult.data ?? []);
      setActivityRules(ruleResult.data ?? []);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '관리자 데이터를 불러오지 못했습니다.');
    }
  }, []);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      setBooting(false);
      return;
    }

    const verifyAdmin = async () => {
      setBooting(true);

      try {
        const { data: sessionData, error: sessionError } = await client.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const user = sessionData.session?.user;

        if (!user) {
          setIsAdmin(false);
          setError('로그인이 필요합니다.');
          return;
        }

        const { data: admin, error: adminError } = await client
          .from('admins')
          .select('id,email')
          .eq('user_id', user.id)
          .maybeSingle();

        if (adminError) {
          throw adminError;
        }

        if (!admin) {
          await client.auth.signOut();
          setIsAdmin(false);
          setError('관리자 권한이 없습니다. Supabase admins 테이블에 등록된 계정만 접근할 수 있습니다.');
          return;
        }

        setIsAdmin(true);
        setAdminEmail(user.email ?? admin.email);
        await loadAdminData(true);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : '관리자 권한 확인에 실패했습니다.');
      } finally {
        setBooting(false);
      }
    };

    void verifyAdmin();
  }, [loadAdminData]);

  const runMutation = async (task: () => Promise<void>, successMessage: string, id?: string) => {
    setSaving(true);
    setBusyId(id ?? null);
    setError(null);
    setMessage(null);

    try {
      await task();
      setMessage(successMessage);
      await loadAdminData(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '작업을 완료하지 못했습니다.');
    } finally {
      setSaving(false);
      setBusyId(null);
    }
  };

  const handleLogout = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    window.location.assign('/login');
  };

  const createMember = async (values: MemberInsert) => {
    await runMutation(async () => {
      if (!supabase) {
        throw new Error(supabaseConfigError);
      }

      const { error: insertError } = await supabase.from('members').insert(values);
      if (insertError) {
        throw insertError;
      }
    }, '참가자가 추가되었습니다.');
  };

  const updateMember = async (member: Member, values: MemberUpdate) => {
    await runMutation(
      async () => {
        if (!supabase) {
          throw new Error(supabaseConfigError);
        }

        const { error: updateError } = await supabase.from('members').update(values).eq('id', member.id);
        if (updateError) {
          throw updateError;
        }
      },
      '참가자 정보가 수정되었습니다.',
      member.id,
    );
  };

  const deleteMember = async (member: Member) => {
    if (!window.confirm(`${member.name} 참가자를 삭제할까요? 연결된 활동 내역도 함께 삭제됩니다.`)) {
      return;
    }

    await runMutation(
      async () => {
        if (!supabase) {
          throw new Error(supabaseConfigError);
        }

        const { error: deleteError } = await supabase.from('members').delete().eq('id', member.id);
        if (deleteError) {
          throw deleteError;
        }
      },
      '참가자가 삭제되었습니다.',
      member.id,
    );
  };

  const createActivity = async (values: ScoreFormValues) => {
    await runMutation(async () => {
      if (!supabase) {
        throw new Error(supabaseConfigError);
      }

      const payload: ActivityInsert = {
        member_id: values.member_id,
        activity_rule_id: values.activity_rule_id,
        activity_type: values.activity_type,
        category: values.category,
        score: values.score,
        activity_date: values.activity_date,
        memo: values.memo || null,
      };
      const { error: insertError } = await supabase.from('activities').insert(payload);
      if (insertError) {
        throw insertError;
      }
    }, '점수가 부여되었습니다.');
  };

  const updateActivity = async (activity: Activity, values: ScoreFormValues) => {
    await runMutation(
      async () => {
        if (!supabase) {
          throw new Error(supabaseConfigError);
        }

        const payload: ActivityUpdate = {
          member_id: values.member_id,
          activity_rule_id: values.activity_rule_id,
          activity_type: values.activity_type,
          category: values.category,
          score: values.score,
          activity_date: values.activity_date,
          memo: values.memo || null,
          updated_at: new Date().toISOString(),
        };
        const { error: updateError } = await supabase.from('activities').update(payload).eq('id', activity.id);
        if (updateError) {
          throw updateError;
        }
      },
      '활동 내역이 수정되었습니다.',
      activity.id,
    );
  };

  const deleteActivity = async (activity: Activity) => {
    if (!window.confirm('이 활동 내역을 삭제할까요? 점수 합산에서도 제외됩니다.')) {
      return;
    }

    await runMutation(
      async () => {
        if (!supabase) {
          throw new Error(supabaseConfigError);
        }

        const { error: deleteError } = await supabase.from('activities').delete().eq('id', activity.id);
        if (deleteError) {
          throw deleteError;
        }
      },
      '활동 내역이 삭제되었습니다.',
      activity.id,
    );
  };

  const createRule = async (values: ActivityRuleInsert) => {
    await runMutation(async () => {
      if (!supabase) {
        throw new Error(supabaseConfigError);
      }

      const { error: insertError } = await supabase.from('activity_rules').insert(values);
      if (insertError) {
        throw insertError;
      }
    }, '점수 규칙이 추가되었습니다.');
  };

  const updateRule = async (rule: ActivityRule, values: ActivityRuleUpdate) => {
    await runMutation(
      async () => {
        if (!supabase) {
          throw new Error(supabaseConfigError);
        }

        const { error: updateError } = await supabase.from('activity_rules').update(values).eq('id', rule.id);
        if (updateError) {
          throw updateError;
        }
      },
      '점수 규칙이 수정되었습니다.',
      rule.id,
    );
  };

  const deleteRule = async (rule: ActivityRule) => {
    if (!window.confirm(`${rule.name} 규칙을 삭제할까요? 이미 저장된 활동 내역의 스냅샷은 유지됩니다.`)) {
      return;
    }

    await runMutation(
      async () => {
        if (!supabase) {
          throw new Error(supabaseConfigError);
        }

        const { error: deleteError } = await supabase.from('activity_rules').delete().eq('id', rule.id);
        if (deleteError) {
          throw deleteError;
        }
      },
      '점수 규칙이 삭제되었습니다.',
      rule.id,
    );
  };

  if (booting) {
    return (
      <Layout wide>
        <div className="grid gap-4 lg:grid-cols-3" aria-label="관리자 페이지 로딩 중">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl bg-zinc-900" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <section className="mx-auto max-w-xl rounded-3xl border border-red-500/30 bg-zinc-950 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black text-white">관리자 접근이 필요합니다.</h1>
          <p className="mt-3 font-semibold leading-7 text-zinc-400">{error ?? '로그인 후 다시 시도해주세요.'}</p>
          <a
            href="/login"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 font-black text-black"
          >
            로그인으로 이동
          </a>
        </section>
      </Layout>
    );
  }

  return (
    <Layout wide>
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-black text-yellow-200">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ADMIN CONTROL
              </div>
              <h1 className="text-3xl font-black text-white">관리자 설정</h1>
              <p className="mt-2 text-sm font-semibold text-zinc-500">{adminEmail}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadAdminData()}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-black px-4 text-sm font-black text-zinc-200 transition hover:border-white/30"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                새로고침
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-black transition hover:bg-yellow-200"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                로그아웃
              </button>
            </div>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 font-bold text-emerald-100">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="flex gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-bold text-red-100">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : null}

        <AdminTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'dashboard' ? <AdminDashboard members={members} activities={activities} /> : null}
        {activeTab === 'members' ? (
          <MemberManager
            members={members}
            activities={activities}
            isSaving={saving}
            busyId={busyId}
            onCreate={createMember}
            onUpdate={updateMember}
            onDelete={deleteMember}
          />
        ) : null}
        {activeTab === 'score' ? (
          <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5">
            <h2 className="text-xl font-black text-white">점수 부여</h2>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              활성화된 활동 유형만 선택할 수 있고, 기본 점수는 자동 입력됩니다.
            </p>
            <div className="mt-5">
              <ScoreForm
                members={members}
                activityRules={activityRules}
                isSubmitting={saving}
                onSubmit={createActivity}
              />
            </div>
          </section>
        ) : null}
        {activeTab === 'history' ? (
          <ActivityHistory
            activities={activities}
            members={members}
            activityRules={activityRules}
            isSaving={saving}
            busyId={busyId}
            onUpdate={updateActivity}
            onDelete={deleteActivity}
          />
        ) : null}
        {activeTab === 'rules' ? (
          <ActivityRuleManager
            rules={activityRules}
            isSaving={saving}
            busyId={busyId}
            onCreate={createRule}
            onUpdate={updateRule}
            onDelete={deleteRule}
          />
        ) : null}
      </div>
    </Layout>
  );
}
