<script lang="ts">
	import { useActions, type ActionList } from "svelte-useactions";
	import ColorPicker from "svelte-awesome-color-picker";
	import PickerIndicator from "./PickerIndicator.svelte";
	import PickerWrapper from "./PickerWrapper.svelte";
	import SliderIndicator from "./SliderIndicator.svelte";
	import SliderWrapper from "./SliderWrapper.svelte";
	import Wrapper from "./Wrapper.svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface $$Props extends HTMLAttributes<HTMLDivElement> {
		class?: string | undefined;

		use?: ActionList<HTMLDivElement>;
		hex: string;
	}

	export let use: ActionList<HTMLDivElement> = [];
	export let hex: string;

	let element: HTMLDivElement;

	export const focus = () => element.focus();
	export const blur = () => element.blur();
</script>

<div use:useActions={use} on:blur bind:this={element} {...$$restProps}>
	<ColorPicker
		isPopup={false}
		isOpen={true}
		isInput={false}
		bind:hex
		canChangeMode={false}
		isTextInput={false}
		toRight={true}
		components={{
			wrapper: Wrapper,
			pickerWrapper: PickerWrapper,
			sliderWrapper: SliderWrapper,
			alphaWrapper: SliderWrapper,
			pickerIndicator: PickerIndicator,
			sliderIndicator: SliderIndicator,
			alphaIndicator: SliderIndicator,
		}}
	/>
</div>
