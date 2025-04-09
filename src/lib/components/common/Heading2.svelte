<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLHeadingElement> {
        class?: string | undefined;
        children?: Snippet;
    }

    let { class: cls = "", children, ...rest }: Props = $props();
</script>

<h2
    class="text-2xl leading-6 mt-4 font-medium text-gray-200 -tracking-[.01em] {cls}"
    {...rest}
>
    {@render children?.()}
</h2>
