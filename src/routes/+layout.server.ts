import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/auth';

export const load = (async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	return {
		session,
		url: event.url.pathname
	};
}) satisfies LayoutServerLoad;
