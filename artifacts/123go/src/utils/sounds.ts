let _audioCtx: AudioContext | null = null;
let _muted = false;

try {
  _muted = localStorage.getItem('123go-muted') === 'true';
} catch {}

function ctx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  if (_audioCtx.state === 'suspended') void _audioCtx.resume();
  return _audioCtx;
}

export function isMuted(): boolean {
  return _muted;
}

export function setGlobalMuted(val: boolean): void {
  _muted = val;
  try { localStorage.setItem('123go-muted', String(val)); } catch {}
}

/** Rising bling: ascending chord — correct answer */
export function playCorrect(): void {
  if (_muted) return;
  const ac  = ctx();
  const now = ac.currentTime;

  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.09);

    gain.gain.setValueAtTime(0,    now + i * 0.09);
    gain.gain.linearRampToValueAtTime(0.22, now + i * 0.09 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.22);

    osc.start(now + i * 0.09);
    osc.stop(now + i * 0.09 + 0.25);
  });
}

/** Falling boing: low sawtooth — wrong answer (non-punishing) */
export function playWrong(): void {
  if (_muted) return;
  const ac  = ctx();
  const now = ac.currentTime;

  const osc  = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(380, now);
  osc.frequency.linearRampToValueAtTime(190, now + 0.18);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.start(now);
  osc.stop(now + 0.22);
}

/** Short tick — countdown numbers 1, 2, 3 */
export function playCountdownTick(): void {
  if (_muted) return;
  const ac  = ctx();
  const now = ac.currentTime;

  const osc  = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);

  gain.gain.setValueAtTime(0,    now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

  osc.start(now);
  osc.stop(now + 0.18);
}

/** Rising shimmer — GO! moment */
export function playCountdownGo(): void {
  if (_muted) return;
  const ac  = ctx();
  const now = ac.currentTime;

  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.065);

    gain.gain.setValueAtTime(0,    now + i * 0.065);
    gain.gain.linearRampToValueAtTime(0.20, now + i * 0.065 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.35);

    osc.start(now + i * 0.065);
    osc.stop(now + i * 0.065 + 0.4);
  });
}
