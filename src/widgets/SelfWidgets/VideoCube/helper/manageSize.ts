
// Расчёт апофемы (растояние от центра фигуры до центра сторон)
function calculateApothem(sideWidth: number, numberOfSides: number): number {
	if (sideWidth <= 0 || numberOfSides < 3) return 0
  const angle = Math.PI / numberOfSides
  const apothem = sideWidth / (2 * Math.tan(angle));
  return apothem;
}

// Расчёт радиуса для многогранной фигуры
function calculateRadius(sideWidth: number, numberOfSides: number): number {
	const radiusCube = sideWidth / 2
	const apothem = calculateApothem(sideWidth, numberOfSides)
	if (!apothem) return radiusCube
	return apothem
}

// Функция для расчёта смещения по оси X (translateX) в пикселях
function getTranslateX(totalElements: number, index: number, radius: number): number {
  const angle = (index * 2 * Math.PI) / totalElements; // Угол в радианах
  return radius * Math.sin(angle);
}

// Функция для расчёта смещения по оси Z (translateZ) в пикселях
function getTranslateZ(totalElements: number, index: number, radius: number): number {
  const angle = (index * 2 * Math.PI) / totalElements; // Угол в радианах
  return radius * Math.cos(angle);
}

export function getTransformStr(index: number, sideWidth: number, numberOfSides: number): string {
	const radius = calculateRadius(sideWidth, numberOfSides)
	const sectorSizeAngle = 360 / numberOfSides
	const rotateY = index * sectorSizeAngle
	
	const x = Number( (getTranslateX(numberOfSides, index, radius)).toFixed(4) )
	const z = Number( (getTranslateZ(numberOfSides, index, radius)).toFixed(4) )
	const transformStr = `translateY(10%) translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg)`
	
	return transformStr
}