import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/auth';
import { loginSchema } from '$lib/valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { redirect } from 'sveltekit-flash-message/server';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { sanitizeFormData } from '$lib/sanitizer';

export const load = (async () => {
	const form = await superValidate(valibot(loginSchema));
	return { form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const data = sanitizeFormData(formData, { lowercase: ['email'] });
		const form = await superValidate(data, valibot(loginSchema));
		const { email, password } = form.data;

		if (!form.valid) return fail(400, { form });

		const result = await db.query.user.findFirst({ where: (u) => eq(u.email, email) });

		const user = result;
		if (!user) {
			return setError(form, 'email', 'User email does not exist!');
		}

		try {
			await auth.api.signInEmail({ body: { email, password } });
		} catch (err) {
			// Under pnpm, `instanceof APIError` can be unreliable (multiple module instances).
			// Better Auth throws Better Call's APIError, which has `name === "APIError"` and `statusCode`.
			const apiError = err as unknown as {
				name?: string;
				status?: number;
				statusCode?: number;
				body?: { code?: string; message?: string };
				message?: string;
			};

			const isApiError = apiError?.name === 'APIError' && typeof apiError.statusCode === 'number';
			if (isApiError) {
				// Better Auth errors can expose different shapes depending on the endpoint.
				// So we extract what we can, defensively.
				const statusCode = apiError.statusCode;
				const code = apiError.body?.code;
				const message = String(apiError.body?.message ?? apiError.message ?? '');

				const msg = message.toLowerCase();
				const isWrongPassword = code === 'INVALID_PASSWORD' || msg.includes('invalid password');
				const isInvalidCredentials =
					code === 'INVALID_CREDENTIALS' ||
					msg.includes('invalid credentials') ||
					statusCode === 401;
				const isEmailNotVerified =
					code === 'EMAIL_NOT_VERIFIED' || msg.includes('email not verified') || statusCode === 403;

				if (isWrongPassword || isInvalidCredentials) {
					return setError(form, 'password', 'Wrong password.');
				}

				if (isEmailNotVerified) {
					return setError(form, 'email', 'Please verify your email before signing in.', {
						status: 403
					});
				}

				// Fall back to a generic failure for unexpected auth errors.
				return fail(500, {
					form,
					message: 'An error has occurred while logging the user.',
					error: message
				});
			}

			throw err;
		}

		throw redirect(303, '/', { type: 'info', message: 'You successfully logged in.' }, event);
	}
};
