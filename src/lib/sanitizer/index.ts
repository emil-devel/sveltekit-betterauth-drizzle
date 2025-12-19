type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
	return !!value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

function isFileLike(value: unknown): value is File {
	return typeof File !== 'undefined' && value instanceof File;
}

export function trimStringsDeep<T>(value: T): T {
	if (typeof value === 'string') return value.trim() as T;
	if (Array.isArray(value)) return value.map(trimStringsDeep) as T;
	if (isFileLike(value)) return value;
	if (!isPlainObject(value)) return value;

	const out: PlainObject = {};
	for (const [key, entry] of Object.entries(value)) {
		out[key] = trimStringsDeep(entry);
	}
	return out as T;
}

export function lowercaseKeys<T extends PlainObject>(obj: T, keys: readonly string[]): T {
	const keySet = new Set(keys);
	const out: PlainObject = { ...obj };

	for (const key of Object.keys(out)) {
		if (!keySet.has(key)) continue;
		const value = out[key];
		if (typeof value === 'string') out[key] = value.toLowerCase();
		if (Array.isArray(value)) {
			out[key] = value.map((v) => (typeof v === 'string' ? v.toLowerCase() : v));
		}
	}

	return out as T;
}

/**
 * Converts FormData to a JS object.
 * - If a key occurs multiple times, it becomes an array.
 * - Files are kept as File objects.
 */
export function formDataToObject(formData: FormData): PlainObject {
	const out: PlainObject = {};

	for (const [key, value] of formData.entries()) {
		const current = out[key];

		if (current === undefined) {
			out[key] = value;
			continue;
		}

		if (Array.isArray(current)) {
			current.push(value);
			continue;
		}

		out[key] = [current, value];
	}

	return out;
}

export function sanitizeFormData(
	formData: FormData,
	options?: {
		lowercase?: readonly string[];
	}
): PlainObject {
	let data = formDataToObject(formData);
	data = trimStringsDeep(data);
	if (options?.lowercase?.length) {
		data = lowercaseKeys(data, options.lowercase);
	}
	return data;
}
