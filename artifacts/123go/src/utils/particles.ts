const COLORS = ['#F97316','#6366F1','#22C55E','#EF4444','#F59E0B','#EC4899','#5B4FCF','#00B4D8'];

export function burstParticles(
  originX = window.innerWidth / 2,
  originY = window.innerHeight / 2,
  count = 18,
) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const angle = (i / count) * 360 + Math.random() * 15;
    const distance = 50 + Math.random() * 80;
    const tx = Math.cos((angle * Math.PI) / 180) * distance;
    const ty = Math.sin((angle * Math.PI) / 180) * distance;
    const size = 7 + Math.random() * 9;
    const delay = Math.random() * 0.08;

    el.style.cssText = `
      position: fixed;
      left: ${originX}px;
      top: ${originY}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: ${Math.random() > 0.4 ? '50%' : '3px'};
      background: ${COLORS[i % COLORS.length]};
      pointer-events: none;
      z-index: 9999;
      --tx: ${tx}px;
      --ty: ${ty}px;
      animation: particle-burst 0.65s ease-out ${delay}s forwards;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}
