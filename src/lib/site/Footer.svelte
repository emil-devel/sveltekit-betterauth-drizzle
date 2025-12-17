<script lang="ts">
	import { page } from '$app/state';
	import { Github, House, LogIn, UsersRound } from '@lucide/svelte';
</script>

<nav class="flex flex-wrap items-center justify-between gap-8" aria-label="Footer Mainnavigation">
	<ul class="flex flex-wrap items-center gap-4">
		<li>
			<a
				class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
				class:preset-filled-primary-200-800={page.url.pathname === '/'}
				aria-current={page.url.pathname === '/'}
				href="/"
			>
				<House size="16" />
				<span>Home</span>
			</a>
		</li>
	</ul>
	<ul class="flex flex-wrap items-center gap-4">
		{#if page.data.session?.user}
			<li>
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
			</li>
		{:else if page.url.pathname !== '/sign-in' && page.url.pathname !== '/sign-up'}
			<li>
				<a
					class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
					href="/sign-in"
				>
					<LogIn size="16" />
					<span>Sign In</span>
				</a>
			</li>
		{/if}
	</ul>
</nav>
<p class="text-center">
	<a href="https://emil-devel.github.io/" target="_blank">
		<Github size={16} />
		<small>emil-devel.github.io</small>
	</a>
</p>
