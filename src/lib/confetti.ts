import confetti from "canvas-confetti";

const COLORS = ["#E85D75", "#F7DCE3", "#EAE0F8", "#FCEFD9", "#FFFFFF", "#3D1F2B"];

/** Burst of confetti when someone accepts a Woo. */
export function celebrateAccept() {
  const count = 180;
  const defaults = {
    origin: { y: 0.65 },
    colors: COLORS,
    disableForReducedMotion: true,
  };

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.35),
    spread: 55,
    startVelocity: 55,
    scalar: 1.05,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.3),
    spread: 100,
    decay: 0.91,
    scalar: 0.9,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.2),
    spread: 120,
    startVelocity: 35,
    decay: 0.92,
    scalar: 0.75,
  });

  // Side cannons for an “explosion” feel
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
    });
    confetti({
      ...defaults,
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
    });
  }, 150);
}
