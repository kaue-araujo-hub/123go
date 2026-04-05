/**
 * ModeConfig.ts
 * Fonte única de verdade para configurações de cada modalidade e dificuldade.
 */

import type { GameMode, Difficulty } from '../auth/SessionManager';

export const MODES = {
  practice:  'practice',
  challenge: 'challenge',
  time:      'time',
} as const;

export const DIFFICULTIES = {
  easy:   'easy',
  medium: 'medium',
  hard:   'hard',
} as const;

export interface ModeMeta {
  id:          GameMode;
  label:       string;
  emoji:       string;
  tagline:     string;
  description: string;
  color:       string;
  colorBg:     string;
  teacherTip:  string;
  badgeLabel:  string;
}

export const MODE_META: Record<GameMode, ModeMeta> = {
  practice: {
    id:          'practice',
    label:       'Prática',
    emoji:       '🟢',
    tagline:     'Aprendizado leve e guiado',
    description: 'Fases fixas, sem pressão de tempo. Foco total em compreender o conteúdo no próprio ritmo.',
    color:       '#4CAF50',
    colorBg:     '#EAF3DE',
    teacherTip:  'Ideal para introduzir um conceito novo ou para alunos que precisam de mais suporte.',
    badgeLabel:  'Modo Prática',
  },
  challenge: {
    id:          'challenge',
    label:       'Desafio',
    emoji:       '🔴',
    tagline:     'Fases variáveis a cada tentativa',
    description: 'Aleatoriedade controlada por faixa de dificuldade. Mantém a criança engajada.',
    color:       '#E91E8C',
    colorBg:     '#FBEAF0',
    teacherTip:  'Use quando a turma já domina o básico e precisa de variação para não enjoar.',
    badgeLabel:  'Modo Desafio',
  },
  time: {
    id:          'time',
    label:       'Tempo',
    emoji:       '⚡',
    tagline:     'Complete antes do tempo acabar',
    description: 'Timer regressivo por fase. Estimula agilidade e cálculo mental.',
    color:       '#FF9800',
    colorBg:     '#FFF3E0',
    teacherTip:  'Use apenas com turmas que já se sentem confortáveis. Evite como primeira experiência.',
    badgeLabel:  'Modo Tempo',
  },
};

export interface ChallengeConfig {
  minElements: number;
  maxElements: number;
  extraTime:   number;
}

export const CHALLENGE_CONFIG: Record<Difficulty, ChallengeConfig> = {
  easy:   { minElements: 2,  maxElements: 4,  extraTime: 0 },
  medium: { minElements: 4,  maxElements: 6,  extraTime: 0 },
  hard:   { minElements: 6,  maxElements: 10, extraTime: 0 },
};

export interface TimeConfig {
  timeLimitSeconds: number;
}

export const TIME_CONFIG: Record<Difficulty, TimeConfig> = {
  easy:   { timeLimitSeconds: 150 },
  medium: { timeLimitSeconds: 90  },
  hard:   { timeLimitSeconds: 50  },
};

export interface PracticeConfig {
  fixedPhases:   boolean;
  hintsEnabled:  boolean;
  hintDelay:     number | null;
}

export const PRACTICE_CONFIG: Record<Difficulty, PracticeConfig> = {
  easy:   { fixedPhases: true, hintsEnabled: true,  hintDelay: 3000 },
  medium: { fixedPhases: true, hintsEnabled: true,  hintDelay: 5000 },
  hard:   { fixedPhases: true, hintsEnabled: false, hintDelay: null },
};

export interface ModeConfigResult {
  mode:              GameMode;
  difficulty:        Difficulty;
  meta:              ModeMeta;
  isTimedCountdown:  boolean;
  isRandomized:      boolean;
  hasHints:          boolean;
  timeLimitSeconds?: number;
  minElements?:      number;
  maxElements?:      number;
  fixedPhases?:      boolean;
  hintDelay?:        number | null;
}

export function getModeConfig(mode: GameMode, difficulty: Difficulty): ModeConfigResult {
  const base: ModeConfigResult = {
    mode,
    difficulty,
    meta:             MODE_META[mode],
    isTimedCountdown: mode === 'time',
    isRandomized:     mode === 'challenge',
    hasHints:         mode === 'practice',
  };

  if (mode === 'practice')  return { ...base, ...PRACTICE_CONFIG[difficulty] };
  if (mode === 'challenge') return { ...base, ...CHALLENGE_CONFIG[difficulty] };
  if (mode === 'time')      return { ...base, ...TIME_CONFIG[difficulty] };
  return base;
}

/** Gera um número aleatório dentro da faixa de dificuldade (modo Desafio). */
export function randomInRange(difficulty: Difficulty): number {
  const { minElements, maxElements } = CHALLENGE_CONFIG[difficulty];
  return Math.floor(Math.random() * (maxElements - minElements + 1)) + minElements;
}
