let _audioCtx: AudioContext | null = null;
let _muted = false;

try {
  _muted = localStorage.getItem('123go-muted') === 'true';
} catch {}

function ctx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

export function isMuted(): boolean {
  return _muted;
}

export function setGlobalMuted(val: boolean): void {
  _muted = val;
  try { localStorage.setItem('123go-muted', String(val)); } catch {}
}

export function playCorrect(): void {
  if (_muted) return;
  const ac = ctx();
  const now = ac.currentTime;

  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.09);

    gain.gain.setValueAtTime(0, now + i * 0.09);
    gain.gain.linearRampToValueAtTime(0.22, now + i * 0.09 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.22);

    osc.start(now + i * 0.09);
    osc.stop(now + i * 0.09 + 0.25);
  });
}

export function playWrong(): void {
  if (_muted) return;
  const ac = ctx();
  const now = ac.currentTime;

  const osc = ac.createOscillator();
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
