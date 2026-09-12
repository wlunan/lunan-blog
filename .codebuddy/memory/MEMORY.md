# 长期记忆 — lunan-blog

## 项目定位
- 站点：Lunan 的个人博客，正式域名 `https://blog.vkfc.dpdns.org/`（GitHub Pages，仓库 `wlunan/Firefly`）。
- 技术栈：Astro 7 + Svelte islands + TypeScript + Tailwind 4，包管理 **pnpm**（`preinstall` 强制）。
- 上游是 Firefly 主题（`CuteLeaf/Firefly`，二次开发自 Fuwari）。站点配置集中在 `src/config/*.ts`，类型在 `src/types`，优先从 `@/config` 导入。

## 用户偏好与约定
- 用户会持续**清除主题原作者信息**（头像、favicon、示例数据、作者账号 ID、第三方统计 ID 等），新增内容应避免回填主题信息。
- 喜欢"打开项目只看一个文档"：项目手册统一是根目录 `快速参考.md`（不要另建同类文档）。
- 环境：Windows + PowerShell，pnpm 全局在 `E:\04software\software-save\npm\node_global`。

## 本机环境坑（重要）
- CodeBuddy 的 safe-delete 钩子会让 `pnpm install` 报 `ERR_PNPM_LINKING_FAILED`：执行前先设 `$env:CODEBUDDY_SAFE_DELETE_ENABLED='0'`。
- `.npmrc` 必须保持 **UTF-8 无 BOM**，否则会出现 `null bytes` 报错；用 write_to_file 工具写它无效，需 `[System.IO.File]::WriteAllText(path, content, (New-Object System.Text.UTF8Encoding($false)))`。

## 站点自定义要点
- 主题色：`siteConfig.themeColor.hue = 220`（蓝）。
- 站点图标（自设计，2026-09）：蓝色渐变圆角方块 + 白色「L」+ 琥珀火花。源 SVG 在 `public/favicon/lunan-{light,dark}.svg` 与 `src/assets/images/logo/lunan-{light,dark}.svg`；PNG 用 sharp 渲染，详见当日日志。改图标后记得重渲染 PNG 并跑 `pnpm lqips`。
- 访问计数：用 **Vercount**（`https://events.vercount.one/js`，免注册按域名统计），页脚 span id 为 `vercount_value_site_pv` / `vercount_value_site_uv`；已弃用不蒜子 busuanzi。
- 图标/logo 命名规范：`lunan-light-{size}.png`（亮色模式）、`lunan-dark-{size}.png`（暗色模式），通过 `theme` 字段生成 `media="(prefers-color-scheme: …)"`。
- `siteConfig.navbar.logo.value` 必须是**相对 `src/` 的路径**（`Navbar.astro` 用 `import.meta.glob` 解析），不能以 `/` 开头；`public/` 路径才用 `/` 开头。
- 访客端可见的开关（显示设置面板）统一套路：`displaySettingsConfig.ts` + `types/displaySettingsConfig.ts` 加 `xxxSwitchable` → `setting-utils.ts` 加 `getDefault/getStored/applyToDocument/set` 四件套并派发自定义事件 → `DisplaySettingsIntegrated.svelte` 加 state、切换/重置函数、`onMount` 读取 localStorage、UI，并务必并入 `hasAnyContent` 与所属 tab 的可见性判断。要首屏无闪烁，就在 `Layout.astro` head 的内联 `<script>` 里同步设置 html 属性。
- **`src/constants/icons-data.json` 没有生成脚本**（Biome 忽略、需提交）：`Icon.svelte` 用 `@iconify/svelte/offline` + 这个本地子集，缺图标只渲染灰色占位圆。新增图标必须手工从 `node_modules/@iconify-json/<集合>/icons.json` 取条目写进去。
- 侧边栏四模式（不关闭 / 关左侧 / 关右侧 / 关闭）：状态在 `localStorage["sidebarMode"]`（值 `both|left|right|none`；旧布尔键 `sidebarVisible` 会自动迁移）→ `<html data-sidebar-mode>`，靠 `layout-styles.css` 里的纯 CSS 覆盖重排网格（隐藏对应侧栏 + 覆盖 `#main-grid` 的列定义 + 重设 `#main-content-column`/`.footer`/`#right-sidebar` 的 grid 位置），完全不参与 JS 网格重算，因此无首屏闪烁、Swup 翻页后无需重放。默认值取 `sidebarLayoutConfig.position`。

## 编辑工具注意
- 同一个文件的多处 `replace_in_file` **不要并行**，否则后一次写入会基于旧内容覆盖前一次的结果（会静默丢失改动）。同文件多改要串行、或一次覆盖更大区块。
