const isLocalStorageAvailable = () => {
	let storage: Storage | undefined;
	try {
		storage = window.localStorage;
		const x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	} catch (error: unknown) {
		return error instanceof DOMException && (
			error.code === 22
            || error.code === 1014
            || error.name === 'QuotaExceededError'
            || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
            && (storage && storage.length > 0);
	}
};

const makeCachedFunction = <T>(key: string, valueFn: () => Promise<T>, expiryMs: number, version: number) => async () => {
	if (!isLocalStorageAvailable()) {
		console.log(`localStorage is not available, cache won't be used for ${key}`);
		return valueFn();
	}

	const stored = localStorage.getItem(key);

	if (stored) {
		const storedValue = JSON.parse(stored) as {version: number; date: number; value: T};
		if (storedValue.version === version || storedValue.date + expiryMs > Date.now()) {
			return storedValue.value;
		}
	}

	const value = await valueFn();
	localStorage.setItem(key, JSON.stringify({
		date: Date.now(),
		version,
		value,
	}));
	return value;
};

export default makeCachedFunction;
