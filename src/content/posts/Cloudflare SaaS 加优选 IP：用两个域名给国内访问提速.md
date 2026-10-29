---
title: "Cloudflare SaaS 加优选 IP：用两个域名给国内访问提速"
published: 2026-10-10
updated: 2026-10-29
description: "借 Cloudflare for SaaS 的自定义主机名，把主域名的访问绕到社区优选节点上，记录回退源、TXT 验证、CNAME 切换的完整配置顺序和五个常见报错。"
tags: [Cloudflare, 反向代理, DNS, 网络优化]
category: "教程"
draft: false
---

把服务挂在 Cloudflare 后面，最常遇到的问题不是配置错，而是绕路：明明服务器在日本，国内访问却先飞到美国西海岸。

这是 Cloudflare 免费版按 Anycast 就近分配节点的结果，不一定是最近的节点。社区的做法是用「优选 IP」把流量引到延迟更低的入口，但直接 CNAME 到别人的优选域名会踩一堆限制。

更稳的办法是用 **Cloudflare for SaaS** 自己搭一个闭环：一个主域名对外，一个辅助域名做授权和优选，两个域名都是自己的。

## 四个概念

- **主域名**（`example.com`）：最终对外访问的域名，比如 `pan.example.com`。
- **辅助域名**（`example.net`）：用来做 SaaS 授权的工具域名，不对外示人。
- **回退源**（`saas-origin.example.net`）：Cloudflare 找不到具体回源时，最终回到的那台服务器。
- **优选域名**（`cdn.example.net`）：指向社区维护的低延迟节点，专门解决「绕路美国」这件事。

整个链路的走向是：

```text
用户 → pan.example.com（CNAME 到 cdn.example.net，仅 DNS）
     → Cloudflare 优选节点
     → 回源到 saas-origin.example.net
     → 你的服务器
```

## 第一步：在辅助域名上开 SaaS

进入 `example.net` 的 Cloudflare 后台。

**添加回退源记录。** DNS → 记录，添加一条 A 记录：

- 名称：`saas-origin`
- 内容：你的服务器 IP
- 代理状态：**橙色云朵（已代理）**

**启用 SaaS。** SSL/TLS → 自定义主机名（Custom Hostnames）。首次进入会提示启用 Cloudflare for SaaS，需要绑支付方式，但前 100 个主机名不收费。在「回退源」里填入 `saas-origin.example.net`，保存，状态一开始可能显示「正在初始化」。

**添加自定义主机名。** 在自定义主机名页面点「添加自定义主机名」：

- 主机名：`pan.example.com`
- 证书验证方式：**TXT**

保存后会弹出两段 TXT 记录：一个名称、两个值。

## 第二步：在主域名上添加 TXT 验证

这一步最容易出错，注意操作对象是 **`example.com`**，不是辅助域名。

1. 别关掉上一步的页面，或者把两段 TXT 复制到记事本；
2. 新开标签页，进入 `example.com` 的 Cloudflare 后台；
3. DNS → 记录 → 添加记录；
4. 类型 `TXT`，名称 **只填 `_acme-challenge.pan`**；
5. 内容粘贴第一段 TXT 值，TTL 自动，保存；
6. 再添加一条，名称同样是 `_acme-challenge.pan`（同名可以有多条 TXT），内容粘贴第二段值。

名称这里要特别小心：Cloudflare 会自动补全域名后缀。如果你写成 `_acme-challenge.pan.example.com`，最终会变成 `_acme-challenge.pan.example.com.example.com`，验证必然失败。

验证记录是否生效：

```bash
nslookup -type=txt _acme-challenge.pan.example.com
```

能查出这两段字符串，就说明填对了。回到辅助域名的 SaaS 页面点刷新，等几分钟，主机名状态和证书状态都变成绿色的「有效」就算通过。

## 第三步：把访问切到优选通道

验证通过后 TXT 记录就可以不管了，接下来决定流量走哪。

进入 `example.com` 的 DNS，找到 `pan` 那条记录（可能是 A 记录，也可能指向回退源），改成：

- 类型：`CNAME`
- 名称：`pan`
- 内容：`cdn.example.net`
- 代理状态：**灰色云朵（仅 DNS）**

两个细节：必须是 `cdn` 这个子域名，优选 IP 解析在它上面；必须是灰云，橙云会让优选失效。

## 第四步：让反向代理接住回源

Cloudflare 最终回源时，请求头里的 Host 是 `saas-origin.example.net`，所以反向代理必须认这个域名。

以 Nginx Proxy Manager 为例，编辑对应的代理服务：

- **域名**：填 `saas-origin.example.net`（也可以同时保留 `pan.example.com`）
- **协议**：`http`，转发地址 `172.17.0.1`，端口填容器实际端口
- **SSL**：选择导入的 Cloudflare 源站证书，**强制 SSL 关闭**
- **高级**：粘贴下面这段

```nginx
client_max_body_size 50M;
proxy_buffering off;
proxy_cache off;
proxy_read_timeout 120s;
```

`proxy_buffering off` 对需要流式返回的接口很重要，否则响应会被缓冲住，前端只能干等。

## 五个常见报错

| 报错 | 原因 | 处理 |
| --- | --- | --- |
| Error 1014（CNAME Cross-User Banned） | 用了别人的优选域名，对方没把你加入白名单 | 自己准备两个域名，按本文自建闭环 |
| Error 1000（DNS points to prohibited IP） | 第三方优选域名解析到了 Cloudflare 的禁用 IP | 换一个可用的优选域名 |
| 证书一直「待验证 (TXT)」 | TXT 名称写了完整域名，变成双重后缀；或 `pan` 没有指向 `cdn` | 名称只写 `_acme-challenge.pan`，确认 CNAME 目标 |
| 502 / 404 | 回源 Host 是 `saas-origin.example.net`，反代没配这个域名 | 把回退源域名加进代理服务的域名列表 |
| 优选没生效，仍然落在美国节点 | `pan` 的 CNAME 直接指到 `example.net` 而不是 `cdn.example.net` | 改成 `cdn.example.net`，确认是灰云 |

## 维护清单

**静态资源走缓存。** 缓存 → 缓存规则：主机名匹配 `pan.example.com` 且 URI 包含 `/static/` 时，边缘 TTL 设长一些，之后看响应头里的 `cf-cache-status` 是否为 `HIT`。

**关掉 Bot Fight Mode。** 安全性 → Bots，关闭 Bot Fight Mode。它弹出的 JS 人机验证很容易卡住国内用户的首屏。

**HTTP/3 视情况关闭。** 部分运营商对 UDP 干扰较大，网络不稳时可以在「网络」里关掉 HTTP/3 (QUIC) 再观察。

**优选域名会失效。** 社区维护的优选域名不是长期承诺，哪天变慢或解析异常，就去辅助域名的 DNS 里把 `cdn` 的 CNAME 换一个，或者用 `CloudflareSpeedTest` 自己测速后建一条灰云 A 记录。

## 两个需要提前知道的风险

这套方案本质是绕开默认的节点分配，属于「能用但不受支持」的做法。Cloudflare 的分区域、限速和条款都可能让它失效，配置之前最好评估一下业务能否接受临时回退。

另外，用一个免费域名做 SaaS 授权，等于把链路的安全边界交给了第三方域名的持有者。重要服务建议直接用自己注册的正式域名做辅助域名，成本一年几十块，省心很多。

最后提醒一句：优选只改变「入口节点」，不改变源站和用户之间的物理距离。真正影响体验的往往还是源站本身的响应速度和静态资源的缓存策略，别指望换一个 CNAME 就万事大吉。
