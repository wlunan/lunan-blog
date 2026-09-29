import type { FooterConfig } from "../types/footerConfig";
import { withAdminConfig } from "./withAdminConfig";

export const footerConfig: FooterConfig = withAdminConfig<FooterConfig>(
	"footerConfig",
	{
		// 是否启用Footer HTML注入功能
		enable: true,
	},
);

// 直接编辑 config/FooterConfig.html 文件来添加备案号等自定义内容
