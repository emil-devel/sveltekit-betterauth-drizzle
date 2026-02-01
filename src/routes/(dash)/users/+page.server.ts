import type { PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { redirect } from 'sveltekit-flash-message/server';
import { asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const load = (async (event) => {
	if (!event.locals.authUser) throw redirect(302, '/sign-in');

	const getUsers = async () => {
		const result = await db
			.select({
				id: table.user.id,
				active: table.user.active,
				role: table.user.role,
				name: table.user.name,
				createdAt: table.user.createdAt,
				image: table.user.image,
				avatar: table.profile.avatar,
				firstName: table.profile.firstName,
				lastName: table.profile.lastName,
			})
			.from(table.user)
			.leftJoin(table.profile, eq(table.profile.userId, table.user.id))
			.orderBy(asc(table.user.name));

		const users = result.map((result) => ({
			...result,
			createdAt: result.createdAt.toLocaleDateString(),
		}));

		return users;
	};

	return {
		users: await getUsers(),
	};
}) satisfies PageServerLoad;
