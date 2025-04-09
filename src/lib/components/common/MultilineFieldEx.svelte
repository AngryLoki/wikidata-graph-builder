<svelte:options accessors />

<script lang="ts">
    let cls: string;
    export { cls as class };

    export let value: string = "";

    export const focus = () => {
        element.focus();
    };

    export const blur = () => {
        element.blur();
    };

    let element: HTMLDivElement;

    const metaKeyAllowList = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Insert",
        "PageUp",
        "PageDown",
        "a",
        "x",
        "c",
        "v",
        "z",
        "y",
    ];

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            event.preventDefault();
            return;
        }

        if (
            (event.metaKey || event.ctrlKey) &&
            !metaKeyAllowList.includes(event.key)
        ) {
            event.preventDefault();
            return;
        }
    };

    const onPaste = (event: ClipboardEvent) => {
        event.preventDefault();
        const text = event
            .clipboardData!.getData("text/plain")
            .replaceAll("\n", " ");
        document.execCommand("insertText", false, text);
    };

    const selectAll = () => {
        if (window.getSelection && document.createRange) {
            window.setTimeout(() => {
                const range = document.createRange();
                range.selectNodeContents(element);
                const sel = window.getSelection()!;
                sel.removeAllRanges();
                sel.addRange(range);
            });
        }
    };
</script>

<div
    role="textbox"
    aria-multiline="true"
    tabindex="0"
    contenteditable="true"
    class="{cls} break-words [word-break:break-word] whitespace-pre-wrap"
    on:keydown={onKeyDown}
    on:paste={onPaste}
    on:drop|preventDefault={() => {}}
    on:dragover|preventDefault={() => {}}
    on:focus={selectAll}
    on:focus
    on:blur
    on:input
    on:keydown
    bind:textContent={value}
    bind:this={element}
></div>
