export function taphold(node: HTMLElement, handler: (event: MouseEvent | TouchEvent) => void) {
	const firstDelay = 400;
	const nextDelay = 40;

	let intervalId: number | undefined;

	const stop = () => {
		if (intervalId !== undefined) {
			clearInterval(intervalId);
			intervalId = undefined;
		}
	};

	const tapAndHold = (event: MouseEvent | TouchEvent) => {
		if (event.type === 'mousedown' && (event as MouseEvent).buttons !== 1) {
			return;
		}

		if (intervalId !== undefined) {
			return;
		}

		handler(event);

		intervalId = (globalThis as unknown as Window).setTimeout(() => {
			handler(event);

			intervalId = (globalThis as unknown as Window).setInterval(() => {
				handler(event);
			}, nextDelay);
		}, firstDelay);

		document.addEventListener('mouseup', stop, {once: true});
		document.addEventListener('touchend', stop, {once: true});
	};

	if ('ontouchstart' in document.documentElement) {
		node.addEventListener('touchstart', tapAndHold);
	} else {
		node.addEventListener('mousedown', tapAndHold);
	}

	return {
		destroy() {
			node.removeEventListener('mousedown', tapAndHold);
			node.removeEventListener('touchstart', tapAndHold);
			node.removeEventListener('mouseup', tapAndHold);
			node.removeEventListener('touchend', tapAndHold);
		},
	};
}
