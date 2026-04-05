import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { char: '1', color: '#F59E0B' },
  { char: '2', color: '#EF4444' },
  { char: '3', color: '#3B82F6' },
  { char: 'GO!', color: '#10B981' },
];

const STEP_MS = 900;
const GO_MS   = 800;

interface Props {
  countdownKey: number;
  onComplete:   () => void;
  onBack?:      () => void;
}

export function CountdownOverlay({ countdownKey, onComplete, onBack }: Props) {
  const [step,    setStep]    = useState(0);
  const [closing, setClosing] = useState(false);
  const cancelledRef          = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setStep(0);
    setClosing(false);
  }, [countdownKey]);

  useEffect(() => {
    if (closing) return;

    const isLast = step === STEPS.length - 1;
    const delay  = isLast ? GO_MS : STEP_MS;

    const t = setTimeout(() => {
      if (cancelledRef.current) return;
      if (isLast) {
        setClosing(true);
        setTimeout(() => { if (!cancelledRef.current) onComplete(); }, 300);
      } else {
        setStep(s => s + 1);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [step, closing, onComplete]);

  const isGo = step === STEPS.length - 1;

  function handleBack() {
    cancelledRef.current = true;
    onBack?.();
  }

  return (
    <AnimatePresence>
      {!closing && (
        <motion.div
          key="countdown-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {/* ← Voltar button */}
          {onBack && (
            <button
              onClick={handleBack}
              style={{
                position: 'absolute',
                top: 18,
                left: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: 'var(--text3)',
                fontFamily: 'Nunito',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: 8,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'; }}
            >
              ← Voltar
            </button>
          )}

          {/* Number / GO! */}
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ scale: 0.1, opacity: 0, y: 20 }}
              animate={
                isGo
                  ? {
                      scale: [0.3, 1.25, 1.0],
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, times: [0, 0.5, 1], ease: 'easeOut' },
                    }
                  : { scale: 1, opacity: 1, y: 0 }
              }
              exit={{ scale: 1.8, opacity: 0, y: -20, transition: { duration: 0.22, ease: 'easeIn' } }}
              transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              style={{
                fontFamily: 'Nunito',
                fontWeight: 900,
                lineHeight: 1,
                userSelect: 'none',
                letterSpacing: isGo ? '-2px' : '-4px',
                fontSize: isGo
                  ? 'clamp(72px, 20vw, 180px)'
                  : 'clamp(110px, 30vw, 280px)',
                color: STEPS[step].color,
                textShadow: `0 8px 60px ${STEPS[step].color}55`,
                display: 'block',
              }}
            >
              {STEPS[step].char}
            </motion.span>
          </AnimatePresence>

          {/* Dot progress */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 36,
            position: 'absolute',
            bottom: 52,
          }}>
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                animate={{
                  background: i <= step ? s.color : '#e0e0e0',
                  scale: i === step ? 1.5 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#e0e0e0',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
