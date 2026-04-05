/**
 * TeacherDashboard.tsx
 * Painel exclusivo do professor — rota /professor, protegida por PIN de 4 dígitos.
 * PIN padrão: 1234 — mudar após o primeiro acesso.
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { SessionManager } from '../auth/SessionManager';
import { ModalitySelector } from '../components/ModalitySelector/ModalitySelector';

export function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const [pin,      setPin]      = useState('');
  const [unlocked, setUnlocked] = useState(() => SessionManager.isTeacher());
  const [pinError, setPinError] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  function handleLogin() {
    if (SessionManager.loginAsTeacher(pin)) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  }

  function handleLogout() {
    SessionManager.logoutTeacher();
    setUnlocked(false);
    setSessionId(null);
  }

  if (!unlocked) {
    return (
      <div style={{
        minHeight:       '100vh',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '24px',
        background:      '#F7F8FC',
        fontFamily:      'Nunito, sans-serif',
      }}>
        <div style={{
          background:    '#fff',
          borderRadius:  20,
          border:        '1.5px solid #E8E8F0',
          padding:       '40px 32px',
          maxWidth:      360,
          width:         '100%',
          textAlign:     'center',
          animation:     'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#1A1A2E', margin: '0 0 8px' }}>
            Acesso do Professor
          </h1>
          <p style={{ color: '#5A5A7A', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5 }}>
            Digite o PIN de 4 dígitos para acessar as configurações de aula.
          </p>

          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setPinError(false); }}
            onKeyDown={e => e.key === 'Enter' && pin.length === 4 && handleLogin()}
            placeholder="••••"
            aria-label="PIN de acesso do professor"
            aria-invalid={pinError}
            style={{
              width:        '100%',
              padding:      '14px 20px',
              borderRadius: 50,
              border:       `2px solid ${pinError ? '#E91E8C' : '#E8E8F0'}`,
              fontFamily:   'Nunito, sans-serif',
              fontWeight:   800,
              fontSize:     22,
              textAlign:    'center',
              letterSpacing: '0.3em',
              color:        '#1A1A2E',
              outline:      'none',
              background:   '#F7F8FC',
              boxSizing:    'border-box',
              marginBottom: 12,
              transition:   'border-color 0.2s ease',
            }}
          />

          {pinError && (
            <p role="alert" style={{
              color:      '#E91E8C',
              fontSize:   13,
              fontWeight: 700,
              marginBottom: 12,
              animation:  'popIn 0.3s ease',
            }}>
              PIN incorreto. Tente novamente.
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={pin.length !== 4}
            style={{
              width:         '100%',
              minHeight:     52,
              borderRadius:  50,
              border:        'none',
              background:    pin.length === 4
                ? 'linear-gradient(135deg,#5B4FCF,#E91E8C)'
                : '#E8E8F0',
              color:         pin.length === 4 ? '#fff' : '#9090B0',
              fontFamily:    'Nunito, sans-serif',
              fontWeight:    800,
              fontSize:      16,
              cursor:        pin.length === 4 ? 'pointer' : 'not-allowed',
              transition:    'all 0.2s ease',
              marginBottom:  16,
            }}
          >
            Entrar
          </button>

          <p style={{ color: '#9090B0', fontSize: 12 }}>
            PIN padrão inicial: <strong>1234</strong> — troque após o primeiro acesso.
          </p>

          <button
            onClick={() => setLocation('/catalog')}
            style={{
              background:  'none',
              border:      'none',
              color:       '#5B4FCF',
              fontFamily:  'Nunito, sans-serif',
              fontWeight:  700,
              fontSize:    14,
              cursor:      'pointer',
              marginTop:   8,
              padding:     '4px 0',
            }}
          >
            ← Voltar ao catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight:  '100vh',
      background: '#F7F8FC',
      fontFamily: 'Nunito, sans-serif',
    }}>

      {/* Header do painel */}
      <header style={{
        background:    '#fff',
        borderBottom:  '1.5px solid #E8E8F0',
        padding:       '0 20px',
        height:        60,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
        position:      'sticky',
        top:           0,
        zIndex:        50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setLocation('/catalog')}
            style={{
              width:        40,
              height:       40,
              borderRadius: '50%',
              border:       '1.5px solid #E8E8F0',
              background:   '#fff',
              cursor:       'pointer',
              fontSize:     16,
              color:        '#5A5A7A',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
            }}
            aria-label="Voltar ao catálogo"
          >
            ←
          </button>
          <h1 style={{ fontWeight: 900, fontSize: 18, color: '#1A1A2E', margin: 0 }}>
            🎓 Painel do Professor
          </h1>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding:      '8px 18px',
            borderRadius: 50,
            border:       '1.5px solid #E8E8F0',
            background:   '#fff',
            color:        '#5A5A7A',
            fontFamily:   'Nunito, sans-serif',
            fontWeight:   700,
            fontSize:     14,
            cursor:       'pointer',
          }}
        >
          Sair
        </button>
      </header>

      {/* Conteúdo */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

        {/* Seletor de modalidades */}
        <ModalitySelector onSessionStarted={id => setSessionId(id)} />

        {/* Dados da sessão */}
        {sessionId && (
          <section style={{
            background:   '#fff',
            borderRadius: 20,
            border:       '1.5px solid #E8E8F0',
            padding:      '20px',
            marginBottom: 24,
            animation:    'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <h2 style={{ fontWeight: 800, fontSize: 16, color: '#1A1A2E', margin: '0 0 12px' }}>
              📊 Dados da sessão
            </h2>
            <pre style={{
              background:   '#F7F8FC',
              borderRadius: 12,
              padding:      '14px',
              fontSize:     12,
              color:        '#5A5A7A',
              overflowX:    'auto',
              margin:       0,
              lineHeight:   1.6,
            }}>
              {JSON.stringify(SessionManager.exportSessionData(), null, 2)}
            </pre>
          </section>
        )}

        {/* Instruções */}
        <section style={{
          background:   '#fff',
          borderRadius: 20,
          border:       '1.5px solid #E8E8F0',
          padding:      '20px',
        }}>
          <h2 style={{ fontWeight: 800, fontSize: 16, color: '#1A1A2E', margin: '0 0 12px' }}>
            📖 Como usar
          </h2>
          <ol style={{ padding: '0 0 0 20px', margin: 0, color: '#5A5A7A', fontSize: 14, lineHeight: 2 }}>
            <li>Escolha a <strong>modalidade</strong> e o <strong>nível de dificuldade</strong>.</li>
            <li>Clique em <strong>"Iniciar aula"</strong> para ativar o modo para todos os alunos.</li>
            <li>Os alunos verão o badge do modo no topo de cada jogo.</li>
            <li>O modo persiste até você trocar ou encerrar a sessão.</li>
          </ol>
        </section>

      </main>
    </div>
  );
}
