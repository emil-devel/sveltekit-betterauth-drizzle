<script lang="ts">
	import type { PageProps } from './$types';
	import { loginSchema } from '$lib/valibot';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { ArrowRight, Github, Globe, Lock, LogIn, Mail } from '@lucide/svelte';
	import { signIn } from '$lib/auth-client';
	import { fly, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let props: PageProps = $props();
	let data = $state(props.data);

	const { enhance, errors, form } = superForm(data.form, {
		validators: valibot(loginSchema)
	});

	const formErrors = $derived(([$errors.email ?? [], $errors.password ?? []] as string[][]).flat());
</script>

<svelte:head>
	<title>Sign In</title>
</svelte:head>

<section class="mx-auto max-w-xs">
	<h1 class="flex items-center justify-end gap-2 h4">
		<LogIn />
		<span>Sign In</span>
	</h1>
	<div class="space-y-2 pt-4">
		<button
			class="btn w-full preset-filled-surface-200-800 btn-sm"
			onclick={async () => {
				await signIn.social({
					provider: 'github'
				});
			}}
		>
			<Github size={16} />
			Sign In with GitHub
		</button>
		<button
			class="btn w-full preset-filled-surface-200-800 btn-sm"
			onclick={async () => {
				await signIn.social({
					provider: 'google'
				});
			}}
		>
			<!-- No Lucide Google Icon - Lucide does not accept brand logos -->
			<Globe size={16} />
			Sign In with Google
		</button>
	</div>
	<form class="space-y-4 py-4" method="post" use:enhance>
		<fieldset class="space-y-2">
			<label class="input-group grid-cols-[auto_1fr_auto]">
				<div class="ig-cell preset-tonal" class:text-error-500={$errors.email}>
					<Mail size="16" />
				</div>
				<input
					bind:value={$form.email}
					class="input text-sm"
					type="text"
					name="email"
					aria-invalid={$errors.email ? true : undefined}
					placeholder="email"
					spellcheck="false"
					required
				/>
			</label>
			<label class="input-group grid-cols-[auto_1fr_auto]">
				<div class="ig-cell preset-tonal" class:text-error-500={$errors.password}>
					<Lock size="16" />
				</div>
				<input
					bind:value={$form.password}
					class="input text-sm"
					type="password"
					name="password"
					aria-invalid={$errors.password ? true : undefined}
					placeholder="password"
					required
				/>
			</label>
		</fieldset>
		<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm">
			{#each formErrors as message, i (i)}
				<p class="card preset-filled-error-300-700 p-2" transition:slide animate:flip>
					{message}
				</p>
			{/each}
		</div>
		{#if formErrors.length === 0}
			<div transition:fly={{ y: 200 }}>
				<button class="btn w-full preset-filled-primary-300-700" type="submit">
					<span>Sign In</span>
				</button>
				<p
					class="my-2 flex items-center justify-center gap-1 border-t-[.1rem] border-t-primary-200-800 py-1 text-xs"
				>
					<span>Haven't Account?</span>
					<ArrowRight size="12" />
					<a href="/sign-up" class="anchor">Sign Up</a>
				</p>
			</div>
		{/if}
	</form>
</section>
