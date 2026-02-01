<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Github, House, LogIn } from '@lucide/svelte';
	import Nav from './Nav.svelte';
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
				<House size="16" />
				<span>Home</span>
			</a>
		</li>
	</ul>
	<ul class="flex flex-wrap items-center gap-4">
		{#if page.data.authUser}
			<Nav targetOrdner="(dash)" />
		{:else if page.url.pathname !== '/sign-in' && page.url.pathname !== '/sign-up'}
			<li>
				<a
					class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
					href={resolve('/sign-in')}
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
