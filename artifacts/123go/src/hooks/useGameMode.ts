/**
 * useGameMode.ts
 * Hook reativo que qualquer componente usa para ler o modo atual.
 * Atualiza automaticamente quando o professor muda o modo durante a aula.
 */

import { useState, useEffect } from 'react';
import { SessionManager } from '../auth/SessionManager';
import { getModeConfig }  from '../engine/ModeConfig';
import type { GameMode, Difficulty } from '../auth/SessionManager';

export function useGameMode() {
  const [mode,       setMode]      = useState<GameMode>(SessionManager.getMode);
  const [difficulty, setDiff]      = useState<Difficulty>(SessionManager.getDifficulty);
  const [isTeacher,  setIsTeacher] = useState<boolean>(SessionManager.isTeacher);

  useEffect(() => {
    function onModeChanged(e: Event) {
      setMode((e as CustomEvent<{ mode: GameMode }>).detail.mode);
    }
    function onDiffChanged(e: Event) {
      setDiff((e as CustomEvent<{ difficulty: Difficulty }>).detail.difficulty);
    }
    function onRoleChanged(e: Event) {
      const role = (e as CustomEvent<{ role: string }>).detail.role;
      setIsTeacher(role === 'teacher');
    }
    function onStorageChanged(e: StorageEvent) {
      if (e.key === '123go_role')        setIsTeacher(e.newValue === 'teacher');
      if (e.key === '123go_game_mode')   setMode((e.newValue ?? 'practice') as GameMode);
      if (e.key === '123go_difficulty')  setDiff((e.newValue ?? 'easy') as Difficulty);
    }

    window.addEventListener('123go:mode-changed',       onModeChanged);
    window.addEventListener('123go:difficulty-changed', onDiffChanged);
    window.addEventListener('123go:role-changed',       onRoleChanged);
    window.addEventListener('storage',                  onStorageChanged);

    return () => {
      window.removeEventListener('123go:mode-changed',       onModeChanged);
      window.removeEventListener('123go:difficulty-changed', onDiffChanged);
      window.removeEventListener('123go:role-changed',       onRoleChanged);
      window.removeEventListener('storage',                  onStorageChanged);
    };
  }, []);

  const config = getModeConfig(mode, difficulty);

  return {
    mode,
    difficulty,
    isTeacher,
    config,
    isPractice:  mode === 'practice',
    isChallenge: mode === 'challenge',
    isTime:      mode === 'time',
  };
}
