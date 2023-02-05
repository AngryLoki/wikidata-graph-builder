<script lang="ts">
	export let focused: boolean;
	export let toRight: boolean;

	focused;
	toRight;
</script>

<div class="p-1 select-none">
	<div class="rounded-full h-3 overflow-hidden">
		<slot />
	</div>
</div>
