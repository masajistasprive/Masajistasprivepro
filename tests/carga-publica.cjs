/* Lectura del portal en Chromium. Bloquea registros de visitas y Analytics.
   Mide una carga por caso; no es una estadística de usuarios ni facturación. */
const {chromium}=require('../qa/node_modules/playwright');
(async()=>{
 if(process.env.GITHUB_EVENT_NAME==='push'){let ready=false;for(let i=0;i<24;i++){const s=await fetch('https://masajistasprive.com/index.html?audit='+process.env.GITHUB_SHA+'-'+i).then(r=>r.text());if(s.includes('prive-home-2.js?v=20261024-carga3')){ready=true;break}await new Promise(r=>setTimeout(r,10000))}if(!ready)throw Error('La publicación todavía no refleja la revisión medida')}
 const browser=await chromium.launch({headless:true});
 try{for(const mobile of [false,true])for(const path of ['/','/perfil.html?id=prada']){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
  await context.addInitScript(()=>{localStorage.setItem('priveMayorEdad','true');window.qaPaints=[];window.qaLcp=[];window.qaLongTasks=[];new PerformanceObserver(l=>window.qaLcp.push(...l.getEntries().map(e=>({ms:e.startTime,tag:e.element?.tagName})))).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>window.qaLongTasks.push(...l.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true})});
  await context.route('**/js/visitas-portada.js*',r=>r.fulfill({contentType:'text/javascript',body:'window.privePortada={registrar:async()=>true};'}));
  await context.route('**/js/metricas-prive.js*',r=>r.fulfill({contentType:'text/javascript',body:'window.priveMetricas={registrar:async()=>true};'}));
  await context.route(/https:\/\/.*(googletagmanager|google-analytics)\.com\//,r=>r.fulfill({body:'',contentType:'text/javascript'}));
  const page=await context.newPage(),client=await context.newCDPSession(page),requests=new Map(),finished=[];
  await client.send('Network.enable');
  client.on('Network.requestWillBeSent',e=>requests.set(e.requestId,e.request.url));
  client.on('Network.loadingFinished',e=>{const raw=requests.get(e.requestId);if(raw?.startsWith('https://')){const u=new URL(raw);finished.push({host:u.hostname,path:u.pathname,bytes:e.encodedDataLength})}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://masajistasprive.com'+path,{waitUntil:'domcontentloaded',timeout:45000});
  if(await page.locator('#btn-mayor').isVisible())await page.locator('#btn-mayor').click();
  await page.locator(path==='/'?'.story-item':'#fotoPrincipal').first().waitFor({timeout:30000});
  await page.waitForTimeout(8000);
  const timing=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {ttfbMs:Math.round(n.responseStart),domReadyMs:Math.round(n.domContentLoadedEventEnd),fcpMs:Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0),lcpLastMs:Math.round(window.qaLcp.at(-1)?.ms||0),longTasks:window.qaLongTasks.length,longTaskMs:Math.round(window.qaLongTasks.reduce((a,b)=>a+b,0)),images:[...document.images].filter(i=>i.complete&&i.naturalWidth>0).length}});
  const hosts={};for(const r of finished)hosts[r.host]=(hosts[r.host]||0)+r.bytes;
  console.log('AUDIT '+JSON.stringify({viewport:mobile?'mobile390':'desktop1440',path,timing,completedTransferBytes:finished.reduce((n,r)=>n+r.bytes,0),hosts,largest:finished.sort((a,b)=>b.bytes-a.bytes).slice(0,5),errors}));
  await context.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
