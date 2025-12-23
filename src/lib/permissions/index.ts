export type Role = 'USER' | 'REDACTEUR' | 'ADMIN';

export const ROLES = ['USER', 'REDACTEUR', 'ADMIN'] as const;

export type AuthUser = {
	id: string;
	role: Role;
	name?: string | null;
};

type UserLike = {
	id?: unknown;
	role?: unknown;
	name?: unknown;
	email?: unknown;
};

export function isRole(value: unknown): value is Role {
	return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export function toAuthUser(
	user: UserLike | null | undefined,
	options?: { defaultRole?: Role }
): AuthUser | null {
	if (!user || typeof user !== 'object') return null;

	const id = user.id;
	if (typeof id !== 'string' || !id) return null;

	const roleRaw = user.role;
	const role = isRole(roleRaw) ? roleRaw : (options?.defaultRole ?? 'USER');
	const nameRaw =
		typeof user.name === 'string' ? user.name : typeof user.email === 'string' ? user.email : null;
	const name = typeof nameRaw === 'string' ? nameRaw : null;

	return { id, role, name };
}

export function authUserFromLocals(
	locals: { user?: UserLike | null | undefined } | null | undefined,
	options?: Parameters<typeof toAuthUser>[1]
): AuthUser | null {
	return toAuthUser(locals?.user ?? null, options);
}

export function isAdmin(user: Pick<AuthUser, 'role'> | null | undefined): boolean {
	return !!user && user.role === 'ADMIN';
}

export function isSelf(
	viewerId: string | null | undefined,
	targetId: string | null | undefined
): boolean {
	return Boolean(viewerId && targetId && viewerId === targetId);
}

export function canManageUser(
	viewer: AuthUser | null | undefined,
	targetUserId: string | null | undefined
): boolean {
	return isAdmin(viewer) && !isSelf(viewer?.id ?? null, targetUserId);
}

export function canEditOwn(
	viewer: AuthUser | null | undefined,
	targetUserId: string | null | undefined
): boolean {
	return isSelf(viewer?.id ?? null, targetUserId);
}
