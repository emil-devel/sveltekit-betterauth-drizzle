import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, not } from 'drizzle-orm';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { activeUserSchema, roleUserSchema, userIdSchema, userEmailSchema } from '$lib/valibot';

export const load = (async (event) => {
	const viewer = event.locals.authUser;
	if (!viewer) throw redirect(302, '/sign-in');

	const getUser = async (name: string) => {
		// Single round-trip: user + profile via LEFT JOIN (profile expected to exist, but we guard anyway)
		const users = await db
			.select({
				id: table.user.id,
				active: table.user.active,
				role: table.user.role,
				name: table.user.name,
				email: table.user.email,
				emailVerified: table.user.emailVerified,
				image: table.user.image,
				updatedAt: table.user.updatedAt,
				createdAt: table.user.createdAt,
				profileId: table.profile.id,
				avatar: table.profile.avatar,
				emailPublic: table.profile.emailPublic,
				firstName: table.profile.firstName,
				lastName: table.profile.lastName,
			})
			.from(table.user)
			.leftJoin(table.profile, eq(table.profile.name, table.user.name))
			.where(eq(table.user.name, name))
			.limit(1);

		const user = users[0];
		if (!user) throw redirect(302, '/users');
		if (!user.profileId) throw redirect(302, '/users'); // invariant: profile should exist

		const { id, updatedAt, createdAt } = user;

		const [emailForm, activeForm, roleForm, deleteForm] = await Promise.all([
			superValidate(
				{ id, emailPublic: user.emailPublic as string | undefined },
				valibot(userEmailSchema)
			),
			superValidate({ id, active: user.active }, valibot(activeUserSchema)),
			superValidate({ id, role: user.role }, valibot(roleUserSchema)),
			superValidate({ id }, valibot(userIdSchema)),
		]);

		return {
			id,
			name: user.name,
			image: user.image,
			email: user.email,
			emailVerified: user.emailVerified,
			emailForm,
			activeForm,
			roleForm,
			deleteForm,
			updatedAt: updatedAt.toLocaleDateString(),
			createdAt: createdAt.toLocaleDateString(),
			avatar: user.avatar,
			firstName: user.firstName,
			lastName: user.lastName,
		};
	};

	return await getUser(event.params.name);
}) satisfies PageServerLoad;

export const actions: Actions = {
	email: async (event) => {
		const emailForm = await superValidate(event.request, valibot(userEmailSchema));
		const { id, emailPublic } = emailForm.data;

		if (!emailForm.valid) return fail(400, { emailForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/sign-in');

		if (viewer.id !== id)
			return setFlash({ type: 'error', message: 'Not authorized.' }, event.cookies);

		const res = emailPublic
			? await db
					.select({ emailPublic: table.profile.emailPublic })
					.from(table.profile)
					.where(and(eq(table.profile.emailPublic, emailPublic), not(eq(table.profile.userId, id))))
			: [];

		if (emailPublic && emailPublic === res[0]?.emailPublic)
			return setError(emailForm, 'emailPublic', 'Email already in use!');

		try {
			await db
				.update(table.profile)
				.set({ emailPublic: emailPublic ?? null })
				.where(eq(table.profile.userId, id));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		const message = emailPublic ? `Public email set to "${emailPublic}".` : 'Public email removed.';
		setFlash({ type: 'success', message }, event.cookies);
	},
	active: async (event) => {
		const activeForm = await superValidate(event.request, valibot(activeUserSchema));
		const { id, active } = activeForm.data;

		if (!activeForm.valid) return fail(400, { activeForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/sign-in');
		if (viewer.role !== 'ADMIN')
			return setFlash({ type: 'error', message: 'Not authorized.' }, event.cookies);

		try {
			await db
				.update(table.user)
				.set({ active: active as boolean })
				.where(eq(table.user.id, id as string));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		const message = active ? 'User activated.' : 'User deactivated.';
		setFlash({ type: 'success', message }, event.cookies);
	},
	role: async (event) => {
		const roleForm = await superValidate(event.request, valibot(roleUserSchema));
		const { id, role } = roleForm.data;

		if (!roleForm.valid) return fail(400, { roleForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/sign-in');
		if (viewer.role !== 'ADMIN')
			return setFlash({ type: 'error', message: 'Not authorized.' }, event.cookies);

		try {
			await db
				.update(table.user)
				.set({ role: role })
				.where(eq(table.user.id, id as string));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		const message = `User role set to "${role}".`;
		setFlash({ type: 'success', message }, event.cookies);
	},
	delete: async (event) => {
		const deleteForm = await superValidate(event.request, valibot(userIdSchema));
		const { id } = deleteForm.data;

		if (!deleteForm.valid) return fail(400, { deleteForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/sign-in');
		if (viewer.role !== 'ADMIN')
			return setFlash({ type: 'error', message: 'Not authorized.' }, event.cookies);

		try {
			await db.delete(table.user).where(eq(table.user.id, id as string));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		redirect('/users', { type: 'success', message: 'User deleted successfully.' }, event.cookies);
	},
};
