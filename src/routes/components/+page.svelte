<script lang="ts">
    import MultilineField from "$lib/components/common/MultilineField.svelte";
    import MultilineFieldEx from "$lib/components/common/MultilineFieldEx.svelte";
    import InlineEdit from "$lib/components/common/InlineEdit.svelte";
    import Heading2 from "$lib/components/common/Heading2.svelte";
    import Skeleton from "$lib/components/common/Skeleton.svelte";
    import NumberInput from "$lib/components/common/NumberInput.svelte";
    import ItemEdit from "$lib/components/wikidata/ItemEdit.svelte";
    import LanguageEdit from "$lib/components/wikidata/LanguageEdit.svelte";

    import type { ValueItem } from "$lib/components/common/autocomplete-input";
    import Select from "$lib/components/common/Select.svelte";
    import DropdownMenu from "$lib/components/common/DropdownMenu.svelte";
    import Checkbox from "$lib/components/common/Checkbox.svelte";
    import ColorInput from "$lib/components/common/ColorInput.svelte";
    import Spinner from "$lib/components/common/Spinner.svelte";

    let value: string | undefined =
        "xxx     xxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

    let item: string = "Q180912";
    let language = "ru";

    let itemValue: ValueItem;

    let numberValue = 123;
    let zeroValue = 0;

    const options: Record<string, string> = Object.fromEntries(
        Array.from(Array(100), (_, i) => [`option${i + 1}`, `Option ${i + 1}`]),
    );
    let option = "option1";

    let color = "#000000ff";
</script>

<Heading2>Multiline edit fields</Heading2>

<div class="container flex gap-2">
    <MultilineFieldEx
        class="w-1/2 flex-none bg-black rounded p-4 self-start"
        bind:value
        on:input={() => console.log("input")}
        on:focus={() => console.log("focus")}
        on:blur={() => console.log("blur")}
        on:keydown={() => console.log("keydown")}
    />
    <MultilineField
        class="w-1/2 flex-none bg-black rounded p-4 block self-start"
        bind:value
        on:input={() => console.log("input")}
        on:focus={() => console.log("focus")}
        on:blur={() => console.log("blur")}
        on:keydown={() => console.log("keydown")}
    />
</div>

<div class="container flex gap-2">
    <div
        class="w-1/2 flex-none bg-black rounded p-4 self-start break-words [word-break:break-word] whitespace-pre-wrap"
    >
        {value + "\n"}
    </div>
    <div
        class="w-1/2 flex-none bg-black rounded p-4 self-start break-words [word-break:break-word] whitespace-pre-wrap"
    >
        {value + "\n"}
    </div>
</div>

<Heading2>Inline edit fields</Heading2>
<div class="flex gap-2">
    <InlineEdit
        bind:value
        on:input={() => console.log("input")}
        on:focus={() => console.log("focus")}
        on:blur={() => console.log("blur")}
        on:keydown={() => console.log("keydown")}
        placeholder="placeholder"
    />
    <InlineEdit
        bind:value
        on:input={() => console.log("input")}
        on:focus={() => console.log("focus")}
        on:blur={() => console.log("blur")}
        on:keydown={() => console.log("keydown")}
        placeholder="placeholder"
        multiline={true}
    />
</div>

<p>Empty field:</p>
<InlineEdit placeholder="I am empty!" />

<Heading2>Item edit fields</Heading2>
<div class="md:flex w-full flex-row gap-2">
    <InlineEdit bind:value={language} class="w-14 flex-none" />
    <ItemEdit
        class="grow"
        type="item"
        bind:value={item}
        bind:valueObject={itemValue}
    />
    <ItemEdit
        class="grow"
        type="item"
        bind:value={item}
        bind:valueObject={itemValue}
    />
    <ItemEdit class="grow" type="item" bind:value={item} {language} />
</div>
<pre class="whitespace-pre-wrap overflow-y-auto">value={item}
valueObject={JSON.stringify(itemValue)}</pre>

<Heading2>Number edit fields</Heading2>
<div class="md:flex flex-row gap-2">
    <NumberInput bind:value={numberValue} />
    <NumberInput bind:value={numberValue} />
</div>

<Heading2>Language edit fields</Heading2>
<div class="md:flex flex-row gap-2">
    <LanguageEdit bind:value={language} />
    <LanguageEdit bind:value={language} />
</div>
<pre class="whitespace-pre-wrap">language={JSON.stringify(language)}</pre>

<Heading2>Number edit fields</Heading2>
<div class="md:flex flex-row gap-2">
    <NumberInput
        bind:value={numberValue}
        on:change={() => {
            console.log("changed!");
        }}
    />
    <NumberInput bind:value={numberValue} />
</div>

<div>Treat zero as undefined</div>
<div class="flex">
    <NumberInput
        class="flex-none w-64"
        bind:value={numberValue}
        treatZeroAsUndefined={true}
    />
    <output class="grow">=> {numberValue}</output>
</div>
<div class="flex">
    <NumberInput
        class="flex-none w-64"
        bind:value={zeroValue}
        treatZeroAsUndefined={true}
    />
    <output class="grow">=> {zeroValue}</output>
</div>

<Heading2>Skeletons</Heading2>
<div>
    AaAa...
    <Skeleton
        class="bg-blue-500 {['w-16', 'w-20', 'w-24', 'w-28', 'w-32'][
            Math.floor(Math.random() * 5)
        ]}"
    />
    天地玄黄
    <Skeleton
        class="bg-gray-500 {['w-16', 'w-20', 'w-24', 'w-28', 'w-32'][
            Math.floor(Math.random() * 5)
        ]}"
    />
    ...
    <Skeleton
        class="bg-blue-500/70 {['w-16', 'w-20', 'w-24', 'w-28', 'w-32'][
            Math.floor(Math.random() * 5)
        ]}"
    />
</div>

<Heading2>Select</Heading2>
<div class="flex">
    <Select bind:value={option} {options} />
    <Select bind:value={option} {options} />
</div>

<Heading2>Dropdown menu</Heading2>
<DropdownMenu
    title="Actions"
    class="w-32"
    links={[
        {
            text: "This is a very long action",
            link: "http://localhost:5173/components",
        },
        {
            text: "This is a very long action",
            link: "http://localhost:5173/components",
        },
    ]}
/>

<Heading2>Checkbox</Heading2>
<Checkbox label="Actions" />

<Heading2>Color picker</Heading2>
<ColorInput bind:value={color} />
{color}

<Heading2>Loading</Heading2>
<Spinner />
<Spinner class="h-32 w-32" />
