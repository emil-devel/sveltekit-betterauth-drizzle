<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { canManageUser, isAdmin as isAdminUtil, isSelf as isSelfUtil } from '$lib/permissions';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { userEmailSchema, userNameSchema } from '$lib/valibot';
	import { Avatar, Switch } from '@skeletonlabs/skeleton-svelte';
	import { scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import {
		ArrowBigLeft,
		Mail,
		UserRound,
		UserRoundCheck,
		UserRoundPen,
		UserRoundX
	} from '@lucide/svelte';
	const iconSize: number = 16;

	import { ROLES } from '$lib/permissions';
	const roles = ROLES;

	let props: PageProps = $props();
	let data = $state(props.data);

	const { id, name, email, avatar, createdAt, updatedAt } = data;
</script>

<svelte:head>
	<title>Seiten Titel</title>
	<meta name="description" content="Seiten Beschreibung" />
</svelte:head>

<section class="m-auto max-w-sm space-y-4">
	<div
		class="block max-w-md divide-y divide-surface-200-800 card border border-surface-200-800 preset-filled-surface-100-900"
	>
		<header class="flex flex-row-reverse items-center justify-between gap-4 p-4">
			<h2 class="h4">
				<span>
					<UserRoundCheck size={32} />
					{name}
				</span>
			</h2>
			<div class="mt-6 -mb-16 h-24 w-24 rounded-full border-6">
				<Avatar class="h-full w-full bg-surface-100-900">
					<Avatar.Image src={data.avatar} alt="Avatar of the user {name}" />
					<Avatar.Fallback>
						<span class="text-4xl">{name?.at(0)?.toUpperCase()}</span>
					</Avatar.Fallback>
				</Avatar>
			</div>
		</header>
		<article class="p-4 pb-8">
			<div class="space-y-8">
				<h1 class="h-10 text-right h6 lowercase">user</h1>

				<div>
					<p class="label-text">Email</p>
					<div class="input-group grid-cols-[auto_1fr_auto]">
						<div class="ig-cell preset-tonal py-1.5"><Mail /></div>
						<span class="ig-input text-sm">
							<a href="mailto:{email}">{email}</a>
						</span>
					</div>
				</div>
			</div>
		</article>
		<footer class="mt-4 flex flex-row-reverse items-center justify-between gap-4 px-4 pb-4">
			<small class="opacity-60">Registered: {createdAt}</small>
			{#if updatedAt !== createdAt}
				<small class="opacity-60">Updated: {updatedAt}</small>
			{/if}
		</footer>
	</div>
	<div class="mt-8 flex items-center justify-between gap-4 border-t border-surface-200-800 p-2">
		<a class="btn preset-tonal btn-sm" href="/users">
			<ArrowBigLeft size={iconSize} />
			Users
		</a>
	</div>
</section>
