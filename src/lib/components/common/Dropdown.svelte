<script lang="ts">
    import {
        offset,
        flip,
        size,
        type ComputePositionReturn,
        type Strategy,
        type Placement,
    } from "@floating-ui/dom";
    import { setContext } from "svelte";
    import { createFloatingActions } from "svelte-floating-ui";

    export let dropdownVisible: boolean;
    export let onComputed:
        | ((computed: ComputePositionReturn) => void)
        | undefined = undefined;
    export let grow = true;
    export let strategy: Strategy = "fixed";
    export let placement: Placement | undefined = "bottom-start";

    const sizeStrategy = {
        apply({
            availableWidth,
            availableHeight,
            elements,
            rects,
        }: {
            availableWidth: number;
            availableHeight: number;
            elements: any;
            rects: any;
        }) {
            Object.assign(elements.floating.style, {
                maxWidth: `${Math.min(availableWidth, 800)}px`,
                maxHeight: `${Math.min(availableHeight, 400)}px`,
                minWidth: `${rects.reference.width}px`,
            });
        },
    };

    const middleware = [offset(4), flip()];

    if (grow) {
        middleware.push(size(sizeStrategy));
    }

    const [floatingRef, floatingContent] = createFloatingActions({
        strategy,
        placement,
        middleware,
        autoUpdate: true,
        onComputed,
    });

    setContext("dropdown", { floatingRef, floatingContent });
</script>

<slot name="trigger" {floatingRef} />

{#if dropdownVisible}
    <div use:floatingContent class="fixed z-10">
        <slot name="dropdown" />
    </div>
{/if}
