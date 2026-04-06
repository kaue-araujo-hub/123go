import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { SessionManager } from '../auth/SessionManager';

export function TeacherPinScreen() {
  const [, setLocation] = useLocation();
  const [pin, setPin]       = useState(['', '', '', '']);
  const [error, setError]   = useState(false);
  const [shake, setShake]   = useState(false);
  const inputRefs           = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function handleDigit(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...pin];
    next[index] = value.slice(-1);
    setPin(next);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (next.every(d => d !== '') && value) {
      const full = next.join('');
      const ok = SessionManager.loginAsTeacher(full);
      if (ok) {
        setLocation('/catalog');
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setPin(['', '', '', '']);
          setShake(false);
          inputRefs[0].current?.focus();
        }, 600);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const next = [...pin];
      next[index - 1] = '';
      setPin(next);
      inputRefs[index - 1].current?.focus();
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#1A1A2E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      gap: 32,
    }}>

      <button
        onPointerUp={() => setLocation('/')}
        style={{
          position: 'absolute',
          top: 18,
          left: 16,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'Nunito',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          padding: '8px 16px',
          touchAction: 'manipulation',
        }}
      >
        ← Voltar
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 56 }}>🎓</span>
        <h1 style={{
          fontFamily: 'Nunito',
          fontWeight: 900,
          fontSize: 'clamp(22px, 6vw, 32px)',
          color: '#fff',
          margin: 0,
          textAlign: 'center',
        }}>
          Acesso do Professor
        </h1>
        <p style={{
          fontFamily: 'Nunito Sans',
          fontSize: 14,
          color: 'rgba(255,255,255,0.45)',
          margin: 0,
          textAlign: 'center',
        }}>
          Digite o PIN de 4 dígitos para continuar
        </p>
      </div>

      <form onSubmit={e => e.preventDefault()} autoComplete="off" aria-label="PIN de acesso">
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', gap: 14 }}
        >
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
              style={{
                width: 60,
                height: 68,
                borderRadius: 14,
                border: `2px solid ${error ? '#EF4444' : digit ? '#E91E8C' : 'rgba(255,255,255,0.15)'}`,
                background: digit ? 'rgba(233,30,140,0.12)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontFamily: 'Nunito',
                fontWeight: 900,
                fontSize: 28,
                textAlign: 'center',
                outline: 'none',
                transition: 'border-color 0.15s ease, background 0.15s ease',
                caretColor: 'transparent',
                touchAction: 'manipulation',
              }}
            />
          ))}
        </motion.div>
      </form>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'Nunito',
            fontWeight: 700,
            fontSize: 14,
            color: '#EF4444',
            margin: 0,
          }}
        >
          PIN incorreto. Tente novamente.
        </motion.p>
      )}

      <p style={{
        fontFamily: 'Nunito Sans',
        fontSize: 11,
        color: 'rgba(255,255,255,0.2)',
        margin: 0,
        textAlign: 'center',
        letterSpacing: '0.05em',
      }}>
        PIN padrão: 1234
      </p>

    </div>
  );
}
