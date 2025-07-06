export function findStartingAngle(angle: number): number {
    // Нормализация угла: берём остаток от деления на 360
    const normolized = angle % 360
    return normolized - 45
}

export interface ISector {
  start: number; // Начальный угол сектора в градусах
  end: number; // Конечный угол сектора в градусах
  size: number; // Размер сектора в градусах
  breakPoint?: number; // Точка перехода через 0° (опционально, используется в других функциях)
}

/**
 * Генерирует массив секторов на основе начального угла и количества сторон.
 *
 * Функция создает равномерно распределенные сектора, разделяя круг (360°) на заданное количество сторон.
 * Каждый сектор представлен объектом ISector с начальным углом, конечным углом и размером.
 * Углы нормализуются в диапазон [0, 360°), чтобы избежать отрицательных значений или значений больше 360°.
 *
 * @param startAngle - Начальный угол первого сектора в градусах.
 * @param sideNumber - Количество секторов (сторон), на которое делится круг.
 * @returns Массив объектов ISector, представляющих сектора.
 * @throws Error, если sideNumber <= 0.
 */
export function getPositionSides(startAngle: number, sideNumber: number): ISector[] {
  // Проверка корректности входного параметра sideNumber
  if (sideNumber <= 0) {
    throw new Error("sideNumber должен быть больше 0");
  }

  // Вычисление размера одного сектора (в градусах) путем деления круга на sideNumber
  const sideSize = 360 / sideNumber;

  // Создание массива начальных углов для каждого сектора
  // Каждый угол смещается на 90° * index относительно startAngle
  const positionsSides = Array.from({ length: sideNumber }, (_, index) => {
    const position = startAngle + index * 90;
    // Нормализация угла в диапазон [0, 360°): сначала добавляем 360, затем берем остаток
    return (position % 360 + 360) % 360;
  });

  // Преобразование начальных углов в объекты ISector
  // Каждый сектор имеет начальный угол, конечный угол (начало + размер) и размер
  return positionsSides.map((startPoint) => ({
    start: startPoint, // Начальный угол сектора
    end: ((startPoint + sideSize) % 360) || 360, // Конечный угол, нормализованный; 0 заменяется на 360
    size: sideSize, // Размер сектора (одинаков для всех секторов)
  }));
}

export interface IOverlapResult {
  overlapDegrees: number; // Градусы перекрытия
  overlapPercentage: number; // Процент перекрытия
  direction: 'left' | 'right' | 'full' | 'none'; // Направление перекрытия
}

/**
 * Вычисляет перекрытие основного сектора над целевым сектором, заданными их начальными и конечными углами.
 *
 * Функция определяет угловое перекрытие в градусах, процент перекрытия относительно размера целевого сектора
 * и направление перекрытия. Учитывает переходы через границу 0°/360° путем нормализации углов. Оптимизирована
 * для минимизации вычислений и повышения производительности. Результат включает:
 * - `overlapDegrees`: Угловое перекрытие в градусах.
 * - `overlapPercentage`: Процент перекрытия целевого сектора, округленный вниз.
 * - `direction`: Направление перекрытия ('left' — перекрытие слева, 'right' — справа, 'full' — полное, 'none' — нет перекрытия).
 *
 * @param primarySector - Основной сектор, который перекрывает целевой (начальный и конечный углы, размер в градусах).
 * @param targetSector - Целевой сектор, который перекрывается основным (начальный и конечный углы, размер в градусах).
 * @returns Объект с градусами перекрытия, процентом и направлением.
 */
export function calculateSectorOverlap(primarySector: ISector, targetSector: ISector): IOverlapResult {
  // Нормализация углов для учета перехода через 0°
  const primaryStart = primarySector.start % 360;
  const primaryEnd = primarySector.end < primarySector.start ? primarySector.end + 360 : primarySector.end;
  const targetStart = targetSector.start % 360;
  const targetEnd = targetSector.end < targetSector.start ? targetSector.end + 360 : targetSector.end;

  // Вычисление диапазона перекрытия
  let overlapStart = Math.max(primaryStart, targetStart);
  let overlapEnd = Math.min(primaryEnd, targetEnd);
  let overlapDegrees = overlapEnd >= overlapStart ? overlapEnd - overlapStart : 0;

  // Проверка альтернативной ветви через 0°, если перекрытие не найдено
  if (overlapDegrees === 0) {
    const alternatePrimaryStart = primaryStart + 360;
    const alternatePrimaryEnd = primaryEnd + 360;
    overlapStart = Math.max(alternatePrimaryStart, targetStart);
    overlapEnd = Math.min(alternatePrimaryEnd, targetEnd);
    if (overlapEnd >= overlapStart) {
      overlapDegrees = overlapEnd - overlapStart;
    }
  }

  // Ранний возврат при отсутствии перекрытия
  if (overlapDegrees === 0) {
    return {
      overlapDegrees: 0,
      overlapPercentage: 0,
      direction: 'none',
    };
  }

  // Вычисление процента перекрытия
  const overlapPercentage = targetSector.size > 0 ? Math.floor((overlapDegrees / targetSector.size) * 100) : 0;

  // Определение направления перекрытия
  let direction: IOverlapResult['direction'] = 'right';
  if (primaryStart <= targetStart && primaryEnd >= targetEnd) {
    direction = 'full';
  } else if (primaryEnd >= targetEnd) {
    direction = 'left';
  }

  return {
    overlapDegrees,
    overlapPercentage,
    direction,
  };
}

/**
 * Создает CSS-градиент на основе результата перекрытия секторов и цвета затемнения.
 *
 * Функция генерирует строку линейного градиента, используя информацию о перекрытии секторов
 * (направление, градусы и процент перекрытия) и указанный цвет затемнения. Градиент создается
 * с плавным переходом, где диапазон прозрачности и затемнения корректируется для мягкого эффекта
 * без резких скачков. Прозрачность и затемнение зависят от процента перекрытия, а направление
 * градиента определяется направлением перекрытия.
 *
 * @param overlap - Объект с результатом перекрытия (градусы, процент, направление).
 * @param darkenColor - Цвет затемнения в формате HEX (например, '#000000').
 * @returns Строка CSS линейного градиента.
 */
export function createGradient(overlap: IOverlapResult, darkenColor: string): string {
  // Извлечение данных о перекрытии
  const { direction, overlapPercentage } = overlap;

  // Вычисление прозрачности на основе процента перекрытия (0–1)
  const opacity = overlapPercentage / 100;

  // Создание полностью прозрачного цвета (добавление нулевой прозрачности к HEX-цвету)
  const transparent = `${darkenColor}0`;

  // Вычисление диапазонов для градиента: затемнение и прозрачность
  // rangePlus увеличивает процент для прозрачной границы (+20 для мягкого перехода)
  // rangeMinus уменьшает процент для затемненной границы (-5 для мягкости)
  const rangePlus = opacity * 100 + 20;
  const rangeMinus = opacity * 100 - 5;

  // Ограничение диапазонов: затемнение не меньше 0%, прозрачность не больше 100%
  const darkenPercentage = rangeMinus < 0 ? 0 : rangeMinus;
  const transparentPercentage = rangePlus > 100 ? 100 : rangePlus;

  // Генерация градиента в зависимости от направления перекрытия
  switch (direction) {
    case 'full': {
      // Для полного перекрытия: градиент от затемненного цвета к полностью непрозрачному
      const darkenPercentage = opacity * 100; // Прямая зависимость от процента перекрытия
      return `linear-gradient(to left, ${darkenColor}9 ${darkenPercentage}%, ${darkenColor})`;
    }
    case 'right': {
      // Для перекрытия справа: градиент от затемненного цвета к прозрачному
      return `linear-gradient(to ${direction}, ${darkenColor}9 ${darkenPercentage}%, ${transparent} ${transparentPercentage}%)`;
    }
    case 'left': {
      // Для перекрытия слева: градиент от затемненного цвета к прозрачному
      return `linear-gradient(to ${direction}, ${darkenColor}9 ${darkenPercentage}%, ${transparent} ${transparentPercentage}%)`;
    }
    default: {
      // Для отсутствия перекрытия ('none'): полностью прозрачный градиент
      const transparentPercentage = opacity * 100;
      return `linear-gradient(to left, ${transparent} ${transparentPercentage}%, ${transparent})`;
    }
  }
}