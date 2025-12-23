import { auth } from '$lib/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { toAuthUser } from '$lib/permissions';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	event.locals.session = session?.session ?? undefined;
	event.locals.user = session?.user ?? undefined;
	event.locals.authUser = toAuthUser(session?.user ?? null);

	if (event.route.id?.startsWith('/(dash)/') && !event.locals.user) {
		throw redirect(307, '/sign-in');
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
