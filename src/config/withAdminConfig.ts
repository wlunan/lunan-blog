import adminConfig from "./adminConfig.json";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function mergeConfig<T>(defaults: T, override: unknown): T {
	if (override === undefined) return defaults;
	if (Array.isArray(defaults)) {
		return (Array.isArray(override) ? override : defaults) as T;
	}
	if (!isObject(defaults) || !isObject(override)) return override as T;

	const merged: JsonObject = { ...defaults };
	for (const [key, value] of Object.entries(override)) {
		merged[key] = key in defaults ? mergeConfig(defaults[key], value) : value;
	}
	return merged as T;
}

/**
 * 保留 TypeScript 配置中的默认值，并叠加本地内容工作台保存的覆盖项。
 * 数组整体替换，对象递归合并。
 */
export function withAdminConfig<T>(key: string, defaults: T): T {
	const overrides = (
		adminConfig as typeof adminConfig & {
			overrides?: Record<string, unknown>;
		}
	).overrides;
	return mergeConfig(defaults, overrides?.[key]);
}
