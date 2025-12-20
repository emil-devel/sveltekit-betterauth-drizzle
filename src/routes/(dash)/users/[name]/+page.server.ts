import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, not } from 'drizzle-orm';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import {
	activeUserSchema,
	roleUserSchema,
	userNameSchema,
	userIdSchema,
	userEmailSchema
} from '$lib/valibot';

export const load = (async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(302, '/sign-in');

	const getUser = async (name: string) => {
		// Single round-trip: user + profile via LEFT JOIN (profile expected to exist, but we guard anyway)
		const users = await db
			.select({
				id: table.user.id,
				userId: table.user.id,
				active: table.user.active,
				role: table.user.role,
				name: table.user.name,
				email: table.user.email,
				image: table.user.image,
				updatedAt: table.user.updatedAt,
				createdAt: table.user.createdAt,
				profileId: table.profile.id,

				firstName: table.profile.firstName,
				lastName: table.profile.lastName
			})
			.from(table.user)
			.leftJoin(table.profile, eq(table.profile.userId, table.user.id))
			.where(eq(table.user.name, name))
			.limit(1);

		const user = users[0];
		if (!user) throw redirect(302, '/users');
		if (!user.profileId) throw redirect(302, '/users'); // invariant: profile should exist

		const { id, updatedAt, createdAt } = user;

		const [nameForm, emailForm, activeForm, roleForm, deleteForm] = await Promise.all([
			superValidate({ id, name: user.name }, valibot(userNameSchema)),
			superValidate({ id, email: user.email }, valibot(userEmailSchema)),
			superValidate({ id, active: user.active }, valibot(activeUserSchema)),
			superValidate({ id, role: user.role }, valibot(roleUserSchema)),
			superValidate({ id }, valibot(userIdSchema))
		]);

		return {
			id,
			nameForm,
			emailForm,
			activeForm,
			roleForm,
			deleteForm,
			updatedAt: updatedAt.toLocaleDateString(),
			createdAt: createdAt.toLocaleDateString(),
			image: user.image,
			firstName: user.firstName,
			lastName: user.lastName
		};
	};

	return await getUser(event.params.name);
}) satisfies PageServerLoad;

export const actions: Actions = {
	name: async (event) => {
		const nameForm = await superValidate(event.request, valibot(userNameSchema));
		const { id, name } = nameForm.data;

		if (!nameForm.valid) return fail(400, { nameForm });

		const res = await db
			.select({ name: table.user.name })
			.from(table.user)
			.where(and(eq(table.user.name, name), not(eq(table.user.id, id))));
		if (name === res[0]?.name) return setError(nameForm, 'name', 'Username already exist!');

		try {
			await db.update(table.user).set({ name: name }).where(eq(table.user.id, id));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		redirect('/users', { type: 'success', message: 'Username updated.' }, event.cookies);
	},
	email: async (event) => {
		const emailForm = await superValidate(event.request, valibot(userEmailSchema));
		const { id, email } = emailForm.data;

		if (!emailForm.valid) return fail(400, { emailForm });

		const res = await db
			.select({ email: table.user.email })
			.from(table.user)
			.where(and(eq(table.user.email, email), not(eq(table.user.id, id))));
		if (email === res[0]?.email) return setError(emailForm, 'email', 'Email already in use!');

		try {
			await db.update(table.user).set({ email }).where(eq(table.user.id, id));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: `Email updated.` }, event.cookies);
	},
	active: async (event) => {
		const activeForm = await superValidate(event.request, valibot(activeUserSchema));
		const { id, active } = activeForm.data;

		if (!activeForm.valid) return fail(400, { activeForm });

		try {
			await db
				.update(table.user)
				.set({ active: active as boolean })
				.where(eq(table.user.id, id as string));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: `User updated.` }, event.cookies);
	},
	role: async (event) => {
		const roleForm = await superValidate(event.request, valibot(roleUserSchema));
		const { id, role } = roleForm.data;

		if (!roleForm.valid) return fail(400, { roleForm });

		try {
			await db
				.update(table.user)
				.set({ role: role })
				.where(eq(table.user.id, id as string));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: `User updated.` }, event.cookies);
	},
	delete: async (event) => {
		const deleteForm = await superValidate(event.request, valibot(userIdSchema));
		const { id } = deleteForm.data;

		if (!deleteForm.valid) return fail(400, { deleteForm });

		try {
			await db.delete(table.user).where(eq(table.user.id, id as string));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		redirect('/users', { type: 'success', message: 'User deleted!' }, event.cookies);
	}
};
