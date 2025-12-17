<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
	import { LogOut, Settings, UserRound, UsersRound } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	const session = $derived(authClient.useSession());

	const logo_class = 'flex items-center gap-2';
</script>

{#snippet siteName()}
	<img src={favicon} alt="Logo: EWDnet" width="32" height="32" />
	<span>Site Name</span>
{/snippet}

<div class="flex items-center justify-between gap-4">
	<h2 class="h6 lowercase">
		<span class={logo_class}>
			{@render siteName()}
		</span>
	</h2>
	{#if $session.data?.user}
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
					{#if $session.data?.user.image}
						<img
							class="w-6"
							src={$session.data.user.image}
							alt="Avatar {$session.data.user.name}"
						/>
					{:else}
						<UserRound size="16" />
					{/if}
					{$session.data?.user.name}
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
									<button
										onclick={async () => {
											await authClient.signOut({
												fetchOptions: {
													onSuccess: () => {
														goto('/sign-in');
													}
												}
											});
										}}
										class="btn preset-filled-secondary-200-800 btn-sm"
									>
										Sign Out <LogOut size="16" />
									</button>
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
