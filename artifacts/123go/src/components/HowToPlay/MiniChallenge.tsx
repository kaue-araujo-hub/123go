import { useState, useRef, useCallback, useEffect } from 'react';
import { TutorialChallenge } from '../../data/tutorials';
import { playCorrect, playWrong } from '../../utils/sounds';
import styles from './MiniChallenge.module.css';

interface TutorialTheme {
  bg:    string;
  color: string;
  emoji: string;
}

interface Props {
  challenge:  TutorialChallenge;
  gameTheme:  TutorialTheme;
  onComplete: () => void;
}

export function MiniChallenge({ challenge, gameTheme, onComplete }: Props) {
  const cssVars = {
    '--challenge-color': gameTheme.color,
    '--challenge-bg':    gameTheme.bg,
  } as React.CSSProperties;

  if (challenge.id.startsWith('drag')) {
    return <DragChallenge challenge={challenge} gameTheme={gameTheme} style={cssVars} onComplete={onComplete} />;
  }
  if (challenge.id.startsWith('tap')) {
    return <TapChallenge challenge={challenge} gameTheme={gameTheme} style={cssVars} onComplete={onComplete} />;
  }
  if (challenge.id.startsWith('swipe')) {
    return <SwipeChallenge challenge={challenge} gameTheme={gameTheme} style={cssVars} onComplete={onComplete} />;
  }
  if (challenge.id.startsWith('hold')) {
    return <HoldChallenge challenge={challenge} gameTheme={gameTheme} style={cssVars} onComplete={onComplete} />;
  }
  if (challenge.id.startsWith('gesture')) {
    return <GestureChallenge challenge={challenge} gameTheme={gameTheme} style={cssVars} onComplete={onComplete} />;
  }
  if (challenge.id.startsWith('rhythm')) {
    return <RhythmChallenge challenge={challenge} gameTheme={gameTheme} style={cssVars} onComplete={onComplete} />;
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Shared success handler                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function useSuccessHandler(onComplete: () => void) {
  const [done, setDone] = useState(false);

  const succeed = useCallback(() => {
    if (done) return;
    setDone(true);
    playCorrect();
    setTimeout(onComplete, 1000);
  }, [done, onComplete]);

  return { done, succeed };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Particles burst (pure CSS)                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
const PARTICLE_COLORS = ['#5B4FCF', '#E91E8C', '#FF6B35', '#4CAF50', '#FFC107'];

function ParticlesBurst({ color }: { color: string }) {
  const count = 10;
  return (
    <div className={styles.particles} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const angle  = (i / count) * 360;
        const radius = 60 + Math.random() * 40;
        const tx     = Math.cos((angle * Math.PI) / 180) * radius;
        const ty     = Math.sin((angle * Math.PI) / 180) * radius;
        return (
          <span
            key={i}
            className={styles.particle}
            style={{
              background: PARTICLE_COLORS[i % PARTICLE_COLORS.length] ?? color,
              animation:  `none`,
              transform:  `translate(${tx}px, ${ty}px) translateZ(0)`,
              opacity:    0,
              animationName: 'particleFly',
              animationDuration: '0.8s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'both',
              animationDelay: `${i * 0.04}s`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes particleFly {
          from { transform: translate(0,0) scale(1) translateZ(0); opacity: 1; }
          to   { transform: var(--pt, translate(60px,60px)) scale(0) translateZ(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Drag Challenge                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
interface ChallengeProps {
  challenge:  TutorialChallenge;
  gameTheme:  TutorialTheme;
  style:      React.CSSProperties;
  onComplete: () => void;
}

function DragChallenge({ challenge, gameTheme, style, onComplete }: ChallengeProps) {
  const { done, succeed }          = useSuccessHandler(onComplete);
  const [attempts, setAttempts]    = useState(0);
  const [showHint, setShowHint]    = useState(false);
  const [dragging, setDragging]    = useState(false);
  const [pos, setPos]              = useState({ x: 0, y: 0 });
  const [zoneActive, setZoneActive] = useState(false);
  const [snapped, setSnapped]      = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef      = useRef<HTMLDivElement>(null);
  const dropRef      = useRef<HTMLDivElement>(null);
  const startPos     = useRef({ x: 0, y: 0 });
  const currentPos   = useRef({ x: 0, y: 0 });

  function getCenter(el: HTMLElement | null): { x: number; y: number } {
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (done || snapped) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startPos.current  = { x: e.clientX, y: e.clientY };
    currentPos.current = { x: 0, y: 0 };
    setDragging(true);
    setPos({ x: 0, y: 0 });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    currentPos.current = { x: dx, y: dy };
    setPos({ x: dx, y: dy });

    const center   = { x: e.clientX, y: e.clientY };
    const dropCtr  = getCenter(dropRef.current);
    const inZone   = Math.hypot(center.x - dropCtr.x, center.y - dropCtr.y) < 60;
    setZoneActive(inZone);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    setDragging(false);
    setZoneActive(false);

    const dropCtr = getCenter(dropRef.current);
    const dist    = Math.hypot(e.clientX - dropCtr.x, e.clientY - dropCtr.y);

    if (dist < 80) {
      setSnapped(true);
      succeed();
    } else {
      setPos({ x: 0, y: 0 });
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 2) setShowHint(true);
      playWrong();
    }
  }

  const dropClass = [
    styles.dropZone,
    zoneActive ? styles.dropZoneActive : '',
    snapped ? styles.dropZoneSuccess : '',
  ].join(' ');

  return (
    <div className={styles.arena} style={style}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      <div className={styles.dragArena} ref={containerRef}>
        {!snapped && (
          <div
            ref={dragRef}
            className={`${styles.draggable} ${dragging ? styles.dragging : ''}`}
            style={{ transform: `translate(${pos.x}px,${pos.y}px) translateZ(0)` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            role="button"
            tabIndex={0}
            aria-label={`Arraste ${challenge.emoji}`}
          >
            <span aria-hidden="true">{challenge.emoji}</span>
          </div>
        )}

        <div className={dropClass} ref={dropRef} aria-label="Zona de destino">
          <span aria-hidden="true">
            {snapped ? challenge.emoji : challenge.targetEmoji}
          </span>
        </div>

        {done && <div className={styles.successOverlay} aria-hidden="true">🎉</div>}
      </div>

      {showHint && !done && (
        <p className={styles.hint} role="status">{challenge.hint}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Tap Challenge                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
const TAP_COLORS = ['#FFC107', '#5B4FCF', '#E91E8C'];

function TapChallenge({ challenge, gameTheme, style, onComplete }: ChallengeProps) {
  const { done, succeed }           = useSuccessHandler(onComplete);
  const [tapCount, setTapCount]     = useState(0);
  const [showHint, setShowHint]     = useState(false);
  const [attempts, setAttempts]     = useState(0);
  const [wrongTap, setWrongTap]     = useState(false);
  const target = challenge.targetCount ?? 1;

  function handleCorrectTap() {
    if (done) return;
    const next = tapCount + 1;
    setTapCount(next);
    playCorrect();
    if (next >= target) succeed();
  }

  function handleWrongTap() {
    if (done) return;
    setWrongTap(true);
    setTimeout(() => setWrongTap(false), 400);
    const next = attempts + 1;
    setAttempts(next);
    if (next >= 2) setShowHint(true);
    playWrong();
  }

  const btnClass = [
    styles.tapTarget,
    done       ? styles.tapSuccess : '',
    wrongTap   ? styles.tapWrong   : '',
  ].join(' ');

  // tap-1: 3 colored circles, tap the yellow one (index 0 = yellow)
  if (challenge.id === 'tap-1') {
    return (
      <div className={styles.arena} style={style}>
        <p className={styles.instruction}>{challenge.instruction}</p>
        <div className={styles.tapCircles}>
          {TAP_COLORS.map((color, i) => (
            <button
              key={i}
              className={styles.tapCircle}
              style={{ background: color }}
              onClick={() => i === 0 ? handleCorrectTap() : handleWrongTap()}
              aria-label={`Círculo ${i + 1}`}
            />
          ))}
        </div>
        {done && <div className={styles.successOverlay} style={{ position: 'relative', fontSize: 40 }} aria-hidden="true">🎉</div>}
        {showHint && !done && <p className={styles.hint} role="status">{challenge.hint}</p>}
      </div>
    );
  }

  // tap-2 and others: single target with optional tap counter
  return (
    <div className={styles.arena} style={style}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      <button
        className={btnClass}
        style={{ '--tap-color': gameTheme.color, '--tap-bg': gameTheme.bg } as React.CSSProperties}
        onClick={handleCorrectTap}
        aria-label={`Toque aqui — ${tapCount} de ${target}`}
        disabled={done}
      >
        <span aria-hidden="true">{challenge.emoji ?? '⭐'}</span>
        {target > 1 && (
          <div className={styles.tapCounter} aria-live="polite" aria-atomic="true">
            {Array.from({ length: target }).map((_, i) => (
              <span
                key={i}
                className={`${styles.tapDot} ${i < tapCount ? styles.tapDotFilled : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </button>

      {done && <div className={styles.successOverlay} style={{ position: 'relative', fontSize: 40 }} aria-hidden="true">🎉</div>}
      {showHint && !done && <p className={styles.hint} role="status">{challenge.hint}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Swipe Challenge                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
const DIR_ARROWS: Record<string, string> = { right: '→', left: '←', up: '↑', down: '↓' };

function SwipeChallenge({ challenge, gameTheme, style, onComplete }: ChallengeProps) {
  const { done, succeed }        = useSuccessHandler(onComplete);
  const [attempts, setAttempts]  = useState(0);
  const [showHint, setShowHint]  = useState(false);
  const [swiped, setSwiped]      = useState(false);
  const startRef = useRef({ x: 0, y: 0 });

  function onPointerDown(e: React.PointerEvent) {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: React.PointerEvent) {
    if (done) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    let detected: string | null = null;

    if (horizontal) {
      if      (dx > 30) detected = 'right';
      else if (dx < -30) detected = 'left';
    } else {
      if      (dy > 30) detected = 'down';
      else if (dy < -30) detected = 'up';
    }

    if (detected === challenge.direction) {
      setSwiped(true);
      succeed();
    } else if (detected) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 2) setShowHint(true);
      playWrong();
    }
  }

  return (
    <div className={styles.arena} style={style}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      {!done && (
        <div className={styles.directionHint} aria-hidden="true">
          {challenge.direction ? DIR_ARROWS[challenge.direction] : '→'}
        </div>
      )}

      <div
        className={`${styles.swipeTarget} ${swiped ? styles.swipeSuccess : ''}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        role="button"
        tabIndex={0}
        aria-label={`Deslize para ${challenge.direction}`}
      >
        <span aria-hidden="true">{challenge.emoji}</span>
        {done && <div className={styles.successOverlay} aria-hidden="true">🎉</div>}
      </div>

      {showHint && !done && <p className={styles.hint} role="status">{challenge.hint}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Hold Challenge                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function HoldChallenge({ challenge, gameTheme, style, onComplete }: ChallengeProps) {
  const { done, succeed }       = useSuccessHandler(onComplete);
  const [progress, setProgress] = useState(0);
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef                = useRef(0);
  const DURATION                = challenge.holdDuration ?? 2000;
  const CIRCUMFERENCE           = 2 * Math.PI * 34;

  function startHold() {
    if (done) return;
    startRef.current  = performance.now();
    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startRef.current;
      const pct     = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current!);
        succeed();
      }
    }, 30);
  }

  function endHold() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!done) setProgress(0);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div className={styles.arena} style={style}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      <div className={styles.holdContainer}>
        <svg className={styles.holdRing} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#E8E8F0" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke={gameTheme.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition:      progress === 0 ? 'stroke-dashoffset 0.4s ease' : 'none',
              transformOrigin: 'center',
              transform:       'rotate(-90deg)',
            }}
          />
        </svg>

        <button
          className={`${styles.holdBtn} ${done ? styles.holdSuccess : ''}`}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          aria-label={`Segure este botão por ${DURATION / 1000} segundos`}
          style={{ '--hold-color': gameTheme.color } as React.CSSProperties}
        >
          <span aria-hidden="true">{done ? '✨' : (challenge.emoji ?? '✊')}</span>
        </button>
      </div>

      {done && <div className={styles.successOverlay} style={{ position: 'relative', fontSize: 40 }} aria-hidden="true">🎉</div>}
      <p className={styles.hint} role="status">{challenge.hint}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Gesture Challenge                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
function GestureChallenge({ challenge, gameTheme, style, onComplete }: ChallengeProps) {
  const { done, succeed }        = useSuccessHandler(onComplete);
  const [attempts, setAttempts]  = useState(0);
  const [showHint, setShowHint]  = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const points    = useRef<{ x: number; y: number }[]>([]);

  function getXY(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (done) return;
    drawing.current = true;
    points.current  = [];
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = gameTheme.color;
    ctx.lineWidth   = 6;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    const { x, y } = getXY(e);
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || done) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    const { x, y } = getXY(e);
    points.current.push({ x, y });
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endDraw() {
    if (!drawing.current || done) return;
    drawing.current = false;
    if (points.current.length < 5) return;

    const pts     = points.current;
    const first   = pts[0];
    const last    = pts[pts.length - 1];
    const dx      = Math.abs(last.x - first.x);
    const dy      = Math.abs(last.y - first.y);
    const detected = dx > dy ? 'horizontal-line' : 'vertical-line';

    if (detected === challenge.shape) {
      succeed();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 2) setShowHint(true);
      playWrong();
      setTimeout(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, 300, 200);
      }, 400);
    }
  }

  return (
    <div className={styles.arena} style={style}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      <canvas
        ref={canvasRef}
        width={300}
        height={180}
        className={`${styles.gestureCanvas} ${done ? styles.gestureSuccess : ''}`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        aria-label="Área de desenho — desenhe com o dedo ou mouse"
        role="img"
      />

      {done && <div className={styles.successOverlay} style={{ position: 'relative', fontSize: 40 }} aria-hidden="true">🎉</div>}
      {showHint && !done && <p className={styles.hint} role="status">{challenge.hint}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Rhythm Challenge (uses tap-style UI)                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function RhythmChallenge({ challenge, gameTheme, style, onComplete }: ChallengeProps) {
  const { done, succeed }       = useSuccessHandler(onComplete);
  const [tapCount, setTapCount] = useState(0);
  const [pulse, setPulse]       = useState(false);
  const target = challenge.targetCount ?? 1;

  // Pulse animation timer (1s interval)
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(p => !p);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  function handleTap() {
    if (done) return;
    const next = tapCount + 1;
    setTapCount(next);
    playCorrect();
    if (next >= target) succeed();
  }

  return (
    <div className={styles.arena} style={style}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      <button
        className={`${styles.tapTarget} ${done ? styles.tapSuccess : ''}`}
        style={{
          transform: pulse && !done ? 'scale(1.12) translateZ(0)' : 'scale(1) translateZ(0)',
          transition: 'transform 0.2s ease',
          '--tap-color': gameTheme.color,
          '--tap-bg': gameTheme.bg,
        } as React.CSSProperties}
        onClick={handleTap}
        aria-label={`Toque no ritmo — ${tapCount} de ${target}`}
        disabled={done}
      >
        <span aria-hidden="true">{challenge.emoji ?? '⭐'}</span>
        {target > 1 && (
          <div className={styles.tapCounter}>
            {Array.from({ length: target }).map((_, i) => (
              <span key={i} className={`${styles.tapDot} ${i < tapCount ? styles.tapDotFilled : ''}`} />
            ))}
          </div>
        )}
      </button>

      {done && <div className={styles.successOverlay} style={{ position: 'relative', fontSize: 40 }} aria-hidden="true">🎉</div>}
    </div>
  );
}
