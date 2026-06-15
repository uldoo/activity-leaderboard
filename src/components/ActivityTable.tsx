import { Pencil, Trash2 } from 'lucide-react';
import { formatKoreanDate, formatKoreanDateTime } from '../lib/date';
import type { Activity, Member } from '../types/database';

type ActivityTableProps = {
  activities: Activity[];
  membersById: Map<string, Member>;
  isBusy?: boolean;
  onDelete: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
};

export function ActivityTable({ activities, membersById, isBusy = false, onDelete, onEdit }: ActivityTableProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl bg-orange-50 px-4 py-8 text-center font-bold text-orange-700">
        등록된 활동 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-orange-100 bg-white">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-orange-50 text-xs font-black uppercase text-orange-700">
          <tr>
            <th className="px-4 py-3">참여자</th>
            <th className="px-4 py-3">활동 유형</th>
            <th className="px-4 py-3">점수</th>
            <th className="px-4 py-3">활동일</th>
            <th className="px-4 py-3">메모</th>
            <th className="px-4 py-3">등록/수정</th>
            <th className="px-4 py-3 text-right">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-orange-100">
          {activities.map((activity) => {
            const member = activity.member_id ? membersById.get(activity.member_id) : undefined;

            return (
              <tr key={activity.id} className="bg-white align-top">
                <td className="px-4 py-3 font-black text-ink">
                  {member ? `${member.profile_emoji ?? '🙂'} ${member.name}` : '삭제된 참여자'}
                </td>
                <td className="px-4 py-3 font-bold text-slate-700">{activity.activity_type}</td>
                <td className="px-4 py-3 font-black text-orange-700">+{activity.score.toLocaleString()}점</td>
                <td className="px-4 py-3 font-semibold text-slate-600">{formatKoreanDate(activity.activity_date)}</td>
                <td className="max-w-xs px-4 py-3 text-slate-600">
                  <span className="line-clamp-2">{activity.memo || '-'}</span>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                  <div>{formatKoreanDateTime(activity.created_at)}</div>
                  <div>{formatKoreanDateTime(activity.updated_at)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onEdit(activity)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-100 px-3 font-black text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      수정
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onDelete(activity)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-50 px-3 font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
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
  );
}
