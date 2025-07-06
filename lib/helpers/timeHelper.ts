export function preciseTimeout(callback: () => void, delay: number): void {
	const start = performance.now();
	function check() {
		const elapsed = performance.now() - start;
		if (elapsed >= delay) {
			callback();
		} else {
			requestAnimationFrame(check);
		}
	}
	requestAnimationFrame(check);
}