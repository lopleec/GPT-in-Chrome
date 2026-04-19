const DEFAULT_SETTINGS = {
  baseUrl: "https://api.openai.com/v1",
  endpointPath: "chat/completions",
  apiKey: "",
  models: ["gpt-4.1-mini"],
  activeModel: "gpt-4.1-mini",
  language: "auto",
  approvalMode: "ask",
  includeContextByDefault: true,
  onboardingComplete: false,
  systemPrompt: [
    "You are GPT in Chrome, a browser side-panel assistant.",
    "You can inspect the current web page, read console logs, run short page scripts, click, type, scroll, navigate, manage browser tabs, and wait for selectors.",
    "Prefer reading page context before acting.",
    "Keep scripts short and explicit.",
    "Do not request passwords, payment card details, or highly sensitive data.",
    "Refuse financial transactions, permanent destructive actions, and permission changes."
  ].join(" ")
};

const HISTORY_STORAGE_KEY = "chatHistoryV1";
const MAX_HISTORY_SESSIONS = 24;
const MAX_SESSION_MESSAGES = 120;
const MAX_STORED_TEXT_LENGTH = 16000;

const TRANSLATIONS = {
  en: {
    pageLabel: "Page",
    pageFallback: "Current Page",
    newSession: "New Session",
    settings: "Settings",
    syncPage: "Sync Page",
    captureVisible: "Capture",
    captureFull: "Full Page",
    consoleLogs: "Console",
    attachPage: "Attach page by default",
    pageScript: "Page Script",
    javascript: "JavaScript",
    run: "Run",
    ready: "Ready",
    approval: "Approval",
    reject: "Reject",
    emptyState: "Start a new session",
    promptPlaceholder: "Reply to GPT in Chrome",
    tools: "Tools",
    send: "Send",
    close: "Close",
    welcome: "Welcome",
    welcomeTitle: "Bring GPT into Chrome.",
    welcomeCopy:
      "Connect any OpenAI-compatible API, then let it read pages, capture screenshots, inspect console output, and act on the web.",
    featureRead: "Page Read",
    featureScreenshot: "Screenshot",
    featureActions: "Web Actions",
    setUp: "Set Up",
    connection: "Connection",
    connectionTitle: "OpenAI-Compatible API",
    baseUrl: "Base URL",
    endpointPath: "Endpoint Path",
    apiKey: "API Key",
    models: "Models",
    modelsNote: "One model per line, switch from the top picker.",
    language: "Language",
    languageAuto: "Follow browser",
    languageZh: "简体中文",
    languageEn: "English",
    actionMode: "Action Mode",
    askFirst: "Ask First",
    autoRun: "Auto Run",
    advanced: "Advanced",
    systemPrompt: "System Prompt",
    back: "Back",
    start: "Start",
    save: "Save",
    switchedModel: "Switched to {model}",
    approvalAskNotice: "Ask before acting.",
    approvalAutoNotice: "Actions will run automatically.",
    contextOnNotice: "Page context will be attached.",
    contextOffNotice: "Chat only, no page context.",
    addModelNotice: "Add at least one model.",
    missingConfigNotice: "Missing Base URL, API key, or model.",
    settingsSavedNotice: "Settings saved.",
    newSessionNotice: "New session started.",
    writeJsNotice: "Write some JavaScript first.",
    writePromptNotice: "Tell GPT what to do first.",
    finishSetupNotice: "Finish API setup first.",
    waitingApprovalNotice: "Waiting for approval before acting.",
    readTabFailed: "Failed to read tab.",
    captureFailed: "Capture failed.",
    screenshotAttached: "Screenshot attached.",
    consoleReadFailed: "Console read failed.",
    runFailed: "Run failed.",
    modelNoMessage: "Model returned no usable message.",
    saveButtonStart: "Start",
    saveButtonSave: "Save",
    pageAttached: "Page attached",
    attachmentVisible: "Capture",
    attachmentFull: "Full Page",
    remove: "Remove",
    history: "History",
    recentSessions: "Recent sessions",
    noHistory: "No saved sessions yet",
    deleteSession: "Delete session",
    deletedSessionNotice: "Session deleted.",
    restoredSessionNotice: "Session restored.",
    localConsoleLogs: "Recent console logs:",
    localConsoleResult: "Console result:",
    messagePaused: "I paused here for now. Give me one more specific instruction and I'll continue."
  },
  zh: {
    pageLabel: "页面",
    pageFallback: "当前页面",
    newSession: "新会话",
    settings: "设置",
    syncPage: "同步页面",
    captureVisible: "可视截图",
    captureFull: "整页截图",
    consoleLogs: "读取控制台",
    attachPage: "默认附带页面",
    pageScript: "页面脚本",
    javascript: "JavaScript",
    run: "运行",
    ready: "等待执行...",
    approval: "待确认",
    reject: "拒绝",
    emptyState: "开始一个新会话",
    promptPlaceholder: "回复 GPT in Chrome",
    tools: "工具",
    send: "发送",
    close: "关闭",
    welcome: "欢迎",
    welcomeTitle: "把 GPT 放进 Chrome。",
    welcomeCopy: "接上任意 OpenAI 兼容接口，然后让它读页面、截图、看控制台、操作网页。",
    featureRead: "网页阅读",
    featureScreenshot: "截图理解",
    featureActions: "页面操作",
    setUp: "开始配置",
    connection: "连接配置",
    connectionTitle: "OpenAI 兼容接口",
    baseUrl: "接口地址",
    endpointPath: "接口路径",
    apiKey: "密钥",
    models: "模型列表",
    modelsNote: "每行一个模型，顶部下拉直接切换。",
    language: "语言",
    languageAuto: "跟随浏览器",
    languageZh: "简体中文",
    languageEn: "English",
    actionMode: "动作权限",
    askFirst: "先确认",
    autoRun: "直接执行",
    advanced: "高级设置",
    systemPrompt: "系统提示词",
    back: "上一步",
    start: "开始使用",
    save: "保存设置",
    switchedModel: "已切换到 {model}",
    approvalAskNotice: "现在会先确认再操作。",
    approvalAutoNotice: "现在会直接执行页面操作。",
    contextOnNotice: "发送时会附带当前页面。",
    contextOffNotice: "发送时只保留聊天内容。",
    addModelNotice: "至少要填一个模型。",
    missingConfigNotice: "还差 Base URL、API Key 或模型。",
    settingsSavedNotice: "设置已保存。",
    newSessionNotice: "已开始新会话。",
    writeJsNotice: "先写一段 JS。",
    writePromptNotice: "先写点任务给我。",
    finishSetupNotice: "先把接口配置好。",
    waitingApprovalNotice: "模型准备操作网页，等你确认。",
    readTabFailed: "读取标签页失败。",
    captureFailed: "截图失败。",
    screenshotAttached: "截图已附加到当前会话。",
    consoleReadFailed: "读取控制台失败。",
    runFailed: "运行失败。",
    modelNoMessage: "模型没有返回可用消息。",
    saveButtonStart: "开始使用",
    saveButtonSave: "保存设置",
    pageAttached: "已附带页面上下文",
    attachmentVisible: "可视截图",
    attachmentFull: "整页截图",
    remove: "移除",
    history: "历史记录",
    recentSessions: "最近会话",
    noHistory: "还没有保存的会话",
    deleteSession: "删除会话",
    deletedSessionNotice: "已删除会话。",
    restoredSessionNotice: "已恢复会话。",
    localConsoleLogs: "最近控制台日志：",
    localConsoleResult: "Console 结果：",
    messagePaused: "我先停在这里了，再补一句更具体的指令我会继续。"
  }
};

function detectBrowserLanguage() {
  const browserLanguage = chrome.i18n?.getUILanguage?.() || navigator.language || "en";
  return String(browserLanguage).toLowerCase().startsWith("zh") ? "zh" : "en";
}

function resolveLocale(settings = state.settings) {
  return settings.language === "zh" || settings.language === "en"
    ? settings.language
    : detectBrowserLanguage();
}

function t(key, vars = {}) {
  const table = TRANSLATIONS[state.locale] || TRANSLATIONS.en;
  const template = table[key] || TRANSLATIONS.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_match, name) => String(vars[name] ?? ""));
}

const TOOL_SCHEMAS = [
  {
    type: "function",
    function: {
      name: "get_tab_context",
      description: "Read the current page and return title, URL, visible text, headings, clickable items, and form fields.",
      parameters: {
        type: "object",
        properties: {
          maxChars: {
            type: "number",
            description: "Maximum characters of visible page text to return."
          },
          maxItems: {
            type: "number",
            description: "Maximum count of buttons, links, and fields to include."
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "read_console_logs",
      description: "Read recent browser console and debugger log entries for the active tab.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "How many recent log entries to return."
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "run_console_script",
      description: "Run a short JavaScript snippet on the current page in a DevTools-like console context.",
      parameters: {
        type: "object",
        properties: {
          script: {
            type: "string",
            description: "JavaScript expression or snippet to evaluate on the page."
          }
        },
        required: ["script"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_tabs",
      description: "List tabs in the current browser window, including ids, titles, URLs, and which tab is active.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of tabs to return."
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_tab",
      description: "Create a new tab in the current browser window.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Optional URL to open in the new tab."
          },
          active: {
            type: "boolean",
            description: "Whether the new tab should become the active tab."
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "switch_tab",
      description: "Switch to another tab in the current browser window by tab id.",
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: "The tab id to activate."
          }
        },
        required: ["tabId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "close_tab",
      description: "Close a tab in the current browser window. If no tab id is provided, close the active tab.",
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: "Optional tab id to close."
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "click_element",
      description: "Click a page element by CSS selector.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "A CSS selector for the target element."
          }
        },
        required: ["selector"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "type_into_element",
      description: "Type text into an input, textarea, select-like control, or contenteditable area.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "A CSS selector for the target field."
          },
          text: {
            type: "string",
            description: "The text to type."
          },
          clear: {
            type: "boolean",
            description: "Whether to clear the field before typing."
          },
          submit: {
            type: "boolean",
            description: "Whether to attempt form submission after typing."
          }
        },
        required: ["selector", "text"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "scroll_page",
      description: "Scroll the page up or down by part of the viewport or by pixel amount.",
      parameters: {
        type: "object",
        properties: {
          direction: {
            type: "string",
            enum: ["up", "down"]
          },
          amount: {
            type: "number",
            description: "If <= 1 it is treated as viewport ratio, otherwise pixels."
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate_current_tab",
      description: "Navigate the current tab to a new URL.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to open in the current tab."
          }
        },
        required: ["url"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "wait_for_selector",
      description: "Wait until a selector appears or becomes visible on the current page.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "A CSS selector to wait for."
          },
          timeoutMs: {
            type: "number",
            description: "Maximum wait time in milliseconds."
          }
        },
        required: ["selector"]
      }
    }
  }
];

const MUTATING_TOOLS = new Set([
  "create_tab",
  "switch_tab",
  "close_tab",
  "run_console_script",
  "click_element",
  "type_into_element",
  "scroll_page",
  "navigate_current_tab"
]);

const state = {
  settings: { ...DEFAULT_SETTINGS },
  locale: "en",
  currentSessionId: "",
  sessions: [],
  messages: [],
  attachment: null,
  tab: null,
  pending: null,
  isBusy: false,
  toolsOpen: false,
  historyOpen: false,
  overlayMode: "settings",
  overlayStep: 0,
  renderQueued: false,
  streamPatchQueued: false,
  pendingStreamMessageId: ""
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  bindEvents();
  state.settings = await loadSettings();
  state.locale = resolveLocale(state.settings);
  syncSettingsIntoUI();
  await loadSessionHistory();
  await refreshTabMeta();
  renderMessages();
  renderAttachments();
  renderPending();
  autoResizePrompt();

  if (shouldShowOnboarding()) {
    openSettingsOverlay("onboarding", 0);
  }
}

function cacheElements() {
  const ids = [
    "settings-button",
    "history-button",
    "history-sheet",
    "history-empty",
    "tools-button",
    "refresh-tab-button",
    "model-select",
    "new-session-button",
    "page-chip-label",
    "tab-title",
    "tab-url",
    "notice",
    "approval-panel",
    "approval-title",
    "approval-detail",
    "approve-approval-button",
    "reject-approval-button",
    "tools-sheet",
    "capture-visible-button",
    "capture-full-button",
    "console-logs-button",
    "approval-mode-button",
    "approval-mode-text",
    "page-context-toggle",
    "page-context-label",
    "console-summary",
    "console-label",
    "console-input",
    "run-console-button",
    "console-output",
    "approval-kicker",
    "empty-state",
    "empty-state-text",
    "history-label",
    "history-list",
    "messages",
    "attachments",
    "prompt-input",
    "send-button",
    "settings-overlay",
    "settings-close-button",
    "welcome-step",
    "welcome-kicker",
    "welcome-title",
    "welcome-copy",
    "feature-read",
    "feature-screenshot",
    "feature-actions",
    "connect-step",
    "connect-kicker",
    "connect-title",
    "onboarding-next-button",
    "onboarding-back-button",
    "base-url-label",
    "base-url-input",
    "endpoint-path-label",
    "endpoint-path-input",
    "api-key-label",
    "api-key-input",
    "models-label",
    "models-input",
    "models-note",
    "language-label",
    "settings-language",
    "language-option-auto",
    "language-option-zh",
    "language-option-en",
    "action-mode-label",
    "settings-approval-mode",
    "approval-option-ask",
    "approval-option-auto",
    "settings-include-context-label",
    "settings-include-context",
    "advanced-summary",
    "system-prompt-label",
    "system-prompt-input",
    "save-settings-button"
  ];

  for (const id of ids) {
    els[id] = document.getElementById(id);
  }

  els.stepDots = document.querySelector(".step-dots");
  els.stepDotItems = Array.from(document.querySelectorAll("[data-step-dot]"));
}

function bindEvents() {
  els["settings-button"].addEventListener("click", () => {
    openSettingsOverlay(hasConnectionConfig(state.settings) ? "settings" : "onboarding", 1);
  });
  els["refresh-tab-button"].addEventListener("click", refreshTabMeta);
  els["model-select"].addEventListener("change", async (event) => {
    state.settings.activeModel = event.target.value;
    await persistSettings();
    refreshModelOptions();
    showNotice(t("switchedModel", { model: state.settings.activeModel }));
  });
  els["new-session-button"].addEventListener("click", () => {
    void startNewSession();
  });
  els["history-button"].addEventListener("click", (event) => {
    event.stopPropagation();
    toggleHistory(!state.historyOpen);
  });
  els["tools-button"].addEventListener("click", (event) => {
    event.stopPropagation();
    toggleTools(!state.toolsOpen);
  });
  els["capture-visible-button"].addEventListener("click", () => captureScreenshot("visible"));
  els["capture-full-button"].addEventListener("click", () => captureScreenshot("full"));
  els["console-logs-button"].addEventListener("click", loadConsoleLogs);
  els["run-console-button"].addEventListener("click", runManualConsole);
  els["send-button"].addEventListener("click", sendPrompt);
  els["approve-approval-button"].addEventListener("click", approvePendingAction);
  els["reject-approval-button"].addEventListener("click", rejectPendingAction);
  els["settings-close-button"].addEventListener("click", closeSettingsOverlay);
  els["onboarding-next-button"].addEventListener("click", () => setOverlayStep(1));
  els["onboarding-back-button"].addEventListener("click", () => setOverlayStep(0));
  els["save-settings-button"].addEventListener("click", saveSettingsFromOverlay);

  els["approval-mode-button"].addEventListener("click", async () => {
    state.settings.approvalMode = state.settings.approvalMode === "ask" ? "auto" : "ask";
    els["settings-approval-mode"].value = state.settings.approvalMode;
    await persistSettings();
    refreshToolbarState();
    showNotice(state.settings.approvalMode === "ask" ? t("approvalAskNotice") : t("approvalAutoNotice"));
  });

  els["page-context-toggle"].addEventListener("change", async (event) => {
    state.settings.includeContextByDefault = event.target.checked;
    els["settings-include-context"].checked = state.settings.includeContextByDefault;
    await persistSettings();
    showNotice(state.settings.includeContextByDefault ? t("contextOnNotice") : t("contextOffNotice"));
  });

  els["settings-overlay"].addEventListener("click", (event) => {
    if (event.target === els["settings-overlay"]) {
      closeSettingsOverlay();
    }
  });

  els["prompt-input"].addEventListener("keydown", (event) => {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      sendPrompt();
    }
  });

  els["prompt-input"].addEventListener("input", autoResizePrompt);

  document.addEventListener("click", (event) => {
    if (state.toolsOpen) {
      if (els["tools-sheet"].contains(event.target) || els["tools-button"].contains(event.target)) {
        return;
      }

      toggleTools(false);
    }

    if (state.historyOpen) {
      if (els["history-sheet"].contains(event.target) || els["history-button"].contains(event.target)) {
        return;
      }

      toggleHistory(false);
    }
  });

  window.addEventListener("focus", refreshTabMeta);
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const normalized = { ...DEFAULT_SETTINGS, ...stored };
  const legacyModel = typeof stored.model === "string" ? stored.model.trim() : "";

  if (!Array.isArray(normalized.models) || normalized.models.length === 0) {
    normalized.models = legacyModel ? [legacyModel] : [...DEFAULT_SETTINGS.models];
  }

  normalized.models = normalized.models
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (normalized.models.length === 0) {
    normalized.models = [...DEFAULT_SETTINGS.models];
  }

  if (!normalized.activeModel || !normalized.models.includes(normalized.activeModel)) {
    normalized.activeModel = normalized.models[0];
  }

  if (!["auto", "zh", "en"].includes(normalized.language)) {
    normalized.language = "auto";
  }

  return normalized;
}

async function persistSettings() {
  await chrome.storage.sync.set(state.settings);
}

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function truncateText(value, maxLength = MAX_STORED_TEXT_LENGTH) {
  const normalized = String(value || "");
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

function normalizeMessage(message) {
  return {
    ...message,
    id: message.id || createId("msg")
  };
}

function sanitizeStoredContent(content) {
  if (typeof content === "string") {
    return truncateText(content);
  }

  if (Array.isArray(content)) {
    const parts = [];

    for (const part of content) {
      if (part?.type === "text") {
        parts.push({
          type: "text",
          text: truncateText(part.text)
        });
      }
    }

    return parts;
  }

  return truncateText(JSON.stringify(content, null, 2));
}

function sanitizeStoredToolCalls(toolCalls) {
  if (!Array.isArray(toolCalls)) {
    return [];
  }

  return toolCalls.map((toolCall, index) => ({
    id: toolCall?.id || `tool_${index}`,
    type: toolCall?.type || "function",
    function: {
      name: String(toolCall?.function?.name || ""),
      arguments: truncateText(toolCall?.function?.arguments || "")
    }
  }));
}

function serializeMessageForStorage(message) {
  return {
    id: message.id || createId("msg"),
    role: message.role,
    content: sanitizeStoredContent(message.content),
    tool_calls: sanitizeStoredToolCalls(message.tool_calls),
    tool_call_id: message.tool_call_id || "",
    timestamp: message.timestamp || new Date().toISOString(),
    contextIncluded: Boolean(message.contextIncluded),
    attachmentLabelKey: message.attachmentLabelKey || ""
  };
}

function deriveSessionTitle(messages) {
  const userMessage = messages.find((message) => message.role === "user");
  const source = truncateText(extractPlainText(userMessage?.content).replace(/\s+/g, " ").trim(), 36);
  return source || t("newSession");
}

function deriveSessionPreview(messages) {
  const candidate = [...messages]
    .reverse()
    .find((message) => message.role === "assistant" || message.role === "user" || message.role === "local");
  return truncateText(extractPlainText(candidate?.content).replace(/\s+/g, " ").trim(), 52);
}

function normalizeStoredMessage(message) {
  return normalizeMessage({
    role: message?.role || "assistant",
    content: Array.isArray(message?.content)
      ? message.content
          .filter((part) => part?.type === "text")
          .map((part) => ({ type: "text", text: String(part.text || "") }))
      : typeof message?.content === "string"
        ? message.content
        : "",
    tool_calls: sanitizeStoredToolCalls(message?.tool_calls),
    tool_call_id: message?.tool_call_id || "",
    timestamp: message?.timestamp || new Date().toISOString(),
    contextIncluded: Boolean(message?.contextIncluded),
    attachmentLabelKey: message?.attachmentLabelKey || "",
    status: "done",
    id: message?.id
  });
}

function normalizeStoredSession(session, index) {
  const messages = Array.isArray(session?.messages) ? session.messages.map(normalizeStoredMessage) : [];
  const createdAt = session?.createdAt || session?.updatedAt || new Date().toISOString();
  const updatedAt = session?.updatedAt || createdAt;

  return {
    id: session?.id || `session_${index}`,
    title: truncateText(session?.title || deriveSessionTitle(messages), 48),
    preview: truncateText(session?.preview || deriveSessionPreview(messages), 60),
    createdAt,
    updatedAt,
    messages
  };
}

function buildSessionRecord(messages, existingSession) {
  const createdAt = existingSession?.createdAt || new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const storedMessages = messages.slice(-MAX_SESSION_MESSAGES).map(serializeMessageForStorage);

  return {
    id: existingSession?.id || state.currentSessionId || createId("session"),
    title: deriveSessionTitle(storedMessages),
    preview: deriveSessionPreview(storedMessages),
    createdAt,
    updatedAt,
    messages: storedMessages
  };
}

async function loadSessionHistory() {
  const stored = await chrome.storage.local.get(HISTORY_STORAGE_KEY);
  const raw = stored[HISTORY_STORAGE_KEY];
  const sessions = Array.isArray(raw?.sessions) ? raw.sessions.map(normalizeStoredSession) : [];

  sessions.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
  state.sessions = sessions.slice(0, MAX_HISTORY_SESSIONS);

  const requestedId = typeof raw?.activeSessionId === "string" ? raw.activeSessionId : "";
  const activeSession =
    state.sessions.find((session) => session.id === requestedId) ||
    state.sessions[0] ||
    null;

  if (activeSession) {
    state.currentSessionId = activeSession.id;
    state.messages = activeSession.messages.map(normalizeMessage);
    return;
  }

  state.currentSessionId = createId("session");
  state.messages = [];
}

function saveSessionHistorySoon() {
  clearTimeout(saveSessionHistorySoon.timer);
  saveSessionHistorySoon.timer = setTimeout(() => {
    void persistSessionHistory();
  }, 160);
}

async function persistSessionHistory() {
  const existingSession = state.sessions.find((session) => session.id === state.currentSessionId);
  const nextSessions = state.sessions.filter((session) => session.id !== state.currentSessionId);
  const hasMessages = state.messages.length > 0;

  if (hasMessages) {
    nextSessions.unshift(buildSessionRecord(state.messages, existingSession));
  }

  nextSessions.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
  state.sessions = nextSessions.slice(0, MAX_HISTORY_SESSIONS);

  await chrome.storage.local.set({
    [HISTORY_STORAGE_KEY]: {
      version: 1,
      activeSessionId: hasMessages ? state.currentSessionId : "",
      sessions: state.sessions
    }
  });
}

async function persistSessionSnapshot() {
  await chrome.storage.local.set({
    [HISTORY_STORAGE_KEY]: {
      version: 1,
      activeSessionId: state.messages.length > 0 ? state.currentSessionId : "",
      sessions: state.sessions
    }
  });
}

function appendMessage(message, { render = true, persist = true } = {}) {
  const normalized = normalizeMessage(message);
  state.messages.push(normalized);

  if (render) {
    renderMessages();
  }

  if (persist) {
    saveSessionHistorySoon();
  }

  return normalized;
}

function formatSessionTime(value) {
  const locale = state.locale === "zh" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function syncSettingsIntoUI() {
  state.locale = resolveLocale(state.settings);
  document.documentElement.lang = state.locale === "zh" ? "zh-CN" : "en";
  els["base-url-input"].value = state.settings.baseUrl;
  els["endpoint-path-input"].value = state.settings.endpointPath;
  els["api-key-input"].value = state.settings.apiKey;
  els["models-input"].value = state.settings.models.join("\n");
  els["settings-language"].value = state.settings.language;
  els["settings-approval-mode"].value = state.settings.approvalMode;
  els["settings-include-context"].checked = state.settings.includeContextByDefault;
  els["page-context-toggle"].checked = state.settings.includeContextByDefault;
  els["system-prompt-input"].value = state.settings.systemPrompt;
  applyTranslations();
  refreshToolbarState();
  refreshModelOptions();
}

function applyTranslations() {
  els["page-chip-label"].textContent = t("pageLabel");
  if (!state.tab?.title) {
    els["tab-title"].textContent = t("pageFallback");
  }
  els["new-session-button"].setAttribute("aria-label", t("newSession"));
  els["new-session-button"].title = t("newSession");
  els["history-button"].setAttribute("aria-label", t("history"));
  els["history-button"].title = t("history");
  els["settings-button"].setAttribute("aria-label", t("settings"));
  els["settings-button"].title = t("settings");
  els["refresh-tab-button"].textContent = t("syncPage");
  els["capture-visible-button"].textContent = t("captureVisible");
  els["capture-full-button"].textContent = t("captureFull");
  els["console-logs-button"].textContent = t("consoleLogs");
  els["page-context-label"].textContent = t("attachPage");
  els["console-summary"].textContent = t("pageScript");
  els["console-label"].textContent = t("javascript");
  els["run-console-button"].textContent = t("run");
  els["approval-kicker"].textContent = t("approval");
  els["reject-approval-button"].textContent = t("reject");
  els["approve-approval-button"].textContent = t("run");
  els["empty-state-text"].textContent = t("emptyState");
  els["history-label"].textContent = t("recentSessions");
  els["history-empty"].textContent = t("noHistory");
  els["prompt-input"].placeholder = t("promptPlaceholder");
  els["approval-mode-button"].setAttribute("aria-label", t("askFirst"));
  els["approval-mode-button"].title = t("askFirst");
  els["tools-button"].setAttribute("aria-label", t("tools"));
  els["tools-button"].title = t("tools");
  els["send-button"].setAttribute("aria-label", t("send"));
  els["send-button"].title = t("send");
  els["settings-close-button"].setAttribute("aria-label", t("close"));
  els["welcome-kicker"].textContent = t("welcome");
  els["welcome-title"].textContent = t("welcomeTitle");
  els["welcome-copy"].textContent = t("welcomeCopy");
  els["feature-read"].textContent = t("featureRead");
  els["feature-screenshot"].textContent = t("featureScreenshot");
  els["feature-actions"].textContent = t("featureActions");
  els["onboarding-next-button"].textContent = t("setUp");
  els["connect-kicker"].textContent = t("connection");
  els["connect-title"].textContent = t("connectionTitle");
  els["base-url-label"].textContent = t("baseUrl");
  els["endpoint-path-label"].textContent = t("endpointPath");
  els["api-key-label"].textContent = t("apiKey");
  els["models-label"].textContent = t("models");
  els["models-note"].textContent = t("modelsNote");
  els["language-label"].textContent = t("language");
  els["language-option-auto"].textContent = t("languageAuto");
  els["language-option-zh"].textContent = t("languageZh");
  els["language-option-en"].textContent = t("languageEn");
  els["action-mode-label"].textContent = t("actionMode");
  els["approval-option-ask"].textContent = t("askFirst");
  els["approval-option-auto"].textContent = t("autoRun");
  els["settings-include-context-label"].textContent = t("attachPage");
  els["advanced-summary"].textContent = t("advanced");
  els["system-prompt-label"].textContent = t("systemPrompt");
  els["onboarding-back-button"].textContent = t("back");

  if (!els["console-output"].dataset.state) {
    els["console-output"].textContent = t("ready");
  }
}

function hasConnectionConfig(settings) {
  return Boolean(settings.baseUrl && settings.apiKey && settings.models?.length);
}

function shouldShowOnboarding() {
  return !state.settings.onboardingComplete || !hasConnectionConfig(state.settings);
}

function openSettingsOverlay(mode, step) {
  state.overlayMode = mode;
  state.overlayStep = step;
  syncSettingsIntoUI();
  updateSettingsOverlay();
  els["settings-overlay"].classList.remove("hidden");
}

function closeSettingsOverlay() {
  els["settings-overlay"].classList.add("hidden");
}

function setOverlayStep(step) {
  state.overlayStep = step;
  updateSettingsOverlay();
}

function updateSettingsOverlay() {
  const onboarding = state.overlayMode === "onboarding";
  const step = onboarding ? state.overlayStep : 1;

  els["welcome-step"].classList.toggle("hidden", step !== 0);
  els["connect-step"].classList.toggle("hidden", step !== 1);
  els.stepDots.classList.toggle("hidden", !onboarding);

  for (const item of els.stepDotItems) {
    item.classList.toggle("active", Number(item.dataset.stepDot) === step);
  }

  els["onboarding-back-button"].classList.toggle("hidden", !onboarding);
  els["save-settings-button"].textContent = onboarding ? t("saveButtonStart") : t("saveButtonSave");
}

async function saveSettingsFromOverlay() {
  const parsedModels = els["models-input"].value
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);

  const nextSettings = {
    ...state.settings,
    baseUrl: els["base-url-input"].value.trim(),
    endpointPath: els["endpoint-path-input"].value.trim(),
    apiKey: els["api-key-input"].value.trim(),
    models: parsedModels,
    language: els["settings-language"].value,
    approvalMode: els["settings-approval-mode"].value,
    includeContextByDefault: els["settings-include-context"].checked,
    systemPrompt: els["system-prompt-input"].value.trim() || DEFAULT_SETTINGS.systemPrompt
  };

  if (!nextSettings.models.length) {
    setOverlayStep(1);
    showNotice(t("addModelNotice"), true);
    return;
  }

  nextSettings.activeModel = nextSettings.models.includes(state.settings.activeModel)
    ? state.settings.activeModel
    : nextSettings.models[0];

  if (!hasConnectionConfig(nextSettings)) {
    setOverlayStep(1);
    showNotice(t("missingConfigNotice"), true);
    return;
  }

  nextSettings.onboardingComplete = true;
  state.settings = nextSettings;
  state.locale = resolveLocale(nextSettings);
  await persistSettings();
  syncSettingsIntoUI();
  renderMessages();
  renderAttachments();
  renderPending();
  closeSettingsOverlay();
  showNotice(t("settingsSavedNotice"));
}

function toggleTools(show) {
  state.toolsOpen = show;
  if (show && state.historyOpen) {
    state.historyOpen = false;
    els["history-sheet"].classList.add("hidden");
  }
  els["tools-sheet"].classList.toggle("hidden", !show);
}

function toggleHistory(show) {
  state.historyOpen = show;
  if (show && state.toolsOpen) {
    state.toolsOpen = false;
    els["tools-sheet"].classList.add("hidden");
  }
  renderHistoryList();
  els["history-sheet"].classList.toggle("hidden", !show);
}

function refreshToolbarState() {
  const approvalLabel = state.settings.approvalMode === "ask" ? t("askFirst") : t("autoRun");
  els["approval-mode-text"].textContent = approvalLabel;
  els["approval-mode-button"].setAttribute("aria-label", approvalLabel);
  els["approval-mode-button"].title = approvalLabel;
}

function refreshModelOptions() {
  els["model-select"].innerHTML = "";

  for (const model of state.settings.models) {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    option.selected = model === state.settings.activeModel;
    els["model-select"].append(option);
  }
}

async function refreshTabMeta() {
  const response = await chrome.runtime.sendMessage({ type: "get-active-tab" });
  if (!response.ok) {
    showNotice(response.error || t("readTabFailed"), true);
    return;
  }

  state.tab = response.tab;
  els["tab-title"].textContent = response.tab.title || t("pageFallback");
  els["tab-url"].textContent = simplifyUrl(response.tab.url);
}

function simplifyUrl(url) {
  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch (_error) {
    return url;
  }
}

function renderHistoryList() {
  els["history-list"].innerHTML = "";
  els["history-empty"].classList.toggle("hidden", state.sessions.length > 0);

  if (!state.sessions.length) {
    return;
  }

  for (const session of state.sessions.slice(0, 12)) {
    const row = document.createElement("div");
    row.className = "history-row";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.classList.toggle("active", session.id === state.currentSessionId);

    const copy = document.createElement("span");
    copy.className = "history-item-copy";

    const title = document.createElement("strong");
    title.className = "history-item-title";
    title.textContent = session.title;

    const preview = document.createElement("span");
    preview.className = "history-item-preview";
    preview.textContent = session.preview || session.title;

    const time = document.createElement("span");
    time.className = "history-item-time";
    time.textContent = formatSessionTime(session.updatedAt);

    copy.append(title, preview);
    button.append(copy, time);
    button.addEventListener("click", () => {
      void restoreSession(session.id);
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "history-item-delete";
    removeButton.setAttribute("aria-label", t("deleteSession"));
    removeButton.title = t("deleteSession");
    removeButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9.5 9.5V16.25M14.5 9.5V16.25M5.75 6.75H18.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M8.75 6.75V5.75C8.75 5.19772 9.19772 4.75 9.75 4.75H14.25C14.8023 4.75 15.25 5.19772 15.25 5.75V6.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M7.25 6.75V17C7.25 18.2426 8.25736 19.25 9.5 19.25H14.5C15.7426 19.25 16.75 18.2426 16.75 17V6.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      void deleteSession(session.id);
    });

    row.append(button, removeButton);
    els["history-list"].append(row);
  }
}

function renderMessages() {
  els["messages"].innerHTML = "";
  els["empty-state"].classList.toggle("hidden", state.messages.length > 0);
  renderHistoryList();

  for (const message of state.messages) {
    const role = message.role === "local" ? "local" : message.role;
    const node = document.createElement("article");
    node.className = `message ${role}`;
    node.dataset.messageId = message.id;
    node.classList.toggle(
      "is-thinking",
      role === "assistant" && message.status === "thinking" && !extractPlainText(message.content).trim()
    );

    const avatar = buildMessageAvatar(role);
    const stack = document.createElement("div");
    stack.className = "message-stack";

    const body = document.createElement("div");
    body.className = "message-body";
    renderMessageContent(body, message);
    stack.append(body);

    if (role === "user") {
      const notes = [];
      if (message.contextIncluded) {
        notes.push(t("pageAttached"));
      }
      if (message.attachmentLabelKey) {
        notes.push(t(message.attachmentLabelKey));
      }

      if (notes.length) {
        const note = document.createElement("div");
        note.className = "message-meta-note";
        note.textContent = notes.join(" · ");
        stack.append(note);
      }
    }

    if (role === "user") {
      node.append(stack, avatar);
    } else {
      node.append(avatar, stack);
    }

    els["messages"].append(node);
  }

  scrollMessagesToBottom();
}

function scheduleRenderMessages() {
  if (state.renderQueued) {
    return;
  }

  state.renderQueued = true;
  requestAnimationFrame(() => {
    state.renderQueued = false;
    renderMessages();
  });
}

function scrollMessagesToBottom() {
  els["messages"].scrollTop = els["messages"].scrollHeight;
}

function patchMessageNode(message) {
  const node = els["messages"].querySelector(`[data-message-id="${message.id}"]`);
  if (!node) {
    renderMessages();
    return;
  }

  const role = message.role === "local" ? "local" : message.role;
  node.className = `message ${role}`;
  node.classList.toggle(
    "is-thinking",
    role === "assistant" && message.status === "thinking" && !extractPlainText(message.content).trim()
  );

  const body = node.querySelector(".message-body");
  if (!body) {
    renderMessages();
    return;
  }

  body.innerHTML = "";
  renderMessageContent(body, message);
  scrollMessagesToBottom();
}

function scheduleStreamPatch(message) {
  state.pendingStreamMessageId = message.id;
  if (state.streamPatchQueued) {
    return;
  }

  state.streamPatchQueued = true;
  requestAnimationFrame(() => {
    state.streamPatchQueued = false;
    const pendingMessage = state.messages.find((item) => item.id === state.pendingStreamMessageId);
    state.pendingStreamMessageId = "";

    if (pendingMessage) {
      patchMessageNode(pendingMessage);
    }
  });
}

async function startNewSession() {
  await persistSessionHistory();
  state.currentSessionId = createId("session");
  state.messages = [];
  state.attachment = null;
  state.pending = null;
  toggleTools(false);
  toggleHistory(false);
  renderMessages();
  renderAttachments();
  renderPending();
  saveSessionHistorySoon();
  els["prompt-input"].focus();
  showNotice(t("newSessionNotice"));
}

async function restoreSession(sessionId) {
  const target = state.sessions.find((session) => session.id === sessionId);
  if (!target) {
    return;
  }

  await persistSessionHistory();
  state.currentSessionId = target.id;
  state.messages = target.messages.map(normalizeMessage);
  state.attachment = null;
  state.pending = null;
  toggleTools(false);
  toggleHistory(false);
  renderMessages();
  renderAttachments();
  renderPending();
  els["prompt-input"].focus();
  saveSessionHistorySoon();
  showNotice(t("restoredSessionNotice"));
}

async function deleteSession(sessionId) {
  const currentSession = state.sessions.find((session) => session.id === state.currentSessionId);
  let nextSessions = state.sessions.filter((session) => session.id !== sessionId && session.id !== state.currentSessionId);

  if (state.messages.length > 0 && state.currentSessionId !== sessionId) {
    nextSessions.unshift(buildSessionRecord(state.messages, currentSession));
  }

  nextSessions.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
  state.sessions = nextSessions.slice(0, MAX_HISTORY_SESSIONS);

  if (state.currentSessionId === sessionId) {
    const nextSession = state.sessions[0] || null;
    state.currentSessionId = nextSession ? nextSession.id : createId("session");
    state.messages = nextSession ? nextSession.messages.map(normalizeMessage) : [];
    state.attachment = null;
    state.pending = null;
    renderMessages();
    renderAttachments();
    renderPending();
  } else {
    renderHistoryList();
  }

  if (!state.sessions.length) {
    toggleHistory(false);
  }

  await persistSessionSnapshot();
  showNotice(t("deletedSessionNotice"));
}

function renderMessageContent(container, message) {
  const shouldRenderMarkdown = message.role === "assistant" && message.status !== "streaming";
  container.classList.toggle("markdown-body", shouldRenderMarkdown);

  if (message.role === "assistant" && message.status === "thinking" && !extractPlainText(message.content).trim()) {
    const spinner = document.createElement("div");
    spinner.className = "message-spinner";
    spinner.setAttribute("aria-hidden", "true");
    container.append(spinner);
    return;
  }

  if (Array.isArray(message.content)) {
    if (message.role === "assistant") {
      const textParts = message.content
        .filter((part) => part.type === "text" && part.text)
        .map((part) => part.text);

      if (textParts.length) {
        renderMarkdown(container, textParts.join("\n\n"));
      }

      for (const part of message.content) {
        if (part.type !== "image_url") {
          continue;
        }

        const image = document.createElement("img");
        image.src = typeof part.image_url === "string" ? part.image_url : part.image_url.url;
        image.alt = "Attachment";
        container.append(image);
      }
      return;
    }

    for (const part of message.content) {
      if (part.type === "text") {
        appendParagraphs(container, part.text);
      }

      if (part.type === "image_url") {
        const image = document.createElement("img");
        image.src = typeof part.image_url === "string" ? part.image_url : part.image_url.url;
        image.alt = "Attachment";
        container.append(image);
      }
    }
    return;
  }

  if (message.role === "tool" || message.role === "local") {
    container.textContent =
      typeof message.content === "string" ? message.content : JSON.stringify(message.content, null, 2);
    return;
  }

  if (message.role === "assistant") {
    if (message.status === "streaming") {
      container.textContent =
        typeof message.content === "string" ? message.content : JSON.stringify(message.content, null, 2);
      return;
    }

    renderMarkdown(
      container,
      typeof message.content === "string" ? message.content : JSON.stringify(message.content, null, 2)
    );
    return;
  }

  appendParagraphs(
    container,
    typeof message.content === "string" ? message.content : JSON.stringify(message.content, null, 2)
  );
}

function appendParagraphs(container, text) {
  const normalized = String(text || "").replace(/\r/g, "");
  const blocks = normalized.split(/\n{2,}/).filter(Boolean);

  if (!blocks.length) {
    const paragraph = document.createElement("p");
    paragraph.textContent = "";
    container.append(paragraph);
    return;
  }

  for (const block of blocks) {
    const paragraph = document.createElement("p");
    paragraph.textContent = block;
    container.append(paragraph);
  }
}

function extractPlainText(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (part?.type === "text" ? part.text || "" : ""))
      .join("");
  }

  return content ? JSON.stringify(content) : "";
}

function renderMarkdown(container, text) {
  container.innerHTML = markdownToHtml(text);
}

function markdownToHtml(text) {
  const source = String(text || "").replace(/\r/g, "").trimEnd();
  if (!source) {
    return "<p></p>";
  }

  const lines = source.split("\n");
  const html = [];
  let paragraphLines = [];
  let listType = null;
  let listItems = [];
  let quoteLines = [];
  let codeFence = null;
  let codeLines = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }
    html.push(`<p>${renderInlineMarkdown(paragraphLines.join("\n"))}</p>`);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) {
      return;
    }
    const tag = listType === "ordered" ? "ol" : "ul";
    html.push(`<${tag}>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</${tag}>`);
    listType = null;
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) {
      return;
    }
    html.push(`<blockquote>${markdownToHtml(quoteLines.join("\n"))}</blockquote>`);
    quoteLines = [];
  };

  const flushCode = () => {
    if (codeFence === null) {
      return;
    }
    const className = codeFence ? ` class="language-${escapeHtml(codeFence)}"` : "";
    html.push(`<pre><code${className}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    codeFence = null;
    codeLines = [];
  };

  for (const line of lines) {
    const fenceMatch = line.match(/^```([\w-]+)?\s*$/);
    if (fenceMatch) {
      flushParagraph();
      flushList();
      flushQuote();

      if (codeFence === null) {
        codeFence = fenceMatch[1] || "";
      } else {
        flushCode();
      }
      continue;
    }

    if (codeFence !== null) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== "ordered") {
        flushList();
      }
      listType = "ordered";
      listItems.push(orderedMatch[1]);
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== "unordered") {
        flushList();
      }
      listType = "unordered";
      listItems.push(unorderedMatch[1]);
      continue;
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      html.push("<hr>");
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();
  flushCode();

  return html.join("");
}

function renderInlineMarkdown(text) {
  let content = escapeHtml(text);
  const tokens = [];

  const tokenFor = (html) => {
    const marker = `@@TOKEN_${tokens.length}@@`;
    tokens.push(html);
    return marker;
  };

  content = content.replace(/`([^`]+)`/g, (_match, code) => tokenFor(`<code>${code}</code>`));
  content = content.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, url) => {
    const safeUrl = sanitizeMarkdownUrl(url);
    if (!safeUrl) {
      return label;
    }
    return tokenFor(`<a href="${safeUrl}" target="_blank" rel="noreferrer">${label}</a>`);
  });
  content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  content = content.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  content = content.replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  content = content.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");
  content = content.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  content = content.replace(/\n/g, "<br>");

  return content.replace(/@@TOKEN_(\d+)@@/g, (_match, index) => tokens[Number(index)] || "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeMarkdownUrl(url) {
  const value = String(url || "").trim();
  if (!/^(https?:\/\/|mailto:)/i.test(value)) {
    return "";
  }
  return escapeHtml(value);
}

function renderAttachments() {
  els["attachments"].innerHTML = "";

  if (!state.attachment) {
    return;
  }

  const card = document.createElement("div");
  card.className = "attachment-card";

  const meta = document.createElement("div");
  meta.className = "attachment-meta";

  const title = document.createElement("strong");
  title.textContent = t(state.attachment.labelKey);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "secondary-button";
  remove.textContent = t("remove");
  remove.addEventListener("click", () => {
    state.attachment = null;
    renderAttachments();
  });

  meta.append(title, remove);

  const image = document.createElement("img");
  image.className = "attachment-preview";
  image.src = state.attachment.dataUrl;
  image.alt = t(state.attachment.labelKey);

  card.append(meta, image);
  els["attachments"].append(card);
}

function buildMessageAvatar(role) {
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.innerHTML = iconForRole(role);
  return avatar;
}

function iconForRole(role) {
  switch (role) {
    case "assistant":
      return `
        <svg viewBox="0 0 24 24" fill="none">
          <g fill="currentColor">
            <rect x="10.75" y="1" width="2.5" height="6.5" rx="1.25"></rect>
            <rect x="10.75" y="16.5" width="2.5" height="6.5" rx="1.25"></rect>
            <rect x="16.5" y="10.75" width="6.5" height="2.5" rx="1.25"></rect>
            <rect x="1" y="10.75" width="6.5" height="2.5" rx="1.25"></rect>
            <rect x="15.92" y="3.85" width="2.5" height="6.5" rx="1.25" transform="rotate(45 15.92 3.85)"></rect>
            <rect x="4.96" y="14.81" width="2.5" height="6.5" rx="1.25" transform="rotate(45 4.96 14.81)"></rect>
            <rect x="14.81" y="21.04" width="2.5" height="6.5" rx="1.25" transform="rotate(135 14.81 21.04)"></rect>
            <rect x="3.85" y="10.08" width="2.5" height="6.5" rx="1.25" transform="rotate(135 3.85 10.08)"></rect>
            <circle cx="12" cy="12" r="3.4"></circle>
          </g>
        </svg>
      `;
    case "tool":
      return `
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 7h16M7 12h10M9 17h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          <rect x="3" y="4" width="18" height="16" rx="4" stroke="currentColor" stroke-width="1.8"></rect>
        </svg>
      `;
    case "local":
      return `
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M6 8l4 4-4 4M13 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
          <rect x="3" y="4" width="18" height="16" rx="4" stroke="currentColor" stroke-width="1.8"></rect>
        </svg>
      `;
    case "user":
    default:
      return `
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8.5" r="3.25" stroke="currentColor" stroke-width="1.8"></circle>
          <path d="M6.5 18.5c1.2-2.35 3.14-3.52 5.5-3.52s4.3 1.17 5.5 3.52" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        </svg>
      `;
  }
}

function renderPending() {
  const hasPending = Boolean(state.pending);
  els["approval-panel"].classList.toggle("hidden", !hasPending);

  if (!hasPending) {
    return;
  }

  els["approval-title"].textContent = state.pending.toolCall.function.name;
  els["approval-detail"].textContent = state.pending.toolCall.function.arguments;
}

function showNotice(text, isError = false) {
  els["notice"].textContent = text;
  els["notice"].dataset.tone = isError ? "error" : "info";
  els["notice"].classList.remove("hidden");
  clearTimeout(showNotice.timer);
  showNotice.timer = setTimeout(() => {
    els["notice"].classList.add("hidden");
  }, 3200);
}

async function captureScreenshot(mode) {
  const response = await chrome.runtime.sendMessage({
    type: mode === "full" ? "capture-full-screenshot" : "capture-visible-screenshot"
  });

  if (!response.ok) {
    showNotice(response.error || t("captureFailed"), true);
    return;
  }

  state.attachment = {
    kind: "image",
    labelKey: mode === "full" ? "attachmentFull" : "attachmentVisible",
    dataUrl: response.dataUrl
  };
  renderAttachments();
  toggleTools(false);
  showNotice(t("screenshotAttached"));
}

async function loadConsoleLogs() {
  const response = await chrome.runtime.sendMessage({
    type: "read-console-logs",
    limit: 40
  });

  if (!response.ok) {
    showNotice(response.error || t("consoleReadFailed"), true);
    return;
  }

  const pretty = JSON.stringify(response.logs, null, 2);
  els["console-output"].textContent = pretty;
  appendMessage({
    role: "local",
    timestamp: new Date().toISOString(),
    content: `${t("localConsoleLogs")}\n${pretty}`
  });
}

async function runManualConsole() {
  const script = els["console-input"].value.trim();
  if (!script) {
    showNotice(t("writeJsNotice"), true);
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: "run-console-script",
    script
  });

  if (!response.ok) {
    els["console-output"].dataset.state = "result";
    els["console-output"].textContent = response.error || t("runFailed");
    showNotice(response.error || t("runFailed"), true);
    return;
  }

  const pretty = JSON.stringify(response.result, null, 2);
  els["console-output"].dataset.state = "result";
  els["console-output"].textContent = pretty;
  appendMessage({
    role: "local",
    timestamp: new Date().toISOString(),
    content: `${t("localConsoleResult")}\n${pretty}`
  });
}

async function sendPrompt() {
  if (state.isBusy || state.pending) {
    return;
  }

  const prompt = els["prompt-input"].value.trim();
  if (!prompt) {
    showNotice(t("writePromptNotice"), true);
    return;
  }

  if (!hasConnectionConfig(state.settings)) {
    openSettingsOverlay("onboarding", 1);
    showNotice(t("finishSetupNotice"), true);
    return;
  }

  setBusy(true);
  toggleTools(false);
  toggleHistory(false);

  try {
    const userMessage = await buildUserMessage(prompt, state.settings.includeContextByDefault, state.attachment);
    appendMessage({
      ...userMessage,
      timestamp: new Date().toISOString()
    });
    els["prompt-input"].value = "";
    autoResizePrompt();
    state.attachment = null;
    renderAttachments();

    await runConversation(8);
  } catch (error) {
    showNotice(error instanceof Error ? error.message : String(error), true);
  } finally {
    setBusy(false);
  }
}

async function buildUserMessage(prompt, includeContext, attachment) {
  let contextText = "";

  if (includeContext) {
    const response = await chrome.runtime.sendMessage({
      type: "get-tab-context",
      options: {
        maxChars: 10000,
        maxItems: 20
      }
    });

    if (response.ok) {
      contextText = formatContextForModel(response.context);
    }
  }

  if (!attachment) {
    return {
      role: "user",
      content: prompt,
      modelContent: [prompt, contextText ? `Current page summary:\n${contextText}` : ""].filter(Boolean).join("\n\n"),
      contextIncluded: Boolean(contextText)
    };
  }

  const content = [{ type: "text", text: prompt }];
  const modelContent = [{ type: "text", text: prompt }];
  if (contextText) {
    modelContent.push({ type: "text", text: `Current page summary:\n${contextText}` });
  }
  const imagePart = {
    type: "image_url",
    image_url: {
      url: attachment.dataUrl
    }
  };
  content.push(imagePart);
  modelContent.push(imagePart);

  return {
    role: "user",
    content,
    modelContent,
    contextIncluded: Boolean(contextText),
    attachmentLabelKey: attachment.labelKey
  };
}

function formatContextForModel(context) {
  return [
    `Title: ${context.title || ""}`,
    `URL: ${context.url || ""}`,
    `Visible headings: ${(context.headings || []).join(" | ") || "None"}`,
    `Clickable items: ${JSON.stringify(context.actions || [])}`,
    `Inputs: ${JSON.stringify(context.inputs || [])}`,
    `Selection: ${context.selection || "None"}`,
    `Visible text:\n${context.visibleText || ""}`
  ].join("\n");
}

async function runConversation(stepsLeft) {
  if (stepsLeft <= 0) {
    appendMessage({
      role: "assistant",
      timestamp: new Date().toISOString(),
      content: t("messagePaused")
    });
    return;
  }

  const assistantMessage = appendMessage(
    {
      role: "assistant",
      content: "",
      tool_calls: [],
      timestamp: new Date().toISOString(),
      status: "thinking"
    },
    { persist: false }
  );

  let streamedMessage;
  try {
    streamedMessage = await callAssistantModel(assistantMessage);
  } catch (error) {
    state.messages = state.messages.filter((message) => message !== assistantMessage);
    renderMessages();
    throw error;
  }

  assistantMessage.content = streamedMessage.content;
  assistantMessage.tool_calls = streamedMessage.tool_calls;
  assistantMessage.status = "done";
  renderMessages();
  saveSessionHistorySoon();

  if (!assistantMessage.tool_calls?.length) {
    return;
  }

  const continuationSteps = stepsLeft - 1;
  const toolStatus = await handleToolCalls(assistantMessage.tool_calls, 0, continuationSteps);
  if (toolStatus === "paused") {
    return;
  }

  await runConversation(continuationSteps);
}

async function handleToolCalls(toolCalls, startIndex, continuationSteps) {
  for (let index = startIndex; index < toolCalls.length; index += 1) {
    const toolCall = toolCalls[index];

    if (needsApproval(toolCall) && state.settings.approvalMode === "ask") {
      state.pending = {
        toolCalls,
        index,
        continuationSteps,
        toolCall
      };
      renderPending();
      showNotice(t("waitingApprovalNotice"));
      return "paused";
    }

    const result = await executeToolCall(toolCall);
    appendMessage({
      role: "tool",
      tool_call_id: toolCall.id,
      timestamp: new Date().toISOString(),
      content: JSON.stringify(result, null, 2)
    });
  }

  return "done";
}

function needsApproval(toolCall) {
  return MUTATING_TOOLS.has(toolCall.function.name);
}

async function approvePendingAction() {
  if (!state.pending) {
    return;
  }

  setBusy(true);

  try {
    const { toolCalls, index, continuationSteps, toolCall } = state.pending;
    state.pending = null;
    renderPending();

    const result = await executeToolCall(toolCall);
    appendMessage({
      role: "tool",
      tool_call_id: toolCall.id,
      timestamp: new Date().toISOString(),
      content: JSON.stringify(result, null, 2)
    });

    const status = await handleToolCalls(toolCalls, index + 1, continuationSteps);
    if (status !== "paused") {
      await runConversation(continuationSteps);
    }
  } catch (error) {
    showNotice(error instanceof Error ? error.message : String(error), true);
  } finally {
    setBusy(false);
  }
}

async function rejectPendingAction() {
  if (!state.pending) {
    return;
  }

  setBusy(true);

  try {
    const { toolCalls, index, continuationSteps, toolCall } = state.pending;
    state.pending = null;
    renderPending();

    appendMessage({
      role: "tool",
      tool_call_id: toolCall.id,
      timestamp: new Date().toISOString(),
      content: JSON.stringify(
        {
          ok: false,
          rejected: true,
          reason: "User rejected this action."
        },
        null,
        2
      )
    });

    const status = await handleToolCalls(toolCalls, index + 1, continuationSteps);
    if (status !== "paused") {
      await runConversation(continuationSteps);
    }
  } catch (error) {
    showNotice(error instanceof Error ? error.message : String(error), true);
  } finally {
    setBusy(false);
  }
}

async function executeToolCall(toolCall) {
  const name = toolCall.function.name;
  const args = safeParseJson(toolCall.function.arguments);

  switch (name) {
    case "list_tabs": {
      return unwrap(
        await chrome.runtime.sendMessage({
          type: "list-tabs",
          limit: typeof args.limit === "number" ? args.limit : 20
        })
      );
    }
    case "create_tab": {
      const response = await chrome.runtime.sendMessage({
        type: "create-tab",
        url: args.url,
        active: args.active !== false
      });
      await refreshTabMeta();
      return unwrap(response);
    }
    case "switch_tab": {
      const response = await chrome.runtime.sendMessage({
        type: "switch-tab",
        tabId: args.tabId
      });
      await refreshTabMeta();
      return unwrap(response);
    }
    case "close_tab": {
      const response = await chrome.runtime.sendMessage({
        type: "close-tab",
        tabId: args.tabId
      });
      await refreshTabMeta();
      return unwrap(response);
    }
    case "get_tab_context": {
      return unwrap(
        await chrome.runtime.sendMessage({
          type: "get-tab-context",
          options: args
        })
      );
    }
    case "read_console_logs": {
      return unwrap(
        await chrome.runtime.sendMessage({
          type: "read-console-logs",
          limit: args.limit || 40
        })
      );
    }
    case "run_console_script": {
      return unwrap(
        await chrome.runtime.sendMessage({
          type: "run-console-script",
          script: args.script
        })
      );
    }
    case "click_element": {
      return unwrap(
        await chrome.runtime.sendMessage({
          type: "click-element",
          selector: args.selector
        })
      );
    }
    case "type_into_element": {
      return unwrap(
        await chrome.runtime.sendMessage({
          type: "type-into-element",
          selector: args.selector,
          text: args.text,
          clear: args.clear !== false,
          submit: Boolean(args.submit)
        })
      );
    }
    case "scroll_page": {
      return unwrap(
        await chrome.runtime.sendMessage({
          type: "scroll-page",
          direction: args.direction || "down",
          amount: typeof args.amount === "number" ? args.amount : 0.85
        })
      );
    }
    case "navigate_current_tab": {
      const response = await chrome.runtime.sendMessage({
        type: "navigate-current-tab",
        url: args.url
      });
      await refreshTabMeta();
      return unwrap(response);
    }
    case "wait_for_selector": {
      return unwrap(
        await chrome.runtime.sendMessage({
          type: "wait-for-selector",
          selector: args.selector,
          timeoutMs: args.timeoutMs || 5000
        })
      );
    }
    default:
      return {
        ok: false,
        error: `Unsupported tool: ${name}`
      };
  }
}

function unwrap(response) {
  if (!response.ok) {
    return {
      ok: false,
      error: response.error || "Unknown tool error."
    };
  }

  const payload = { ...response };
  delete payload.ok;
  return payload;
}

function safeParseJson(value) {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return {};
  }
}

async function callModel() {
  return callModelJson();
}

async function callAssistantModel(targetMessage) {
  try {
    return await callModelStream(targetMessage);
  } catch (error) {
    if (!error?.streamUnsupported) {
      throw error;
    }

    const response = await callModelJson();
    return normalizeAssistantMessage(response);
  }
}

async function callModelJson() {
  const response = await fetch(buildApiUrl(state.settings.baseUrl, state.settings.endpointPath), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.settings.apiKey}`
    },
    body: JSON.stringify(buildModelPayload())
  });

  if (!response.ok) {
    throw new Error(
      state.locale === "zh"
        ? `模型请求失败：${response.status} ${await response.text()}`
        : `Model request failed: ${response.status} ${await response.text()}`
    );
  }

  return response.json();
}

async function callModelStream(targetMessage) {
  const response = await fetch(buildApiUrl(state.settings.baseUrl, state.settings.endpointPath), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.settings.apiKey}`
    },
    body: JSON.stringify({
      ...buildModelPayload(),
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(
      state.locale === "zh"
        ? `模型请求失败：${response.status} ${await response.text()}`
        : `Model request failed: ${response.status} ${await response.text()}`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!response.body || !contentType.includes("text/event-stream")) {
    const error = new Error("Streaming unsupported");
    error.streamUnsupported = true;
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const accumulated = {
    role: "assistant",
    content: "",
    tool_calls: []
  };

  let buffer = "";
  let eventCount = 0;

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || !line.startsWith("data:")) {
        continue;
      }

      const payload = line.slice(5).trim();
      if (!payload) {
        continue;
      }

      if (payload === "[DONE]") {
        continue;
      }

      const chunk = JSON.parse(payload);
      applyStreamChunk(accumulated, chunk);
      eventCount += 1;
      targetMessage.content = accumulated.content;
      targetMessage.tool_calls = accumulated.tool_calls.map(cloneToolCall);
      if (extractPlainText(targetMessage.content).trim()) {
        targetMessage.status = "streaming";
      }
      scheduleStreamPatch(targetMessage);
    }

    if (done) {
      break;
    }
  }

  if (!eventCount) {
    const error = new Error("Streaming unsupported");
    error.streamUnsupported = true;
    throw error;
  }

  return normalizeAssistantMessage({
    choices: [
      {
        message: accumulated
      }
    ]
  });
}

function buildModelPayload() {
  return {
    model: state.settings.activeModel,
    messages: [
      {
        role: "system",
        content: state.settings.systemPrompt || DEFAULT_SETTINGS.systemPrompt
      },
      ...state.messages.filter((message) => message.status !== "thinking").map(stripClientOnlyFields)
    ],
    tools: TOOL_SCHEMAS,
    tool_choice: "auto",
    temperature: 0.2
  };
}

function applyStreamChunk(accumulated, chunk) {
  const delta = chunk?.choices?.[0]?.delta;
  if (!delta) {
    return;
  }

  if (typeof delta.content === "string") {
    accumulated.content += delta.content;
  }

  if (Array.isArray(delta.tool_calls)) {
    for (const item of delta.tool_calls) {
      const index = typeof item.index === "number" ? item.index : accumulated.tool_calls.length;
      const existing =
        accumulated.tool_calls[index] ||
        {
          id: item.id || `tool_${index}`,
          type: item.type || "function",
          function: {
            name: "",
            arguments: ""
          }
        };

      if (item.id) {
        existing.id = item.id;
      }
      if (item.type) {
        existing.type = item.type;
      }
      if (item.function?.name) {
        existing.function.name += item.function.name;
      }
      if (item.function?.arguments) {
        existing.function.arguments += item.function.arguments;
      }

      accumulated.tool_calls[index] = existing;
    }
  }
}

function cloneToolCall(toolCall) {
  return {
    id: toolCall.id,
    type: toolCall.type,
    function: {
      name: toolCall.function.name,
      arguments: toolCall.function.arguments
    }
  };
}

function stripClientOnlyFields(message) {
  if (message.role === "local") {
    return {
      role: "user",
      content: `本地工具快照，仅作为上下文参考：\n${message.content}`
    };
  }

  const { timestamp, modelContent, contextIncluded, attachmentLabelKey, ...rest } = message;
  if (typeof modelContent !== "undefined") {
    rest.content = modelContent;
  }
  return rest;
}

function normalizeAssistantMessage(response) {
  const message = response?.choices?.[0]?.message;
  if (!message) {
    throw new Error(t("modelNoMessage"));
  }

  if (Array.isArray(message.content)) {
    return {
      role: "assistant",
      content: message.content,
      tool_calls: message.tool_calls || []
    };
  }

  return {
    role: "assistant",
    content:
      message.content ||
      (message.tool_calls?.length
        ? state.locale === "zh"
          ? `准备调用工具：${message.tool_calls.map((call) => call.function.name).join(", ")}`
          : `Preparing tools: ${message.tool_calls.map((call) => call.function.name).join(", ")}`
        : ""),
    tool_calls: message.tool_calls || []
  };
}

function buildApiUrl(baseUrl, endpointPath) {
  if (!endpointPath) {
    return baseUrl;
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(endpointPath.replace(/^\//, ""), normalizedBase).toString();
}

function autoResizePrompt() {
  const input = els["prompt-input"];
  input.style.height = "0px";
  input.style.height = `${Math.min(Math.max(input.scrollHeight, 22), 96)}px`;
}

function setBusy(isBusy) {
  state.isBusy = isBusy;
  els["send-button"].disabled = isBusy;
  els["capture-visible-button"].disabled = isBusy;
  els["capture-full-button"].disabled = isBusy;
  els["console-logs-button"].disabled = isBusy;
  els["run-console-button"].disabled = isBusy;
}
