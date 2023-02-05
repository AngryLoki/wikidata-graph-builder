<script lang="ts">
	let cls: string | undefined = undefined;
	export { cls as class };
</script>

<div class="inline overflow-hidden {cls ?? 'w-6 h-6'}">
	<div class="animate-spin-dynamic w-full h-full">
		<svg
			viewBox="0 0 16 16"
			class="w-full h-full opacity-0 animate-spin-appear"
		>
			<circle
				cx="8"
				cy="8"
				r="7"
				class="fill-none [stroke-dasharray:60] [stroke-width:1.5] [stroke-linecap:round] stroke-current"
			/>
		</svg>
	</div>
	<span class="sr-only">Loading...</span>
</div>
