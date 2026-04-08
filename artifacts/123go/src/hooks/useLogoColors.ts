import { useState, useEffect } from 'react';

const PALETTES: string[][] = [
  ['#F97316', '#6366F1', '#22C55E', '#1A1A2E', '#E91E8C', '#E91E8C'],
  ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'],
  ['#06B6D4', '#F97316', '#8B5CF6', '#EF4444', '#22C55E', '#3B82F6'],
  ['#14B8A6', '#F43F5E', '#A855F7', '#EAB308', '#6366F1', '#10B981'],
  ['#E91E8C', '#22C55E', '#3B82F6', '#F97316', '#EF4444', '#A855F7'],
];

let globalPaletteIdx = 0;
const listeners = new Set<(idx: number) => void>();

if (typeof window !== 'undefined') {
  setInterval(() => {
    globalPaletteIdx = (globalPaletteIdx + 1) % PALETTES.length;
    listeners.forEach(fn => fn(globalPaletteIdx));
  }, 120_000);
}

export function useLogoColors(): string[] {
  const [idx, setIdx] = useState(globalPaletteIdx);

  useEffect(() => {
    listeners.add(setIdx);
    return () => { listeners.delete(setIdx); };
  }, []);

  return PALETTES[idx];
}
