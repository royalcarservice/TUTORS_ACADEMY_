/* THE LEVERS HARNESS (Phase 6 · Step 4).
 *   node audit/levers.cjs --write | --check
 * Real accounts, real rows, the live DB. Tutor T (tutor-a) is placed in
 * physics only; tutor U (tutor-u) in nothing; student A (student-c) and
 * student B (student-b); the visitor has no cookies.
 * Gates: surface resolves for T/physics only · one h1 · one primary · the
 * levers are exactly the authored sets (no identity value, no free input) ·
 * blast-radius sentence verbatim, in the form, BEFORE the save control, not
 * an attribute · the write works with JavaScript OFF (real form submit → 303
 * → row) · idempotent (one row after two saves) · revert deletes the row ·
 * an unauthored value never lands · GET/HEAD write nothing · absence =
 * authored default (same environment bytes with no row as with a row at the
 * authored values) · FIVE READER CLASSES see byte-identical environment
 * markup (shell root attrs + every motif) for a shaped subject · no
 * student-facing string about shaping · targets · no-JS parity · axe both
 * themes · 390/360/320/1280 · grayscale · reduced motion · text spacing ·
 * zoom · script bytes on the surface and on the environment. */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const puppeteer = require("puppeteer");
const { AxePuppeteer } = require("@axe-core/puppeteer");
const { execFileSync } = require("child_process");

const P = process.env.PROD_URL || "http://localhost:3100";
const ROOT = path.join(__dirname, "..");
const BASELINE = path.join(__dirname, "levers-baseline.json");
const OUT = path.join(__dirname, "levers-shots");
const PASS = process.env.TEST_PASS || "Test-Pass-2026!";
const ACC = { studentA: "student-c@test.tutorsacademy.invalid", studentB: "student-b@test.tutorsacademy.invalid", tutorT: "tutor-a@test.tutorsacademy.invalid", tutorU: "tutor-u@test.tutorsacademy.invalid" };
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : "run";
fs.mkdirSync(OUT, { recursive: true });
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
function sql(q) {
  try { const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^DATABASE_URL=(.+)$/m); if (!env) return null; return execFileSync("psql", [env[1].trim().replace(/^"|"$/g, ""), "-Atc", q], { encoding: "utf8" }).trim(); } catch (e) { return "SQLERR " + String(e.message).slice(0, 80); }
}
const row = (s) => sql(`select coalesce((select density||'/'||motion_char||'/'||shaped_by from public.environment_settings where subject_id='${s}'), 'none')`);
const clear = (s) => sql(`delete from public.environment_settings where subject_id='${s}'`);
const uid = (email) => sql(`select id from auth.users where email='${email}'`);

const SURFACE = "/tutor/physics/environment";
const SHAPE = SURFACE + "/shape";
const BLAST = "Saving changes the Physics environment for everyone in Physics — every student, including students you do not teach, and any other tutor placed in Physics. There is one Physics room.";
const AUTHORED = { density: ["sparse", "balanced", "dense"], motionChar: ["precise", "energetic", "reactive", "growing", "editorial", "sequential"] };
const IDENTITY_WORDS = ["accent", "brass", "hue", "#", "mark", "frame", "typeface", "font", "grammar", "spacing", "colour", "color"];
const STUDENT_NOTICE = ["rearranged", "shaped by", "changed the environment", "new look", "updated environment", "changelog", "what changed"];

async function login(browser, email, vp = { width: 390, height: 844, isMobile: true, hasTouch: true }) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ deviceScaleFactor: 1, ...vp });
  if (!email) return { ctx, p };
  await p.goto(P + "/login", { waitUntil: "load" });
  await p.type("input[name=email]", email); await p.type("input[name=password]", PASS);
  await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("button[type=submit]")]);
  if (/\/login/.test(p.url())) throw new Error("sign-in failed: " + p.url());
  return { ctx, p };
}
const setTheme = (p, t) => p.evaluate((t) => localStorage.setItem("ta-theme", t), t);
const normalise = (html) => html.replace(/\/_next\/static\/[A-Za-z0-9_-]+\//g, "/_next/static/X/").replace(/"buildId":"[^"]+"/g, '"buildId":"X"');
/* 6.3's canonical form for streamed 404 documents (see PHASE_TRACKER): echoed params tokenised, flight rows as a sorted multiset */
const ECHO = /\\+"(relationship|subject)\\+",\\+"([^\\"]+)\\+"/g;
const canonical = (t) => { let s = normalise(t); for (const m of s.matchAll(ECHO)) s = s.replace(new RegExp('(\\\\+")' + m[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '(\\\\+")', "g"), "$1<" + m[1] + ">$2"); const rows = []; const html = s.replace(/<script>self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)<\/script>/g, (_, body) => { for (const r of JSON.parse('"' + body + '"').split("\n")) if (r) rows.push(r.replace(/^[0-9a-f]+:/, "").replace(/\$L?[0-9a-f]+\b/g, "$REF")); return "<FLIGHT/>"; }); return html + "\n" + rows.sort().join("\n"); };
async function raw(p, url) { const r = await p.goto(P + url, { waitUntil: "load" }); const b = await r.buffer().catch(() => Buffer.from("")); return { status: r.status(), html: b.toString("utf8") }; }
/* THE ENVIRONMENT FINGERPRINT: what the levers shape — the shell root's lever
   attrs and every motif (substrate + edges, full markup). Not the threshold
   (5.5 renders a different door per enrolment, by design) and not the nav. */
const envFingerprint = (p) => p.evaluate(() => {
  const root = document.querySelector("[data-shell-root]");
  if (!root) return null;
  const attrs = Array.from(root.attributes).map((a) => `${a.name}=${a.value}`).sort().join(" ");
  const motifs = Array.from(document.querySelectorAll("[data-motif]")).map((m) => m.outerHTML);
  const ambient = document.querySelector("[data-ambient-scope]")?.getAttribute("data-ambient-scope");
  return { attrs, motifCount: motifs.length, motifs: motifs.join("\n"), ambient };
});

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const R = { generatedAt: new Date().toISOString(), reference: "390x844 mobile", gates: {}, surface: {}, write: {}, classes: {}, absence: {} };
  const fail = [];
  const gate = (n, ok, d) => { R.gates[n] = { pass: !!ok, detail: d }; if (!ok) fail.push(`${n}: ${d}`); console.log(`${ok ? "PASS" : "FAIL"}  ${n}${ok ? "" : "  — " + String(d).slice(0, 600)}`); };
  const T_ID = uid(ACC.tutorT);
  clear("physics"); clear("mathematics");
  R.fixture = { tutorT: T_ID, placements: sql("select string_agg(subject_id||':'||state, ',' order by subject_id, state) from public.relationships where tutor_id='" + T_ID + "'") };

  /* ── 1 THE SURFACE (tutor T, physics, as authored) ──────────────────── */
  {
    const { ctx, p } = await login(browser, ACC.tutorT);
    const r = await raw(p, SURFACE);
    const S = await p.evaluate((BLAST) => {
      const q = (s) => Array.from(document.querySelectorAll(s));
      const form = document.querySelector("[data-shape-form]");
      const blast = document.querySelector("[data-blast-radius]");
      const save = form?.querySelector("button[type=submit]");
      const order = blast && save ? !!(blast.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING) : false;
      const selects = q("select").map((s) => ({ name: s.name, options: Array.from(s.options).map((o) => o.value), labels: Array.from(s.options).map((o) => o.textContent.trim()), current: s.value }));
      const text = document.querySelector("main")?.innerText || "";
      return {
        h1: q("h1").map((h) => h.textContent.trim()), primary: q("[data-primary-action]").length, buttons: q("main button").map((b) => b.textContent.trim()),
        forms: q("main form").map((f) => ({ action: f.getAttribute("action"), method: f.getAttribute("method"), intent: f.querySelector("input[name=intent]")?.value })),
        selects, freeInputs: q("input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not([type=submit]), textarea, input[type=color], input[type=number], input[type=file], input[type=range]").map((i) => i.outerHTML.slice(0, 80)),
        blast: { text: blast?.textContent.trim(), inForm: !!(blast && form && form.contains(blast)), beforeSave: order, isAttrOnly: !blast && text.includes(BLAST), tagName: blast?.tagName, visible: blast ? blast.getClientRects().length > 0 : false, describesSave: save?.getAttribute("aria-describedby") },
        shaped: document.querySelector("[data-environment-levers]")?.getAttribute("data-shaped"), state: document.querySelector("[data-shaped-state]")?.textContent.trim(),
        revertPresent: !!document.querySelector("[data-revert-form]"), seeRoom: document.querySelector("[data-see-room]")?.getAttribute("href"), back: document.querySelector("[data-back]")?.getAttribute("href"),
        sentences: q("main p, main h1, main h2, main label, main option, main a, main button").map((e) => e.textContent.trim().replace(/\s+/g, " ")).filter(Boolean),
        text, titles: q("main [title]").length, imgs: q("main img").length, canvas: q("main canvas").length,
        targets: q("main a, main button, main select").map((e) => { const b = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || e.name).trim().slice(0, 30), w: Math.round(b.width), h: Math.round(b.height) }; }),
      };
    }, BLAST);
    R.surface = { status: r.status, bytes: r.html.length, ...S, html: r.html };
    gate("surface: tutor T resolves /tutor/physics/environment (200), as authored", r.status === 200 && S.shaped === "authored", `${r.status} ${S.shaped}`);
    gate("one h1", S.h1.length === 1 && S.h1[0] === "The Physics environment", JSON.stringify(S.h1));
    gate("one primary action; one save form + no revert form when as authored", S.primary === 1 && S.forms.filter((f) => f.intent === "save").length === 1 && !S.revertPresent, JSON.stringify({ primary: S.primary, forms: S.forms }));
    gate("levers are exactly the authored sets (density 3, motion character 6), nothing else", S.selects.length === 2 && JSON.stringify(S.selects.find((s) => s.name === "density")?.options) === JSON.stringify(AUTHORED.density) && JSON.stringify(S.selects.find((s) => s.name === "motionChar")?.options) === JSON.stringify(AUTHORED.motionChar), JSON.stringify(S.selects));
    gate("no identity value is selectable (option values/labels free of accent/mark/frame/type/grammar/spacing/colour/hex)", S.selects.every((s) => [...s.options, ...s.labels].every((o) => !IDENTITY_WORDS.some((w) => o.toLowerCase().includes(w)))), JSON.stringify(S.selects.map((s) => s.labels)));
    gate("no free input: no text/number/color/file/range input, no textarea, no title tooltips", S.freeInputs.length === 0 && S.titles === 0, JSON.stringify(S.freeInputs));
    gate("blast-radius sentence verbatim, a visible <p> inside the save form, BEFORE the save control, named by aria-describedby", S.blast.text === BLAST && S.blast.inForm && S.blast.beforeSave && S.blast.visible && S.blast.tagName === "P" && /blast-radius/.test(S.blast.describesSave || ""), JSON.stringify(S.blast));
    gate("the way out: link to the Physics room (the only renderer) + back to the shell; no preview (no img/canvas in main)", S.seeRoom === "/subjects/physics" && S.back === "/tutor" && S.imgs === 0 && S.canvas === 0, JSON.stringify({ seeRoom: S.seeRoom, back: S.back }));
    /* 6.5 · P6-R19: the room link is live for the tutor who shapes it — a draft subject included — and shows the visitor's rendering (no student region, no door) plus the contextual way back to the levers (P6-R17) */
    { const rr = await raw(p, "/subjects/physics"); R.surface.room = { status: rr.status, studentRegion: /data-student-region/.test(rr.html), door: /data-threshold|data-visitor-door/.test(rr.html), shapeLink: /data-shape-link/.test(rr.html) }; await p.goto(P + SURFACE, { waitUntil: "load" }); }
    gate("P6-R19: 'Open the Physics room' resolves for tutor T (draft subject: 200), no student region, no door, with the contextual shaping link", R.surface.room.status === 200 && !R.surface.room.studentRegion && !R.surface.room.door && R.surface.room.shapeLink, JSON.stringify(R.surface.room));
    gate("forms POST to the subject-scoped handler", S.forms.every((f) => f.method === "post" && f.action === SHAPE), JSON.stringify(S.forms));
    gate("targets ≥ 44 px tall (links, buttons, selects)", S.targets.every((t) => t.h >= 44), JSON.stringify(S.targets.filter((t) => t.h < 44)));
    gate("no student is named on the shaping surface", !/Student [A-F]\b/.test(S.text), "");
    await ctx.close();
  }

  /* ── 2 ROUTE: who resolves it ───────────────────────────────────────── */
  {
    const cases = { "tutor T · mathematics (no placement)": [ACC.tutorT, "/tutor/mathematics/environment"], "tutor T · nonexistent subject": [ACC.tutorT, "/tutor/alchemy/environment"], "tutor U · physics (no placement)": [ACC.tutorU, SURFACE] };
    R.route = {};
    for (const [k, [email, url]] of Object.entries(cases)) { const { ctx, p } = await login(browser, email); const r = await raw(p, url); R.route[k] = { status: r.status, sha: sha(canonical(r.html)), rawSha: sha(normalise(r.html)), bytes: r.html.length }; await ctx.close(); }
    gate("route: no placement ≡ nonexistent subject — same 404 status and identical canonical document (6.3's form: echoed subject param tokenised, flight rows sorted) (tutor T)", R.route["tutor T · mathematics (no placement)"].status === 404 && R.route["tutor T · nonexistent subject"].status === 404 && R.route["tutor T · mathematics (no placement)"].sha === R.route["tutor T · nonexistent subject"].sha, JSON.stringify(R.route));
    gate("route: tutor U (unrelated) at /tutor/physics/environment → 404", R.route["tutor U · physics (no placement)"].status === 404, JSON.stringify(R.route["tutor U · physics (no placement)"]));
  }

  /* ── 3 THE WRITE with JavaScript OFF, then idempotence, unauthored, GET, revert ── */
  {
    const { ctx, p } = await login(browser, ACC.tutorT);
    const nj = await ctx.newPage(); await nj.setJavaScriptEnabled(false); await nj.setViewport({ width: 390, height: 844, isMobile: true });
    await nj.goto(P + SURFACE, { waitUntil: "load" });
    await nj.select("select[name=density]", "dense"); await nj.select("select[name=motionChar]", "energetic");
    const [res] = await Promise.all([nj.waitForNavigation({ waitUntil: "load" }), nj.click("[data-shape-form] button[type=submit]")]);
    const chain = res.request().redirectChain();
    R.write.noJs = { postStatus: chain[0]?.response()?.status(), landed: new URL(nj.url()).pathname + new URL(nj.url()).search, row: row("physics"), shaped: await nj.evaluate(() => document.querySelector("[data-environment-levers]")?.getAttribute("data-shaped")), state: await nj.evaluate(() => document.querySelector("[data-shaped-state]")?.textContent.trim()), selected: await nj.evaluate(() => Array.from(document.querySelectorAll("select")).map((s) => s.value)) };
    gate("write (JS off): real form submit → 303 → back on the surface; row = dense/energetic shaped by T; surface shows 'Last shaped by you.' and the values", R.write.noJs.postStatus === 303 && R.write.noJs.landed === SURFACE && R.write.noJs.row === `dense/energetic/${T_ID}` && R.write.noJs.shaped === "row" && R.write.noJs.state === "Last shaped by you." && JSON.stringify(R.write.noJs.selected) === '["dense","energetic"]', JSON.stringify(R.write.noJs));
    await nj.screenshot({ path: path.join(OUT, "surface-shaped-nojs-390.png"), fullPage: true });
    /* idempotent: same save twice → one row */
    const updated1 = sql("select updated_at from public.environment_settings where subject_id='physics'");
    await Promise.all([nj.waitForNavigation({ waitUntil: "load" }), nj.click("[data-shape-form] button[type=submit]")]);
    R.write.again = { rows: sql("select count(*) from public.environment_settings where subject_id='physics'"), row: row("physics"), updatedChanged: updated1 !== sql("select updated_at from public.environment_settings where subject_id='physics'") };
    gate("idempotent: saving the same values again → still one row, same values", R.write.again.rows === "1" && R.write.again.row === `dense/energetic/${T_ID}`, JSON.stringify(R.write.again));
    /* unauthored value through the same handler */
    const post = (body) => p.evaluate(async (u, b) => { const r = await fetch(u, { method: "POST", body: b, headers: { "content-type": "application/x-www-form-urlencoded" }, redirect: "manual" }); return r.type === "opaqueredirect" ? 303 : r.status; }, P + SHAPE, body);
    await p.goto(P + SURFACE, { waitUntil: "load" });
    R.write.unauthored = { status: await post("intent=save&density=very-dense&motionChar=energetic"), row: row("physics") };
    R.write.hex = { status: await post("intent=save&density=%23b08d57&motionChar=energetic"), row: row("physics") };
    gate("unauthored values ('very-dense', a hex) never land: 303 back, row unchanged", R.write.unauthored.row === `dense/energetic/${T_ID}` && R.write.hex.row === `dense/energetic/${T_ID}`, JSON.stringify([R.write.unauthored, R.write.hex]));
    /* GET / HEAD / prefetch write nothing */
    R.write.get = { status: await p.evaluate(async (u) => (await fetch(u, { redirect: "manual" })).status, P + SHAPE), head: await p.evaluate(async (u) => (await fetch(u, { method: "HEAD", redirect: "manual" })).status, P + SHAPE), prefetch: await p.evaluate(async (u) => { const r = await fetch(u, { headers: { "Next-Router-Prefetch": "1", RSC: "1" }, redirect: "manual" }); return `${r.status}/${r.type}`; }, P + SHAPE), row: row("physics") };
    gate("GET / HEAD on the handler: 405; an RSC prefetch request never writes; row unchanged", R.write.get.status === 405 && R.write.get.head === 405 && R.write.get.row === `dense/energetic/${T_ID}`, JSON.stringify(R.write.get));
    /* the shaped surface says who; revert is present and real */
    await p.goto(P + SURFACE, { waitUntil: "load" });
    R.write.shapedSurface = await p.evaluate(() => ({ revert: !!document.querySelector("[data-revert-form]"), revertText: document.querySelector("[data-revert-form] button")?.textContent.trim(), primary: document.querySelectorAll("[data-primary-action]").length, state: document.querySelector("[data-shaped-state]")?.textContent.trim() }));
    gate("shaped: revert form present (secondary), still one primary", R.write.shapedSurface.revert && R.write.shapedSurface.primary === 1 && R.write.shapedSurface.revertText === "Revert to the authored environment", JSON.stringify(R.write.shapedSurface));
    for (const theme of ["dark", "light"]) { await setTheme(p, theme); await p.goto(P + SURFACE, { waitUntil: "load" }); await p.screenshot({ path: path.join(OUT, `surface-shaped-${theme}-390.png`), fullPage: true }); }
    /* shared-tutor note: tutor U cannot be placed without schema change; instead re-stamp shaped_by to another id as owner and read as T */
    sql(`update public.environment_settings set shaped_by='${uid(ACC.tutorU)}' where subject_id='physics'`);
    await p.goto(P + SURFACE, { waitUntil: "load" });
    R.write.sharedNote = await p.evaluate(() => document.querySelector("[data-shaped-state]")?.textContent.trim());
    gate("shared note: a row shaped by another tutor reads 'Last shaped by another tutor.' (no name, no date)", R.write.sharedNote === "Last shaped by another tutor.", R.write.sharedNote);
    await p.screenshot({ path: path.join(OUT, "surface-shaped-by-other-390.png"), fullPage: true });
    sql(`update public.environment_settings set shaped_by='${T_ID}' where subject_id='physics'`);
    await nj.close();
    R.tutorCtx = { ctx, p };
  }

  /* ── 4 FIVE READER CLASSES: byte-identical environment (mathematics, a room every class may enter) ── */
  {
    /* fixture row as owner: tutor T has no placement in mathematics; the READ path is what is under test */
    sql(`insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('mathematics','dense','energetic','${T_ID}') on conflict (subject_id) do update set density='dense', motion_char='energetic'`);
    const classes = { visitor: null, studentA: ACC.studentA, studentB: ACC.studentB, tutorT: ACC.tutorT, tutorU: ACC.tutorU };
    for (const [cls, email] of Object.entries(classes)) {
      const { ctx, p } = await login(browser, email);
      const r = await raw(p, "/subjects/mathematics");
      const fp = await envFingerprint(p);
      R.classes[cls] = { status: r.status, attrs: fp?.attrs, motifCount: fp?.motifCount, envSha: fp ? sha(fp.attrs + "\n" + fp.motifs) : null, docSha: sha(r.html.replace(/\/_next\/static\/[A-Za-z0-9_-]+\//g, "/_next/static/X/")), scripts: null };
      await ctx.close();
    }
    const shas = Object.values(R.classes).map((c) => c.envSha);
    gate("five reader classes (visitor · student A · student B · tutor T · tutor U) see a byte-identical environment: same shell-root lever attrs + identical motif markup", shas.every((s) => s && s === shas[0]) && Object.values(R.classes).every((c) => c.status === 200 && /data-density=dense/.test(c.attrs) && /data-motion-char=energetic/.test(c.attrs) && /data-levers-source=shaped/.test(c.attrs)), JSON.stringify(R.classes));
    /* ── 5 ABSENCE = AUTHORED DEFAULT: no row vs a row at the authored values ── */
    const { ctx, p } = await login(browser, null);
    clear("mathematics");
    await p.goto(P + "/subjects/mathematics", { waitUntil: "load" }); const none = await envFingerprint(p);
    const authoredD = (none?.attrs.match(/data-density=(\S+)/) || [])[1], authoredM = (none?.attrs.match(/data-motion-char=(\S+)/) || [])[1];
    sql(`insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('mathematics','${authoredD}','${authoredM}','${T_ID}')`);
    await p.goto(P + "/subjects/mathematics", { waitUntil: "load" }); const authoredRow = await envFingerprint(p);
    clear("mathematics");
    R.absence = { authored: { density: authoredD, motionChar: authoredM }, noRow: { attrs: none?.attrs, motifSha: sha(none?.motifs || "") }, rowAtAuthored: { attrs: authoredRow?.attrs, motifSha: sha(authoredRow?.motifs || "") } };
    gate("absence = authored default: with no row the motifs are byte-identical to a row holding the authored values; only data-levers-source differs (authored vs shaped)", R.absence.noRow.motifSha === R.absence.rowAtAuthored.motifSha && /data-levers-source=authored/.test(none?.attrs || "") && /data-levers-source=shaped/.test(authoredRow?.attrs || "") && none.attrs.replace("authored", "shaped") === authoredRow.attrs, JSON.stringify(R.absence));
    /* no student-facing string about shaping anywhere a student reads */
    const { ctx: sctx, p: sp } = await login(browser, ACC.studentA);
    R.studentStrings = {};
    for (const u of ["/student", "/subjects/physics", "/subjects/mathematics", "/subjects"]) { await sp.goto(P + u, { waitUntil: "load" }); const t = await sp.evaluate(() => document.body.innerText); R.studentStrings[u] = STUDENT_NOTICE.filter((w) => t.toLowerCase().includes(w)); }
    gate("no student-facing notice: no shaping/changelog string on /student, /subjects, the physics room, the mathematics room", Object.values(R.studentStrings).every((a) => a.length === 0), JSON.stringify(R.studentStrings));
    /* environment script bytes (student A, physics shaped) — no client JS added */
    sql(`update public.environment_settings set density='dense', motion_char='energetic' where subject_id='physics'`);
    await sp.setCacheEnabled(false); const scripts = []; sp.on("response", (r) => { if (r.request().resourceType() === "script") r.buffer().then((b) => scripts.push(b.length)).catch(() => {}); });
    await sp.goto(P + "/subjects/physics", { waitUntil: "networkidle0" });
    R.environmentScripts = { files: scripts.length, bytes: scripts.reduce((a, b) => a + b, 0), fingerprint: await envFingerprint(sp) };
    await sctx.close(); await ctx.close();
  }

  /* ── 6 REVERT (real action) + a11y set on the shaped surface ────────── */
  {
    const { ctx, p } = R.tutorCtx;
    await p.goto(P + SURFACE, { waitUntil: "load" });
    const seen = []; const onResp = (r) => { if (r.url().endsWith("/environment/shape")) seen.push(r.status()); }; p.on("response", onResp);
    /* with JS on, Next's hydration replaceState fires a same-URL "navigation" first; wait for the real 303 and the document that follows it */
    const docAfter = p.waitForResponse((r) => r.url() === P + SURFACE && r.request().resourceType() === "document" && r.request().redirectChain().length > 0, { timeout: 20000 });
    await p.click("[data-revert-form] button[type=submit]"); await docAfter; await p.waitForSelector("[data-environment-levers]", { timeout: 15000 }); await new Promise((r) => setTimeout(r, 500)); p.off("response", onResp);
    R.write.revert = { postStatus: seen[0], landed: new URL(p.url()).pathname, row: row("physics"), shaped: await p.evaluate(() => document.querySelector("[data-environment-levers]")?.getAttribute("data-shaped")), state: await p.evaluate(() => document.querySelector("[data-shaped-state]")?.textContent.trim()) };
    gate("revert: POST intent=revert → 303 → row deleted → surface reads 'This environment is as authored.' and the revert form is gone", R.write.revert.postStatus === 303 && R.write.revert.row === "none" && R.write.revert.shaped === "authored" && R.write.revert.state === "This environment is as authored.", JSON.stringify(R.write.revert));
    /* screenshots: both themes × widths, grayscale, reduced motion, text spacing, zoom */
    for (const theme of ["dark", "light"]) {
      for (const w of [390, 360, 320]) { await p.setViewport({ width: w, height: w === 390 ? 844 : w === 360 ? 640 : 568, isMobile: true, deviceScaleFactor: 1 }); await setTheme(p, theme); await p.goto(P + SURFACE, { waitUntil: "load" }); await p.screenshot({ path: path.join(OUT, `surface-${theme}-${w}.png`), fullPage: true }); R[`hscroll-${theme}-${w}`] = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth); }
      await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 }); await p.goto(P + SURFACE, { waitUntil: "load" }); await p.screenshot({ path: path.join(OUT, `surface-${theme}-1280.png`), fullPage: true });
    }
    gate("no horizontal scroll at 320/360/390 both themes", ["dark", "light"].every((t) => [390, 360, 320].every((w) => !R[`hscroll-${t}-${w}`])), "");
    await p.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 1 }); await p.goto(P + SURFACE, { waitUntil: "load" }); await p.addStyleTag({ content: "html{filter:grayscale(1)}" }); await p.screenshot({ path: path.join(OUT, "surface-gray-390.png"), fullPage: true });
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]); await p.goto(P + SURFACE, { waitUntil: "load" }); await p.screenshot({ path: path.join(OUT, "surface-rm-390.png"), fullPage: true }); await p.emulateMediaFeatures([]);
    await p.goto(P + SURFACE, { waitUntil: "load" }); await p.addStyleTag({ content: "*{line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}p{margin-bottom:2em !important}" });
    R.textSpacing = await p.evaluate(() => ({ hscroll: document.documentElement.scrollWidth > innerWidth, clipped: Array.from(document.querySelectorAll("main *")).filter((e) => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "visible" && e.tagName !== "SELECT").length }));
    gate("1.4.12 text spacing: no h-scroll, nothing clipped", !R.textSpacing.hscroll && R.textSpacing.clipped === 0, JSON.stringify(R.textSpacing));
    await p.setViewport({ width: 320, height: 568, isMobile: true, deviceScaleFactor: 1 }); await p.goto(P + SURFACE, { waitUntil: "load" }); R.zoom400 = await p.evaluate(() => ({ hscroll: document.documentElement.scrollWidth > innerWidth })); gate("400% zoom equivalent (320 wide): no h-scroll", !R.zoom400.hscroll, "");
    await p.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 1 }); await p.goto(P + SURFACE, { waitUntil: "load" });
    const tabs = []; for (let i = 0; i < 14; i++) { await p.keyboard.press("Tab"); tabs.push(await p.evaluate(() => { const e = document.activeElement; return (e.getAttribute("aria-label") || e.name || e.textContent || e.tagName).trim().slice(0, 30); })); }
    R.tabOrder = tabs; gate("keyboard: density → motion character → save → room link → back, in reading order", (() => { const i = (n) => tabs.findIndex((t) => t.startsWith(n)); return i("density") > -1 && i("motionChar") > i("density") && i("Save for everyone") > i("motionChar") && i("Open the Physics room") > i("Save for everyone") && i("Back to the students") > i("Open the Physics room"); })(), JSON.stringify(tabs));
    R.axe = {};
    for (const theme of ["dark", "light"]) { await setTheme(p, theme); await p.goto(P + SURFACE, { waitUntil: "load" }); const a = await new AxePuppeteer(p).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); R.axe[theme] = { violations: a.violations.map((v) => `${v.id}(${v.nodes.length})`), contrastChecked: a.passes.find((x) => x.id === "color-contrast")?.nodes.length ?? 0 }; }
    gate("axe clean both themes, contrast measured", R.axe.dark.violations.length === 0 && R.axe.light.violations.length === 0 && R.axe.dark.contrastChecked > 5, JSON.stringify(R.axe));
    /* no-JS parity of the text */
    const nj = await ctx.newPage(); await nj.setJavaScriptEnabled(false); await nj.setViewport({ width: 390, height: 844, isMobile: true });
    await nj.goto(P + SURFACE, { waitUntil: "load" });
    const njS = await nj.evaluate(() => Array.from(document.querySelectorAll("main p, main h1, main h2, main label, main option, main a, main button")).map((e) => e.textContent.trim().replace(/\s+/g, " ")).filter(Boolean));
    gate("no-JS complete: identical main text without JavaScript", JSON.stringify(njS) === JSON.stringify(R.surface.sentences), `${njS.length} vs ${R.surface.sentences.length}`);
    await nj.screenshot({ path: path.join(OUT, "surface-nojs-390.png"), fullPage: true }); await nj.close();
    /* script bytes on the surface */
    await p.setCacheEnabled(false); const scripts = []; p.on("response", (r) => { if (r.request().resourceType() === "script") r.buffer().then((b) => scripts.push(b.length)).catch(() => {}); });
    await setTheme(p, "dark"); await p.goto(P + SURFACE, { waitUntil: "networkidle0" });
    R.network = { scriptFiles: scripts.length, scriptBytes: scripts.reduce((a, b) => a + b, 0) };
    const tb = fs.existsSync(path.join(__dirname, "tutor-baseline.json")) ? JSON.parse(fs.readFileSync(path.join(__dirname, "tutor-baseline.json"), "utf8")) : null;
    if (tb) gate("payload: surface script bytes ≤ the tutor shell + 2 KB (no client JS added)", R.network.scriptBytes <= tb.states.B.network.scriptBytes + 2048, `${R.network.scriptBytes} (${R.network.scriptFiles}) vs shell ${tb.states.B.network.scriptBytes}`);
    await ctx.close();
  }
  clear("physics"); clear("mathematics");
  gate("no row left behind (physics, mathematics)", row("physics") === "none" && row("mathematics") === "none", "");

  await browser.close();
  delete R.tutorCtx; delete R.surface.html;
  R.pass = fail.length === 0; R.failed = fail;
  if (mode === "write") { fs.writeFileSync(BASELINE, JSON.stringify(R, null, 1)); console.log("levers baseline written →", BASELINE); }
  if (mode === "check" && fs.existsSync(BASELINE)) {
    const B = JSON.parse(fs.readFileSync(BASELINE, "utf8")); const diffs = [];
    if (JSON.stringify(B.surface.sentences) !== JSON.stringify(R.surface.sentences)) diffs.push("surface sentences changed");
    if (JSON.stringify(B.surface.selects) !== JSON.stringify(R.surface.selects)) diffs.push("lever options changed");
    console.log(diffs.length ? "DIFFS vs levers baseline:\n" + diffs.join("\n") : "no diffs vs levers baseline");
    if (diffs.length) fail.push(...diffs);
  }
  console.log("\nSURFACE:", JSON.stringify({ sentences: R.surface.sentences, selects: R.surface.selects, targets: R.surface.targets }));
  console.log("\nCLASSES:", JSON.stringify(R.classes));
  console.log("\nENVIRONMENT SCRIPTS:", JSON.stringify({ files: R.environmentScripts.files, bytes: R.environmentScripts.bytes }), "SURFACE SCRIPTS:", JSON.stringify(R.network));
  console.log(`\n${fail.length === 0 ? "ALL GATES PASS" : fail.length + " GATE(S) FAILED"}`);
  process.exit(fail.length === 0 ? 0 : 1);
})().catch((e) => { console.error(e); clear("physics"); clear("mathematics"); process.exit(2); });
