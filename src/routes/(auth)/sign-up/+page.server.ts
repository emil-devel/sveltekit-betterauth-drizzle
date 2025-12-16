import type { Actions, PageServerLoad } from './$types';
import { registerSchema } from '$lib/valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { redirect } from 'sveltekit-flash-message/server';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { signUp } from '$lib/auth-client';
import { auth } from '$lib/auth';

export const load = (async () => {
	const form = await superValidate(valibot(registerSchema));
	return { form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, valibot(registerSchema));
		const { name, email, password } = form.data;
		let image: string | undefined;

		if (!form.valid) return fail(400, { form });

		const userExists = await db.query.user.findFirst({ where: (u) => eq(u.name, name) });
		if (userExists) return setError(form, 'name', 'Username already exist!');

		const emailExist = await db.query.user.findFirst({ where: (u) => eq(u.email, email) });
		if (emailExist) return setError(form, 'email', 'Email already in use!');

		try {
			await signUp.email({ name, email, password, image });
			await auth.api.signUpEmail({
				body: { name, email, password, image }
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(500, {
					form,
					message: 'An error has occurred while creating the user.',
					error: String(error)
				});
			}
		}

		redirect(
			'/sign-in',
			{ type: 'success', message: 'You are now registered and can log in.' },
			event.cookies
		);
	}
};
