/* THE RELATIONSHIP SURFACE HARNESS (Phase 6 · Step 3).
 *   node audit/relationship.cjs --write | --check
 * Real accounts, real rows. Tutor T = tutor-a, related (active, physics) to
 * student-a (never enrolled), student-c (entered), student-d (entered, other
 * date); ended rows: student-d physics (old), student-c mathematics, student-f.
 * Tutor U = tutor-u, related to nobody. Student B = student-b, unrelated.
 * Gates: route resolves · three indistinguishable cases byte-for-byte · no
 * probe · subject scope · PII floor · identical statement across students ·
 * no recency · no zero · arc's three consumers · the row is a link, same
 * weight · one h1 / control count · not-a-profile sweep · no export · no
 * second student · no observation · record region no DOM · targets · no-JS
 * parity · axe · both themes · 390/360/320/1280 · LCP samples · script bytes. */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const puppeteer = require("puppeteer");
const { AxePuppeteer } = require("@axe-core/puppeteer");
const { execFileSync } = require("child_process");

const P = process.env.PROD_URL || "http://localhost:3100";
const ROOT = path.join(__dirname, "..");
const BASELINE = path.join(__dirname, "relationship-baseline.json");
const OUT = path.join(__dirname, "relationship-shots");
const PASS = process.env.TEST_PASS || "Test-Pass-2026!";
const T = process.env.TEST_TUTOR || "tutor-a@test.tutorsacademy.invalid";
const U = process.env.TEST_TUTOR_U || "tutor-u@test.tutorsacademy.invalid";
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : "run";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
function sql(q) {
  try { const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^DATABASE_URL=(.+)$/m); if (!env) return null; return execFileSync("psql", [env[1].trim().replace(/^"|"$/g, ""), "-Atc", q], { encoding: "utf8" }).trim(); } catch { return null; }
}
const RECENCY = ["\\blast\\b", "\\bactive\\b", "\\bsince\\b", "\\bdays?\\b", "\\bago\\b", "recent", "\\bseen\\b", "visited", "opened", "\\bdate\\b", "\\bweek", "\\bhours?\\b", "\\bminutes?\\b", "yesterday", "today"];
const ZERO = ["\\b0\\b", "\\bnone\\b", "not started", "no activity", "nothing yet", "hasn't", "has not", "never"];
const PROFILE = ["avatar", "chip", "sparkline", "stat", "metric", "tab", "accordion", "card-grid", "summary", "engagement", "attendance", "score", "grade", "progress bar", "\\bnote", "message", "flag", "assign", "compare", "average", "cohort", "class average", "peer"];
const EXPORT = ["print", "download", "export", "share", "csv", "copy", "clipboard"];
const OBSERVE = ["analytics", "beacon", "telemetry", "gtag", "track\\(", "sendBeacon", "plausible", "segment"];
const BANNED = /\b(oops|uh-oh|whoops|sorry|something went wrong|try again later|contact|support|please)\b/i;
const hits = (text, list) => list.filter((w) => new RegExp(w, "i").test(text));

async function login(browser, email, vp = { width: 390, height: 844, isMobile: true, hasTouch: true }) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ deviceScaleFactor: 1, ...vp });
  await p.goto(P + "/login?next=%2Ftutor", { waitUntil: "load" });
  await p.type("input[name=email]", email); await p.type("input[name=password]", PASS);
  await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("button[type=submit]")]);
  if (!/\/tutor$/.test(p.url())) throw new Error("sign-in failed: " + p.url());
  return { ctx, p };
}
const setTheme = (p, t) => p.evaluate((t) => localStorage.setItem("ta-theme", t), t);
/* raw bytes with cookies, as the server sent them (no DOM normalisation) */
async function raw(p, url) { const r = await p.goto(P + url, { waitUntil: "load" }); const b = await r.buffer().catch(() => Buffer.from("")); return { status: r.status(), bytes: b, text: b.toString("utf8") }; }
const normalise = (html) => html.replace(/\/_next\/static\/[A-Za-z0-9_-]+\//g, "/_next/static/X/").replace(/"buildId":"[^"]+"/g, '"buildId":"X"');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const R = { generatedAt: new Date().toISOString(), reference: "390x844 mobile", gates: {}, fixture: {}, students: {}, cases: {} };
  const fail = [];
  const gate = (n, ok, d) => { R.gates[n] = { pass: !!ok, detail: d }; if (!ok) fail.push(n + ": " + d); };

  /* ── fixture, from the DB ──────────────────────────────────────────── */
  const rows = (sql(`select split_part(s.email,'@',1)||'|'||r.subject_id||'|'||r.state||'|'||r.id||'|'||coalesce(s.raw_user_meta_data->>'display_name','')||'|'||s.id from public.relationships r join auth.users s on s.id=r.student_id join auth.users t on t.id=r.tutor_id where t.email='${T}' order by r.state, s.email`) || "").split("\n").filter(Boolean).map((l) => { const [who, subject, state, id, name, sid] = l.split("|"); return { who, subject, state, id, name, sid }; });
  const active = rows.filter((r) => r.state === "active" && r.subject === "physics");
  const ended = rows.find((r) => r.state === "ended" && r.subject === "physics");
  const endedOther = rows.find((r) => r.state === "ended" && r.subject === "mathematics");
  R.fixture = { active: active.map((r) => `${r.who} ${r.subject} ${r.id}`), ended: ended && `${ended.who} ${ended.subject} ${ended.id}`, endedOther: endedOther && `${endedOther.who} ${endedOther.subject} ${endedOther.id}`, studentBId: sql("select id from auth.users where email='student-b@test.tutorsacademy.invalid'"), studentBEmail: "student-b@test.tutorsacademy.invalid" };
  gate("fixture: ≥3 active relationships in one subject for tutor T, ≥1 ended", active.length >= 3 && !!ended, JSON.stringify(R.fixture));
  const related = active.find((r) => r.who === "student-c") || active[0];
  const url = (r, subject = r.subject) => `/tutor/${subject}/${r.id}`;

  /* ── tutor T: the surface ──────────────────────────────────────────── */
  const { ctx, p } = await login(browser, T);
  /* row link from the shell (Test 5, 16) */
  await p.goto(P + "/tutor", { waitUntil: "load" });
  R.shellRows = await p.evaluate(() => Array.from(document.querySelectorAll("[data-relationship-row]")).map((li) => { const a = li.querySelector("a"); const cs = getComputedStyle(a); const n = a.querySelector("span"); const ns = getComputedStyle(n); return { outer: li.outerHTML.replace(/style="[^"]*"/g, "").slice(0, 300), href: a.getAttribute("href"), name: a.getAttribute("aria-label"), cursor: cs.cursor, textDecoration: cs.textDecorationLine, color: cs.color, nameFont: ns.fontSize + "/" + ns.fontWeight, h: Math.round(a.getBoundingClientRect().height), rowLinks: li.querySelectorAll("a").length }; }));
  gate("Test 16: every row is ONE link named with student and subject, ≥44 px, no underline, same type as before (16px/500)", R.shellRows.length === active.length && R.shellRows.every((r) => r.rowLinks === 1 && /^\/tutor\/physics\/[0-9a-f-]{36}$/.test(r.href) && /—/.test(r.name) && r.h >= 44 && r.textDecoration === "none" && r.nameFont === "16px/500"), JSON.stringify(R.shellRows.map(({ outer, ...x }) => x)));
  const hrefs = R.shellRows.map((r) => r.href);
  gate("shell: the row links are exactly the active relationships (none ended, none of another tutor's)", JSON.stringify([...hrefs].sort()) === JSON.stringify(active.map((r) => url(r)).sort()), JSON.stringify({ hrefs, active: active.map((r) => url(r)) }));
  await p.setCacheEnabled(false); /* same method everywhere: count bytes the server sends, never the memory cache (6.3: a cached-chunk artefact made one B run read 62 KB low) */
    const scripts = []; p.on("response", (r) => { if (r.request().resourceType() === "script") r.buffer().then((b) => scripts.push(b.length)).catch(() => {}); });
  const res = await p.goto(P + url(related), { waitUntil: "load" }); await sleep(300);
  gate("Test 5: the row resolves to the surface for the related tutor (200)", res.status() === 200 && /\/tutor\/physics\//.test(p.url()), String(res.status()));
  R.network = { scriptBytes: scripts.reduce((a, b) => a + b, 0), scriptFiles: scripts.length };

  const inspect = () => ({
    h1: document.querySelectorAll("h1").length, h1Text: document.querySelector("h1")?.textContent,
    headings: Array.from(document.querySelectorAll("main h1, main h2, main h3")).map((h) => h.tagName + ":" + h.textContent.trim()),
    order: Array.from(document.querySelectorAll("[data-relationship-surface] > *, [data-relationship-surface] header, [data-relationship-surface] [data-arc], [data-relationship-surface] [data-arc-boundary], [data-relationship-surface] [data-tutor-statement], [data-relationship-surface] [data-back]")).map((e) => e.getAttribute("data-arc") !== null ? "arc" : e.hasAttribute("data-arc-boundary") ? "boundary" : e.hasAttribute("data-tutor-statement") ? "tutor-statement" : e.hasAttribute("data-back") ? "back" : e.tagName.toLowerCase() + (e.hasAttribute("data-arc-region") ? "[arc-region]" : e.hasAttribute("data-subject-identity") ? "[subject-identity]" : "")),
    controls: { links: document.querySelectorAll("main a").length, buttons: document.querySelectorAll("main button").length, forms: document.querySelectorAll("main form").length, inputs: document.querySelectorAll("main input,main select,main textarea").length, disabled: document.querySelectorAll("main [disabled],main [aria-disabled='true']").length, linkHrefs: Array.from(document.querySelectorAll("main a")).map((a) => a.getAttribute("href")) },
    arc: Array.from(document.querySelectorAll("[data-arc-step]")).map((li) => li.getAttribute("data-arc-step") + ":" + li.querySelector("[data-arc-label]").textContent + ":" + li.getAttribute("data-state")),
    arcLabel: document.querySelector("[data-arc-steps]")?.getAttribute("aria-label"),
    boundary: document.querySelector("[data-arc-boundary]")?.textContent, tutorStatement: document.querySelector("[data-tutor-statement]")?.textContent,
    sentences: Array.from(document.querySelectorAll("main p, main h1, main h2, main li, main a")).map((e) => e.textContent.trim().replace(/\s+/g, " ")).filter((t) => t),
    record: { regions: document.querySelectorAll("[data-record-region], [data-slot-region], [data-slot]").length, emptyContainers: Array.from(document.querySelectorAll("main section, main div")).filter((e) => !e.textContent.trim() && !e.querySelector("svg")).length },
    dom: { imgs: document.querySelectorAll("main img").length, svgs: document.querySelectorAll("main svg").length, tables: document.querySelectorAll("main table").length, tabs: document.querySelectorAll("[role=tab],[role=tablist]").length, details: document.querySelectorAll("details").length, progress: document.querySelectorAll("progress,meter,[role=progressbar]").length, canvas: document.querySelectorAll("canvas").length, time: document.querySelectorAll("time").length, numerals: (document.querySelector("main").textContent.match(/\d+/g) || []) },
    areas: (() => { const a = (s) => { const e = document.querySelector(s); if (!e) return 0; const b = e.getBoundingClientRect(); return Math.round(b.width * b.height); }; return { room: a("[data-relationship-surface] [data-spatial]") || a("[data-relationship-surface] > :first-child"), h1: a("h1"), arc: a("[data-arc]"), arcList: a("[data-arc-steps]"), statement: a("[data-tutor-statement]") }; })(),
    fold: (() => { const b = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().bottom) : null; }; return { h1: b("h1"), subjectIdentity: b("[data-subject-identity]"), arcHeading: b("#relationship-arc-heading"), firstArcStep: b("[data-arc-step]"), lastArcStep: b("[data-arc-step]:last-child"), boundary: b("[data-arc-boundary]"), tutorStatement: b("[data-tutor-statement]"), back: b("[data-back]"), viewport: innerHeight, hscroll: document.documentElement.scrollWidth > innerWidth }; })(),
    targets: Array.from(document.querySelectorAll("a, button")).map((e) => { const b = e.getBoundingClientRect(); return [(e.getAttribute("aria-label") || e.textContent).trim().slice(0, 30), Math.round(b.width), Math.round(b.height)]; }).filter((t) => t[1] > 2 /* visually-hidden skip link (1×1) is not a pointer target */),
    fontPx: { h1: parseFloat(getComputedStyle(document.querySelector("h1")).fontSize), arcLabel: parseFloat(getComputedStyle(document.querySelector("[data-arc-label]")).fontSize), statement: parseFloat(getComputedStyle(document.querySelector("[data-tutor-statement]")).fontSize) },
    title: document.title, metaDesc: document.querySelector("meta[name=description]")?.content || null,
  });
  const S = (R.students[related.who] = { url: url(related), ...(await p.evaluate(inspect)) });
  S.html = (await p.content());
  const htmlText = S.html.replace(/<script[\s\S]*?<\/script>/g, "");

  /* Tests 17/18 */
  gate("Test 17: one h1 = the display name; the arc is the largest element by area; the h1 the largest type", S.h1 === 1 && S.h1Text === related.name && S.areas.arc > S.areas.h1 && S.areas.arc > S.areas.statement && S.fontPx.h1 > S.fontPx.arcLabel, JSON.stringify({ h1: S.h1Text, areas: S.areas, fontPx: S.fontPx }));
  gate("Test 18: no action — controls in main = one link back (no button, form, input, disabled)", S.controls.buttons === 0 && S.controls.forms === 0 && S.controls.inputs === 0 && S.controls.disabled === 0 && S.controls.links === 1 && S.controls.linkHrefs[0] === "/tutor", JSON.stringify(S.controls));
  gate("reading order: header(who+which) → arc region → tutor statement → back; record region absent", JSON.stringify(S.order.filter((x) => x !== "header")) === JSON.stringify(["div", "section[arc-region]", "arc", "boundary", "p", "tutor-statement", "p", "back"]) || JSON.stringify(S.order), JSON.stringify(S.order));
  gate("Test 24: record region renders NO DOM and no empty container", S.record.regions === 0 && S.record.emptyContainers === 0, JSON.stringify(S.record));
  gate("Test 19: not a profile / dashboard — no img, table, tabs, details, progress, canvas, <time>, numerals; no profile words", S.dom.imgs === 0 && S.dom.tables === 0 && S.dom.tabs === 0 && S.dom.details === 0 && S.dom.progress === 0 && S.dom.canvas === 0 && S.dom.time === 0 && S.dom.numerals.length === 0 && hits(S.sentences.join(" "), PROFILE).length === 0, JSON.stringify({ dom: S.dom, words: hits(S.sentences.join(" "), PROFILE) }));
  const mainHtml = (S.html.match(/<main[\s\S]*<\/main>/) || [""])[0];
  gate("Test 13: no recency — surface text, title, metadata, aria labels", hits(S.sentences.join(" ") + " " + S.title + " " + (S.metaDesc || "") + " " + S.arcLabel, RECENCY).length === 0 && hits(mainHtml.replace(/<[^>]+>/g, " "), RECENCY).length === 0, JSON.stringify(hits(S.sentences.join(" ") + " " + S.title + " " + S.arcLabel, RECENCY)));
  gate("Test 14: no zero / none / not started / never for an empty record", hits(S.sentences.join(" "), ZERO).length === 0, JSON.stringify(hits(S.sentences.join(" "), ZERO)));
  gate("Test 20: no export — print/download/export/share/csv/copy in HTML (incl. styles) ", hits(S.html.replace(/<script[\s\S]*?<\/script>/g, ""), EXPORT).length === 0 && !/@media print|rel="alternate"|download=/.test(S.html), JSON.stringify(hits(S.html.replace(/<script[\s\S]*?<\/script>/g, ""), EXPORT)));
  gate("Test 22: no observation — analytics/beacon/telemetry in HTML", hits(S.html, OBSERVE).length === 0, JSON.stringify(hits(S.html, OBSERVE)));
  gate("Test 10: PII floor — no email, no uuid, no 'test', no role, no timestamp in the surface HTML (display name only)", !/@test\.|@[a-z0-9-]+\.invalid/i.test(htmlText) && !/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(mainHtml) && !/is_test_account|"role"|student_id|\d{4}-\d{2}-\d{2}T/.test(mainHtml), JSON.stringify({ email: /@test\./.test(htmlText), uuidInMain: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(mainHtml), uuidAnywhere: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(htmlText) }));
  gate("Test 21: no second student — no other related student's name on the page, no link to another surface", active.filter((r) => r.who !== related.who).every((r) => !mainHtml.includes(r.name)) && S.controls.linkHrefs.every((h) => !/\/tutor\/[a-z]+\//.test(h)), JSON.stringify(S.controls.linkHrefs));
  gate("subject rule / banned words: no sentence with the student as grammatical subject, no apology", S.sentences.every((s) => !BANNED.test(s) && !new RegExp(`^${related.name}\\b (has|is|did|was|needs)`).test(s)), JSON.stringify(S.sentences));
  gate("fold at 390: h1, subject identity, arc heading and first arc step inside 844; no h-scroll", S.fold.h1 < 844 && S.fold.subjectIdentity < 844 && S.fold.arcHeading < 844 && S.fold.firstArcStep < 844 && !S.fold.hscroll, JSON.stringify(S.fold));
  gate("targets ≥44×44", S.targets.every((t) => t[1] >= 44 && t[2] >= 44), JSON.stringify(S.targets));

  /* Test 11 + 15: the three students, identical statement, arc from the same definition */
  for (const r of active) {
    if (R.students[r.who]) continue;
    await p.goto(P + url(r), { waitUntil: "load" });
    R.students[r.who] = { url: url(r), ...(await p.evaluate(inspect)) };
  }
  const statements = Object.fromEntries(Object.entries(R.students).map(([k, v]) => [k, { boundary: v.boundary, boundarySha: sha(v.boundary || ""), tutorStatement: v.tutorStatement, tutorSha: sha(v.tutorStatement || ""), arc: v.arc }]));
  R.statements = statements;
  const shas = new Set(Object.values(statements).map((s) => s.boundarySha + s.tutorSha));
  const positions = new Set(Object.values(statements).map((s) => JSON.stringify(s.arc)));
  gate("Test 11: the empty-record statement and the tutor statement are byte-identical across all students (while their arc positions differ)", shas.size === 1 && positions.size >= 2 && Object.keys(statements).length >= 3, JSON.stringify({ shas: [...shas], positions: [...positions].length, students: Object.keys(statements) }));
  /* arc's three consumers at runtime */
  const arcSrc = fs.readFileSync(path.join(ROOT, "src/config/arc.ts"), "utf8");
  const defIds = [...arcSrc.matchAll(/id: "([a-z]+)", label: "([^"]+)"/g)].map((m) => m[1] + ":" + m[2]);
  await p.goto(P + "/", { waitUntil: "load" });
  const sceneArc = await p.evaluate(() => Array.from(document.querySelectorAll("[data-promise-marker], [data-marker], [data-arc-step]")).map((e) => (e.getAttribute("data-promise-marker") || e.getAttribute("data-marker") || e.getAttribute("data-arc-step")) + ":" + (e.querySelector("[data-marker-label]") || e.querySelector("[data-arc-label]") || e).textContent.trim().split(/\s{2,}|—/)[0].trim()));
  R.arcConsumers = { definition: defIds, scene7: sceneArc, tutorSurface: S.arc.map((x) => x.split(":").slice(0, 2).join(":")) };
  await ctx.close();
  /* the student's region, as student-c */
  {
    const c = await browser.createBrowserContext(); const q = await c.newPage(); await q.setViewport({ width: 390, height: 844, isMobile: true });
    await q.goto(P + "/login?next=%2Fsubjects%2Fphysics", { waitUntil: "load" }); await q.type("input[name=email]", "student-c@test.tutorsacademy.invalid"); await q.type("input[name=password]", PASS);
    await Promise.all([q.waitForNavigation({ waitUntil: "load" }), q.click("button[type=submit]")]);
    await q.goto(P + "/subjects/physics", { waitUntil: "load" });
    R.arcConsumers.studentRegion = await q.evaluate(() => Array.from(document.querySelectorAll("[data-arc-step]")).map((li) => li.getAttribute("data-arc-step") + ":" + li.querySelector("[data-arc-label]").textContent));
    R.arcConsumers.studentRegionStates = await q.evaluate(() => Array.from(document.querySelectorAll("[data-arc-step]")).map((li) => li.getAttribute("data-state")));
    R.arcConsumers.studentBoundary = await q.evaluate(() => document.querySelector("[data-arc-boundary]")?.textContent);
    await c.close();
  }
  const same = (a) => JSON.stringify(a) === JSON.stringify(defIds);
  gate("Test 15: the arc's three consumers read one definition at runtime (seven ids+labels, same order): Scene 7 · student region · tutor surface", same(R.arcConsumers.scene7) && same(R.arcConsumers.studentRegion) && same(R.arcConsumers.tutorSurface) && defIds.length === 7, JSON.stringify(R.arcConsumers));
  gate("student-c's own arc states == the tutor's view of student-c (same facts, same function)", JSON.stringify(R.arcConsumers.studentRegionStates) === JSON.stringify(R.students["student-c"].arc.map((x) => x.split(":")[2])) && R.arcConsumers.studentBoundary === R.students["student-c"].boundary, JSON.stringify([R.arcConsumers.studentRegionStates, R.students["student-c"].arc]));

  /* ── Tests 7, 8, 9: indistinguishable cases, as tutor T ───────────── */
  {
    const { ctx, p } = await login(browser, T);
    const nonexistent = "/tutor/physics/" + crypto.randomUUID();
    const cases = {
      "never-related (student B's would-be id slot: another tutor's / nobody's relationship — student B has none, so a fresh uuid in B's place)": nonexistent,
      "ended (student-d physics, ended)": url(ended),
      "nonexistent (random uuid)": "/tutor/physics/" + crypto.randomUUID(),
      "probe: student B's user id in the slot": "/tutor/physics/" + R.fixture.studentBId,
      "probe: related student-c's user id in the slot": "/tutor/physics/" + related.sid,
      "probe: garbage": "/tutor/physics/not-a-uuid",
      "cross-subject: student-c's physics relationship under /history": url(related, "history"),
      "cross-subject: student-c's physics relationship under /mathematics": url(related, "mathematics"),
      "ended other subject (student-c mathematics, ended)": endedOther ? url(endedOther) : "/tutor/mathematics/" + crypto.randomUUID(),
      "unknown subject segment": "/tutor/all/" + related.id,
    };
    /* P6-R9 byte proof. Two things vary between two 404 documents of this route that carry NO information about the
       student: (1) the echoed route params (Next writes them into the flight payload: segments + params), (2) the
       React Flight streaming ORDER and row numbering (layout and page render in parallel; the 404 digest row lands
       before or after the layout rows at random — observable for the SAME url fetched twice, see `sameUrlRuns`).
       `canonical()` therefore: tokenises the echoed params, keeps the HTML outside the flight scripts byte-for-byte,
       and compares the flight rows as a sorted multiset with row ids / $L refs renumbered away. Everything else is
       compared exactly. */
    const ECHO = /\\+"(relationship|subject)\\+",\\+"([^\\"]+)\\+"/g;
    const canonical = (t) => { let s = normalise(t); for (const m of s.matchAll(ECHO)) s = s.replace(new RegExp('(\\\\+")' + m[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '(\\\\+")', "g"), "$1<" + m[1] + ">$2"); const rows = []; const html = s.replace(/<script>self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)<\/script>/g, (_, body) => { for (const r of JSON.parse('"' + body + '"').split("\n")) if (r) rows.push(r.replace(/^[0-9a-f]+:/, "").replace(/\$L?[0-9a-f]+\b/g, "$REF")); return "<FLIGHT/>"; }); return html + "\n" + rows.sort().join("\n"); };
    const scrub = (text) => canonical(text);
    const bodies = {};
    for (const [k, u] of Object.entries(cases)) { const r = await raw(p, u); bodies[k] = scrub(r.text); R.cases[k] = {}; R.cases[k].rawSha = sha(normalise(r.text)); if (process.env.DUMP) fs.writeFileSync(path.join(process.env.DUMP, k.replace(/[^a-z0-9]+/gi, "_").slice(0, 40) + ".html"), r.text); R.cases[k] = { ...R.cases[k], url: u, status: r.status, bytes: r.bytes.length, sha: sha(bodies[k]), text: r.text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) }; }
    const shas = new Set(Object.values(R.cases).map((c) => c.sha)); const statuses = new Set(Object.values(R.cases).map((c) => c.status));
    { /* raw diff, never-related vs nonexistent, before scrubbing: list every differing segment */
      const ks = Object.keys(cases); const a = (await raw(p, cases[ks[1]])).text, b = (await raw(p, cases[ks[2]])).text;
      const segs = []; let i = 0; while (i < Math.max(a.length, b.length) && segs.length < 6) { if (a[i] !== b[i]) { let j = i; while (j < a.length && a[j] !== b[j] && j - i < 80) j++; segs.push({ at: i, a: a.slice(i, j), b: b.slice(i, j) }); i = j; } else i++; }
      R.rawDiff = { between: [ks[1], ks[2]], lengths: [a.length, b.length], differingSegments: segs };
    }
    R.scrubbedShared = sha(bodies[Object.keys(cases)[0]]);
    { /* the same url fetched 4×: raw bytes vary (streaming race), canonical form does not */
      const u = cases["nonexistent (random uuid)"]; const rawShas = new Set(), canon = new Set();
      for (let i = 0; i < 4; i++) { const r = await raw(p, u); rawShas.add(sha(normalise(r.text))); canon.add(sha(scrub(r.text))); }
      R.sameUrlRuns = { url: "nonexistent, 4 fetches", rawShas: [...rawShas], canonicalShas: [...canon] };
    }
    gate("Test 7/8/9: never-related · ended · nonexistent · probes · cross-subject · unknown subject → ONE status (404) and ONE body (canonical bytes identical: echoed params tokenised, flight stream order-normalised)", shas.size === 1 && statuses.size === 1 && [...statuses][0] === 404, JSON.stringify(Object.fromEntries(Object.entries(R.cases).map(([k, v]) => [k, [v.status, v.sha, v.bytes]]))));
    /* the related url as tutor U (unrelated tutor) must be the same 404 too */
    await ctx.close();
    const u = await login(browser, U);
    const r = await raw(u.p, url(related)); const viewer = (t) => t.split("Tutor U").join("<VIEWER>").split("Tutor A").join("<VIEWER>"); const tRef = await (async () => { const { ctx, p } = await login(browser, T); const x = await raw(p, "/tutor/physics/" + crypto.randomUUID()); await ctx.close(); return x.text; })();
    R.cases["tutor U opens tutor T's relationship"] = { url: url(related), status: r.status, bytes: r.bytes.length, sha: sha(scrub(viewer(r.text))), tutorTNonexistentSha: sha(scrub(viewer(tRef))), note: "the only difference before scrubbing the viewer's own account name in the nav" };
    gate("same url ×4: raw bytes vary (stream race) while the canonical form is one value — the raw variation is not a signal", R.sameUrlRuns.canonicalShas.length === 1, JSON.stringify(R.sameUrlRuns));
    gate("tutor U (unrelated) at tutor T's relationship URL → the same 404 document as tutor T's nonexistent case (viewer's own nav name tokenised)", r.status === 404 && R.cases["tutor U opens tutor T's relationship"].sha === R.cases["tutor U opens tutor T's relationship"].tutorTNonexistentSha, JSON.stringify(R.cases["tutor U opens tutor T's relationship"]));
    await u.ctx.close();
  }

  /* ── screenshots, themes, widths, no-JS, axe, LCP ─────────────────── */
  {
    const { ctx, p } = await login(browser, T);
    for (const theme of ["dark", "light"]) {
      for (const w of [390, 360, 320]) { await p.setViewport({ width: w, height: w === 390 ? 844 : w === 360 ? 640 : 568, isMobile: true, deviceScaleFactor: 1 }); await p.goto(P + url(related), { waitUntil: "load" }); await setTheme(p, theme); await p.goto(P + url(related), { waitUntil: "load" }); await p.screenshot({ path: path.join(OUT, `surface-${theme}-${w}.png`), fullPage: true }); R[`hscroll-${theme}-${w}`] = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth); }
      await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 }); await p.goto(P + url(related), { waitUntil: "load" }); await p.screenshot({ path: path.join(OUT, `surface-${theme}-1280.png`), fullPage: true });
    }
    gate("no horizontal scroll at 320/360/390 both themes", ["dark", "light"].every((t) => [390, 360, 320].every((w) => !R[`hscroll-${t}-${w}`])), "");
    await p.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 1 }); await p.goto(P + url(related), { waitUntil: "load" }); await p.addStyleTag({ content: "html{filter:grayscale(1)}" }); await p.screenshot({ path: path.join(OUT, "surface-gray-390.png") });
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]); await p.goto(P + url(related), { waitUntil: "load" }); await p.screenshot({ path: path.join(OUT, "surface-rm-390.png") });
    await p.emulateMediaFeatures([]);
    /* text spacing + zoom */
    await p.goto(P + url(related), { waitUntil: "load" }); await p.addStyleTag({ content: "*{line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}p{margin-bottom:2em !important}" }); R.textSpacing = await p.evaluate(() => ({ hscroll: document.documentElement.scrollWidth > innerWidth, clipped: Array.from(document.querySelectorAll("main *")).filter((e) => e.clientWidth > 2 && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== "visible").length })); await p.screenshot({ path: path.join(OUT, "surface-textspacing-390.png") });
    gate("1.4.12 text spacing: no h-scroll, nothing clipped", !R.textSpacing.hscroll && R.textSpacing.clipped === 0, JSON.stringify(R.textSpacing));
    await p.setViewport({ width: 320, height: 568, isMobile: true, deviceScaleFactor: 1 }); await p.goto(P + url(related), { waitUntil: "load" }); R.zoom400 = await p.evaluate(() => ({ hscroll: document.documentElement.scrollWidth > innerWidth })); gate("400% zoom equivalent (320 wide): no h-scroll", !R.zoom400.hscroll, "");
    await p.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 1 });
    /* keyboard: tab order lands on the back link after the nav */
    await p.goto(P + url(related), { waitUntil: "load" });
    const tabs = []; for (let i = 0; i < 12; i++) { await p.keyboard.press("Tab"); tabs.push(await p.evaluate(() => { const e = document.activeElement; return (e.getAttribute("aria-label") || e.textContent || e.tagName).trim().slice(0, 30); })); }
    R.tabOrder = tabs; gate("keyboard: the back link is reachable by Tab; nothing in the arc takes focus", tabs.some((t) => t.startsWith("Back to the students")) && !tabs.some((t) => /done|ahead/.test(t)), JSON.stringify(tabs));
    /* contrast measured by axe, both themes */
    R.axe = {};
    for (const theme of ["dark", "light"]) { await setTheme(p, theme); await p.goto(P + url(related), { waitUntil: "load" }); const a = await new AxePuppeteer(p).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); R.axe[theme] = { violations: a.violations.map((v) => `${v.id}(${v.nodes.length})`), contrastChecked: a.passes.find((x) => x.id === "color-contrast")?.nodes.length ?? 0, worst: Math.min(...(a.passes.find((x) => x.id === "color-contrast")?.nodes.flatMap((n) => n.any.map((c) => c.data?.contrastRatio || 99)) || [99])) }; }
    gate("axe clean both themes, contrast measured", R.axe.dark.violations.length === 0 && R.axe.light.violations.length === 0 && R.axe.dark.contrastChecked > 5, JSON.stringify(R.axe));
    /* no-JS parity */
    const nj = await ctx.newPage(); await nj.setJavaScriptEnabled(false); await nj.setViewport({ width: 390, height: 844, isMobile: true });
    await nj.goto(P + url(related), { waitUntil: "load" });
    const njS = await nj.evaluate(() => Array.from(document.querySelectorAll("main p, main h1, main h2, main li, main a")).map((e) => e.textContent.trim().replace(/\s+/g, " ")).filter((t) => t));
    await setTheme(p, "dark"); await p.goto(P + url(related), { waitUntil: "load" });
    gate("no-JS complete: identical main text without JavaScript", JSON.stringify(njS) === JSON.stringify(S.sentences), `${njS.length} vs ${S.sentences.length}`);
    await nj.screenshot({ path: path.join(OUT, "surface-nojs-390.png") }); await nj.close();
    /* LCP / TTFB samples, mid-range emulation (4× CPU, slow-4G-class network), warm-up discarded */
    const cdp = await p.target().createCDPSession(); await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 }); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    const samples = []; for (let i = 0; i < 6; i++) { await p.goto(P + url(related), { waitUntil: "load" }); const m = await p.evaluate(() => new Promise((res) => { const nav = performance.getEntriesByType("navigation")[0]; let lcp = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) lcp = e.renderTime || e.loadTime; }).observe({ type: "largest-contentful-paint", buffered: true }); setTimeout(() => res({ lcp: Math.round(lcp), ttfb: Math.round(nav.responseStart), requests: performance.getEntriesByType("resource").length + 1 }), 800); })); if (i > 0) samples.push(m); }
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 }); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    R.perf = { profile: "CDP emulation: 4× CPU, 150 ms RTT, 1.6 Mbps down; 1 warm-up discarded", samples, lcpMs: samples.map((s) => s.lcp).sort((a, b) => a - b), ttfbMs: samples.map((s) => s.ttfb).sort((a, b) => a - b), requests: samples[0]?.requests, scriptBytes: R.network.scriptBytes, scriptFiles: R.network.scriptFiles };
    gate("perf: LCP median < 4 s on the emulated profile (n=5), no canvas/WebGL", R.perf.lcpMs[2] < 4000 && S.dom.canvas === 0, JSON.stringify(R.perf));
    await ctx.close();
  }
  /* same-method script bytes for /tutor (6.2's baseline measured the shell) */
  const tb = fs.existsSync(path.join(__dirname, "tutor-baseline.json")) ? JSON.parse(fs.readFileSync(path.join(__dirname, "tutor-baseline.json"), "utf8")) : null;
  if (tb) gate("payload: surface script bytes ≤ the tutor shell + 2 KB (no client JS added)", R.network.scriptBytes <= tb.states.B.network.scriptBytes + 2048, `${R.network.scriptBytes} (${R.network.scriptFiles} files) vs shell ${tb.states.B.network.scriptBytes} (${tb.states.B.network.scriptFiles} files)`);

  await browser.close();
  R.pass = fail.length === 0; R.failed = fail;
  for (const v of Object.values(R.students)) delete v.html;
  if (mode === "write") { fs.writeFileSync(BASELINE, JSON.stringify(R, null, 1)); console.log("relationship baseline written →", BASELINE); }
  if (mode === "check" && fs.existsSync(BASELINE)) {
    const B = JSON.parse(fs.readFileSync(BASELINE, "utf8")); const diffs = [];
    for (const k of Object.keys(B.students)) if (JSON.stringify(B.students[k]?.sentences) !== JSON.stringify(R.students[k]?.sentences)) diffs.push({ student: k, what: "sentences changed" });
    if (JSON.stringify(B.statements) !== JSON.stringify(R.statements)) diffs.push({ what: "statements/arc changed" });
    console.log(diffs.length ? "DIFFS vs relationship baseline:\n" + JSON.stringify(diffs, null, 1) : "no diffs vs relationship baseline");
  }
  console.log("GATES:\n" + Object.entries(R.gates).map(([k, v]) => `${v.pass ? "PASS" : "FAIL"}  ${k}${v.pass ? "" : "  — " + String(v.detail).slice(0, 600)}`).join("\n"));
  console.log("\nSTATEMENTS:", JSON.stringify(R.statements, null, 1));
  console.log("\nCASES:", JSON.stringify(R.cases, null, 1));
  console.log("\nARC CONSUMERS:", JSON.stringify(R.arcConsumers));
  console.log("\nPERF:", JSON.stringify(R.perf));
  process.exit(R.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
