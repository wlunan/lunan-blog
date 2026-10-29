---
title: "一次 502 排查：Docker 端口绑定与反向代理"
published: 2026-10-28
updated: 2026-10-29
description: "用 FileCodeBox 接 Nginx Proxy Manager 报 502 为例，讲清 0.0.0.0、127.0.0.1、172.17.0.1 三种 Docker 端口绑定的区别，以及不暴露公网又让反代能访问的写法。"
tags: [Docker, 反向代理, Nginx, 服务器运维]
category: "教程"
draft: false
---

给 FileCodeBox（文件快递柜）套一层 Nginx Proxy Manager（NPM）之后，域名访问一直报 `502 Bad Gateway`。容器是 running 的，端口也映射了，看起来哪都没问题。

问题出在端口映射绑定的地址上。这个坑值得单独写一篇，因为它不只影响 FileCodeBox，任何「容器 + 反向代理容器」的组合都会遇到。

## 场景

- **服务**：FileCodeBox，容器内监听 `12345` 端口；
- **代理**：Nginx Proxy Manager 容器，通过 1Panel 部署，配好域名和 SSL 证书；
- **目标**：外部只能通过 `https://域名` 访问，不直接暴露容器端口。

在这个前提下，NPM 里的代理目标填的是 `http://172.17.0.1:12345`，结果 502。

## 先看两个容器的实际映射

`docker ps` 的输出通常长这样，注意端口那一列：

```text
pan-relay      0.0.0.0:5004->5004/tcp
filecodebox    127.0.0.1:12345->12345/tcp
```

能正常访问的 `pan-relay` 绑定在 `0.0.0.0`，出问题的 `filecodebox` 绑定在 `127.0.0.1`。差别就在这几个数字上。

## 三种绑定地址的区别

### `0.0.0.0`

对应 `-p 12345:12345`。表示监听宿主机**所有**网卡：公网 IP、局域网 IP、`127.0.0.1`、Docker 虚拟网桥 IP。

结果是外网能直接访问，NPM 通过 `172.17.0.1` 也能访问。方便，但等于把服务裸奔在公网上，尤其是没做认证的服务，很快就会被扫描器找到。

### `127.0.0.1`

对应 `-p 127.0.0.1:12345:12345`。只监听宿主机的本地回环网卡，公网绝对进不来。

听起来很安全，但它有个致命细节：**容器有独立的网络命名空间，NPM 容器里的 `127.0.0.1` 是它自己，不是宿主机。** 所以 NPM 用 `http://127.0.0.1:12345` 永远连不上宿主机上那个只绑回环的端口。

### `172.17.0.1`

对应 `-p 172.17.0.1:12345:12345`。只监听 Docker 默认网桥的网关地址，也就是宿主机在 Docker 虚拟网络里的那个「分身」。

结果正好是想要的：外部公网访问不到（公网流量走的是真实网卡），NPM 却能通过内部网桥找过来。兼顾安全和可用性。

## NPM 是怎么找到上游的

NPM 本身也是一个容器。当你在面板里填 `http://172.17.0.1:12345` 时，它是顺着 Docker 默认网桥的网关往外找的。

所以结论很直接：**上游服务绑定在 `127.0.0.1`，反向代理容器永远找不到它。** 要么绑 `0.0.0.0`，要么绑 `172.17.0.1`。

网桥地址不一定都是 `172.17.0.1`，取决于 Docker 的地址池。确认方法：

```bash
docker network inspect bridge --format '{{(index .IPAM.Config 0).Gateway}}'
```

## 改法

推荐的做法是让 FileCodeBox 只监听 Docker 内部网桥：

```bash
# 1. 停掉并删除旧容器
docker stop filecodebox && docker rm filecodebox

# 2. 用 172.17.0.1 绑定端口重新运行
docker run -d --restart unless-stopped \
  -p 172.17.0.1:12345:12345 \
  -v /opt/filecodebox/data:/app/data \
  -e APP_ENV=production \
  -e LOG_LEVEL=warning \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  --name filecodebox \
  lanol/filecodebox:2.8.5
```

NPM 面板里的代理目标保持 `http://172.17.0.1:12345` 不变，这时候就能正常回源了。

如果只是想先让它跑起来、不介意端口对外，把 `-p` 改成 `-p 12345:12345` 也能用。但那意味着这个服务同时可以从公网直接访问，等于绕过了一层反代和证书，不推荐。

## 还有三个容易忽略的点

**数据卷用绝对路径。** 生产环境写 `/opt/filecodebox/data`，不要写 `./data`。否则哪天换个目录执行 docker 命令，数据会「凭空消失」——其实只是挂载到了另一个相对路径上。

**记得开 WebSocket。** 在 NPM 的 Proxy Host 里勾上 WebSockets Support，否则 FileCodeBox 的部分实时状态刷不出来。

**客户端 IP 会变成代理的 IP。** 如果日志里记录的来源全是 NPM 的地址，需要在 NPM 的 Advanced 选项卡里补上转发头：

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

## 小结

`502` 不一定是对面服务挂了，也可能是代理根本走不到对面。记住一句话就够了：

> 绑定 `0.0.0.0` 全世界都能连，绑定 `127.0.0.1` 只有宿主机自己能用，绑定 `172.17.0.1` 才是「容器之间互相访问」的正确姿势。

顺着这条线索去查端口映射，比反复重启容器有效率得多。
