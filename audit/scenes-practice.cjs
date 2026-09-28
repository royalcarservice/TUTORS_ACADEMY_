/* Scenes 5+6 audit sweep (Phase 4 · Step 6). Run: NODE_PATH=./node_modules node audit/scenes-practice.cjs  (dev server on :3000; prod on :3100 for the 404 check)
   Extends the 3.7/4.x harness family: same launcher, same probes, new scenes. */
const puppeteer=require('puppeteer');const fs=require('fs');const U='http://localhost:3000';const sleep=ms=>new Promise(r=>setTimeout(r,ms));const OUT='/home/user/shots20';fs.mkdirSync(OUT,{recursive:true});
const R={};
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const newPage=async(o={})=>{const p=await b.newPage();await p.setViewport({width:o.w||1280,height:o.h||800,deviceScaleFactor:1});if(o.rm)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);p._hyd=[];p.on('console',m=>{const t=m.text();if(/hydrat|did not match|Warning:|error/i.test(t))p._hyd.push(t.slice(0,160))});return p;};
const home=async(p,theme)=>{await p.goto(U+'/',{waitUntil:'networkidle0'});await p.evaluate(()=>document.documentElement.style.scrollBehavior='auto');if(theme)await p.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);};

/* 1. STRINGS + STRUCTURE + BOUNDARY (server HTML, no JS) */
{const p=await newPage();await p.setJavaScriptEnabled(false);await p.goto(U+'/',{waitUntil:'networkidle0'});
 R.nojs=await p.evaluate(()=>{const out={};for(const id of ['people','practice']){const s=document.querySelector(`[data-scene=${id}]`);const txt=n=>(n.textContent||'').replace(/\s+/g,' ').trim();out[id]={strings:[...s.querySelectorAll('h2,h3,p,li>div>p')].map(txt).filter(Boolean),
  headings:[...s.querySelectorAll('h1,h2,h3,h4')].map(h=>h.tagName+':'+txt(h).slice(0,60)),
  imgs:s.querySelectorAll('img,svg,canvas,video,picture').length,focusables:s.querySelectorAll('a,button,input,form,textarea,select,[tabindex]').length,
  beats:s.querySelectorAll('[data-beat]').length,statuses:[...s.querySelectorAll('[data-status]')].map(e=>e.getAttribute('data-state')+':'+txt(e)),
  consolidated:txt(s.querySelector('[data-consolidated]')||document.createElement('i')),revealClass:s.querySelectorAll('.ta-reveal,.ta-stagger').length,
  words:txt(s).split(' ').length,liveRegions:s.querySelectorAll('[aria-live],[role=status]').length,visibleAll:[...s.querySelectorAll('[data-beat]')].every(e=>getComputedStyle(e).opacity==='1')}}
  out.order=[...document.querySelectorAll('section[data-scene]')].map(s=>s.getAttribute('data-scene'));out.h1=document.querySelectorAll('h1').length;
  out.pageWords=[...document.querySelectorAll('section[data-scene]')].slice(0,7).map(s=>{s.querySelectorAll('[data-scene-meta],style').forEach(n=>n.remove());return [s.getAttribute('data-scene'),(s.textContent||'').trim().split(/\s+/).length]});return out;});
 await p.evaluate(()=>document.querySelector('[data-scene=people]').scrollIntoView());await p.screenshot({path:`${OUT}/nojs-people.png`});
 await p.evaluate(()=>document.querySelector('[data-scene=practice]').scrollIntoView());await p.screenshot({path:`${OUT}/nojs-practice.png`,fullPage:false});await p.close();}

/* 2. SCROLL BUDGET + CLS + LONG TASKS + FRAMES while stepping through the sequence (both themes) */
for(const theme of ['dark','light']){const p=await newPage();await home(p,theme);
 const geo=await p.evaluate(()=>{const g={};for(const id of ['people','practice']){const r=document.querySelector(`[data-scene=${id}]`).getBoundingClientRect();g[id]={height:Math.round(r.height),vh:+(r.height/innerHeight).toFixed(2),top:Math.round(r.top+scrollY)}}return g});
 await p.evaluate(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});window.__long=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__long.push(Math.round(e.duration))}).observe({entryTypes:['longtask']})}catch{}window.__frames=[];let last=-1;const rec=()=>{const n=performance.now();if(last>=0)window.__frames.push(n-last);last=n;requestAnimationFrame(rec)};requestAnimationFrame(rec);});
 const start=geo.people.top-100;const end=geo.practice.top+geo.practice.height;const states=[];
 for(let y=start;y<=end;y+=160){await p.evaluate(v=>scrollTo(0,v),y);await sleep(90);states.push(await p.evaluate(()=>[...document.querySelectorAll('[data-beat] .ta-reveal')].map(e=>e.classList.contains('is-in')?1:0).join('')));}
 await sleep(400);
 const tail=await p.evaluate(()=>({cls:+window.__cls.toFixed(4),long:window.__long,frames:{n:window.__frames.length,avg:+(window.__frames.reduce((a,b)=>a+b,0)/window.__frames.length).toFixed(1),worst:+Math.max(...window.__frames).toFixed(1),over50:window.__frames.filter(f=>f>50).length},revealed:[...document.querySelectorAll('[data-beat] .ta-reveal')].map(e=>e.classList.contains('is-in')),sticky:[...document.querySelectorAll('[data-scene=people] *,[data-scene=practice] *')].filter(e=>getComputedStyle(e).position==='sticky').length}));
 /* scroll back up: one-shot check */
 await p.evaluate(v=>scrollTo(0,v),start);await sleep(300);const backUp=await p.evaluate(()=>[...document.querySelectorAll('[data-beat] .ta-reveal')].every(e=>e.classList.contains('is-in')));
 R['scroll_'+theme]={geo,progression:[...new Set(states)],...tail,stillRevealedAfterScrollBack:backUp,hydration:p._hyd};
 await p.evaluate(()=>document.querySelector('[data-scene=people]').scrollIntoView());await sleep(300);await p.screenshot({path:`${OUT}/s5-${theme}-1280.png`});
 await p.evaluate(()=>document.querySelector('[data-scene=practice]').scrollIntoView());await sleep(600);await p.screenshot({path:`${OUT}/s6-${theme}-1280.png`});await p.close();}

/* 3. REDUCED MOTION — static complete */
{const p=await newPage({rm:true});await home(p,'dark');await p.evaluate(()=>document.querySelector('[data-scene=people]').scrollIntoView());await sleep(300);
 R.rm=await p.evaluate(()=>({revealClasses:document.querySelectorAll('[data-scene=practice] .ta-reveal').length,allVisible:[...document.querySelectorAll('[data-beat]')].every(e=>getComputedStyle(e).opacity==='1'&&e.getBoundingClientRect().height>0),beats:document.querySelectorAll('[data-beat]').length}));
 await p.evaluate(()=>document.querySelector('[data-scene=practice]').scrollIntoView());await sleep(200);await p.screenshot({path:`${OUT}/s6-rm.png`});await p.close();}

/* 4. WIDTHS — overflow + heights at 320/390/768/1280, both scenes, both themes (frame route) */
{R.widths=[];for(const sc of ['people','practice'])for(const t of ['dark','light'])for(const w of [320,390,768,1280]){const p=await newPage({w,h:800});await p.goto(`${U}/dev/scenes-practice?frame=${sc}&theme=${t}`,{waitUntil:'load'});await sleep(400);
 const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,h:Math.round(document.querySelector('[data-frame]').getBoundingClientRect().height),lead:Math.round(parseFloat(getComputedStyle(document.querySelector('[data-people-lead],[data-practice-lead]')).fontSize)),statusPx:Math.round(parseFloat(getComputedStyle(document.querySelector('[data-status]')).fontSize)),textPx:Math.round(parseFloat(getComputedStyle(document.querySelector('[data-beat-text],[data-people-lines] p')).fontSize))}));
 R.widths.push({sc,t,w,overflow:m.sw>m.cw,...m});if(t==='dark'&&(w===390||w===1280))await p.screenshot({path:`${OUT}/${sc}-${t}-${w}.png`,fullPage:true});await p.close();}}

/* 5. FORCED STATE MATRIX renders all three labels */
{R.states={};for(const st of ['live','foundation','next']){const p=await newPage();await p.goto(`${U}/dev/scenes-practice?frame=practice&state=${st}`,{waitUntil:'load'});R.states[st]=await p.evaluate(()=>({labels:[...new Set([...document.querySelectorAll('[data-status]')].map(e=>e.textContent))],consolidated:document.querySelector('[data-consolidated]').textContent}));await p.close();}}

/* 6. KEYBOARD 0–6: tab through the page, list focus stops per scene */
{const p=await newPage();await home(p,'dark');const stops=[];for(let i=0;i<80;i++){await p.keyboard.press('Tab');const s=await p.evaluate(()=>{const a=document.activeElement;const sc=a.closest('section[data-scene]');return (sc?sc.getAttribute('data-scene'):'chrome')+':'+a.tagName+':'+(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,25)});stops.push(s);if(s.startsWith('promise')||s.startsWith('return'))break;}
 R.keyboard={stops,inPeopleOrPractice:stops.filter(s=>/^(people|practice):/.test(s))};await p.close();}

/* 7. ZOOM 200% + text spacing (WCAG 1.4.12) on practice frame */
{const p=await newPage({w:640,h:800});await p.goto(`${U}/dev/scenes-practice?frame=practice`,{waitUntil:'load'});await p.evaluate(()=>{document.body.style.zoom='2';});await sleep(200);const z=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}));
 await p.evaluate(()=>{document.body.style.zoom='1';const s=document.createElement('style');s.textContent='*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}';document.head.appendChild(s)});await sleep(200);
 const ts=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,clipped:[...document.querySelectorAll('[data-beat-text],[data-status]')].some(e=>e.scrollWidth>e.clientWidth+1)}));R.zoomSpacing={zoom200:z,textSpacing:ts};await p.close();}

/* 8. PAYLOAD + WebGL + live regions on `/` */
{const p=await newPage();const reqs=[];p.on('response',r=>{const h=r.headers();reqs.push({u:r.url().replace(U,''),len:+(h['content-length']||0),type:h['content-type']||''})});await home(p);R.payload={requests:reqs.length,bytes:reqs.reduce((a,r)=>a+r.len,0),canvas:await p.evaluate(()=>document.querySelectorAll('canvas').length),liveRegions:await p.evaluate(()=>document.querySelectorAll('[aria-live]').length),motifs:await p.evaluate(()=>document.querySelectorAll('[data-scene=people] [data-motif],[data-scene=practice] [data-motif]').length)};await p.close();}

/* 9. PROD 404 */
{try{const p=await newPage();const r=await p.goto('http://localhost:3100/dev/scenes-practice',{waitUntil:'load'});R.prod404=r.status();const r2=await p.goto('http://localhost:3100/',{waitUntil:'load'});R.prodHomeHasScenes=await p.evaluate(()=>({people:!!document.querySelector('[data-scene=people] [data-people]'),practice:document.querySelectorAll('[data-scene=practice] [data-beat]').length}));await p.close();}catch(e){R.prod404='prod not running: '+e.message.slice(0,60)}}

await b.close();fs.writeFileSync('/tmp/sp.json',JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1).slice(0,12000));})();
