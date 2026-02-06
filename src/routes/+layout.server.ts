import type { LayoutServerLoad } from './$types';
import { toAuthUser } from '$lib/permissions';

export const load = (async (event) => {
	event.depends('app:auth');
	const session =
		event.locals.user && event.locals.session
			? { user: event.locals.user, session: event.locals.session }
			: null;

	return {
		session,
		authUser: toAuthUser(event.locals.user ?? null),
		url: event.url.pathname
	};
}) satisfies LayoutServerLoad;
