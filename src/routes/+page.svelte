<script lang="ts">
    import { page } from "$app/stores";
    import { parseUrlParameters, updateUrl, type AppParameters } from "./app";
    import { generateQuery, type QueryParameters } from "./sparql-gen";
    import QueryForm from "./QueryForm.svelte";
    import Graph from "$lib/force-graph/Graph.svelte";
    import About from "./About.svelte";
    import { mdiMenu } from "@mdi/js";
    import IconEx from "$lib/components/common/IconEx.svelte";
    import isEqual from "lodash.isequal";
    import ViewForm from "./ViewForm.svelte";
    import type { VisParameters } from "$lib/force-graph/types";

    let query: string | undefined = undefined;

    let drawerVisible = false;

    let appParameters: AppParameters = parseUrlParameters();

    let queryParameters: QueryParameters | undefined = undefined;
    let visParameters: VisParameters = appParameters.visParameters;

    $: appParameters = parseUrlParameters($page.url.searchParams);
    $: onAppParametersUpdate(appParameters);
    $: query = generateQuery(queryParameters);

    const onAppParametersUpdate = (appParameters: AppParameters) => {
        if (!isEqual(queryParameters, appParameters.queryParameters)) {
            queryParameters = appParameters.queryParameters;
        }
        if (!isEqual(visParameters, appParameters.visParameters)) {
            visParameters = appParameters.visParameters;
        }
    };

    const rootPage = $page.url.origin + $page.url.pathname;

    const onQueryFormSubmit = async (event: CustomEvent<QueryParameters>) => {
        drawerVisible = false;
        await updateUrl(event.detail, appParameters.visParameters, false);
    };

    const onViewFormSubmit = async (event: CustomEvent<VisParameters>) => {
        await updateUrl(appParameters.queryParameters, event.detail, true);
    };
</script>

<svelte:head>
    <title>Wikidata Graph Builder</title>
</svelte:head>

<div class="h-screen max-h-screen md:flex">
    <button
        class="absolute top-6 left-0 bg-gray-800/90 w-16 h-16 md:hidden 
        flex items-center justify-center rounded-r-lg z-10
        {drawerVisible ? 'hidden' : ''}"
        on:click={() => {
            drawerVisible = !drawerVisible;
        }}
    >
        <IconEx path={mdiMenu} class="w-12 h-12 fill-white/80" />
    </button>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="absolute inset-0 bg-gray-900/80 md:hidden z-10
        {drawerVisible ? '' : 'hidden'}"
        on:click={() => {
            drawerVisible = false;
        }}
    />

    <div
        class="w-72 flex-none shadow-lg bg-gray-800/90 md:bg-gray-800 overflow-y-auto absolute left-0 top-0 bottom-0 md:static
        {drawerVisible
            ? 'translate-x-0 shadow-gray-900'
            : 'transition-transform -translate-x-full'}
        md:transform-none transition-transform md:shadow-gray-900 z-10 md:z-auto
        "
    >
        <a
            href={rootPage}
            class="block bg-indigo-700 text-indigo-100 text-xl p-3"
        >
            Wikidata Graph Builder
        </a>

        <div class="px-2 py-2">
            <QueryForm {appParameters} on:submit={onQueryFormSubmit} />
        </div>
    </div>
    <div class="md:grow overflow-auto relative h-full">
        {#if query}
            <Graph
                {query}
                rootNode={appParameters.queryParameters.item}
                visParameters={appParameters.visParameters}
            />
            <ViewForm {visParameters} on:submit={onViewFormSubmit} />
        {:else}
            <div class="grow overflow-y-auto flex items-center h-screen">
                <div class="max-w-xl mx-auto w-auto p-4">
                    <About />
                </div>
            </div>
        {/if}
    </div>
</div>
