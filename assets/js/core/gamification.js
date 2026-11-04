export const TOKENS_PER_LESSON = 10;
export const TOKENS_PER_CHALLENGE = 10;
export const TOKENS_PER_PROJECT = 20;
export const FREEZE_LIMIT = 3;
export const CHEST_COST = 40;

export const LEAGUE_TIERS = [
  { id: 'paper', name: 'Paper league', threshold: 0 },
  { id: 'cedar', name: 'Cedar league', threshold: 50 },
  { id: 'indigo', name: 'Indigo league', threshold: 120 },
  { id: 'vermilion', name: 'Vermilion league', threshold: 250 }
];

const pad = (value) => String(value).padStart(2, '0');

const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function weekStartKey(now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return dateKey(date);
}

export function getWeeklyXp(progress = {}, now = new Date()) {
  const start = weekStartKey(now);
  return [
    ...Object.values(progress.completed || {}),
    ...Object.values(progress.completedChallenges || {}),
    ...Object.values(progress.completedProjects || {})
  ]
    .filter((entry) => entry.at)
    .filter((entry) => {
      const date = new Date(entry.at);
      return !Number.isNaN(date.getTime()) && dateKey(date) >= start;
    })
    .reduce((sum, entry) => sum + (Number(entry.xp) || 0), 0);
}

export function getLeague(xp = 0) {
  const current = [...LEAGUE_TIERS].reverse().find((tier) => xp >= tier.threshold) || LEAGUE_TIERS[0];
  const index = LEAGUE_TIERS.indexOf(current);
  const next = LEAGUE_TIERS[index + 1] || null;
  const percent = next
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(((xp - current.threshold) / (next.threshold - current.threshold)) * 100)
        )
      )
    : 100;
  return {
    xp,
    current,
    next,
    percent,
    toNext: next ? Math.max(0, next.threshold - xp) : 0
  };
}

export function getDailyMissions(hasUnfinishedLessons = true) {
  return [
    {
      id: 'visit-two',
      title: 'Open two lessons',
      description: 'Open two different lessons today.',
      target: 2,
      reward: 10,
      metric: 'visit'
    },
    {
      id: 'check-two',
      title: 'Run the checks in two lessons',
      description: 'Use Check in two different lessons today.',
      target: 2,
      reward: 10,
      metric: 'check'
    },
    hasUnfinishedLessons
      ? {
          id: 'finish-one',
          title: 'Finish one lesson',
          description: 'Complete any lesson today.',
          target: 1,
          reward: 15,
          metric: 'lesson'
        }
      : {
          id: 'check-three',
          title: 'Run the checks in three lessons',
          description: 'Keep practicing in lessons you have finished.',
          target: 3,
          reward: 15,
          metric: 'check'
        }
  ];
}

export function getMissionProgress(progress, mission, now = new Date()) {
  const today = dateKey(now);
  if (mission.metric === 'lesson') {
    return Object.values(progress.completed || {}).filter((entry) => {
      if (!entry.at) return false;
      const date = new Date(entry.at);
      return !Number.isNaN(date.getTime()) && dateKey(date) === today;
    }).length;
  }
  const lessons = new Set(
    (progress.activity || [])
      .filter((entry) => entry.type === mission.metric && entry.lessonId && entry.at)
      .filter((entry) => {
        const date = new Date(entry.at);
        return !Number.isNaN(date.getTime()) && dateKey(date) === today;
      })
      .map((entry) => entry.lessonId)
  );
  return lessons.size;
}
