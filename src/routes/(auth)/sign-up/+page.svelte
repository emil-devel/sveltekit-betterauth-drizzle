<script lang="ts">
	import type { PageProps } from './$types';
	import { PUBLIC_SITE_NAME } from '$env/static/public';
	import { registerSchema } from '$lib/valibot';
	import { resolve } from '$app/paths';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { ArrowRight, Lock, LockOpen, LogIn, Mail, UserRound } from '@lucide/svelte';
	import { fly, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { fromAction } from 'svelte/attachments';

	let props: PageProps = $props();
	let data = $state(props.data);

	const { enhance, errors, form } = superForm(data.form, {
		validators: valibot(registerSchema)
	});

	const formErrors = $derived(
		(
			[
				$errors.name ?? [],
				$errors.email ?? [],
				$errors.password ?? [],
				$errors.passwordConfirm ?? [],
				$errors._errors ?? []
			] as string[][]
		).flat()
	);
	const enhanceAttachment = fromAction(enhance);
</script>

<svelte:head>
	<title>Sign Up - {PUBLIC_SITE_NAME}</title>
	<meta name="description" content="Create a new account on {PUBLIC_SITE_NAME}." />
</svelte:head>

<section class="mx-auto max-w-xs">
	<h1 class="flex items-center justify-end gap-2 h4">
		<LogIn />
		<span>Sign Up</span>
	</h1>
	<form class="space-y-4 py-4" method="post" {@attach enhanceAttachment}>
		<fieldset class="space-y-2">
			<label class="input-group grid-cols-[auto_1fr_auto]" for="email">
				<div class="ig-cell preset-tonal" class:text-error-500={$errors.email}>
					<Mail size="16" />
				</div>
				<input
					bind:value={$form.email}
					class="input text-sm"
					type="email"
					name="email"
					oninput={() => ($form.email = ($form.email ?? '').toLowerCase())}
					onblur={() => ($form.email = ($form.email ?? '').trim().toLowerCase())}
					aria-invalid={$errors.email ? 'true' : undefined}
					placeholder="email"
					id="email"
					spellcheck="false"
					required
				/>
			</label>
			<label class="input-group grid-cols-[auto_1fr_auto]" for="name">
				<div class="ig-cell preset-tonal" class:text-error-500={$errors.name}>
					<UserRound size="16" />
				</div>
				<input
					bind:value={$form.name}
					class="input text-sm"
					type="text"
					name="name"
					oninput={() => ($form.name = ($form.name ?? '').toLowerCase())}
					onblur={() => ($form.name = ($form.name ?? '').trim().toLowerCase())}
					aria-invalid={$errors.name ? 'true' : undefined}
					placeholder="username"
					id="name"
					spellcheck="false"
					required
				/>
			</label>
			<label class="input-group grid-cols-[auto_1fr_auto]" for="password">
				<div class="ig-cell preset-tonal" class:text-error-500={$errors.password}>
					<Lock size="16" />
				</div>
				<input
					bind:value={$form.password}
					class="input text-sm"
					type="password"
					name="password"
					aria-invalid={$errors.password ? 'true' : undefined}
					placeholder="password"
					id="password"
					required
				/>
			</label>
			<label class="input-group grid-cols-[auto_1fr_auto]" for="passwordConfirm">
				<div class="ig-cell preset-tonal" class:text-error-500={$errors._errors?.[0]}>
					<LockOpen size="16" />
				</div>
				<input
					bind:value={$form.passwordConfirm}
					class="input text-sm"
					type="password"
					name="passwordConfirm"
					aria-invalid={$errors.passwordConfirm ? 'true' : undefined}
					placeholder="password confirm"
					id="passwordConfirm"
					required
				/>
			</label>
		</fieldset>
		<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
			{#each formErrors as message, i (i)}
				<p
					class="card preset-filled-error-300-700 p-2"
					transition:slide={{ duration: 140 }}
					animate:flip={{ duration: 160 }}
				>
					{message}
				</p>
			{/each}
		</div>
		{#if formErrors.length === 0}
			<div transition:fly={{ y: 200 }}>
				<button class="btn w-full preset-filled-primary-300-700" type="submit">
					<span>Sign Up</span>
				</button>
				<p
					class="my-2 flex items-center justify-center gap-1 border-t-[.1rem] border-t-primary-200-800 py-1 text-xs"
				>
					<span>Have Account?</span>
					<ArrowRight size="12" />
					<a href={resolve('/sign-in')} class="anchor">Sign In</a>
				</p>
			</div>
		{/if}
	</form>
</section>
