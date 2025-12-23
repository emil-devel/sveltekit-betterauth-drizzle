import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { betterAuth } from 'better-auth';
import { redirect } from 'sveltekit-flash-message/server';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { sendEmail } from '$lib/nodemailer';
import { eq, sql } from 'drizzle-orm';
import {
	BETTER_AUTH_SECRET,
	BETTER_AUTH_URL,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$env/static/private';

const USERNAME_MIN_LENGTH = 4;
const USERNAME_MAX_LENGTH = 12;
const BOOTSTRAP_ROLE_LOCK_ID = 784_221;

const sanitizeOAuthUsernameBase = (raw: string): string => {
	let value = raw.toLowerCase().trim();
	try {
		value = value.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
	} catch {
		// ignore environments without unicode property escapes
	}

	value = value
		.replace(/[^a-z0-9._]+/g, '.')
		.replace(/[._]+/g, '.')
		.replace(/^[0-9._]+/, '');

	if (!value) value = 'user';
	if (!/^[a-z]/.test(value)) value = `u${value}`;

	value = value.slice(0, USERNAME_MAX_LENGTH);
	if (value.length < USERNAME_MIN_LENGTH) {
		value = (value + 'user').slice(0, USERNAME_MIN_LENGTH);
	}

	value = value.replace(/[._]+/g, '.');
	if (!/^[a-z]/.test(value)) value = `u${value}`.slice(0, USERNAME_MAX_LENGTH);
	value = value.replace(/^[0-9._]+/, 'u');

	return value;
};

const buildOAuthUsernameCandidate = (base: string, attempt: number): string => {
	if (attempt <= 1) return base.slice(0, USERNAME_MAX_LENGTH);

	const suffix = String(attempt);
	const maxBaseLength = USERNAME_MAX_LENGTH - suffix.length;
	const minBaseLength = Math.max(1, USERNAME_MIN_LENGTH - suffix.length);

	let basePart = base.slice(0, Math.max(minBaseLength, maxBaseLength));
	basePart = basePart.slice(0, maxBaseLength);
	if (basePart.length < minBaseLength) {
		basePart = (basePart + 'user').slice(0, minBaseLength);
	}

	return `${basePart}${suffix}`;
};

const findAvailableOAuthUsername = async (rawBase: string): Promise<string> => {
	const base = sanitizeOAuthUsernameBase(rawBase);

	for (let attempt = 1; attempt <= 50; attempt += 1) {
		const candidate = buildOAuthUsernameCandidate(base, attempt);
		const existing = await db.query.user.findFirst({ where: (u) => eq(u.name, candidate) });
		if (!existing) return candidate;
	}

	for (let attempt = 0; attempt < 20; attempt += 1) {
		const random = Math.random().toString(36).slice(2, 8);
		const candidate = `u${random}`.slice(0, USERNAME_MAX_LENGTH);
		const existing = await db.query.user.findFirst({ where: (u) => eq(u.name, candidate) });
		if (!existing) return candidate;
	}

	return `u${crypto
		.randomUUID()
		.replace(/-/g, '')
		.slice(0, USERNAME_MAX_LENGTH - 1)}`;
};

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	secret: BETTER_AUTH_SECRET,
	baseURL: BETTER_AUTH_URL,
	basePath: '/api/auth',
	trustedOrigins: [BETTER_AUTH_URL],
	databaseHooks: {
		user: {
			create: {
				before: async (user, ctx) => {
					const role = await db.transaction(async (tx) => {
						await tx.execute(sql`select pg_advisory_xact_lock(${BOOTSTRAP_ROLE_LOCK_ID})`);
						const existing = await tx.query.user.findFirst({ columns: { id: true } });
						if (!existing) return 'ADMIN';
						return (user as { role?: string }).role ?? 'USER';
					});

					let name = user.name;
					if (ctx?.path === '/callback/:id') {
						const emailLocalPart = user.email?.split('@')[0] ?? '';
						const rawBase = user.name?.trim() || emailLocalPart || 'user';
						name = await findAvailableOAuthUsername(rawBase);
					}

					return { data: { ...user, name, role } };
				},
				after: async (user) => {
					if (!user?.id || !user?.name) return;
					await db
						.insert(table.profile)
						.values({ userId: user.id, name: user.name })
						.onConflictDoNothing({ target: table.profile.userId });
				}
			}
		}
	},
	user: {
		additionalFields: {
			active: {
				type: 'boolean',
				required: false,
				defaultValue: true,
				input: false
			},
			role: {
				type: 'string',
				required: false,
				defaultValue: 'USER',
				input: false
			}
		}
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		autoSignIn: true, //defaults to true
		sendResetPassword: async ({ user, url }) => {
			void sendEmail({
				to: user.email,
				subject: 'Reset your password.',
				text: `Click the <a href="${url}">link</a> to reset your password.`
			});
		},
		resetPasswordTokenExpiresIn: 3600,
		trustedOrigins: [BETTER_AUTH_URL],
		onPasswordReset: async ({ user }) => {
			throw redirect(
				303,
				'/login',
				{
					type: 'success',
					message: `Password for user ${user.email} has been reset.`
				},
				getRequestEvent()
			);
		}
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			void sendEmail({
				to: user.email,
				subject: 'Verify your email address.',
				text: `Click the <a href="${url}">link</a> to verify your email.`
			});
		}
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ['github', 'google']
		}
	},
	socialProviders: {
		github: {
			clientId: GITHUB_CLIENT_ID as string,
			clientSecret: GITHUB_CLIENT_SECRET as string
		},
		google: {
			clientId: GOOGLE_CLIENT_ID as string,
			clientSecret: GOOGLE_CLIENT_SECRET as string
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
