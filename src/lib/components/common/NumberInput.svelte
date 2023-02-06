<script lang="ts">
    import { mdiMinus, mdiPlus } from "@mdi/js";
    import { createEventDispatcher } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";
    import IconEx from "./IconEx.svelte";
    import InlineEdit from "./InlineEdit.svelte";
    import { taphold } from "./taphold";
    import { getid } from "./utils";
    interface $$Props extends HTMLInputAttributes {
        id?: string | undefined;
        value?: number | undefined;
        class?: string;
        min?: number | undefined;
        max?: number | undefined;
        treatZeroAsUndefined?: boolean;
        required?: boolean;
        edit?: boolean;
    }

    export let id = getid();
    export let value: number | undefined = undefined;
    export let min: number | undefined = 0;
    export let max: number | undefined = Number.MAX_SAFE_INTEGER;
    export let treatZeroAsUndefined = false;
    export let required = false;
    export let edit = false;

    let cls = "";
    export { cls as class };

    let textValue: string | undefined;

    let onBlur = () => {
        value = valueFromText(textValue);
    };

    const dispatch = createEventDispatcher();
    const valueToText = (
        value: number | undefined,
        treatZeroAsUndefined: boolean
    ) => {
        if (treatZeroAsUndefined && value === 0) {
            return undefined;
        } else {
            return value?.toString();
        }
    };

    const valueFromText = (textValue: string | undefined) => {
        if (!textValue && required) {
            return Math.max(min ?? 0, 0);
        }

        if (!textValue || (textValue === "0" && treatZeroAsUndefined)) {
            return undefined;
        } else {
            let value = Number(textValue);
            if (min !== undefined) {
                value = Math.max(value, min);
            }
            if (max !== undefined) {
                value = Math.min(value, max);
            }
            if (treatZeroAsUndefined && value === 0) {
                return undefined;
            }
            return value;
        }
    };

    const onInput = () => {
        textValue = textValue!.replaceAll(/\D/g, "");
        value = valueFromText(textValue);
        textValue = valueToText(value, false);
    };

    const onIncrement = (event: Event) => {
        let newValue = valueFromText(textValue);
        if (newValue === undefined) {
            newValue = min ?? Math.min(0, max ?? 0);
        }

        if (max === undefined) {
            newValue = newValue + 1;
        } else {
            newValue = Math.min(newValue + 1, max);
        }

        const changed = value !== newValue;
        value = newValue;
        textValue = valueToText(newValue, treatZeroAsUndefined);
        event.stopPropagation();
        event.preventDefault();

        if (!edit && changed) {
            dispatch("change");
        }
    };

    const onDecrement = (event: Event) => {
        let newValue = valueFromText(textValue);
        if (newValue === undefined) {
            newValue = min ?? Math.min(0, max ?? 0);
        }

        if (min === undefined) {
            newValue = newValue - 1;
        } else {
            newValue = Math.max(newValue - 1, min);
        }

        const changed = value !== newValue;
        value = newValue;
        textValue = valueToText(newValue, treatZeroAsUndefined);

        event.preventDefault();
        event.stopPropagation();

        if (!edit && changed) {
            dispatch("change");
        }
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
            onIncrement(event);
            return;
        }

        if (event.key === "ArrowDown") {
            onDecrement(event);
            return;
        }
    };

    $: textValue = valueToText(value, treatZeroAsUndefined);
    $: canDecrement = min === undefined || (value !== undefined && value > min);
    $: canIncrement = max === undefined || value === undefined || value < max;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<InlineEdit
    bind:edit
    {id}
    bind:value={textValue}
    class="group {cls}"
    on:input={onInput}
    on:blur={onBlur}
    on:keydown={onKeyDown}
    on:change
    inputmode="numeric"
    role="spinbutton"
    aria-valuenow={value}
    aria-valuemin={min}
    aria-valuemax={max}
    {...$$restProps}
>
    <svelte:fragment slot="editbuttons">
        <button
            use:taphold={onDecrement}
            on:click={(event) => {
                event.stopPropagation();
                event.preventDefault();
            }}
            aria-disabled={!canDecrement}
            tabindex="-1"
            class="w-6 flex-none flex justify-center items-center
            {canDecrement
                ? 'cursor-pointer hover:bg-gray-300/5'
                : 'cursor-default'}
            {edit
                ? 'opacity-100'
                : 'opacity-0 nohover:opacity-100 group-hover:opacity-100'}
            transition-opacity"
        >
            <IconEx
                class="w-5 h-5 fill-current {canDecrement ? '' : 'opacity-30'}"
                path={mdiMinus}
            />
        </button>
        <button
            use:taphold={onIncrement}
            on:click={(event) => {
                event.stopPropagation();
                event.preventDefault();
            }}
            aria-disabled={!canIncrement}
            tabindex="-1"
            class="w-6 flex-none flex justify-center items-center 
            {canIncrement
                ? 'cursor-pointer hover:bg-gray-300/5'
                : 'cursor-default'}
            {edit
                ? 'opacity-100'
                : 'opacity-0 nohover:opacity-100 group-hover:opacity-100'}
            transition-opacity"
        >
            <IconEx
                class="w-5 h-5 fill-current {canIncrement ? '' : 'opacity-30'}"
                path={mdiPlus}
            />
        </button>
    </svelte:fragment>
</InlineEdit>
