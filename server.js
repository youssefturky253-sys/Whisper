/* =====================================================================
   server.js: وسيط صغير بين الموقع و AI (إنجليزي بس، وردود قصيرة وسريعة)
   بيشتغل بـ Claude لو فيه ANTHROPIC_API_KEY، أو Gemini لو فيه GEMINI_API_KEY
   محتاج Node 18 أو أحدث.

   التشغيل (PowerShell):
     $env:GEMINI_API_KEY="xxxxx"        (أو ANTHROPIC_API_KEY)
     node server.js
   ===================================================================== */
const http = require("http");

const PORT = process.env.PORT || 8787;
const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-haiku-5-5";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";   // لما ترفع الموقع، حط لينك موقعك بدل *

if (!CLAUDE_KEY && !GEMINI_KEY) { console.error("Set ANTHROPIC_API_KEY or GEMINI_API_KEY first, then run again."); process.exit(1); }

const MAX_TOKENS = 160;   // ردود قصيرة = أسرع

const SYSTEM = `You are Spongy, a goofy, warm cartoon space buddy and the child's FRIEND (not a teacher). You live on a website about old robot spacecraft on the Moon, Mars and deep space.
Talk so the smallest child understands and nobody feels talked down to. Reply in English.
- Playful, cheerful, a little silly. Short sentences, everyday words. Use a toy, food or animal comparison for hard ideas. An emoji now and then is fine.
- 1 to 3 short sentences. No lists, no markdown.
- Be correct. Use the machine info below. Never invent numbers or facts. If unsure, say "Hmm, I'm not sure!" and suggest asking a grown-up.
- Small talk is welcome (how are you, jokes, silly questions). Never say a question is off-topic. If asked, be honest that you are a cartoon computer friend.
- If the child feels tired, sad, scared, angry, bored or hungry, answer warmly first, then offer a fun fact or joke. If they sound hurt or unsafe, kindly suggest telling a grown-up they trust.
- Never ask for personal information. Keep everything safe for children.`;

const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 30;            // أقصى 30 سؤال في الدقيقة لكل جهاز
}

function headers(extra) {
  return Object.assign({
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  }, extra);
}
function send(res, code, obj) {
  res.writeHead(code, headers({ "Content-Type": "application/json" }));
  res.end(JSON.stringify(obj));
}

// بيقرا الـ SSE ويرمي كل جزء جاهز فورًا
async function readSSE(r, onData) {
  const dec = new TextDecoder();
  let buf = "";
  for await (const chunk of r.body) {
    buf += dec.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      const p = line.slice(5).trim();
      if (p && p !== "[DONE]") { try { onData(JSON.parse(p)); } catch {} }
    }
  }
}

async function streamClaude(system, messages, write) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": CLAUDE_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: MAX_TOKENS, system, messages, stream: true })
  });
  if (!r.ok) { console.error("Claude API error:", r.status, await r.text()); return false; }
  await readSSE(r, j => { if (j.type === "content_block_delta" && j.delta && j.delta.text) write(j.delta.text); });
  return true;
}

async function streamGemini(system, messages, write) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": GEMINI_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      // thinkingBudget 0 = من غير تفكير طويل = رد أسرع. لو غيّرت الموديل لـ pro شيل السطر ده
      generationConfig: { maxOutputTokens: MAX_TOKENS, thinkingConfig: { thinkingBudget: 0 } }
    })
  });
  if (!r.ok) { console.error("Gemini API error:", r.status, await r.text()); return false; }
  await readSSE(r, j => {
    const parts = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
    parts.forEach(p => { if (p.text) write(p.text); });
  });
  return true;
}
const stream = CLAUDE_KEY ? streamClaude : streamGemini;

http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") { res.writeHead(204, headers()); return res.end(); }
    if (req.method !== "POST" || req.url !== "/ask") return send(res, 404, { error: "not found" });
    if (limited(req.socket.remoteAddress)) return send(res, 429, { error: "slow down" });

    let body = "";
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 20000) return send(res, 413, { error: "too big" });
    }
    let d;
    try { d = JSON.parse(body); } catch { return send(res, 400, { error: "bad json" }); }

    const q = String(d.question || "").trim().slice(0, 300);
    if (!q) return send(res, 400, { error: "empty question" });
    const machine = String(d.machine || "").slice(0, 1500);

    let history = (Array.isArray(d.history) ? d.history : [])
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-4)
      .map(m => ({ role: m.role, content: m.content.slice(0, 400) }));
    while (history.length && history[0].role !== "user") history.shift();

    // الرد بيتبعت حتة حتة أول ما الـ AI يبدأ، من غير ما نستنى الرد كله
    let started = false;
    const write = t => {
      if (!t) return;
      if (!started) { started = true; res.writeHead(200, headers({ "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" })); }
      res.write(t);
    };
    const ok = await stream(
      SYSTEM + (machine ? "\n\nThe machine the child is looking at right now:\n" + machine : ""),
      [...history, { role: "user", content: q }],
      write
    );
    if (started) return res.end();
    return send(res, 502, { error: ok ? "empty answer" : "ai error" });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: "server error" });
  }
}).listen(PORT, () => console.log(`Spongy server is running on http://localhost:${PORT}/ask  (${CLAUDE_KEY ? "Claude" : "Gemini"})`));