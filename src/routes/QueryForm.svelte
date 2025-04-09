<script lang="ts">
    import {
        modes,
        defaultLanguage,
        defaultMode,
        getLinks,
        type AppParameters,
    } from "./app";
    import NumberInput from "$lib/components/common/NumberInput.svelte";
    import Select from "$lib/components/common/Select.svelte";
    import Button from "$lib/components/common/Button.svelte";
    import Checkbox from "$lib/components/common/Checkbox.svelte";
    import Field from "$lib/components/common/Field.svelte";
    import ItemEdit from "$lib/components/wikidata/ItemEdit.svelte";
    import ButtonsBox from "$lib/components/common/ButtonsBox.svelte";
    import LanguageEdit from "$lib/components/wikidata/LanguageEdit.svelte";
    import type { ValueItem } from "$lib/components/common/autocomplete-input";
    import InlineEdit from "$lib/components/common/InlineEdit.svelte";
    import DropdownMenu from "$lib/components/common/DropdownMenu.svelte";
    import { createEventDispatcher } from "svelte";

    import {
        queryParametersIsValid,
        type AppMode,
        type QueryParameters,
    } from "./sparql-gen";

    export let appParameters: AppParameters;

    let item: string | undefined;
    let itemObject: ValueItem | undefined;
    let property: string | undefined;
    let propertyObject: ValueItem | undefined;
    let language: string = defaultLanguage;
    let iterations: number | undefined;
    let limit: number | undefined;
    let mode: AppMode = defaultMode;
    let wdqs: string | undefined;
    let sizeProperty: string | undefined;
    let sizePropertyObject: ValueItem | undefined;
    let instanceOrSubclass = false;

    $: if (property !== "P31") {
        instanceOrSubclass = false;
    }

    $: if (instanceOrSubclass) {
        iterations = undefined;
        sizeProperty = undefined;
        sizePropertyObject = undefined;
    }

    const dispatch = createEventDispatcher();

    $: onAppParametersUpdate(appParameters);

    const onAppParametersUpdate = async (appParameters: AppParameters) => {
        ({
            item,
            property,
            language,
            iterations,
            limit,
            mode,
            wdqs,
            sizeProperty,
        } = appParameters.queryParameters);
        instanceOrSubclass =
            appParameters.queryParameters.special?.instanceOrSubclass ?? false;

        // https://github.com/sveltejs/svelte/issues/4470
        // await tick();
        // dispatch("update", appParameters);
    };

    $: formQueryParameters = {
        property: propertyObject?.id,
        item: itemObject?.id,
        language,
        iterations,
        limit,
        mode,
        wdqs,
        sizeProperty: sizePropertyObject?.id,
        special: {
            instanceOrSubclass,
        },
    } as QueryParameters;

    $: isValid = queryParametersIsValid(formQueryParameters);
    $: tools = getLinks(formQueryParameters);

    const onSubmit = () => {
        dispatch("submit", formQueryParameters);
    };
</script>

<div class="space-y-2">
    <div class="flex gap-2">
        <Field class="w-[calc(50%-0.25rem)] box-border" label="Mode">
            <Select bind:value={mode} options={modes} />
        </Field>

        <Field class="w-[calc(50%-0.25rem)] box-border" label="Language">
            <LanguageEdit bind:value={language} placeholder="Click to set" />
        </Field>
    </div>

    {#if mode === "wdqs"}
        <Field label="SPARQL query">
            <InlineEdit
                bind:value={wdqs}
                multiline={true}
                class="min-h-[8rem] font-mono text-sm"
            />
        </Field>
    {:else}
        <Field label="Traversal property">
            <ItemEdit
                bind:value={property}
                bind:valueObject={propertyObject}
                type="property"
                {language}
            />
        </Field>

        {#if property === "P31"}
            <Checkbox
                label="Instance or subclass"
                bind:value={instanceOrSubclass}
            />
        {/if}

        <Field label="Root item">
            <ItemEdit
                bind:value={item}
                bind:valueObject={itemObject}
                type="item"
                {language}
            />
        </Field>

        {#if !instanceOrSubclass}
            <Field label="Iterations">
                <NumberInput
                    bind:value={iterations}
                    min={0}
                    max={100000}
                    placeholder="Unlimited"
                    treatZeroAsUndefined={true}
                />
            </Field>

            <Field label="Size property">
                <ItemEdit
                    bind:value={sizeProperty}
                    bind:valueObject={sizePropertyObject}
                    type="property"
                    {language}
                />
            </Field>
        {/if}
    {/if}

    <ButtonsBox class="flex gap-2 pt-2">
        <Button
            on:click={onSubmit}
            disabled={!isValid}
            class="w-[calc(50%-0.25rem)]"
            primary
        >
            Build
        </Button>
        <DropdownMenu
            class="w-[calc(50%-0.25rem)]"
            title="Tools"
            links={tools}
        />
    </ButtonsBox>
</div>
