const makeChunkedFunction = <T>(processChunk: (chunk: string[]) => Promise<Record<string, T>>, chunkSize: number) => {
	const pendingItems = new Map<string, number>();
	const loadingItems = new Map<string, {refs: number; promise: Promise<T>}>();

	return async (id: string) => {
		pendingItems.set(id, (pendingItems.get(id) ?? 0) + 1);

		// Wait for next tick
		await Promise.resolve();

		let loadingItem = loadingItems.get(id);

		const items = [...pendingItems.keys()];

		if (!loadingItem) {
			for (let i = 0; i < items.length; i += chunkSize) {
				const itemsChunk = items.slice(i, i + chunkSize);
				const promise = processChunk(itemsChunk);

				for (const item of itemsChunk) {
					loadingItems.set(item, {
						refs: pendingItems.get(item)!,
						promise: (async () => {
							const items = await promise;
							if (items[item] === undefined) {
								console.error(`${item} not found`, itemsChunk);
							}

							return items[item];
						})(),
					});
				}
			}

			pendingItems.clear();
			loadingItem = loadingItems.get(id)!;
		}

		loadingItem.refs--;
		if (loadingItem.refs === 0) {
			loadingItems.delete(id);
		}

		return loadingItem.promise;
	};
};

export default makeChunkedFunction;
