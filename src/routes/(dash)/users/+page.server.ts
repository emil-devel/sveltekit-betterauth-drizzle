import type { PageServerLoad } from './$types';
import { auth } from '$lib/auth';
import * as table from '$lib/server/db/schema';
import { redirect } from 'sveltekit-flash-message/server';
import { asc } from 'drizzle-orm';
import { db } from '$lib/server/db';

export const load = (async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) throw redirect(302, '/sign-in');
	console.log('Session in /users:', session);
	const getUsers = async () => {
		const result = await db
			.select({
				id: table.user.id,
				// active: table.user.active,
				// role: table.user.role,
				name: table.user.name,
				createdAt: table.user.createdAt,
				image: table.user.image
				// firstName: table.profile.firstName,
				// lastName: table.profile.lastName
			})
			.from(table.user)
			// .leftJoin(table.profile, eq(table.user.id, table.profile.userId))
			.orderBy(asc(table.user.name));

		const users = result.map((result) => ({
			...result,
			createdAt: result.createdAt.toLocaleDateString()
		}));

		return users;
	};

	return {
		users: await getUsers()
	};
}) satisfies PageServerLoad;
