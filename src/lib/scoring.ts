import { getCurrentMonthBounds, isWithinSeason } from './date';
import type { Activity, ActivityRule, ActivityWithMember, Member } from '../types/database';

export type DefaultActivityRule = {
  name: string;
  category: string;
  default_score: number;
  sort_order: number;
};

export const DEFAULT_ACTIVITY_RULES: DefaultActivityRule[] = [
  { name: '벙 개설', category: '벙', default_score: 10, sort_order: 10 },
  { name: '벙 성사', category: '벙', default_score: 30, sort_order: 20 },
  { name: '벙 참석', category: '벙', default_score: 10, sort_order: 30 },
  { name: '벙 후기 작성', category: '벙', default_score: 5, sort_order: 40 },
  { name: '콘텐츠 개최', category: '콘텐츠', default_score: 10, sort_order: 50 },
  { name: '참여자 5명 이상 보너스', category: '콘텐츠', default_score: 10, sort_order: 60 },
  { name: '일일 출석', category: '출석', default_score: 1, sort_order: 70 },
  { name: '7일 연속 출석 보너스', category: '출석', default_score: 10, sort_order: 80 },
  { name: '30일 연속 출석 보너스', category: '출석', default_score: 50, sort_order: 90 },
];

export type RankRule = {
  min: number;
  max: number;
  icon: string;
  name: string;
  tone: string;
};

export const RANK_RULES: RankRule[] = [
  { min: 0, max: 99, icon: '🥉', name: '브론즈', tone: 'border-amber-800/40 bg-amber-950/40 text-amber-200' },
  { min: 100, max: 299, icon: '🥈', name: '실버', tone: 'border-zinc-500/40 bg-zinc-800 text-zinc-100' },
  { min: 300, max: 599, icon: '🥇', name: '골드', tone: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200' },
  { min: 600, max: 999, icon: '💠', name: '플래티넘', tone: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100' },
  { min: 1000, max: 1499, icon: '💎', name: '다이아', tone: 'border-blue-400/40 bg-blue-400/10 text-blue-100' },
  { min: 1500, max: 1999, icon: '🔥', name: '마스터', tone: 'border-red-400/40 bg-red-400/10 text-red-100' },
  { min: 2000, max: 2999, icon: '⭐', name: '그랜드마스터', tone: 'border-violet-400/40 bg-violet-400/10 text-violet-100' },
  { min: 3000, max: Number.POSITIVE_INFINITY, icon: '👑', name: '인류애왕', tone: 'border-yellow-300/60 bg-yellow-300/15 text-yellow-100' },
];

export type MemberScore = {
  member: Member;
  seasonScore: number;
  monthScore: number;
  rank: RankRule;
  recentActivity: Activity | null;
  seasonRank: number;
  monthlyRank: number;
  activityCount: number;
};

export function sortActivityRules(rules: ActivityRule[]): ActivityRule[] {
  return [...rules].sort((a, b) => {
    const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.name.localeCompare(b.name, 'ko');
  });
}

export function getActiveActivityRules(rules: ActivityRule[]): ActivityRule[] {
  return sortActivityRules(rules).filter((rule) => rule.is_active !== false);
}

export function getSeasonActivities(activities: Activity[]): Activity[] {
  return activities.filter((activity) => isWithinSeason(activity.activity_date));
}

export function calculateRank(score: number): RankRule {
  return RANK_RULES.find((rank) => score >= rank.min && score <= rank.max) ?? RANK_RULES[0];
}

export function getActivityRuleSnapshot(rule: ActivityRule | undefined): {
  activity_rule_id: string | null;
  activity_type: string;
  category: string | null;
  score: number;
} {
  if (!rule) {
    return {
      activity_rule_id: null,
      activity_type: '직접 입력',
      category: null,
      score: 0,
    };
  }

  return {
    activity_rule_id: rule.id,
    activity_type: rule.name,
    category: rule.category,
    score: rule.default_score,
  };
}

function scoreActivities(activities: Activity[]): number {
  return activities.reduce((sum, activity) => sum + activity.score, 0);
}

function sortActivitiesByCreatedAt(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const bTime = new Date(b.created_at ?? b.activity_date).getTime();
    const aTime = new Date(a.created_at ?? a.activity_date).getTime();
    return bTime - aTime;
  });
}

function sortScores(primary: 'seasonScore' | 'monthScore') {
  return (a: MemberScore, b: MemberScore): number => {
    const primaryDiff = b[primary] - a[primary];
    if (primaryDiff !== 0) {
      return primaryDiff;
    }

    const secondary = primary === 'seasonScore' ? 'monthScore' : 'seasonScore';
    const secondaryDiff = b[secondary] - a[secondary];
    if (secondaryDiff !== 0) {
      return secondaryDiff;
    }

    return a.member.name.localeCompare(b.member.name, 'ko');
  };
}

export function getMemberScores(
  members: Member[],
  activities: Activity[],
  referenceDate = new Date(),
  options: { includeInactive?: boolean } = {},
): MemberScore[] {
  const monthBounds = getCurrentMonthBounds(referenceDate);
  const seasonActivities = getSeasonActivities(activities);

  const scores = members
    .filter((member) => options.includeInactive || member.is_active !== false)
    .map<MemberScore>((member) => {
      const memberSeasonActivities = seasonActivities.filter((activity) => activity.member_id === member.id);
      const memberMonthActivities = memberSeasonActivities.filter(
        (activity) =>
          activity.activity_date >= monthBounds.startDate &&
          activity.activity_date < monthBounds.endDateExclusive,
      );
      const recentActivity =
        sortActivitiesByCreatedAt(memberSeasonActivities.filter((activity) => activity.member_id === member.id))[0] ??
        null;
      const seasonScore = scoreActivities(memberSeasonActivities);

      return {
        member,
        seasonScore,
        monthScore: scoreActivities(memberMonthActivities),
        rank: calculateRank(seasonScore),
        recentActivity,
        seasonRank: 0,
        monthlyRank: 0,
        activityCount: memberSeasonActivities.length,
      };
    });

  const seasonSorted = [...scores].sort(sortScores('seasonScore'));
  const monthSorted = [...scores].sort(sortScores('monthScore'));

  seasonSorted.forEach((score, index) => {
    score.seasonRank = index + 1;
  });

  monthSorted.forEach((score, index) => {
    score.monthlyRank = index + 1;
  });

  return seasonSorted;
}

export function getMonthlyLeaderboard(scores: MemberScore[]): MemberScore[] {
  return [...scores].sort(sortScores('monthScore'));
}

export function getRecentActivities(
  activities: Activity[],
  members: Member[],
  limit = 10,
): ActivityWithMember[] {
  const membersById = new Map(members.map((member) => [member.id, member]));

  return sortActivitiesByCreatedAt(activities)
    .slice(0, limit)
    .map((activity) => ({
      ...activity,
      member: activity.member_id ? membersById.get(activity.member_id) : undefined,
    }));
}

export function getMemberActivities(memberId: string, activities: Activity[]): Activity[] {
  return sortActivitiesByCreatedAt(getSeasonActivities(activities).filter((activity) => activity.member_id === memberId));
}
