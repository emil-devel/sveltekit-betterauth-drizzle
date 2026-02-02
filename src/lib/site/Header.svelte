<script lang="ts">
	import type { AuthUser } from '$lib/permissions';
	import { PUBLIC_SITE_NAME } from '$env/static/public';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import NavPublic from '$lib/site/NavPublic.svelte';
	import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
	import { House, LogOut, Settings, UserRound, UsersRound } from '@lucide/svelte';
	const iconSize = 16;

	const logo_class = 'flex items-center gap-2';

	const authUser = $derived(page.data.authUser as AuthUser | null | undefined);
</script>

{#snippet siteName()}
	<img src={favicon} alt="Logo: EWDnet" width="32" height="32" />
	<span class="hidden sm:inline-block">{PUBLIC_SITE_NAME}</span>
{/snippet}

<div class="flex items-center justify-between gap-4">
	<h2 class="h6 lowercase">
		{#if page.url.pathname === '/'}
			<span class={logo_class}>
				{@render siteName()}
			</span>
		{:else}
			<a
				class={logo_class}
				href={resolve('/')}
				title="Back to startpage"
				aria-label="Back to startpage"
			>
				{@render siteName()}
			</a>
		{/if}
	</h2>
	<nav class="flex-auto" aria-label="Hauptnavigation">
		<ul class="flex items-center justify-center gap-4">
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
	</nav>
	<div>
		{#if page.data.session}
			<Popover>
				<Popover.Trigger
					class="btn btn-sm {authUser?.role === 'USER'
						? 'preset-filled-success-200-800'
						: ''} {authUser?.role === 'REDACTEUR'
						? 'preset-filled-warning-200-800'
						: ''} {authUser?.role === 'ADMIN' ? 'preset-filled-error-200-800' : ''}"
				>
					{#if page.data.session.user.image}
						<img
							src={page.data.session.user.image}
							alt="Avatar of the user {page.data.session.user.name}"
							class="h-5 w-5 rounded-full"
						/>
					{:else}
						<UserRound size="16" />
					{/if}
					{authUser?.name ?? page.data.session.user.name}
				</Popover.Trigger>
				<Portal>
					<Popover.Positioner>
						<Popover.Content class="max-w-md space-y-2 card bg-surface-100-900 p-4 shadow-xl">
							<Popover.Description>
								<ul class="list space-y-2 pb-2 text-center text-sm">
									<li
										class:text-success-500={authUser?.role === 'USER'}
										class:text-warning-500={authUser?.role === 'REDACTEUR'}
										class:text-error-500={authUser?.role === 'ADMIN'}
									>
										<UserRound size={iconSize} />
										<span>{(authUser?.role ?? page.data.session.user.role).toLowerCase()}</span>
									</li>
									{#if authUser?.role === 'ADMIN' && page.url.pathname !== '/users'}
										<li>
											<a class="anchor" href={resolve('/users')}>
												<UsersRound size={iconSize} />
												<span>Manage users</span>
											</a>
										</li>
									{/if}
									{#if authUser?.name && page.url.pathname !== `/users/${authUser.name}`}
										<li>
											<a class="anchor" href={resolve(`/users/${authUser.name}`)}>
												<Settings size={iconSize} />
												<span>Settings</span>
											</a>
										</li>
									{/if}
								</ul>
								<hr class="hr opacity-20" />
								<div class="border-t-2 border-t-primary-100-900 pt-2 text-center">
									<a class="btn preset-filled-secondary-200-800 btn-sm" href={resolve('/sign-out')}>
										Sign Out <LogOut size="16" />
									</a>
								</div>
							</Popover.Description>
							<Popover.Arrow
								style="--arrow-size: calc(var(--spacing) * 2); --arrow-background: var(--color-surface-100-900);"
							>
								<Popover.ArrowTip />
							</Popover.Arrow>
						</Popover.Content>
					</Popover.Positioner>
				</Portal>
			</Popover>
		{/if}
	</div>
</div>
