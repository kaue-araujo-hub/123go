/**
 * TimerStore.ts
 * Armazena, persiste e calcula analytics dos tempos de todos os jogos.
 * Usa localStorage como camada de persistência.
 */

const STORAGE_KEY = '123go_timer_data';

interface Session {
  date:       string;
  phaseTimes: (number | null)[];
  totalTime:  number;
  completed:  boolean;
}

interface GameData {
  lastPlayed: string | null;
  sessions:   Session[];
}

interface AnalyticsEntry {
  totalSessions:     number;
  completedSessions: number;
  bestTime:          number | null;
  avgTime:           number | null;
  avgPhaseBreakdown: (number | null)[];
  lastPlayed:        string | null;
}

export class TimerStore {
  private _data: Record<string, GameData>;

  constructor() {
    this._data = this._load();
  }

  // ─── Escrita ───────────────────────────────────────────────────────────────

  recordPhaseTime(gameId: string, phase: number, seconds: number): void {
    this._ensureGame(gameId);
    const session = this._currentSession(gameId)!;
    session.phaseTimes[phase - 1] = seconds;
    session.totalTime = session.phaseTimes.reduce<number>((a, b) => a + (b ?? 0), 0);
    this._save();
  }

  markGameComplete(gameId: string): void {
    this._ensureGame(gameId);
    const session = this._currentSession(gameId)!;
    session.completed = true;
    session.totalTime = session.phaseTimes.reduce<number>((a, b) => a + (b ?? 0), 0);
    this._data[gameId].lastPlayed = new Date().toISOString();
    this._save();
  }

  startNewSession(gameId: string): void {
    if (!this._data[gameId]) {
      this._data[gameId] = { lastPlayed: null, sessions: [] };
    }
    this._data[gameId].sessions.push({
      date:       new Date().toISOString(),
      phaseTimes: [null, null, null, null, null],
      totalTime:  0,
      completed:  false,
    });
    this._save();
  }

  // ─── Leitura ───────────────────────────────────────────────────────────────

  getCurrentSession(gameId: string): Session | null {
    return this._currentSession(gameId);
  }

  getBestTime(gameId: string): number | null {
    const game = this._data[gameId];
    if (!game) return null;
    const completed = game.sessions.filter(s => s.completed);
    if (!completed.length) return null;
    return Math.min(...completed.map(s => s.totalTime));
  }

  getHistory(gameId: string): Session[] {
    return this._data[gameId]?.sessions ?? [];
  }

  getAnalytics(): Record<string, AnalyticsEntry> {
    const result: Record<string, AnalyticsEntry> = {};
    Object.keys(this._data).forEach(gameId => {
      const sessions  = this._data[gameId].sessions;
      const completed = sessions.filter(s => s.completed);
      const allTimes  = completed.map(s => s.totalTime);

      result[gameId] = {
        totalSessions:     sessions.length,
        completedSessions: completed.length,
        bestTime:          allTimes.length ? Math.min(...allTimes) : null,
        avgTime:           allTimes.length
          ? Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
          : null,
        avgPhaseBreakdown: this._avgPerPhase(completed),
        lastPlayed:        this._data[gameId].lastPlayed,
      };
    });
    return result;
  }

  exportJSON(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version:    '1.0.0',
      data:       this._data,
    }, null, 2);
  }

  clearGame(gameId: string): void {
    delete this._data[gameId];
    this._save();
  }

  clearAll(): void {
    this._data = {};
    this._save();
  }

  // ─── Privados ──────────────────────────────────────────────────────────────

  private _ensureGame(gameId: string): void {
    if (!this._data[gameId]) {
      this._data[gameId] = { lastPlayed: null, sessions: [] };
    }
    if (!this._data[gameId].sessions.length) {
      this._data[gameId].sessions.push({
        date:       new Date().toISOString(),
        phaseTimes: [null, null, null, null, null],
        totalTime:  0,
        completed:  false,
      });
      this._save();
    }
  }

  private _currentSession(gameId: string): Session | null {
    const sessions = this._data[gameId]?.sessions ?? [];
    return sessions[sessions.length - 1] ?? null;
  }

  private _avgPerPhase(completedSessions: Session[]): (number | null)[] {
    if (!completedSessions.length) return [null, null, null, null, null];
    return [0, 1, 2, 3, 4].map(i => {
      const times = completedSessions
        .map(s => s.phaseTimes[i])
        .filter((t): t is number => t !== null && t !== undefined);
      return times.length
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : null;
    });
  }

  private _load(): Record<string, GameData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private _save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch (e) {
      console.warn('[TimerStore] Não foi possível salvar:', (e as Error).message);
    }
  }
}

/** Singleton compartilhado por toda a aplicação */
export const timerStore = new TimerStore();
