---
title: "Syncthing 服务端部署：从加密密码的坑说起"
published: 2026-08-20
updated: 2026-10-29
description: "在 Ubuntu / Debian 上用 systemd 部署 Syncthing，记录配置文件位置、GUI 认证的正确设置方式，以及不要把 8384 直接暴露到公网的原因。"
tags: [Syncthing, 文件同步, systemd, 服务器]
category: "教程"
draft: false
---

Syncthing 是一个点对点同步工具，不需要中心服务器也能在几台设备之间同步文件。把它跑在一台 7×24 的机器上，就等于有了一个私有网盘。

它跑起来不难，难的是配置 GUI 那一步：网上很多教程让你直接在 `config.xml` 里写明文用户名密码，而新版本已经改用 bcrypt 哈希存储，照抄的结果就是永远登录失败。

这篇记录完整流程，也顺带说一下为什么不该把 8384 端口开到公网。

## 安装

Ubuntu / Debian 用官方源：

```bash
# 添加官方签名与软件源
sudo curl -L -o /usr/share/keyrings/syncthing-archive-keyring.gpg \
  https://syncthing.net/release-key.gpg

echo "deb [signed-by=/usr/share/keyrings/syncthing-archive-keyring.gpg] \
  https://apt.syncthing.net/ syncthing stable" | \
  sudo tee /etc/apt/sources.list.d/syncthing.list

sudo apt update
sudo apt install syncthing -y
```

## 用 systemd 接管

Syncthing 自带模板服务，`@` 后面跟运行它的用户名：

```bash
sudo systemctl enable syncthing@<用户名>.service
sudo systemctl start syncthing@<用户名>.service
```

服务名里的用户必须和实际运行用户一致，否则同步目录权限会出问题。

首次启动会生成默认配置，等几秒再停掉服务准备改：

```bash
sudo systemctl stop syncthing@<用户名>.service
```

## 配置文件在哪

```bash
sudo find / -name "config.xml" -path "*syncthing*" 2>/dev/null
```

常见路径是：

```text
/home/<用户名>/.local/state/syncthing/config.xml
```

## GUI 地址与认证

找到 `<gui>` 段落。默认是只监听回环：

```xml
<gui enabled="true" tls="false">
    <address>127.0.0.1:8384</address>
</gui>
```

如果你需要从别的机器访问 Web 界面，可以把地址改成 `0.0.0.0:8384`，但**只把它当临时手段**：先开着完成首次登录，设好密码后再改回来或者用下面的隧道方式。

> **不要手动往 `config.xml` 里写 `<user>` 和 `<password>` 明文。**
> 新版本用 bcrypt 哈希存储密码，手写明文会被当成一个无效的哈希值，结果就是登录一直失败。

保存后启动服务：

```bash
sudo systemctl start syncthing@<用户名>.service
```

确认监听状态：

```bash
ss -tlnp | grep 8384
```

## 首次登录并设置密码

1. 浏览器打开 `http://<服务器地址>:8384`（此时还没设密码，直接进）；
2. 进入 **操作 → 设置 → 图形界面**；
3. 填写用户名和密码，保存；
4. 页面会要求重新登录，用刚设置的凭据进入。

通过 Web UI 设置的密码会由 Syncthing 自己算成哈希写回配置，这是唯一不会踩坑的方式。

## 别把 8384 直接开在公网

Web 界面等于 Syncthing 的全部控制权：能看文件列表、能改共享目录，还能重新生成 API Key。把它暴露在公网上，等于把一个没做过安全审计的管理后台挂在互联网上。

更稳妥的两种做法：

**SSH 隧道。** 保持 `127.0.0.1:8384` 不变，在本地执行：

```bash
ssh -L 8384:127.0.0.1:8384 <用户名>@<服务器地址>
```

然后本地浏览器访问 `http://127.0.0.1:8384`。不需要开放任何端口，也不需要证书。

**反向代理加 HTTPS。** 交给 Nginx / Caddy 处理证书，反代到 `127.0.0.1:8384`，同时把 Syncthing 配置里的 `tls` 关掉、只信任代理。这种方式适合长期使用，但要记得在反代层加访问控制。

如果确实要放行端口，务必先设好密码，再只对可信网段开放：

```bash
# UFW：只允许自己的出口 IP
sudo ufw allow from <你的IP> to any port 8384 proto tcp
```

云服务器还需要在安全组里同步这条规则。

## 常用管理命令

| 操作 | 命令 |
| --- | --- |
| 启动 | `sudo systemctl start syncthing@<用户名>.service` |
| 停止 | `sudo systemctl stop syncthing@<用户名>.service` |
| 重启 | `sudo systemctl restart syncthing@<用户名>.service` |
| 查看状态 | `sudo systemctl status syncthing@<用户名>.service` |
| 实时日志 | `journalctl -u syncthing@<用户名>.service -f` |

## 几个容易忽略的点

**API Key 等同管理员权限。** 配置文件里自动生成的 `<apikey>` 用于第三方工具调用 REST API，泄露就等于把控制权交出去。怀疑泄露就去 Web UI 里重新生成。

**多用户互不干扰。** 每个用户跑自己的实例，服务名是 `syncthing@用户名.service`，配置和同步目录都相互独立。

**同步目录要有写权限。** 如果 Syncthing 运行用户对目标目录没有读写权限，日志里会一直报错而界面上看起来「正在同步」。

**版本别乱升。** Syncthing 的数据库结构会随大版本变化，跨大版本升级前先看 release notes，必要时先备份配置目录。
