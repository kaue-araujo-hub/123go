import React, { useState, useEffect, useRef } from "react";
import { useIsDesktop } from "../hooks/useIsDesktop";
import {
  GameShell,
  useGameEngine,
  FeedbackOverlay,
  PhaseCompleteCard,
} from "../engine/GameEngine";
import { AppleEmoji } from "../utils/AppleEmoji";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PHASES = [
  {
    label: "Organize por COR!",
    drawers: [
      { label: "🔴 Vermelho", key: "red",    color: "#EF5350" },
      { label: "🔵 Azul",     key: "blue",   color: "#42A5F5" },
      { label: "🟡 Amarelo",  key: "yellow", color: "#FFA726" },
    ],
    objects: [
      { emoji: "🍎", attr: "red"    },
      { emoji: "🌹", attr: "red"    },
      { emoji: "❤️", attr: "red"    },
      { emoji: "💙", attr: "blue"   },
      { emoji: "🫐", attr: "blue"   },
      { emoji: "🐋", attr: "blue"   },
      { emoji: "⭐", attr: "yellow" },
      { emoji: "🌟", attr: "yellow" },
      { emoji: "🌻", attr: "yellow" },
    ],
    mystery: false,
  },
  {
    label: "Organize por FORMA!",
    drawers: [
      { label: "⬛ Quadrado",  key: "square",   color: "#5B4FCF" },
      { label: "⭕ Círculo",   key: "circle",   color: "#E91E8C" },
      { label: "🔺 Triângulo", key: "triangle", color: "#FF6B35" },
    ],
    objects: [
      { emoji: "📦", attr: "square"   },
      { emoji: "🎁", attr: "square"   },
      { emoji: "📱", attr: "square"   },
      { emoji: "🌍", attr: "circle"   },
      { emoji: "⚽", attr: "circle"   },
      { emoji: "🎱", attr: "circle"   },
      { emoji: "🍕", attr: "triangle" },
      { emoji: "⛰️", attr: "triangle" },
      { emoji: "🎄", attr: "triangle" },
    ],
    mystery: false,
  },
  {
    label: "Organize por TAMANHO!",
    drawers: [
      { label: "🔹 Pequeno", key: "small",  color: "#4CAF50" },
      { label: "🔷 Médio",   key: "medium", color: "#FF9800" },
      { label: "💠 Grande",  key: "large",  color: "#9C27B0" },
    ],
    objects: [
      { emoji: "🐜", attr: "small"  },
      { emoji: "🐦", attr: "small"  },
      { emoji: "🐝", attr: "small"  },
      { emoji: "🐕", attr: "medium" },
      { emoji: "🐱", attr: "medium" },
      { emoji: "🐇", attr: "medium" },
      { emoji: "🐘", attr: "large"  },
      { emoji: "🦁", attr: "large"  },
      { emoji: "🐄", attr: "large"  },
    ],
    mystery: false,
  },
  {
    label: "Organize por COR e FORMA!",
    drawers: [
      { label: "🔴⬛ Verm. Quad.", key: "red-square",       color: "#EF5350" },
      { label: "🔵⭕ Azul Circ.",  key: "blue-circle",      color: "#42A5F5" },
      { label: "🟡🔺 Amar. Tri.", key: "yellow-triangle",  color: "#FFA726" },
    ],
    objects: [
      { emoji: "🟥", attr: "red-square"      },
      { emoji: "❤️", attr: "red-square"      },
      { emoji: "🔴", attr: "red-square"      },
      { emoji: "🔵", attr: "blue-circle"     },
      { emoji: "💙", attr: "blue-circle"     },
      { emoji: "🫐", attr: "blue-circle"     },
      { emoji: "⭐", attr: "yellow-triangle" },
      { emoji: "🌟", attr: "yellow-triangle" },
      { emoji: "🏔️", attr: "yellow-triangle" },
    ],
    mystery: false,
  },
  {
    label: "Descubra o habitat misterioso!",
    drawers: [
      { label: "🌊 Água",  key: "water", color: "#00B4D8" },
      { label: "🌿 Terra", key: "land",  color: "#4CAF50" },
      { label: "☁️ Céu",  key: "sky",   color: "#5B4FCF" },
    ],
    objects: [
      { emoji: "🐟", attr: "water" },
      { emoji: "🐠", attr: "water" },
      { emoji: "🦈", attr: "water" },
      { emoji: "🐘", attr: "land"  },
      { emoji: "🐆", attr: "land"  },
      { emoji: "🦊", attr: "land"  },
      { emoji: "🦅", attr: "sky"   },
      { emoji: "🦋", attr: "sky"   },
      { emoji: "🐦", attr: "sky"   },
    ],
    mystery: true,
  },
];

// Generate scattered positions avoiding overlaps
function getScatteredPositions(
  count: number,
  areaW: number,
  areaH: number,
  tileSize: number,
): { x: number; y: number }[] {
  const MIN_DIST = tileSize + 6;
  const pad = tileSize / 2 + 4;
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    let pos = { x: 0, y: 0 };
    let attempts = 0;
    do {
      pos = {
        x: pad + Math.random() * (areaW - pad * 2),
        y: pad + Math.random() * (areaH - pad * 2),
      };
      attempts++;
    } while (
      attempts < 100 &&
      positions.some(p => Math.hypot(p.x - pos.x, p.y - pos.y) < MIN_DIST)
    );
    positions.push(pos);
  }
  return positions;
}

export function AtelieOrdem() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [feedback,    setFeedback]    = useState<"correct" | "wrong" | null>(null);
  const [placed,      setPlaced]      = useState<Record<string, string[]>>({});
  const [shuffled,    setShuffled]    = useState<{ emoji: string; attr: string }[]>([]);
  const [positions,   setPositions]   = useState<{ x: number; y: number }[]>([]);
  const [draggingObj, setDraggingObj] = useState<{ emoji: string; attr: string } | null>(null);
  const [ghostPos,    setGhostPos]    = useState<{ x: number; y: number } | null>(null);
  const [hoveredKey,  setHoveredKey]  = useState<string | null>(null);

  const draggingRef     = useRef<{ emoji: string; attr: string } | null>(null);
  const drawerNodeRefs  = useRef<Record<string, HTMLDivElement | null>>({});
  const phaseCompletedRef = useRef(false);

  const phaseData  = PHASES[phase - 1];
  const tileSize   = isDesktop ? 48 : 56;
  const areaW      = isDesktop ? 860 : 360;
  const areaH      = isDesktop ? 180 : 200;

  const remaining = shuffled.filter(
    o => !Object.values(placed).flat().includes(o.emoji)
  );

  // Completion detection
  useEffect(() => {
    if (remaining.length === 0 && shuffled.length > 0 && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback("correct");
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 900);
    }
  }, [remaining.length, shuffled.length, onCorrect, onPhaseComplete]);

  // Phase reset
  useEffect(() => {
    phaseCompletedRef.current = false;
    setPlaced({});
    setFeedback(null);
    setDraggingObj(null);
    setGhostPos(null);
    setHoveredKey(null);
    const s = shuffle(phaseData.objects);
    setShuffled(s);
    setPositions(getScatteredPositions(s.length, areaW, areaH, tileSize));
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const getHoveredDrawer = (x: number, y: number): string | null => {
    for (const key of Object.keys(drawerNodeRefs.current)) {
      const el = drawerNodeRefs.current[key];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return key;
    }
    return null;
  };

  const startDrag = (e: React.PointerEvent, obj: { emoji: string; attr: string }) => {
    if (phaseCompletedRef.current || feedback) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = obj;
    setDraggingObj(obj);
    setGhostPos({ x: e.clientX, y: e.clientY });

    const onMove = (ev: PointerEvent) => {
      setGhostPos({ x: ev.clientX, y: ev.clientY });
      setHoveredKey(getHoveredDrawer(ev.clientX, ev.clientY));
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);

      const key = getHoveredDrawer(ev.clientX, ev.clientY);
      const obj = draggingRef.current;
      draggingRef.current = null;
      setDraggingObj(null);
      setGhostPos(null);
      setHoveredKey(null);

      if (!key || !obj) return;

      if (obj.attr === key) {
        setPlaced(prev => ({ ...prev, [key]: [...(prev[key] || []), obj.emoji] }));
      } else {
        setFeedback("wrong");
        setTimeout(() => setFeedback(null), 600);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  if (phaseComplete) {
    return (
      <GameShell title="Ateliê da Ordem" emoji="🗂️" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Ateliê da Ordem" emoji="🗂️" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Ghost */}
      {ghostPos && draggingObj && (
        <div style={{
          position: "fixed",
          left: ghostPos.x - tileSize / 2,
          top:  ghostPos.y - tileSize / 2,
          width: tileSize, height: tileSize,
          background: "#fff",
          borderRadius: 14,
          border: "3px solid var(--c1)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, pointerEvents: "none",
          transform: "scale(1.15)",
        }}>
          <AppleEmoji emoji={draggingObj.emoji} size={tileSize - 14} />
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h2 style={{ fontFamily: "Nunito", fontWeight: 800, fontSize: 17, color: "var(--text)", margin: 0 }}>
          {phaseData.label}
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 12, marginTop: 4, marginBottom: 0 }}>
          Arraste cada objeto até a gaveta correta
        </p>
      </div>

      {/* Scattered objects area */}
      <div style={{
        position: "relative",
        width: "100%",
        height: areaH,
        background: "#fff",
        borderRadius: "var(--radius)",
        border: "1.5px solid var(--border)",
        marginBottom: 12,
        overflow: "hidden",
      }}>
        {remaining.length === 0 && (
          <p style={{ color: "var(--c5)", fontWeight: 700, margin: "auto", position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✅ Tudo organizado!
          </p>
        )}
        {shuffled.map((obj, idx) => {
          if (Object.values(placed).flat().includes(obj.emoji)) return null;
          const pos = positions[idx] ?? { x: 40, y: 40 };
          const isDraggingMe = draggingObj?.emoji === obj.emoji;
          return (
            <div
              key={obj.emoji}
              onPointerDown={e => startDrag(e, obj)}
              style={{
                position: "absolute",
                left: pos.x - tileSize / 2,
                top:  pos.y - tileSize / 2,
                width: tileSize,
                height: tileSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab",
                background: "var(--bg)",
                borderRadius: 14,
                border: "2px solid var(--border)",
                boxShadow: isDraggingMe ? "none" : "0 2px 8px rgba(0,0,0,0.10)",
                touchAction: "none",
                userSelect: "none",
                opacity: isDraggingMe ? 0.25 : 1,
                transition: "opacity 0.15s",
              }}
            >
              <AppleEmoji emoji={obj.emoji} size={tileSize - 14} />
            </div>
          );
        })}
      </div>

      {/* Drawer drop zones */}
      <div style={{ display: "flex", gap: 8 }}>
        {phaseData.drawers.map(drawer => {
          const isHovered = hoveredKey === drawer.key;
          return (
            <div
              key={drawer.key}
              ref={el => { drawerNodeRefs.current[drawer.key] = el; }}
              style={{
                flex: 1,
                padding: "8px 6px",
                borderRadius: 16,
                border: `3px solid ${isHovered ? drawer.color : `${drawer.color}88`}`,
                background: isHovered ? `${drawer.color}33` : `${drawer.color}12`,
                minHeight: isDesktop ? 120 : 140,
                display: "flex",
                flexDirection: "column",
                gap: 5,
                alignItems: "center",
                transition: "border 0.15s, background 0.15s, transform 0.15s",
                transform: isHovered ? "scale(1.04)" : "scale(1)",
                boxShadow: isHovered ? `0 0 16px ${drawer.color}55` : "none",
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: 800, color: drawer.color,
                textAlign: "center", fontFamily: "Nunito", lineHeight: 1.2,
              }}>
                {drawer.label}
              </span>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 3,
                justifyContent: "center", flex: 1, alignContent: "center",
              }}>
                {(placed[drawer.key] || []).map((emoji, i) => (
                  <AppleEmoji key={i} emoji={emoji} size={isDesktop ? 26 : 32} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </GameShell>
  );
}