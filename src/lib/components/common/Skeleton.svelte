<script lang="ts">
    interface Props {
        class?: string;
    }

    let { class: cls = "" }: Props = $props();
</script>

<span
    aria-hidden="true"
    class="inline-block h-auto rounded-md animate-pulse
    scale-y-[0.6] origin-[0px_55%] before:empty:content-['\a0'] {cls ?? ''}"
></span>
