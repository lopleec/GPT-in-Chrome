# GPT in Chrome

GPT in Chrome is a Chrome side panel copilot powered by any OpenAI-compatible API. It can read the current page, capture screenshots, inspect console output, run short page scripts, manage tabs, and take actions on the web.

Inspired by the workflow of Claude in Chrome, but built as an independent Chrome MV3 extension.

## Jump To

- [English](#english)
- [简体中文](#简体中文)

---

## English

### Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Why This Project](#why-this-project)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Safety Model](#safety-model)
- [Privacy Notes](#privacy-notes)
- [Current Limitations](#current-limitations)
- [Development](#development)
- [Positioning](#positioning)

### Overview

GPT in Chrome is a Chrome side panel copilot powered by any OpenAI-compatible API. It can read the current page, capture screenshots, inspect console output, run short page scripts, manage tabs, and take actions on the web.

### Features

- Side panel chat UI with streaming responses
- Markdown rendering for assistant output
- Session history with restore and delete
- Onboarding flow for first-time setup
- Browser-language aware UI with manual `English / 简体中文` switch
- Support for any OpenAI-compatible `chat/completions` endpoint
- Multiple models with quick switching from the top bar
- Read page context from the active tab
- Capture visible screenshots and full-page screenshots
- Read recent console logs
- Run short JavaScript snippets in a DevTools-like page context
- Web actions: click, type, scroll, navigate, wait for selectors
- Tab actions: list, create, switch, and close tabs in the current window
- Ask-first / auto-run execution modes for tool calls
- Visual action cursor overlay to show where GPT is operating

### Why This Project

Most browser AI assistants are tightly coupled to one provider. This project keeps the same "AI inside the browser" feeling while letting you bring your own API endpoint, key, and model.

That means you can use:

- OpenAI
- OpenAI-compatible proxies
- self-hosted gateways
- other vendors that expose an OpenAI-style API

### Tech Stack

- Chrome Extension Manifest V3
- `chrome.sidePanel`
- `chrome.scripting`
- `chrome.tabs`
- `chrome.debugger` with Chrome DevTools Protocol
- Vanilla HTML, CSS, and JavaScript

### Project Structure

```text
.
├── manifest.json      # Extension config and permissions
├── background.js      # Chrome API bridge, debugger, tab control, screenshots
├── sidepanel.html     # Side panel markup
├── sidepanel.css      # UI styling, light/dark appearance, motion
├── sidepanel.js       # Chat logic, streaming, markdown, settings, history, tools
└── assets/            # Icons and branding assets
```

### Installation

No build step is required.

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder:

   ```text
   /path/to/GPT in Chrome
   ```

5. Pin the extension if you want quick access
6. Click the extension icon to open the side panel

### Setup

On first launch, the onboarding flow asks for:

- `Base URL`
- `Endpoint Path`
- `API Key`
- `Models`
- `Language`
- `Action Mode`

Example:

- Base URL: `https://api.openai.com/v1`
- Endpoint Path: `chat/completions`

If your provider gives you a full endpoint URL, you can also place the full path in `Base URL` and leave `Endpoint Path` empty.

### Usage

#### Chat

- Press `Enter` to send
- Press `Shift + Enter` for a new line
- Responses stream in progressively
- Final assistant messages render as Markdown

#### Tools

From the composer and tool panel, GPT can:

- sync page context
- capture screenshots
- inspect console logs
- run page scripts
- act on page elements
- manage tabs in the current window

#### Sessions

- Start a new session from the top bar
- Open the history panel from the history button
- Restore or delete saved conversations

### Safety Model

The extension supports two action modes:

- `Ask First`: mutating actions require approval
- `Auto Run`: GPT can execute actions directly

Mutating actions include things like:

- clicking elements
- typing into forms
- navigating pages
- running scripts
- switching tabs
- closing tabs

### Privacy Notes

- Your API key is stored in Chrome extension storage on your machine
- Page text, screenshots, and tool results may be sent to the API endpoint you configure
- Do not use untrusted endpoints for sensitive browsing sessions
- The extension refuses some high-risk actions by default in its system prompt

### Current Limitations

- `chrome://`, extension pages, and some protected browser surfaces cannot be scripted
- If Chrome DevTools is already attached to a tab, debugger-based features may fail until DevTools is closed
- Full-page screenshots and console inspection depend on Chrome debugger access
- Tool calling quality depends on how well your configured model supports OpenAI-compatible tools and multimodal input

### Development

This project is intentionally simple to iterate on:

1. Edit the local files
2. Return to `chrome://extensions/`
3. Click **Reload** on the extension
4. Reopen the side panel and test again

### Positioning

This project is:

- inspired by the side-panel browser agent experience of Claude in Chrome
- provider-agnostic
- local-first in setup
- lightweight and hackable

This project is not:

- an official Claude product
- affiliated with Anthropic
- tied to a single API vendor

---

## 简体中文

### 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [为什么做这个项目](#为什么做这个项目)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [安装方式](#安装方式)
- [首次配置](#首次配置)
- [使用方式](#使用方式)
- [安全模式](#安全模式)
- [隐私说明](#隐私说明)
- [当前限制](#当前限制)
- [开发方式](#开发方式)
- [项目定位](#项目定位)

### 项目简介

GPT in Chrome 是一个运行在 Chrome 侧边栏里的 AI 助手，支持接入任何兼容 OpenAI 格式的 API。它可以读取当前网页、截取截图、查看控制台输出、执行简短页面脚本、管理标签页，并直接在网页上执行操作。

### 功能特性

- 侧边栏聊天界面，支持流式输出
- 助手消息支持 Markdown 渲染
- 支持聊天历史记录、恢复和删除
- 首次使用带有 Onboarding 引导
- 支持跟随浏览器语言，也可手动切换 `English / 简体中文`
- 支持任意 OpenAI 兼容的 `chat/completions` 接口
- 支持多个模型，并可在顶部快速切换
- 可读取当前标签页的页面上下文
- 支持可视区域截图和整页截图
- 支持读取最近的控制台日志
- 支持在类似 DevTools 的上下文里运行简短 JavaScript
- 支持网页操作：点击、输入、滚动、跳转、等待元素
- 支持标签页操作：列出、新建、切换、关闭当前窗口内的标签页
- 支持“先确认”与“自动执行”两种工具调用模式
- 在网页中显示 GPT 的操作位置光标

### 为什么做这个项目

很多浏览器 AI 助手都绑定在单一提供商上。这个项目希望保留那种“AI 直接在浏览器里工作”的体验，同时允许你自己选择 API 地址、密钥和模型。

也就是说，你可以接入：

- OpenAI
- OpenAI 兼容代理
- 自建网关
- 其他提供 OpenAI 风格接口的服务商

### 技术栈

- Chrome Extension Manifest V3
- `chrome.sidePanel`
- `chrome.scripting`
- `chrome.tabs`
- `chrome.debugger` + Chrome DevTools Protocol
- 原生 HTML、CSS、JavaScript

### 项目结构

```text
.
├── manifest.json      # 扩展配置与权限
├── background.js      # Chrome API 桥接、调试器、标签页控制、截图能力
├── sidepanel.html     # 侧边栏结构
├── sidepanel.css      # UI 样式、明暗外观、动效
├── sidepanel.js       # 聊天逻辑、流式输出、Markdown、设置、历史记录、工具调用
└── assets/            # 图标与品牌资源
```

### 安装方式

本项目无需构建，可直接加载。

1. 打开 Chrome，进入 `chrome://extensions/`
2. 打开右上角 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择这个目录：

   ```text
   /path/to/GPT in Chrome
   ```

5. 建议把扩展固定到工具栏
6. 点击扩展图标打开侧边栏

### 首次配置

第一次打开时，Onboarding 会引导你填写：

- `Base URL`
- `Endpoint Path`
- `API Key`
- `Models`
- `Language`
- `Action Mode`

示例：

- Base URL: `https://api.openai.com/v1`
- Endpoint Path: `chat/completions`

如果你的服务商直接提供完整的 endpoint，也可以把完整地址填到 `Base URL`，并把 `Endpoint Path` 留空。

### 使用方式

#### 聊天

- `Enter` 发送
- `Shift + Enter` 换行
- 回复会以流式方式逐步输出
- 最终助手消息会渲染为 Markdown

#### 工具

通过输入框下方和工具面板，GPT 可以：

- 同步当前页面上下文
- 截图
- 查看控制台日志
- 运行页面脚本
- 操作网页元素
- 管理当前窗口中的标签页

#### 会话

- 可从顶部按钮开启新会话
- 可从历史按钮打开聊天记录面板
- 可恢复或删除历史会话

### 安全模式

扩展支持两种操作模式：

- `Ask First`：修改性操作先请求确认
- `Auto Run`：GPT 直接执行操作

修改性操作包括但不限于：

- 点击元素
- 在表单中输入
- 页面跳转
- 运行脚本
- 切换标签页
- 关闭标签页

### 隐私说明

- 你的 API Key 会保存在本机的 Chrome 扩展存储中
- 页面文本、截图和工具返回结果可能会被发送到你配置的 API 端点
- 涉及敏感浏览内容时，不建议使用不可信的 API 服务
- 扩展默认系统提示词会拒绝部分高风险操作

### 当前限制

- `chrome://`、扩展页和部分受保护页面无法被脚本注入或控制
- 如果某个标签页已被 Chrome DevTools 占用，调试器相关能力可能失效，需先关闭 DevTools
- 整页截图和控制台读取依赖 Chrome debugger 权限
- 工具调用效果取决于你接入的模型对 OpenAI 兼容 tools 和多模态输入的支持程度

### 开发方式

这个项目适合直接本地迭代：

1. 修改本地文件
2. 回到 `chrome://extensions/`
3. 点击扩展卡片上的 **重新加载**
4. 重新打开侧边栏进行测试

### 项目定位

这个项目：

- 参考了 Claude in Chrome 的侧边栏浏览器代理体验
- 不绑定单一模型提供商
- 采用本地优先的配置方式
- 结构轻量，便于继续改造

这个项目不是：

- Claude 官方产品
- Anthropic 官方项目
- 只支持单一 API 厂商的扩展
