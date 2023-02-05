<script lang="ts">
    import { searchEntities, getEntity, type ValueType } from "./item-edit";
    import AutocompleteInput from "$lib/components/common/AutocompleteInput.svelte";
    import type {
        AutocompleteFunction,
        ResolveFunction,
        ValueItem,
    } from "$lib/components/common/autocomplete-input";

    let cls = "";
    export { cls as class };

    export let id: string | undefined = undefined;
    export let value: string | undefined = undefined;
    export let valueObject: ValueItem | undefined = undefined;
    export let type: ValueType;
    export let language: string = "en";
    export let placeholder = "Click to set";

    let autocomplete: AutocompleteFunction;
    let resolve: ResolveFunction;

    $: autocomplete = (search, abortSignal) =>
        searchEntities(type, search, language, abortSignal);
    $: resolve = (value, abortSignal) =>
        getEntity(value, language, abortSignal);

    const getUrl = (value: ValueItem | undefined) => {
        let namespace = "";
        if (type === "property") {
            namespace = "Property:";
        }
        return `https://www.wikidata.org/wiki/${namespace}${value!.id}`;
    };
    const getLabel = (value: ValueItem | undefined) => {
        return value!.label?.value ?? value!.id;
    };
</script>

<AutocompleteInput
    bind:value
    bind:valueObject
    {id}
    {autocomplete}
    {resolve}
    class={cls}
    {placeholder}
    {language}
>
    <a
        slot="value"
        href={getUrl(valueObject)}
        target="_blank"
        rel="noopener noreferrer"
        class="hover:underline text-blue-500"
    >
        {getLabel(valueObject)}
    </a>
</AutocompleteInput>
