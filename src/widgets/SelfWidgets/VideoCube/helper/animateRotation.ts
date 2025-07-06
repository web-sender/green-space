import { Dispatch, SetStateAction, MutableRefObject} from 'react'

// Функция для нахождения ближайшего значения, кратного 90
const getNearestMultipleOf90 = (value: number): number => {
  return Math.round(value / 90) * 90;
};

/**
 * Easing-функция для плавной анимации (квадратичная).
 * @param t Прогресс анимации (0..1)
 * @returns Значение easing (0..1)
 */
const easeInOutQuad = (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/**
 * Функция для мягкого единичного отскока с затуханием.
 * @param t Прогресс отскока (0..1)
 * @param damping Коэффициент затухания
 * @param frequency Угловая частота
 * @returns Значение отскока
 */
const easeSoftBounce = (t: number, damping: number = 1, frequency: number = Math.PI): number => {
  return Math.exp(-damping * t) * Math.sin(frequency * t);
};

/**
 * Запускает анимацию вращения с параболической траекторией rotX и отскоком.
 * @param direction Направление анимации ('forward' или 'backward')
 * @param rotY Текущее значение rotY
 * @param setRotY Функция установки rotY
 * @param rotX Текущее значение rotX
 * @param setRotX Функция установки rotX
 * @param animationFrame Ref для хранения requestAnimationFrame
 */
const animateRotation = (
  direction: 'forward' | 'backward',
  rotY: number,
  setRotY: Dispatch<SetStateAction<number>>,
  rotX: number,
  setRotX: Dispatch<SetStateAction<number>>,
  animationFrame: MutableRefObject<number | null>,
  setAnimate: Dispatch<SetStateAction<boolean>>,
): void => {
  if (animationFrame.current !== null) {
    cancelAnimationFrame(animationFrame.current); // Отменяем предыдущую анимацию
  }

  const startRotY: number = rotY;
  const targetRotY: number = getNearestMultipleOf90(rotY + (direction === 'forward' ? 60 : -60));
  const delta: number = Math.abs(targetRotY - startRotY);
  const mainDuration: number = Math.max((delta / 90) * 2000, 1000); // Длительность основной анимации
  const baseBounceDuration: number = 800; // Базовая длительность отскока
  const startTime: number = performance.now();
  
  // Параметры параболы
  const baseAmplitude: number = direction === 'forward' ? 30 : -30; // Базовая амплитуда
  const h: number = 0.5; // Вершина параболы
  const h1: number = 0.5; // Масштаб подъема
  const h2: number = 0.5; // Масштаб спада

  // Начальная точка на параболе
  const fullRotYRange: number = 90;
  const relativeStartRotY: number = startRotY % fullRotYRange;
  const initialT: number = Math.abs((relativeStartRotY + fullRotYRange) % fullRotYRange) / fullRotYRange;

  // Масштабируем амплитуду для rotX
  let amplitude: number = baseAmplitude;
  if (Math.abs(rotX) > 0.001) {
    const parabolaFactor: number = initialT <= h
      ? 1 - Math.pow(initialT - h, 2) / Math.pow(h1, 2)
      : 1 - Math.pow(initialT - h, 2) / Math.pow(h2, 2);
    amplitude = rotX / parabolaFactor;
  }

  // Инерция для отскока
  const inertiaY: number = delta / 90;
  const inertiaX: number = Math.abs(amplitude) / 30;
  const bounceInertia: number = 0.5 * (inertiaY + inertiaX);
  const bounceDuration: number = Math.min(Math.max(baseBounceDuration * bounceInertia, 300), 800);
  const fullDuration: number = mainDuration + bounceDuration;

  // Амплитуды отскока
  const bounceAmplitudeY: number = (direction === 'forward' ? -10 : 10) * inertiaY;
  const bounceAmplitudeX: number = (direction === 'forward' ? 10 : -10) * inertiaX;

  const animate = (currentTime: number): void => {
    const elapsed: number = currentTime - startTime;
    const progress: number = Math.min(elapsed / fullDuration, 1);
    const mainProgress: number = Math.min(elapsed / mainDuration, 1);
    const bounceProgress: number = bounceDuration > 0 ? Math.max(0, (elapsed - mainDuration) / bounceDuration) : 0;

    // Обновляем rotY
    let newRotY: number;
    if (mainProgress < 1) {
      const easedProgress: number = easeInOutQuad(mainProgress);
      newRotY = startRotY + (targetRotY - startRotY) * easedProgress;
    } else {
      newRotY = targetRotY + bounceAmplitudeY * easeSoftBounce(bounceProgress);
      if (bounceProgress >= 1) {
        newRotY = targetRotY;
      }
    }
    setRotY(newRotY);

    // Обновляем rotX
    let newRotX: number;
    if (mainProgress < 1) {
      const t: number = initialT + (1 - initialT) * mainProgress;
      if (t <= h) {
        newRotX = amplitude * (1 - Math.pow(t - h, 2) / Math.pow(h1, 2));
      } else {
        newRotX = amplitude * (1 - Math.pow(t - h, 2) / Math.pow(h2, 2));
      }
    } else {
      newRotX = bounceAmplitudeX * easeSoftBounce(bounceProgress);
      if (bounceProgress >= 1) {
        newRotX = 0;
      }
    }
    setRotX(newRotX);

    if (progress < 1) {
      animationFrame.current = requestAnimationFrame(animate);
      setAnimate(true)
    } else {
      setRotX(0);
      setRotY(targetRotY);
      setAnimate(false)
    }
  };

  animationFrame.current = requestAnimationFrame(animate);
};

export default animateRotation;