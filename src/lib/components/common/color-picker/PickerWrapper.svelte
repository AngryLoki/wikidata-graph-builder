<script lang="ts">
	export let focused: boolean;
	export let toRight: boolean;

	focused;
	toRight;
</script>

<div class="mb-2 block w-full h-48 select-none">
	<slot />
</div>
