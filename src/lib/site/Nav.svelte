<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Pathname } from '$app/types';

	const getFolderNamen = async (targetOrdner: string): Promise<string[]> => {
		const url = `/api/folders?target=${encodeURIComponent(targetOrdner)}`;
		const res = await fetch(url);
		if (!res.ok) return [];
		const data = (await res.json()) as { folders?: unknown };
		return Array.isArray(data.folders)
			? (data.folders.filter((x) => typeof x === 'string') as string[])
			: [];
	};

	type Props = {
		targetOrdner: string;
	};

	let { targetOrdner } = $props() as Props;
	const resolveFolderHref = (folder: string) => resolve(`/${folder}` as Pathname);

	const folderPromise = $derived(browser ? getFolderNamen(targetOrdner) : Promise.resolve([]));
</script>

{#await folderPromise then folderNamen}
	{#each folderNamen as folder (folder)}
		<li>
			<a
				class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
				class:preset-filled-primary-200-800={page.url.pathname === `/${folder}`}
				class:preset-tonal-primary={page.url.pathname.includes(`/${folder}`)}
				aria-current={page.url.pathname === `/${folder}`}
				href={resolveFolderHref(folder)}
			>
				<span>{folder.charAt(0).toLocaleUpperCase() + folder.slice(1)}</span>
			</a>
		</li>
	{/each}
{/await}
