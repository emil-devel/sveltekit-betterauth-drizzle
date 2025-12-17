import type { Actions, PageServerLoad } from './$types';
import { APIError } from 'better-auth';
import { auth } from '$lib/auth';
import { loginSchema } from '$lib/valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { redirect } from 'sveltekit-flash-message/server';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const load = (async () => {
	const form = await superValidate(valibot(loginSchema));
	return { form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, valibot(loginSchema));
		const { email, password } = form.data;

		if (!form.valid) return fail(400, { form });

		const result = await db.query.user.findFirst({ where: (u) => eq(u.email, email) });

		const user = result;
		if (!user) {
			return setError(form, 'email', 'User does not exist!');
		}

		try {
			await auth.api.signInEmail({ body: { email, password } });
		} catch (error) {
			if (error instanceof APIError) {
				return fail(500, {
					form,
					message: 'An error has occurred while logging the user.',
					error: String(error)
				});
			}
		}

		throw redirect(303, '/', { type: 'info', message: 'You successfully logged in.' }, event);
	}
};
