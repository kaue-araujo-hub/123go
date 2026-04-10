import React from "react";
import { useLocation } from "wouter";
import { Header } from "../components/Header";

export function Privacidade() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Header onSearch={() => {}} />

      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        <button
          onClick={() => setLocation('/catalog')}
          style={{
            background: 'none', border: 'none', color: 'var(--text3)',
            cursor: 'pointer', marginBottom: 24, display: 'flex',
            alignItems: 'center', gap: 6, fontWeight: 700, fontFamily: 'Nunito'
          }}
        >
          ← Voltar ao Catálogo
        </button>

        <div style={{ 
          background: '#fff', 
          padding: '40px', 
          borderRadius: '24px', 
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h1 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 32, color: 'var(--c3)', marginBottom: 8 }}>
            Política de Privacidade
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 32 }}>Compromisso com a Segurança e LGPD</p>

          <div style={{ color: 'var(--text2)', lineHeight: '1.8', fontFamily: 'Nunito Sans' }}>
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>1. Coleta de Dados</h2>
              <p>Coletamos apenas informações essenciais para a experiência pedagógica, como o progresso nos jogos e o nome de usuário para fins de ranking escolar.</p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>2. Proteção de Menores</h2>
              <p>Como uma plataforma infantil, priorizamos a segurança total. Não coletamos dados de contato de menores nem compartilhamos informações com terceiros para fins publicitários.</p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>3. Uso de Cookies</h2>
              <p>Utilizamos cookies apenas para manter sua sessão ativa e salvar suas preferências de visualização dos jogos.</p>
            </section>

            <section>
              <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>4. Seus Direitos</h2>
              <p>Conforme a LGPD, você pode solicitar a qualquer momento a exclusão ou correção de dados através do administrador da sua instituição.</p>
            </section>
          </div>
        </div>
      </main>

      <footer style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
        © 2026 123GO! • Sua privacidade é nossa prioridade.
      </footer>
    </div>
  );
}