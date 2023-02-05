<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";

    interface $$Props extends HTMLAttributes<HTMLHeadingElement> {
        class?: string | undefined;
    }

    let cls = "";
    export { cls as class };
</script>

<h2
    class="text-2xl leading-6 mt-4 font-medium text-gray-200 -tracking-[.01em] {cls}"
    {...$$restProps}
>
    <slot />
</h2>
