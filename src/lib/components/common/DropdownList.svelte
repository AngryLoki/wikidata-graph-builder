<script lang="ts">
    import { getContext } from "svelte";
    import type { ContentAction } from "svelte-floating-ui";
    import type { HTMLAttributes } from "svelte/elements";

    interface $$Props extends HTMLAttributes<HTMLDivElement> {
        class?: string | undefined;
    }

    let cls = "";
    export { cls as class };

    export const focus = () => element.focus();
    export const blur = () => element.blur();

    export const scrollToFit = (option: HTMLElement) => {
        if (element.scrollHeight > element.clientHeight) {
            const scrollBottom = element.clientHeight + element.scrollTop;
            const elementBottom = option.offsetTop + option.offsetHeight;

            if (elementBottom > scrollBottom) {
                element.scrollTop = elementBottom - element.clientHeight;
            } else if (option.offsetTop < element.scrollTop) {
                element.scrollTop = option.offsetTop;
            }
        }
    };

    export const getScrollTop = () => element.scrollTop;
    export const setScrollTop = (scrollTop: number) =>
        (element.scrollTop = scrollTop);

    let element: HTMLDivElement;

    const { floatingContent } = getContext("dropdown") as {
        floatingContent: ContentAction;
    };
</script>

<div
    use:floatingContent
    bind:this={element}
    on:blur
    on:keydown
    class="bg-gray-700 border-2 border-gray-700 shadow-md shadow-gray-800 rounded
    overflow-auto [color-scheme:dark] z-10 fixed
    scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 focus-visible:outline-none overscroll-contain
    {cls}"
    {...$$restProps}
>
    <slot />
</div>
