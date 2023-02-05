<script lang="ts">
	import { setContext } from "svelte";
	import { makeid } from "./utils";

	export const id: string = makeid(10);
	export let label: string;

	let cls = "";
	export { cls as class };

	setContext("field", { id });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="border-[1.99px] border-transparent font-bold text-gray-400 leading-6 text-sm select-none {cls}"
	id="label-{id}"
>
	{label}
</div>
<slot />
