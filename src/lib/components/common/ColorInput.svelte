<script lang="ts">
	import type { Placement } from "@floating-ui/dom";
	import { createEventDispatcher, tick } from "svelte";
	import ColorPicker from "./color-picker/ColorPicker.svelte";

	export let value: string = "#ff0000";
	$: editValue = value;

	import Dropdown from "./Dropdown.svelte";
	import { getid } from "./utils";

	let cls = "";
	export { cls as class };

	export let id = getid();
	export let label: string | undefined = undefined;
	export let placement: Placement | undefined = undefined;

	let dropdownVisible = false;
	let ignoreNextClick = false;
	let dropdownRef: ColorPicker;

	const dispatch = createEventDispatcher();

	const onClick = () => {
		if (ignoreNextClick) {
			ignoreNextClick = false;
			return;
		}

		openMenu();
	};

	const onMousedown = () => {
		if (dropdownVisible) {
			ignoreNextClick = true;
		}
	};

	const openMenu = () => {
		dropdownVisible = true;

		void tick().then(() => {
			dropdownRef.focus();
		});
	};
</script>

<Dropdown {dropdownVisible} grow={false} {placement}>
	<button
		slot="trigger"
		let:floatingRef
		use:floatingRef
		class="text-left border-[1.99px] rounded-sm
		{dropdownVisible
			? 'border-blue-500 bg-gray-950'
			: 'border-transparent hover:border-gray-300/5 hover:bg-gray-300/5 nohover:bg-gray-300/5'}
		focus-visible:outline-none focus-visible:border-blue-500 focus-visible:hover:border-blue-500
		transition px-1 leading-6 h-6 box-content flex items-center
		{cls}"
		on:click={onClick}
		on:mousedown={onMousedown}
		aria-haspopup="true"
		aria-expanded={dropdownVisible}
		{id}
	>
		<div
			class="{label !== undefined
				? 'h-3.5 w-3.5'
				: 'h-4 w-full'} rounded-sm border-[1.99px] border-gray-700"
			style="background-color: {editValue}"
		/>
		{#if label !== undefined}
			<div class="ml-2">{label}</div>
		{/if}
	</button>
	<ColorPicker
		id="field-{id}"
		slot="dropdown"
		bind:this={dropdownRef}
		on:blur={() => {
			dropdownVisible = false;
			const changed = value !== editValue;
			value = editValue;

			if (changed) {
				dispatch("change");
			}
		}}
		bind:hex={editValue}
		tabindex={0}
	/>
</Dropdown>
