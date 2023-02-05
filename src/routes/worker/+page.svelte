<script lang="ts">
	import { onMount } from "svelte";

	let canvas: HTMLCanvasElement;
	let worker: Worker;

	onMount(async () => {
		const SyncWorker = await import("$lib/worker/my.worker?worker");
		worker = new SyncWorker.default();

		const offscreenCanvas = canvas.transferControlToOffscreen();
		worker.postMessage({ canvas: offscreenCanvas }, [offscreenCanvas]);
		worker.postMessage({});
	});
</script>

<canvas width="300" height="300" bind:this={canvas} />
