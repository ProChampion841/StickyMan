import { DEFAULT_TUNING, TUNING, type Tuning } from '../config';

type Range = readonly [min: number, max: number, step: number];

const GROUPS: Record<string, Partial<Record<keyof Tuning, Range>>> = {
  Movement: {
    maxSpeed: [1, 15, 0.1],
    groundAccel: [5, 150, 1],
    airAccel: [0, 80, 1],
    jumpSpeed: [2, 20, 0.1],
    jumpCut: [0, 1, 0.05],
    fallGravityMultiplier: [1, 4, 0.05],
    coyoteTime: [0, 0.3, 0.01],
    jumpBuffer: [0, 0.3, 0.01],
    gravity: [5, 60, 0.5],
  },
  Balance: {
    hoverHeight: [0.5, 1, 0.01],
    groundSnap: [0, 0.4, 0.01],
    hoverStiffness: [20, 800, 5],
    hoverDamping: [0, 80, 1],
    hoverMaxAccel: [5, 200, 1],
    uprightStiffness: [0, 300, 1],
    uprightDamping: [0, 60, 0.5],
    uprightMaxTorque: [0, 3000, 10],
    runLean: [-0.5, 0.6, 0.01],
  },
  Joints: {
    jointStiffness: [0, 4000, 10],
    jointDamping: [0, 200, 1],
    limpDamping: [0, 10, 0.1],
  },
  Gait: {
    strideLength: [0.3, 2, 0.01],
    legSwing: [0, 1.5, 0.01],
    armSwing: [0, 1.5, 0.01],
  },
  Combat: {
    punchDamage: [1, 40, 1],
    headMultiplier: [1, 3, 0.05],
    shurikenDamage: [0, 30, 1],
    kickDamage: [1, 50, 1],
    koKnockback: [0, 20, 0.5],
    stunTime: [0, 1, 0.01],
  },
  'Hit feel': {
    hitstopBase: [0, 0.2, 0.005],
    hitstopPerDamage: [0, 0.02, 0.001],
    hitstopMax: [0, 0.3, 0.005],
    koHitstop: [0, 0.5, 0.01],
    koSlowMo: [0, 2, 0.05],
    slowMoScale: [0.05, 1, 0.05],
    screenShake: [0, 2, 0.05],
    volume: [0, 1, 0.05],
  },
  'Match & eraser': {
    roundTime: [10, 180, 1],
    eraserSpeed: [2, 20, 0.5],
    eraserDamage: [0, 50, 1],
    eraserInterval: [3, 40, 1],
  },
  Look: {
    lineBoil: [0, 3, 0.1],
  },
};

/**
 * Live sliders for every TUNING value. Dev builds only: lil-gui is loaded lazily,
 * and the import is stripped from production builds.
 */
export async function openTuningPanel(): Promise<void> {
  const { default: GUI } = await import('lil-gui');
  const gui = new GUI({ title: 'Tuning (dev build only)' });
  // Below the health bars instead of over P2's.
  gui.domElement.style.top = '56px';
  for (const [name, fields] of Object.entries(GROUPS)) {
    const folder = gui.addFolder(name);
    for (const [key, [min, max, step]] of Object.entries(fields) as [keyof Tuning, Range][]) {
      folder.add(TUNING, key, min, max, step);
    }
    if (name !== 'Movement') folder.close();
  }
  gui
    .add({ copy: () => void navigator.clipboard.writeText(JSON.stringify(TUNING, null, 2)) }, 'copy')
    .name('Copy values as JSON');
  gui
    .add(
      {
        reset: () => {
          Object.assign(TUNING, DEFAULT_TUNING);
          for (const c of gui.controllersRecursive()) c.updateDisplay();
        },
      },
      'reset',
    )
    .name('Restore defaults');
  gui.close();
}
