// أسماء صور الخرائط (زي ما هي ظاهرة في Explorer)
const files = { moon: "moon.jpg.jfif", mars: "mars.jpg.jfif" };
// لو الأماكن على القمر طالعة غلط، غيّر true لـ false
const MOON_0_TO_360 = true;
// الشريط الزمني اللي تحت (Play وتشوف الأجهزة بتنور وتطفي). لو عايز تشيله خالص غيّر true لـ false
const SHOW_TIMELINE = false;

/* ===== رسالة على الشاشة بدل الصفحة الفاضية (للتشخيص) ===== */
function showProblem(msg) {
  let el = document.getElementById("problem");
  if (!el) {
    el = document.createElement("div");
    el.id = "problem";
    el.style.cssText = "position:fixed;top:90px;right:20px;z-index:50;max-width:360px;padding:12px 16px;border-radius:12px;background:#5c1d1d;color:#fff;font-size:13px;line-height:1.5;box-shadow:0 10px 40px rgba(0,0,0,.5)";
    document.body.appendChild(el);
  }
  el.textContent = msg;
}
window.addEventListener("error", e => showProblem("JS error: " + e.message));
if (location.protocol === "file:")
  showProblem("The page is opened as a file (file://). Chrome blocks the Moon/Mars map this way. If the globe is blank, open the site with VS Code Live Server or from a hosting link.");

// الصور في نفس الفولدر الرئيسي، فمفيش اسم فولدر
const IMG_DIR = "";
const EXTS = ["jpg", "jpeg", "png", "jfif", "webp", "gif", "avif", "bmp", "JPG", "PNG", "JPEG", "jpg.jfif"];
const SUFFIXES = ["", ".1", ".2"];

/* =====================================================================
   الفيديوهات
   لكل جهاز: id = الكود اللي بعد v= في لينك يوتيوب
             start / end = بالثواني (مثلاً 1:30 = 90). end: 0 يعني لحد الآخر.
   لو id فاضي، الزرار بيفتح بحث يوتيوب عن الجهاز.
   مثال: https://www.youtube.com/watch?v=AbCdEfGhIjK  →  id: "AbCdEfGhIjK"

   أو استخدم ملف فيديو من نفس فولدر الموقع بدل يوتيوب:
   { file: "apollo15.mp4", start: 0, end: 0 }
   ===================================================================== */
const VIDEOS = {
  "Apollo 11 Eagle":                    { id: "nOcDftgR5UQ", start: 0, end: 0 },
  "Surveyor 1":                         { id: "FOWNrvvTIZM", start: 0, end: 0 },
  "Surveyor 3":                         { id: "Qhgq19u28Fk", start: 0, end: 0 },
  "Apollo 14 science station (ALSEP)":  { id: "l7MMTm1-DAA", start: 0, end: 0 },
  "Moon Buggy (Apollo 15)":             { id: "1Mqsd0ru_pc", start: 0, end: 0 },
  "Moon Buggy (Apollo 16)":             { id: "az9nFrnCK60", start: 0, end: 0 },
  "Moon Buggy (Apollo 17)":             { id: "MvVxtFyTE0M", start: 0, end: 0 },
  "Sojourner":                          { id: "4czjS9h4Fpg", start: 0, end: 0 },
  "Spirit":                             { id: "uB8CpstmAus", start: 0, end: 0 },
  "Opportunity":                        { id: "iMnt6PWYscg", start: 0, end: 0 },
  "Viking 1":                           { id: "zeApJ2nuYmY", start: 0, end: 0 },
  "Viking 2":                           { id: "__gPs6OPCHY", start: 0, end: 0 },
  "Phoenix":                            { id: "xCLg485_xcg", start: 0, end: 0 },
  "InSight":                            { id: "RVzzgwVyH4Y", start: 0, end: 0 },
  "Ingenuity":                          { id: "qMbHE_VXI-8", start: 0, end: 0 },
  "Dawn":                               { id: "IROF86ZTwpI", start: 0, end: 0 },
  "NEAR Shoemaker":                     { id: "mcMmDfABKlI", start: 0, end: 0 },
  "Pioneer 10":                         { id: "apuQh1Vve3I", start: 0, end: 0 },
  "Pioneer 11":                         { id: "UOxgOG_ahxQ", start: 0, end: 0 },
  "Kepler":                             { id: "3yij1rJOefM", start: 0, end: 0 }
};

/* لينكات "Learn more on NASA": اللي مكتوبة هنا بتغلب اللينك اللي في ملف البيانات */
const LINKS = {
  "Apollo 11 Eagle": "https://www.nasa.gov/missions/apollo/apollo-11/apollo-11-mission-overview/",
  "Surveyor 1": "https://science.nasa.gov/mission/surveyor-1",
  "Surveyor 3": "https://science.nasa.gov/mission/surveyor-3",
  "Apollo 14 science station (ALSEP)": "https://www.nasa.gov/wp-content/uploads/static/history/alsj/HamishALSEP.html",
  "Moon Buggy (Apollo 15)": "https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html",
  "Moon Buggy (Apollo 16)": "https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html",
  "Moon Buggy (Apollo 17)": "https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html",
  "Sojourner": "https://science.nasa.gov/mission/mars-pathfinder/",
  "Viking 2": "https://science.nasa.gov/mission/viking-2/",
  "Phoenix": "https://science.nasa.gov/?search=Phoenix%20Mars%20Lander",
  "InSight": "https://science.nasa.gov/mission/insight/",
  "Pioneer 11": "https://science.nasa.gov/mission/pioneer-11/"
};
const linkOf = r => LINKS[r.name] || r.link;

/* =====================================================================
   صوت لكل جهاز: pitch = درجة الصوت (0.1 - 2)، rate = السرعة
   ===================================================================== */
let autoVoice = false;   // بيتفعّل من زرار Listen to me
const DEFAULT_VOICE = { pitch: 1.2, rate: 0.95 };
const VOICES = {
  "Apollo 11 Eagle":                    { pitch: 0.9,  rate: 0.95 },
  "Surveyor 1":                         { pitch: 1.2,  rate: 1.0 },
  "Surveyor 3":                         { pitch: 1.25, rate: 1.0 },
  "Apollo 14 science station (ALSEP)":  { pitch: 0.9,  rate: 0.9 },
  "Moon Buggy (Apollo 15)":             { pitch: 1.0,  rate: 1.05 },
  "Moon Buggy (Apollo 16)":             { pitch: 1.05, rate: 1.05 },
  "Moon Buggy (Apollo 17)":             { pitch: 1.1,  rate: 1.1 },
  "Sojourner":                          { pitch: 1.8,  rate: 1.1 },   // صغير وسريع
  "Spirit":                             { pitch: 1.3,  rate: 1.0 },
  "Opportunity":                        { pitch: 1.35, rate: 1.0 },
  "Viking 1":                           { pitch: 0.8,  rate: 0.9 },
  "Viking 2":                           { pitch: 0.75, rate: 0.9 },
  "Phoenix":                            { pitch: 1.1,  rate: 0.95 },
  "InSight":                            { pitch: 0.7,  rate: 0.85 },  // هادي بيسمع
  "Ingenuity":                          { pitch: 1.7,  rate: 1.15 },  // خفيف
  "Dawn":                               { pitch: 1.0,  rate: 0.9 },
  "NEAR Shoemaker":                     { pitch: 1.3,  rate: 1.0 },
  "Pioneer 10":                         { pitch: 0.5,  rate: 0.75 },  // وحيد وبعيد
  "Pioneer 11":                         { pitch: 0.55, rate: 0.75 },
  "Kepler":                             { pitch: 1.0,  rate: 0.9 }
};

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const v = (cur && VOICES[cur.name]) || DEFAULT_VOICE;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.pitch = v.pitch; u.rate = v.rate;
  speechSynthesis.speak(u);
}
// بيقرا الصفحة الحالية تلقائي (إلا لو الفيديو شغال أو الصوت مقفول)
function narrate() {
  if (!autoVoice || vid || !cur) return;
  speak(pagesOf(cur)[page].replace(/<[^>]+>/g, ""));
}

/* =====================================================================
   خط الاتصال بالأرض: سنة البداية وسنة آخر إشارة لكل جهاز
   ===================================================================== */
const NOW = new Date().getFullYear();
const COMMS = {
  "Apollo 11 Eagle": [1969, 1969],
  "Surveyor 1": [1966, 1967],
  "Surveyor 3": [1967, 1967],
  "Apollo 14 science station (ALSEP)": [1971, 1977],
  "Moon Buggy (Apollo 15)": [1971, 1971],
  "Moon Buggy (Apollo 16)": [1972, 1972],
  "Moon Buggy (Apollo 17)": [1972, 1972],
  "Sojourner": [1997, 1997],
  "Spirit": [2004, 2010],
  "Opportunity": [2004, 2018],
  "Viking 1": [1976, 1982],
  "Viking 2": [1976, 1980],
  "Phoenix": [2008, 2008],
  "InSight": [2018, 2022],
  "Ingenuity": [2021, 2024],
  "Dawn": [2007, 2018],
  "NEAR Shoemaker": [1996, 2001],
  "Pioneer 10": [1972, 2003],
  "Pioneer 11": [1973, 1995],
  "Kepler": [2009, 2018]
};
function linkHTML() {
  const c = COMMS[cur.name];
  if (!c) return "";
  const [start, end] = c;
  const talked = end - start;
  const silent = NOW - end;
  const p = Math.min(92, Math.max(8, Math.round(talked / (NOW - start) * 100)));
  const plural = n => n === 1 ? "1 year" : n + " years";
  const talkTxt = talked < 1 ? "less than a year" : plural(talked);
  return `<div class="linkBox">
    <div class="linkRow">
      <span class="earth" title="Earth"></span>
      <div class="wire">
        <i class="live" style="width:${p}%"></i>
        <i class="cut" style="left:${p}%">✕</i>
        <i class="gap" style="left:${p}%"></i>
      </div>
      <span class="dev s-${statusOf(cur.name)}">${svgFor(cur.name)}</span>
    </div>
    <div class="linkTxt">Talked to Earth for <b>${talkTxt}</b> · silent for <b>${plural(silent)}</b></div>
  </div>`;
}

const globeEl = document.getElementById("globe");
const spaceEl = document.getElementById("space");
const card = document.getElementById("card");
const tabs = { moon: "moonBtn", mars: "marsBtn", space: "spaceBtn" };

function hintHTML() {
  if (storyOn) return "<p>Follow the story above.</p>";
  return "<p>Pick any glowing icon to meet a machine. Blue rings are parked, yellow went quiet, red lost contact.</p>";
}

let cur = null, page = 0, shot = 0, vid = false;
let storyOn = false, curWorld = "moon";
const storyVisible = new Set();

/* ---------------- أيقونات SVG: شكل مختلف لكل جهاز ---------------- */
const S = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const ICONS = {
  eagle: S('<path d="M9 3.5h6l1.5 3V10h-9V6.5z"/><path d="M6.5 10h11l1.5 4H5z"/><path d="M6 14l-3 6M18 14l3 6M12 14v5M2 20h4M18 20h4"/>'),
  buggy: S('<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 14l2.5-4h7L18 14M9 10V7.5M7.5 7.5h3M15.5 10l2.5-5"/><path d="M16 4.5c1.5-.8 3.5 0 4 1.5z"/>'),
  surveyor: S('<path d="M12 2.5v8M9 4.5h6"/><circle cx="12" cy="12" r="2.5"/><path d="M10.5 14l-5 6.5M13.5 14l5 6.5M12 14.5v6M3.5 20.5h4M16.5 20.5h4"/>'),
  alsep: S('<path d="M6.5 4.5c0 3.2 2.4 5.5 5.5 5.5s5.5-2.3 5.5-5.5z"/><path d="M12 10v4"/><rect x="7" y="14" width="10" height="5" rx="1"/><path d="M3 21h18"/>'),
  sojourner: S('<path d="M6 7h12l1.5 3h-15z"/><rect x="7" y="10" width="10" height="4" rx="1"/><circle cx="7" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
  mer: S('<path d="M12 3v5M10.5 3h3"/><path d="M3 11l2-3h14l2 3z"/><rect x="7" y="11" width="10" height="3" rx="1"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 16v-2M18 16v-2"/>'),
  viking: S('<path d="M8 8h8l2.5 4L16 16H8l-2.5-4z"/><path d="M12 8V4M9 3.5l3 2 3-2"/><path d="M8 16l-3.5 4.5M16 16l3.5 4.5M12 16v4.5"/>'),
  phoenix: S('<path d="M1.5 9l6-1.5v7L1.5 13zM22.5 9l-6-1.5v7l6 1.5z"/><rect x="8" y="8" width="8" height="6" rx="1"/><path d="M12 14v3l4 3.5"/>'),
  insight: S('<circle cx="5" cy="11" r="3.3"/><circle cx="19" cy="11" r="3.3"/><path d="M8.3 11h7.4M9 15h6l1.2 4.5H7.8zM10 11a2 2 0 0 1 4 0"/>'),
  ingenuity: S('<path d="M3 3.5h18M5 6h14M12 3.5V8"/><rect x="9" y="8" width="6" height="5" rx="1"/><path d="M8.5 13l-2.5 6M15.5 13l2.5 6M12 13v2"/>'),
  dawn: S('<rect x="10" y="9" width="4" height="6" rx=".6"/><path d="M1.5 8.5H9v7H1.5zM15 8.5h7.5v7H15zM5.2 8.5v7M18.8 8.5v7M12 9V6"/>'),
  near: S('<path d="M8.5 7h6v10h-6z"/><path d="M14.5 9.5h7v5h-7zM18 9.5v5"/><path d="M8.5 12H5M5 8.5c-1.8 1-1.8 6 0 7z"/>'),
  pioneer: S('<path d="M4 9c1 6 4 8.5 8 8.5s7-2.5 8-8.5z"/><path d="M12 17.5V21M12 9V5.5M10 5.5h4"/><rect x="5" y="3" width="4" height="3" rx=".4"/>'),
  kepler: S('<rect x="8" y="3" width="8" height="11" rx="1"/><path d="M8 6.5h8"/><path d="M5 14h14l-1.5 6h-11z"/>')
};

function iconKey(n) {
  if (/Eagle/.test(n)) return "eagle";
  if (/Buggy/.test(n)) return "buggy";
  if (/Surveyor/.test(n)) return "surveyor";
  if (/ALSEP/.test(n)) return "alsep";
  if (/Sojourner/.test(n)) return "sojourner";
  if (/Spirit|Opportunity/.test(n)) return "mer";
  if (/Viking/.test(n)) return "viking";
  if (/Phoenix/.test(n)) return "phoenix";
  if (/InSight/.test(n)) return "insight";
  if (/Ingenuity/.test(n)) return "ingenuity";
  if (/Dawn/.test(n)) return "dawn";
  if (/NEAR/.test(n)) return "near";
  if (/Pioneer/.test(n)) return "pioneer";
  if (/Kepler/.test(n)) return "kepler";
  return "pioneer";
}
const svgFor = n => ICONS[iconKey(n)];
const statusOf = n => (typeof extras !== "undefined" && extras[n] && extras[n].status) || "rest";

const SPEAKER = S('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>');

/* ---------------- تحميل الصور ---------------- */
function tryLoad(url) {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => res(url);
    im.onerror = () => res(null);
    im.src = url;
  });
}

async function findImages(r) {
  if (r.imgs) return;
  r.imgs = [];
  const bases = [];
  (r.photos || []).forEach(b => { bases.push(b); bases.push(b.toLowerCase()); });
  const uniqueBases = [...new Set(bases)];
  const found = [];
  for (const s of SUFFIXES) {
    const combos = [];
    uniqueBases.forEach(b => EXTS.forEach(e => combos.push(IMG_DIR + encodeURI(b + s + "." + e))));
    const results = await Promise.all(combos.map(tryLoad));
    const hit = results.find(Boolean);
    if (hit) found.push(hit);
  }
  r.imgs = found;
  if (cur === r && found.length && !vid) render();
}

/* ---------------- الكارت ---------------- */
function openCard(r, fly = true) {
  speechSynthesis.cancel();
  cur = r; page = 0; shot = 0; vid = false; render();
  findImages(r);
  narrate();
  if (fly && r.world !== "space") {
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: r.lat, lng: r.dLng, altitude: 1.5 }, 900);
  }
}

function closeCard() {
  speechSynthesis.cancel();
  cur = null; vid = false;
  document.body.classList.remove("vidOn");
  card.classList.remove("wide");
  card.innerHTML = hintHTML();
}

function photoHTML() {
  const imgs = cur.imgs || [];
  const play = clipOf(cur) ? `<button class="playOver" id="playOver" aria-label="Play video">▶</button>` : "";
  if (!imgs.length) return `<div class="photo"><div class="bigIcon s-${statusOf(cur.name)}">${svgFor(cur.name)}</div>${play}</div>`;
  const multi = imgs.length > 1;
  return `<div class="photo">
      <img src="${imgs[shot]}" alt="${cur.name}">
      ${play}
      ${multi ? `<button class="arrow l" id="pl">‹</button><button class="arrow r" id="pr">›</button>
      <div class="dots">${imgs.map((_, i) => `<i class="${i === shot ? "on" : ""}"></i>`).join("")}</div>` : ""}
    </div>`;
}

/* ---------------- الفيديو ---------------- */
function clipOf(r) {
  const v = VIDEOS[r.name];
  return v && (v.id || v.file) ? v : null;
}
function searchURL(r) {
  const q = "NASA " + r.name.replace(/[()]/g, "") + " explained";
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
}
function videoFrame(v) {
  if (v.file) {
    const t = v.end ? `#t=${v.start || 0},${v.end}` : `#t=${v.start || 0}`;
    return `<div class="photo video">
      <video src="${encodeURI(v.file)}${t}" controls autoplay playsinline></video>
    </div>`;
  }
  const p = new URLSearchParams({ autoplay: 1, rel: 0, modestbranding: 1, start: v.start || 0 });
  if (v.end) p.set("end", v.end);
  return `<div class="photo video">
      <iframe src="https://www.youtube-nocookie.com/embed/${v.id}?${p}"
        title="${cur.name} video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
    <a class="ytlink" href="https://www.youtube.com/watch?v=${v.id}&t=${v.start || 0}s" target="_blank" rel="noopener">Open on YouTube ↗</a>`;
}

// شارة الحالة + الرقم الكبير أو مقارنة المخطط والحقيقي
function statHTML() {
  const ex = (typeof extras !== "undefined" && extras[cur.name]) || null;
  if (!ex) return "";
  let h = '<div class="stat">';
  if (ex.status) h += `<div class="chip ${ex.status}"><i></i>${ex.statusText}</div>`;
  if (ex.plan && ex.real) {
    const w = Math.max(6, Math.round(ex.plan.val / ex.real.val * 100));
    h += `<div class="bars">
      <div class="bar"><span>Planned</span><div class="track"><b style="width:${w}%"></b></div><em>${ex.plan.text}</em></div>
      <div class="bar real"><span>Actually</span><div class="track"><b style="width:100%"></b></div><em>${ex.real.text}</em></div>
    </div>`;
  } else if (ex.big) {
    h += `<div class="big"><strong>${ex.big.num}</strong><span>${ex.big.label}</span></div>`;
  }
  return h + "</div>";
}

const pagesOf = r => [...r.parts, "<b>Fun fact:</b> " + r.fact];
const learnHTML = () => `<p><a href="${linkOf(cur)}" target="_blank" rel="noopener">Learn more on NASA ↗</a></p>`;

// تحديث النص بس (من غير ما نعيد بناء الكارت) عشان الفيديو يفضل شغال
function updatePage() {
  speechSynthesis.cancel();
  const pages = pagesOf(cur);
  const last = page === pages.length - 1;
  document.getElementById("pText").innerHTML = pages[page];
  document.getElementById("learn").innerHTML = last ? learnHTML() : "";
  document.getElementById("pageNo").textContent = `${page + 1} / ${pages.length}`;
  document.getElementById("prev").disabled = page === 0;
  document.getElementById("next").disabled = last;
}

function render() {
  document.body.classList.toggle("vidOn", vid);
  card.classList.toggle("wide", vid);
  const pages = pagesOf(cur);
  const last = page === pages.length - 1;
  const clip = clipOf(cur);
  const watch = clip
    ? `<button class="act" id="watch">${vid ? "✕ Close video" : "▶ Watch a clip"}</button>`
    : `<a class="act" href="${searchURL(cur)}" target="_blank" rel="noopener">▶ Find videos</a>`;

  card.innerHTML = `
    <button class="x" id="closeBtn">✕</button>
    ${vid && clip ? videoFrame(clip) : photoHTML()}
    <div class="tag">${cur.tag}</div>
    <h2>${cur.name}</h2>
    ${statHTML()}
    <p id="pText">${pages[page]}</p>
    <div id="learn">${last ? learnHTML() : ""}</div>
    <div class="actions">
      <button class="act" id="say">${SPEAKER}${autoVoice ? "Stop" : "Listen to me"}</button>
      ${watch}
    </div>
    <div class="nav">
      <button id="prev" ${page === 0 ? "disabled" : ""}>◀ Back</button>
      <span id="pageNo">${page + 1} / ${pages.length}</span>
      <button id="next" ${last ? "disabled" : ""}>Next ▶</button>
    </div>`;

  document.getElementById("prev").onclick = () => { page--; speechSynthesis.cancel(); vid ? updatePage() : render(); narrate(); };
  document.getElementById("next").onclick = () => { page++; speechSynthesis.cancel(); vid ? updatePage() : render(); narrate(); };
  document.getElementById("closeBtn").onclick = closeCard;
  document.getElementById("say").onclick = () => {
    autoVoice = !autoVoice;
    if (autoVoice) narrate(); else speechSynthesis.cancel();
    render();
  };
  const po = document.getElementById("playOver");
  if (po) po.onclick = () => { speechSynthesis.cancel(); vid = true; render(); };
  const wb = document.getElementById("watch");
  if (wb) wb.onclick = () => { speechSynthesis.cancel(); vid = !vid; render(); };

  const n = (cur.imgs || []).length;
  const pl = document.getElementById("pl"), pr = document.getElementById("pr");
  if (pl) pl.onclick = () => { shot = (shot - 1 + n) % n; render(); };
  if (pr) pr.onclick = () => { shot = (shot + 1) % n; render(); };
}

/* ---------------- الكرة ---------------- */
const seen = new Set();   // عشان أنيميشن الظهور يشتغل مرة واحدة لكل أيقونة
const pinEls = new Map();  // اسم الجهاز -> عنصر الأيقونة
const silentAt = (name, y) => { if (!SHOW_TIMELINE) return false; const c = COMMS[name]; return !!c && c[1] < y; };
function paintSilence() {
  const y = +yearEl.value;
  pinEls.forEach((el, name) => el.classList.toggle("silent", !storyOn && silentAt(name, y)));
}

const globe = Globe()(globeEl)
  .backgroundColor("#05070f")
  .htmlLat("lat")
  .htmlLng("dLng")
  .htmlElement(d => {
    const el = document.createElement("div");
    el.className = "pin";
    pinEls.set(d.name, el);
    if (!storyOn && silentAt(d.name, +yearEl.value)) el.classList.add("silent");
    const num = (d.name.match(/\d+/) || [""])[0];
    const first = !seen.has(d.name);
    seen.add(d.name);
    el.innerHTML = `<span class="pinIcon s-${statusOf(d.name)}${first ? " appear" : ""}">${svgFor(d.name)}${num ? `<b class="badge">${num}</b>` : ""}</span><span class="pinName">${d.name}</span>`;
    el.style.pointerEvents = "auto";
    el.onclick = () => openCard(d);
    return el;
  });

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.4;

function resize() { globe.width(window.innerWidth).height(window.innerHeight); }
window.addEventListener("resize", resize);
resize();

/* ---------------- مفتاح الألوان ---------------- */
const legend = document.createElement("div");
legend.id = "legend";
legend.innerHTML = `
  <span><i class="rest"></i>Parked</span>
  <span><i class="quiet"></i>Went quiet</span>
  <span><i class="lost"></i>Lost contact</span>`;
document.body.appendChild(legend);

/* ---------------- الشريط الزمني ---------------- */
const timelineEl = document.createElement("div");
timelineEl.id = "timeline";
timelineEl.innerHTML = `
  <button id="playBtn" title="Play the story">▶</button>
  <input type="range" id="year" step="1" aria-label="Year">
  <strong id="yearLbl"></strong>`;
document.body.appendChild(timelineEl);

const yearEl = document.getElementById("year");
const yearLbl = document.getElementById("yearLbl");
const playBtn = document.getElementById("playBtn");
let allItems = [], timer = null;

function applyYear() {
  const y = +yearEl.value;
  yearLbl.textContent = y;
  globe.htmlElementsData(allItems.filter(d => d.year <= y && (!storyOn || storyVisible.has(d.name))));
  paintSilence();
  setTimeout(paintSilence, 80);
  if (cur && cur.year && cur.year > y) closeCard();
}

function setupTimeline() {
  const ys = allItems.map(d => d.year);
  yearEl.min = Math.min(...ys) - 1;
  yearEl.max = NOW;
  yearEl.value = yearEl.max;
  applyYear();
}

function stopPlay() {
  clearInterval(timer);
  timer = null;
  playBtn.textContent = "▶";
}

yearEl.oninput = () => { stopPlay(); applyYear(); };

playBtn.onclick = () => {
  if (timer) return stopPlay();
  seen.clear();
  yearEl.value = yearEl.min;
  applyYear();
  playBtn.textContent = "⏸";
  timer = setInterval(() => {
    if (+yearEl.value >= +yearEl.max) return stopPlay();
    yearEl.value = +yearEl.value + 1;
    applyYear();
  }, 400);
};

/* ---------------- التبويبات ---------------- */
function showWorld(world) {
  curWorld = world;
  stopPlay();
  seen.clear();
  Object.keys(tabs).forEach(k =>
    document.getElementById(tabs[k]).classList.toggle("active", k === world));
  closeCard();
  timelineEl.hidden = !SHOW_TIMELINE || (world === "space") || storyOn;

  if (world === "space") {
    globeEl.style.display = "none";
    spaceEl.hidden = false;
    spaceEl.innerHTML = "";
    rovers.filter(r => r.world === "space").forEach(r => {
      const b = document.createElement("div");
      b.className = "spaceCard";
      b.innerHTML = `<div class="ring s-${statusOf(r.name)}">${svgFor(r.name)}</div><b>${r.name}</b>`;
      b.onclick = () => openCard(r, false);
      spaceEl.appendChild(b);
    });
    return;
  }

  spaceEl.hidden = true;
  globeEl.style.display = "block";

  const items = rovers.filter(r => r.world === world).map(r => ({
    ...r,
    year: +r.tag.match(/\d{4}/)[0],
    dLng: (world === "moon" && MOON_0_TO_360) ? (((r.lng % 360) + 360) % 360) - 180 : r.lng
  }));
  allItems = items;

  globe.globeImageUrl(files[world])
       .showAtmosphere(world === "mars")
       .atmosphereColor("#ff7a45");
  tryLoad(files[world]).then(ok => {
    if (!ok) {
      showProblem(`Map image "${files[world]}" was not found next to index.html.`);
      globe.globeMaterial().color.set(world === "moon" ? "#8d8d8d" : "#b0563a");
    }
  });
  setupTimeline();
  globe.controls().autoRotate = true;
  globe.pointOfView({ lat: 10, lng: items[0].dLng, altitude: 2.4 }, 1000);
}

/* =====================================================================
   Story mode: جولة بالترتيب الزمني على 3 فصول
   كل سطر: [اسم الجهاز بالظبط زي ما في rovers, جملة الربط]
   ===================================================================== */
const STORY = [
  { title: "Race to the Moon", world: "moon",
    intro: "1966. Nobody knows if the Moon's dust can hold a spacecraft. So robots go first.",
    beats: [
      ["Surveyor 1", "June 1966: a robot makes a soft landing and sends home photos. The ground is solid."],
      ["Surveyor 3", "April 1967: a second robot digs a trench with its scoop to test the soil."],
      ["Apollo 11 Eagle", "July 1969: time for people. Two astronauts land while Michael Collins waits in orbit."],
      ["Apollo 14 science station (ALSEP)", "1971: instruments stay behind and keep listening for moonquakes."],
      ["Moon Buggy (Apollo 15)", "July 1971: wheels arrive. Astronauts can finally drive far from their lander."],
      ["Moon Buggy (Apollo 16)", "April 1972: a buggy climbs into the old mountains of the Descartes Highlands."],
      ["Moon Buggy (Apollo 17)", "December 1972: the last time humans walked on the Moon. This buggy was parked for good."]
    ] },
  { title: "Robots take over Mars", world: "mars",
    intro: "Mars is far away, and landing there is hard. These machines made it.",
    beats: [
      ["Viking 1", "July 1976: the first US lander to work on Mars takes color photos and tests the soil for life."],
      ["Viking 2", "September 1976: its twin lands on the cold northern plains."],
      ["Sojourner", "July 1997: a rover the size of a microwave oven drives on Mars for the first time."],
      ["Spirit", "January 2004: twin rovers land on opposite sides of Mars. Spirit goes first."],
      ["Opportunity", "Its twin was built for 90 days. It keeps rolling for almost 15 years."],
      ["Phoenix", "2008: at the north pole, a robot arm digs up water ice."],
      ["InSight", "2018: a lander sits still and listens to marsquakes."],
      ["Ingenuity", "2021: the first aircraft to fly on another planet lifts off."]
    ] },
  { title: "Still out there", world: "space",
    intro: "Some machines never land at all. They just keep going.",
    beats: [
      ["Pioneer 10", "Launched in 1972, it becomes the first spacecraft to fly past Jupiter."],
      ["Pioneer 11", "Launched in 1973, it follows to Jupiter, then becomes the first to fly past Saturn in 1979."],
      ["NEAR Shoemaker", "February 2001: a probe lands on an asteroid it was never built to land on."],
      ["Dawn", "2007: a probe sets out to visit two worlds in the asteroid belt."],
      ["Kepler", "2009: a telescope starts counting planets around other stars."]
    ] }
];

const steps = [];
STORY.forEach((c, ci) => {
  steps.push({ type: "chapter", ci, world: c.world, text: c.intro });
  c.beats.forEach(([name, text]) => steps.push({ type: "machine", ci, name, world: c.world, text }));
});
steps.push({ type: "end" });

const storyEl = document.createElement("div");
storyEl.id = "story";
storyEl.hidden = true;
storyEl.innerHTML = `
  <div class="sTop"><span id="sChap"></span><button id="sExit">✕ Exit</button></div>
  <p id="sText"></p>
  <div id="sEnd" hidden>
    <button id="sReplay" class="primary">Replay the story</button>
  </div>
  <div class="sNav">
    <button id="sPrev">◀ Back</button>
    <div class="sBar"><b id="sFill"></b></div>
    <button id="sNext">Next ▶</button>
  </div>`;
document.body.appendChild(storyEl);

let si = 0;
const itemFor = n => allItems.find(d => d.name === n) || rovers.find(r => r.name === n);

function goStep(i) {
  si = Math.max(0, Math.min(steps.length - 1, i));
  const s = steps[si];
  storyOn = true;
  document.body.classList.add("storyMode");
  storyEl.hidden = false;
  stopPlay();

  document.getElementById("sPrev").disabled = si === 0;
  document.getElementById("sNext").hidden = s.type === "end";
  document.getElementById("sEnd").hidden = s.type !== "end";
  document.getElementById("sFill").style.width = (si / (steps.length - 1) * 100) + "%";

  if (s.type === "end") {
    document.getElementById("sChap").textContent = "The end of the tour";
    document.getElementById("sText").textContent =
      "That was the tour. Most of these machines went silent long ago, but the science they sent home is still with us.";
    closeCard();
    return;
  }

  document.getElementById("sChap").textContent =
    `Chapter ${s.ci + 1} of ${STORY.length}: ${STORY[s.ci].title}`;
  document.getElementById("sText").textContent = s.text;

  if (s.type === "chapter") {
    storyVisible.clear();
    showWorld(s.world);
    return;
  }

  // machine: الأيقونات بتظهر واحدة ورا التانية لحد الجهاز الحالي
  storyVisible.clear();
  steps.forEach((t, j) => {
    if (j <= si && t.type === "machine" && t.ci === s.ci) storyVisible.add(t.name);
  });
  if (curWorld !== s.world) showWorld(s.world);
  if (s.world !== "space") applyYear();
  openCard(itemFor(s.name), true);
}

function exitStory() {
  if (!storyOn) return;
  storyOn = false;
  storyVisible.clear();
  storyEl.hidden = true;
  document.body.classList.remove("storyMode");
}

document.getElementById("sPrev").onclick = () => goStep(si - 1);
document.getElementById("sNext").onclick = () => goStep(si + 1);
document.getElementById("sExit").onclick = () => { exitStory(); showWorld(curWorld); };
document.getElementById("sReplay").onclick = () => goStep(0);
document.addEventListener("keydown", e => {
  if (!storyOn) return;
  if (e.key === "ArrowRight") goStep(si + 1);
  if (e.key === "ArrowLeft") goStep(si - 1);
});

// زرار في الهيدر
const storyBtn = document.createElement("button");
storyBtn.id = "storyBtn";
storyBtn.textContent = "Follow the story";
storyBtn.onclick = () => goStep(0);
const tabsEl = document.querySelector(".tabs") || document.querySelector("header");
tabsEl.prepend(storyBtn);

// شاشة الافتتاح
const introEl = document.createElement("div");
introEl.id = "intro";
introEl.innerHTML = `
  <div class="introBox">
    <h2>The machines we left behind are still out there.</h2>
    <p>On the Moon, on Mars, and drifting in deep space. Most of them stopped talking long ago. Each one has a story.</p>
    <div class="introBtns">
      <button id="iStart" class="primary">Follow their story</button>
    </div>
  </div>`;
document.body.appendChild(introEl);
document.getElementById("iStart").onclick = () => { introEl.hidden = true; goStep(0); };

/* ---------------- ربط التبويبات ---------------- */
document.getElementById("moonBtn").onclick = () => { exitStory(); showWorld("moon"); };
document.getElementById("marsBtn").onclick = () => { exitStory(); showWorld("mars"); };
document.getElementById("spaceBtn").onclick = () => { exitStory(); showWorld("space"); };
showWorld("moon");