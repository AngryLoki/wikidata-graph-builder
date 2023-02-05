<script lang="ts">
    import { mdiMenuDown } from "@mdi/js";
    import Dropdown from "./Dropdown.svelte";
    import IconEx from "./IconEx.svelte";
    import { getid } from "./utils";
    import DropdownList from "./DropdownList.svelte";
    import Button from "./Button.svelte";
    import { tick } from "svelte";

    let cls = "";
    export { cls as class };

    export let id = getid();
    export let title: string;
    export let links: { link: string; text: string }[];

    let dropdownVisible = false;

    let dropdownRef: DropdownList;
    let triggerRef: Button;
    let itemRefs: HTMLElement[] = [];
    let ignoreNextClick = false;

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

    const openMenu = () => {
        dropdownVisible = true;

        void tick().then(() => {
            dropdownRef.focus();
        });
    };

    const onBlur = (event: FocusEvent) => {
        if (!itemRefs.includes(event.relatedTarget as HTMLElement)) {
            dropdownVisible = false;
            triggerRef.focus();
        }
    };
</script>

<Dropdown {dropdownVisible}>
    <Button
        slot="trigger"
        let:floatingRef
        use={[[floatingRef]]}
        bind:this={triggerRef}
        class={cls}
        on:click={onClick}
        on:mousedown={onMousedown}
        role="menu"
        aria-haspopup="true"
        aria-expanded={dropdownVisible}
        aria-controls="field-{id}"
        {id}
        disabled={links.length === 0}
    >
        {title}
        <IconEx
            path={mdiMenuDown}
            class="fill-current h-4 w-4 inline"
            role="presentation"
        />
    </Button>

    <DropdownList
        slot="dropdown"
        bind:this={dropdownRef}
        on:blur={onBlur}
        id="field-{id}"
        role="listbox"
        tabindex={0}
        aria-labelledby="label-{id}"
    >
        {#each links as { link, text }, idx}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <a
                bind:this={itemRefs[idx]}
                target="_blank"
                rel="noopener noreferrer"
                id="option-{id}-{idx}"
                role="menuitem"
                href={link}
                on:blur={onBlur}
                class="block px-6 py-1 cursor-default text-gray-100 hover:bg-blue-900 hover:text-gray-50"
            >
                {text}
            </a>
        {/each}
    </DropdownList>
</Dropdown>
