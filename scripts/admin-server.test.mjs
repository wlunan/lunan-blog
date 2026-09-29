import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { patchFrontmatter, validateConfig } from "./admin-server.mjs";

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
	assert.match(result, /published: "2026-09-29"/);
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
published: "2026-09-29"
tags: []
draft: true
---
正文`,
	);
});

test("validateConfig 接受仓库中的受管配置", async () => {
	const source = await readFile(new URL("../src/config/adminConfig.json", import.meta.url), "utf8");
	const config = JSON.parse(source);
	assert.deepEqual(validateConfig(config), config);
});

test("validateConfig 拒绝危险协议和越界数值", async () => {
	const source = await readFile(new URL("../src/config/adminConfig.json", import.meta.url), "utf8");
	const config = JSON.parse(source);
	config.site.siteUrl = "javascript:alert(1)";
	config.appearance.themeHue = 999;
	assert.throws(() => validateConfig(config));
});
