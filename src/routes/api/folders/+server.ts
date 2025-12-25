import { json } from '@sveltejs/kit';
import { readdir } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

import type { RequestHandler } from './$types';

const BASE_DIR = resolve(process.cwd(), 'src/routes');
const ALLOWED_ROOTS = ['(dash)', '(public)'] as const;

const isSafeTarget = (target: string): boolean => {
	if (!target) return false;
	if (target.includes('\0')) return false;
	if (target.includes('..')) return false;
	// allow simple route group paths like "(auth)" or "(dash)/users"
	if (!/^[a-zA-Z0-9_()\-/]+$/.test(target)) return false;

	return ALLOWED_ROOTS.some((root) => target === root || target.startsWith(`${root}/`));
};

export const GET: RequestHandler = async ({ url }) => {
	const target = url.searchParams.get('target') ?? '';
	if (!isSafeTarget(target)) {
		return json({ folders: [], error: 'Invalid target' }, { status: 400 });
	}

	const targetPath = resolve(BASE_DIR, target);
	if (!(targetPath + sep).startsWith(BASE_DIR + sep) && targetPath !== BASE_DIR) {
		return json({ folders: [], error: 'Invalid target' }, { status: 400 });
	}

	try {
		const entries = await readdir(targetPath, { withFileTypes: true });
		const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
		return json({ folders });
	} catch (error) {
		return json(
			{ folders: [], error: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
};
