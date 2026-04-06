/**
 * bgm.ts — Procedural Background Music Engine for 123GO!
 *
 * 7 distinct game tracks (max 3 games each) + 1 catalog track.
 * Synthesised with the Web Audio API — no external files needed.
 * Global volume: 30 %. Seamless looping via scheduled oscillators.
 */

// ── Shared AudioContext ───────────────────────────────────────────────
let _ctx:        AudioContext | null = null;
let _masterGain: GainNode    | null = null;
let _loopTimer:  ReturnType<typeof setTimeout> | null = null;
let _currentTrack: string | null = null;
let _playing = false;

const BASE_VOL = 0.15;

// Read mute state from localStorage (shared with sounds.ts)
let _muted = (() => {
  try { return localStorage.getItem('123go-muted') === 'true'; } catch { return false; }
})();

function getCtx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === 'suspended') void _ctx.resume();
  return _ctx;
}

function getMaster(): GainNode {
  const ac = getCtx();
  if (!_masterGain) {
    _masterGain = ac.createGain();
    _masterGain.connect(ac.destination);
    _masterGain.gain.value = 0;
  }
  return _masterGain;
}

// ── Note frequency table ──────────────────────────────────────────────
const N = {
  R:0,
  C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, Bb4:466.16, B4:493.88,
  C5:523.25, D5:587.33, Eb5:622.25, E5:659.25, F5:698.46, G5:783.99, A5:880.00, Bb5:932.33,
  B5:987.77,
} as const;

// ── Melody definitions ────────────────────────────────────────────────
// Each step: [frequency, duration-in-seconds]  (N.R = rest)
type Step = [number, number];

/** Convert beats → seconds at a given BPM (default 132). */
const b = (beats: number, bpm = 132) => (60 / bpm) * beats;

const MELODIES: Record<string, { steps: Step[]; wave: OscillatorType }> = {

  /** Track 1 — "Festa Alegre" · C major pentatonic, bouncy 8-bit
   *  Games: g01 Festa da Lagarta · g05 Rã Puladora · g17 Calendário Vivo */
  track1: {
    wave: 'square',
    steps: [
      [N.G4,b(.5)],[N.C5,b(.5)],[N.E5,b(.5)],[N.G5,b(.5)],
      [N.E5,b(.5)],[N.C5,b(.5)],[N.D5,b(1)] ,[N.R, b(.5)],
      [N.C5,b(.5)],[N.E5,b(.5)],[N.G5,b(.5)],[N.E5,b(.5)],
      [N.D5,b(.5)],[N.C5,b(1)] ,[N.R, b(1)],
    ],
  },

  /** Track 2 — "Estrelas Brilhantes" · A minor, twinkly triangle
   *  Games: g02 Par ou Ímpar · g03 Caça Estrelas · g06 Balões da Festa */
  track2: {
    wave: 'triangle',
    steps: [
      [N.A4,b(.5)],[N.C5,b(.5)],[N.E5,b(.5)],[N.A5,b(.5)],
      [N.G5,b(.5)],[N.E5,b(.5)],[N.C5,b(.5)],[N.A4,b(.5)],
      [N.E5,b(.5)],[N.G5,b(.5)],[N.A5,b(.5)],[N.G5,b(.5)],
      [N.E5,b(1)] ,[N.A4,b(.5)],[N.R, b(1)],
    ],
  },

  /** Track 3 — "Trem Express" · F major, march rhythm 8-bit
   *  Games: g04 Loja de Balas · g07 Trem dos Números · g10 Ateliê da Ordem */
  track3: {
    wave: 'square',
    steps: [
      [N.F4,b(.25)],[N.A4,b(.25)],[N.C5,b(.5)],[N.A4,b(.25)],[N.F4,b(.25)],[N.C5,b(.5)],
      [N.E5,b(.5)] ,[N.C5,b(.5)] ,[N.A4,b(.5)],[N.F4,b(.5)],
      [N.G4,b(.25)],[N.B4,b(.25)],[N.D5,b(.5)],[N.B4,b(.25)],[N.G4,b(.25)],[N.D5,b(.5)],
      [N.F5,b(.5)] ,[N.D5,b(.5)] ,[N.B4,b(.5)],[N.G4,b(.5)],
    ],
  },

  /** Track 4 — "Jardim Pop" · G major, playful triangle
   *  Games: g08 Pizzaria Mágica · g11 Jardim de Padrões · g12 Nave Organizadora */
  track4: {
    wave: 'triangle',
    steps: [
      [N.G4,b(.5)],[N.B4,b(.5)],[N.D5,b(.5)],[N.B4,b(.5)],
      [N.G4,b(1)] ,[N.A4,b(.5)],[N.B4,b(.5)],
      [N.C5,b(.5)],[N.E5,b(.5)],[N.G5,b(.5)],[N.E5,b(.5)],
      [N.D5,b(1)] ,[N.C5,b(.5)],[N.B4,b(.5)],
    ],
  },

  /** Track 5 — "Cosmo Épico" · D minor, adventurous 8-bit
   *  Games: g09 Batalha de Constelações · g13 Robô Perdido · g16 Sol, Lua e Estrelas */
  track5: {
    wave: 'square',
    steps: [
      [N.D4,b(.5)],[N.F4,b(.5)],[N.A4,b(.5)],[N.C5,b(.5)],
      [N.D5,b(1)] ,[N.C5,b(.5)],[N.A4,b(.5)],
      [N.G4,b(.5)],[N.A4,b(.5)],[N.C5,b(.5)],[N.E5,b(.5)],
      [N.D5,b(1)] ,[N.A4,b(.5)],[N.D4,b(.5)],
    ],
  },

  /** Track 6 — "Mistério Animal" · E minor, mysterious triangle
   *  Games: g14 Esconde-esconde Animal · g15 Castelo das Posições · g18 Máquina do Tempo */
  track6: {
    wave: 'triangle',
    steps: [
      [N.E4,b(.5)],[N.G4,b(.5)],[N.B4,b(.5)],[N.D5,b(.5)],
      [N.E5,b(1)] ,[N.D5,b(.5)],[N.B4,b(.5)],
      [N.A4,b(.5)],[N.B4,b(.5)],[N.D5,b(.5)],[N.G5,b(.5)],
      [N.E5,b(1)] ,[N.B4,b(.5)],[N.E4,b(.5)],
    ],
  },

  /** Track 7 — "Zoo Divertido" · C blues, jazzy 8-bit
   *  Games: g19 Sorveteria dos Dados · g20 Zoo das Tabelas · g21 Pesquisa da Turma */
  track7: {
    wave: 'square',
    steps: [
      [N.C5,b(.5)] ,[N.Eb5,b(.5)],[N.F5,b(.5)],[N.G5,b(.5)],
      [N.Bb5,b(.5)],[N.G5,b(.5)] ,[N.F5,b(.5)],[N.Eb5,b(.5)],
      [N.C5,b(.5)] ,[N.F5,b(.5)] ,[N.Eb5,b(.5)],[N.C5,b(.5)],
      [N.Bb4,b(1)] ,[N.C5,b(.5)] ,[N.R, b(.5)],
    ],
  },

  /** Catalog — "Navegando" · gentle C major, slow sine wave, BPM 72 */
  catalog: {
    wave: 'sine',
    steps: [
      [N.G4,b(1,72)],[N.A4,b(1,72)],[N.B4,b(1,72)],[N.D5,b(1,72)],
      [N.G5,b(1,72)],[N.D5,b(1,72)],[N.B4,b(1,72)],[N.A4,b(1,72)],
      [N.G4,b(2,72)],[N.D5,b(1,72)],[N.B4,b(1,72)],
      [N.A4,b(1,72)],[N.G4,b(2,72)],[N.R, b(2,72)],
    ],
  },
};

// ── Game-ID → track mapping (max 3 games per track) ──────────────────
const GAME_TRACK: Record<string, string> = {
  g01:'track1', g05:'track1', g17:'track1',
  g02:'track2', g03:'track2', g06:'track2',
  g04:'track3', g07:'track3', g10:'track3',
  g08:'track4', g11:'track4', g12:'track4',
  g09:'track5', g13:'track5', g16:'track5',
  g14:'track6', g15:'track6', g18:'track6',
  g19:'track7', g20:'track7', g21:'track7',
};

/** Derive the BGM track ID from a game route path (e.g. /games/g01-festa-lagarta). */
export function getGameTrackId(gamePath: string): string {
  const m = gamePath.match(/\/games\/(g\d{2})/);
  if (m) return GAME_TRACK[m[1]] ?? 'track1';
  return 'track1';
}

// ── Core scheduling loop ──────────────────────────────────────────────
function scheduleLoop(trackId: string, startAt: number): void {
  if (!_playing || _currentTrack !== trackId) return;

  const ac     = getCtx();
  const mel    = MELODIES[trackId];
  if (!mel) return;

  const master   = getMaster();
  const NOTE_VOL = 0.11; // per-note amplitude; master gain controls overall level
  let t = startAt;

  for (const [freq, dur] of mel.steps) {
    if (freq > 0) {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = mel.wave;
      osc.frequency.setValueAtTime(freq, t);

      // Short attack + release to avoid clicks
      const attack  = 0.012;
      const release = Math.min(0.04, dur * 0.15);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(NOTE_VOL, t + attack);
      gain.gain.setValueAtTime(NOTE_VOL, Math.max(t + attack, t + dur - release));
      gain.gain.linearRampToValueAtTime(0, t + dur - 0.005);

      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + dur + 0.01);
    }
    t += dur;
  }

  // Pre-schedule next loop iteration ~120 ms before this one ends
  const msUntil = (t - ac.currentTime - 0.12) * 1000;
  _loopTimer = setTimeout(() => scheduleLoop(trackId, t), Math.max(0, msUntil));
}

// ── Public API ────────────────────────────────────────────────────────

/** Start (or switch to) a BGM track. No-op if already playing the same track. */
export function startBGM(trackId: string): void {
  if (_muted) return;
  if (_playing && _currentTrack === trackId) return;

  _stopInternal();

  _playing      = true;
  _currentTrack = trackId;

  const ac     = getCtx();
  const master = getMaster();

  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(0, ac.currentTime);
  master.gain.linearRampToValueAtTime(BASE_VOL, ac.currentTime + 0.5);

  scheduleLoop(trackId, ac.currentTime + 0.05);
}

/** Stop BGM with a short fade-out. */
export function stopBGM(): void {
  _stopInternal();
  if (_masterGain && _ctx) {
    const now = _ctx.currentTime;
    _masterGain.gain.cancelScheduledValues(now);
    _masterGain.gain.setValueAtTime(_masterGain.gain.value, now);
    _masterGain.gain.linearRampToValueAtTime(0, now + 0.5);
  }
}

function _stopInternal(): void {
  if (_loopTimer !== null) {
    clearTimeout(_loopTimer);
    _loopTimer = null;
  }
  _playing      = false;
  _currentTrack = null;
}

/**
 * Sync mute state with the global toggle.
 * Call this whenever the user clicks the mute/unmute button.
 */
export function setBGMMuted(muted: boolean): void {
  _muted = muted;
  if (!_masterGain || !_ctx) return;
  const now = _ctx.currentTime;
  _masterGain.gain.cancelScheduledValues(now);
  _masterGain.gain.setValueAtTime(_masterGain.gain.value, now);
  if (muted) {
    _masterGain.gain.linearRampToValueAtTime(0, now + 0.12);
  } else if (_playing) {
    _masterGain.gain.linearRampToValueAtTime(BASE_VOL, now + 0.3);
  }
}

/**
 * Re-start BGM after unmute (if a track was playing when muted).
 * Call when the user turns off mute to resume music.
 */
export function resumeBGM(): void {
  if (_muted || !_playing || !_currentTrack) return;
  const ac     = getCtx();
  const master = getMaster();
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(0, ac.currentTime);
  master.gain.linearRampToValueAtTime(BASE_VOL, ac.currentTime + 0.3);
  scheduleLoop(_currentTrack, ac.currentTime + 0.05);
}
