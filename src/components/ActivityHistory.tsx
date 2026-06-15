import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatKoreanDate, formatKoreanDateTime } from '../lib/date';
import type { Activity, ActivityRule, Member } from '../types/database';
import { ScoreForm, type ScoreFormValues } from './ScoreForm';

type ActivityHistoryProps = {
  activities: Activity[];
  members: Member[];
  activityRules: ActivityRule[];
  isSaving?: boolean;
  busyId?: string | null;
  onUpdate: (activity: Activity, values: ScoreFormValues) => Promise<void>;
  onDelete: (activity: Activity) => Promise<void>;
};

export function ActivityHistory({
  activities,
  members,
  activityRules,
  isSaving = false,
  busyId = null,
  onUpdate,
  onDelete,
}: ActivityHistoryProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [memberFilter, setMemberFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const membersById = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);
  const activityTypes = useMemo(
    () => [...new Set(activities.map((activity) => activity.activity_type))].sort((a, b) => a.localeCompare(b, 'ko')),
    [activities],
  );
  const filteredActivities = useMemo(
    () =>
      activities.filter((activity) => {
        if (memberFilter && activity.member_id !== memberFilter) {
          return false;
        }
        if (typeFilter && activity.activity_type !== typeFilter) {
          return false;
        }
        if (dateFilter && activity.activity_date !== dateFilter) {
          return false;
        }
        return true;
      }),
    [activities, dateFilter, memberFilter, typeFilter],
  );

  return (
    <div className="space-y-6">
      {editingActivity ? (
        <section className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
          <h2 className="text-xl font-black text-white">활동 내역 수정</h2>
          <p className="mt-1 text-sm font-semibold text-yellow-100/70">
            활동 유형을 다시 선택하면 현재 규칙의 기본 점수가 자동 반영됩니다.
          </p>
          <div className="mt-4">
            <ScoreForm
              members={members}
              activityRules={activityRules}
              initialActivity={editingActivity}
              isSubmitting={isSaving}
              onCancel={() => setEditingActivity(null)}
              onSubmit={async (values) => {
                await onUpdate(editingActivity, values);
                setEditingActivity(null);
              }}
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-white">활동 내역</h2>
            <p className="text-sm font-semibold text-zinc-500">참가자, 활동 유형, 날짜로 필터링합니다.</p>
          </div>
          <p className="text-sm font-black text-yellow-200">{filteredActivities.length.toLocaleString()}건</p>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-black text-zinc-500">참가자별 필터</span>
            <select
              className="h-11 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 focus:ring-2"
              value={memberFilter}
              onChange={(event) => setMemberFilter(event.target.value)}
            >
              <option value="">전체 참가자</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.profile_emoji ?? '🙂'} {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-black text-zinc-500">활동 유형별 필터</span>
            <select
              className="h-11 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 focus:ring-2"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="">전체 유형</option>
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-black text-zinc-500">날짜별 필터</span>
            <input
              type="date"
              className="h-11 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 focus:ring-2"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          </label>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black px-4 py-8 text-center font-bold text-zinc-500">
            조건에 맞는 활동 내역이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="bg-black text-xs font-black uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">참가자</th>
                  <th className="px-4 py-3">활동</th>
                  <th className="px-4 py-3">카테고리</th>
                  <th className="px-4 py-3">점수</th>
                  <th className="px-4 py-3">활동일</th>
                  <th className="px-4 py-3">메모</th>
                  <th className="px-4 py-3">등록/수정</th>
                  <th className="px-4 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-zinc-950">
                {filteredActivities.map((activity) => {
                  const member = activity.member_id ? membersById.get(activity.member_id) : undefined;

                  return (
                    <tr key={activity.id} className="align-top">
                      <td className="px-4 py-3 font-black text-white">
                        {member ? `${member.profile_emoji ?? '🙂'} ${member.name}` : '삭제된 참가자'}
                      </td>
                      <td className="px-4 py-3 font-bold text-zinc-200">{activity.activity_type}</td>
                      <td className="px-4 py-3 text-zinc-400">{activity.category ?? '-'}</td>
                      <td className="px-4 py-3 font-black text-yellow-200">+{activity.score.toLocaleString()}점</td>
                      <td className="px-4 py-3 font-semibold text-zinc-400">
                        {formatKoreanDate(activity.activity_date)}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-zinc-400">
                        <span className="line-clamp-2">{activity.memo || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-zinc-600">
                        <div>{formatKoreanDateTime(activity.created_at)}</div>
                        <div>{formatKoreanDateTime(activity.updated_at)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busyId === activity.id}
                            onClick={() => setEditingActivity(activity)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 font-black text-black disabled:opacity-60"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            수정
                          </button>
                          <button
                            type="button"
                            disabled={busyId === activity.id}
                            onClick={() => void onDelete(activity)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 font-black text-red-200 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
