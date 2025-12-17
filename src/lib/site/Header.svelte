<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
	import { LogOut, Settings, UserRound, UsersRound } from '@lucide/svelte';

	const logo_class = 'flex items-center gap-2';
</script>

{#snippet siteName()}
	<img src={favicon} alt="Logo: EWDnet" width="32" height="32" />
	<span>Site Name</span>
{/snippet}

<div class="flex items-center justify-between gap-4">
	<h2 class="h6 lowercase">
		{#if page.url.pathname === '/'}
			<span class={logo_class}>
				{@render siteName()}
			</span>
		{:else}
			<a href="/" class={logo_class}>
				{@render siteName()}
			</a>
		{/if}
	</h2>
	{#if page.data.session?.user}
		<nav class="flex-auto" aria-label="Hauptnavigation">
			<ul class="flex items-center justify-center gap-4">
				<li>
					<a
						class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
						href="/users"
					>
						<UsersRound size="16" />
						<span>Users</span>
					</a>
				</li>
			</ul>
		</nav>

		<div>
			<Popover>
				<Popover.Trigger
					class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
				>
					{#if page.data.session?.user.image}
						<img
							class="w-6"
							src={page.data.session.user.image}
							alt="Avatar {page.data.session.user.name}"
						/>
					{:else}
						<UserRound size="16" />
					{/if}
					{page.data.session?.user.name}
				</Popover.Trigger>
				<Portal>
					<Popover.Positioner>
						<Popover.Content class="max-w-md space-y-2 card bg-surface-100-900 p-4 shadow-xl">
							<Popover.Description>
								<ul class="list space-y-2 pb-2 text-center text-sm">
									<li><UserRound /> Role</li>
									<li><Settings /> Settings</li>
								</ul>
								<hr class="hr opacity-20" />
								<div class="border-t-2 border-t-primary-100-900 pt-2 text-center">
									<a href="/sign-out" class="btn preset-filled-secondary-200-800 btn-sm">
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
		</div>
	{/if}
</div>
