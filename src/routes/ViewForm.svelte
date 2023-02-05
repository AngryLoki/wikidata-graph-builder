<script lang="ts">
	import Select from "$lib/components/common/Select.svelte";
	import { graphLayouts, shortcutsModes } from "./app";
	import { createEventDispatcher } from "svelte";
	import FieldInline from "$lib/components/common/FieldInline.svelte";
	import ColorInput from "$lib/components/common/ColorInput.svelte";
	import NumberInput from "$lib/components/common/NumberInput.svelte";
	import type { VisParameters } from "$lib/force-graph/types";

	export let visParameters: VisParameters;

	let expanded = false;

	const dispatch = createEventDispatcher();

	const onChange = () => {
		dispatch("submit", visParameters);
	};
</script>

<div
	class="absolute top-0 right-0 w-72 flex flex-col gap-1 bg-gray-900/90 rounded-bl-lg overflow-hidden"
>
	{#if expanded}
		<div class="py-1 px-2 grid grid-cols-2 gap-1">
			<FieldInline label="Layout">
				<Select
					options={graphLayouts}
					bind:value={visParameters.graphDirection}
					on:change={onChange}
				/>
			</FieldInline>
			<FieldInline label="Shortcuts">
				<Select
					options={shortcutsModes}
					bind:value={visParameters.shortcutsMode}
					on:change={onChange}
				/>
			</FieldInline>
			<FieldInline label="Shortcuts color">
				<ColorInput
					bind:value={visParameters.shortcutsColor}
					placement="bottom-end"
					on:change={onChange}
				/>
			</FieldInline>
			<FieldInline label="Shortcuts width">
				<NumberInput
					bind:value={visParameters.shortcutsWidth}
					required={true}
					on:change={onChange}
				/>
			</FieldInline>
		</div>
	{/if}

	<button
		on:click={() => {
			expanded = !expanded;
		}}
		class="w-full leading-6 py-0.5 text-gray-300 bg-transparent hover:bg-white/5 active:bg-black/5 transition-colors"
	>
		{expanded ? "Collapse" : "Show visualization settings"}
	</button>
</div>
