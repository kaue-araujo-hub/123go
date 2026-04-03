import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { char: '1', color: '#F59E0B' },
  { char: '2', color: '#EF4444' },
  { char: '3', color: '#3B82F6' },
  { char: 'GO!', color: '#10B981' },
];

const STEP_MS = 1100;
const GO_MS   = 900;

interface Props {
  countdownKey: number;
  onComplete: () => void;
}

export function CountdownOverlay({ countdownKey, onComplete }: Props) {
  const [step, setStep]       = useState(0);
  const [closing, setClosing] = useState(false);

  /* Reset whenever countdownKey changes (restart) */
  useEffect(() => {
    setStep(0);
    setClosing(false);
  }, [countdownKey]);

  /* Advance through steps */
  useEffect(() => {
    if (closing) return;

    const isLast = step === STEPS.length - 1;
    const delay  = isLast ? GO_MS : STEP_MS;

    const t = setTimeout(() => {
      if (isLast) {
        setClosing(true);
        setTimeout(onComplete, 320);
      } else {
        setStep(s => s + 1);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [step, closing, onComplete]);

  return (
    <AnimatePresence>
      {!closing && (
        <motion.div
          key="countdown-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
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
            gap: 0,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ scale: 0.15, opacity: 0, rotate: -8 }}
              animate={{ scale: 1,    opacity: 1, rotate: 0 }}
              exit={{ scale: 1.6,     opacity: 0, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              style={{
                fontFamily: 'Nunito',
                fontWeight: 900,
                lineHeight: 1,
                userSelect: 'none',
                letterSpacing: step === STEPS.length - 1 ? '-2px' : '-4px',
                fontSize: step === STEPS.length - 1 ? 'clamp(72px, 20vw, 200px)' : 'clamp(100px, 28vw, 280px)',
                color: STEPS[step].color,
                textShadow: `0 8px 60px ${STEPS[step].color}55`,
                display: 'block',
              }}
            >
              {STEPS[step].char}
            </motion.span>
          </AnimatePresence>

          {/* Dot progress indicator */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 32,
            position: 'absolute',
            bottom: 48,
          }}>
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                animate={{
                  background: i <= step ? s.color : '#e0e0e0',
                  scale: i === step ? 1.4 : 1,
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
