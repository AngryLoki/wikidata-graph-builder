<script lang="ts">
    import type { SVGAttributes } from "svelte/elements";

    interface $$Props extends SVGAttributes<SVGSVGElement> {
        path: string;
        title?: string | undefined;
    }

    export let path: string;
    export let title: string | undefined = undefined;
</script>

<svg viewBox="0 0 24 24" {...$$restProps}>
    {#if title}<title>{title}</title>{/if}
    <path d={path} />
</svg>
