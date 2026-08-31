---
title: 修改Codex默认路径
published: 2026-08-31
description: 得修改一下，不然C盘不够用了
tags:
  - 默认
  - 教程
category: 教程
draft: false
date: 2026-08-07T17:15:09+08:00
lastmod: 2026-08-31T15:13:04+08:00
author: lunan
---
# 修改Codex默认路径

## 目的

将 Codex 默认数据目录从用户目录迁移到其他磁盘，减少 C 盘占用。

## 默认目录

```text
C:\Users\<用户名>\.codex
```

该目录通常包含对话记录、索引数据库、配置、登录状态、插件、Skills 和附件。

## 修改步骤

### 1. 完全退出 Codex

退出 ChatGPT/Codex 桌面端，包括右下角托盘程序。

### 2. 复制原目录

例如复制到 E 盘的CodexData中：

```text
从：C:\Users\<用户名>\.codex
到：E:\CodexData\.codex
```

先复制，不要直接删除或剪切原目录。

### 3. 设置用户环境变量

在 PowerShell 中执行：

```powershell
[Environment]::SetEnvironmentVariable('CODEX_HOME', 'E:\CodexData\.codex', 'User')
```

然后重启 Windows，或注销后重新登录。

## 验证是否生效

确认环境变量：

```powershell
[Environment]::GetEnvironmentVariable('CODEX_HOME', 'User')
```

确认 Codex 实际使用的路径：

```powershell
codex doctor
```

输出中的 `CODEX_HOME`、`sqlite home` 或 `daemon state dir` 应指向新的 E 盘目录。
![修改Codex默认路径_20260831145246](https://s3.vkfc.dpdns.org/obs-notes/2026/08/f2780d16f710eec2.png)
再新建一条测试对话，并检查：

```powershell
Get-ChildItem 'E:\CodexData\.codex\sessions' -Recurse -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 5 FullName, LastWriteTime
```

如果最新文件出现在新的 `sessions` 目录，说明迁移成功。

## 注意事项

- `app-server not running (ephemeral mode)` 通常是正常状态，不代表路径设置失败。
- `AppData\Roaming\Codex` 中的部分界面缓存可能仍留在 C 盘。
- 验证新目录工作正常前，不要删除旧的 `.codex` 目录。
- `.codex` 中可能包含登录凭据和个人数据，不要分享整个目录。
- 如果 Codex 启动异常，可退出程序，暂时删除或修改用户级 `CODEX_HOME` 环境变量，恢复使用原目录。