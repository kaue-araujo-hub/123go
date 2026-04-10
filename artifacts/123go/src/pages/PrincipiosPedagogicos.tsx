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
          onClick={() => setLocation('/student')}
          style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontFamily: 'Nunito' }}
        >
          ← Voltar ao Catálogo
        </button>

        <h1 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 28, color: 'var(--text)', marginBottom: 12 }}>
          Princípios Pedagógicos
        </h1>

        <div style={{ 
          background: '#fff', 
          padding: '32px 28px', 
          borderRadius: '20px', 
          border: '1px solid var(--border)', 
          marginBottom: 40,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}>
          
          <p style={{ 
            color: 'var(--text2)', 
            lineHeight: '1.75', 
            fontSize: '15.5px',
            marginBottom: 18 
          }}>
            O <strong>123GO!</strong> nasceu com um objetivo claro: tornar o aprendizado de matemática 
            acessível, mesmo em contextos de baixa conectividade e dispositivos simples.
          </p>

          <p style={{ 
            color: 'var(--text2)', 
            lineHeight: '1.75', 
            fontSize: '15.5px',
            marginBottom: 18 
          }}>
            Toda a plataforma foi construída em total alinhamento com o <strong>Currículo Paulista</strong>, 
            garantindo que cada atividade gamificada desenvolva habilidades essenciais do 1º ano de forma prática, 
            leve e envolvente.
          </p>

          <p style={{ 
            color: 'var(--text2)', 
            lineHeight: '1.75', 
            fontSize: '15.5px',
            marginBottom: 18 
          }}>
            Mas esse projeto <strong>não está pronto</strong> — e nem deve estar.
          </p>

          <p style={{ 
            color: 'var(--text2)', 
            lineHeight: '1.75', 
            fontSize: '15.5px',
            marginBottom: 18 
          }}>
            Acreditamos que a melhor forma de construir uma solução educacional relevante é <strong>junto de quem vive 
            a realidade da sala de aula todos os dias</strong>, e também com pessoas dispostas a fazer acontecer.
          </p>

          <p style={{ 
            color: 'var(--text2)', 
            lineHeight: '1.75', 
            fontSize: '15.5px',
            marginBottom: 18 
          }}>
            Se você é professor, educador, desenvolvedor, designer ou simplesmente alguém que acredita que a educação 
            pode ser mais acessível, prática e conectada com a realidade dos alunos — <strong>esse espaço também é seu</strong>.
          </p>

          <p style={{ 
            color: 'var(--text2)', 
            lineHeight: '1.75', 
            fontSize: '15.5px',
            marginBottom: 18 
          }}>
            Aqui, os jogos estão organizados por temas e habilidades específicas para apoiar um planejamento pedagógico 
            intencional e eficaz.
          </p>

          <p style={{ 
            color: 'var(--text2)', 
            lineHeight: '1.75', 
            fontSize: '15.5px',
            marginBottom: 24,
            fontWeight: 600
          }}>
            Agora, o próximo passo é evoluir <strong>juntos</strong>.
          </p>

          <p style={{ 
            color: '#16A34A', 
            fontSize: '17px', 
            fontWeight: 700, 
            lineHeight: '1.6',
            marginBottom: 8 
          }}>
            🚀 Quer construir isso com a gente?
          </p>

          <p style={{ 
            color: 'var(--text2)', 
            lineHeight: '1.7', 
            fontSize: '15.5px' 
          }}>
            Entre em contato e faça parte dessa jornada. 
            <a 
              href="mailto:kauearaujo_@outlook.com" 
              style={{ 
                color: '#16A34A', 
                textDecoration: 'underline', 
                cursor: 'pointer' 
              }}
            >
              kauearaujo_@outlook.com
            </a>
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