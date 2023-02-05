<script lang="ts">
    import { useActions, type ActionList } from "svelte-useactions";
    import type { HTMLButtonAttributes } from "svelte/elements";

    interface $$Props extends HTMLButtonAttributes {
        class?: string | undefined;
        disabled?: boolean;
        use?: ActionList<HTMLButtonElement>;
        primary?: boolean;
    }

    let cls = "";
    export { cls as class };

    export let use: ActionList<HTMLButtonElement> = [];
    export const focus = () => element.focus();
    export let primary = false;

    export let disabled = false;

    let element: HTMLButtonElement;
</script>

<button
    bind:this={element}
    use:useActions={use}
    class="text-white font-medium rounded-sm px-2.5 truncate transition leading-8
    focus:outline-none focus-visible:outline-offset-0
    {primary
        ? 'bg-blue-700 hover:bg-blue-600 active:bg-blue-800 focus-visible:outline-blue-500'
        : 'bg-gray-450 hover:bg-gray-400 active:bg-gray-500'}
    
    disabled:cursor-not-allowed disabled:bg-blue-300/10 disabled:text-white/25 disabled:hover:bg-blue-300/10
    {cls}"
    {disabled}
    on:click
    on:mousedown
    on:keydown
    {...$$restProps}
>
    <slot />
</button>
