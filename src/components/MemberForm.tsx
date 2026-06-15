import { useEffect, useState, type FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import type { Member } from '../types/database';

export type MemberFormValues = {
  name: string;
  profile_emoji: string;
  is_active: boolean;
};

type MemberFormProps = {
  initialMember?: Member | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (values: MemberFormValues) => Promise<void>;
};

const defaultValues: MemberFormValues = {
  name: '',
  profile_emoji: '🙂',
  is_active: true,
};

export function MemberForm({ initialMember = null, isSubmitting = false, onCancel, onSubmit }: MemberFormProps) {
  const [values, setValues] = useState<MemberFormValues>(defaultValues);

  useEffect(() => {
    if (!initialMember) {
      setValues(defaultValues);
      return;
    }

    setValues({
      name: initialMember.name,
      profile_emoji: initialMember.profile_emoji ?? '🙂',
      is_active: initialMember.is_active !== false,
    });
  }, [initialMember]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      ...values,
      name: values.name.trim(),
      profile_emoji: values.profile_emoji.trim() || '🙂',
    });

    if (!initialMember) {
      setValues(defaultValues);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[88px_1fr]">
        <label className="block">
          <span className="mb-1 block text-xs font-black text-slate-500">이모지</span>
          <input
            className="h-11 w-full rounded-xl border border-orange-100 bg-white px-3 text-center text-2xl outline-none ring-mandarin transition focus:ring-2"
            maxLength={4}
            value={values.profile_emoji}
            onChange={(event) => setValues((current) => ({ ...current, profile_emoji: event.target.value }))}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black text-slate-500">닉네임</span>
          <input
            className="h-11 w-full rounded-xl border border-orange-100 bg-white px-3 font-bold outline-none ring-mandarin transition focus:ring-2"
            required
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="예: 모임대장"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-slate-700">
        <input
          type="checkbox"
          checked={values.is_active}
          onChange={(event) => setValues((current) => ({ ...current, is_active: event.target.checked }))}
        />
        활성 참여자로 랭킹에 표시
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-black text-white shadow-card transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {initialMember ? '참여자 수정' : '참여자 추가'}
        </button>
        {initialMember && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-slate-600 shadow-sm ring-1 ring-orange-100 transition hover:bg-orange-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            취소
          </button>
        ) : null}
      </div>
    </form>
  );
}
