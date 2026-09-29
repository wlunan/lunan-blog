import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import matter from "gray-matter";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_ROOT = path.join(PROJECT_ROOT, "src", "content", "posts");
const CONFIG_PATH = path.join(PROJECT_ROOT, "src", "config", "adminConfig.json");
const FOOTER_HTML_PATH = path.join(PROJECT_ROOT, "src", "config", "FooterConfig.html");
const CONFIG_LOADER_PATH = path.join(PROJECT_ROOT, "scripts", "admin-config-loader.ts");
const TSX_CLI_PATH = path.join(PROJECT_ROOT, "node_modules", "tsx", "dist", "cli.mjs");
const UI_ROOT = path.join(PROJECT_ROOT, "scripts", "admin-ui");
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const execFileAsync = promisify(execFile);

const CONFIG_MODULE_KEYS = new Set([
	"siteConfig",
	"profileConfig",
	"announcementConfig",
	"backgroundWallpaper",
	"coverImageConfig",
	"displaySettingsConfig",
	"sidebarLayoutConfig",
	"sakuraConfig",
	"fontConfig",
	"fontsList",
	"expressiveCodeConfig",
	"commentConfig",
	"analyticsConfig",
	"musicPlayerConfig",
	"dynamicConfig",
	"friendsPageConfig",
	"friendsConfig",
	"galleryConfig",
	"booknavPageConfig",
	"booknavConfig",
	"sponsorConfig",
	"footerConfig",
	"licenseConfig",
	"navBarConfig",
	"LinkPresets",
	"navBarSearchConfig",
	"mermaidConfig",
	"plantumlConfig",
	"spineModelConfig",
	"live2dWidgetConfig",
]);

const EDITOR_FIELDS = [
	"title",
	"published",
	"updated",
	"description",
	"image",
	"tags",
	"category",
	"draft",
	"lang",
	"pinned",
	"author",
	"sourceLink",
	"licenseName",
	"licenseUrl",
	"comment",
	"password",
	"passwordHint",
];

const MIME_TYPES = {
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
};

class RequestError extends Error {
	constructor(message, status = 400) {
		super(message);
		this.status = status;
	}
}

function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireRecord(value, label) {
	if (!isRecord(value)) throw new RequestError(`${label} 格式不正确`);
	return value;
}

function requireString(value, label, maxLength = 500) {
	if (typeof value !== "string") throw new RequestError(`${label} 必须是文本`);
	const result = value.trim();
	if (!result) throw new RequestError(`${label}不能为空`);
	if (result.length > maxLength) throw new RequestError(`${label}过长`);
	return result;
}

function optionalString(value, maxLength = 2_000) {
	if (value === undefined || value === null) return "";
	if (typeof value !== "string") throw new RequestError("配置中存在无效文本");
	return value.trim().slice(0, maxLength);
}

function requireNumber(value, label, min, max) {
	const result = Number(value);
	if (!Number.isFinite(result) || result < min || result > max) {
		throw new RequestError(`${label}需在 ${min} 到 ${max} 之间`);
	}
	return result;
}

function requireBoolean(value, label) {
	if (typeof value !== "boolean") throw new RequestError(`${label} 必须是开关值`);
	return value;
}

function oneOf(value, options, label) {
	if (!options.includes(value)) throw new RequestError(`${label}选项无效`);
	return value;
}

export function validateConfig(value) {
	const root = requireRecord(value, "配置");
	const site = requireRecord(root.site, "站点设置");
	const profile = requireRecord(root.profile, "个人资料");
	const appearance = requireRecord(root.appearance, "外观设置");
	const content = requireRecord(root.content, "内容设置");
	const pages = requireRecord(root.pages, "页面开关");

	const siteUrl = requireString(site.siteUrl, "站点地址", 500);
	let parsedSiteUrl;
	try {
		parsedSiteUrl = new URL(siteUrl);
	} catch {
		throw new RequestError("站点地址不是有效 URL");
	}
	if (!["http:", "https:"].includes(parsedSiteUrl.protocol)) {
		throw new RequestError("站点地址只支持 http 或 https");
	}

	if (!Array.isArray(site.keywords)) throw new RequestError("关键词格式不正确");
	if (!Array.isArray(profile.links)) throw new RequestError("个人链接格式不正确");

	return {
		site: {
			title: requireString(site.title, "站点标题", 100),
			subtitle: optionalString(site.subtitle, 100),
			siteUrl,
			description: optionalString(site.description, 300),
			keywords: site.keywords
				.map((item) => optionalString(item, 50))
				.filter(Boolean)
				.slice(0, 30),
			navbarTitle: requireString(site.navbarTitle, "导航栏标题", 50),
		},
		profile: {
			avatar: optionalString(profile.avatar, 500),
			name: requireString(profile.name, "个人名称", 80),
			bio: optionalString(profile.bio, 200),
			links: profile.links.slice(0, 20).map((item, index) => {
				const link = requireRecord(item, `第 ${index + 1} 个链接`);
				return {
					name: requireString(link.name, "链接名称", 50),
					icon: requireString(link.icon, "链接图标", 100),
					url: requireString(link.url, "链接地址", 500),
					showName: requireBoolean(link.showName, "显示名称"),
				};
			}),
		},
		appearance: {
			themeHue: requireNumber(appearance.themeHue, "主题色相", 0, 360),
			defaultMode: oneOf(
				appearance.defaultMode,
				["light", "dark", "system"],
				"默认主题",
			),
			pageWidth: requireNumber(appearance.pageWidth, "页面宽度", 60, 160),
			cardBorder: requireBoolean(appearance.cardBorder, "卡片边框"),
			cardFollowTheme: requireBoolean(
				appearance.cardFollowTheme,
				"卡片跟随主题",
			),
			desktopPostLayout: oneOf(
				appearance.desktopPostLayout,
				["list", "grid"],
				"桌面文章布局",
			),
			mobilePostLayout: oneOf(
				appearance.mobilePostLayout,
				["list", "grid"],
				"移动文章布局",
			),
		},
		content: {
			postsPerPage: requireNumber(content.postsPerPage, "每页文章数", 1, 50),
			categoryBar: requireBoolean(content.categoryBar, "分类导航"),
			foldArticle: requireBoolean(content.foldArticle, "归档折叠"),
		},
		pages: Object.fromEntries(
			[
				"friends",
				"sponsor",
				"guestbook",
				"bangumi",
				"gallery",
				"anime",
				"dynamic",
				"booknav",
			].map((key) => [key, requireBoolean(pages[key], `${key} 页面`)]),
		),
	};
}

function assertJsonValue(value, depth = 0) {
	if (depth > 16) throw new RequestError("配置嵌套层级过深");
	if (value === null || typeof value === "boolean") return;
	if (typeof value === "number") {
		if (!Number.isFinite(value)) throw new RequestError("配置中存在无效数字");
		return;
	}
	if (typeof value === "string") {
		if (value.length > 100_000) throw new RequestError("单个配置文本过长");
		return;
	}
	if (Array.isArray(value)) {
		if (value.length > 500) throw new RequestError("配置列表项目过多");
		for (const item of value) assertJsonValue(item, depth + 1);
		return;
	}
	if (isRecord(value)) {
		const entries = Object.entries(value);
		if (entries.length > 500) throw new RequestError("配置对象字段过多");
		for (const [key, item] of entries) {
			if (["__proto__", "constructor", "prototype"].includes(key)) {
				throw new RequestError("配置包含不允许的字段");
			}
			assertJsonValue(item, depth + 1);
		}
		return;
	}
	throw new RequestError("配置包含不支持的数据类型");
}

async function loadAllConfigModules() {
	const { stdout } = await execFileAsync(
		process.execPath,
		[TSX_CLI_PATH, CONFIG_LOADER_PATH],
		{
			cwd: PROJECT_ROOT,
			encoding: "utf8",
			maxBuffer: 5 * 1024 * 1024,
			windowsHide: true,
		},
	);
	return JSON.parse(stdout);
}

function syncOverrideFromBasicForm(overrides, config) {
	if (isRecord(overrides.siteConfig)) {
		const site = overrides.siteConfig;
		site.title = config.site.title;
		site.subtitle = config.site.subtitle;
		site.site_url = config.site.siteUrl;
		site.description = config.site.description;
		site.keywords = config.site.keywords;
		site.navbar = { ...(isRecord(site.navbar) ? site.navbar : {}), title: config.site.navbarTitle };
		site.themeColor = {
			...(isRecord(site.themeColor) ? site.themeColor : {}),
			hue: config.appearance.themeHue,
			defaultMode: config.appearance.defaultMode,
		};
		site.pageWidth = config.appearance.pageWidth;
		site.card = {
			...(isRecord(site.card) ? site.card : {}),
			border: config.appearance.cardBorder,
			followTheme: config.appearance.cardFollowTheme,
		};
		site.postListLayout = {
			...(isRecord(site.postListLayout) ? site.postListLayout : {}),
			defaultMode: config.appearance.desktopPostLayout,
			mobileDefaultMode: config.appearance.mobilePostLayout,
		};
		site.pagination = {
			...(isRecord(site.pagination) ? site.pagination : {}),
			postsPerPage: config.content.postsPerPage,
		};
		site.categoryBar = config.content.categoryBar;
		site.foldArticle = config.content.foldArticle;
		site.pages = config.pages;
	}
	if (isRecord(overrides.profileConfig)) {
		overrides.profileConfig = {
			...overrides.profileConfig,
			...config.profile,
		};
	}
}

function syncBasicFormFromModule(adminData, key, value) {
	if (key === "siteConfig" && isRecord(value)) {
		adminData.site = {
			title: value.title,
			subtitle: value.subtitle ?? "",
			siteUrl: value.site_url,
			description: value.description ?? "",
			keywords: Array.isArray(value.keywords) ? value.keywords : [],
			navbarTitle: isRecord(value.navbar) ? value.navbar.title ?? value.title : value.title,
		};
		adminData.appearance = {
			themeHue: value.themeColor?.hue ?? 220,
			defaultMode: value.themeColor?.defaultMode ?? "system",
			pageWidth: value.pageWidth ?? 100,
			cardBorder: value.card?.border ?? false,
			cardFollowTheme: value.card?.followTheme ?? false,
			desktopPostLayout: value.postListLayout?.defaultMode ?? "list",
			mobilePostLayout: value.postListLayout?.mobileDefaultMode ?? "grid",
		};
		adminData.content = {
			postsPerPage: value.pagination?.postsPerPage ?? 10,
			categoryBar: value.categoryBar ?? true,
			foldArticle: value.foldArticle ?? true,
		};
		adminData.pages = value.pages;
	}
	if (key === "profileConfig" && isRecord(value)) {
		adminData.profile = value;
	}
}

function yamlScalar(value) {
	if (typeof value === "boolean" || typeof value === "number") return String(value);
	return JSON.stringify(value ?? "");
}

function serializeField(key, value, newline) {
	if (key === "tags") {
		if (!Array.isArray(value) || value.length === 0) return "tags: []";
		return `tags:${newline}${value.map((tag) => `  - ${yamlScalar(tag)}`).join(newline)}`;
	}
	if (["published", "updated"].includes(key) && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return `${key}: ${value}`;
	}
	return `${key}: ${yamlScalar(value)}`;
}

function findFieldRange(lines, key) {
	const start = lines.findIndex((line) => line.startsWith(`${key}:`));
	if (start === -1) return null;
	let end = start + 1;
	while (end < lines.length && (/^[ \t]/.test(lines[end]) || lines[end].trim() === "")) {
		end += 1;
	}
	return { start, end };
}

export function patchFrontmatter(source, fields) {
	const newline = source.includes("\r\n") ? "\r\n" : "\n";
	const match = source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
	let lines = match ? match[1].split(/\r?\n/) : [];
	const body = match ? source.slice(match[0].length) : source.replace(/^\uFEFF/, "");

	for (const key of EDITOR_FIELDS) {
		if (!(key in fields)) continue;
		const value = fields[key];
		const range = findFieldRange(lines, key);
		const shouldRemove = key === "updated" && !value;
		if (shouldRemove) {
			if (range) lines.splice(range.start, range.end - range.start);
			continue;
		}

		const replacement = serializeField(key, value, newline).split(newline);
		if (range) {
			lines.splice(range.start, range.end - range.start, ...replacement);
		} else {
			lines.push(...replacement);
		}
	}

	while (lines.at(-1) === "") lines.pop();
	return `---${newline}${lines.join(newline)}${newline}---${newline}${body}`;
}

function normalizeDate(value) {
	if (value instanceof Date && !Number.isNaN(value.valueOf())) {
		return value.toISOString().slice(0, 10);
	}
	if (typeof value === "string") return value.slice(0, 10);
	return "";
}

function postFields(data = {}) {
	return {
		title: typeof data.title === "string" ? data.title : "",
		published: normalizeDate(data.published),
		updated: normalizeDate(data.updated),
		description: typeof data.description === "string" ? data.description : "",
		image: typeof data.image === "string" ? data.image : "",
		tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
		category: typeof data.category === "string" ? data.category : "",
		draft: data.draft === true,
		lang: typeof data.lang === "string" ? data.lang : "",
		pinned: data.pinned === true,
		author: typeof data.author === "string" ? data.author : "",
		sourceLink: typeof data.sourceLink === "string" ? data.sourceLink : "",
		licenseName: typeof data.licenseName === "string" ? data.licenseName : "",
		licenseUrl: typeof data.licenseUrl === "string" ? data.licenseUrl : "",
		comment: data.comment !== false,
		password: typeof data.password === "string" ? data.password : "",
		passwordHint: typeof data.passwordHint === "string" ? data.passwordHint : "",
	};
}

function validatePostFields(value) {
	const data = requireRecord(value, "文章信息");
	const fields = postFields(data);
	fields.title = requireString(data.title, "文章标题", 200);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.published)) {
		throw new RequestError("发布日期格式不正确");
	}
	if (fields.updated && !/^\d{4}-\d{2}-\d{2}$/.test(fields.updated)) {
		throw new RequestError("更新日期格式不正确");
	}
	fields.description = optionalString(data.description, 500);
	fields.image = optionalString(data.image, 1_000);
	fields.category = optionalString(data.category, 100);
	fields.lang = optionalString(data.lang, 30);
	fields.author = optionalString(data.author, 100);
	fields.sourceLink = optionalString(data.sourceLink, 1_000);
	fields.licenseName = optionalString(data.licenseName, 100);
	fields.licenseUrl = optionalString(data.licenseUrl, 1_000);
	fields.password = optionalString(data.password, 200);
	fields.passwordHint = optionalString(data.passwordHint, 300);
	if (!Array.isArray(data.tags)) throw new RequestError("标签格式不正确");
	fields.tags = data.tags
		.map((tag) => optionalString(tag, 50))
		.filter(Boolean)
		.slice(0, 30);
	return fields;
}

export function preparePostInput(body, fieldValue) {
	if (typeof body !== "string") throw new RequestError("正文格式不正确");
	const formFields = requireRecord(fieldValue, "文章信息");
	const hasFrontmatter = /^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(body);
	if (!hasFrontmatter) {
		return {
			body,
			fields: validatePostFields(formFields),
			source: null,
		};
	}

	const parsed = matter(body);
	const importedFields = {};
	for (const key of EDITOR_FIELDS) {
		if (Object.hasOwn(parsed.data, key)) importedFields[key] = parsed.data[key];
	}

	return {
		body: parsed.content.replace(/^\r?\n/, ""),
		fields: validatePostFields({ ...formFields, ...importedFields }),
		source: body,
	};
}

function safePostPath(relativePath) {
	if (typeof relativePath !== "string" || !/\.(md|mdx)$/i.test(relativePath)) {
		throw new RequestError("文章路径无效");
	}
	const resolved = path.resolve(POSTS_ROOT, relativePath);
	if (!resolved.startsWith(`${POSTS_ROOT}${path.sep}`)) {
		throw new RequestError("文章路径超出允许范围");
	}
	return resolved;
}

function safeNewFileName(value) {
	const base = requireString(value, "文件名", 120)
		.replace(/\.(md|mdx)$/i, "")
		.replace(/[<>:\"/\\|?*\u0000-\u001F]/g, "-")
		.replace(/[. ]+$/g, "")
		.trim();
	if (!base || base === "." || base === "..") throw new RequestError("文件名无效");
	return `${base}.md`;
}

async function walkPosts(directory = POSTS_ROOT) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		if (entry.name.startsWith(".") || entry.name === "assets" || entry.name === "脚本") continue;
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await walkPosts(fullPath)));
		if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) files.push(fullPath);
	}
	return files;
}

async function readPost(relativePath) {
	const fullPath = safePostPath(relativePath);
	const source = await readFile(fullPath, "utf8");
	const parsed = matter(source);
	return {
		path: relativePath.replaceAll("\\", "/"),
		fields: postFields(parsed.data),
		body: parsed.content.replace(/^\r?\n/, ""),
	};
}

async function listPosts() {
	const files = await walkPosts();
	const posts = await Promise.all(
		files.map(async (fullPath) => {
			const relativePath = path.relative(POSTS_ROOT, fullPath).replaceAll("\\", "/");
			const source = await readFile(fullPath, "utf8");
			const parsed = matter(source);
			const fields = postFields(parsed.data);
			const info = await stat(fullPath);
			return {
				path: relativePath,
				title: fields.title || path.basename(relativePath, path.extname(relativePath)),
				published: fields.published,
				draft: fields.draft,
				pinned: fields.pinned,
				category: fields.category,
				tags: fields.tags,
				modifiedAt: info.mtime.toISOString(),
			};
		}),
	);
	return posts.sort((a, b) => (b.published || b.modifiedAt).localeCompare(a.published || a.modifiedAt));
}

async function readJsonBody(request) {
	let size = 0;
	const chunks = [];
	for await (const chunk of request) {
		size += chunk.length;
		if (size > MAX_BODY_BYTES) throw new RequestError("提交内容超过 2 MB", 413);
		chunks.push(chunk);
	}
	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch {
		throw new RequestError("提交内容不是有效 JSON");
	}
}

function sendJson(response, status, data) {
	response.writeHead(status, {
		"cache-control": "no-store",
		"content-type": "application/json; charset=utf-8",
	});
	response.end(JSON.stringify(data));
}

async function sendFile(response, filePath) {
	const content = await readFile(filePath);
	response.writeHead(200, {
		"cache-control": "no-store",
		"content-type": MIME_TYPES[path.extname(filePath)] ?? "application/octet-stream",
		"content-security-policy":
			"default-src 'self'; img-src 'self' data: https:; style-src 'self'; script-src 'self'; connect-src 'self'; font-src 'self'",
		"x-content-type-options": "nosniff",
	});
	response.end(content);
}

async function handleRequest(request, response) {
	const url = new URL(request.url ?? "/", "http://127.0.0.1");
	const { pathname } = url;

	if (request.method === "GET" && pathname === "/") {
		return sendFile(response, path.join(UI_ROOT, "index.html"));
	}
	if (request.method === "GET" && pathname === "/styles.css") {
		return sendFile(response, path.join(UI_ROOT, "styles.css"));
	}
	if (request.method === "GET" && pathname === "/app.js") {
		return sendFile(response, path.join(UI_ROOT, "app.js"));
	}
	if (request.method === "GET" && pathname === "/vendor/marked.min.js") {
		return sendFile(response, path.join(PROJECT_ROOT, "public", "assets", "js", "marked.min.js"));
	}
	if (request.method === "GET" && pathname === "/api/config") {
		const { overrides: _overrides, ...config } = JSON.parse(
			await readFile(CONFIG_PATH, "utf8"),
		);
		return sendJson(response, 200, config);
	}
	if (request.method === "PUT" && pathname === "/api/config") {
		const config = validateConfig(await readJsonBody(request));
		const current = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
		const overrides = isRecord(current.overrides) ? current.overrides : {};
		syncOverrideFromBasicForm(overrides, config);
		await writeFile(
			CONFIG_PATH,
			`${JSON.stringify({ ...config, overrides }, null, "\t")}\n`,
			"utf8",
		);
		return sendJson(response, 200, { ok: true, config });
	}
	if (request.method === "GET" && pathname === "/api/config/all") {
		const [modules, footerHtml] = await Promise.all([
			loadAllConfigModules(),
			readFile(FOOTER_HTML_PATH, "utf8"),
		]);
		return sendJson(response, 200, { modules: { ...modules, footerHtml } });
	}
	if (request.method === "PUT" && pathname === "/api/config/module") {
		const payload = requireRecord(await readJsonBody(request), "配置模块");
		const key = requireString(payload.key, "配置模块名称", 100);
		if (key === "footerHtml") {
			if (typeof payload.value !== "string") throw new RequestError("页脚 HTML 必须是文本");
			if (payload.value.length > 200_000) throw new RequestError("页脚 HTML 内容过长");
			await writeFile(FOOTER_HTML_PATH, payload.value, "utf8");
			return sendJson(response, 200, { ok: true, key, value: payload.value });
		}
		if (!CONFIG_MODULE_KEYS.has(key)) throw new RequestError("不支持该配置模块");
		assertJsonValue(payload.value);
		const adminData = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
		const overrides = isRecord(adminData.overrides) ? adminData.overrides : {};
		overrides[key] = payload.value;
		adminData.overrides = overrides;
		syncBasicFormFromModule(adminData, key, payload.value);
		await writeFile(CONFIG_PATH, `${JSON.stringify(adminData, null, "\t")}\n`, "utf8");
		return sendJson(response, 200, { ok: true, key, value: payload.value });
	}
	if (request.method === "GET" && pathname === "/api/posts") {
		return sendJson(response, 200, { posts: await listPosts() });
	}
	if (request.method === "GET" && pathname === "/api/post") {
		const relativePath = url.searchParams.get("path");
		return sendJson(response, 200, await readPost(relativePath));
	}
	if (request.method === "PUT" && pathname === "/api/post") {
		const payload = requireRecord(await readJsonBody(request), "文章");
		const prepared = preparePostInput(payload.body, payload.fields);
		const { fields } = prepared;

		const isNew = !payload.originalPath;
		const relativePath = isNew ? safeNewFileName(payload.fileName) : payload.originalPath;
		const fullPath = safePostPath(relativePath);
		let source = prepared.source ?? "";
		if (prepared.source === null && !isNew) source = await readFile(fullPath, "utf8");
		const nextSource = patchFrontmatter(source, fields);
		const frontmatter = nextSource.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)?.[0];
		if (!frontmatter) throw new RequestError("无法生成文章头信息", 500);
		const body = prepared.body.replace(/^(?:\r?\n)+/, "");
		const finalSource = `${frontmatter}${body}${body.endsWith("\n") ? "" : "\n"}`;
		await writeFile(fullPath, finalSource, isNew ? { encoding: "utf8", flag: "wx" } : "utf8");
		return sendJson(response, 200, {
			ok: true,
			post: await readPost(relativePath.replaceAll("\\", "/")),
		});
	}

	throw new RequestError("未找到该页面", 404);
}

export function createAdminServer() {
	return createServer(async (request, response) => {
		try {
			await handleRequest(request, response);
		} catch (error) {
			const status = error?.code === "ENOENT" ? 404 : error?.code === "EEXIST" ? 409 : error.status ?? 500;
			const message =
				status === 500 ? "后台处理失败，请查看终端错误" : error.message ?? "请求失败";
			if (status === 500) console.error(error);
			sendJson(response, status, { error: message });
		}
	});
}

function listenOnce(server, port) {
	return new Promise((resolve, reject) => {
		const handleError = (error) => {
			server.off("listening", handleListening);
			reject(error);
		};
		const handleListening = () => {
			server.off("error", handleError);
			resolve();
		};
		server.once("error", handleError);
		server.once("listening", handleListening);
		server.listen(port, "127.0.0.1");
	});
}

export async function listenAdminServer(
	server,
	preferredPort,
	{ allowFallback = true, maxAttempts = 20 } = {},
) {
	let port = preferredPort;
	for (let attempt = 0; attempt < maxAttempts; attempt += 1, port += 1) {
		try {
			await listenOnce(server, port);
			return { port, fallback: port !== preferredPort };
		} catch (error) {
			if (error?.code !== "EADDRINUSE" || !allowFallback) throw error;
		}
	}
	throw new Error(`端口 ${preferredPort} 到 ${port - 1} 均被占用`);
}

function parsePort() {
	const index = process.argv.indexOf("--port");
	if (index === -1) return 4322;
	const port = Number(process.argv[index + 1]);
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error("--port 后需要提供有效端口号");
	}
	return port;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
	const preferredPort = parsePort();
	const allowFallback = !process.argv.includes("--port");
	const server = createAdminServer();
	listenAdminServer(server, preferredPort, { allowFallback })
		.then(({ port, fallback }) => {
			if (fallback) console.log(`\n  端口 ${preferredPort} 已被占用，已自动改用 ${port}。`);
			console.log(`\n  Lunan 内容工作台已启动：\n  http://127.0.0.1:${port}\n`);
			console.log("  仅本机可访问，按 Ctrl+C 停止。\n");
		})
		.catch((error) => {
			if (error?.code === "EADDRINUSE") {
				console.error(`\n  端口 ${preferredPort} 已被占用，请关闭占用程序或换一个端口。\n`);
			} else {
				console.error(`\n  工作台启动失败：${error.message}\n`);
			}
			process.exitCode = 1;
		});
}
