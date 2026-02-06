<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { WorkflowIcon, GlobeIcon, type Icon as IconType } from '@lucide/svelte';

	type Pages = {
		icon?: typeof IconType;
		title: string;
		href: '/test-1' | '/test-2';
	};

	const items: Pages[] = [
		{
			icon: GlobeIcon,
			title: 'Page One',
			href: '/test-1'
		},
		{
			icon: WorkflowIcon,
			title: 'Page Two',
			href: '/test-2'
		}
	];

	let { iconSize }: { iconSize?: number } = $props();
</script>

{#each items as item, i (i)}
	{@const Icon = item.icon}
	<li>
		<a
			class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
			class:preset-filled-primary-200-800={page.url.pathname === resolve(item.href)}
			class:preset-tonal-primary={page.url.pathname.includes(resolve(item.href))}
			aria-current={page.url.pathname === resolve(item.href)}
			href={resolve(item.href)}
		>
			<Icon size={iconSize} />
			<span>{item.title}</span>
		</a>
	</li>
{/each}
