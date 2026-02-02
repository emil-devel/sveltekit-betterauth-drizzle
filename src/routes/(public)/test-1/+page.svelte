<script lang="ts">
	import { PUBLIC_SITE_NAME } from '$env/static/public';
</script>

<svelte:head>
	<title>Page One (public) - {PUBLIC_SITE_NAME}</title>
	<meta
		name="description"
		content="This is Page One of the public section of {PUBLIC_SITE_NAME}."
	/>
</svelte:head>

<h1 class="h1">Page One (public)</h1>
<p>This is a public page on {PUBLIC_SITE_NAME}.</p>
