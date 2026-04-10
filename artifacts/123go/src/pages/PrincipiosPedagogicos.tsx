import React, { useMemo } from 'react';
import { useLocation } from 'wouter';
import { Header } from '../components/Header';
import { GameCard } from '../components/GameCard';
import { games } from '../data/games';

export function PrincipiosPedagogicos() {
  const [, setLocation] = useLocation();

  // Agrupa os jogos pelas habilidades do Currículo Paulista definidas no seu HTML
  const secoesPedagogicas = useMemo(() => {
    const grupos = [
      {
        titulo: "Números / EF01MA02",
        descricao: "Contar de maneira exata ou aproximada, utilizando estratégias como pareamento e outros agrupamentos",
        codigos: ["EF01MA02"]
      },
      {
        titulo: "Números / EF01MA03",
        descricao: "Estimar e comparar quantidades de dois conjuntos (mín. 20 elementos): tem mais, tem menos ou mesma quantidade",
        codigos: ["EF01MA03"]
      },
      {
        titulo: "Números / EF01MA06",
        descricao: "Construir fatos básicos da adição e subtração e utilizá-los em cálculos mentais, escritos e para resolução de problemas",
        codigos: ["EF01MA06"]
      },
      {
        titulo: "Álgebra / EF01MA09",
        descricao: "Organizar e ordenar objetos por atributos como cor, forma e medida",
        codigos: ["EF01MA09"]
      },
      {
        titulo: "Geometria / EF01MA11",
        descricao: "Descrever a localização de pessoas e objetos em relação à própria posição: à direita, à esquerda, em frente, atrás",
        codigos: ["EF01MA11"]
      },
      {
        titulo: "Grandezas e Medidas / EF01MA17",
        descricao: "Reconhecer e relacionar períodos do dia, dias da semana e meses do ano usando calendário",
        codigos: ["EF01MA17"]
      },
      {
        titulo: "Probabilidade e Estatística / EF01MA21",
        descricao: "Ler dados expressos em tabelas e gráficos de colunas simples",
        codigos: ["EF01MA21"]
      }
    ];

    return grupos.map(sec => ({
      ...sec,
      jogos: games.filter(g => sec.codigos.includes(g.codigo))
    }));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Header onSearch={() => {}} />
      
      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '20px 16px' }}>
        <button
          onClick={() => setLocation('/catalog')}
          style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontFamily: 'Nunito' }}
        >
          ← Voltar ao Catálogo
        </button>

        <h1 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 28, color: 'var(--text)', marginBottom: 12 }}>
          Princípios Pedagógicos
        </h1>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: 32 }}>
          <p style={{ color: 'var(--text2)', lineHeight: '1.6', marginBottom: 12 }}>
            A plataforma <strong>123GO!</strong> foi desenvolvida em total alinhamento ao <strong>Currículo Paulista</strong>, garantindo que cada atividade gamificada contribua para o desenvolvimento das competências essenciais do 1º ano.
          </p>
          <p style={{ color: 'var(--text2)', lineHeight: '1.6' }}>
            Abaixo, os jogos estão organizados por habilidades específicas, permitindo um planejamento pedagógico preciso e intencional.
          </p>
        </div>

        {secoesPedagogicas.map((secao, idx) => (
          <section key={idx} style={{ marginBottom: 40 }}>
            <div style={{ borderLeft: '4px solid var(--c1)', paddingLeft: 16, marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Nunito', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
                {secao.titulo}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>{secao.descricao}</p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
              gap: 16 
            }}>
              {secao.jogos.map(game => (
                <GameCard key={game.id} game={game} onInfo={() => {}} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 16px', textAlign: 'center', background: '#fff' }}>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>© 2026 123GO. Alinhado à BNCC e Currículo Paulista.</p>
      </footer>
    </div>
  );
}