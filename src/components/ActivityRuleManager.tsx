import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Save, Trash2, X } from 'lucide-react';
import { sortActivityRules } from '../lib/scoring';
import type { ActivityRule, ActivityRuleInsert, ActivityRuleUpdate } from '../types/database';

type ActivityRuleManagerProps = {
  rules: ActivityRule[];
  isSaving?: boolean;
  busyId?: string | null;
  onCreate: (values: ActivityRuleInsert) => Promise<void>;
  onUpdate: (rule: ActivityRule, values: ActivityRuleUpdate) => Promise<void>;
  onDelete: (rule: ActivityRule) => Promise<void>;
};

const emptyForm = {
  name: '',
  category: '벙',
  default_score: 10,
  is_active: true,
  sort_order: 0,
};

export function ActivityRuleManager({
  rules,
  isSaving = false,
  busyId = null,
  onCreate,
  onUpdate,
  onDelete,
}: ActivityRuleManagerProps) {
  const [editingRule, setEditingRule] = useState<ActivityRule | null>(null);
  const [form, setForm] = useState(emptyForm);
  const sortedRules = sortActivityRules(rules);

  useEffect(() => {
    if (!editingRule) {
      return;
    }

    setForm({
      name: editingRule.name,
      category: editingRule.category,
      default_score: editingRule.default_score,
      is_active: editingRule.is_active !== false,
      sort_order: editingRule.sort_order ?? 0,
    });
  }, [editingRule]);

  const resetForm = () => {
    setEditingRule(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      default_score: Number(form.default_score),
      is_active: form.is_active,
      sort_order: Number(form.sort_order),
    };

    if (editingRule) {
      await onUpdate(editingRule, payload);
    } else {
      await onCreate(payload);
    }

    resetForm();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
        <h2 className="text-xl font-black text-white">점수 규칙 {editingRule ? '수정' : '추가'}</h2>
        <p className="mt-1 text-sm font-semibold text-zinc-500">활동 유형과 기본 점수를 직접 관리합니다.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-black text-zinc-500">활동 유형명</span>
            <input
              className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 placeholder:text-zinc-700 focus:ring-2"
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="예: 새 멤버 환영"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-black text-zinc-500">카테고리</span>
              <input
                className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 placeholder:text-zinc-700 focus:ring-2"
                required
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-black text-zinc-500">기본 점수</span>
              <input
                type="number"
                className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-black text-yellow-200 outline-none ring-yellow-300 focus:ring-2"
                required
                value={form.default_score}
                onChange={(event) => setForm((current) => ({ ...current, default_score: Number(event.target.value) }))}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-black text-zinc-500">정렬 순서</span>
              <input
                type="number"
                className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 focus:ring-2"
                value={form.sort_order}
                onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))}
              />
            </label>
            <label className="flex items-center gap-2 self-end rounded-xl border border-white/10 bg-black px-3 py-3 text-sm font-bold text-zinc-300">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              />
              점수 부여 폼에 표시
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-yellow-300 px-4 text-sm font-black text-black hover:bg-yellow-200 disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {editingRule ? '규칙 수정' : '규칙 추가'}
            </button>
            {editingRule ? (
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
            <h2 className="text-xl font-black text-white">활동 유형 목록</h2>
            <p className="text-sm font-semibold text-zinc-500">활성 항목만 점수 부여 폼에 표시됩니다.</p>
          </div>
          <p className="text-sm font-black text-yellow-200">{rules.length.toLocaleString()}개</p>
        </div>

        {sortedRules.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black px-4 py-8 text-center font-bold text-zinc-500">
            점수 규칙이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {sortedRules.map((rule) => (
              <article key={rule.id} className="rounded-xl border border-white/10 bg-black p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-white">{rule.name}</p>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs font-bold text-zinc-400">
                        {rule.category}
                      </span>
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-xs font-black',
                          rule.is_active === false
                            ? 'border border-zinc-700 text-zinc-500'
                            : 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
                        ].join(' ')}
                      >
                        {rule.is_active === false ? '비활성' : '활성'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-zinc-500">
                      기본 {rule.default_score.toLocaleString()}점 · 정렬 {rule.sort_order ?? 0}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === rule.id}
                      onClick={() => setEditingRule(rule)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-black text-black disabled:opacity-60"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      수정
                    </button>
                    <button
                      type="button"
                      disabled={busyId === rule.id}
                      onClick={() => void onUpdate(rule, { is_active: rule.is_active === false })}
                      className="inline-flex h-9 items-center rounded-lg border border-yellow-400/30 px-3 text-sm font-black text-yellow-200 disabled:opacity-60"
                    >
                      {rule.is_active === false ? '활성화' : '비활성화'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === rule.id}
                      onClick={() => void onDelete(rule)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-sm font-black text-red-200 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
