import React from "react";
import { useLocation } from "wouter";
import { Header } from "../components/Header";

export function TermosDeUso() {
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
          <h1 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 32, color: 'var(--c1)', marginBottom: 8 }}>
            Termos de Uso
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 32 }}>Atualizado em Abril de 2026</p>

          <div style={{ color: 'var(--text2)', lineHeight: '1.8', fontFamily: 'Nunito Sans' }}>
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>1. Natureza do Serviço</h2>
              <p>A 123GO! é uma plataforma educacional dedicada ao aprendizado infantil através de jogos alinhados ao Currículo Paulista. O uso é destinado a fins pedagógicos.</p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>2. Cadastro e Responsabilidade</h2>
              <p>O acesso é realizado via PIN ou credenciais fornecidas. O usuário é responsável por manter a confidencialidade de seu acesso e utilizar a plataforma de forma ética.</p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>3. Propriedade Intelectual</h2>
              <p>Todo o conteúdo, arte dos jogos, personagens e algoritmos são de propriedade da 123GO! ou seus licenciadores, sendo proibida a reprodução sem autorização.</p>
            </section>

            <section>
              <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>4. Legislação</h2>
              <p>Estes termos são regidos pelas leis brasileiras, garantindo a conformidade com as diretrizes educacionais e de proteção ao menor.</p>
            </section>
          </div>
        </div>
      </main>

      <footer style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
        © 2026 123GO! • Educação e Tecnologia
      </footer>
    </div>
  );
}