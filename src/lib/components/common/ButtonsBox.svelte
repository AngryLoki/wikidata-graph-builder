<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        class?: string;
        children?: Snippet;
    }

    let { class: cls = "", children }: Props = $props();
</script>

<div class="border-x-[1.99px] border-transparent px-1 {cls}">
    {@render children?.()}
</div>
