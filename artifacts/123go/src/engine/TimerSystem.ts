/**
 * TimerSystem.ts
 * Lógica pura do cronômetro — sem dependência de React ou DOM.
 * Pode ser instanciada por qualquer jogo.
 */

export class TimerSystem {
  private _startTime:  number | null = null;
  private _elapsed:    number = 0;
  private _intervalId: ReturnType<typeof setInterval> | null = null;
  private _isRunning:  boolean = false;
  private _onTick:     ((s: number) => void) | null = null;
  private _onStop:     ((s: number) => void) | null = null;

  // ─── Controles principais ──────────────────────────────────────────────────

  /** Inicia ou retoma o timer. Idempotente. */
  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this._startTime = performance.now() - this._elapsed;

    this._intervalId = setInterval(() => {
      this._elapsed = performance.now() - this._startTime!;
      this._onTick?.(this.getElapsedSeconds());
    }, 1000);
  }

  /** Pausa o timer sem zerar. Retorna segundos decorridos. */
  pause(): number {
    if (!this._isRunning) return this.getElapsedSeconds();
    this._isRunning = false;
    this._elapsed   = performance.now() - this._startTime!;
    if (this._intervalId !== null) clearInterval(this._intervalId);
    return this.getElapsedSeconds();
  }

  /** Para o timer e dispara onStop. Retorna segundos decorridos. */
  stop(): number {
    const seconds = this.pause();
    this._onStop?.(seconds);
    return seconds;
  }

  /** Zera completamente — use ao iniciar uma nova fase. */
  reset(): void {
    if (this._intervalId !== null) clearInterval(this._intervalId);
    this._startTime  = null;
    this._elapsed    = 0;
    this._isRunning  = false;
    this._intervalId = null;
  }

  /** Para, lê o tempo final e reseta para a próxima fase. Retorna segundos. */
  stopAndReset(): number {
    const seconds = this.stop();
    this.reset();
    return seconds;
  }

  // ─── Leitura ───────────────────────────────────────────────────────────────

  getElapsedSeconds(): number {
    if (this._startTime === null) return 0;
    const raw = this._isRunning
      ? performance.now() - this._startTime
      : this._elapsed;
    return Math.floor(raw / 1000);
  }

  getElapsedMs(): number {
    if (this._startTime === null) return 0;
    return this._isRunning
      ? Math.floor(performance.now() - this._startTime)
      : Math.floor(this._elapsed);
  }

  isRunning(): boolean { return this._isRunning; }

  // ─── Formatação ───────────────────────────────────────────────────────────

  /** Retorna string no formato "mm:ss" */
  static format(totalSeconds: number): string {
    const s  = Math.max(0, Math.floor(totalSeconds));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  // ─── Callbacks ─────────────────────────────────────────────────────────────

  onTick(fn: (s: number) => void): this { this._onTick = fn; return this; }
  onStop(fn: (s: number) => void): this { this._onStop = fn; return this; }
}
