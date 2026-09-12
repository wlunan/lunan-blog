// 显示设置面板开关配置类型

// 侧边栏显示模式（访客在「外观」设置中选择，覆盖 sidebarLayoutConfig.position）
//   "both"  → 不关闭：左右侧边栏都显示
//   "left"  → 关右侧：只保留左侧边栏
//   "right" → 关左侧：只保留右侧边栏
//   "none"  → 关闭：两侧都收起，正文铺满整行
export type SidebarMode = "both" | "left" | "right" | "none";

export type OverlaySwitchable =
	| boolean
	| {
			opacity?: boolean; // 壁纸透明度调节开关
			blur?: boolean; // 背景模糊度调节开关
			cardOpacity?: boolean; // 卡片透明度调节开关
	  };

export type DisplaySettingsConfig = {
	// ── 外观 (Appearance) ──────────────────────────────────

	// 主题色选择器开关
	themeColorSwitchable: boolean;

	// 文章列表布局切换开关
	layoutSwitchable: boolean;

	// 卡片边框和阴影开关
	cardBorderSwitchable: boolean;

	// 卡片风格跟随主题色开关
	cardFollowThemeSwitchable: boolean;

	// 侧边栏显示开关（允许访客在「外观」中收起/展开左右侧边栏）
	sidebarSwitchable: boolean;

	// ── 壁纸 (Wallpaper) ──────────────────────────────────

	// 壁纸模式切换开关
	wallpaperModeSwitchable: boolean;

	// 水波纹动画开关
	wavesSwitchable: boolean;

	// 渐变过渡效果开关
	gradientSwitchable: boolean;

	// 横幅标题显示开关（需同时启用 homeText.enable）
	bannerTitleSwitchable: boolean;

	// 壁纸轮播开关
	bannerCarouselSwitchable: boolean;

	// 全屏透明模式参数调节开关
	// 设为 false 关闭所有滑块，或用对象形式单独控制每个滑块
	overlaySwitchable: OverlaySwitchable;

	// ── 特效 (Effects) ────────────────────────────────────

	// 樱花特效开关
	sakuraSwitchable: boolean;
};
