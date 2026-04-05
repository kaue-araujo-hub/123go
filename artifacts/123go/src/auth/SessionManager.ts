/**
 * SessionManager.ts
 * Gerencia perfil de usuário e sessão de aula de forma segura (UX-level).
 * NOTA: O PIN é proteção de UX, não criptográfica. Para produção real,
 * substituir por autenticação JWT/OAuth.
 */

const STORAGE_KEYS = {
  role:        '123go_role',
  mode:        '123go_game_mode',
  difficulty:  '123go_difficulty',
  sessionId:   '123go_session_id',
  teacherPin:  '123go_teacher_pin',
} as const;

const DEFAULT_PIN = '1234';

export type UserRole    = 'teacher' | 'student';
export type GameMode    = 'practice' | 'challenge' | 'time';
export type Difficulty  = 'easy' | 'medium' | 'hard';

export interface ClassSession {
  id:         string;
  mode:       GameMode;
  difficulty: Difficulty;
  startedAt:  string;
  active:     boolean;
  endedAt?:   string;
}

export class SessionManager {

  // ─── Perfil ───────────────────────────────────────────────────────────────

  static getRole(): UserRole {
    return (localStorage.getItem(STORAGE_KEYS.role) ?? 'student') as UserRole;
  }

  static isTeacher(): boolean {
    return SessionManager.getRole() === 'teacher';
  }

  static isStudent(): boolean {
    return !SessionManager.isTeacher();
  }

  static loginAsTeacher(pin: string): boolean {
    const stored = localStorage.getItem(STORAGE_KEYS.teacherPin) ?? DEFAULT_PIN;
    if (pin === stored) {
      localStorage.setItem(STORAGE_KEYS.role, 'teacher');
      window.dispatchEvent(new CustomEvent('123go:role-changed', { detail: { role: 'teacher' } }));
      return true;
    }
    return false;
  }

  static logoutTeacher(): void {
    localStorage.setItem(STORAGE_KEYS.role, 'student');
    window.dispatchEvent(new CustomEvent('123go:role-changed', { detail: { role: 'student' } }));
  }

  static changePin(currentPin: string, newPin: string): boolean {
    if (!SessionManager.loginAsTeacher(currentPin)) return false;
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return false;
    localStorage.setItem(STORAGE_KEYS.teacherPin, newPin);
    return true;
  }

  // ─── Modalidade e Configuração ────────────────────────────────────────────

  static getMode(): GameMode {
    return (localStorage.getItem(STORAGE_KEYS.mode) ?? 'practice') as GameMode;
  }

  static getDifficulty(): Difficulty {
    return (localStorage.getItem(STORAGE_KEYS.difficulty) ?? 'easy') as Difficulty;
  }

  static setMode(mode: GameMode): boolean {
    if (SessionManager.isStudent()) return false;
    const valid: GameMode[] = ['practice', 'challenge', 'time'];
    if (!valid.includes(mode)) return false;
    localStorage.setItem(STORAGE_KEYS.mode, mode);
    window.dispatchEvent(new CustomEvent('123go:mode-changed', { detail: { mode } }));
    return true;
  }

  static setDifficulty(difficulty: Difficulty): boolean {
    if (SessionManager.isStudent()) return false;
    const valid: Difficulty[] = ['easy', 'medium', 'hard'];
    if (!valid.includes(difficulty)) return false;
    localStorage.setItem(STORAGE_KEYS.difficulty, difficulty);
    window.dispatchEvent(new CustomEvent('123go:difficulty-changed', { detail: { difficulty } }));
    return true;
  }

  // ─── Sessão de Aula ───────────────────────────────────────────────────────

  static startClassSession(): string | null {
    if (SessionManager.isStudent()) return null;
    const sessionId = `aula_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const config: ClassSession = {
      id:         sessionId,
      mode:       SessionManager.getMode(),
      difficulty: SessionManager.getDifficulty(),
      startedAt:  new Date().toISOString(),
      active:     true,
    };
    localStorage.setItem(STORAGE_KEYS.sessionId, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('123go:session-started', { detail: config }));
    return sessionId;
  }

  static getCurrentSession(): ClassSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.sessionId);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  static endClassSession(): void {
    if (SessionManager.isStudent()) return;
    const session = SessionManager.getCurrentSession();
    if (session) {
      session.active  = false;
      session.endedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.sessionId, JSON.stringify(session));
    }
  }

  static exportSessionData() {
    return {
      session:    SessionManager.getCurrentSession(),
      mode:       SessionManager.getMode(),
      difficulty: SessionManager.getDifficulty(),
      exportedAt: new Date().toISOString(),
    };
  }
}
