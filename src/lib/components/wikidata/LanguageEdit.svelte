<script lang="ts">
    import { languageSearch, resolveLanguage } from "./language-edit";
    import AutocompleteInput from "$lib/components/common/AutocompleteInput.svelte";
    import type { ValueItem } from "$lib/components/common/autocomplete-input";

    let cls = "";
    export { cls as class };

    export let id: string | undefined = undefined;
    export let value: string | undefined = undefined;
    export let valueObject: ValueItem | undefined = undefined;
    export let placeholder = "Select language";
</script>

<AutocompleteInput
    bind:value
    bind:valueObject
    {id}
    autocomplete={languageSearch}
    resolve={resolveLanguage}
    class={cls}
    {placeholder}
/>
