<script lang="ts">
	import { page } from '$app/state';
	import { useSession } from '$lib/auth-client';
	import { Github, LogIn, UsersRound } from '@lucide/svelte';

	const session = useSession();
</script>

<div class="flex flex-row-reverse flex-wrap items-center gap-4">
	{#if $session.data?.user}
		<a
			class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
			class:preset-filled-primary-200-800={page.url.pathname === '/users'}
			class:preset-tonal-primary={page.url.pathname.includes('/users')}
			aria-current={page.url.pathname === '/users'}
			href="/users"
		>
			<UsersRound size="16" />
			<span>Users</span>
		</a>
	{:else if page.url.pathname !== '/sign-in' && page.url.pathname !== '/sign-up'}
		<a
			class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
			href="/sign-in"
		>
			<LogIn size="16" />
			<span>Sign In</span>
		</a>
	{/if}
</div>
<p class="text-center">
	<a href="https://emil-devel.github.io/" target="_blank">
		<Github size={16} />
		<small>emil-devel.github.io</small>
	</a>
</p>
