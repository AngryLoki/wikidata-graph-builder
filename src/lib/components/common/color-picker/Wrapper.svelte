<script lang="ts">
	export let wrapper: HTMLElement;
	export let isOpen: boolean;
	export let isPopup: boolean;
	export let toRight: boolean;

	isOpen;
	isPopup;
	toRight;
</script>

<div
	class="w-64 flex flex-col bg-gray-700 shadow-md shadow-gray-900 rounded-sm pb-1 overflow-hidden z-10"
	bind:this={wrapper}
	aria-label="color picker"
>
	<slot />
</div>
