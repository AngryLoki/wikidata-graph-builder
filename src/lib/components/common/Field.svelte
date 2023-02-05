<script lang="ts">
    import { setContext } from "svelte";
    import { makeid } from "./utils";

    export const id: string = makeid(10);
    export let label: string;

    let cls = "";
    export { cls as class };

    const onMousedown = (event: MouseEvent) => {
        // prevent blur for nested component, if it is focused at this moment
        const activeFieldId = document.activeElement?.id;
        if (activeFieldId === id || activeFieldId === "field-" + id) {
            event.preventDefault();
        }
    };

    setContext("field", { id });
</script>

<div class={cls}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <label
        for={id}
        class="px-1 border-transparent border-[1.99px] text-sm text-white/50 mb-0.5 font-bold"
        on:mousedown={onMousedown}
        id="label-{id}"
    >
        {label}
    </label>
    <slot />
</div>
