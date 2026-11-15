/* =====================================================================
   Spongy: صاحب الطفل الكرتوني
   1) شاشة افتتاح: Spongy بيسأل "Have you ever been to space before?" (Yes / No)
   2) Spongy تحت على اليمين: الطفل يضغط عليه ويسأل (كتابة أو صوت) في أي وقت
   3) لما الطفل يوصل لآخر صفحة في أي جهاز: Spongy بيسأل "Any questions?"
   4) المايك: الكلام بيتحول لكتابة. Voice chat: Spongy بيرد بالصوت وبيسمع تاني لوحده
   (إنجليزي بس)
   - بيعتمد على متغيرات app.js: cur, page, pagesOf, goStep, extras, COMMS, autoVoice,
     narrate, updatePage, VOICES, DEFAULT_VOICE
   - لازم server.js شغال عشان الردود الذكية
   ===================================================================== */
(() => {
"use strict";

const BUDDY_NAME = "Spongy";   // غيّر الاسم من هنا (وفي SYSTEM جوه server.js)
// لازم server.js يكون شغال. لما ترفع الموقع غيّر اللينك ده للينك السيرفر
const AI_ENDPOINT = "http://localhost:8787/ask";   // لازم server.js شغال. لو وقع، بيرجع للردود الجاهزة

/* ===== سرعة ظهور الرد (غيّر الأرقام دي براحتك) ===== */
const REPLY_CPS = 28;          // عدد الحروف في الثانية: 20 أبطأ، 28 معتدل، 40 أسرع
const REPLY_MIN_THINK = 700;   // أقل وقت "بيفكر" (النقط الثلاثة) بالملي ثانية

const CHIPS = ["What happened to it?", "What's the coolest thing about it?", "How long did it work?"];
const WORLD = { moon: "on the Moon", mars: "on Mars", space: "in deep space" };
const UI = { listening: "Listening...", ph: "Type or talk...", chips: CHIPS };

const LANG = "en-US";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => matchMedia("(max-width: 700px)").matches;
const $ = id => document.getElementById(id);
const mk = html => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; };

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

/* ---------------- الشخصية (SVG) ---------------- */
const COSMO = `<svg class="cosmo" viewBox="0 0 120 120" aria-hidden="true">
  <g class="body">
    <rect x="14" y="16" width="92" height="92" rx="14" fill="#ffd83a" stroke="#c99a00" stroke-width="3"/>
    <ellipse cx="28" cy="32" rx="5" ry="4" fill="#e9b800"/>
    <ellipse cx="92" cy="28" rx="6" ry="4.5" fill="#e9b800"/>
    <ellipse cx="97" cy="60" rx="3.5" ry="3" fill="#e9b800"/>
    <ellipse cx="22" cy="62" rx="3.5" ry="4" fill="#e9b800"/>
    <ellipse cx="30" cy="96" rx="5" ry="3.5" fill="#e9b800"/>
    <ellipse cx="90" cy="97" rx="6" ry="4" fill="#e9b800"/>
    <g class="eye"><circle cx="44" cy="50" r="15" fill="#ffffff" stroke="#8a6a00" stroke-width="2.5"/><circle cx="47" cy="52" r="6.5" fill="#2a6fb8"/><circle cx="47" cy="52" r="3" fill="#10243d"/><circle cx="49" cy="49.5" r="2" fill="#ffffff"/></g>
    <g class="eye"><circle cx="76" cy="50" r="15" fill="#ffffff" stroke="#8a6a00" stroke-width="2.5"/><circle cx="73" cy="52" r="6.5" fill="#2a6fb8"/><circle cx="73" cy="52" r="3" fill="#10243d"/><circle cx="75" cy="49.5" r="2" fill="#ffffff"/></g>
    <circle cx="27" cy="76" r="6" fill="#ff9a7a" opacity=".6"/>
    <circle cx="93" cy="76" r="6" fill="#ff9a7a" opacity=".6"/>
    <path class="smile" d="M36 74 Q60 100 84 74" stroke="#7a4a00" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <ellipse class="mouth" cx="60" cy="86" rx="14" ry="9" fill="#8a2230"/>
  </g>
</svg>`;
const MIC = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>';
const SPK = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
const GLOBE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>';

/* ---------------- بناء العناصر ---------------- */
const fab = mk(`<button id="buddyFab" aria-label="Ask ${BUDDY_NAME} a question" hidden>${COSMO}</button>`);
const bubble = mk(`<div id="buddyBubble" hidden role="status"></div>`);
const panel = mk(`
  <div id="buddyPanel" hidden role="dialog" aria-label="Chat with ${BUDDY_NAME}">
    <div class="bpHead">
      <span class="bpAv">${COSMO}</span>
      <div class="bpTitle"><b>${BUDDY_NAME}</b><small>your space buddy</small></div>
      <button id="bpClose" aria-label="Close chat">✕</button>
    </div>
    <div id="bpVoiceRow" class="bpTools" hidden>
      <button id="bpVoice" aria-pressed="false" hidden>${SPK}<span>Voice chat</span></button>
    </div>
    <div id="bpMsgs" aria-live="polite"></div>
    <div id="bpChips"></div>
    <div class="bpForm">
      <button id="bpMic" aria-label="Talk to ${BUDDY_NAME}" aria-pressed="false" hidden>${MIC}</button>
      <input id="bpInput" dir="auto" maxlength="200" placeholder="Type or talk..." autocomplete="off">
      <button id="bpSend">Ask</button>
    </div>
  </div>`);
document.body.append(fab, bubble, panel);

const msgs = $("bpMsgs"), input = $("bpInput"), sendBtn = $("bpSend"), chipsEl = $("bpChips");
const micBtn = $("bpMic"), voiceBtn = $("bpVoice");
let busy = false, history = [], lastMachine = null, promptedFor = null, bubbleTimer = 0, finishPrev = null;
let rec = null, stopFn = null, listening = false, voiceChat = false;

const scrollDown = () => { msgs.scrollTop = msgs.scrollHeight; };

/* ---------------- كتابة النص حرف حرف (والبوق بيتحرك) ---------------- */
function typeInto(el, text) {
  if (finishPrev) finishPrev();
  if (reduceMotion) { el.textContent = text; scrollDown(); return Promise.resolve(); }
  return new Promise(res => {
    let i = 0;
    const speed = text.length > 160 ? 9 : 16, step = 1;
    document.body.classList.add("cosmoTalk");
    const timer = setInterval(() => {
      i += step;
      el.textContent = text.slice(0, i);
      scrollDown();
      if (i >= text.length) done();
    }, speed);
    function done() {
      clearInterval(timer);
      el.textContent = text;
      scrollDown();
      document.body.classList.remove("cosmoTalk");
      if (finishPrev === done) finishPrev = null;
      res();
    }
    finishPrev = done;
  });
}

/* ---------------- الصوت ---------------- */
function speakIn(text, prof) {
  if (!("speechSynthesis" in window)) return Promise.resolve();
  speechSynthesis.cancel();
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG; u.pitch = prof.pitch; u.rate = prof.rate;
    u.onend = u.onerror = () => res();
    speechSynthesis.speak(u);
    setTimeout(res, Math.min(60000, 3000 + text.length * 120));   // أمان لو المتصفح ما بعتش onend
  });
}
// صوت Spongy: بيقرا لو "Listen to me" شغال أو لو Voice chat شغال
function speakCosmo(text, force) {
  const auto = typeof autoVoice !== "undefined" && autoVoice;
  if (!force && !auto) return Promise.resolve();
  return speakIn(text, { pitch: 1.5, rate: 1 });
}

/* ---------------- المايك: الكلام بيتحول لكتابة ---------------- */
function micUI() {
  micBtn.classList.toggle("listening", listening);
  micBtn.setAttribute("aria-pressed", listening);
}
function startListen() {
  if (!SR || listening || busy) return;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  const r = new SR();
  let finalText = "", err = "", cancelled = false;
  r.lang = LANG;
  r.interimResults = true;
  r.continuous = false;
  r.maxAlternatives = 1;
  r.onstart = () => { input.value = ""; input.placeholder = UI.listening; };
  r.onresult = e => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const x = e.results[i];
      if (x.isFinal) finalText += x[0].transcript; else interim += x[0].transcript;
    }
    input.value = (finalText + interim).trim();
  };
  r.onerror = e => { err = e.error || "error"; };
  r.onend = () => {
    if (rec === r) { listening = false; stopFn = null; micUI(); input.placeholder = UI.ph; }
    if (cancelled) return;
    if (err === "not-allowed" || err === "service-not-allowed") {
      addMsg("sys", "Please allow the microphone so I can hear you.");
      setVoiceChat(false);
      return;
    }
    if (err === "network") {
      addMsg("sys", "I can't hear well right now. You can type instead!");
      setVoiceChat(false);
      return;
    }
    const text = input.value.trim();
    if (text) ask(text);
    else if (voiceChat) {
      addMsg("sys", "I didn't hear anything. Tap the mic when you're ready!");
      setVoiceChat(false);
    }
  };
  rec = r;
  listening = true;
  micUI();
  stopFn = () => { cancelled = true; try { r.abort(); } catch (e) {} };
  try { r.start(); }
  catch (e) { listening = false; rec = null; stopFn = null; micUI(); }
}
function stopListen() { if (stopFn) stopFn(); }

function setVoiceChat(on) {
  voiceChat = on;
  voiceBtn.classList.toggle("on", on);
  voiceBtn.setAttribute("aria-pressed", on);
  if (on) startListen();
  else {
    stopListen();
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }
}

if (SR) {
  $("bpVoiceRow").hidden = false;
  voiceBtn.hidden = false;
  micBtn.hidden = false;
  micBtn.onclick = () => {
    if (listening) { try { rec.stop(); } catch (e) {} }   // بيوقف ويبعت اللي اتقال
    else startListen();
  };
  voiceBtn.onclick = () => setVoiceChat(!voiceChat);
}

/* ---------------- الفقاعة الصغيرة جنب Spongy ---------------- */
function showBubble(text, ms) {
  bubble.textContent = text;
  bubble.hidden = false;
  clearTimeout(bubbleTimer);
  if (ms) bubbleTimer = setTimeout(hideBubble, ms);
}
function hideBubble() { clearTimeout(bubbleTimer); bubble.hidden = true; }

/* ---------------- الشات ---------------- */
function addMsg(cls, text) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.dir = "auto";
  d.textContent = text;
  msgs.appendChild(d);
  scrollDown();
  return d;
}
async function botSay(text, force) {
  const el = addMsg("bot", "");
  const speaking = speakCosmo(text, force);
  await typeInto(el, text);
  if (voiceChat) await speaking;        // في Voice chat بنستنى Spongy يخلص كلام قبل ما نسمع الطفل
}
function renderChips() {
  chipsEl.innerHTML = "";
  if (!cur) return;
  UI.chips.forEach(t => {
    const b = document.createElement("button");
    b.className = "bpChip";
    b.dir = "auto";
    b.textContent = t;
    b.onclick = () => ask(t);
    chipsEl.appendChild(b);
  });
}
function showPanel() {
  hideBubble();
  panel.hidden = false;
  renderChips();
  scrollDown();
}
function closePanel() {
  panel.hidden = true;
  if (voiceChat) setVoiceChat(false); else stopListen();
}
function greet() {
  botSay(cur
    ? `Hi buddy! I'm ${BUDDY_NAME}. Ask me anything about ${cur.name}, or just chat with me!`
    : `Hi buddy! I'm ${BUDDY_NAME}. Pick a machine on the globe, or just chat with me!`);
}

fab.onclick = () => {
  if (!panel.hidden) return closePanel();
  showPanel();
  if (!msgs.children.length) greet();
  input.focus();
};
bubble.onclick = () => { showPanel(); input.focus(); };
$("bpClose").onclick = closePanel;
sendBtn.onclick = () => ask(input.value);
input.addEventListener("keydown", e => {
  e.stopPropagation();                         // عشان أسهم الكيبورد ما تحرّكش الـ story وهو بيكتب
  if (e.key === "Enter" && !e.isComposing) ask(input.value);
  if (e.key === "Escape") closePanel();
});

/* ---------------- السؤال والرد (بسرعة معتدلة) ---------------- */
async function ask(q) {
  q = (q || "").trim();
  if (!q || busy) return;
  busy = true; sendBtn.disabled = true; input.value = "";
  addMsg("me", q);
  const el = addMsg("bot think", "");
  el.innerHTML = "<i></i><i></i><i></i>";

  // الرد بيوصل بسرعة من السيرفر، بس إحنا بنعرضه بسرعة ثابتة معتدلة
  const t0 = Date.now();
  let incoming = "", started = false, startAt = 0;

  const ticker = setInterval(() => {
    if (!incoming) return;
    if (!started) {
      if (Date.now() - t0 < REPLY_MIN_THINK) return;     // نسيب النقط الثلاثة شوية
      started = true;
      startAt = Date.now();
      el.classList.remove("think");
      document.body.classList.add("cosmoTalk");
    }
    const n = reduceMotion
      ? incoming.length
      : Math.min(incoming.length, Math.floor((Date.now() - startAt) / 1000 * REPLY_CPS) + 1);
    if (el.textContent.length !== n) {
      el.textContent = incoming.slice(0, n);
      scrollDown();
    }
  }, 40);

  let answer = "";
  try {
    answer = await askAI(q, txt => { incoming = txt; });
  } catch (e) { answer = ""; }
  if (!answer) answer = "Oops, my radio is fuzzy. Can you ask me again?";
  incoming = answer;

  // نستنى لحد ما العرض يخلص الرد كامل
  await new Promise(res => {
    const w = setInterval(() => {
      if (started && el.textContent.length >= incoming.length) { clearInterval(w); res(); }
    }, 40);
  });
  clearInterval(ticker);

  document.body.classList.remove("cosmoTalk");
  el.classList.remove("think");
  el.textContent = answer;
  scrollDown();
  history.push({ role: "user", content: q }, { role: "assistant", content: answer });
  history = history.slice(-4);
  const speaking = speakCosmo(answer, voiceChat);
  if (voiceChat) await speaking;
  busy = false; sendBtn.disabled = false;
  if (voiceChat) startListen(); else input.focus();
}

/* ---------------- الإجابات ---------------- */
function contextOf(r) {
  const ex = (typeof extras !== "undefined" && extras[r.name]) || {};
  const c = (typeof COMMS !== "undefined" && COMMS[r.name]) || null;
  const L = [`Name: ${r.name}`, `Type: ${r.tag}`, `Where: ${WORLD[r.world] || ""}`,
    "Story (written in the machine's own voice): " + r.parts.join(" "), "Fun fact: " + r.fact];
  if (ex.statusText) L.push("Status: " + ex.statusText);
  if (ex.big) L.push(`Big number: ${ex.big.num} ${ex.big.label}`);
  if (ex.plan && ex.real) L.push(`Planned to work: ${ex.plan.text}. Actually worked: ${ex.real.text}`);
  if (c) L.push(`Talked to Earth from ${c[0]} to ${c[1]}`);
  return L.join("\n");
}

// الأسئلة البسيطة بنرد عليها فورًا من غير نت
function smallTalk(q) {
  const t = q.toLowerCase();
  if (t.length > 30) return null;
  if (/how are you|how r u|what'?s up|whats up|how do you do/.test(t)) return "I'm super happy, because you're here! How are YOU today?";
  if (/\b(your name|who are you)\b/.test(t)) return `I'm ${BUDDY_NAME}, your space buddy! Let's explore together.`;
  if (/\b(thank|thanks)\b/.test(t)) return "You're welcome, buddy!";
  if (/\b(bye|goodbye)\b/.test(t)) return "Bye bye, buddy! Come back soon!";
  if (/^(hello|hi|hey)\b/.test(t)) return cur ? `Hi buddy! Ask me anything about ${cur.name}.` : "Hi buddy! Pick a machine on the globe and let's chat!";
  return null;
}

// بترجع نص الرد. onText بيتنادى كل ما يوصل جزء جديد (streaming)
async function askAI(q, onText) {
  const quick = smallTalk(q);
  if (quick) return quick;
  if (AI_ENDPOINT) {
    try {
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), 15000);   // مهلة لأول جزء بس
      const res = await fetch(AI_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({ question: q, machine: cur ? contextOf(cur) : "", history })
      });
      if (res.ok && res.body) {
        const reader = res.body.getReader(), dec = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          clearTimeout(to);
          if (done) break;
          acc += dec.decode(value, { stream: true });
          onText(acc.trim());
        }
        if (acc.trim()) return acc.trim();
      }
      clearTimeout(to);
    } catch (e) { console.warn("AI server not reachable, using simple answers", e); }
  }
  return localAnswer(q);
}

// إجابات بسيطة جاهزة (لو السيرفر مش شغال). الإنجليزي بس
function localAnswer(q) {
  const t = q.toLowerCase();
  if (/how are you|how r u|what'?s up|whats up|how do you do/.test(t)) return "I'm super happy, because you're here! How are YOU today?";
  if (/\b(your name|who are you)\b/.test(t)) return `I'm ${BUDDY_NAME}, your space buddy! Let's explore together.`;
  if (/\b(thank|thanks)\b/.test(t)) return "You're welcome, buddy!";
  if (/love you|you(?:'re| are) (nice|cool|funny|great)/.test(t)) return "Aww, I like you too, buddy!";
  if (/\b(sad|tired|sleepy|scared|angry|bored|hungry|cry|crying)\b/.test(t))
    return "Aww, I'm right here with you, buddy. If you feel yucky inside, tell a grown-up you trust. Want to hear a fun space fact to feel better?";
  if (/\b(bye|goodbye)\b/.test(t)) return "Bye bye, buddy! Come back soon!";
  if (/\b(hello|hi|hey)\b/.test(t)) return cur ? `Hi buddy! Ask me anything about ${cur.name}.` : "Hi buddy! Pick a machine on the globe and let's chat!";
  if (!cur) return "Pick a machine on the globe first, then ask me about it!";

  const parts = cur.parts;
  const c = (typeof COMMS !== "undefined" && COMMS[cur.name]) || null;
  const ex = (typeof extras !== "undefined" && extras[cur.name]) || {};
  if (/how long|how many years|how many days/.test(t)) {
    if (c) { const n = c[1] - c[0]; return n < 1 ? "It talked to Earth for less than a year." : `It talked to Earth for about ${n} year${n === 1 ? "" : "s"}.`; }
    if (ex.big) return `${ex.big.num} ${ex.big.label}.`;
  }
  if (/\b(cool|coolest|fact|amazing|special|favorite|favourite|best|fun)\b/.test(t))
    return `Here's a fun fact, in its own words: "${cur.fact}"`;
  if (/\b(happen|happened|why|stop|stopped|quiet|silent|die|died|end|ended|lost|broke|fuel|power)\b/.test(t))
    return `${ex.statusText ? ex.statusText + ". " : ""}Here's how its story goes, in its own words: "${parts[parts.length - 1]}"`;
  if (/\bwhere\b/.test(t)) return `It is ${WORLD[cur.world] || "out in space"}.`;
  if (/\b(who|what|tell|about)\b/.test(t)) return `In its own words: "${parts[0]}"`;
  return "Hmm, that's a tricky one and I'm not sure! You can ask a grown-up to look it up with you, or press the 'Learn more on NASA' link on the last page.";
}

/* ---------------- ربط الكارت: Spongy بيسأل في آخر صفحة ---------------- */
function machineChanged() {
  if (msgs.children.length) addMsg("sys", `Now looking at: ${cur.name}`);
  renderChips();
}
async function promptAsk() {
  if (fab.hidden) return;
  const text = `Any questions about ${cur.name}?`;
  if (isMobile()) { showBubble(text); return; }   // على الموبايل بنظهر فقاعة بس عشان ما نغطيش الكارت
  showPanel();
  if (listening) stopListen();
  await botSay(text, voiceChat);
  if (voiceChat && !busy && !panel.hidden) startListen();
}
function onCard() {
  if (!cur) return;
  if (cur.name !== lastMachine) { lastMachine = cur.name; machineChanged(); }
  const last = page === pagesOf(cur).length - 1;
  if (!last) { promptedFor = null; hideBubble(); return; }
  if (!P.met.includes(cur.name)) earn(cur);
  if (promptedFor !== cur.name) { promptedFor = cur.name; promptAsk(); }
}
const baseRender = render;
render = function () { baseRender(); onCard(); };
const baseUpdate = updatePage;
updatePage = function () { baseUpdate(); onCard(); };
const baseClose = closeCard;
closeCard = function () { baseClose(); promptedFor = null; hideBubble(); };

/* ---------------- النجوم وجواز السفر والكويز ---------------- */
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
const PKEY = "ghostRoversProgress";
function loadP() {
  try {
    const d = JSON.parse(localStorage.getItem(PKEY) || "null");
    if (d && Array.isArray(d.met) && Array.isArray(d.bonus)) return d;
  } catch (e) {}
  return { met: [], bonus: [] };
}
const P = loadP();
const saveP = () => { try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch (e) {} };
const totalMachines = () => (typeof rovers !== "undefined" ? rovers.length : 20);
const stars = () => P.met.length + P.bonus.length;
function rankSteps() {
  const T = totalMachines();
  return [[0, "Rookie"], [Math.ceil(T * .25), "Astronaut"], [Math.ceil(T * .6), "Commander"], [T, "Space Legend"]];
}
function rankOf(n) { let r = "Rookie"; rankSteps().forEach(([k, name]) => { if (n >= k) r = name; }); return r; }
function nextHint(n) {
  const nx = rankSteps().find(([k]) => n < k);
  return nx ? `${nx[0] - n} more machine${nx[0] - n === 1 ? "" : "s"} to become ${nx[1]}` : "You met every machine!";
}

const hud = mk(`<button id="rewardHud" hidden aria-label="Open your space passport">
  <span class="hudStar">${STAR}<b id="hudStars">0</b></span><span id="hudProg"></span><span id="hudRank"></span></button>`);
const pass = mk(`<div id="passport" hidden role="dialog" aria-label="Space passport">
  <div class="ppBox">
    <button id="ppClose" aria-label="Close">✕</button>
    <h2>Space Passport</h2>
    <p id="ppRank"></p>
    <div class="ppBar"><b id="ppFill"></b></div>
    <div id="ppGrid"></div>
    <button id="ppReset" class="linkBtn">Start over</button>
  </div></div>`);
const quiz = mk(`<div id="quiz" hidden role="dialog" aria-label="Quick quiz">
  <div class="qBox">
    <div class="qAv">${COSMO}</div>
    <p id="qText"></p>
    <div id="qOpts"></div>
    <p id="qMsg"></p>
    <button id="qDone" class="primary" hidden>Keep exploring</button>
    <button id="qSkip" class="linkBtn">Skip</button>
  </div></div>`);
const toast = mk(`<div id="rewardToast" hidden role="status"></div>`);
document.body.append(hud, pass, quiz, toast);

function updateHud(pop) {
  $("hudStars").textContent = stars();
  $("hudProg").textContent = `${P.met.length}/${totalMachines()}`;
  $("hudRank").textContent = rankOf(P.met.length);
  if (pop && !reduceMotion) { hud.classList.remove("pop"); void hud.offsetWidth; hud.classList.add("pop"); }
}
let toastT = 0;
function showToast(text, ms) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { toast.hidden = true; }, ms || 3500);
}
function confetti() {
  if (reduceMotion) return;
  const wrap = document.createElement("div");
  wrap.className = "confetti";
  const colors = ["#ffd83a", "#ff7a45", "#8ab4ff", "#4cd964", "#ff6b9a"];
  for (let i = 0; i < 48; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%";
    p.style.background = colors[i % 5];
    p.style.animationDelay = Math.random() * .6 + "s";
    p.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 3400);
}

/* جواز السفر: الأجهزة اللي اتقابلت بتتختم، والباقي علامة استفهام */
function openPassport() {
  const n = P.met.length, T = totalMachines();
  $("ppRank").textContent = `${rankOf(n)} · ${n} of ${T} machines · ${stars()} stars. ${nextHint(n)}`;
  $("ppFill").style.width = (T ? n / T * 100 : 0) + "%";
  const grid = $("ppGrid");
  grid.innerHTML = "";
  rovers.forEach(r => {
    const got = P.met.includes(r.name);
    const d = document.createElement("div");
    d.className = `stamp s-${statusOf(r.name)}${got ? " got" : ""}`;
    d.title = got ? r.name : "Not met yet";
    d.innerHTML = `<span class="stampIc">${svgFor(r.name)}</span><small></small>`;
    d.lastChild.textContent = got ? r.name : "???";
    grid.appendChild(d);
  });
  pass.hidden = false;
  $("ppClose").focus();
}
hud.onclick = openPassport;
$("ppClose").onclick = () => { pass.hidden = true; };
pass.addEventListener("click", e => { if (e.target === pass) pass.hidden = true; });
$("ppReset").onclick = () => {
  if (!confirm("Start over? Your stars and stamps will be erased.")) return;
  P.met = []; P.bonus = [];
  saveP(); updateHud(); openPassport();
};

/* الكويز السريع: سؤال واحد بعد أول مرة يخلص جهاز (من بيانات الموقع نفسها) */
function makeQuiz(r) {
  const h = [...r.name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const c = (typeof COMMS !== "undefined" && COMMS[r.name]) || null;
  const lab = n => n < 1 ? "Less than a year" : n === 1 ? "About 1 year" : `About ${n} years`;
  if (c && h % 2 === 0) {
    const n = c[1] - c[0], set = [lab(n)];
    [n + 2, n * 2 + 3, n + 7, Math.max(1, n - 3), n + 12].forEach(x => {
      if (set.length < 3 && !set.includes(lab(x))) set.push(lab(x));
    });
    return { q: `How long did ${r.name} talk to Earth?`, opts: set, ans: lab(n) };
  }
  const W = { moon: "On the Moon", mars: "On Mars", space: "In deep space" };
  return { q: `Where is ${r.name}?`, opts: Object.values(W), ans: W[r.world] || "In deep space" };
}
function openQuiz(r) {
  if (P.bonus.includes(r.name)) return;
  setTimeout(() => {
    if (!cur || cur.name !== r.name || P.bonus.includes(r.name)) return;
    const z = makeQuiz(r);
    $("qText").textContent = "Quick quiz! " + z.q;
    $("qMsg").textContent = "";
    $("qDone").hidden = true;
    $("qSkip").hidden = false;
    const box = $("qOpts");
    box.innerHTML = "";
    z.opts.sort(() => Math.random() - .5).forEach(o => {
      const b = document.createElement("button");
      b.className = "qOpt";
      b.textContent = o;
      b.onclick = () => answerQuiz(b, z, r);
      box.appendChild(b);
    });
    quiz.hidden = false;
    box.firstChild.focus();
  }, 1500);
}
function answerQuiz(btn, z, r) {
  const ok = btn.textContent === z.ans;
  [...$("qOpts").children].forEach(b => { b.disabled = true; if (b.textContent === z.ans) b.classList.add("right"); });
  if (!ok) btn.classList.add("wrong");
  $("qMsg").textContent = ok ? "Yes! You got it! +1 bonus star!" : `Good try! It was: ${z.ans}.`;
  if (ok && !P.bonus.includes(r.name)) { P.bonus.push(r.name); saveP(); updateHud(true); confetti(); }
  $("qDone").hidden = false;
  $("qSkip").hidden = true;
  $("qDone").focus();
}
const closeQuiz = () => { quiz.hidden = true; };
$("qDone").onclick = closeQuiz;
$("qSkip").onclick = closeQuiz;
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!quiz.hidden) closeQuiz();
  else if (!pass.hidden) pass.hidden = true;
});

// بيتنادى أول مرة الطفل يوصل لآخر صفحة في جهاز
function earn(r) {
  if (P.met.includes(r.name)) return;
  const before = rankOf(P.met.length);
  P.met.push(r.name);
  saveP();
  const after = rankOf(P.met.length);
  updateHud(true);
  if (P.met.length >= totalMachines()) {
    confetti();
    showToast("★ You met every machine! You are a Space Legend!", 6000);
    return;
  }
  if (after !== before) { confetti(); showToast(`★ New rank: ${after}!`, 5000); }
  else showToast(`★ +1 star! ${r.name} is in your passport.`);
  openQuiz(r);
}

/* ---------------- شاشة الافتتاح ---------------- */
const oldIntro = $("intro");          // الافتتاح القديم من app.js: بنشيله وبنحط بتاعنا
if (oldIntro) oldIntro.remove();

const intro = mk(`
  <div id="cosmoIntro" role="dialog" aria-label="Welcome">
    <div class="i2Box">
      <h2>The machines we left behind are still out there.</h2>
      <div class="i2Stage">
        <div class="i2Av">${COSMO}</div>
        <div class="i2Bubble"><p id="i2Text"></p></div>
      </div>
      <div id="i2Opts" class="i2Btns" hidden>
        <button id="i2Yes" class="primary">Yes!</button>
        <button id="i2No">No, never</button>
      </div>
      <div id="i2Go" class="i2Btns" hidden>
        <button id="i2Start" class="primary"></button>
      </div>
      <button id="i2Skip" class="linkBtn">Skip intro</button>
    </div>
  </div>`);
document.body.appendChild(intro);

function closeIntro() {
  if (finishPrev) finishPrev();
  intro.remove();
  fab.hidden = false;
  hud.hidden = false;
  updateHud();
  showBubble("Tap me any time to talk or ask a question!", 7000);
}
function answerIntro(yes) {
  $("i2Opts").hidden = true;
  $("i2Start").textContent = yes ? "Let's learn more" : "Let's explore together";
  typeInto($("i2Text"), yes
    ? "Wow, a real space explorer! Let's go on a trip and learn even more!"
    : "No problem! Let's explore space together and discover cool things."
  ).then(() => { $("i2Go").hidden = false; $("i2Start").focus(); });
}
$("i2Yes").onclick = () => answerIntro(true);
$("i2No").onclick = () => answerIntro(false);
$("i2Start").onclick = () => { closeIntro(); goStep(0); };
$("i2Skip").onclick = closeIntro;

typeInto($("i2Text"), `Hi! I'm ${BUDDY_NAME}, your space buddy. Have you ever been to space before?`)
  .then(() => { $("i2Opts").hidden = false; $("i2Yes").focus(); });

})();