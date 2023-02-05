<script lang="ts">
	export let pos: { x: number; y: number };
	export let hex: string;
	export let isDark: boolean;

	hex;
	isDark;
</script>

<div
	class="absolute w-2.5 h-2.5 bg-white border border-black/20 rounded-full pointer-events-none"
	style="left: calc({(pos.x / 260) * 250}%); 
	top: calc({(pos.y / 160) * 151}%);"
/>
