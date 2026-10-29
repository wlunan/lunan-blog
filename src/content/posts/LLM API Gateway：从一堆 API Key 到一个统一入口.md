---
title: "LLM API Gateway：从一堆 API Key 到一个统一入口"
published: 2026-10-05
updated: 2026-10-29
description: "对比 FreeLLMAPI、Magpie、New API、LiteLLM 四种不同定位的多模型网关，说明 LLM API Gateway 解决什么问题、以及自己用和给别人用为什么要分开选型。"
tags: [LLM, API 网关, AI 工程化, 选型]
category: "AI"
draft: false
---

同时用 OpenAI、Gemini、DeepSeek、Qwen 的时候，麻烦不在于模型本身，而在于每换一个客户端，就要重新填一次 Base URL 和 Key。哪天某个供应商限流了，还得挨个客户端去改。

LLM API Gateway 要解决的就是这件事：把多个上游模型收拢到一个入口，客户端只认一个地址、一把钥匙。

## 它夹在哪一层

最简单的结构是这样：

```text
应用 / AI 编程工具
        │  一个 Base URL + 一个 API Key
        ▼
┌──────────────────────┐
│    LLM API Gateway   │
│  统一 API / 鉴权      │
│  模型路由 / 负载均衡   │
│  限流 / 配额 / 统计    │
│  故障转移             │
└──────────┬───────────┘
           │
     ┌─────┼─────┬──────┐
     ▼     ▼     ▼      ▼
   OpenAI Gemini DeepSeek Qwen
```

它最大的价值是把「客户端」和「模型供应商」解耦。原来程序里要分别配置各家的 Base URL 和 Key，加了网关之后，客户端只需要一个 Base URL、一个 Key、一个模型名。以后换供应商、加供应商、调路由，大多只改网关，不用动所有客户端。

具体来说，这类产品提供五件事：

**统一接口。** 各家 API 的格式、认证方式、Endpoint 都不一样。网关把它们抽象成统一接口，通常是对齐 OpenAI-compatible API，这样 OpenAI SDK、Spring AI、LangChain、各类 Agent 和 IDE 插件只需要改 Base URL 和 Key。

**多模型路由。** 一个逻辑模型背后可以挂多个真实模型。比如 `my-coding-model` 后面是 DeepSeek、Qwen、Gemini、OpenAI 的任意一个，网关按优先级、权重、能力、延迟、额度、健康状态去挑。

**故障转移。** DeepSeek 返回 429 时，自动切到 Qwen 并正常返回，客户端不用自己写 Provider fallback。

**Key 管理。** 真实的上游 Key 留在服务器上，客户端拿到的只是网关 Key，避免把 OpenAI、Gemini 的凭证散落到一堆设备里。

**额度与用量控制。** 从「自己用」发展到「多设备、多用户」之后，这一项会越来越重要：可以按用户发 Key，限制模型、速率、IP、有效期。

## 三种定位，别放在一起比

这类项目经常被拿来横向对比，但它们其实分属三类：

**个人模型聚合器。** 手上有一堆 API Key，希望自己用一个入口访问。多 Provider、统一 API、自动切换、本地优先、够简单。FreeLLMAPI 属于这一类。

**AI Agent / Coding Agent 网关。** 重点不是对外提供 API 服务，而是同时用 Claude Code、Codex、Gemini CLI、OpenCode 这些 Agent，希望统一管理它们背后的模型。Magpie 明显是这个方向。

**公网 API Gateway / API Management。** 有多个上游，想做成真正的 API 服务。除了转发，还要处理用户、Key、权限、额度、限流、IP 限制、用量与成本统计、审计、模型分组、多租户。New API、LiteLLM 更接近这一类。

拿「个人聚合器」去和「API 管理平台」比功能多寡，结论一定是错的。

## 四个代表性项目

### FreeLLMAPI：把免费额度聚起来

项目地址：`tashfeenahmed/freellmapi`

核心目标是把各家的免费额度汇总到一个池子里。README 标称支持 34 家免费 LLM 提供方、635 个免费模型端点，对外提供统一的 OpenAI-compatible API，能按限流和健康状态自动选择模型，遇到 429 / 5xx 时故障转移。提供方的 Key 在本地 SQLite 中加密保存。

典型结构是 Google 免费额度、Groq、Cerebras、Mistral、OpenRouter、Zhipu、NVIDIA、HuggingFace 接进来，对外给一个统一地址，很适合做「个人免费模型池」。

但它的定位要说清楚：官方架构文档明确把它定义为 local-first、single-user，不支持多租户鉴权，也不建议暴露到公网给其他人用。自己用、自己的多台设备、自己的 VPS 都没问题，但它不是给公众提供 API 的设计。

### Magpie：管 Agent，也管模型

项目地址：`yetone/magpie`

更接近「AI Coding Agent 管理器 + 本地 Gateway」。思路是把 Claude Code、Codex、Gemini CLI、OpenCode、Cursor 这些 Agent 统一接进来，再由 Magpie 连到 DeepSeek、Kimi、GLM、Claude、GPT、Gemini、Qwen、Groq 等 Provider。

它的 Gateway Key 值得一提：可以把多个 Provider 放进一个路由组，客户端用一个 Key 访问，某个账号额度用完或被限流就自动切下一个；还能给 Key 设置按日、周、月的 Token / 费用上限。所以它已经具备一定的「多客户端共享」能力。

不过核心定位仍然是管理自己的 Agent、Provider 和 Gateway。适合同一个人多设备、AI 编程工具统一接入、个人 VPS，小范围共享也行，但不适合当公共 API SaaS。

### New API：一个完整的 API 管理平台

项目地址：`QuantumNous/new-api`

用 Channel 管理上游：一个 Channel 对应某个服务商的 Key，并配置它支持哪些模型。在此之上提供统一 API、渠道负载均衡、自动故障切换、Token 权限、模型限制、审计、用量与成本管理。

它的 API Key 本身就是一个管理对象，可以设置 Quota、有效期、模型限制、分组、IP 白名单。所以结构上更接近完整的 API 管理平台，适合多用户、多 Key、需要后台和额度控制的场景。

需要提醒的是，官方强调它面向合法授权场景，默认用于个人、团队内部和企业私有化部署。「具备多用户能力」不等于可以无视上游服务条款去做公开转售。

### LiteLLM：工程化的 LLM 基础设施

项目地址：`BerriAI/litellm`

更接近专业的 LLM Infrastructure Gateway。支持大量 Provider，把请求统一抽象成 Gateway API，核心概念是 Virtual Key：真实 Key 存在 LiteLLM 里，客户端只拿到 Virtual Key，可以绑定 User、Team、Budget、RPM、TPM、并发限制。

需要注意，预算和 Virtual Key 这套体系依赖数据库，官方文档要求接 PostgreSQL 之类的存储。它更适合企业 / 团队网关、多 Provider 路由与 fallback、细粒度 Key 和预算管理，但开箱即用的程度不如 New API，学习成本也更高。

## 一句话记住四个项目

- FreeLLMAPI：把全网免费模型额度聚起来给自己用。
- Magpie：把自己的 Agent、模型、账号统一管起来。
- New API：做一个有用户、Key、额度、权限的 AI API 平台。
- LiteLLM：搭一个专业、工程化的 LLM Gateway。

它们不是「谁更强」，是四种产品定位。

## 部署到 VPS 时的边界

这几个项目都能部署到自己的服务器，但要区分「部署在服务器上」和「对公网开放」。

正常架构是：手机、电脑、Codex 等客户端通过 HTTPS 访问 `api.example.com`，由 Nginx / Caddy 反向代理到 LLM Gateway，再由 Gateway 连多个 Provider。

不推荐的做法是直接把 `http://公网IP:端口` 暴露出去。更合理的做法是公网只开 443，由 HTTPS 反代到 `127.0.0.1:内部端口`，把 TLS、域名、访问控制、日志、限流这些能力放在网关前面。

启动容器时同理，端口绑定写成本地回环，别写成默认的全部网卡：

```bash
docker run -d \
  --name llm-router \
  -p 127.0.0.1:8080:8080 \
  -e APP_ENCRYPTION_KEY="<你的随机密钥>" \
  -e SESSION_SECRET="<你的随机密钥>" \
  --restart unless-stopped \
  <镜像名>:<版本>
```

至于「自己用」和「给别人用」，这是选型里最重要的一条分界线。

## 按场景选

**场景 A：自己的多个设备。** Windows、Android、Linux、服务器、Codex、Claude Code、OpenCode 都走同一个 `https://api.example.com/v1` 和同一把 Key。重点在稳定、简单、低资源、多 Provider、fallback，优先考虑 Magpie 或 FreeLLMAPI。

**场景 B：自己搭公网 API，但只有自己用。** VPS 在海外，手机、电脑、平板都通过 VPS 访问网关，这也没问题，仍然是 Magpie 或 FreeLLMAPI：更在意免费模型池就选 FreeLLMAPI，更在意 Agent 和 Codex 统一接入就选 Magpie。

**场景 C：给多个用户发 Key。** 需要额度、限流、模型权限、IP 限制、用户管理和统计时，应该直接上 New API 或 LiteLLM。

New API 和 LiteLLM 之间的区别，可以理解为「已经做好的平台」和「Gateway 基础设施」。前者有 Web 后台，用户、Token、Channel、模型、额度、权限、统计一应俱全，部署完就比较好懂；后者更强调 Provider 抽象、Routing、Fallback、Virtual Key、Budget、Team、Rate Limit、Observability，适合把网关当成基础设施、以后还要接更复杂 AI 系统的场景。想快速跑起来选 New API，想研究 AI Infra 选 LiteLLM。

## 我自己的结论

如果只是长期给自己用，没必要一上来就搞复杂。一台 VPS + Docker Compose，跑一个 Gateway，接上 Gemini、DeepSeek、Qwen，前面套一层 HTTPS 反向代理，客户端统一成：

```text
Base URL: https://api.example.com/v1
API Key:  sk-xxxxxxxx
```

之后再换工具，无论是 Python、Spring AI、OpenAI SDK、Claude Code、Codex、OpenCode、Cline 还是 Cursor，都围绕这一层管理，迁移成本会低很多。

真正需要警惕的不是「公网」两个字，而是认证、HTTPS、Key 泄露、限流，以及别把只允许个人使用的免费额度变成对外的公共 API。反过来说，如果一开始就打算开放给其他人，那 User / Key / Quota / Rate Limit / Permission / Usage 这些概念必须从设计阶段就写进去。
