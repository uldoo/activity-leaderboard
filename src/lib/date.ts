export const KST_TIME_ZONE = 'Asia/Seoul';
export const SEASON_START_DATE = '2026-06-20';
export const SEASON_END_DATE = '2026-12-31';

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: KST_TIME_ZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: KST_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function parseKstDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00+09:00`);
  }

  return new Date(value);
}

function getKstDateParts(value: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);

  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
  };
}

function toDateInputString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getTodayDateInput(): string {
  const { year, month, day } = getKstDateParts(new Date());
  return toDateInputString(year, month, day);
}

export function getCurrentMonthBounds(referenceDate = new Date()): {
  startDate: string;
  endDateExclusive: string;
  label: string;
} {
  const { year, month } = getKstDateParts(referenceDate);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthYear = month === 12 ? year + 1 : year;

  return {
    startDate: toDateInputString(year, month, 1),
    endDateExclusive: toDateInputString(nextMonthYear, nextMonth, 1),
    label: `${year}년 ${month}월`,
  };
}

export function formatKoreanDate(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const date = parseKstDate(value);
  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date);
}

export function formatKoreanDateTime(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const date = parseKstDate(value);
  return Number.isNaN(date.getTime()) ? '-' : dateTimeFormatter.format(date);
}

export function isWithinSeason(date: string): boolean {
  return date >= SEASON_START_DATE && date <= SEASON_END_DATE;
}

export function daysUntilSeasonEnd(): number {
  const today = getTodayDateInput();
  if (today > SEASON_END_DATE) {
    return 0;
  }

  const diff = parseKstDate(SEASON_END_DATE).getTime() - parseKstDate(today).getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getSeasonProgress(): {
  progressPercent: number;
  daysRemaining: number;
  totalDays: number;
  elapsedDays: number;
  label: string;
} {
  const today = getTodayDateInput();
  const start = parseKstDate(SEASON_START_DATE).getTime();
  const end = parseKstDate(SEASON_END_DATE).getTime();
  const current = parseKstDate(today).getTime();
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.ceil((current - start) / (1000 * 60 * 60 * 24))));
  const progressPercent = Math.round((elapsedDays / totalDays) * 100);
  const daysRemaining = daysUntilSeasonEnd();

  return {
    progressPercent,
    daysRemaining,
    totalDays,
    elapsedDays,
    label: today < SEASON_START_DATE ? '시즌 시작 전' : daysRemaining === 0 ? '시즌 종료' : `D-${daysRemaining}`,
  };
}
