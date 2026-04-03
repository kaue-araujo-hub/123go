import { games } from './games';

export interface TrailStep {
  gameId: number;
  role: 'base' | 'reinforcement' | 'expert';
  label: string;
}

export interface Trail {
  tema: string;
  label: string;
  shortLabel: string;
  emoji: string;
  description: string;
  color: string;
  darkColor: string;
  gradient: string;
  steps: TrailStep[];
  skills: string[];
}

export const trails: Trail[] = [
  {
    tema: 'numeros',
    label: 'Números',
    shortLabel: 'Números',
    emoji: '🔢',
    description: 'Conte, compare e calcule com números!',
    color: '#10B981',
    darkColor: '#065F46',
    gradient: 'linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%)',
    steps: [
      { gameId: 1,  role: 'base',          label: 'Conceito Básico'  },
      { gameId: 4,  role: 'base',          label: 'Aplicação'        },
      { gameId: 7,  role: 'base',          label: 'Problema Simples' },
      { gameId: 2,  role: 'reinforcement', label: 'Reforço'          },
      { gameId: 9,  role: 'expert',        label: 'Desafio Expert'   },
    ],
    skills: [
      'Contar coleções até 20',
      'Comparar quantidades (mais/menos)',
      'Identificar sequências numéricas',
      'Adição e subtração básica',
    ],
  },
  {
    tema: 'algebra',
    label: 'Álgebra',
    shortLabel: 'Álgebra',
    emoji: '➗',
    description: 'Classifique, ordene e descubra padrões!',
    color: '#3B82F6',
    darkColor: '#1E40AF',
    gradient: 'linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)',
    steps: [
      { gameId: 10, role: 'base',          label: 'Conceito Básico'  },
      { gameId: 11, role: 'base',          label: 'Aplicação'        },
      { gameId: 12, role: 'base',          label: 'Problema Simples' },
      { gameId: 10, role: 'reinforcement', label: 'Reforço'          },
      { gameId: 12, role: 'expert',        label: 'Desafio Expert'   },
    ],
    skills: [
      'Classificar objetos por atributos',
      'Reconhecer e completar padrões',
      'Ordenar por cor, forma e tamanho',
      'Resolver situações de classificação',
    ],
  },
  {
    tema: 'geometria',
    label: 'Geometria',
    shortLabel: 'Geometria',
    emoji: '📐',
    description: 'Explore posições, direções e formas!',
    color: '#F59E0B',
    darkColor: '#92400E',
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FCD34D 100%)',
    steps: [
      { gameId: 13, role: 'base',          label: 'Conceito Básico'  },
      { gameId: 14, role: 'base',          label: 'Aplicação'        },
      { gameId: 15, role: 'base',          label: 'Problema Simples' },
      { gameId: 13, role: 'reinforcement', label: 'Reforço'          },
      { gameId: 15, role: 'expert',        label: 'Desafio Expert'   },
    ],
    skills: [
      'Descrever posições no espaço',
      'Usar palavras de lateralidade',
      'Guiar deslocamentos',
      'Interpretar mapas simples',
    ],
  },
  {
    tema: 'grandezas',
    label: 'Grandezas e Medidas',
    shortLabel: 'Grandezas',
    emoji: '⚖️',
    description: 'Aprenda sobre tempo e medidas do cotidiano!',
    color: '#8B5CF6',
    darkColor: '#4C1D95',
    gradient: 'linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)',
    steps: [
      { gameId: 16, role: 'base',          label: 'Conceito Básico'  },
      { gameId: 17, role: 'base',          label: 'Aplicação'        },
      { gameId: 18, role: 'base',          label: 'Problema Simples' },
      { gameId: 16, role: 'reinforcement', label: 'Reforço'          },
      { gameId: 18, role: 'expert',        label: 'Desafio Expert'   },
    ],
    skills: [
      'Identificar períodos do dia',
      'Ordenar dias da semana',
      'Conhecer meses do ano',
      'Resolver problemas de tempo',
    ],
  },
  {
    tema: 'probabilidade',
    label: 'Probabilidade e Estatística',
    shortLabel: 'Probabilidade',
    emoji: '📊',
    description: 'Colete dados e leia gráficos e tabelas!',
    color: '#EF4444',
    darkColor: '#7F1D1D',
    gradient: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)',
    steps: [
      { gameId: 19, role: 'base',          label: 'Conceito Básico'  },
      { gameId: 20, role: 'base',          label: 'Aplicação'        },
      { gameId: 21, role: 'base',          label: 'Problema Simples' },
      { gameId: 19, role: 'reinforcement', label: 'Reforço'          },
      { gameId: 21, role: 'expert',        label: 'Desafio Expert'   },
    ],
    skills: [
      'Ler gráficos de colunas',
      'Interpretar tabelas de dados',
      'Comparar categorias',
      'Fazer perguntas sobre pesquisas',
    ],
  },
];

export function getGame(id: number) {
  return games.find(g => g.id === id);
}

export function getTrailVisited(tema: string): number[] {
  try {
    const raw = localStorage.getItem(`trail_${tema}_visited`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markTrailGameVisited(tema: string, gameId: number) {
  const visited = getTrailVisited(tema);
  if (!visited.includes(gameId)) {
    visited.push(gameId);
    localStorage.setItem(`trail_${tema}_visited`, JSON.stringify(visited));
  }
}

export function getTrailPerformance(tema: string): 'high' | 'low' | null {
  try {
    return localStorage.getItem(`trail_${tema}_perf`) as 'high' | 'low' | null;
  } catch {
    return null;
  }
}

export function setTrailPerformance(tema: string, perf: 'high' | 'low') {
  localStorage.setItem(`trail_${tema}_perf`, perf);
}

export function resetTrail(tema: string) {
  localStorage.removeItem(`trail_${tema}_visited`);
  localStorage.removeItem(`trail_${tema}_perf`);
}
