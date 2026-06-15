import { useMemo, useState, type FormEvent } from 'react';
import { Eye, Pencil, Save, Trash2, X } from 'lucide-react';
import { formatKoreanDate } from '../lib/date';
import { getMemberActivities, getMemberScores } from '../lib/scoring';
import type { Activity, Member, MemberInsert, MemberUpdate } from '../types/database';
import { RankBadge } from './RankBadge';

type MemberManagerProps = {
  members: Member[];
  activities: Activity[];
  isSaving?: boolean;
  busyId?: string | null;
  onCreate: (values: MemberInsert) => Promise<void>;
  onUpdate: (member: Member, values: MemberUpdate) => Promise<void>;
  onDelete: (member: Member) => Promise<void>;
};

const emptyForm = {
  name: '',
  profile_emoji: '🙂',
  is_active: true,
};

export function MemberManager({
  members,
  activities,
  isSaving = false,
  busyId = null,
  onCreate,
  onUpdate,
  onDelete,
}: MemberManagerProps) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [detailMemberId, setDetailMemberId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const scores = useMemo(() => getMemberScores(members, activities, new Date(), { includeInactive: true }), [activities, members]);
  const scoreByMemberId = useMemo(() => new Map(scores.map((score) => [score.member.id, score])), [scores]);
  const detailMember = members.find((member) => member.id === detailMemberId) ?? null;
  const detailActivities = detailMember ? getMemberActivities(detailMember.id, activities) : [];

  const startEdit = (member: Member) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      profile_emoji: member.profile_emoji ?? '🙂',
      is_active: member.is_active !== false,
    });
  };

  const resetForm = () => {
    setEditingMember(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      profile_emoji: form.profile_emoji.trim() || '🙂',
      is_active: form.is_active,
    };

    if (editingMember) {
      await onUpdate(editingMember, payload);
    } else {
      await onCreate(payload);
    }

    resetForm();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
        <h2 className="text-xl font-black text-white">참가자 추가/수정</h2>
        <p className="mt-1 text-sm font-semibold text-zinc-500">이름, 프로필 이모지, 활성 상태를 관리합니다.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-[88px_1fr] gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-black text-zinc-500">이모지</span>
              <input
                className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 text-center text-2xl text-white outline-none ring-yellow-300 focus:ring-2"
                maxLength={4}
                value={form.profile_emoji}
                onChange={(event) => setForm((current) => ({ ...current, profile_emoji: event.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-black text-zinc-500">이름</span>
              <input
                className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 placeholder:text-zinc-700 focus:ring-2"
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="예: 모임대장"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black px-3 py-3 text-sm font-bold text-zinc-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            활성 참가자로 공개 랭킹에 표시
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-yellow-300 px-4 text-sm font-black text-black hover:bg-yellow-200 disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {editingMember ? '수정 저장' : '참가자 추가'}
            </button>
            {editingMember ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-black px-4 text-sm font-black text-zinc-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                취소
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white">참가자 목록</h2>
            <p className="text-sm font-semibold text-zinc-500">상세 점수 내역까지 바로 확인합니다.</p>
          </div>
          <p className="text-sm font-black text-yellow-200">{members.length.toLocaleString()}명</p>
        </div>

        {members.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black px-4 py-8 text-center font-bold text-zinc-500">
            참가자가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const score = scoreByMemberId.get(member.id);

              return (
                <article key={member.id} className="rounded-xl border border-white/10 bg-black p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-2xl">
                        {member.profile_emoji ?? '🙂'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-black text-white">{member.name}</p>
                          <span
                            className={[
                              'rounded-full px-2 py-0.5 text-xs font-black',
                              member.is_active === false
                                ? 'border border-zinc-700 text-zinc-500'
                                : 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
                            ].join(' ')}
                          >
                            {member.is_active === false ? '비활성' : '활성'}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-500">
                          {score ? <RankBadge rank={score.rank} size="sm" /> : null}
                          <span>시즌 {score?.seasonScore.toLocaleString() ?? 0}점</span>
                          <span>월간 {score?.monthScore.toLocaleString() ?? 0}점</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailMemberId(detailMemberId === member.id ? null : member.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm font-black text-zinc-200"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        상세
                      </button>
                      <button
                        type="button"
                        disabled={busyId === member.id}
                        onClick={() => startEdit(member)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-black text-black disabled:opacity-60"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        수정
                      </button>
                      <button
                        type="button"
                        disabled={busyId === member.id}
                        onClick={() => void onUpdate(member, { is_active: member.is_active === false })}
                        className="inline-flex h-9 items-center rounded-lg border border-yellow-400/30 px-3 text-sm font-black text-yellow-200 disabled:opacity-60"
                      >
                        {member.is_active === false ? '활성화' : '비활성화'}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === member.id}
                        onClick={() => void onDelete(member)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-sm font-black text-red-200 disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        삭제
                      </button>
                    </div>
                  </div>

                  {detailMemberId === member.id ? (
                    <div className="mt-3 rounded-xl border border-white/10 bg-zinc-950 p-3">
                      <h3 className="font-black text-white">상세 점수 내역</h3>
                      {detailActivities.length === 0 ? (
                        <p className="mt-2 text-sm font-bold text-zinc-500">활동 내역이 없습니다.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {detailActivities.slice(0, 12).map((activity) => (
                            <div
                              key={activity.id}
                              className="grid gap-1 rounded-lg bg-black px-3 py-2 text-sm sm:grid-cols-[1fr_auto]"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-bold text-zinc-200">
                                  {activity.activity_type}
                                  {activity.category ? ` · ${activity.category}` : ''}
                                </p>
                                <p className="truncate text-xs font-semibold text-zinc-600">
                                  {formatKoreanDate(activity.activity_date)} · {activity.memo || '메모 없음'}
                                </p>
                              </div>
                              <p className="font-black text-yellow-200">+{activity.score.toLocaleString()}점</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
