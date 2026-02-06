<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Github, House, LogIn, UsersRound } from '@lucide/svelte';
	import NavPublic from '$lib/site/NavPublic.svelte';

	const iconSize = 16;
</script>

<nav class="flex flex-wrap items-center justify-between gap-8" aria-label="Footer Mainnavigation">
	<ul class="flex flex-wrap items-center gap-4">
		<li>
			<a
				class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
				class:preset-filled-primary-200-800={page.url.pathname === '/'}
				aria-current={page.url.pathname === '/'}
				href={resolve('/')}
			>
				<House size={iconSize} />
				<span>Home</span>
			</a>
		</li>
		<NavPublic {iconSize} />
	</ul>
	<ul class="flex flex-wrap items-center gap-4">
		{#if page.data.authUser}
			<li>
				<a
					class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
					class:preset-filled-primary-200-800={page.url.pathname === '/users'}
					class:preset-tonal-primary={page.url.pathname.includes('/users')}
					aria-current={page.url.pathname === '/users'}
					href={resolve('/users')}
				>
					<UsersRound size={iconSize} />
					<span>Users</span>
				</a>
			</li>
		{:else if page.url.pathname !== '/sign-in' && page.url.pathname !== '/sign-up'}
			<li>
				<a
					class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
					href={resolve('/sign-in')}
				>
					<LogIn size={iconSize} />
					<span>Sign In</span>
				</a>
			</li>
		{/if}
	</ul>
</nav>
<p class="text-center">
	<a href="https://emil-devel.github.io/" target="_blank">
		<Github size={iconSize} />
		<small>emil-devel.github.io</small>
	</a>
</p>
