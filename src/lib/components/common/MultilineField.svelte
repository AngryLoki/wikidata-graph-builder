<svelte:options accessors />

<script lang="ts">
	import { onMount, tick } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { browser } from "$app/environment";

	interface $$Props extends HTMLInputAttributes {
		value: string | undefined;
	}

	let element: HTMLTextAreaElement;
	export let value: string | undefined = undefined;

	export const focus = () => {
		element.focus();
	};

	export const blur = () => {
		element.blur();
	};

	$: {
		value;
		void tick().then(recalculateSize);
	}

	const recalculateSize = () => {
		if (!browser) {
			return;
		}

		// Reset rows attribute to get accurate scrollHeight
		element.setAttribute("rows", "1");

		// Get the computed values object reference
		const cs = getComputedStyle(element);

		// Force content-box for size accurate line-height calculation
		// Remove scrollbars, lock width (subtract inline padding and inline border widths)
		// and remove inline padding and borders to keep width consistent (for text wrapping accuracy)
		const inlinePadding =
			Number.parseFloat(cs.paddingLeft) +
			Number.parseFloat(cs.paddingRight);
		const inlineBorderWidth =
			Number.parseFloat(cs.borderLeftWidth) +
			Number.parseFloat(cs.borderRightWidth);
		element.style.setProperty("overflow", "hidden", "important");
		element.style.setProperty(
			"width",
			`${
				Number.parseFloat(cs.width) - inlinePadding - inlineBorderWidth
			}px`
		);
		element.style.setProperty("box-sizing", "content-box");
		element.style.setProperty("padding-inline", "0");
		element.style.setProperty("border-width", "0");

		// Get the base line height, and top / bottom padding.
		// If line-height is not explicitly set, use the computed height value (ignore padding due to content-box)
		// Otherwise (line-height is explicitly set), use the computed line-height value.
		const blockPadding =
			Number.parseFloat(cs.paddingTop) +
			Number.parseFloat(cs.paddingBottom);
		const lineHeight =
			cs.lineHeight === "normal"
				? Number.parseFloat(cs.height)
				: Number.parseFloat(cs.lineHeight);

		// Get the scroll height (rounding to be safe to ensure cross browser consistency)
		const scrollHeight = Math.round(element.scrollHeight);

		// Undo overflow, width, border-width, box-sizing & inline padding overrides
		element.style.removeProperty("width");
		element.style.removeProperty("box-sizing");
		element.style.removeProperty("padding-inline");
		element.style.removeProperty("border-width");
		element.style.removeProperty("overflow");

		// Subtract block_padding from scroll_height and divide that by our line_height to get the row count.
		// Round to nearest integer as it will always be within ~.1 of the correct whole number.
		const rows = Math.round((scrollHeight - blockPadding) / lineHeight);

		// Set the calculated rows attribute (limited by row_limit)
		element.setAttribute("rows", rows.toString());
	};

	onMount(() => {
		// recalculateSize()

		const resizeObserver = new ResizeObserver(() => {
			recalculateSize();
		});

		resizeObserver.observe(element);

		// This callback cleans up the observer
		return () => resizeObserver.unobserve(element);
	});
</script>

<textarea
	bind:this={element}
	bind:value
	{...$$restProps}
	on:focus={(e) => e.currentTarget.select()}
	on:focus
	on:blur
	on:input
	on:keydown
/>

<style>
	textarea {
		resize: none;
		min-height: 0;
		max-height: none;
		height: auto;
	}
</style>
