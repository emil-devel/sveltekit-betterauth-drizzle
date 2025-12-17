import { createAuthClient } from 'better-auth/svelte';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';

export const authClient = createAuthClient({
	// Must be an absolute URL (scheme + host). Path is provided via basePath.
	baseURL: PUBLIC_BETTER_AUTH_URL,
	basePath: '/api/auth'
});

export const { signIn, signUp, signOut, useSession, getSession, getAccessToken } = authClient;
