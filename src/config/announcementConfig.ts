import type { AnnouncementConfig } from "../types/announcementConfig";
import { withAdminConfig } from "./withAdminConfig";

export const announcementConfig: AnnouncementConfig =
	withAdminConfig<AnnouncementConfig>("announcementConfig", {
		// 公告标题
		title: "公告",

		// 公告内容
		content: "欢迎来到 Lunan 的博客。这里记录技术实践、AI 思考与生活观察。",

		// 是否允许用户关闭公告
		closable: true,

		link: {
			// 启用链接
			enable: true,
			// 链接文本
			text: "了解更多",
			// 链接 URL
			url: "/about/",
			// 内部链接
			external: false,
		},
	});
