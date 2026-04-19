const DEBUGGER_VERSION = "1.3";
const MAX_CONSOLE_ENTRIES = 120;
const activeDebuggerTabs = new Set();
const consoleBuffers = new Map();

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (error) {
    console.warn("Unable to enable side panel action click behavior:", error);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  activeDebuggerTabs.delete(tabId);
  consoleBuffers.delete(tabId);
});

chrome.debugger.onDetach.addListener((source, reason) => {
  if (!source.tabId) {
    return;
  }

  activeDebuggerTabs.delete(source.tabId);
  pushConsoleEntry(source.tabId, {
    level: "info",
    type: "system",
    text: `Debugger detached: ${reason}`,
    timestamp: new Date().toISOString()
  });
});

chrome.debugger.onEvent.addListener((source, method, params) => {
  const tabId = source.tabId;
  if (!tabId) {
    return;
  }

  if (method === "Runtime.consoleAPICalled") {
    const args = Array.isArray(params?.args) ? params.args.map(formatRemoteObject) : [];
    pushConsoleEntry(tabId, {
      level: params?.type || "log",
      type: "runtime",
      text: args.join(" "),
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (method === "Log.entryAdded") {
    const entry = params?.entry;
    if (!entry) {
      return;
    }

    pushConsoleEntry(tabId, {
      level: entry.level || "info",
      type: "log",
      text: `${entry.source || "browser"}: ${entry.text || ""}`.trim(),
      timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : new Date().toISOString()
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      })
    );

  return true;
});

async function handleMessage(message) {
  switch (message?.type) {
    case "get-active-tab":
      return { tab: await getActiveTab() };
    case "list-tabs":
      return { tabs: await listTabs(typeof message.limit === "number" ? message.limit : 20) };
    case "create-tab":
      return {
        result: await createTab(message.url, message.active !== false)
      };
    case "switch-tab":
      return {
        result: await switchTab(message.tabId)
      };
    case "close-tab":
      return {
        result: await closeTab(message.tabId)
      };
    case "get-tab-context":
      return { context: await getTabContext(message.options || {}) };
    case "capture-visible-screenshot":
      return { dataUrl: await captureVisibleScreenshot() };
    case "capture-full-screenshot":
      return { dataUrl: await captureFullScreenshot() };
    case "run-console-script":
      return { result: await runConsoleScript(message.script) };
    case "read-console-logs":
      return { logs: await readConsoleLogs(message.limit || 40) };
    case "click-element":
      return { result: await clickElement(message.selector) };
    case "type-into-element":
      return {
        result: await typeIntoElement(
          message.selector,
          message.text,
          Boolean(message.clear),
          Boolean(message.submit)
        )
      };
    case "scroll-page":
      return {
        result: await scrollPage(
          message.direction || "down",
          typeof message.amount === "number" ? message.amount : 0.85
        )
      };
    case "navigate-current-tab":
      return { result: await navigateCurrentTab(message.url) };
    case "wait-for-selector":
      return {
        result: await waitForSelector(
          message.selector,
          typeof message.timeoutMs === "number" ? message.timeoutMs : 5000
        )
      };
    default:
      throw new Error(`Unsupported message type: ${message?.type || "unknown"}`);
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || typeof tab.id !== "number") {
    throw new Error("No active tab found.");
  }

  return {
    id: tab.id,
    title: tab.title || "Untitled tab",
    url: tab.url || "",
    windowId: tab.windowId
  };
}

async function listTabs(limit) {
  const activeTab = await getActiveTab();
  const tabs = await chrome.tabs.query({ windowId: activeTab.windowId });
  const normalizedLimit = Math.max(1, Number(limit) || 20);

  return tabs.slice(0, normalizedLimit).map((tab) => ({
    id: tab.id,
    index: tab.index,
    active: Boolean(tab.active),
    pinned: Boolean(tab.pinned),
    title: tab.title || "Untitled tab",
    url: tab.url || ""
  }));
}

async function createTab(url, active) {
  const currentTab = await getActiveTab();
  const createProperties = {
    windowId: currentTab.windowId,
    active: Boolean(active)
  };

  if (url && String(url).trim()) {
    createProperties.url = String(url).trim();
  }

  const tab = await chrome.tabs.create(createProperties);
  return {
    tabId: tab.id,
    active: Boolean(tab.active),
    title: tab.title || "Untitled tab",
    url: tab.url || ""
  };
}

async function switchTab(tabId) {
  const targetId = Number(tabId);
  if (!Number.isFinite(targetId)) {
    throw new Error("A valid tab id is required.");
  }

  const currentTab = await getActiveTab();
  const targetTab = await chrome.tabs.get(targetId);
  if (targetTab.windowId !== currentTab.windowId) {
    throw new Error("Only tabs in the current browser window can be switched here.");
  }

  const updated = await chrome.tabs.update(targetId, { active: true });
  return {
    tabId: updated.id,
    active: Boolean(updated.active),
    title: updated.title || "Untitled tab",
    url: updated.url || ""
  };
}

async function closeTab(tabId) {
  const currentTab = await getActiveTab();
  const targetId = Number.isFinite(Number(tabId)) ? Number(tabId) : currentTab.id;
  const targetTab = await chrome.tabs.get(targetId);
  if (targetTab.windowId !== currentTab.windowId) {
    throw new Error("Only tabs in the current browser window can be closed here.");
  }

  const summary = {
    tabId: targetTab.id,
    title: targetTab.title || "Untitled tab",
    url: targetTab.url || ""
  };

  await chrome.tabs.remove(targetId);
  return {
    closed: true,
    ...summary
  };
}

async function getTabContext(options) {
  const tab = await getActiveTab();
  ensureInspectableUrl(tab.url);

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: collectPageContext,
    args: [options]
  });

  if (!injection || !injection.result) {
    throw new Error("Failed to read the current page.");
  }

  return injection.result;
}

async function captureVisibleScreenshot() {
  const tab = await getActiveTab();
  return chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
}

async function captureFullScreenshot() {
  const tab = await getActiveTab();
  ensureInspectableUrl(tab.url);
  await ensureDebugger(tab.id);

  const metrics = await chrome.debugger.sendCommand({ tabId: tab.id }, "Page.getLayoutMetrics");
  const contentSize = metrics.cssContentSize || metrics.contentSize;
  const width = Math.max(1, Math.ceil(contentSize?.width || 1280));
  const height = Math.max(1, Math.ceil(contentSize?.height || 720));
  const scale = Math.min(1, 15000 / Math.max(width, height));

  const screenshot = await chrome.debugger.sendCommand({ tabId: tab.id }, "Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
    clip: {
      x: 0,
      y: 0,
      width,
      height,
      scale
    }
  });

  return `data:image/png;base64,${screenshot.data}`;
}

async function runConsoleScript(script) {
  if (!script || !script.trim()) {
    throw new Error("Console script cannot be empty.");
  }

  const tab = await getActiveTab();
  ensureInspectableUrl(tab.url);
  await ensureDebugger(tab.id);

  const evaluation = await chrome.debugger.sendCommand({ tabId: tab.id }, "Runtime.evaluate", {
    expression: script,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
    includeCommandLineAPI: true
  });

  if (evaluation?.exceptionDetails) {
    const description =
      evaluation.exceptionDetails.exception?.description ||
      evaluation.exceptionDetails.text ||
      "Unknown script execution error.";
    throw new Error(description);
  }

  return {
    value:
      evaluation?.result?.value !== undefined
        ? evaluation.result.value
        : evaluation?.result?.description || null,
    type: evaluation?.result?.type || typeof evaluation?.result?.value
  };
}

async function readConsoleLogs(limit) {
  const tab = await getActiveTab();
  ensureInspectableUrl(tab.url);
  await ensureDebugger(tab.id);

  const logs = consoleBuffers.get(tab.id) || [];
  return logs.slice(-Math.max(1, limit));
}

async function clickElement(selector) {
  if (!selector || !selector.trim()) {
    throw new Error("A CSS selector is required.");
  }

  await showAgentCursor({ selector });
  return executeDomAction(clickElementInPage, [selector]);
}

async function typeIntoElement(selector, text, clear, submit) {
  if (!selector || !selector.trim()) {
    throw new Error("A CSS selector is required.");
  }

  await showAgentCursor({ selector });
  return executeDomAction(typeIntoElementInPage, [selector, String(text ?? ""), clear, submit]);
}

async function scrollPage(direction, amount) {
  await showAgentCursor({ viewportDirection: direction });
  return executeDomAction(scrollPageInPage, [direction, amount]);
}

async function navigateCurrentTab(url) {
  if (!url || !url.trim()) {
    throw new Error("A target URL is required.");
  }

  const tab = await getActiveTab();
  const updated = await chrome.tabs.update(tab.id, { url });
  return {
    tabId: updated.id,
    url: updated.url,
    title: updated.title
  };
}

async function waitForSelector(selector, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result = await executeDomAction(checkSelectorInPage, [selector]);
    if (result?.found) {
      return result;
    }
    await delay(250);
  }

  return {
    found: false,
    selector,
    waitedMs: timeoutMs
  };
}

async function executeDomAction(pageFunction, args) {
  const tab = await getActiveTab();
  ensureInspectableUrl(tab.url);

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: pageFunction,
    args
  });

  if (!injection) {
    throw new Error("The page did not return a result.");
  }

  return injection.result;
}

async function showAgentCursor(options) {
  const tab = await getActiveTab();
  ensureInspectableUrl(tab.url);

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: renderAgentCursor,
    args: [options]
  });

  await delay(190);
}

async function ensureDebugger(tabId) {
  if (activeDebuggerTabs.has(tabId)) {
    return;
  }

  try {
    await chrome.debugger.attach({ tabId }, DEBUGGER_VERSION);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Another debugger is already attached")) {
      throw new Error("Chrome DevTools is already attached to this tab. Close DevTools and try again.");
    }
    throw error;
  }

  await chrome.debugger.sendCommand({ tabId }, "Runtime.enable");
  await chrome.debugger.sendCommand({ tabId }, "Log.enable");
  try {
    await chrome.debugger.sendCommand({ tabId }, "Console.enable");
  } catch (_error) {
    // Some Chrome builds do not expose Console.enable through the extension bridge.
  }
  await chrome.debugger.sendCommand({ tabId }, "Page.enable");

  activeDebuggerTabs.add(tabId);
  pushConsoleEntry(tabId, {
    level: "info",
    type: "system",
    text: "Debugger attached for console and screenshot access.",
    timestamp: new Date().toISOString()
  });
}

function ensureInspectableUrl(url) {
  if (!url) {
    throw new Error("The current tab does not expose a URL.");
  }

  if (
    url.startsWith("chrome://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("chrome-extension://")
  ) {
    throw new Error("Chrome internal pages can be captured, but they cannot be inspected or controlled.");
  }
}

function pushConsoleEntry(tabId, entry) {
  const current = consoleBuffers.get(tabId) || [];
  current.push(entry);
  if (current.length > MAX_CONSOLE_ENTRIES) {
    current.splice(0, current.length - MAX_CONSOLE_ENTRIES);
  }
  consoleBuffers.set(tabId, current);
}

function formatRemoteObject(remoteObject) {
  if (!remoteObject) {
    return "undefined";
  }

  if (remoteObject.value !== undefined) {
    try {
      return typeof remoteObject.value === "string"
        ? remoteObject.value
        : JSON.stringify(remoteObject.value);
    } catch (_error) {
      return String(remoteObject.value);
    }
  }

  return remoteObject.description || remoteObject.type || "unknown";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function collectPageContext(options = {}) {
  const maxChars = Number(options.maxChars) > 0 ? Number(options.maxChars) : 12000;
  const maxItems = Number(options.maxItems) > 0 ? Number(options.maxItems) : 25;

  const isVisible = (element) => {
    if (!(element instanceof Element)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0
    ) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const textOf = (value) => (value || "").replace(/\s+/g, " ").trim();
  const summarizeElement = (element) => ({
    tag: element.tagName.toLowerCase(),
    id: element.id || "",
    selector: buildSelector(element),
    text: textOf(element.innerText || element.textContent || "").slice(0, 160),
    ariaLabel: element.getAttribute("aria-label") || "",
    href: "href" in element ? element.href || "" : "",
    type: element.getAttribute("type") || "",
    name: element.getAttribute("name") || "",
    placeholder: element.getAttribute("placeholder") || ""
  });

  const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
    .filter(isVisible)
    .slice(0, maxItems)
    .map((element) => textOf(element.textContent))
    .filter(Boolean);

  const actions = Array.from(
    document.querySelectorAll("button, a, [role='button'], input[type='button'], input[type='submit']")
  )
    .filter(isVisible)
    .slice(0, maxItems)
    .map(summarizeElement);

  const inputs = Array.from(
    document.querySelectorAll("input, textarea, select, [contenteditable='true']")
  )
    .filter(isVisible)
    .slice(0, maxItems)
    .map(summarizeElement);

  const visibleText = textOf(document.body?.innerText || "").slice(0, maxChars);
  const selection = textOf(window.getSelection?.()?.toString() || "");

  return {
    title: document.title,
    url: location.href,
    lang: document.documentElement.lang || "",
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    },
    selection,
    headings,
    actions,
    inputs,
    visibleText
  };

  function buildSelector(element) {
    if (!(element instanceof Element)) {
      return "";
    }

    if (element.id) {
      return `#${CSS.escape(element.id)}`;
    }

    const parts = [];
    let current = element;
    let depth = 0;

    while (current && current.nodeType === Node.ELEMENT_NODE && depth < 4) {
      let part = current.tagName.toLowerCase();
      if (current.classList.length) {
        part += `.${Array.from(current.classList).slice(0, 2).map((name) => CSS.escape(name)).join(".")}`;
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (child) => child.tagName === current.tagName
        );
        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
      }

      parts.unshift(part);
      current = current.parentElement;
      depth += 1;
    }

    return parts.join(" > ");
  }
}

function clickElementInPage(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    return { success: false, error: `Element not found for selector: ${selector}` };
  }

  element.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
  element.focus?.({ preventScroll: true });
  element.click();

  return {
    success: true,
    selector,
    text: (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 160),
    tag: element.tagName.toLowerCase()
  };
}

function typeIntoElementInPage(selector, text, clear, submit) {
  const element = document.querySelector(selector);
  if (!element) {
    return { success: false, error: `Element not found for selector: ${selector}` };
  }

  element.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
  element.focus?.({ preventScroll: true });

  const target = element;
  const currentValue =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
      ? target.value || ""
      : target.isContentEditable
        ? target.textContent || ""
        : "";
  const nextValue = clear ? text : `${currentValue}${text}`;

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    const prototype = target instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    descriptor?.set?.call(target, nextValue);
  } else if (target instanceof HTMLSelectElement) {
    target.value = nextValue;
  } else if (target.isContentEditable) {
    target.textContent = nextValue;
  } else {
    return {
      success: false,
      error: `Element matched by ${selector} does not support text input.`
    };
  }

  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));

  if (submit) {
    target.form?.requestSubmit?.();
    target.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    target.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
  }

  return {
    success: true,
    selector,
    submitted: submit,
    valuePreview: nextValue.slice(0, 160)
  };
}

function scrollPageInPage(direction, amount) {
  const delta = amount <= 1 ? window.innerHeight * amount : amount;
  const top = direction === "up" ? -Math.abs(delta) : Math.abs(delta);
  window.scrollBy({ top, behavior: "auto" });

  return {
    success: true,
    direction,
    amount: delta,
    scrollY: window.scrollY
  };
}

function checkSelectorInPage(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    return { found: false, selector };
  }

  const rect = element.getBoundingClientRect();
  return {
    found: rect.width > 0 && rect.height > 0,
    selector,
    tag: element.tagName.toLowerCase(),
    text: (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 160)
  };
}

function renderAgentCursor(options = {}) {
  const styleId = "__gpt_in_chrome_cursor_style__";
  const rootId = "__gpt_in_chrome_cursor_root__";

  ensureStyles();

  const existing = document.getElementById(rootId);
  if (existing) {
    existing.remove();
  }

  const root = document.createElement("div");
  root.id = rootId;
  root.style.position = "fixed";
  root.style.left = "0";
  root.style.top = "0";
  root.style.pointerEvents = "none";
  root.style.zIndex = "2147483647";

  const cursor = document.createElement("div");
  cursor.className = "__gpt-cursor";
  cursor.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.5L16.7 10.6L10.9 11.9L14.7 20.1L12.3 21.2L8.5 13L4 17.2Z"></path></svg>';

  const label = document.createElement("div");
  label.className = "__gpt-cursor-label";
  label.textContent = "GPT";

  const ring = document.createElement("div");
  ring.className = "__gpt-cursor-ring";

  root.append(cursor, label, ring);
  document.documentElement.append(root);

  if (options.selector) {
    const element = document.querySelector(options.selector);
    if (!element) {
      root.remove();
      return;
    }

    element.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
    const rect = element.getBoundingClientRect();
    const x = clamp(rect.left + Math.min(Math.max(rect.width * 0.28, 16), 44), 28, window.innerWidth - 28);
    const y = clamp(rect.top + Math.min(Math.max(rect.height * 0.24, 14), 34), 34, window.innerHeight - 36);

    root.style.left = `${x}px`;
    root.style.top = `${y}px`;
    ring.style.display = "block";
    ring.style.left = `${clamp(rect.left - 6, 4, window.innerWidth - 12)}px`;
    ring.style.top = `${clamp(rect.top - 6, 4, window.innerHeight - 12)}px`;
    ring.style.width = `${Math.max(Math.min(rect.width + 12, window.innerWidth - 8), 28)}px`;
    ring.style.height = `${Math.max(Math.min(rect.height + 12, window.innerHeight - 8), 28)}px`;
  } else {
    const x = window.innerWidth - 76;
    const y =
      options.viewportDirection === "up"
        ? Math.max(84, window.innerHeight * 0.28)
        : Math.min(window.innerHeight - 84, window.innerHeight * 0.72);
    root.style.left = `${x}px`;
    root.style.top = `${y}px`;
    ring.style.display = "none";
  }

  window.setTimeout(() => {
    root.remove();
  }, 1400);

  function ensureStyles() {
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      #${rootId} .__gpt-cursor {
        position: absolute;
        left: -8px;
        top: -12px;
        width: 28px;
        height: 28px;
        filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.24));
        animation: __gpt-cursor-pop 220ms ease-out;
      }
      #${rootId} .__gpt-cursor svg {
        display: block;
        width: 100%;
        height: 100%;
        fill: rgba(255, 255, 255, 0.98);
        stroke: rgba(17, 17, 17, 0.95);
        stroke-width: 1.2;
        stroke-linejoin: round;
      }
      #${rootId} .__gpt-cursor-label {
        position: absolute;
        left: 16px;
        top: -18px;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(17, 17, 17, 0.94);
        color: #fff;
        font: 600 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: 0;
        white-space: nowrap;
        animation: __gpt-cursor-pop 220ms ease-out;
      }
      #${rootId} .__gpt-cursor-ring {
        position: fixed;
        display: none;
        border-radius: 14px;
        border: 2px solid rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 0 0 1px rgba(17, 17, 17, 0.35) inset;
        animation: __gpt-cursor-ring 1.2s ease-out forwards;
      }
      @keyframes __gpt-cursor-pop {
        from {
          opacity: 0;
          transform: translate3d(-8px, -8px, 0) scale(0.8);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }
      @keyframes __gpt-cursor-ring {
        from {
          opacity: 0;
          transform: scale(0.96);
        }
        18% {
          opacity: 1;
        }
        to {
          opacity: 0;
          transform: scale(1.02);
        }
      }
    `;
    document.documentElement.append(style);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}
