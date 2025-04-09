<script lang="ts">
    import { getid } from "./utils";
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends HTMLInputAttributes {
        id?: any;
        label: string;
    }

    let {
        id = getid(),
        label,
        checked = $bindable(false),
        ...rest
    }: Props = $props();
</script>

<div
    class="border-[1.99px] border-transparent px-1 leading-6 flex items-center group select-none"
>
    <input
        bind:checked
        type="checkbox"
        {id}
        class="form-checkbox w-4 h-4 rounded-sm border-[1.99px] border-gray-700 focus-visible:border-blue-600
        text-blue-600 bg-gray-850 group-hover:bg-gray-800 group-hover:checked:bg-blue-500
        focus:outline-none focus:ring-0 focus:ring-offset-0 mt-0.5 peer"
        {...rest}
    />
    <label
        for={id}
        class="pl-2 text-gray-400 group-hover:text-gray-300 peer-checked:text-gray-200"
    >
        {label}
    </label>
</div>
