import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";
import {
	getArrayItemMeta,
	getEnumOptions,
	getFieldMeta,
	normalizeConfigPath,
} from "./admin-ui/config-metadata.js";
import {
	createAdminServer,
	listenAdminServer,
	movePostToTrash,
	patchFrontmatter,
	preparePostInput,
	validateConfig,
} from "./admin-server.mjs";

test("完整配置元数据将嵌套字段和导航项目转换为可读内容", () => {
	assert.equal(
		normalizeConfigPath("navBarConfig", ["links", 0, "children", 1, "pageKey"]),
		"navBarConfig.links[].children[].pageKey",
	);
	assert.deepEqual(getFieldMeta("navBarConfig", ["links", 0, "icon"], "icon"), {
		label: "图标代码",
		description: "Iconify 图标标识，格式通常为“图标集:图标名”。",
		technicalPath: "navBarConfig.links[].icon",
		unit: "",
	});
	assert.deepEqual(
		getArrayItemMeta(
			"navBarConfig",
			["links"],
			{ name: "文章", url: "#", children: [{ name: "归档" }, { name: "分类" }] },
			0,
		),
		{ title: "文章", detail: "2 个子菜单 · #" },
	);
	assert.deepEqual(getEnumOptions("navBarSearchConfig", ["method"]), [
		[0, "Pagefind（站内静态搜索）"],
	]);
	assert.ok(
		getEnumOptions("sidebarLayoutConfig", ["rightComponents", 0, "type"]).some(
			([value, label]) => value === "advertisement" && label === "广告",
		),
	);
	assert.ok(
		getEnumOptions("live2dWidgetConfig", ["menus", "items", 0, "action"]).some(
			([value, label]) => value === "switchModel" && label === "切换模型",
		),
	);
});

function listen(server, port = 0) {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, "127.0.0.1", () => resolve(server.address().port));
	});
}

function close(server) {
	return new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

test("patchFrontmatter 更新已知字段并保留未管理字段", () => {
	const source = `---
title: 旧标题
published: 2026-08-07
date: 2026-08-07T17:15:09+08:00
tags:
  - 旧标签
custom: keep-me
---
# 正文
`;
	const result = patchFrontmatter(source, {
		title: "新标题：保留标点",
		published: "2026-09-29",
		tags: ["Astro", "内容管理"],
	});

	assert.match(result, /title: "新标题：保留标点"/);
	assert.match(result, /published: 2026-09-29/);
	assert.match(result, /tags:\n  - "Astro"\n  - "内容管理"/);
	assert.match(result, /date: 2026-08-07T17:15:09\+08:00/);
	assert.match(result, /custom: keep-me/);
	assert.match(result, /# 正文/);
});

test("patchFrontmatter 可创建新文章并省略空更新日期", () => {
	const result = patchFrontmatter("正文", {
		title: "第一篇文章",
		published: "2026-09-29",
		updated: "",
		tags: [],
		draft: true,
	});

	assert.equal(
		result,
		`---
title: "第一篇文章"
published: 2026-09-29
tags: []
draft: true
---
正文`,
	);
});

test("preparePostInput 导入完整 Markdown 的元数据并从正文移除 Frontmatter", () => {
	const pastedMarkdown = `---
title: 外部文章标题
published: 2026-09-20
tags:
  - Astro
  - 内容迁移
draft: true
custom: keep-me
---
# 正文标题

正文内容。
`;
	const prepared = preparePostInput(pastedMarkdown, {
		title: "右侧表单标题",
		published: "2026-09-29",
		tags: ["右侧标签"],
		draft: false,
	});

	assert.equal(prepared.fields.title, "外部文章标题");
	assert.equal(prepared.fields.published, "2026-09-20");
	assert.deepEqual(prepared.fields.tags, ["Astro", "内容迁移"]);
	assert.equal(prepared.fields.draft, true);
	assert.equal(prepared.body, "# 正文标题\n\n正文内容。\n");

	const patched = patchFrontmatter(prepared.source, prepared.fields);
	const parsed = matter(patched);
	assert.ok(parsed.data.published instanceof Date);
	assert.equal(parsed.data.custom, "keep-me");
	assert.equal(parsed.content, "# 正文标题\n\n正文内容。\n");
});

test("preparePostInput 保持不带 Frontmatter 的正文和右侧字段", () => {
	const prepared = preparePostInput("# 普通正文\n", {
		title: "右侧表单标题",
		published: "2026-09-29",
		tags: ["右侧标签"],
		draft: false,
	});

	assert.equal(prepared.source, null);
	assert.equal(prepared.body, "# 普通正文\n");
	assert.equal(prepared.fields.title, "右侧表单标题");
	assert.deepEqual(prepared.fields.tags, ["右侧标签"]);
});

test("movePostToTrash 将文章移入可恢复目录并拒绝越界路径", async (context) => {
	const projectRoot = await mkdtemp(path.join(tmpdir(), "firefly-admin-trash-"));
	const postsRoot = path.join(projectRoot, "posts");
	const trashRoot = path.join(projectRoot, ".admin-trash", "posts");
	const sourcePath = path.join(postsRoot, "guide", "demo.md");
	context.after(() => rm(projectRoot, { recursive: true, force: true }));

	await mkdir(path.dirname(sourcePath), { recursive: true });
	await writeFile(sourcePath, "# 可恢复文章\n", "utf8");

	const result = await movePostToTrash("guide/demo.md", {
		postsRoot,
		trashRoot,
		now: new Date("2026-09-29T09:08:07.006Z"),
	});

	await assert.rejects(access(sourcePath), (error) => error.code === "ENOENT");
	assert.equal(await readFile(result.targetPath, "utf8"), "# 可恢复文章\n");
	assert.equal(result.trashEntry, "2026-09-29T09-08-07-006Z/guide/demo.md");
	await assert.rejects(
		movePostToTrash("../outside.md", { postsRoot, trashRoot }),
		/文章路径超出允许范围/,
	);
});

test("validateConfig 接受仓库中的受管配置", async () => {
	const source = await readFile(new URL("../src/config/adminConfig.json", import.meta.url), "utf8");
	const config = JSON.parse(source);
	const { overrides: _overrides, ...managedConfig } = config;
	assert.deepEqual(validateConfig(config), managedConfig);
});

test("validateConfig 拒绝危险协议和越界数值", async () => {
	const source = await readFile(new URL("../src/config/adminConfig.json", import.meta.url), "utf8");
	const config = JSON.parse(source);
	config.site.siteUrl = "javascript:alert(1)";
	config.appearance.themeHue = 999;
	assert.throws(() => validateConfig(config));
});

test("listenAdminServer 在默认端口被占用时自动选择后续端口", async (context) => {
	const occupiedServer = createServer();
	const occupiedPort = await listen(occupiedServer);
	context.after(() => close(occupiedServer));

	const adminServer = createAdminServer();
	context.after(() => close(adminServer));
	const result = await listenAdminServer(adminServer, occupiedPort);

	assert.equal(result.fallback, true);
	assert.ok(result.port > occupiedPort);
});
