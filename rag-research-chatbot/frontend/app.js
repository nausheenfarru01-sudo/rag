"use strict";

/* ResearchMind front end: plain JavaScript, no build step. Served by FastAPI at "/". */

const API = location.protocol === "file:" ? "http://127.0.0.1:8000" : "";
const STORAGE_KEY = "researchmind.v1";
const ACCENTS = ["#7c5cff", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];

/* ---------- Icons (24×24 stroke paths) ---------- */
const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  keyboard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M10 13h4M7 16h10"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5H3v8h4c0 3-1 5-4 5zM14 21c3 0 7-1 7-8V5h-7v8h4c0 3-1 5-4 5z"/>',
  paperclip: '<path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  trash: '<path d="M3 6h18M8 6V4a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 4v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  spark: '<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/>',
  bot: '<path d="M5 4h9a5 5 0 0 1 0 10H9l-4 5V4z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  flask: '<path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M7 15h10"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
};
const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] ?? ""}</svg>`;
const hydrateIcons = (root = document) => root.querySelectorAll("i[data-icon]").forEach((el) => el.outerHTML = icon(el.dataset.icon));

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const fmtSize = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);

function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

async function api(path, options = {}) {
  const res = await fetch(API + path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return data;
}

/* Minimal, safe Markdown: text is escaped first, then a small set of patterns is formatted. */
function renderMarkdown(src, sourceCount = 0) {
  const blocks = [];
  let text = esc(src.replace(/\r/g, "")).replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    blocks.push(`<pre><code>${code.replace(/\n$/, "")}</code></pre>`);
    return `\u0000${blocks.length - 1}\u0000`;
  });

  const inline = (s) =>
    s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/\[(\d{1,2})\]/g, (m, n) => (Number(n) >= 1 && Number(n) <= sourceCount ? `<button class="cite" data-cite="${n}" title="Show source ${n}">${n}</button>` : m));

  const out = [];
  let list = null;
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    let m;
    if (/^\u0000\d+\u0000$/.test(line.trim())) {
      closeList();
      out.push(blocks[Number(line.trim().slice(1, -1))]);
    } else if ((m = line.match(/^\s*[-*•]\s+(.*)/))) {
      if (list !== "ul") { closeList(); out.push("<ul>"); list = "ul"; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) {
      if (list !== "ol") { closeList(); out.push("<ol>"); list = "ol"; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^(#{1,4})\s+(.*)/))) {
      closeList();
      out.push(`<h${m[1].length + 1}>${inline(m[2])}</h${m[1].length + 1}>`);
    } else if ((m = line.match(/^&gt;\s?(.*)/))) {
      closeList();
      out.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else if (!line.trim()) {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("").replace(/<\/p><p>/g, "</p><p>");
}

function highlight(text, query) {
  const words = [...new Set((query || "").toLowerCase().match(/[a-z0-9]{4,}/g) || [])].slice(0, 8);
  let html = esc(text);
  if (!words.length) return html;
  const re = new RegExp(`\\b(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\w*`, "gi");
  return html.replace(re, "<mark>$&</mark>");
}

/* ---------- State ---------- */
const state = {
  chats: [],
  activeId: null,
  settings: { theme: "dark", accent: ACCENTS[0], topK: 4 },
  docs: [],
  health: null,
  busy: false,
  controller: null,
  panel: { open: window.innerWidth > 1100, msgId: null, cite: null },
  uploads: [],
  search: "",
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      state.chats = saved.chats ?? [];
      state.activeId = saved.activeId ?? null;
      state.settings = { ...state.settings, ...saved.settings };
    }
  } catch {
    /* Ignore corrupt storage. */
  }
}
function save() {
  try {
    const chats = state.chats.map((c) => ({ ...c, messages: c.messages.filter((m) => !m.pending) }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, activeId: state.activeId, settings: state.settings }));
  } catch {
    /* Storage full or blocked: keep working in memory. */
  }
}

const activeChat = () => state.chats.find((c) => c.id === state.activeId) ?? null;

/* ---------- Theme ---------- */
function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  document.documentElement.style.setProperty("--accent", state.settings.accent);
  $("#themeBtn").innerHTML = icon(state.settings.theme === "dark" ? "sun" : "moon");
}

/* ---------- Toasts ---------- */
function toast(message, type = "info") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `${icon(type === "error" ? "alert" : type === "success" ? "check" : "spark")}<span></span>`;
  el.querySelector("span").textContent = message;
  $("#toasts").appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/* Two-step confirm without browser dialogs: first click arms the button, second click acts. */
function armConfirm(button, label, action) {
  if (button.dataset.armed) return action();
  button.dataset.armed = "1";
  const original = button.innerHTML;
  button.innerHTML = `<span style="font-size:11px;font-weight:700;color:var(--danger);padding:0 4px">${label}</span>`;
  button.style.width = "auto";
  button.style.opacity = "1";
  setTimeout(() => {
    if (!button.isConnected) return;
    delete button.dataset.armed;
    button.innerHTML = original;
    button.style.width = "";
    button.style.opacity = "";
  }, 2500);
}

/* ---------- Sidebar ---------- */
function renderChats() {
  const list = $("#chatList");
  const q = state.search.toLowerCase();
  const chats = [...state.chats]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((c) => !q || c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content?.toLowerCase().includes(q)));
  if (!chats.length) {
    list.innerHTML = `<li class="list-empty">${state.chats.length ? "No matching chats" : "Your conversations will appear here."}</li>`;
    return;
  }
  list.innerHTML = chats
    .map(
      (c) => `<li class="chat-item${c.id === state.activeId ? " active" : ""}" data-id="${c.id}">
        <button data-action="open"><span class="chat-name">${esc(c.title)}</span><span class="chat-meta">${plural(c.messages.filter((m) => m.role === "user").length, "question")} · ${timeAgo(c.updatedAt)}</span></button>
        <button class="icon-btn xs" data-action="delete" aria-label="Delete chat">${icon("trash")}</button>
      </li>`,
    )
    .join("");
}

function renderDocs() {
  const list = $("#docList");
  $("#libraryCount").textContent = state.docs.length ? `${state.docs.length}` : "";
  list.innerHTML = state.docs.length
    ? state.docs
        .map((d) => {
          const ext = (d.name.split(".").pop() || "").toLowerCase();
          return `<li class="doc-item" data-name="${esc(d.name)}">
            <span class="doc-icon ${ext}">${esc(ext.toUpperCase())}</span>
            <span class="doc-info"><span class="doc-name" title="${esc(d.name)}">${esc(d.name)}</span>
            <span class="doc-meta">${d.pages} page${d.pages === 1 ? "" : "s"} · ${d.chunks} chunks · ${fmtSize(d.size)}</span></span>
            <button class="icon-btn xs" data-action="remove" aria-label="Remove ${esc(d.name)}">${icon("trash")}</button>
          </li>`;
        })
        .join("")
    : `<li class="list-empty">No papers yet. Upload one to start.</li>`;

  $("#uploadQueue").innerHTML = state.uploads
    .map(
      (u) => `<div class="upload-item${u.error ? " error" : ""}">
        <div class="row"><span class="name">${esc(u.name)}</span><span>${u.error ? "Failed" : "Indexing…"}</span></div>
        ${u.error ? `<div>${esc(u.error)}</div>` : '<div class="upload-bar"><div></div></div>'}
      </div>`,
    )
    .join("");
}

/* ---------- Status, header, footer ---------- */
function renderStatus() {
  const pill = $("#statusPill");
  const h = state.health;
  pill.className = "status-pill " + (!h ? "err" : h.llm_configured ? "ok" : "warn");
  $("#statusText").textContent = !h ? "Backend offline" : h.llm_configured ? "Gemini connected" : "API key missing";
  pill.title = !h
    ? "Start the server: uvicorn main:app"
    : h.llm_configured
      ? `Answers by ${h.llm_model}`
      : "Add GEMINI_API_KEY to backend/.env and restart the server";

  const chunks = state.docs.reduce((n, d) => n + d.chunks, 0);
  const pages = state.docs.reduce((n, d) => n + d.pages, 0);
  $("#footerStats").innerHTML = `<b>${state.docs.length}</b> paper${state.docs.length === 1 ? "" : "s"} · <b>${pages}</b> pages · <b>${chunks}</b> chunks indexed`;
  $("#modelInfo").textContent = h ? `${h.embedding_model} + FAISS · ${h.llm_model}` : "";
  $("#scopeHint").textContent = state.docs.length
    ? `Searching ${state.docs.length} paper${state.docs.length === 1 ? "" : "s"} · top ${state.settings.topK} passages`
    : "Upload a paper to begin";

  const chat = activeChat();
  $("#chatTitle").textContent = chat ? chat.title : "New chat";
  $("#chatSubtitle").textContent = chat
    ? `${plural(chat.messages.filter((m) => m.role === "user").length, "question")} · started ${timeAgo(chat.createdAt)}`
    : state.docs.length
      ? "Ask anything about your papers"
      : "Upload a research paper to get started";
}

/* ---------- Chat ---------- */
const SUGGESTIONS = [
  { icon: "list", title: "Summarize the paper", text: "Give me a structured summary of the key contributions." },
  { icon: "flask", title: "Explain the method", text: "What methodology and datasets were used?" },
  { icon: "alert", title: "Find limitations", text: "What are the limitations and future work mentioned?" },
  { icon: "bulb", title: "Explain simply", text: "Explain the main idea as if I'm a first-year student." },
];

function renderWelcome() {
  const hasDocs = state.docs.length > 0;
  return `<div class="welcome">
    <div class="welcome-orb">${icon("bot")}</div>
    <h2>${hasDocs ? "What would you like to <span>discover</span>?" : "Chat with your <span>research papers</span>"}</h2>
    <p>${hasDocs ? `Ask questions across ${state.docs.length} paper${state.docs.length === 1 ? "" : "s"}. Every answer cites the exact page.` : "Upload a PDF and get answers grounded in the paper, with page-level citations."}</p>
    ${
      hasDocs
        ? `<div class="suggestions">${SUGGESTIONS.map(
            (s) => `<button class="suggestion" data-prompt="${esc(s.text)}"><span class="s-icon">${icon(s.icon)}</span><span><b>${s.title}</b><small>${s.text}</small></span></button>`,
          ).join("")}</div>`
        : `<label class="big-drop" for="fileInput">${icon("upload")}<b>Drop a paper here or click to upload</b><small>PDF, TXT or Markdown · up to 20 MB</small></label>`
    }
    <div class="feature-row">
      <span>${icon("check")} Semantic search with FAISS</span>
      <span>${icon("check")} Page-level citations</span>
      <span>${icon("check")} Follow-up questions</span>
      <span>${icon("check")} Answers only from your papers</span>
    </div>
  </div>`;
}

function renderMessage(m, chat) {
  if (m.role === "user") {
    return `<div class="msg user"><div class="bubble-user">${esc(m.content)}</div></div>`;
  }
  if (m.pending) {
    const steps = ["Searching your papers", "Reading the most relevant passages", "Writing a grounded answer"];
    return `<div class="msg bot" data-id="${m.id}"><div class="avatar">${icon("bot")}</div><div class="bot-body"><div class="bot-card thinking">
      ${steps.map((s, i) => `<div class="step ${i < m.step ? "done" : i === m.step ? "active" : ""}"><span class="spinner"></span>${s}</div>`).join("")}
      <div style="margin-top:6px"><div class="shimmer" style="width:92%"></div><div class="shimmer" style="width:74%"></div></div>
    </div></div></div>`;
  }
  const sources = m.sources ?? [];
  const isLast = chat.messages[chat.messages.length - 1] === m;
  const activeMsg = state.panel.msgId === m.id;
  return `<div class="msg bot" data-id="${m.id}"><div class="avatar">${icon("bot")}</div><div class="bot-body">
    <div class="bot-card${m.error ? " error" : ""}"><div class="md">${m.error ? `<p><strong>Something went wrong.</strong> ${esc(m.content)}</p>` : renderMarkdown(m.content, sources.length)}</div>
    ${
      sources.length
        ? `<div class="source-chips">${sources
            .map((s, i) => `<button class="source-chip${activeMsg && state.panel.cite === i + 1 ? " active" : ""}" data-cite="${i + 1}"><b>${i + 1}</b><span>${esc(s.document)} · p.${s.page}</span></button>`)
            .join("")}</div>`
        : ""
    }</div>
    <div class="bot-footer">
      ${m.elapsed != null ? `<span>${icon("clock")} ${(m.elapsed / 1000).toFixed(1)}s</span>` : ""}
      ${sources.length ? `<span>· ${sources.length} source${sources.length === 1 ? "" : "s"}</span>` : ""}
      <span class="spacer"></span>
      ${m.error ? "" : `<button class="icon-btn xs" data-action="copy" title="Copy answer" aria-label="Copy answer">${icon("copy")}</button>`}
      ${isLast && !state.busy ? `<button class="icon-btn xs" data-action="retry" title="${m.error ? "Try again" : "Regenerate"}" aria-label="Regenerate">${icon("refresh")}</button>` : ""}
    </div>
  </div></div>`;
}

function renderChat({ scroll = true } = {}) {
  const chat = activeChat();
  const root = $("#chat");
  root.innerHTML = !chat || !chat.messages.length ? renderWelcome() : `<div class="thread">${chat.messages.map((m) => renderMessage(m, chat)).join("")}</div>`;
  if (scroll) root.scrollTop = root.scrollHeight;
  renderStatus();
}

/* ---------- Sources panel ---------- */
function renderSources() {
  const panel = $("#sourcesPanel");
  panel.classList.toggle("hidden", !state.panel.open);
  $("#sourcesToggle").classList.toggle("active", state.panel.open);
  const chat = activeChat();
  let msg = chat?.messages.find((m) => m.id === state.panel.msgId);
  if (!msg && chat) msg = [...chat.messages].reverse().find((m) => m.role === "assistant" && m.sources?.length);
  const body = $("#sourcesBody");
  if (!msg?.sources?.length) {
    body.innerHTML = `<div class="sources-empty">${icon("book")}<p>Passages used for each answer show up here.</p><p class="muted" style="margin-top:6px;font-size:12.5px">Click a citation like <span class="cite" style="pointer-events:none">1</span> to jump to it.</p></div>`;
    return;
  }
  const question = chat.messages[chat.messages.indexOf(msg) - 1]?.content ?? "";
  body.innerHTML = msg.sources
    .map(
      (s, i) => `<article class="source-card${state.panel.cite === i + 1 ? " active expanded" : ""}" data-n="${i + 1}">
        <div class="source-head"><span class="source-num">${i + 1}</span><span class="source-doc" title="${esc(s.document)}">${esc(s.document)}</span><span class="source-page">Page ${s.page}</span></div>
        <div class="match"><span>Match</span><div class="match-bar"><div style="width:${Math.max(4, Math.min(100, Math.round(s.score * 100)))}%"></div></div><b>${Math.round(s.score * 100)}%</b></div>
        <div class="source-text">${highlight(s.text, question)}</div>
        <button class="expand" data-action="expand">${state.panel.cite === i + 1 ? "Show less" : "Show full passage"}</button>
      </article>`,
    )
    .join("");
  const active = body.querySelector(".source-card.active");
  if (active) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function showSource(msgId, n) {
  state.panel = { open: true, msgId, cite: n };
  renderSources();
  renderChat({ scroll: false });
}

/* ---------- Sending ---------- */
function newChat() {
  state.activeId = null;
  state.panel.msgId = null;
  state.panel.cite = null;
  renderAll();
  closeSidebar();
  $("#input").focus();
}

async function ask(query) {
  query = query.trim();
  if (!query || state.busy) return;
  if (!state.docs.length) {
    toast("Upload a paper first, then ask away.", "error");
    return;
  }
  let chat = activeChat();
  if (!chat) {
    chat = { id: uid(), title: query.length > 52 ? query.slice(0, 50) + "…" : query, createdAt: Date.now(), updatedAt: Date.now(), messages: [] };
    state.chats.push(chat);
    state.activeId = chat.id;
  }
  const history = chat.messages.filter((m) => !m.error && !m.pending).map((m) => ({ role: m.role, content: m.content }));
  chat.messages.push({ id: uid(), role: "user", content: query });
  const pending = { id: uid(), role: "assistant", pending: true, step: 0 };
  chat.messages.push(pending);
  chat.updatedAt = Date.now();
  state.busy = true;
  setSendMode(true);
  renderChats();
  renderChat();

  const timers = [700, 1600].map((t, i) => setTimeout(() => { pending.step = i + 1; renderChat({ scroll: false }); }, t));
  const started = performance.now();
  state.controller = new AbortController();
  let result;
  try {
    const data = await api("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, top_k: state.settings.topK, history: history.slice(-12) }),
      signal: state.controller.signal,
    });
    result = { id: pending.id, role: "assistant", content: data.answer, sources: data.sources, elapsed: data.elapsed_ms ?? Math.round(performance.now() - started) };
  } catch (err) {
    const message = err.name === "AbortError" ? "Stopped." : err.message === "Failed to fetch" ? "Can't reach the server. Is it running?" : err.message;
    result = { id: pending.id, role: "assistant", content: message, error: true };
  } finally {
    timers.forEach(clearTimeout);
    state.busy = false;
    state.controller = null;
    setSendMode(false);
  }
  chat.messages[chat.messages.indexOf(pending)] = result;
  chat.updatedAt = Date.now();
  if (result.sources?.length) state.panel = { ...state.panel, msgId: result.id, cite: null };
  save();
  renderAll();
}

function regenerate() {
  const chat = activeChat();
  if (!chat || state.busy) return;
  const last = chat.messages[chat.messages.length - 1];
  const question = chat.messages[chat.messages.length - 2];
  if (last?.role !== "assistant" || question?.role !== "user") return;
  chat.messages.splice(-2, 2);
  ask(question.content);
}

function setSendMode(busy) {
  const btn = $("#sendBtn");
  btn.classList.toggle("stop", busy);
  btn.innerHTML = icon(busy ? "stop" : "send");
  btn.setAttribute("aria-label", busy ? "Stop" : "Send");
}

/* ---------- Documents ---------- */
async function refreshDocs() {
  try {
    const [health, docs] = await Promise.all([api("/api/health"), api("/api/documents")]);
    state.health = health;
    state.docs = docs.documents;
  } catch {
    state.health = null;
  }
  renderDocs();
  renderStatus();
}

async function uploadFiles(files) {
  for (const file of files) {
    const entry = { name: file.name };
    state.uploads.push(entry);
    renderDocs();
    const form = new FormData();
    form.append("file", file);
    try {
      const data = await api("/api/upload", { method: "POST", body: form });
      state.uploads.splice(state.uploads.indexOf(entry), 1);
      toast(`Indexed ${data.document}: ${data.pages} pages, ${data.chunks} chunks`, "success");
    } catch (err) {
      entry.error = err.message === "Failed to fetch" ? "Server unreachable" : err.message;
      setTimeout(() => {
        state.uploads.splice(state.uploads.indexOf(entry), 1);
        renderDocs();
      }, 6000);
    }
    await refreshDocs();
  }
  if (!activeChat()) renderChat();
}

async function removeDoc(name) {
  try {
    await api(`/api/documents/${encodeURIComponent(name)}`, { method: "DELETE" });
    toast(`Removed ${name}`);
  } catch (err) {
    toast(err.message, "error");
  }
  await refreshDocs();
  if (!activeChat()) renderChat();
}

/* ---------- Modals ---------- */
function openModal(title, html, onMount) {
  const root = $("#modalRoot");
  root.innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-header"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Close">${icon("x")}</button></div>${html}</div></div>`;
  const backdrop = root.firstElementChild;
  backdrop.addEventListener("mousedown", (e) => (e.target === backdrop || e.target.closest("[data-close]")) && closeModal());
  onMount?.(backdrop);
}
const closeModal = () => ($("#modalRoot").innerHTML = "");

function openSettings() {
  const s = state.settings;
  openModal(
    "Settings",
    `<div class="field"><span>Theme</span><div class="segmented" id="themeSeg">${["light", "dark"].map((t) => `<button data-theme-opt="${t}" class="${s.theme === t ? "active" : ""}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div></div>
     <div class="field"><span>Accent colour</span><div class="swatches">${ACCENTS.map((c) => `<button data-accent="${c}" class="${s.accent === c ? "active" : ""}" style="background:${c}" aria-label="Accent ${c}"></button>`).join("")}</div></div>
     <div class="field"><span>Passages per answer: <b id="topkVal">${s.topK}</b></span><input type="range" id="topk" min="1" max="10" value="${s.topK}" /><small>More passages give broader context; fewer keep answers focused.</small></div>
     <div class="field"><span>Data</span><div style="display:flex;gap:8px;flex-wrap:wrap">
       <button class="btn sm danger" id="clearChats">${icon("trash")} Delete all chats</button>
       <button class="btn sm danger" id="clearDocs">${icon("trash")} Remove all papers</button>
     </div><small>Chats are saved in this browser. Papers live on the server until it restarts.</small></div>`,
    (root) => {
      root.querySelectorAll("[data-theme-opt]").forEach((b) => b.addEventListener("click", () => { state.settings.theme = b.dataset.themeOpt; save(); applyTheme(); openSettings(); }));
      root.querySelectorAll("[data-accent]").forEach((b) => b.addEventListener("click", () => { state.settings.accent = b.dataset.accent; save(); applyTheme(); openSettings(); }));
      root.querySelector("#topk").addEventListener("input", (e) => { state.settings.topK = Number(e.target.value); root.querySelector("#topkVal").textContent = e.target.value; save(); renderStatus(); });
      root.querySelector("#clearChats").addEventListener("click", (e) => armConfirm(e.currentTarget, "Click again to delete", () => { state.chats = []; state.activeId = null; save(); renderAll(); closeModal(); toast("All chats deleted"); }));
      root.querySelector("#clearDocs").addEventListener("click", (e) => armConfirm(e.currentTarget, "Click again to remove", async () => { await api("/api/documents", { method: "DELETE" }).catch(() => {}); closeModal(); await refreshDocs(); renderChat(); toast("Library cleared"); }));
    },
  );
}

function openHelp() {
  const rows = [
    ["Ctrl / ⌘ + K", "New chat"],
    ["/", "Focus the question box"],
    ["Enter", "Send"],
    ["Shift + Enter", "New line"],
    ["Ctrl / ⌘ + U", "Upload papers"],
    ["Ctrl / ⌘ + .", "Toggle sources panel"],
    ["Esc", "Stop answering / close panels"],
    ["?", "This help"],
  ];
  const keys = (combo) => combo.split(" + ").map((k) => `<kbd>${esc(k)}</kbd>`).join(" + ");
  openModal("Keyboard shortcuts", `<div class="shortcuts">${rows.map(([k, v]) => `<div><span>${v}</span><span>${keys(k)}</span></div>`).join("")}</div>`);
}

/* ---------- Mobile sidebar ---------- */
const openSidebar = () => { $("#sidebar").classList.add("open"); $("#sidebarBackdrop").classList.add("show"); };
const closeSidebar = () => { $("#sidebar").classList.remove("open"); $("#sidebarBackdrop").classList.remove("show"); };

/* ---------- Wiring ---------- */
function renderAll() {
  renderChats();
  renderDocs();
  renderChat();
  renderSources();
}

function bind() {
  const input = $("#input");
  const autosize = () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 200) + "px"; };
  input.addEventListener("input", autosize);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      $("#composer").requestSubmit();
    }
  });
  $("#composer").addEventListener("submit", (e) => {
    e.preventDefault();
    if (state.busy) return state.controller?.abort();
    const q = input.value;
    input.value = "";
    autosize();
    ask(q);
  });

  $("#newChatBtn").addEventListener("click", newChat);
  $("#attachBtn").addEventListener("click", () => $("#fileInput").click());
  $("#fileInput").addEventListener("change", (e) => { uploadFiles([...e.target.files]); e.target.value = ""; });
  $("#themeBtn").addEventListener("click", () => { state.settings.theme = state.settings.theme === "dark" ? "light" : "dark"; save(); applyTheme(); });
  $("#settingsBtn").addEventListener("click", openSettings);
  $("#helpBtn").addEventListener("click", openHelp);
  $("#menuBtn").addEventListener("click", openSidebar);
  $("#sidebarBackdrop").addEventListener("click", closeSidebar);
  $("#sourcesToggle").addEventListener("click", () => { state.panel.open = !state.panel.open; renderSources(); });
  $("#closeSources").addEventListener("click", () => { state.panel.open = false; renderSources(); });
  $("#chatSearch").addEventListener("input", (e) => { state.search = e.target.value; renderChats(); });

  $("#chatList").addEventListener("click", (e) => {
    const item = e.target.closest(".chat-item");
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (!item) return;
    if (action === "delete") {
      return armConfirm(e.target.closest("button"), "Delete?", () => {
        state.chats = state.chats.filter((c) => c.id !== item.dataset.id);
        if (state.activeId === item.dataset.id) state.activeId = null;
        save();
        renderAll();
      });
    }
    state.activeId = item.dataset.id;
    state.panel.msgId = null;
    state.panel.cite = null;
    save();
    renderAll();
    closeSidebar();
  });

  $("#docList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action=remove]");
    if (btn) armConfirm(btn, "Remove?", () => removeDoc(btn.closest(".doc-item").dataset.name));
  });

  $("#chat").addEventListener("click", (e) => {
    const suggestion = e.target.closest(".suggestion");
    if (suggestion) return ask(suggestion.dataset.prompt);
    const msgEl = e.target.closest(".msg.bot");
    const cite = e.target.closest("[data-cite]");
    if (cite && msgEl) return showSource(msgEl.dataset.id, Number(cite.dataset.cite));
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "retry") return regenerate();
    if (action === "copy" && msgEl) {
      const msg = activeChat()?.messages.find((m) => m.id === msgEl.dataset.id);
      navigator.clipboard?.writeText(msg?.content ?? "").then(() => toast("Answer copied", "success"), () => toast("Couldn't copy", "error"));
    }
  });

  $("#sourcesBody").addEventListener("click", (e) => {
    if (!e.target.closest("[data-action=expand]")) return;
    const card = e.target.closest(".source-card");
    const n = Number(card.dataset.n);
    state.panel.cite = state.panel.cite === n ? null : n;
    renderSources();
    renderChat({ scroll: false });
  });

  // Drag papers anywhere onto the window.
  const dz = $("#dropzone");
  let depth = 0;
  window.addEventListener("dragenter", (e) => { if ([...e.dataTransfer.types].includes("Files")) { depth++; $("#dropOverlay").classList.add("show"); } });
  window.addEventListener("dragleave", () => { if (--depth <= 0) { depth = 0; $("#dropOverlay").classList.remove("show"); } });
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => {
    e.preventDefault();
    depth = 0;
    $("#dropOverlay").classList.remove("show");
    dz.classList.remove("drag");
    if (e.dataTransfer.files.length) uploadFiles([...e.dataTransfer.files]);
  });

  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
    if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); newChat(); }
    else if (mod && e.key.toLowerCase() === "u") { e.preventDefault(); $("#fileInput").click(); }
    else if (mod && e.key === ".") { e.preventDefault(); state.panel.open = !state.panel.open; renderSources(); }
    else if (e.key === "Escape") {
      if ($("#modalRoot").innerHTML) closeModal();
      else if (state.busy) state.controller?.abort();
      else { closeSidebar(); if (window.innerWidth <= 1100) { state.panel.open = false; renderSources(); } }
    } else if (!typing && e.key === "/") { e.preventDefault(); input.focus(); }
    else if (!typing && e.key === "?") { e.preventDefault(); openHelp(); }
  });

  // Keep relative times fresh.
  setInterval(() => { renderChats(); renderStatus(); }, 60_000);
}

load();
hydrateIcons();
applyTheme();
bind();
renderAll();
refreshDocs().then(() => renderChat());
