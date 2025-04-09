<script lang="ts">
    import IntersectionObserver from "svelte-intersection-observer";
    import InlineEdit from "$lib/components/common/InlineEdit.svelte";
    import AutocompleteItemBlock from "./AutocompleteItemBlock.svelte";
    import Skeleton from "$lib/components/common/Skeleton.svelte";
    import DropdownList from "$lib/components/common/DropdownList.svelte";
    import { tick } from "svelte";
    import type {
        AutocompleteFunction,
        AutocompleteItem,
        LoadMoreFunction,
        ResolveFunction,
        ValueItem,
    } from "./autocomplete-input";
    import Dropdown from "./Dropdown.svelte";

    let cls = "";
    export { cls as class };

    export let value: string | undefined = undefined;
    export let valueObject: ValueItem | undefined = undefined;

    export let id: string | undefined = undefined;
    export let placeholder = "Click to set";
    export let autocomplete: AutocompleteFunction;
    export let resolve: ResolveFunction;
    export let language: string | undefined = undefined;

    let loadMoreAreaRef: HTMLDivElement;
    let dropdownRef: DropdownList;
    let loadMoreAreaVisible = false;
    let fieldValue: string | undefined;

    let autocompleteItems: AutocompleteItem[] | undefined;
    let loadMore: LoadMoreFunction;
    let edit = false;

    let abortController: AbortController | undefined;
    let resolveAbortController: AbortController | undefined;

    let activeAutocompleteItem = 0;

    $: onValueUpdate(value, resolve);

    const onValueUpdate = async (
        value: string | undefined,
        resolve: ResolveFunction,
    ) => {
        if (value === undefined) {
            valueObject = undefined;
            return;
        }

        if (value === valueObject?.id && language === valueObject.language) {
            return;
        }

        valueObject = undefined;

        resolveAbortController?.abort();
        resolveAbortController = new AbortController();
        try {
            valueObject = await resolve(value, resolveAbortController.signal);
        } catch (error_: unknown) {
            if ((error_ as Error).name !== "AbortError") {
                throw error_;
            }
            return;
        } finally {
            resolveAbortController = undefined;
        }

        if (valueObject === undefined) {
            value = undefined;
        }
    };

    const abort = () => {
        if (abortController) {
            abortController.abort();
            abortController = undefined;
        }
    };

    const labelFn = (value: ValueItem) => {
        return value?.label?.value ?? value?.id;
    };

    const updateFieldValue = (valueObject: ValueItem | undefined) => {
        fieldValue = valueObject ? labelFn(valueObject) : value;
    };

    $: updateFieldValue(valueObject);
    $: !edit && abort();

    const acceptItem = (newValue: ValueItem | undefined) => {
        abort();
        autocompleteItems = loadMore = undefined;
        if (valueObject?.id !== newValue?.id) {
            value = newValue?.id;
            valueObject = newValue;
        }
        edit = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (!autocompleteItems) {
            if (event.key === "Enter") {
                if (!fieldValue) {
                    acceptItem(undefined);
                } else if (valueObject && fieldValue === labelFn(valueObject)) {
                    acceptItem(valueObject);
                }
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (event.key === "Escape") {
                acceptItem(valueObject);
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            return;
        }

        if (event.key === "ArrowUp") {
            if (activeAutocompleteItem > 0) {
                activeAutocompleteItem = activeAutocompleteItem - 1;
            }
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (event.key === "ArrowDown") {
            if (activeAutocompleteItem < autocompleteItems.length - 1) {
                activeAutocompleteItem = activeAutocompleteItem + 1;
            }
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (event.key === "Enter") {
            if (activeAutocompleteItem < autocompleteItems.length) {
                acceptItem(autocompleteItems[activeAutocompleteItem].value);
            }
            event.stopPropagation();
            event.preventDefault();
            return;
        }

        if (event.key === "Escape") {
            event.stopPropagation();
            event.preventDefault();
            edit = false;
            return;
        }
    };

    const onInput = async () => {
        abort();

        if (!fieldValue) {
            autocompleteItems = loadMore = undefined;
            return;
        }

        try {
            abortController = new AbortController();
            ({ autocompleteItems, loadMore } = await autocomplete(
                fieldValue,
                abortController.signal,
            ));
            activeAutocompleteItem = 0;
        } catch (error_: unknown) {
            if ((error_ as Error).name !== "AbortError") {
                throw error_;
            }
            return;
        } finally {
            abortController = undefined;
        }
    };

    const onBlur = () => {
        abort();
        if (!fieldValue) {
            acceptItem(undefined);
        }
        updateFieldValue(valueObject);
        autocompleteItems = undefined;
        loadMore = undefined;
    };

    const onLoadMore = async () => {
        if (!loadMore) {
            return;
        }
        const load = loadMore;
        loadMore = undefined;

        let newAutocompleteItems: AutocompleteItem[] = [];

        abort();
        abortController = new AbortController();
        try {
            ({ autocompleteItems: newAutocompleteItems, loadMore } = await load(
                abortController.signal,
            ));
        } catch (error_: unknown) {
            if ((error_ as Error).name !== "AbortError") {
                throw error_;
            }
            return;
        } finally {
            abortController = undefined;
        }

        const existingItems = new Set(
            autocompleteItems!.map((item) => item.value.id),
        );

        newAutocompleteItems = newAutocompleteItems.filter(
            (item) => !existingItems.has(item.value.id),
        );

        const originalScroll = dropdownRef.getScrollTop();
        autocompleteItems = [...autocompleteItems!, ...newAutocompleteItems];
        await tick();
        dropdownRef.setScrollTop(originalScroll);

        // await new Promise((resolve) => {
        //     setTimeout(() => {
        //         resolve(undefined);
        //     }, 100);
        // });

        // if (loadMoreAreaVisible) {
        //     onLoadMore();
        // }
    };
</script>

<Dropdown dropdownVisible={autocompleteItems !== undefined}>
    <InlineEdit
        slot="trigger"
        let:floatingRef
        use={[[floatingRef]]}
        {id}
        bind:value={fieldValue}
        bind:edit
        on:keydown={onKeyDown}
        on:input={onInput}
        on:blur={onBlur}
        class={cls}
        ignoreKeyboardEvents={true}
        spellcheck="false"
        aria-haspopup="true"
        autocapitalize="none"
        autocomplete="off"
        autocorrect="off"
        role="combobox"
        aria-expanded={autocompleteItems !== undefined && edit}
        aria-controls="listbox-{id}"
        aria-activedescendant={autocompleteItems
            ? `option-${id}-${activeAutocompleteItem}`
            : undefined}
        aria-autocomplete="list"
    >
        {#if valueObject !== undefined}
            <slot name="value">{labelFn(valueObject)}</slot>
        {:else if value === undefined}
            <span class="italic text-white/40">{placeholder}</span>
        {:else}
            <Skeleton
                class="bg-blue-500/70 {['w-16', 'w-20', 'w-24', 'w-28', 'w-32'][
                    Math.floor(Math.random() * 5)
                ]}"
            />
        {/if}
    </InlineEdit>

    <DropdownList
        slot="dropdown"
        bind:this={dropdownRef}
        id="listbox-{id}"
        role="listbox"
        aria-labelledby="label-{id}"
    >
        {#if autocompleteItems?.length}
            <div class="relative">
                <IntersectionObserver
                    element={loadMoreAreaRef}
                    bind:intersecting={loadMoreAreaVisible}
                    on:intersect={onLoadMore}
                >
                    <div
                        bind:this={loadMoreAreaRef}
                        class="h-16 absolute bottom-0 left-0 right-0 pointer-events-none"
                    ></div>
                </IntersectionObserver>

                {#each autocompleteItems as item, idx (item.value.id)}
                    <AutocompleteItemBlock
                        id="option-{id}-{idx}"
                        {item}
                        active={idx === activeAutocompleteItem}
                        onmouseenter={() => {
                            activeAutocompleteItem = idx;
                        }}
                        onclick={(event) => {
                            acceptItem(item.value);
                            event.preventDefault();
                        }}
                    />
                {/each}
            </div>
        {:else}
            <div class="text-white">No items found</div>
        {/if}
    </DropdownList>
</Dropdown>
