---
title: "PDF 交给 AI 后发生了什么：从解析到 RAG 的完整链路"
published: 2026-03-05
updated: 2026-09-30
description: "拆解 PDF 智能问答从文档解析、切片、向量化、检索到答案引用的全过程，并说明 RAG 能做什么、不能保证什么。"
tags: [RAG, PDF, Spring AI, 向量检索]
category: AI
draft: false
---

把一份 PDF 上传给 AI，再对它提问，看起来只是“读取文件然后回答”。真正落到工程里，这个过程至少包含文档解析、文本切片、向量化、检索、上下文组装和答案生成。

任何一个环节出错，最后的回答都可能偏离原文。理解完整链路，比只关注模型名称更重要。

## 全流程概览

```text
PDF 文件
  ↓
解析文字、表格和页面信息
  ↓
清洗并切分为知识块
  ↓
Embedding 向量化
  ↓
写入向量存储
  ↓
用户提问
  ↓
检索相关知识块并重排序
  ↓
把问题与证据交给大模型
  ↓
生成回答、引用来源、允许人工核对
```

这类流程通常被称为 RAG，即检索增强生成。

## 第一阶段：文档接入与解析

首先要判断文件是否真的是可提取文字的 PDF。

### 原生 PDF

由 Word、排版软件或网页导出的 PDF，通常包含文字层，可以直接提取文本。不过多栏排版、页眉页脚、脚注和跨页表格仍可能打乱阅读顺序。

### 扫描 PDF

扫描件本质上是一组图片，需要先经过 OCR。OCR 的错误会继续传递到后面的切片、检索和回答阶段，因此不能只看“是否识别出了文字”，还要抽查数字、专有名词和表格。

### 结构与元数据

除了正文，系统还应该保留页码、章节、文件名和标题层级。这些元数据既能帮助过滤检索，也能让回答回链到原文位置。

文档解析阶段常见的失败包括：

- 双栏内容被交叉拼接；
- 页眉页脚在每个页面重复出现；
- 表格被拆成无意义的文本序列；
- OCR 混淆数字、单位和相近字符；
- 页面编号与 PDF 实际页码不一致。

## 第二阶段：清洗与切片

大模型有上下文窗口，向量检索也需要粒度合适的知识单元，所以不能总把整本 PDF 当成一个对象。

切片可以按固定字符数、Token、段落、标题或语义边界进行。常见做法还会在相邻片段之间保留少量重叠，避免一句话或一项定义被硬切开。

切片没有统一最优值：

- 太小，语义不完整；
- 太大，检索命中后会夹带大量无关内容；
- 重叠太少，跨段信息容易丢失；
- 重叠太多，又会增加存储和上下文重复。

真正需要优化的不是某个神奇数字，而是“用户的问题能否检索到足够完整的证据”。

## 第三阶段：向量化与存储

Embedding 模型会把文本转换成向量。语义相近的内容在向量空间中通常更接近，因此系统可以用相似度找到与问题相关的片段，而不必要求关键词完全一致。

写入向量存储时，不应只保存向量，还要同时保留：

- 原始文本；
- 文件和页面来源；
- 标题或章节；
- 权限和租户信息；
- 文档版本与更新时间。

没有这些元数据，就很难做精确过滤、权限控制和引用回链。

## 第四阶段：检索与重排序

用户提问后，系统会把问题也转换成向量，从向量库中召回若干相关片段，也就是 Top-K Retrieval。

复杂系统还会加入：

- 查询改写：把口语问题改成更适合检索的表达；
- 混合检索：同时使用向量相似度和关键词搜索；
- 元数据过滤：只查某个用户、文档或时间范围；
- 重排序：用更精细的模型重新判断候选片段相关性。

如果答案需要的信息从未被召回，后面的模型再强也很难凭空补回。因此评估 RAG 时，应把“检索是否找对证据”和“模型是否基于证据回答”分开测试。

## 第五阶段：生成、引用与拒答

检索到的片段会与用户问题一起组成提示词，再交给大模型生成回答。常见约束包括：

- 仅依据提供的材料回答；
- 材料不足时明确说明未找到；
- 标注文件名、章节或页码；
- 区分原文事实和模型推断。

需要特别强调：**RAG 可以降低幻觉风险，但不能消除幻觉。**

解析错误、检索遗漏、上下文冲突、模型误读和错误引用都可能让答案失真。可靠系统应该让用户方便地回到原文核对，而不是只给一个语气笃定的结论。

## 用 Spring AI 搭一个验证原型

Spring AI 提供了文档读取、文本转换、向量存储和 Advisor 等抽象。以当前 2.0.1 文档中的接口为例，一个验证原型可以采用下面的结构。

### 读取、切片并写入向量库

```java
PagePdfDocumentReader reader = new PagePdfDocumentReader(resource);
TokenTextSplitter splitter = TokenTextSplitter.builder().build();

List<Document> chunks = splitter.apply(reader.read());
vectorStore.write(chunks);
```

测试或演示阶段可以使用内存实现：

```java
@Bean
VectorStore vectorStore(EmbeddingModel embeddingModel) {
    return SimpleVectorStore.builder(embeddingModel).build();
}
```

`SimpleVectorStore` 适合演示和测试，不应被当成生产级向量数据库。它在内存中保存向量并进行相似度检索，数据量、持久化和并发能力都有明确边界。

### 在提问时挂载检索

```java
QuestionAnswerAdvisor advisor = QuestionAnswerAdvisor.builder(vectorStore)
    .searchRequest(SearchRequest.builder().topK(5).build())
    .build();

String answer = chatClient.prompt()
    .user(question)
    .advisors(advisor)
    .call()
    .content();
```

这段代码展示的是关键关系，而不是可以脱离版本和配置直接复制运行的完整项目。模型客户端、Embedding 模型、依赖版本、文件校验和异常处理仍需在工程中单独配置。

## 从演示走向真实系统还缺什么

- 上传文件的大小、类型和恶意内容校验；
- OCR、表格和复杂版式解析；
- 异步索引和进度状态；
- 文档更新、删除与索引版本管理；
- 用户和租户级权限隔离；
- 检索质量、引用正确率和拒答率评估；
- Prompt 注入与敏感数据防护；
- 线上成本、延迟、日志和可观测性。

一个能回答问题的 Demo，只证明链路跑通；一个值得信任的文档问答系统，还必须证明答案来自正确证据，并且用户能够追溯和纠错。

## 参考资料

- [Spring AI：ETL Pipeline](https://docs.spring.io/spring-ai/reference/2.0-SNAPSHOT/api/etl-pipeline.html)
- [Spring AI：Retrieval Augmented Generation](https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html)
- [Spring AI：Vector Databases](https://docs.spring.io/spring-ai/reference/api/vectordbs.html)

