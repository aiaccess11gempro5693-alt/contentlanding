/**
 * Общие настройки 3D-сцены hero.
 * Меняйте здесь размеры пластин, цвета и тайминги сцен прокрутки.
 * (Файл намеренно не импортирует three — его использует и лёгкий DOM-код hero.)
 */

export const COLORS = {
  background: "#EEF3F7",
  ink: "#18202A",
  blue: "#246BFD",
  violet: "#8D5CFF",
  teal: "#20C7B7",
  lavender: "#B9B2F2",
  cell: "#C8364E",
};

export const PLATE_COUNT = 5;

/** Размер обычной пластины (ширина, высота, толщина) */
export const PLATE = { w: 1.9, h: 2.45, d: 0.12, radius: 0.08 };
/** Последняя, более толстая пластина с микромиром */
export const LAST_PLATE = { w: 2.25, h: 2.8, d: 0.34, radius: 0.13 };

/** Угол поворота стопки пластин (рад) в разобранном и собранном состоянии */
export const STACK_ANGLE = { spread: 1.02, aligned: 0.22 };
/** Расстояние между пластинами по оси стопки */
export const STACK_GAP = { born: 0.45, spread: 1.02, aligned: 0.3 };

export function plateSize(i: number) {
  return i === PLATE_COUNT - 1 ? LAST_PLATE : PLATE;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Прогресс прокрутки hero (0…1) → параметры анимации.
 *  01  0.00–0.25  рассеянное облако
 *  02  0.25–0.50  облако конденсируется в стеклянные пластины
 *  03  0.50–0.75  частицы внутри пластин выстраиваются в сетки
 *  04  0.75–1.00  пластины совмещаются в один резкий кадр
 */
export function stageParams(p: number) {
  const condense = smooth(0.1, 0.48, p);
  const order = smooth(0.46, 0.72, p);
  const align = smooth(0.74, 0.98, p);
  const plateScale = Array.from({ length: PLATE_COUNT }, (_, i) =>
    smooth(0.08 + i * 0.045, 0.34 + i * 0.045, p),
  );
  const gap = lerp(lerp(STACK_GAP.born, STACK_GAP.spread, smooth(0.15, 0.5, p)), STACK_GAP.aligned, align);
  const angle = lerp(STACK_ANGLE.spread, STACK_ANGLE.aligned, align);
  return { condense, order, align, plateScale, gap, angle };
}

export function stageIndex(p: number) {
  return p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
}
