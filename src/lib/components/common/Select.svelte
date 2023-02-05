<script lang="ts">
    import { mdiCheck, mdiUnfoldMoreHorizontal } from "@mdi/js";
    import { createEventDispatcher, tick } from "svelte";
    import Dropdown from "./Dropdown.svelte";
    import IconEx from "./IconEx.svelte";
    import { getid } from "./utils";
    import DropdownList from "./DropdownList.svelte";

    let cls = "";
    export { cls as class };

    export let id = getid();
    export let value: string;

    export let options: Record<string, string>;

    const dispatch = createEventDispatcher();

    let selectedIdx: number;
    let focusedIdx: number;

    $: keys = Object.keys(options);
    $: updateSelectedIdx(keys, value);

    const updateSelectedIdx = (keys: string[], value: string) => {
        if (keys[selectedIdx] != value) {
            selectedIdx = Math.max(keys.indexOf(value), 0);
        }
    };

    let dropdownVisible = false;
    let ignoreNextClick = false;

    let dropdownRef: DropdownList;
    let triggerRef: HTMLButtonElement;
    let optionRefs: HTMLDivElement[] = [];

    const acceptHighlightedItem = () => {
        const changed = value !== keys[focusedIdx];
        value = keys[focusedIdx];
        dropdownRef.blur();

        if (changed) {
            dispatch("change");
        }
    };

    const openMenu = () => {
        dropdownVisible = true;
        focusedIdx = selectedIdx;

        void tick().then(() => {
            dropdownRef.focus();
        });
    };

    const onMousedown = () => {
        if (dropdownVisible) {
            ignoreNextClick = true;
        }
    };

    const onClick = () => {
        if (ignoreNextClick) {
            ignoreNextClick = false;
            return;
        }

        openMenu();
    };

    const onButtonKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            openMenu();
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        return;
    };

    const onDropdownKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
            if (focusedIdx > 0) {
                focusedIdx = focusedIdx - 1;
                updateScroll();
            }
        } else if (event.key === "ArrowDown") {
            if (focusedIdx < keys.length - 1) {
                focusedIdx = focusedIdx + 1;
                updateScroll();
            }
        } else if (event.key === "Home") {
            focusedIdx = 0;
            updateScroll();
        } else if (event.key === "End") {
            focusedIdx = keys.length - 1;
            updateScroll();
        } else if (
            event.key === "Enter" ||
            event.key === "Spacebar" ||
            event.key === " "
        ) {
            if (focusedIdx < keys.length) {
                acceptHighlightedItem();
            }
        } else if (event.key === "Escape") {
            dropdownRef.blur();
        }

        event.preventDefault();
        event.stopPropagation();
        return;
    };

    const onBlur = () => {
        dropdownVisible = false;
        triggerRef.focus();
    };

    const updateScroll = () => {
        dropdownRef?.scrollToFit(optionRefs[focusedIdx]);
    };
</script>

<Dropdown onComputed={updateScroll} {dropdownVisible}>
    <button
        slot="trigger"
        let:floatingRef
        use:floatingRef
        bind:this={triggerRef}
        class="block relative border-[1.99px] w-full text-left transition-colors
        group cursor-default rounded-sm text-gray-200
        pl-1 pr-5
        truncate
        focus-visible:outline-none focus-visible:border-blue-500
        {dropdownVisible
            ? 'border-blue-500 bg-black/10'
            : 'bg-transparent hover:bg-white/5 border-transparent hover:border-white/5'}
            {cls}"
        on:click={onClick}
        on:keydown={onButtonKeyDown}
        on:mousedown={onMousedown}
        role="combobox"
        aria-haspopup="true"
        aria-expanded={dropdownVisible}
        aria-controls="field-{id}"
        {id}
    >
        {options[value]}
        <IconEx
            path={mdiUnfoldMoreHorizontal}
            class="fill-gray-400 h-4 w-4 absolute top-1 right-0 transition-opacity
            {dropdownVisible
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}"
            role="presentation"
        />
    </button>

    <DropdownList
        slot="dropdown"
        bind:this={dropdownRef}
        id="field-{id}"
        role="listbox"
        aria-labelledby="label-{id}"
        aria-orientation="vertical"
        aria-activedescendant="option-{id}-{focusedIdx}"
        tabindex={0}
        on:blur={onBlur}
        on:keydown={onDropdownKeyDown}
    >
        {#each keys as key, idx}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                bind:this={optionRefs[idx]}
                id="option-{id}-{idx}"
                role="option"
                aria-selected={idx === selectedIdx}
                on:click={acceptHighlightedItem}
                on:mouseenter={() => {
                    focusedIdx = idx;
                }}
                class="block px-6 py-1 cursor-default whitespace-nowrap
                {idx === focusedIdx
                    ? 'bg-blue-900 text-gray-50'
                    : 'text-gray-100'}
                {idx === selectedIdx ? 'relative' : ''}"
            >
                {options[key]}
                {#if idx === selectedIdx}
                    <IconEx
                        path={mdiCheck}
                        class="absolute left-0.5 top-1.5 w-5 h-5 fill-gray-100"
                    />
                {/if}
            </div>
        {/each}
    </DropdownList>
</Dropdown>
