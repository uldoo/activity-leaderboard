import type { RankRule } from '../lib/scoring';

type RankBadgeProps = {
  rank: RankRule;
  size?: 'sm' | 'md' | 'lg';
  showRange?: boolean;
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function RankBadge({ rank, size = 'md', showRange = false }: RankBadgeProps) {
  const rangeLabel = rank.max === Number.POSITIVE_INFINITY ? `${rank.min}점 이상` : `${rank.min}-${rank.max}점`;

  return (
    <span
      className={[
        'inline-flex max-w-full items-center gap-1.5 rounded-full border font-black shadow-sm',
        rank.tone,
        sizeClasses[size],
      ].join(' ')}
    >
      <span aria-hidden="true">{rank.icon}</span>
      <span className="truncate">{rank.name}</span>
      {showRange ? <span className="hidden text-xs font-bold opacity-70 sm:inline">{rangeLabel}</span> : null}
    </span>
  );
}
