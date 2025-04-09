<script lang="ts">
	export let pos: number;
	export let toRight: boolean;

	toRight;
</script>

<div
	class="pointer-events-none w-2 h-2 absolute bg-white border border-black/20 rounded-full mt-0.5 z-10"
	style={`left: calc(${(pos / 200) * 190}% + 2px);`}
></div>
