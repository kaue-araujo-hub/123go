/**
 * useTimer.ts
 * Hook React que conecta TimerSystem ao ciclo de vida dos componentes.
 * Retorna estado reativo do timer e funções de controle.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerSystem } from '../engine/TimerSystem';
import { timerStore  } from '../engine/TimerStore';

interface UseTimerOptions {
  gameId:     string;
  phase:      number;
  autoStart?: boolean;
}

export function useTimer({ gameId, phase, autoStart = false }: UseTimerOptions) {
  const timerRef                        = useRef(new TimerSystem());
  const [seconds,    setSeconds]        = useState(0);
  const [isRunning,  setRunning]        = useState(false);
  const [phaseTimes, setPhaseTimes]     = useState<(number | null)[]>([null, null, null, null, null]);

  // Sincroniza tick com estado React
  useEffect(() => {
    const timer = timerRef.current;
    timer.onTick(s => setSeconds(s));
    timer.onStop(s => setSeconds(s));

    if (autoStart) {
      timer.start();
      setRunning(true);
    }

    return () => { timer.pause(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reinicia quando a fase muda
  useEffect(() => {
    timerRef.current.reset();
    setSeconds(0);
    if (autoStart) {
      timerRef.current.start();
      setRunning(true);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Funções expostas ──────────────────────────────────────────────────────

  const start = useCallback(() => {
    timerRef.current.start();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    timerRef.current.pause();
    setRunning(false);
  }, []);

  /** Chamar quando a fase for concluída. Salva o tempo e retorna segundos. */
  const completePhase = useCallback((): number => {
    const elapsed = timerRef.current.stopAndReset();
    setRunning(false);
    setSeconds(0);

    timerStore.recordPhaseTime(gameId, phase, elapsed);

    setPhaseTimes(prev => {
      const next = [...prev];
      next[phase - 1] = elapsed;
      return next;
    });

    return elapsed;
  }, [gameId, phase]);

  /** Chamar quando o jogo inteiro for concluído (fase 5 finalizada). */
  const completeGame = useCallback(() => {
    timerStore.markGameComplete(gameId);
  }, [gameId]);

  /** Chamar ao pressionar "Jogar" / iniciar nova sessão. */
  const startNewSession = useCallback(() => {
    timerStore.startNewSession(gameId);
    setPhaseTimes([null, null, null, null, null]);
    timerRef.current.reset();
    setSeconds(0);
  }, [gameId]);

  // ─── Dados derivados ───────────────────────────────────────────────────────

  const totalTime = phaseTimes.reduce<number>((acc, t) => acc + (t ?? 0), 0);
  const formatted = TimerSystem.format(seconds);
  const bestTime  = timerStore.getBestTime(gameId);

  return {
    seconds,
    formatted,
    isRunning,
    phaseTimes,
    totalTime,
    bestTime,
    start,
    pause,
    completePhase,
    completeGame,
    startNewSession,
  };
}
