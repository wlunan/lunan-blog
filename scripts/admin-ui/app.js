const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
	posts: [],
	config: null,
	filter: "all",
	currentPost: null,
	postDirty: false,
	configDirty: false,
	loadingForm: false,
	fileNameTouched: false,
};

const viewNames = {
	overview: "概览",
	posts: "文章",
	editor: "文章编辑",
	settings: "站点设置",
};

const pageLabels = {
	friends: ["友链", "展示友情链接"],
	sponsor: ["打赏", "展示赞助入口"],
	guestbook: ["留言板", "开放访客留言"],
	bangumi: ["番组计划", "展示收藏记录"],
	gallery: ["相册", "展示图片相册"],
	anime: ["追番", "展示追番列表"],
	dynamic: ["动态", "展示短内容动态"],
	booknav: ["书签导航", "展示收藏站点"],
};

function escapeHtml(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

async function api(url, options = {}) {
	const response = await fetch(url, {
		...options,
		headers: options.body ? { "content-type": "application/json", ...options.headers } : options.headers,
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(data.error || `请求失败（${response.status}）`);
	return data;
}

let toastTimer;
function showToast(message, isError = false) {
	const toast = $("#toast");
	toast.textContent = message;
	toast.classList.toggle("is-error", isError);
	toast.classList.add("is-visible");
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2_600);
}

function closeSidebar() {
	$("#sidebar").classList.remove("is-open");
	$("#sidebar-backdrop").classList.remove("is-visible");
}

function canLeaveCurrentView(nextView) {
	const current = $(".view.is-active")?.dataset.viewPanel;
	if (current === "editor" && nextView !== "editor" && state.postDirty) {
		return window.confirm("文章还有未保存的修改，确定离开吗？");
	}
	if (current === "settings" && nextView !== "settings" && state.configDirty) {
		return window.confirm("站点设置还有未保存的修改，确定离开吗？");
	}
	return true;
}

function showView(view) {
	if (!canLeaveCurrentView(view)) return;
	$$('[data-view-panel]').forEach((panel) => panel.classList.toggle("is-active", panel.dataset.viewPanel === view));
	$$('.main-nav [data-view]').forEach((button) => {
		button.classList.toggle("is-active", button.dataset.view === view || (view === "editor" && button.dataset.view === "posts"));
	});
	$("#current-view-name").textContent = viewNames[view] || view;
	if (view !== "editor") state.postDirty = false;
	if (view !== "settings") state.configDirty = false;
	closeSidebar();
	window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatDate(value) {
	if (!value) return "未设置";
	const date = new Date(`${value}T00:00:00`);
	return Number.isNaN(date.valueOf())
		? value
		: new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function today() {
	const now = new Date();
	const offset = now.getTimezoneOffset() * 60_000;
	return new Date(now.valueOf() - offset).toISOString().slice(0, 10);
}

function renderOverview() {
	const drafts = state.posts.filter((post) => post.draft).length;
	$("#stat-total").textContent = state.posts.length;
	$("#stat-published").textContent = state.posts.length - drafts;
	$("#stat-drafts").textContent = drafts;
	$("#sidebar-post-count").textContent = state.posts.length;

	const recent = state.posts.slice(0, 5);
	$("#recent-posts").innerHTML = recent.length
		? recent
				.map(
					(post) => `
						<div class="recent-post">
							<button type="button" data-post-path="${escapeHtml(post.path)}">${post.pinned ? "★ " : ""}${escapeHtml(post.title)}</button>
							<time>${escapeHtml(formatDate(post.published))}</time>
							<span class="badge ${post.draft ? "draft" : ""}">${post.draft ? "草稿" : "已发布"}</span>
						</div>`,
				)
				.join("")
		: '<div class="empty-state">还没有文章，先写下第一篇吧。</div>';
}

function filteredPosts() {
	const query = $("#post-search").value.trim().toLocaleLowerCase();
	return state.posts.filter((post) => {
		const matchesState =
			state.filter === "all" ||
			(state.filter === "draft" && post.draft) ||
			(state.filter === "published" && !post.draft);
		const haystack = [post.title, post.category, post.path, ...(post.tags || [])].join(" ").toLocaleLowerCase();
		return matchesState && (!query || haystack.includes(query));
	});
}

function renderPostList() {
	const posts = filteredPosts();
	$("#post-list").innerHTML = posts.length
		? posts
				.map(
					(post) => `
						<button class="post-row" type="button" data-post-path="${escapeHtml(post.path)}">
							<span class="post-title-cell"><strong>${post.pinned ? "★ " : ""}${escapeHtml(post.title)}</strong><small>${escapeHtml(post.path)}</small></span>
							<span class="post-category">${escapeHtml(post.category || "未分类")}</span>
							<span class="post-date">${escapeHtml(formatDate(post.published))}</span>
							<span class="badge ${post.draft ? "draft" : ""}">${post.draft ? "草稿" : "已发布"}</span>
						</button>`,
				)
				.join("")
		: '<div class="empty-state">没有找到符合条件的文章。</div>';
}

async function loadPosts() {
	const data = await api("/api/posts");
	state.posts = data.posts;
	renderOverview();
	renderPostList();
}

function autoSizeTitle() {
	const title = $("#post-title");
	title.style.height = "auto";
	title.style.height = `${Math.max(title.scrollHeight, 48)}px`;
}

function setPostDirty(value) {
	state.postDirty = value;
	const label = $("#post-save-state");
	label.textContent = value ? "有未保存的修改" : "所有修改已保存";
	label.classList.toggle("is-dirty", value);
}

function defaultPost() {
	return {
		path: "",
		fields: {
			title: "",
			published: today(),
			updated: "",
			description: "",
			image: "",
			tags: [],
			category: "",
			draft: true,
			lang: "",
			pinned: false,
			author: state.config?.profile?.name || "",
			sourceLink: "",
			licenseName: "",
			licenseUrl: "",
			comment: true,
			password: "",
			passwordHint: "",
		},
		body: "",
	};
}

const postFieldIds = {
	title: "post-title",
	published: "post-published",
	updated: "post-updated",
	description: "post-description",
	image: "post-image",
	category: "post-category",
	lang: "post-lang",
	author: "post-author",
	sourceLink: "post-source-link",
	licenseName: "post-license-name",
	licenseUrl: "post-license-url",
	password: "post-password",
	passwordHint: "post-password-hint",
	draft: "post-draft",
	pinned: "post-pinned",
	comment: "post-comment",
};

function fillPostForm(post) {
	state.loadingForm = true;
	state.currentPost = post;
	for (const [field, id] of Object.entries(postFieldIds)) {
		const input = $(`#${id}`);
		if (input.type === "checkbox") input.checked = Boolean(post.fields[field]);
		else input.value = post.fields[field] ?? "";
	}
	$("#post-tags").value = post.fields.tags.join(", ");
	$("#post-body").value = post.body;
	$("#post-file-name").value = "";
	$("#new-file-row").classList.toggle("is-hidden", Boolean(post.path));
	state.fileNameTouched = false;
	autoSizeTitle();
	updatePreview();
	setEditorPane("write");
	setPostDirty(false);
	state.loadingForm = false;
}

async function openEditor(path) {
	try {
		const post = path ? await api(`/api/post?path=${encodeURIComponent(path)}`) : defaultPost();
		fillPostForm(post);
		showView("editor");
		setTimeout(() => $("#post-title").focus(), 50);
	} catch (error) {
		showToast(error.message, true);
	}
}

function collectPostFields() {
	const fields = {};
	for (const [field, id] of Object.entries(postFieldIds)) {
		const input = $(`#${id}`);
		fields[field] = input.type === "checkbox" ? input.checked : input.value;
	}
	fields.tags = $("#post-tags")
		.value.split(/[,，]/)
		.map((tag) => tag.trim())
		.filter(Boolean);
	return fields;
}

async function savePost() {
	const fields = collectPostFields();
	if (!fields.title.trim()) {
		showToast("请先填写文章标题", true);
		$("#post-title").focus();
		return;
	}
	if (!state.currentPost.path && !$("#post-file-name").value.trim()) {
		showToast("请填写保存文件名", true);
		$("#post-file-name").focus();
		return;
	}

	const button = $("#save-post");
	button.disabled = true;
	button.textContent = "保存中…";
	try {
		const result = await api("/api/post", {
			method: "PUT",
			body: JSON.stringify({
				originalPath: state.currentPost.path,
				fileName: $("#post-file-name").value,
				fields,
				body: $("#post-body").value,
			}),
		});
		state.currentPost = result.post;
		$("#new-file-row").classList.add("is-hidden");
		setPostDirty(false);
		await loadPosts();
		showToast("文章已保存到项目中");
	} catch (error) {
		showToast(error.message, true);
	} finally {
		button.disabled = false;
		button.textContent = "保存文章";
	}
}

function updatePreview() {
	const content = $("#post-body").value;
	const preview = $("#markdown-preview");
	preview.innerHTML = content.trim()
		? window.marked.parse(content, { breaks: true, gfm: true })
		: '<div class="empty-state">预览会显示在这里。</div>';
}

function setEditorPane(pane) {
	$$('[data-editor-pane]').forEach((element) => element.classList.toggle("is-active", element.dataset.editorPane === pane));
	$$('[data-pane]').forEach((button) => button.classList.toggle("is-active", button.dataset.pane === pane));
	if (pane === "preview") updatePreview();
}

function insertMarkdown(type) {
	const textarea = $("#post-body");
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const selected = textarea.value.slice(start, end);
	const patterns = {
		bold: [`**${selected || "粗体文字"}**`, 2, selected ? 2 + selected.length : 6],
		italic: [`*${selected || "斜体文字"}*`, 1, selected ? 1 + selected.length : 5],
		heading: [`## ${selected || "小标题"}`, 3, selected ? 3 + selected.length : 6],
		link: [`[${selected || "链接文字"}](https://)`, 1, selected ? 1 + selected.length : 5],
		quote: [`> ${selected || "引用内容"}`, 2, selected ? 2 + selected.length : 6],
		code: [`\`\`\`\n${selected || "代码"}\n\`\`\``, 4, selected ? 4 + selected.length : 6],
	};
	const [replacement, selectionStart, selectionEnd] = patterns[type];
	textarea.setRangeText(replacement, start, end, "end");
	textarea.setSelectionRange(start + selectionStart, start + selectionEnd);
	textarea.focus();
	setPostDirty(true);
}

function setConfigDirty(value) {
	state.configDirty = value;
	const label = $("#config-save-state");
	label.textContent = value ? "有未保存的修改" : "所有修改已保存";
	label.classList.toggle("is-dirty", value);
}

function renderProfileLinks(links) {
	$("#profile-links").innerHTML = links
		.map(
			(link, index) => `
				<div class="profile-link-row" data-link-index="${index}">
					<input type="text" data-link-field="name" value="${escapeHtml(link.name)}" aria-label="链接名称" placeholder="名称" />
					<input type="text" data-link-field="icon" value="${escapeHtml(link.icon)}" aria-label="图标代码" placeholder="图标代码" />
					<input class="link-url" type="text" data-link-field="url" value="${escapeHtml(link.url)}" aria-label="链接地址" placeholder="链接地址" />
					<label class="show-name-check"><input type="checkbox" data-link-field="showName" ${link.showName ? "checked" : ""} /> 显示名称</label>
					<button class="remove-link" type="button" data-remove-link="${index}" aria-label="移除链接">×</button>
				</div>`,
		)
		.join("");
}

function renderPageSwitches(pages) {
	$("#page-switches").innerHTML = Object.entries(pageLabels)
		.map(([key, [title, description]]) => `
			<label class="switch-row">
				<span><b>${title}</b><small>${description}</small></span>
				<input type="checkbox" data-page-key="${key}" ${pages[key] ? "checked" : ""} /><i></i>
			</label>`)
		.join("");
}

function updateHuePreview() {
	const hue = $("#config-theme-hue").value;
	$("#hue-value").textContent = `${hue}°`;
	$("#hue-swatch").style.background = `hsl(${hue} 68% 52%)`;
}

function fillConfigForm(config) {
	state.loadingForm = true;
	state.config = structuredClone(config);
	$("#config-title").value = config.site.title;
	$("#config-subtitle").value = config.site.subtitle;
	$("#config-site-url").value = config.site.siteUrl;
	$("#config-description").value = config.site.description;
	$("#config-keywords").value = config.site.keywords.join(", ");
	$("#config-navbar-title").value = config.site.navbarTitle;
	$("#config-avatar").value = config.profile.avatar;
	$("#config-profile-name").value = config.profile.name;
	$("#config-bio").value = config.profile.bio;
	$("#config-theme-hue").value = config.appearance.themeHue;
	$("#config-default-mode").value = config.appearance.defaultMode;
	$("#config-page-width").value = config.appearance.pageWidth;
	$("#config-card-border").checked = config.appearance.cardBorder;
	$("#config-card-follow").checked = config.appearance.cardFollowTheme;
	$("#config-desktop-layout").value = config.appearance.desktopPostLayout;
	$("#config-mobile-layout").value = config.appearance.mobilePostLayout;
	$("#config-posts-per-page").value = config.content.postsPerPage;
	$("#config-category-bar").checked = config.content.categoryBar;
	$("#config-fold-article").checked = config.content.foldArticle;
	renderProfileLinks(config.profile.links);
	renderPageSwitches(config.pages);
	updateHuePreview();
	$("#site-link").href = config.site.siteUrl;
	setConfigDirty(false);
	state.loadingForm = false;
}

function collectProfileLinks() {
	return $$(".profile-link-row").map((row) => ({
		name: $('[data-link-field="name"]', row).value,
		icon: $('[data-link-field="icon"]', row).value,
		url: $('[data-link-field="url"]', row).value,
		showName: $('[data-link-field="showName"]', row).checked,
	}));
}

function collectConfig() {
	return {
		site: {
			title: $("#config-title").value,
			subtitle: $("#config-subtitle").value,
			siteUrl: $("#config-site-url").value,
			description: $("#config-description").value,
			keywords: $("#config-keywords").value.split(/[,，]/).map((item) => item.trim()).filter(Boolean),
			navbarTitle: $("#config-navbar-title").value,
		},
		profile: {
			avatar: $("#config-avatar").value,
			name: $("#config-profile-name").value,
			bio: $("#config-bio").value,
			links: collectProfileLinks(),
		},
		appearance: {
			themeHue: Number($("#config-theme-hue").value),
			defaultMode: $("#config-default-mode").value,
			pageWidth: Number($("#config-page-width").value),
			cardBorder: $("#config-card-border").checked,
			cardFollowTheme: $("#config-card-follow").checked,
			desktopPostLayout: $("#config-desktop-layout").value,
			mobilePostLayout: $("#config-mobile-layout").value,
		},
		content: {
			postsPerPage: Number($("#config-posts-per-page").value),
			categoryBar: $("#config-category-bar").checked,
			foldArticle: $("#config-fold-article").checked,
		},
		pages: Object.fromEntries($$('[data-page-key]').map((input) => [input.dataset.pageKey, input.checked])),
	};
}

async function saveConfig() {
	const form = $("#config-form");
	if (!form.reportValidity()) return;
	const button = $("#save-config");
	button.disabled = true;
	button.textContent = "保存中…";
	try {
		const result = await api("/api/config", { method: "PUT", body: JSON.stringify(collectConfig()) });
		fillConfigForm(result.config);
		showToast("站点设置已保存");
	} catch (error) {
		showToast(error.message, true);
	} finally {
		button.disabled = false;
		button.textContent = "保存设置";
	}
}

function bindEvents() {
	document.addEventListener("click", (event) => {
		const viewButton = event.target.closest("[data-view]");
		if (viewButton) showView(viewButton.dataset.view);

		const postButton = event.target.closest("[data-post-path]");
		if (postButton) openEditor(postButton.dataset.postPath);

		if (event.target.closest('[data-action="new-post"]')) openEditor();

		const paneButton = event.target.closest("[data-pane]");
		if (paneButton) setEditorPane(paneButton.dataset.pane);

		const insertButton = event.target.closest("[data-insert]");
		if (insertButton) insertMarkdown(insertButton.dataset.insert);

		const filterButton = event.target.closest("[data-filter]");
		if (filterButton) {
			state.filter = filterButton.dataset.filter;
			$$('[data-filter]').forEach((button) => button.classList.toggle("is-active", button === filterButton));
			renderPostList();
		}

		const removeButton = event.target.closest("[data-remove-link]");
		if (removeButton) {
			removeButton.closest(".profile-link-row").remove();
			setConfigDirty(true);
		}
	});

	$("#menu-button").addEventListener("click", () => {
		$("#sidebar").classList.add("is-open");
		$("#sidebar-backdrop").classList.add("is-visible");
	});
	$("#sidebar-backdrop").addEventListener("click", closeSidebar);
	$("#post-search").addEventListener("input", renderPostList);
	$("#editor-back").addEventListener("click", () => showView("posts"));
	$("#save-post").addEventListener("click", savePost);
	$("#save-config").addEventListener("click", saveConfig);
	$("#config-form").addEventListener("submit", (event) => event.preventDefault());

	$("#view-editor").addEventListener("input", (event) => {
		if (state.loadingForm) return;
		if (event.target === $("#post-title")) {
			autoSizeTitle();
			if (!state.currentPost.path && !state.fileNameTouched) $("#post-file-name").value = event.target.value;
		}
		if (event.target === $("#post-file-name")) state.fileNameTouched = true;
		setPostDirty(true);
	});

	$("#config-form").addEventListener("input", (event) => {
		if (state.loadingForm) return;
		if (event.target === $("#config-theme-hue")) updateHuePreview();
		setConfigDirty(true);
	});

	$("#add-profile-link").addEventListener("click", () => {
		const links = collectProfileLinks();
		links.push({ name: "", icon: "material-symbols:link", url: "", showName: false });
		renderProfileLinks(links);
		setConfigDirty(true);
		$('.profile-link-row:last-child [data-link-field="name"]')?.focus();
	});

	document.addEventListener("keydown", (event) => {
		if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") return;
		event.preventDefault();
		const current = $(".view.is-active")?.dataset.viewPanel;
		if (current === "editor") savePost();
		if (current === "settings") saveConfig();
	});

	window.addEventListener("beforeunload", (event) => {
		if (!state.postDirty && !state.configDirty) return;
		event.preventDefault();
	});
}

async function initialize() {
	bindEvents();
	try {
		const [config] = await Promise.all([api("/api/config"), loadPosts()]);
		fillConfigForm(config);
		const hour = new Date().getHours();
		const greeting = hour < 11 ? "上午好" : hour < 18 ? "下午好" : "晚上好";
		$("#view-overview h1").textContent = `${greeting}，${config.profile.name}`;
	} catch (error) {
		showToast(error.message, true);
	}
}

initialize();
