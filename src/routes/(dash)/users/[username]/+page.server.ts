import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'sveltekit-flash-message/server';

export const load = (async (event) => {
	if (!event.locals.session) throw redirect(302, '/login');

	const getUser = async (username: string) => {
		// Single round-trip: user + profile via LEFT JOIN (profile expected to exist, but we guard anyway)
		const users = await db
			.select({
				id: table.user.id,
				name: table.user.name,
				email: table.user.email,
				updatedAt: table.user.updatedAt,
				createdAt: table.user.createdAt,
				avatar: table.user.image
			})
			.from(table.user)
			// .leftJoin(table.profile, eq(table.profile.name, table.user.username))
			.where(eq(table.user.name, username))
			.limit(1);

		const user = users[0];
		if (!user) throw redirect(302, '/users');
		// if (!user.profileId) throw redirect(302, '/users'); invariant: profile should exist

		const { id, name, email, avatar, updatedAt, createdAt } = user;

		return {
			id,
			name,
			email,
			updatedAt: updatedAt.toLocaleDateString(),
			createdAt: createdAt.toLocaleDateString(),
			avatar
		};
	};

	return await getUser(event.params.username);
}) satisfies PageServerLoad;
