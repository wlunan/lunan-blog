/**
 * copy-to-posts.mjs
 * 从 obs-notes 中复制指定笔记到 posts/ 目录，自动转换 Obsidian 语法。
 *
 * 用法：node copy-to-posts.mjs
 *
 * 转换规则：
 *   1. ![[filename]]          → ![](./assets/filename)
 *   2. ![](../../Assets/...)  → ![](./assets/...)
 *   3. 行内 #tag              → 删除（如 #来源/xxx）
 *   4. 复制引用的图片到 posts/assets/
 *   5. 保留并增强 frontmatter（添加 published、description）
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ==================== 配置 ====================
const MANIFEST_PATH = path.join(__dirname, "publish-manifest.json");
const ASSETS_SRC = path.join(__dirname, "Assets");
const POSTS_DIR = path.join(__dirname, "posts");
const ASSETS_DST = path.join(POSTS_DIR, "assets");

/** 字节转 GB（保留 4 位小数） */
function bytesToGB(bytes) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(4);
}

// ==================== 工具函数 ====================

/** 读取 manifest */
function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("❌ 找不到 publish-manifest.json");
    process.exit(1);
  }
  const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
  return JSON.parse(raw);
}

/** 解析 frontmatter，返回 { frontmatter, body, rawFrontmatter } */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    // 没有 frontmatter
    return { frontmatter: {}, body: content, rawFrontmatter: "" };
  }

  const rawFrontmatter = match[1];
  const body = match[2];

  // 简单解析 YAML（仅处理单行键值对和数组）
  const frontmatter = {};
  const lines = rawFrontmatter.split("\n");
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // 数组项
    const arrayMatch = line.match(/^\s+-\s+(.+)/);
    if (arrayMatch && currentKey) {
      if (!currentArray) {
        currentArray = [];
        frontmatter[currentKey] = currentArray;
      }
      currentArray.push(arrayMatch[1].trim());
      continue;
    }

    // 键值对
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === "" || value === "[]") {
        currentArray = null;
        if (value === "[]") {
          frontmatter[currentKey] = [];
        }
      } else {
        currentArray = null;
        frontmatter[currentKey] = value;
      }
    } else {
      currentArray = null;
    }
  }

  return { frontmatter, body, rawFrontmatter };
}

/** 提取笔记中引用的所有图片文件名（包含 Obsidian 嵌入和标准 Markdown 图片） */
function extractImageNames(content) {
  const images = new Set();

  // 匹配 ![[filename.ext]]
  const embedRegex = /!\[\[([^\]]+\.(?:png|jpg|jpeg|webp|gif|svg|avif))\]\]/gi;
  let match;
  while ((match = embedRegex.exec(content)) !== null) {
    images.add(match[1]);
  }

  // 匹配 ![](../../Assets/filename.ext) 或 ![](Assets/filename.ext)
  const mdRegex = /!\[.*?\]\((?:\.\.\/)*Assets\/([^)]+\.(?:png|jpg|jpeg|webp|gif|svg|avif))\)/gi;
  while ((match = mdRegex.exec(content)) !== null) {
    images.add(match[1]);
  }

  return [...images];
}

/** 查找 Assets 中匹配的图片文件 */
function findImageInAssets(filename) {
  if (!fs.existsSync(ASSETS_SRC)) return null;

  // 先精确匹配
  const exactPath = path.join(ASSETS_SRC, filename);
  if (fs.existsSync(exactPath)) return filename;

  // 编码特殊字符后匹配（处理中文弯引号等）
  const files = fs.readdirSync(ASSETS_SRC);
  const found = files.find((f) => f === filename || decodeURIComponent(encodeURI(f)) === decodeURIComponent(encodeURI(filename)));
  return found || null;
}

/** 转换笔记内容 */
function convertContent(content) {
  let converted = content;

  // 1. 转换 ![[filename]] → ![](./assets/filename)
  converted = converted.replace(
    /!\[\[([^\]]+\.(?:png|jpg|jpeg|webp|gif|svg|avif))\]\]/gi,
    (_, filename) => `![${filename}](./assets/${filename})`
  );

  // 2. 转换 ![](../../Assets/...) 或 ![](Assets/...)  → ![](./assets/...)
  converted = converted.replace(
    /!\[(.*?)\]\((?:\.\.\/)*(?:\.\.\/)*Assets\/([^)]+)\)/g,
    (match, alt, filename) => {
      const cleanAlt = alt || filename;
      return `![${cleanAlt}](./assets/${filename})`;
    }
  );

  // 3. 删除开头的 Obsidian 行内 tag（如 #来源/xxx 单独一行）
  converted = converted.replace(/^#[^\s#]+\s*$/gm, "");

  return converted;
}

/**
 * 提取源笔记中的第一张本地图片作为封面图
 * 返回相对于 posts/ 的路径，如 ./assets/xxx.webp，或空字符串
 */
function detectCoverImage(content) {
  // 匹配 ![[filename]] 或 ![](../../Assets/filename)
  const m = content.match(/!\[\[([^\]]+\.(?:png|jpg|jpeg|webp|gif|svg|avif))\]\]|!\[.*?\]\((?:\.\.\/)*Assets\/([^)]+\.(?:png|jpg|jpeg|webp|gif|svg|avif))\)/i);
  if (m) {
    const filename = m[1] || m[2];
    return `./assets/${filename}`;
  }
  return "";
}

/** 生成 Firefly 博客 frontmatter（参照 posts/guide/index.md） */
function generateFireflyFrontmatter(originalFM, sourcePath, rawContent) {
  const title = originalFM.title || path.basename(sourcePath, ".md");

  // published: 转换为 YYYY-MM-DD 格式
  const rawDate = originalFM.date || originalFM.published || new Date().toISOString();
  const published = rawDate.split("T")[0];

  const description = originalFM.description || "";
  const category = originalFM.category || "";
  const draft = originalFM.draft !== undefined ? originalFM.draft : false;

  // tags: 转换为行内数组格式 [tag1, tag2]
  let tags = originalFM.tags || [];
  if (typeof tags === "string" && tags) {
    tags = tags.replace(/[\[\]]/g, "").split(",").map((t) => t.trim().replace(/^['"]|['"]$/g, ""));
  }
  const tagsStr = Array.isArray(tags) && tags.length > 0
    ? `[${tags.join(", ")}]`
    : "[]";

  // image: 自动检测封面图
  const image = detectCoverImage(rawContent);

  const lines = ["---"];
  lines.push(`title: "${title.replace(/"/g, '\\"')}"`);
  lines.push(`published: ${published}`);
  if (description) {
    lines.push(`description: "${description.replace(/"/g, '\\"')}"`);
  } else {
    lines.push('description: ""');
  }
  if (image) {
    lines.push(`image: ${image}`);
  }
  lines.push(`tags: ${tagsStr}`);
  if (category) {
    lines.push(`category: "${category}"`);
  }
  lines.push(`draft: ${draft}`);
  lines.push("---");
  lines.push("");

  return lines.join("\n");
}

// ==================== 主流程 ====================

async function main() {
  console.log("📋 读取发布清单...\n");
  const manifest = readManifest();

  if (!manifest.posts || manifest.posts.length === 0) {
    console.log("⚠️  发布清单为空，没有笔记需要复制。");
    return;
  }

  // 确保目标目录存在
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.mkdirSync(ASSETS_DST, { recursive: true });

  let successCount = 0;
  let skipCount = 0;
  let sizeSkipCount = 0;
  const allImages = new Set();
  const maxSizeBytes = (manifest.maxFileSizeGB || 0) * 1024 * 1024 * 1024;

  for (const item of manifest.posts) {
    const sourcePath = path.join(__dirname, item.source);
    const noteName = path.basename(item.source);
    const fileSize = fs.existsSync(sourcePath) ? fs.statSync(sourcePath).size : 0;
    console.log(`📄 处理: ${item.source} (${bytesToGB(fileSize)} GB)`);

    // 检查源文件是否存在
    if (!fs.existsSync(sourcePath)) {
      console.log(`   ⚠️  文件不存在，跳过: ${item.source}`);
      skipCount++;
      continue;
    }

    // 检查文件大小
    if (maxSizeBytes > 0 && fileSize > maxSizeBytes) {
      console.log(`   ⚠️  文件过大(${bytesToGB(fileSize)} GB > ${manifest.maxFileSizeGB} GB)，跳过`);
      sizeSkipCount++;
      continue;
    }

    // 读取源文件
    const rawContent = fs.readFileSync(sourcePath, "utf-8");

    // 解析 frontmatter
    const { frontmatter, body, rawFrontmatter } = parseFrontmatter(rawContent);

    // 提取图片
    const images = extractImageNames(rawContent);
    images.forEach((img) => allImages.add(img));

    // 转换内容
    const convertedBody = convertContent(body);

    // 生成 Firefly 博客 frontmatter
    const fireflyFM = generateFireflyFrontmatter(frontmatter, item.source, rawContent);

    // 组合最终内容
    const finalContent = fireflyFM + convertedBody.trim() + "\n";

    // 写入目标文件（文件名只保留安全字符）
    const safeName = noteName.replace(/[""''「」『』【】]/g, "'");
    const destPath = path.join(POSTS_DIR, safeName);
    fs.writeFileSync(destPath, finalContent, "utf-8");
    console.log(`   ✅ 已复制 → posts/${safeName}`);

    // 报告图片
    if (images.length > 0) {
      console.log(`   🖼️  引用图片: ${images.join(", ")}`);
    }

    successCount++;
  }

  // 复制所有引用到的图片
  console.log(`\n🖼️  复制图片文件...`);
  let imageCount = 0;
  for (const imgName of allImages) {
    const foundName = findImageInAssets(imgName);
    if (foundName) {
      const src = path.join(ASSETS_SRC, foundName);
      const dst = path.join(ASSETS_DST, foundName);
      fs.copyFileSync(src, dst);
      imageCount++;
      console.log(`   ✅ ${foundName}`);
    } else {
      console.log(`   ⚠️  未找到: ${imgName}`);
    }
  }

  // 总结
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✨ 完成！`);
  console.log(`   笔记: ${successCount} 篇已复制，${skipCount} 篇跳过`);
  if (sizeSkipCount > 0) {
    console.log(`   超限: ${sizeSkipCount} 篇超过 ${manifest.maxFileSizeGB} GB 被跳过`);
  }
  console.log(`   图片: ${imageCount} 个已复制`);
  console.log(`   输出目录: ${POSTS_DIR}`);
}

main().catch((err) => {
  console.error("❌ 出错:", err.message);
  process.exit(1);
});
