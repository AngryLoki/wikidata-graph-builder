<script lang="ts">
    import type { AutocompleteItem } from "./autocomplete-input";
    import type { HTMLAnchorAttributes } from "svelte/elements";

    interface Props extends HTMLAnchorAttributes {
        item: AutocompleteItem;
        active: boolean;
    }

    let { item, active, ...rest }: Props = $props();
</script>

<!-- svelte-ignore a11y_invalid_attribute -->
<a
    href="#"
    target="_blank"
    rel="noopener noreferrer"
    class="block px-1.5 py-1
    {active ? 'bg-blue-900' : ''}"
    role="option"
    aria-selected={active}
    onmousedown={(event) => {
        event.preventDefault();
    }}
    {...rest}
>
    <span
        class="block font-medium overflow-hidden text-ellipsis whitespace-nowrap
        {active ? 'text-gray-50' : 'text-gray-100'}"
    >
        {item.value.label?.value ?? item.value.id}
        {#if item.match && item.match?.text !== item.value.label?.value}
            <i>({item.match.text})</i>
        {/if}
    </span>
    {#if item.value.description}
        <span
            class="block text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap
            {active ? 'text-gray-350' : 'text-gray-400'}"
        >
            {item.value.description.value}
        </span>
    {/if}
</a>
