export const autosize = (textarea: HTMLTextAreaElement) => {
	// Set rows attribute to number of lines in content
	textarea.addEventListener('input', () => {
		// Reset rows attribute to get accurate scrollHeight
		textarea.setAttribute('rows', '1');

		// Get the computed values object reference
		const cs = getComputedStyle(textarea);

		// Force content-box for size accurate line-height calculation
		// Remove scrollbars, lock width (subtract inline padding and inline border widths)
		// and remove inline padding and borders to keep width consistent (for text wrapping accuracy)
		const inlinePadding = Number.parseFloat(cs.paddingLeft) + Number.parseFloat(cs.paddingRight);
		const inlineBorderWidth = Number.parseFloat(cs.borderLeftWidth) + Number.parseFloat(cs.borderRightWidth);
		textarea.style.setProperty('overflow', 'hidden', 'important');
		textarea.style.setProperty('width', `${Number.parseFloat(cs.width) - inlinePadding - inlineBorderWidth}px`);
		textarea.style.setProperty('box-sizing', 'content-box');
		textarea.style.setProperty('padding-inline', '0');
		textarea.style.setProperty('border-width', '0');

		// Get the base line height, and top / bottom padding.
		// If line-height is not explicitly set, use the computed height value (ignore padding due to content-box)
		// Otherwise (line-height is explicitly set), use the computed line-height value.
		const blockPadding = Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom);
		const lineHeight = cs.lineHeight === 'normal' ? Number.parseFloat(cs.height) : Number.parseFloat(cs.lineHeight);

		// Get the scroll height (rounding to be safe to ensure cross browser consistency)
		const scrollHeight = Math.round(textarea.scrollHeight);

		// Undo overflow, width, border-width, box-sizing & inline padding overrides
		textarea.style.removeProperty('width');
		textarea.style.removeProperty('box-sizing');
		textarea.style.removeProperty('padding-inline');
		textarea.style.removeProperty('border-width');
		textarea.style.removeProperty('overflow');

		// Subtract block_padding from scroll_height and divide that by our line_height to get the row count.
		// Round to nearest integer as it will always be within ~.1 of the correct whole number.
		const rows = Math.round((scrollHeight - blockPadding) / lineHeight);

		// Set the calculated rows attribute (limited by row_limit)
		textarea.setAttribute('rows', rows.toString());
	});

	// Trigger the event to set the initial rows value
	textarea.dispatchEvent(new Event('input', {bubbles: true}));
};
