import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { betterAuth } from 'better-auth';
import { redirect } from 'sveltekit-flash-message/server';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { sendEmail } from '$lib/nodemailer';
import {
	BETTER_AUTH_SECRET,
	BETTER_AUTH_URL,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$env/static/private';

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
				after: async (user) => {
					if (!user?.id) return;
					await db
						.insert(table.profile)
						.values({ userId: user.id })
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
			trustedProviders: ['github']
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
