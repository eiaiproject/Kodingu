import { courses, getAllLessons } from '../data/course-index.js';

const STORAGE_KEY = 'kodingu.progress.v1';
const CORRUPT_KEY = 'kodingu.progress.corrupt.v1';
const DRAFT_PREFIXES = [
  'kodingu.draft.',
  'kodingu.challengeDraft.',
  'kodingu.projectDraft.'
];

export const PROGRESS_FORMAT = 'kodingu-progress';
export const PROGRESS_VERSION = 2;
export const MAX_IMPORT_BYTES = 1024 * 1024;
export const CERTIFICATE_NAME_KEY = 'kodingu.certificate.name';

const ALL_LESSONS = courses.flatMap((course) => getAllLessons(course));
const LESSON_BY_ID = new Map(ALL_LESSONS.map((lesson) => [lesson.id, lesson]));

let storageOk;
let memoryProgress = null;
let progressReadError = null;
let corruptRaw = null;

export function storageAvailable() {
  if (storageOk !== undefined) return storageOk;
  try {
    const probe = '__kodingu_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    storageOk = true;
  } catch (error) {
    // Local storage is optional; the caller falls back to memory.
    storageOk = false;
    console.warn('Kodingu: local storage is unavailable.', error);
  }
  return storageOk;
}

function defaultProgress() {
  return {
    version: PROGRESS_VERSION,
    xp: 0,
    streak: 0,
    lastLessonDay: null,
    completed: {},
    completedChallenges: {},
    completedProjects: {},
    projectChecks: {},
    quizzes: {},
    history: [],
    activity: []
  };
}

const objectOrEmpty = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const finiteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const nonNegative = (value, fallback = 0) => Math.max(0, finiteNumber(value, fallback));

const HISTORY_TYPES = new Set(['lesson', 'challenge', 'project']);
const ACTIVITY_TYPES = new Set(['visit', 'check']);
const MAX_STREAK_DAYS = 3650;
const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validTimestamp(value) {
  if (typeof value !== 'string' || !value) return null;
  return Number.isNaN(new Date(value).getTime()) ? null : value;
}

function validDayKey(value) {
  if (typeof value !== 'string' || !DAY_KEY_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) || dayKey(date) !== value ? null : value;
}

function normalizeDayKey(value) {
  const key = validDayKey(value);
  if (!key) return null;
  const gap = dayDifference(key, dayKey());
  return Number.isFinite(gap) && gap >= 0 ? key : null;
}

function completionMap(value, catalog = null) {
  const source = objectOrEmpty(value);
  const result = {};
  for (const [id, entry] of Object.entries(source)) {
    const item = catalog?.get(id);
    if (catalog && !item) continue;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    result[id] = {
      at: validTimestamp(entry.at),
      xp: nonNegative(item?.xp, entry.xp)
    };
  }
  return result;
}

function projectCheckMap(value) {
  const source = objectOrEmpty(value);
  return Object.fromEntries(
    Object.entries(source)
      .filter(([, checks]) => Array.isArray(checks))
      .map(([id, checks]) => [
        id,
        checks.filter((entry) => typeof entry === 'string' || Number.isInteger(entry))
      ])
  );
}

function quizMap(value) {
  const source = objectOrEmpty(value);
  return Object.fromEntries(
    Object.entries(source).filter(([id, entry]) =>
      LESSON_BY_ID.has(id) && entry && typeof entry === 'object' && !Array.isArray(entry)
    )
  );
}

function historyEntries(value, catalogs = {}) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 50)
    .map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
      const { type, id } = entry;
      if (!HISTORY_TYPES.has(type) || typeof id !== 'string' || !id) return null;
      const catalog =
        type === 'lesson'
          ? LESSON_BY_ID
          : type === 'challenge'
            ? catalogs.challenges
            : catalogs.projects;
      const item = catalog?.get(id);
      if (catalog && !item) return null;
      const at = validTimestamp(entry.at);
      if (!at) return null;
      return {
        type,
        id,
        title: item?.title || (typeof entry.title === 'string' ? entry.title.slice(0, 120) : ''),
        xp: nonNegative(item?.xp, entry.xp),
        at
      };
    })
    .filter(Boolean);
}

function activityEntries(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 200)
    .map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
      if (!ACTIVITY_TYPES.has(entry.type)) return null;
      if (typeof entry.lessonId !== 'string' || !LESSON_BY_ID.has(entry.lessonId)) return null;
      const at = validTimestamp(entry.at);
      return at ? { type: entry.type, lessonId: entry.lessonId, at } : null;
    })
    .filter(Boolean);
}

function normalizeStreak(value, lastLessonDay) {
  const streak = Math.min(Math.floor(nonNegative(value)), MAX_STREAK_DAYS);
  if (!streak || !lastLessonDay) return streak;
  const gap = dayDifference(lastLessonDay, dayKey());
  return Number.isFinite(gap) && gap >= 0 ? streak : 0;
}

function normalizeProgress(parsed, catalogs = {}) {
  const data = objectOrEmpty(parsed);
  const lastLessonDay = normalizeDayKey(data.lastLessonDay);
  const streak = data.lastLessonDay && !lastLessonDay
    ? 0
    : normalizeStreak(data.streak, lastLessonDay);
  return {
    version: PROGRESS_VERSION,
    xp: nonNegative(data.xp),
    streak,
    lastLessonDay,
    completed: completionMap(data.completed, LESSON_BY_ID),
    completedChallenges: completionMap(data.completedChallenges, catalogs.challenges),
    completedProjects: completionMap(data.completedProjects, catalogs.projects),
    projectChecks: projectCheckMap(data.projectChecks),
    quizzes: quizMap(data.quizzes),
    history: historyEntries(data.history, catalogs),
    activity: activityEntries(data.activity)
  };
}

function completionXp(progress) {
  return [progress.completed, progress.completedChallenges, progress.completedProjects].reduce(
    (total, map) =>
      total +
      Object.values(map).reduce((sum, entry) => sum + nonNegative(entry.xp), 0),
    0
  );
}

const PROGRESS_MIGRATIONS = {
  0: (data) => ({ ...data, version: 1 }),
  1: (data) => ({ ...data, version: 2 }),
  2: (data) => data
};

export function migrateProgress(parsed, { strict = false, catalogs = {} } = {}) {
  let data = objectOrEmpty(parsed);
  let version = Number(data.version);
  if (!Number.isInteger(version) || version < 0) version = 0;
  if (version > PROGRESS_VERSION) {
    if (strict) {
      throw new Error(`This file uses progress version ${version}. This site supports version ${PROGRESS_VERSION}.`);
    }
    return normalizeProgress({ ...data, version: PROGRESS_VERSION }, catalogs);
  }
  while (version < PROGRESS_VERSION) {
    const migrate = PROGRESS_MIGRATIONS[version];
    if (!migrate) throw new Error(`No migration path from progress version ${version}.`);
    data = migrate(data);
    version += 1;
  }
  return normalizeProgress({ ...data, version: PROGRESS_VERSION }, catalogs);
}

export function getProgressReadError() {
  return progressReadError;
}

function recoveryRecord() {
  if (typeof corruptRaw === 'string') {
    return { savedAt: null, raw: corruptRaw };
  }
  try {
    const stored = localStorage.getItem(CORRUPT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object' && typeof parsed.raw === 'string') {
      return {
        savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
        raw: parsed.raw
      };
    }
    return { savedAt: null, raw: stored };
  } catch (error) {
    return null;
  }
}

export function getProgressRecovery() {
  return recoveryRecord();
}

function preserveCorruptRaw() {
  if (typeof corruptRaw !== 'string') return true;
  try {
    if (!localStorage.getItem(CORRUPT_KEY)) {
      localStorage.setItem(
        CORRUPT_KEY,
        JSON.stringify({ savedAt: new Date().toISOString(), raw: corruptRaw })
      );
    }
    corruptRaw = null;
    return true;
  } catch (error) {
    console.warn('Kodingu: the unreadable saved progress could not be backed up.', error);
    return false;
  }
}

export function getProgress() {
  if (!storageAvailable()) {
    if (!memoryProgress) memoryProgress = defaultProgress();
    return memoryProgress;
  }
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    progressReadError = null;
    if (!raw) return defaultProgress();
    return migrateProgress(JSON.parse(raw));
  } catch (error) {
    corruptRaw = raw;
    progressReadError = 'Saved progress could not be read. Export it to keep a copy, then reset progress.';
    console.warn('Kodingu: saved progress could not be read.', error);
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  if (storageAvailable()) {
    if (!preserveCorruptRaw()) {
      memoryProgress = progress;
      window.dispatchEvent(new CustomEvent('kodingu:progress', { detail: progress }));
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      // A full or newly blocked store must not stop the page that earned the progress.
      storageOk = false;
      memoryProgress = progress;
      console.warn('Kodingu: progress will stay in memory because local storage could not be written.', error);
    }
  } else {
    memoryProgress = progress;
  }
  window.dispatchEvent(new CustomEvent('kodingu:progress', { detail: progress }));
}

export function resetProgress() {
  if (storageAvailable()) {
    try {
      const draftKeys = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key && DRAFT_PREFIXES.some((prefix) => key.startsWith(prefix))) {
          draftKeys.push(key);
        }
      }
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CERTIFICATE_NAME_KEY);
      localStorage.removeItem(CORRUPT_KEY);
      for (const key of draftKeys) localStorage.removeItem(key);
    } catch (error) {
      storageOk = false;
      console.warn('Kodingu: the saved progress could not be removed.', error);
    }
  }
  corruptRaw = null;
  progressReadError = null;
  memoryProgress = defaultProgress();
  window.dispatchEvent(new CustomEvent('kodingu:progress', { detail: memoryProgress }));
}

export function createProgressExport() {
  let certificateName = '';
  try {
    certificateName = (localStorage.getItem(CERTIFICATE_NAME_KEY) || '').slice(0, 60);
  } catch (error) {
    // A blocked store still exports the in-memory progress.
  }
  const progress = getProgress();
  const recovery = recoveryRecord();
  return {
    format: PROGRESS_FORMAT,
    version: PROGRESS_VERSION,
    exportedAt: new Date().toISOString(),
    progress,
    profile: { certificateName },
    ...(recovery ? { recovery } : {})
  };
}

export async function importProgressPayload(payload) {
  if (!payload || typeof payload !== 'object' || payload.format !== PROGRESS_FORMAT) {
    throw new Error('This file is not a Kodingu progress export.');
  }
  if (!Number.isInteger(payload.version) || payload.version < 1) {
    throw new Error('This export does not include a valid progress version.');
  }
  if (!payload.progress || typeof payload.progress !== 'object' || Array.isArray(payload.progress)) {
    throw new Error('This export does not include a progress object.');
  }

  const [{ extraChallenges }, { projects }] = await Promise.all([
    import('../data/data-challenges.js'),
    import('../data/data-projects.js')
  ]);
  const progress = migrateProgress(
    { ...payload.progress, version: payload.version },
    {
      strict: true,
      catalogs: {
        challenges: new Map(extraChallenges.map((item) => [item.id, item])),
        projects: new Map(projects.map((item) => [item.id, item]))
      }
    }
  );
  // An export cannot invent XP: totals come from the work that survived validation.
  progress.xp = completionXp(progress);
  const profile = objectOrEmpty(payload.profile);
  const certificateName = typeof profile.certificateName === 'string'
    ? profile.certificateName.trim().slice(0, 60)
    : '';
  if (storageAvailable()) {
    try {
      if (certificateName) localStorage.setItem(CERTIFICATE_NAME_KEY, certificateName);
      else localStorage.removeItem(CERTIFICATE_NAME_KEY);
      localStorage.removeItem(CORRUPT_KEY);
      corruptRaw = null;
    } catch (error) {
      // The progress import still succeeds when the name cannot be stored.
    }
  }
  progressReadError = null;
  saveProgress(progress);
  return progress;
}

export function dayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayKey() {
  const now = new Date();
  return dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
}

function dayDifference(fromKey, toKey) {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return Number.NaN;
  return Math.round((to - from) / 86400000);
}

export function getStreakState(progress = getProgress()) {
  const streak = Number(progress.streak) || 0;
  if (!progress.lastLessonDay || !streak) return { streak: 0 };
  const gap = dayDifference(progress.lastLessonDay, dayKey());
  return gap === 0 || gap === 1 ? { streak } : { streak: 0 };
}

export function currentStreak(progress = getProgress()) {
  return getStreakState(progress).streak;
}

export function completeLesson(lesson) {
  const progress = getProgress();
  if (progress.completed[lesson.id]) {
    return { completed: false, progress };
  }

  const now = new Date();
  const today = dayKey(now);
  const previousDay = progress.lastLessonDay;
  let streak = progress.streak || 0;

  if (previousDay === today) streak = Math.max(1, streak);
  else if (previousDay === yesterdayKey()) streak += 1;
  else streak = 1;

  progress.completed[lesson.id] = {
    at: now.toISOString(),
    xp: lesson.xp
  };
  progress.xp = (progress.xp || 0) + lesson.xp;
  progress.streak = streak;
  progress.lastLessonDay = today;
  progress.history = [
    {
      type: 'lesson',
      id: lesson.id,
      title: lesson.title,
      xp: lesson.xp,
      at: now.toISOString()
    },
    ...(progress.history || [])
  ].slice(0, 50);

  saveProgress(progress);
  return { completed: true, progress, xpEarned: lesson.xp };
}

export function completeChallenge(challenge) {
  const progress = getProgress();
  if (progress.completedChallenges[challenge.id]) {
    return { completed: false, progress };
  }

  const now = new Date();
  const xpEarned = challenge.xp || 0;
  progress.completedChallenges[challenge.id] = {
    at: now.toISOString(),
    xp: xpEarned
  };
  progress.xp = (progress.xp || 0) + xpEarned;
  progress.history = [
    {
      type: 'challenge',
      id: challenge.id,
      title: challenge.title,
      xp: xpEarned,
      at: now.toISOString()
    },
    ...(progress.history || [])
  ].slice(0, 50);
  saveProgress(progress);
  return { completed: true, progress, xpEarned };
}

export function getProjectChecks(project) {
  const progress = getProgress();
  const requirements = project.requirements || [];
  const saved = progress.projectChecks[project.id];
  const stored = Array.isArray(saved) ? saved : [];
  // Older builds stored requirement indexes. Resolve them to the requirement
  // text so editing the list cannot silently move a saved check to another item.
  const requirementSet = new Set(requirements);
  const checks = new Set(
    stored
      .map((entry) => (Number.isInteger(entry) ? requirements[entry] : entry))
      .filter((entry) => requirementSet.has(entry))
  );
  return requirements.filter((requirement) => checks.has(requirement));
}

export function toggleProjectRequirement(project, requirement, checked) {
  const progress = getProgress();
  const requirements = project.requirements || [];
  if (!requirements.includes(requirement)) {
    return getProjectChecks(project);
  }
  const checks = new Set(getProjectChecks(project));
  if (checked) checks.add(requirement);
  else checks.delete(requirement);
  progress.projectChecks[project.id] = requirements.filter((item) => checks.has(item));
  saveProgress(progress);
  return progress.projectChecks[project.id];
}

export function completeProject(project) {
  const progress = getProgress();
  if (progress.completedProjects[project.id]) {
    return { completed: false, progress };
  }
  const checks = new Set(getProjectChecks(project));
  const ready = project.requirements.every((item) => checks.has(item));
  if (!ready) {
    return { completed: false, reason: 'Check every requirement first.', progress };
  }

  const now = new Date();
  const xpEarned = project.xp || 0;
  progress.completedProjects[project.id] = {
    at: now.toISOString(),
    xp: xpEarned
  };
  progress.xp = (progress.xp || 0) + xpEarned;
  progress.history = [
    {
      type: 'project',
      id: project.id,
      title: project.title,
      xp: xpEarned,
      at: now.toISOString()
    },
    ...(progress.history || [])
  ].slice(0, 50);
  saveProgress(progress);
  return { completed: true, progress, xpEarned };
}

export function recordQuiz(lessonId, correct) {
  if (!correct) return;
  const progress = getProgress();
  progress.quizzes[lessonId] = { at: new Date().toISOString(), correct: true };
  saveProgress(progress);
}

export function recordActivity(type, lessonId) {
  if (!lessonId || (type !== 'visit' && type !== 'check')) return;
  const progress = getProgress();
  const today = dayKey();
  const activity = Array.isArray(progress.activity) ? progress.activity : [];
  const alreadyCounted = activity.some(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      entry.type === type &&
      entry.lessonId === lessonId &&
      entry.at &&
      dayKey(new Date(entry.at)) === today
  );
  if (alreadyCounted) return;
  progress.activity = [
    { type, lessonId, at: new Date().toISOString() },
    ...activity
  ].slice(0, 200);
  saveProgress(progress);
}

export function getCourseStats(course) {
  const lessons = getAllLessons(course);
  const progress = getProgress();
  const completed = lessons.filter((lesson) => progress.completed[lesson.id]).length;
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((lesson) => !progress.completed[lesson.id]) || lessons[0] || null;
  return {
    total: lessons.length,
    completed,
    percent,
    nextLesson,
    started: completed > 0
  };
}

export function getTodayCount(progress = getProgress()) {
  const today = dayKey();
  return Object.values(progress.completed || {}).filter((entry) => {
    if (!entry.at) return false;
    const date = new Date(entry.at);
    return !Number.isNaN(date.getTime()) && dayKey(date) === today;
  }).length;
}

export function formatRelativeDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const key = dayKey(date);
  if (key === dayKey()) return 'Today';
  if (key === yesterdayKey()) return 'Yesterday';
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' })
  }).format(date);
}

export function formatFullDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}
