/**
 * tutorials.ts
 * Define os 2 mini desafios de cada tipo de interação.
 * Reutilizado por todos os 21 jogos — nenhum jogo define seu próprio tutorial.
 */

export type InteractionType = 'drag' | 'tap' | 'swipe' | 'hold' | 'gesture' | 'rhythm';

export interface TutorialChallenge {
  id:           string;
  instruction:  string;
  emoji?:       string;
  targetEmoji?: string;
  targetCount?: number;
  direction?:   'right' | 'left' | 'up' | 'down';
  holdDuration?: number;
  shape?:       'vertical-line' | 'horizontal-line';
  hint:         string;
}

export interface Tutorial {
  title:       string;
  icon:        string;
  description: string;
  challenges:  [TutorialChallenge, TutorialChallenge];
}

export const TUTORIALS: Record<InteractionType, Tutorial> = {

  drag: {
    title:       'Arrastar',
    icon:        '👆',
    description: 'Toque e arraste para o lugar certo',
    challenges: [
      {
        id:          'drag-1',
        instruction: 'Arraste a estrela até o cesto!',
        emoji:       '⭐',
        targetEmoji: '🧺',
        hint:        'Toque na estrela e arraste sem soltar',
      },
      {
        id:          'drag-2',
        instruction: 'Agora arraste a maçã para a caixa!',
        emoji:       '🍎',
        targetEmoji: '📦',
        hint:        'Você consegue!',
      },
    ],
  },

  tap: {
    title:       'Tocar',
    icon:        '👇',
    description: 'Toque rápido no elemento certo',
    challenges: [
      {
        id:          'tap-1',
        instruction: 'Toque na bolinha amarela!',
        hint:        'Qual é a amarela?',
      },
      {
        id:          'tap-2',
        instruction: 'Toque 3 vezes no sol!',
        emoji:       '☀️',
        targetCount: 3,
        hint:        'Toque, toque, toque!',
      },
    ],
  },

  swipe: {
    title:       'Deslizar',
    icon:        '👋',
    description: 'Deslize o dedo na direção certa',
    challenges: [
      {
        id:          'swipe-1',
        instruction: 'Deslize a nuvem para a direita!',
        emoji:       '☁️',
        direction:   'right',
        hint:        'Para lá →',
      },
      {
        id:          'swipe-2',
        instruction: 'Agora deslize para baixo!',
        emoji:       '🌧️',
        direction:   'down',
        hint:        'Para baixo ↓',
      },
    ],
  },

  hold: {
    title:       'Segurar',
    icon:        '✊',
    description: 'Toque e segure até completar',
    challenges: [
      {
        id:           'hold-1',
        instruction:  'Segure o botão até encher a barra!',
        holdDuration: 2000,
        hint:         'Não solta!',
      },
      {
        id:           'hold-2',
        instruction:  'Segure a lâmpada para acendê-la!',
        emoji:        '💡',
        holdDuration: 1500,
        hint:         'Quase lá!',
      },
    ],
  },

  gesture: {
    title:       'Desenhar',
    icon:        '✏️',
    description: 'Desenhe o símbolo com o dedo',
    challenges: [
      {
        id:          'gesture-1',
        instruction: 'Desenhe uma linha de cima para baixo!',
        shape:       'vertical-line',
        hint:        'Como uma chuva ↓',
      },
      {
        id:          'gesture-2',
        instruction: 'Agora desenhe de um lado para o outro!',
        shape:       'horizontal-line',
        hint:        'Como um rabisco →',
      },
    ],
  },

  rhythm: {
    title:       'No Ritmo',
    icon:        '🎵',
    description: 'Toque no momento certo',
    challenges: [
      {
        id:          'rhythm-1',
        instruction: 'Toque quando a estrela piscar!',
        emoji:       '⭐',
        hint:        'Espere piscar!',
      },
      {
        id:          'rhythm-2',
        instruction: 'Toque 2 vezes no ritmo!',
        targetCount: 2,
        hint:        'Pum... pum!',
      },
    ],
  },
};
