import type { PageServerLoad } from './$types';
import { auth } from '$lib/auth';
import { redirect } from 'sveltekit-flash-message/server';

export const load = (async (event) => {
	await auth.api.signOut({
		// This endpoint requires session cookies.
		headers: event.request.headers,
	});
	throw redirect(
		303,
		'/sign-in',
		{ type: 'info', message: 'You have been signed out.' },
		event.cookies
	);
}) satisfies PageServerLoad;
