/**
 * bgm.ts — Procedural Background Music Engine for 123GO!
 *
 * 6 thematic game tracks + 1 catalog track.
 * All synthesised with Web Audio API — no external files needed.
 *
 * Track → Theme mapping:
 *   natureza  — Nature/Animals  : g01 g05 g11 g20 g21
 *   espaco    — Space/Tech      : g09 g12 g13
 *   aliment   — Food/Daily      : g04 g06 g08 g10 g19
 *   trem      — Train           : g07
 *   galaxia   — Galaxy/Stars    : g02 g03
 *   ventania  — Wind/Celestial  : g16 g17
 *   catalog   — Catalog page
 */

// ── Shared AudioContext ───────────────────────────────────────────────
let _ctx:        AudioContext | null = null;
let _masterGain: GainNode    | null = null;
let _loopTimer:  ReturnType<typeof setTimeout> | null = null;
let _currentTrack: string | null = null;
let _playing = false;

const BASE_VOL = 0.15;

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
  R: 0,
  C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, Bb4:466.16, B4:493.88,
  C5:523.25, D5:587.33, Eb5:622.25, E5:659.25, F5:698.46, G5:783.99, A5:880.00, Bb5:932.33,
  B5:987.77,
} as const;

type Step = [number, number];

/** Convert beats → seconds at a given BPM. */
const b = (beats: number, bpm = 120) => (60 / bpm) * beats;

interface TrackDef {
  steps: Step[];
  wave:  OscillatorType;
  vol:   number;   // per-note amplitude (master gain sets overall level)
}

const MELODIES: Record<string, TrackDef> = {

  /**
   * NATUREZA — pentatonic C major, sine wave, BPM 76
   * Flauta suave + xilofone, ritmos orgânicos ao ar livre
   * Games: g01 Festa Lagarta · g05 Rã Puladora · g11 Jardim Padrões · g20 Zoo Tabelas · g21 Meus Pets
   */
  natureza: {
    wave: 'sine',
    vol: 0.14,
    steps: [
      [N.G4, b(1,76)],  [N.A4, b(.5,76)], [N.C5, b(.5,76)], [N.E5, b(1,76)],
      [N.G5, b(1.5,76)],[N.E5, b(.5,76)], [N.D5, b(1,76)],  [N.C5, b(2,76)],
      [N.R,  b(.5,76)], [N.A4, b(.5,76)], [N.C5, b(1,76)],  [N.E5, b(1,76)],
      [N.G5, b(.5,76)], [N.E5, b(.5,76)], [N.C5, b(1,76)],  [N.A4, b(1,76)],
      [N.G4, b(.5,76)], [N.A4, b(.5,76)], [N.C5, b(1,76)],  [N.G4, b(2,76)],
      [N.R,  b(1,76)],
    ],
  },

  /**
   * ESPACO — D minor arpeggio, sawtooth, BPM 138
   * Sintetizador futurista, estilo chiptune space-ambient
   * Games: g09 Batalha Constelações · g12 Nave Organizadora · g13 Robô Perdido
   */
  espaco: {
    wave: 'sawtooth',
    vol: 0.07,
    steps: [
      [N.D4, b(.25,138)],[N.A4, b(.25,138)],[N.D5, b(.25,138)],[N.A5, b(.25,138)],
      [N.D5, b(.25,138)],[N.A4, b(.25,138)],[N.D5, b(.5, 138)],[N.R,  b(.25,138)],
      [N.C5, b(.25,138)],[N.G4, b(.25,138)],[N.E4, b(.25,138)],[N.G4, b(.25,138)],
      [N.C5, b(.25,138)],[N.E5, b(.5, 138)],[N.R,  b(.25,138)],
      [N.A4, b(.25,138)],[N.D5, b(.25,138)],[N.F5, b(.25,138)],[N.A5, b(.25,138)],
      [N.G5, b(.5, 138)],[N.E5, b(.25,138)],[N.D5, b(.25,138)],
      [N.C5, b(.25,138)],[N.A4, b(.25,138)],[N.D4, b(1,  138)],[N.R,  b(.5, 138)],
    ],
  },

  /**
   * ALIMENT — C major jazz, triangle wave, BPM 108
   * Bossa nova infantil, jazz lúdico, melódico e animado
   * Games: g04 Loja Balas · g06 Balões · g08 Pizzaria · g10 Ateliê · g19 Sorveteria
   */
  aliment: {
    wave: 'triangle',
    vol: 0.12,
    steps: [
      [N.C5, b(.25,108)],[N.R, b(.25,108)],[N.E5, b(.5,108)],
      [N.G5, b(.5,108)], [N.E5, b(.25,108)],[N.R, b(.25,108)],
      [N.D5, b(.5,108)], [N.F5, b(.25,108)],[N.R, b(.25,108)],[N.A5, b(.5,108)],
      [N.G5, b(.75,108)],[N.R, b(.25,108)],
      [N.E5, b(.25,108)],[N.R, b(.25,108)],[N.G5, b(.5,108)],
      [N.E5, b(.5,108)], [N.C5, b(.5,108)],[N.D5, b(.25,108)],[N.R, b(.25,108)],
      [N.E5, b(.5,108)], [N.G5, b(.5,108)],[N.C5, b(1,108)],
      [N.R,  b(.5,108)],
    ],
  },

  /**
   * TREM — F major march chugging, square wave, BPM 126
   * Ritmo de trem: da-da-DUM característico das locomotivas
   * Games: g07 Trem dos Números
   */
  trem: {
    wave: 'square',
    vol: 0.09,
    steps: [
      // Chug: short-short-LONG pattern
      [N.F4, b(.25,126)],[N.F4, b(.25,126)],[N.C5, b(.5,126)],
      [N.F4, b(.25,126)],[N.F4, b(.25,126)],[N.A4, b(.5,126)],
      [N.G4, b(.25,126)],[N.G4, b(.25,126)],[N.D5, b(.5,126)],
      [N.F4, b(.25,126)],[N.A4, b(.25,126)],[N.C5, b(.75,126)],[N.R, b(.25,126)],
      [N.G4, b(.25,126)],[N.G4, b(.25,126)],[N.D5, b(.5,126)],
      [N.G4, b(.25,126)],[N.G4, b(.25,126)],[N.B4, b(.5,126)],
      [N.A4, b(.25,126)],[N.A4, b(.25,126)],[N.E5, b(.5,126)],
      [N.F4, b(.25,126)],[N.A4, b(.25,126)],[N.C5, b(.75,126)],[N.R, b(.25,126)],
      [N.C5, b(.25,126)],[N.C5, b(.25,126)],[N.G5, b(.5,126)],
      [N.F5, b(.25,126)],[N.E5, b(.25,126)],[N.D5, b(.5,126)],
      [N.C5, b(.25,126)],[N.A4, b(.25,126)],[N.F4, b(1, 126)],[N.R, b(.5,126)],
    ],
  },

  /**
   * GALAXIA — A minor sparkle, triangle wave, BPM 96
   * Brilho estrelado, musica de galáxia com notas agudas tintilantes
   * Games: g02 Par ou Ímpar · g03 Caça Estrelas
   */
  galaxia: {
    wave: 'triangle',
    vol: 0.11,
    steps: [
      [N.A5, b(.25,96)],[N.E5, b(.25,96)],[N.A5, b(.25,96)],[N.B5, b(.25,96)],
      [N.A5, b(.5, 96)],[N.G5, b(.5, 96)],[N.E5, b(.5, 96)],
      [N.R,  b(.25,96)],[N.G5, b(.25,96)],[N.A5, b(.25,96)],[N.E5, b(.25,96)],
      [N.G5, b(.5, 96)],[N.E5, b(.5, 96)],[N.A4, b(1,  96)],
      [N.R,  b(.25,96)],[N.B5, b(.25,96)],[N.A5, b(.25,96)],[N.G5, b(.25,96)],
      [N.E5, b(.5, 96)],[N.A5, b(.5, 96)],[N.G5, b(.25,96)],[N.E5, b(.25,96)],
      [N.A4, b(1,  96)],[N.R,  b(.5, 96)],
    ],
  },

  /**
   * VENTANIA — C major flowing, sine wave, BPM 54
   * Melodia fluída como vento, subidas e descidas suaves
   * Games: g16 Sol Lua Estrelas · g17 Calendário Vivo
   */
  ventania: {
    wave: 'sine',
    vol: 0.13,
    steps: [
      [N.C5, b(1.5,54)],[N.D5, b(.5,54)],[N.E5, b(1,54)],[N.G5, b(2,54)],
      [N.A5, b(1,54)],  [N.G5, b(.5,54)],[N.E5, b(.5,54)],[N.D5, b(1.5,54)],
      [N.C5, b(2,54)],  [N.R,  b(.5,54)],
      [N.G5, b(1.5,54)],[N.E5, b(.5,54)],[N.D5, b(1,54)], [N.E5, b(1,54)],
      [N.G5, b(1.5,54)],[N.E5, b(.5,54)],[N.C5, b(2,54)],
      [N.R,  b(1,54)],
    ],
  },

  /**
   * CATALOG — gentle C major, sine wave, BPM 72
   * Navegando pelo catálogo: suave e acolhedor
   */
  catalog: {
    wave: 'sine',
    vol: 0.11,
    steps: [
      [N.G4,b(1,72)],[N.A4,b(1,72)],[N.B4,b(1,72)],[N.D5,b(1,72)],
      [N.G5,b(1,72)],[N.D5,b(1,72)],[N.B4,b(1,72)],[N.A4,b(1,72)],
      [N.G4,b(2,72)],[N.D5,b(1,72)],[N.B4,b(1,72)],
      [N.A4,b(1,72)],[N.G4,b(2,72)],[N.R, b(2,72)],
    ],
  },
};

// ── Game-ID → track mapping ───────────────────────────────────────────
const GAME_TRACK: Record<string, string> = {
  // Natureza / Animais
  g01: 'natureza', g05: 'natureza', g11: 'natureza', g20: 'natureza', g21: 'natureza',
  // Espacial / Tecnologia
  g09: 'espaco',   g12: 'espaco',   g13: 'espaco',
  // Cotidiano / Alimentação
  g04: 'aliment',  g06: 'aliment',  g08: 'aliment',  g10: 'aliment',  g19: 'aliment',
  // Trem
  g07: 'trem',
  // Galáxia / Estrelas
  g02: 'galaxia',  g03: 'galaxia',
  // Ventania / Celestial
  g16: 'ventania', g17: 'ventania',
};

/** Derive the BGM track ID from a game route path (e.g. /games/g01-festa-lagarta). */
export function getGameTrackId(gamePath: string): string {
  const m = gamePath.match(/\/games\/(g\d{2})/);
  if (m) return GAME_TRACK[m[1]] ?? 'natureza';
  return 'natureza';
}

// ── Core scheduling loop ──────────────────────────────────────────────
function scheduleLoop(trackId: string, startAt: number): void {
  if (!_playing || _currentTrack !== trackId) return;

  const ac  = getCtx();
  const mel = MELODIES[trackId];
  if (!mel) return;

  const master   = getMaster();
  const NOTE_VOL = mel.vol;
  let t = startAt;

  for (const [freq, dur] of mel.steps) {
    if (freq > 0) {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = mel.wave;
      osc.frequency.setValueAtTime(freq, t);

      const attack  = 0.012;
      const release = Math.min(0.05, dur * 0.18);
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

/** Sync mute state with the global toggle. */
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

/** Re-start BGM after unmute. */
export function resumeBGM(): void {
  if (_muted || !_playing || !_currentTrack) return;
  const ac     = getCtx();
  const master = getMaster();
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(0, ac.currentTime);
  master.gain.linearRampToValueAtTime(BASE_VOL, ac.currentTime + 0.3);
  scheduleLoop(_currentTrack, ac.currentTime + 0.05);
}
