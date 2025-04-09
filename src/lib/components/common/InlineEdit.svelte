<script lang="ts">
    import IconEx from "./IconEx.svelte";
    import MultilineField from "./MultilineField.svelte";
    import { mdiAlertCircleOutline } from "@mdi/js";
    import { createEventDispatcher, tick } from "svelte";
    import { useActions } from "svelte-useactions";
    import type { ActionList } from "svelte-useactions";
    import type { HTMLTextareaAttributes } from "svelte/elements";
    import { browser } from "$app/environment";
    import { getid } from "./utils";

    interface $$Props extends HTMLTextareaAttributes {
        autocorrect?: "on" | "off" | "" | undefined | null;
        value?: string | undefined;
        ignoreKeyboardEvents?: boolean;
        use?: ActionList<HTMLOutputElement>;
        id?: string | undefined;
        placeholder?: string | undefined;
        class?: string | undefined;
        edit?: boolean;
        multiline?: boolean;
    }

    export let use: ActionList<HTMLOutputElement> = [];

    let cls: string | undefined = "";
    export { cls as class };

    export let id = getid();
    export let value: string | undefined = undefined;
    export let placeholder: string | undefined = "Click to set";
    export let ignoreKeyboardEvents: boolean = false;
    export const required: boolean = false;
    export let edit = false;
    export let multiline = false;

    let invalid = false;
    let editRef: MultilineField;
    let originalValue: string | undefined;

    const dispatch = createEventDispatcher();

    $: onEditChange(edit);

    const onEditChange = async (edit: boolean) => {
        if (!browser) {
            return;
        }

        if (edit) {
            originalValue = value;
            await tick();
            editRef.focus();
        } else {
            editRef?.blur();
        }
    };

    const enterEditMode = (event: MouseEvent | KeyboardEvent | FocusEvent) => {
        if (edit) {
            return;
        }

        if (event instanceof KeyboardEvent) {
            if (
                event.key === " " ||
                event.key === "Enter" ||
                event.key === "Spacebar"
            ) {
                event.preventDefault();
                event.stopPropagation();
                edit = true;
            }
        } else {
            edit = true;
        }
    };

    const onBlur = (event: FocusEvent) => {
        if (value !== originalValue) {
            dispatch("change");
        }

        edit = false;
    };

    const onKeydown = (event: KeyboardEvent) => {
        if (ignoreKeyboardEvents) {
            return;
        }

        if (event.key === "Enter") {
            if (!multiline || event.ctrlKey) {
                edit = false;
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }

        if (event.key === "Escape") {
            if (!multiline) {
                value = originalValue;
            }
            edit = false;
            event.stopPropagation();
            return;
        }
    };

    const onInput = () => {
        if (!multiline) {
            value = value!.replaceAll("\n", "");
        }
    };
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
<output
    role="button"
    use:useActions={use}
    class="flex items-stretch transition-all rounded-sm border-[1.99px] cursor-text
    text-gray-200 selection:text-gray-200 selection:bg-blue-600/60
    {/\bw-/.test(cls ?? '') ? '' : 'w-full'}
    {edit
        ? 'bg-gray-950 focus-within:bg-black hover:focus-within:bg-black ' +
          (invalid ? 'border-red-500' : 'border-gray-300/5')
        : 'bg-transparent hover:bg-gray-300/5 border-transparent hover:border-gray-300/5 nohover:bg-gray-400/5'}
    focus-within:border-blue-500 hover:focus-within:border-blue-500
    {cls}"
    on:click={enterEditMode}
    on:keydown={enterEditMode}
    on:focus={enterEditMode}
    aria-label="Edit"
    {id}
    tabindex={edit ? -1 : 0}
>
    {#if edit}
        <MultilineField
            bind:this={editRef}
            class="grow min-h-[1.5rem] pl-1 pr-4
            {invalid ? 'pr-0' : ''} 
            border-none w-full focus:outline-none focus:ring-0 bg-transparent"
            {...$$restProps}
            on:keydown={onKeydown}
            on:blur={onBlur}
            on:input={onInput}
            on:input
            on:blur
            on:keydown
            bind:value
            id="field-{id}"
            aria-multiline={multiline}
            aria-labelledby="label-{id}"
        />
        {#if invalid}
            <IconEx
                path={mdiAlertCircleOutline}
                class="flex-none w-5 h-5 mx-1 fill-red-500"
            />
        {/if}
    {:else}
        <div
            class="min-h-[1.5rem] pl-1 h-full break-words [word-break:break-word] whitespace-pre-wrap"
        >
            {#if !value}
                <span class="italic text-white/50">
                    {placeholder}
                </span>
            {:else}
                <slot>{value + "\n"}</slot>
            {/if}
        </div>
        <button
            aria-label="Edit"
            tabindex="-1"
            class="block min-w-[1rem] grow cursor-text"
        >
            &nbsp;
        </button>
    {/if}
    <slot name="editbuttons" />
</output>
