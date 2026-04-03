const TODAY = () => new Date().toISOString().slice(0, 10);

const STARS_PER_LEVEL = 15;

/* ── Streak ─────────────────────────────────────────────────────────── */

export function getStreak(): number {
  return Math.max(1, parseInt(localStorage.getItem('123go-streak-count') ?? '1') || 1);
}

export function touchStreak(): number {
  const today = TODAY();
  const last  = localStorage.getItem('123go-streak-last');

  if (last === today) return getStreak();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  const count = (last === yStr) ? getStreak() + 1 : 1;

  localStorage.setItem('123go-streak-last',  today);
  localStorage.setItem('123go-streak-count', String(count));
  return count;
}

/* ── Stars ───────────────────────────────────────────────────────────── */

export function getTotalStars(): number {
  return parseInt(localStorage.getItem('123go-stars-total') ?? '0') || 0;
}

export function getStarsToday(): number {
  const today = TODAY();
  if (localStorage.getItem('123go-stars-date') !== today) return 0;
  return parseInt(localStorage.getItem('123go-stars-today') ?? '0') || 0;
}

export function addStar(): void {
  const today    = TODAY();
  const date     = localStorage.getItem('123go-stars-date');
  const prevDay  = parseInt(localStorage.getItem('123go-stars-today') ?? '0') || 0;
  const todayVal = date === today ? prevDay + 1 : 1;

  localStorage.setItem('123go-stars-date',  today);
  localStorage.setItem('123go-stars-today', String(todayVal));
  localStorage.setItem('123go-stars-total', String(getTotalStars() + 1));

  window.dispatchEvent(new CustomEvent('123go-progress-update'));
}

/* ── Level ─────────────────────────────────────────────────────────── */

export function getLevelInfo() {
  const total       = getTotalStars();
  const level       = Math.floor(total / STARS_PER_LEVEL) + 1;
  const starsInLevel = total % STARS_PER_LEVEL;
  const progressPct = Math.round((starsInLevel / STARS_PER_LEVEL) * 100);
  return { level, starsInLevel, starsForLevel: STARS_PER_LEVEL, progressPct };
}
