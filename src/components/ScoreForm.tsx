import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarPlus, Save, X } from 'lucide-react';
import { getActiveActivityRules, getActivityRuleSnapshot } from '../lib/scoring';
import { getTodayDateInput } from '../lib/date';
import type { Activity, ActivityRule, Member } from '../types/database';

export type ScoreFormValues = {
  member_id: string;
  activity_rule_id: string | null;
  activity_type: string;
  category: string | null;
  score: number;
  activity_date: string;
  memo: string;
};

type ScoreFormProps = {
  members: Member[];
  activityRules: ActivityRule[];
  initialActivity?: Activity | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (values: ScoreFormValues) => Promise<void>;
};

function createDefaultValues(memberId: string, rule?: ActivityRule): ScoreFormValues {
  const snapshot = getActivityRuleSnapshot(rule);

  return {
    member_id: memberId,
    ...snapshot,
    activity_date: getTodayDateInput(),
    memo: '',
  };
}

export function ScoreForm({
  members,
  activityRules,
  initialActivity = null,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: ScoreFormProps) {
  const availableRules = useMemo(() => {
    const activeRules = getActiveActivityRules(activityRules);
    if (!initialActivity?.activity_rule_id) {
      return activeRules;
    }

    const existingRule = activityRules.find((rule) => rule.id === initialActivity.activity_rule_id);
    if (!existingRule || activeRules.some((rule) => rule.id === existingRule.id)) {
      return activeRules;
    }

    return [existingRule, ...activeRules];
  }, [activityRules, initialActivity?.activity_rule_id]);
  const activeMembers = useMemo(() => members.filter((member) => member.is_active !== false), [members]);
  const memberOptions = initialActivity ? members : activeMembers;
  const firstRule = availableRules[0];
  const [values, setValues] = useState<ScoreFormValues>(() =>
    createDefaultValues(memberOptions[0]?.id ?? '', firstRule),
  );

  useEffect(() => {
    if (initialActivity) {
      setValues({
        member_id: initialActivity.member_id ?? '',
        activity_rule_id: initialActivity.activity_rule_id,
        activity_type: initialActivity.activity_type,
        category: initialActivity.category,
        score: initialActivity.score,
        activity_date: initialActivity.activity_date,
        memo: initialActivity.memo ?? '',
      });
      return;
    }

    setValues((current) => createDefaultValues(current.member_id || memberOptions[0]?.id || '', firstRule));
  }, [firstRule, initialActivity, memberOptions]);

  const handleRuleChange = (ruleId: string) => {
    const rule = activityRules.find((item) => item.id === ruleId);
    const snapshot = getActivityRuleSnapshot(rule);

    setValues((current) => ({
      ...current,
      ...snapshot,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      ...values,
      memo: values.memo.trim(),
      score: Number(values.score),
    });

    if (!initialActivity) {
      setValues(createDefaultValues(values.member_id, firstRule));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-black text-zinc-500">참가자</span>
          <select
            className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 transition focus:ring-2"
            required
            value={values.member_id}
            onChange={(event) => setValues((current) => ({ ...current, member_id: event.target.value }))}
          >
            <option value="" disabled>
              참가자 선택
            </option>
            {memberOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.profile_emoji ?? '🙂'} {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-black text-zinc-500">활동 유형</span>
          <select
            className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 transition focus:ring-2"
            required
            value={values.activity_rule_id ?? ''}
            onChange={(event) => handleRuleChange(event.target.value)}
          >
            <option value="" disabled>
              활동 유형 선택
            </option>
            {availableRules.map((rule) => (
              <option key={rule.id} value={rule.id}>
                [{rule.category}] {rule.name} · 기본 {rule.default_score}점
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-black text-zinc-500">점수</span>
          <input
            type="number"
            className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-black text-yellow-200 outline-none ring-yellow-300 transition focus:ring-2"
            required
            value={values.score}
            onChange={(event) => setValues((current) => ({ ...current, score: Number(event.target.value) }))}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-black text-zinc-500">활동일</span>
          <input
            type="date"
            className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 transition focus:ring-2"
            required
            value={values.activity_date}
            onChange={(event) => setValues((current) => ({ ...current, activity_date: event.target.value }))}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-black text-zinc-500">메모</span>
        <textarea
          className="min-h-28 w-full rounded-xl border border-white/10 bg-black px-3 py-3 font-semibold text-white outline-none ring-yellow-300 transition placeholder:text-zinc-700 focus:ring-2"
          value={values.memo}
          onChange={(event) => setValues((current) => ({ ...current, memo: event.target.value }))}
          placeholder="예: 토요일 한강 벙 성사"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting || memberOptions.length === 0 || availableRules.length === 0}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-yellow-300 px-5 text-sm font-black text-black transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {initialActivity ? <Save className="h-4 w-4" aria-hidden="true" /> : <CalendarPlus className="h-4 w-4" aria-hidden="true" />}
          {initialActivity ? '활동 수정' : '점수 부여 저장'}
        </button>
        {initialActivity && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-black px-5 text-sm font-black text-zinc-200 transition hover:border-white/30"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            취소
          </button>
        ) : null}
      </div>
    </form>
  );
}
