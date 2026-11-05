const $ = (id) => document.getElementById(id);
const messagesEl = $("messages"), form = $("form"), input = $("input"), sendBtn = $("send"), chips = $("chips");

const GREETING = "Hi! 👋 I'm Aria, Faria Rajpoot's portfolio assistant. Ask me about her skills, projects, experience, education or how to get in touch.";
let history = [];

// Theme (remembers choice)
const savedTheme = localStorage.getItem("aria-theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
$("themeBtn").onclick = () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("aria-theme", next);
};

function linkify(text) {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return safe.replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
             .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function addMsg(text, who, extra = "") {
  const div = document.createElement("div");
  div.className = `msg ${who} ${extra}`.trim();
  div.innerHTML = linkify(text);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "msg bot typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

async function send(text) {
  text = text.trim();
  if (!text) return;
  chips.style.display = "none";
  addMsg(text, "user");
  history.push({ role: "user", content: text });
  input.value = ""; sendBtn.disabled = true;
  const typing = showTyping();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    typing.remove();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    addMsg(data.reply, "bot");
    history.push({ role: "assistant", content: data.reply });
  } catch (err) {
    typing.remove();
    addMsg("⚠️ " + err.message, "bot", "error");
    history.pop();
  } finally {
    sendBtn.disabled = false; input.focus();
  }
}

form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
chips.addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") send(e.target.textContent); });
$("clearBtn").onclick = reset;

function reset() {
  history = []; messagesEl.innerHTML = ""; chips.style.display = "flex";
  addMsg(GREETING, "bot");
}
reset();
