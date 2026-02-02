<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { WorkflowIcon, GlobeIcon, type Icon as IconType } from '@lucide/svelte';

	type PublicPages = {
		icon?: typeof IconType;
		title: string;
		route: '/(public)/test-1' | '/(public)/test-2';
	};

	const publicPages: PublicPages[] = [
		{
			icon: GlobeIcon,
			title: 'Page One',
			route: '/(public)/test-1',
		},
		{
			icon: WorkflowIcon,
			title: 'Page Two',
			route: '/(public)/test-2',
		},
	];

	let { iconSize }: { iconSize?: number } = $props();
</script>

{#each publicPages as item, i (i)}
	{@const Icon = item.icon}
	<li>
		<a
			class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
			class:preset-filled-primary-200-800={page.url.pathname === resolve(item.route)}
			class:preset-tonal-primary={page.url.pathname.includes(resolve(item.route))}
			aria-current={page.url.pathname === resolve(item.route)}
			href={resolve(item.route)}
		>
			<Icon size={iconSize} />
			<span>{item.title}</span>
		</a>
	</li>
{/each}
