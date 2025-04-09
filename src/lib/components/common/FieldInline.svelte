<script lang="ts">
	import { setContext, type Snippet } from "svelte";
	import { makeid } from "./utils";

	export const id: string = makeid(10);

	interface Props {
		label: string;
		class?: string;
		children?: Snippet;
	}

	let { label, class: cls = "", children }: Props = $props();

	setContext("field", { id });
</script>

<label
	class="border-[1.99px] border-transparent font-bold text-gray-400 leading-6 text-sm select-none {cls}"
	id="label-{id}"
	for={id}
>
	{label}
</label>
{@render children?.()}
