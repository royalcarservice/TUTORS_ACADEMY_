/* Scene 7 audit sweep (Phase 4 · Step 7). Run: NODE_PATH=./node_modules node audit/scene-promise.cjs  (dev :3000, prod :3100). Extends the 3.7/4.x harness family. */
const puppeteer=require('puppeteer');const fs=require('fs');const U='http://localhost:3000';const sleep=ms=>new Promise(r=>setTimeout(r,ms));const OUT='/home/user/shots21';fs.mkdirSync(OUT,{recursive:true});
const R={};
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const newPage=async(o={})=>{const p=await b.newPage();await p.setViewport({width:o.w||1280,height:o.h||800});if(o.rm)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);p._hyd=[];p.on('console',m=>{const t=m.text();if(/hydrat|did not match|Warning:|error/i.test(t))p._hyd.push(t.slice(0,160))});return p;};
const home=async(p,theme)=>{await p.goto(U+'/',{waitUntil:'networkidle0'});await p.evaluate(()=>document.documentElement.style.scrollBehavior='auto');if(theme)await p.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);};
const SC='[data-scene=promise]';

/* 1. NO-JS — strings, structure, state, boundary */
{const p=await newPage();await p.setJavaScriptEnabled(false);await p.goto(U+'/',{waitUntil:'networkidle0'});
 R.nojs=await p.evaluate(()=>{const s=document.querySelector('[data-scene=promise]');const txt=n=>(n.textContent||'').replace(/\s+/g,' ').trim();return{
  strings:[...s.querySelectorAll('h2,p,[data-marker]')].map(txt).filter(Boolean),headings:[...s.querySelectorAll('h1,h2,h3')].map(h=>h.tagName+':'+txt(h)),
  markers:[...s.querySelectorAll('[data-marker]')].map(m=>m.getAttribute('data-marker')+'='+m.getAttribute('data-state')),
  listLabel:s.querySelector('[data-markers]')?.getAttribute('aria-label'),imgs:s.querySelectorAll('img,svg,canvas,video').length,focusables:s.querySelectorAll('a,button,input,form,textarea,select,[tabindex],[title]').length,
  staggerInSSR:s.querySelectorAll('.ta-stagger,.ta-reveal').length,visible:[...s.querySelectorAll('[data-marker]')].every(e=>getComputedStyle(e).opacity==='1'),liveRegions:s.querySelectorAll('[aria-live],[role=status]').length,
  numerals:(txt(s).match(/\d+/g)||[]),
  pageWords:[...document.querySelectorAll('section[data-scene]')].slice(0,8).map(x=>{x.querySelectorAll('[data-scene-meta],style').forEach(n=>n.remove());return [x.getAttribute('data-scene'),(x.textContent||'').trim().split(/\s+/).length]}),h1:document.querySelectorAll('h1').length}});
 await p.evaluate(()=>document.querySelector('[data-scene=promise]').scrollIntoView());await sleep(200);await p.screenshot({path:`${OUT}/s7-nojs.png`});await p.close();}

/* 2. SCROLL BUDGET, CLS, long tasks, frames, stagger concurrency (both themes) */
for(const theme of ['dark','light']){const p=await newPage();await home(p,theme);
 const geo=await p.evaluate(()=>{const s=document.querySelector('[data-scene=promise]');const r=s.getBoundingClientRect();return{height:Math.round(r.height),vh:+(r.height/innerHeight).toFixed(2),content:Math.round(s.firstElementChild.getBoundingClientRect().height),contentVh:+(s.firstElementChild.getBoundingClientRect().height/innerHeight).toFixed(2),top:Math.round(r.top+scrollY)}});
 await p.evaluate(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});window.__long=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__long.push(Math.round(e.duration))}).observe({entryTypes:['longtask']})}catch{}window.__frames=[];let last=-1;const rec=()=>{const n=performance.now();if(last>=0)window.__frames.push(n-last);last=n;requestAnimationFrame(rec)};requestAnimationFrame(rec);});
 for(let y=geo.top-600;y<=geo.top+200;y+=150){await p.evaluate(v=>scrollTo(0,v),y);await sleep(80);}
 await sleep(120);const mid=await p.evaluate(()=>[...document.querySelectorAll('[data-scene=promise] [data-marker]')].filter(e=>+getComputedStyle(e).opacity<1).length);await sleep(700);
 const tail=await p.evaluate(()=>({cls:+window.__cls.toFixed(4),long:window.__long,frames:{n:window.__frames.length,avg:+(window.__frames.reduce((a,b)=>a+b,0)/window.__frames.length).toFixed(1),worst:+Math.max(...window.__frames).toFixed(1),over50:window.__frames.filter(f=>f>50).length},staggered:document.querySelector('[data-scene=promise] [data-markers]').className,allIn:[...document.querySelectorAll('[data-scene=promise] [data-marker]')].every(e=>getComputedStyle(e).opacity==='1'),sticky:[...document.querySelectorAll('[data-scene=promise] *')].filter(e=>getComputedStyle(e).position==='sticky').length}));
 R['scroll_'+theme]={geo,animatingMidEntry:mid,...tail,hydration:p._hyd};
 await p.evaluate(()=>document.querySelector('[data-scene=promise]').scrollIntoView());await sleep(500);await p.screenshot({path:`${OUT}/s7-${theme}-1280.png`});await p.close();}

/* 3. REDUCED MOTION */
{const p=await newPage({rm:true});await home(p,'dark');await p.evaluate(()=>document.querySelector('[data-scene=promise]').scrollIntoView());await sleep(300);
 R.rm=await p.evaluate(()=>({staggerClass:document.querySelectorAll('[data-scene=promise] .ta-stagger').length,allVisible:[...document.querySelectorAll('[data-scene=promise] [data-marker]')].every(e=>getComputedStyle(e).opacity==='1'),states:[...document.querySelectorAll('[data-scene=promise] [data-marker-state]')].map(e=>e.textContent)}));await p.screenshot({path:`${OUT}/s7-rm.png`});await p.close();}

/* 4. WIDTHS 320/390/768/1280/1920 × themes — overflow, layout direction, marker sizes */
{R.widths=[];for(const t of ['dark','light'])for(const w of [320,390,768,1280,1920]){const p=await newPage({w,h:900});await p.goto(`${U}/dev/scene-promise?frame=1&theme=${t}`,{waitUntil:'load'});await sleep(300);
 const m=await p.evaluate(()=>{const ul=document.querySelector('[data-markers]');const cols=getComputedStyle(ul).gridTemplateColumns.split(' ').length;const li=[...ul.children];const rows=new Set(li.map(e=>Math.round(e.getBoundingClientRect().top))).size;return{sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,layout:cols>1?'horizontal row':'vertical sequence',rows,h:Math.round(document.querySelector('[data-frame]').getBoundingClientRect().height),labelPx:Math.round(parseFloat(getComputedStyle(document.querySelector('[data-marker-label]')).fontSize)),statePx:Math.round(parseFloat(getComputedStyle(document.querySelector('[data-marker-state]')).fontSize)),clipped:li.some(e=>e.scrollWidth>e.clientWidth+1)}});
 R.widths.push({t,w,overflow:m.sw>m.cw,...m});if(t==='dark')await p.screenshot({path:`${OUT}/s7-${w}.png`,fullPage:true});await p.close();}}

/* 5. STATE MATRIX + GRAYSCALE */
{R.states={};for(const d of [0,3,7]){const p=await newPage();await p.goto(`${U}/dev/scene-promise?frame=1&done=${d}`,{waitUntil:'load'});R.states[d]=await p.evaluate(()=>[...document.querySelectorAll('[data-marker]')].map(m=>m.getAttribute('data-state')).join(','));await p.screenshot({path:`${OUT}/s7-done-${d}.png`});await p.close();}
 const p=await newPage();await p.goto(`${U}/dev/scene-promise?frame=1&gray=1`,{waitUntil:'load'});await sleep(300);await p.screenshot({path:`${OUT}/s7-gray.png`});
 R.gray=await p.evaluate(()=>{const ok=[...document.querySelectorAll('[data-marker]')].map(m=>({s:m.getAttribute('data-state'),bg:getComputedStyle(m,'::before').backgroundColor,word:m.querySelector('[data-marker-state]').textContent}));return ok});await p.close();}

/* 6. KEYBOARD — tab through, expect no stop in promise */
{const p=await newPage();await home(p,'dark');const stops=[];for(let i=0;i<60;i++){await p.keyboard.press('Tab');const s=await p.evaluate(()=>{const a=document.activeElement;const sc=a.closest('section[data-scene]');return (sc?sc.getAttribute('data-scene'):'chrome')+':'+a.tagName+':'+(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,25)});stops.push(s);if(s.startsWith('return'))break;}
 R.keyboard={stops:stops.slice(-6),inPromise:stops.filter(s=>s.startsWith('promise:'))};await p.close();}

/* 7. ZOOM 400% / 200% + text spacing */
{const p=await newPage({w:1280,h:800});await p.goto(`${U}/dev/scene-promise?frame=1`,{waitUntil:'load'});
 const z=async(f)=>{await p.setViewport({width:Math.round(1280/f),height:Math.round(800/f)});await sleep(250);return p.evaluate(()=>{const ul=document.querySelector('[data-markers]');return{overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,layout:getComputedStyle(ul).gridTemplateColumns.split(' ').length>1?'horizontal row':'vertical sequence',clipped:[...document.querySelectorAll('[data-marker-label],[data-marker-state],[data-mastery] p')].some(e=>e.scrollWidth>e.clientWidth+1)}})};
 R.zoom={z200:await z(2),z400:await z(4)};await p.setViewport({width:1280,height:800});
 await p.evaluate(()=>{const s=document.createElement('style');s.textContent='*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}';document.head.appendChild(s)});await sleep(200);
 R.textSpacing=await p.evaluate(()=>{const li=[...document.querySelectorAll('[data-marker]')];const overlap=li.some((a,i)=>li.slice(i+1).some(b=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return ra.right>rb.left+1&&rb.right>ra.left+1&&ra.bottom>rb.top+1&&rb.bottom>ra.top+1}));return{overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,clipped:li.some(e=>e.scrollWidth>e.clientWidth+1),overlap}});await p.close();}

/* 8. PAYLOAD + WebGL + live regions + motifs */
{const p=await newPage();const reqs=[];p.on('response',r=>{reqs.push({u:r.url(),len:+(r.headers()['content-length']||0)})});await home(p);R.payload={requests:reqs.length,bytes:reqs.reduce((a,r)=>a+r.len,0),webglChunk:reqs.filter(r=>/three|webgl|ambient/i.test(r.u)).length,canvas:await p.evaluate(()=>document.querySelectorAll('canvas').length),liveRegions:await p.evaluate(()=>document.querySelectorAll('[aria-live]').length),motifsInScene:await p.evaluate(()=>document.querySelectorAll('[data-scene=promise] [data-motif],[data-scene=promise] svg').length)};await p.close();}

/* 9. PROD */
{try{const p=await newPage();R.prod404=(await p.goto('http://localhost:3100/dev/scene-promise',{waitUntil:'load'})).status();await p.goto('http://localhost:3100/',{waitUntil:'load'});R.prodHome=await p.evaluate(()=>document.querySelectorAll('[data-scene=promise] [data-marker]').length);await p.close();}catch(e){R.prod404='prod not running'}}

await b.close();fs.writeFileSync('/tmp/s7.json',JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1));})();
