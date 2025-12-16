<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Startpage - SvelteKit BetterAuth Drizzle</title>
	<meta
		name="description"
		content="Welcome to the Startpage of SvelteKit BetterAuth Drizzle application."
	/>
</svelte:head>

<h2 class="h4">Startpage</h2>
