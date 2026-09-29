const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
	posts: [],
	config: null,
	filter: "all",
	currentPost: null,
	postDirty: false,
	configDirty: false,
	modules: {},
	selectedModule: "",
	moduleValue: null,
	moduleDirty: false,
	loadingForm: false,
	fileNameTouched: false,
};

const viewNames = {
	overview: "概览",
	posts: "文章",
	editor: "文章编辑",
	settings: "常用设置",
	"config-center": "全部配置",
};

const moduleMeta = [
	["基础", "siteConfig", "站点核心", "标题、导航、文章列表、页面能力与图片优化", "站"],
	["基础", "profileConfig", "个人资料", "头像、名称、签名与个人链接", "人"],
	["基础", "navBarConfig", "导航菜单", "顶部导航及多级链接", "导"],
	["基础", "LinkPresets", "导航预设", "主页、归档、分类等内置链接", "链"],
	["基础", "navBarSearchConfig", "导航搜索", "导航栏搜索方式", "搜"],
	["外观", "backgroundWallpaper", "背景壁纸", "壁纸、视频、横幅文字、轮播与水波纹", "景"],
	["外观", "coverImageConfig", "文章封面", "详情页封面与随机封面接口", "图"],
	["外观", "displaySettingsConfig", "访客显示设置", "允许访客切换的外观选项", "显"],
	["外观", "sidebarLayoutConfig", "侧边栏布局", "左、右和移动端组件排列", "栏"],
	["外观", "sakuraConfig", "樱花特效", "数量、透明度、速度与层级", "花"],
	["外观", "fontConfig", "字体选择", "全局与区域字体选择", "字"],
	["外观", "fontsList", "字体资源", "字体提供商、字重与回退字体", "Aa"],
	["外观", "expressiveCodeConfig", "代码块", "代码主题、折叠与语言标识", "码"],
	["内容", "announcementConfig", "公告", "公告内容、关闭按钮和跳转链接", "告"],
	["内容", "dynamicConfig", "动态页面", "动态来源、分页、评论与 Memos", "动"],
	["内容", "friendsPageConfig", "友链页面", "页面文案、评论和排序方式", "友"],
	["内容", "friendsConfig", "友链列表", "站点、头像、标签与权重", "链"],
	["内容", "galleryConfig", "相册", "相册列表、密码与瀑布流宽度", "册"],
	["内容", "booknavPageConfig", "书签页面", "页面文案和 Favicon 服务", "签"],
	["内容", "booknavConfig", "书签列表", "分组与站点链接", "书"],
	["内容", "sponsorConfig", "打赏", "收款方式、打赏者和页面文案", "赏"],
	["内容", "footerConfig", "页脚开关", "自定义页脚注入开关", "页"],
	["内容", "footerHtml", "页脚内容", "备案号等自定义 HTML 内容", "文"],
	["集成", "commentConfig", "评论系统", "Twikoo、Waline、Giscus、Artalk 与 Disqus", "评"],
	["集成", "analyticsConfig", "访问统计", "Google、Clarity、Umami 与 51la", "析"],
	["集成", "musicPlayerConfig", "音乐播放器", "音乐源、播放模式和接口", "乐"],
	["集成", "licenseConfig", "内容许可", "文章许可协议与图标", "权"],
	["集成", "mermaidConfig", "Mermaid", "图表明暗主题", "M"],
	["集成", "plantumlConfig", "PlantUML", "服务器与明暗主题", "P"],
	["组件", "spineModelConfig", "Spine 看板娘", "模型、动作、消息与响应式设置", "S"],
	["组件", "live2dWidgetConfig", "Live2D 看板娘", "模型、菜单、气泡和动画", "L"],
].map(([group, key, title, description, icon]) => ({ group, key, title, description, icon }));

const moduleMetaByKey = Object.fromEntries(moduleMeta.map((item) => [item.key, item]));

const fieldLabels = {
	enable: "启用",
	enabled: "启用",
	title: "标题",
	subtitle: "副标题",
	description: "描述",
	content: "内容",
	name: "名称",
	url: "链接地址",
	icon: "图标",
	type: "类型",
	mode: "模式",
	position: "位置",
	weight: "权重",
	lang: "语言",
	image: "图片",
	avatar: "头像",
	bio: "个人签名",
	links: "链接",
	items: "项目",
	tags: "标签",
	pages: "页面开关",
	keywords: "关键词",
	pageWidth: "页面宽度",
	showComment: "显示评论",
	showTitle: "显示标题",
	showOnPostPage: "文章页显示",
	hideOnNonPostPage: "非文章页隐藏",
	hideOnMobile: "移动端隐藏",
	itemsPerPage: "每页数量",
	postsPerPage: "每页文章数",
	columnWidth: "最小列宽",
	visitorCount: "访问量统计",
	external: "外部链接",
	closable: "允许关闭",
	server: "服务地址",
	serverURL: "服务地址",
	apiUrl: "接口地址",
	api: "接口地址",
	path: "文件路径",
	scale: "缩放比例",
	opacity: "透明度",
	blur: "模糊度",
	zIndex: "层级",
	width: "宽度",
	height: "高度",
	duration: "持续时间",
	interval: "间隔时间",
	speed: "速度",
	volume: "音量",
	showLyrics: "显示歌词",
	showInNavbar: "导航栏显示",
	showInSidebar: "侧边栏显示",
	showSponsorsList: "显示打赏者",
	showButtonInPost: "文章页显示按钮",
	methods: "打赏方式",
	sponsors: "打赏者",
	albums: "相册列表",
	desktop: "桌面端",
	mobile: "移动端",
	lightTheme: "亮色主题",
	darkTheme: "暗色主题",
	primaryColor: "主题色",
	fallbacks: "回退字体",
	weights: "字重",
	styles: "样式",
	subsets: "字符子集",
	provider: "字体来源",
	cssVariable: "CSS 变量",
};

const enumOptions = {
	"siteConfig.themeColor.defaultMode": [["system", "跟随系统"], ["light", "亮色"], ["dark", "暗色"]],
	"siteConfig.lang": [["zh_CN", "简体中文"], ["zh_TW", "繁体中文"], ["en", "英语"], ["ja", "日语"], ["ko", "韩语"], ["ru", "俄语"]],
	"siteConfig.postListLayout.defaultMode": [["list", "列表"], ["grid", "网格"]],
	"siteConfig.postListLayout.mobileDefaultMode": [["list", "列表"], ["grid", "网格"]],
	"siteConfig.imageOptimization.formats": [["avif", "AVIF"], ["webp", "WebP"], ["both", "两种格式"]],
	"backgroundWallpaper.mode": [["banner", "横幅"], ["fullscreen", "全屏"], ["overlay", "透明覆盖"], ["none", "纯色"]],
	"backgroundWallpaper.common.playerMode": [["order", "顺序"], ["random", "随机"]],
	"backgroundWallpaper.common.postInfo.mode": [["description", "文章摘要"], ["meta", "文章信息"]],
	"backgroundWallpaper.common.navbar.transparentMode": [["semi", "半透明"], ["full", "完全透明"], ["semifull", "动态透明"]],
	"commentConfig.type": [["none", "关闭"], ["twikoo", "Twikoo"], ["waline", "Waline"], ["giscus", "Giscus"], ["disqus", "Disqus"], ["artalk", "Artalk"]],
	"commentConfig.waline.login": [["enable", "允许登录"], ["force", "强制登录"], ["disable", "禁止登录"]],
	"musicPlayerConfig.mode": [["meting", "Meting"], ["gdstudio", "GD Studio"], ["local", "本地列表"]],
	"musicPlayerConfig.playMode": [["list", "列表循环"], ["one", "单曲循环"], ["random", "随机播放"]],
	"sidebarLayoutConfig.position": [["left", "左侧"], ["right", "右侧"], ["both", "双侧"]],
	"sidebarLayoutConfig.tabletSidebar": [["left", "左侧"], ["right", "右侧"]],
	"live2dWidgetConfig.position": [["bottom-left", "左下"], ["bottom-right", "右下"]],
	"spineModelConfig.position.corner": [["bottom-left", "左下"], ["bottom-right", "右下"], ["top-left", "左上"], ["top-right", "右上"]],
};

const arrayTemplates = {
	"sponsorConfig.sponsors": { name: "", avatar: "", amount: "", date: "" },
	"sponsorConfig.methods": { name: "", icon: "", qrCode: "", link: "", description: "", enabled: true },
	"friendsConfig": { title: "", imgurl: "", desc: "", siteurl: "", tags: [], weight: 0, enabled: true },
	"galleryConfig.albums": { id: "", name: "", description: "", location: "", date: "", tags: [] },
	"booknavConfig": { id: "", name: "", icon: "", desc: "", weight: 0, items: [] },
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
	if (current === "config-center" && nextView !== "config-center" && state.moduleDirty) {
		return window.confirm("当前配置模块还有未保存的修改，确定离开吗？");
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
	if (view !== "config-center") state.moduleDirty = false;
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
		autoSizeTitle();
		$("#post-title").focus();
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
		fillPostForm(result.post);
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

function fieldLabel(key) {
	if (!key) return "配置项";
	return fieldLabels[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase());
}

function pathAttribute(path) {
	return escapeHtml(JSON.stringify(path));
}

function modulePath(path) {
	return `${state.selectedModule}${path.length ? `.${path.join(".")}` : ""}`;
}

function getAtPath(root, path) {
	return path.reduce((value, key) => value?.[key], root);
}

function setAtPath(root, path, value) {
	if (path.length === 0) {
		state.moduleValue = value;
		return;
	}
	const parent = getAtPath(root, path.slice(0, -1));
	parent[path.at(-1)] = value;
}

function sensitiveField(key) {
	return /^(password|apiKey|auth)$/i.test(key);
}

function renderEnum(value, path, key) {
	const options = enumOptions[modulePath(path)];
	if (!options) return null;
	return `<select data-config-path="${pathAttribute(path)}">${options
		.map(([optionValue, label]) => `<option value="${escapeHtml(optionValue)}" ${value === optionValue ? "selected" : ""}>${escapeHtml(label)}</option>`)
		.join("")}</select>`;
}

function renderPrimitive(value, path, key) {
	const label = fieldLabel(key);
	const rawPath = path.join(".");
	if (typeof value === "boolean") {
		return `<label class="config-leaf switch-row"><span><b>${escapeHtml(label)}</b><small>${escapeHtml(rawPath)}</small></span><input type="checkbox" data-config-path="${pathAttribute(path)}" ${value ? "checked" : ""} /><i></i></label>`;
	}

	const enumControl = typeof value === "string" ? renderEnum(value, path, key) : null;
	let control = enumControl;
	if (!control && typeof value === "number") {
		control = `<input type="number" step="any" data-config-path="${pathAttribute(path)}" value="${escapeHtml(value)}" />`;
	}
	if (!control && typeof value === "string") {
		const multiline = value.includes("\n") || value.length > 90 || /^(content|description|usage|messages|welcomeMessage)$/i.test(key);
		control = multiline
			? `<textarea rows="4" data-config-path="${pathAttribute(path)}">${escapeHtml(value)}</textarea>`
			: `<input type="${sensitiveField(key) ? "password" : "text"}" data-config-path="${pathAttribute(path)}" value="${escapeHtml(value)}" />`;
	}
	if (!control) {
		control = `<input type="text" data-config-path="${pathAttribute(path)}" value="${escapeHtml(value ?? "")}" />`;
	}
	return `<label class="config-leaf field"><span>${escapeHtml(label)}<small>${escapeHtml(rawPath)}</small></span>${control}</label>`;
}

function renderArray(value, path, key, depth) {
	const label = fieldLabel(key);
	const lastKey = path.at(-1);
	const knownObjectArray = Boolean(arrayTemplates[modulePath(path)])
		|| (state.selectedModule === "booknavConfig" && lastKey === "items")
		|| (state.selectedModule === "navBarConfig" && ["links", "children"].includes(lastKey))
		|| (state.selectedModule === "live2dWidgetConfig" && lastKey === "items");
	const containsObjects = knownObjectArray || value.some((item) => item !== null && typeof item === "object");
	if (!containsObjects) {
		return `<label class="config-leaf field"><span>${escapeHtml(label)}<small>${escapeHtml(path.join("."))} · 每行一项</small></span><textarea rows="${Math.min(Math.max(value.length + 1, 3), 9)}" data-config-path="${pathAttribute(path)}" data-config-list="true">${escapeHtml(value.join("\n"))}</textarea></label>`;
	}

	return `<section class="config-array">
		<div class="config-array-header"><h3>${escapeHtml(label)} <small>${value.length} 项</small></h3><button class="secondary-button" type="button" data-array-add="${pathAttribute(path)}">＋ 复制新增</button></div>
		<div class="config-array-items">${value
			.map(
				(item, index) => `<article class="config-array-item">
					<div class="config-array-item-head"><span>项目 ${index + 1}</span><div class="config-array-actions">
						<button type="button" data-array-move="up" data-array-path="${pathAttribute(path)}" data-array-index="${index}" aria-label="上移">↑</button>
						<button type="button" data-array-move="down" data-array-path="${pathAttribute(path)}" data-array-index="${index}" aria-label="下移">↓</button>
						<button class="danger-button" type="button" data-array-remove="${pathAttribute(path)}" data-array-index="${index}" aria-label="移除">×</button>
					</div></div>
					<div class="config-fields">${renderValue(item, [...path, index], `项目 ${index + 1}`, depth + 1, true)}</div>
				</article>`,
			)
			.join("")}</div>
	</section>`;
}

function renderObject(value, path, key, depth, inline = false) {
	const fields = Object.entries(value)
		.map(([childKey, childValue]) => renderValue(childValue, [...path, childKey], childKey, depth + 1))
		.join("");
	if (inline || path.length === 0) return fields;
	return `<details class="config-object" ${depth < 2 ? "open" : ""}><summary>${escapeHtml(fieldLabel(key))}<small>${Object.keys(value).length} 个字段</small></summary><div class="config-object-fields">${fields}</div></details>`;
}

function renderValue(value, path, key, depth = 0, inline = false) {
	if (Array.isArray(value)) return renderArray(value, path, key, depth);
	if (value !== null && typeof value === "object") return renderObject(value, path, key, depth, inline);
	return renderPrimitive(value, path, key);
}

function setModuleDirty(value) {
	state.moduleDirty = value;
	const label = $("#module-save-state");
	label.textContent = value ? "当前模块有未保存修改" : state.selectedModule ? "当前模块已保存" : "选择一个模块";
	label.classList.toggle("is-dirty", value);
	$("#save-module").disabled = !state.selectedModule || !value;
}

function renderModuleList() {
	const query = $("#config-module-search").value.trim().toLocaleLowerCase();
	const visible = moduleMeta.filter((item) => {
		if (!(item.key in state.modules)) return false;
		return !query || `${item.title} ${item.description} ${item.key}`.toLocaleLowerCase().includes(query);
	});
	let currentGroup = "";
	$("#config-module-list").innerHTML = visible.length
		? visible
				.map((item) => {
					const heading = item.group !== currentGroup ? `<div class="config-module-group">${item.group}</div>` : "";
					currentGroup = item.group;
					return `${heading}<button class="config-module-button ${state.selectedModule === item.key ? "is-active" : ""}" type="button" data-module-key="${item.key}"><span>${item.icon}</span><span><b>${item.title}</b><small>${item.description}</small></span></button>`;
				})
				.join("")
		: '<div class="empty-state">没有匹配的配置模块。</div>';
}

function renderModuleEditor() {
	const meta = moduleMetaByKey[state.selectedModule];
	if (!meta) return;
	const isFooterHtml = state.selectedModule === "footerHtml";
	const fields = isFooterHtml
		? `<div class="config-notice">此内容会直接注入页脚，请只填写你信任的 HTML。保存前不会执行其中的脚本。</div><textarea class="config-html-editor" data-config-path="[]" aria-label="页脚 HTML">${escapeHtml(state.moduleValue)}</textarea>`
		: `<div class="config-notice">后台保存的是覆盖项，原配置文件中的默认值和注释不会被删除。部分构建期配置需要重启 <code>pnpm dev</code> 才会生效。</div><div class="config-fields">${renderValue(state.moduleValue, [], meta.title, 0, true)}</div>`;
	$("#config-editor-panel").innerHTML = `<header class="config-editor-header"><div><h2>${escapeHtml(meta.title)}</h2><p>${escapeHtml(meta.description)}</p></div><span class="config-source-tag">${escapeHtml(state.selectedModule)}</span></header>${fields}`;
}

function openModule(key, force = false) {
	if (!force && state.moduleDirty && !window.confirm("当前配置模块还有未保存的修改，确定切换吗？")) return;
	state.selectedModule = key;
	state.moduleValue = structuredClone(state.modules[key]);
	renderModuleList();
	renderModuleEditor();
	setModuleDirty(false);
}

async function loadAllModules(selectDefault = true) {
	const data = await api("/api/config/all");
	state.modules = data.modules;
	$("#config-module-count").textContent = Object.keys(state.modules).length;
	renderModuleList();
	if (selectDefault || !state.selectedModule) openModule("siteConfig", true);
	else if (state.selectedModule in state.modules) openModule(state.selectedModule, true);
}

function arrayTemplate(path, array) {
	if (array.length) return structuredClone(array.at(-1));
	const exact = arrayTemplates[modulePath(path)];
	if (exact) return structuredClone(exact);
	const lastKey = path.at(-1);
	if (state.selectedModule === "booknavConfig" && lastKey === "items") {
		return { title: "", url: "", desc: "", icon: "", weight: 0 };
	}
	if (state.selectedModule === "navBarConfig" && ["links", "children"].includes(lastKey)) {
		return { name: "新链接", url: "/", icon: "material-symbols:link", external: false };
	}
	if (state.selectedModule === "live2dWidgetConfig" && lastKey === "items") {
		return { icon: "mdi:link", label: "新菜单", action: "home" };
	}
	return {};
}

async function saveModule() {
	if (!state.selectedModule || !state.moduleDirty) return;
	const button = $("#save-module");
	button.disabled = true;
	button.textContent = "保存中…";
	try {
		const result = await api("/api/config/module", {
			method: "PUT",
			body: JSON.stringify({ key: state.selectedModule, value: state.moduleValue }),
		});
		state.modules[state.selectedModule] = structuredClone(result.value);
		setModuleDirty(false);
		if (["siteConfig", "profileConfig"].includes(state.selectedModule)) {
			fillConfigForm(await api("/api/config"));
		}
		showToast(`${moduleMetaByKey[state.selectedModule].title}已保存`);
	} catch (error) {
		showToast(error.message, true);
	} finally {
		button.textContent = "保存当前模块";
		button.disabled = !state.moduleDirty;
	}
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
		if (!state.moduleDirty) await loadAllModules(false);
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

		const moduleButton = event.target.closest("[data-module-key]");
		if (moduleButton) openModule(moduleButton.dataset.moduleKey);

		const addArrayButton = event.target.closest("[data-array-add]");
		if (addArrayButton) {
			const path = JSON.parse(addArrayButton.dataset.arrayAdd);
			const array = getAtPath(state.moduleValue, path);
			array.push(arrayTemplate(path, array));
			renderModuleEditor();
			setModuleDirty(true);
		}

		const removeArrayButton = event.target.closest("[data-array-remove]");
		if (removeArrayButton) {
			const path = JSON.parse(removeArrayButton.dataset.arrayRemove);
			const array = getAtPath(state.moduleValue, path);
			array.splice(Number(removeArrayButton.dataset.arrayIndex), 1);
			renderModuleEditor();
			setModuleDirty(true);
		}

		const moveArrayButton = event.target.closest("[data-array-move]");
		if (moveArrayButton) {
			const path = JSON.parse(moveArrayButton.dataset.arrayPath);
			const array = getAtPath(state.moduleValue, path);
			const index = Number(moveArrayButton.dataset.arrayIndex);
			const targetIndex = moveArrayButton.dataset.arrayMove === "up" ? index - 1 : index + 1;
			if (targetIndex >= 0 && targetIndex < array.length) {
				[array[index], array[targetIndex]] = [array[targetIndex], array[index]];
				renderModuleEditor();
				setModuleDirty(true);
			}
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
	$("#save-module").addEventListener("click", saveModule);
	$("#config-module-search").addEventListener("input", renderModuleList);
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

	$("#config-editor-panel").addEventListener("input", (event) => {
		const control = event.target.closest("[data-config-path]");
		if (!control) return;
		const path = JSON.parse(control.dataset.configPath);
		let value = control.value;
		if (control.type === "checkbox") value = control.checked;
		else if (control.type === "number") {
			if (!Number.isFinite(control.valueAsNumber)) return;
			value = control.valueAsNumber;
		} else if (control.dataset.configList) {
			value = control.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
		}
		setAtPath(state.moduleValue, path, value);
		setModuleDirty(true);
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
		if (current === "config-center") saveModule();
	});

	window.addEventListener("beforeunload", (event) => {
		if (!state.postDirty && !state.configDirty && !state.moduleDirty) return;
		event.preventDefault();
	});
}

async function initialize() {
	bindEvents();
	try {
		const [config] = await Promise.all([api("/api/config"), loadPosts(), loadAllModules()]);
		fillConfigForm(config);
		const hour = new Date().getHours();
		const greeting = hour < 11 ? "上午好" : hour < 18 ? "下午好" : "晚上好";
		$("#view-overview h1").textContent = `${greeting}，${config.profile.name}`;
	} catch (error) {
		showToast(error.message, true);
	}
}

initialize();
