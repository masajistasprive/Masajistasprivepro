/* Navegador real, Firebase simulado: no escribe datos de producción. */
const {chromium}=require('../qa/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function firebaseMock(){
 const models=Object.fromEntries(['terapeuticas','sensuales','fantasias'].map((categoria,i)=>['qa'+i,{nombre:'QA '+i,categoria,zona:'Tribunales',estado:'activo',destacada:true,nuevaAnunciante:true,fotoPrincipal:'img/logo.png',fotosGaleria:['img/logo.png','img/monograma.png'],whatsapp:'5491100000000',descripcion:'Descripción de prueba.',horarios:'10 a 20'}]));
 models.qa1.fotoPrincipal='img/monograma.png';
 models['qa-hidden']={...models.qa0,nombre:'QA hidden',destacada:false,nuevaAnunciante:false,fotoPrincipal:'img/qa-hidden.svg'};
 const listeners=new Map();let clubReads=0;
 const users=id=>JSON.parse(localStorage.getItem('qa-votes-'+id)||'[]');
 const snap=p=>{const id=p.split('/')[1];let docs=p==='perfiles_publicos'?Object.entries(models).map(([id,d])=>({id,data:()=>d})):p==='club_posts'?[{id:'post',data:()=>({status:'published',title:'Club QA',author:'QA',createdAt:{toMillis:()=>1}})}]:p.startsWith('votos_perfiles/')?users(id).map(id=>({id})):[];return{docs,size:docs.length}};
 const emit=()=>{for(const [p,cbs]of listeners)for(const cb of cbs)cb(snap(p))};
 addEventListener('storage',emit);
 function query(p){return {collection:n=>query(p+'/'+n),doc:(id='auto')=>query(p+'/'+id),where(){return this},orderBy(){return this},limit(){return this},async get(){if(p.startsWith('modelos_prive/'))return{exists:true,data:()=>models[p.split('/')[1]]};if(p==='club_posts')clubReads++;if(p.split('/').length===4)return{exists:users(p.split('/')[1]).includes('qa-user')};return snap(p)},onSnapshot(cb){if(!listeners.has(p))listeners.set(p,new Set());listeners.get(p).add(cb);cb(snap(p));return()=>listeners.get(p).delete(cb)},async set(){if(p.startsWith('votos_perfiles/')){const id=p.split('/')[1];localStorage.setItem('qa-votes-'+id,JSON.stringify([...new Set([...users(id),'qa-user'])]));emit()}},async delete(){const id=p.split('/')[1];localStorage.setItem('qa-votes-'+id,JSON.stringify(users(id).filter(x=>x!=='qa-user')));emit()},async add(){return {id:'mock'}}}}
 const firestore=()=>({collection:n=>query(n)});firestore.FieldValue={serverTimestamp:()=>0};
 window.firebase={apps:[],initializeApp(){this.apps.push({})},firestore,auth:()=>({currentUser:{uid:'qa-user'},signInAnonymously:async()=>({user:{uid:'qa-user'}})})};
 window.qa={listenerCount:()=>[...listeners.values()].reduce((n,s)=>n+s.size,0),clubReads:()=>clubReads};
}
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
const server=http.createServer((req,res)=>{if(req.url==='/img/miniaturas/'+ '1'.repeat(24)+'.webp'){res.writeHead(200,{'content-type':'image/png'});res.end(fs.readFileSync(path.join(root,'img/logo.png')));return}if(req.url==='/img/qa-hidden.svg'){res.writeHead(200,{'content-type':'image/svg+xml'});res.end('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="gold"/></svg>');return}const rel=decodeURIComponent(new URL(req.url,'http://local').pathname);const file=path.join(root,rel==='/'?'index.html':rel);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'content-type':mime[path.extname(file)]||'text/plain'});res.end(e?'missing':b)})});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 try{for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
  await context.addInitScript(firebaseMock);
  await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.pathname==='/js/miniaturas-prive.js')return route.fulfill({contentType:'text/javascript',body:'window.priveMiniaturas='+JSON.stringify({'https://masajistasprive.com/img/logo.png':'/img/miniaturas/'+ '1'.repeat(24)+'.webp','https://masajistasprive.com/img/monograma.png':'/img/miniaturas/'+ '2'.repeat(24)+'.webp'})});if(u.origin===url)return route.continue();if(u.hostname==='www.gstatic.com')return route.fulfill({body:'',contentType:'text/javascript'});return route.fulfill({body:'{}',contentType:'application/json'})});
  const page=await context.newPage(),errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));page.on('pageerror',e=>errors.push(e.message));
  let hiddenImageRequests=0;page.on('request',r=>{if(r.url().endsWith('/img/qa-hidden.svg'))hiddenImageRequests++});
  await page.goto(url);await page.locator('#btn-mayor').click();
  await page.locator('.story-item').first().waitFor();assert.equal(hiddenImageRequests,0,'Catálogo cerrado: no descargar fotos exclusivas del catálogo');
  await page.waitForFunction(()=>document.querySelector('.story-item[href*=qa0] img')?.naturalWidth>0&&document.querySelector('.story-item[href*=qa1] img')?.getAttribute('src')==='img/monograma.png');
  assert((await page.locator('.story-item[href*=qa0] img').first().getAttribute('src')).includes('/img/miniaturas/'));assert.equal(await page.locator('.story-item[href*=qa1] img').first().getAttribute('data-prive-original'),null,'Si falta miniatura, recupera el original');
  for(const cat of ['terapeuticas','sensuales','fantasias']){await page.locator('.prive-category-card[data-filter="'+cat+'"]').click();await page.locator('#grid-'+cat+' [data-prive-voto]').first().waitFor();if(cat==='terapeuticas'){await page.locator('[data-perfil-id=qa-hidden] img').waitFor();await page.waitForFunction(()=>document.querySelector('[data-perfil-id=qa-hidden] img').naturalWidth>0);assert(hiddenImageRequests>0,'Las fotos cargan al abrir su categoría')}await page.locator('#priveCloseCatalogue').click()}
  await page.locator('.prive-category-card[data-filter="terapeuticas"]').click();
  const heart=page.locator('#grid-terapeuticas [data-prive-voto="qa0"]');
  await heart.click();await page.waitForFunction(()=>document.querySelector('#grid-terapeuticas [data-prive-voto="qa0"]').getAttribute('aria-pressed')==='true');
  await page.locator('[data-prive-favorite="qa0"]').first().click();
  await page.locator('[data-prive-nav="favoritos"]').click();assert(await page.locator('#grid-favoritos [data-prive-voto="qa0"]').isVisible());
  const profile=await context.newPage();profile.on('pageerror',e=>errors.push(e.message));await profile.goto(url+'/perfil.html?id=qa0');
  await profile.locator('#fotoPrincipal').waitFor();assert.equal(new URL(await profile.locator('#fotoPrincipal').getAttribute('src'),url).href,url+'/img/logo.png','La galería conserva el original');const ph=profile.locator('[data-prive-voto="qa0"]');await ph.scrollIntoViewIfNeeded();
  await profile.waitForFunction(()=>document.querySelector('[data-prive-voto]').getAttribute('aria-pressed')==='true');
  await ph.click();await profile.waitForFunction(()=>document.querySelector('[data-prive-voto]').getAttribute('aria-pressed')==='false');
  await page.bringToFront();await page.waitForFunction(()=>document.querySelector('#grid-favoritos [data-prive-voto]').getAttribute('aria-pressed')==='false');
  await profile.bringToFront();await profile.reload();await profile.locator('#fotoPrincipal').waitFor();
  await profile.locator('#fotoPrincipal').click();assert(await profile.locator('#priveLightbox').isVisible());await profile.locator('#priveLbNext').click();assert.equal(await profile.locator('#privePhotoCount').textContent(),'2 / 2');await profile.locator('#priveLbClose').click();assert(!await profile.locator('#priveLightbox').isVisible());
  for(const lang of ['en','pt','fr','es']){await profile.locator('#btn-idioma').click();assert.equal(await profile.locator('html').getAttribute('lang'),lang);assert(await profile.locator('#fotoPrincipal').isVisible() || await profile.locator('#fotoPrincipal').count()===1)}
  const contact=await profile.locator('[data-metrica-whatsapp="principal"]').getAttribute('href');assert(contact.startsWith('https://wa.me/5491100000000?text='));
  await page.bringToFront();await page.reload();await page.locator('.story-item').first().waitFor();assert.equal(await page.evaluate(()=>window.qa.clubReads()),0,'Club cached during navigation');
  assert.deepEqual(errors,[]);console.log('PASS browser '+(mobile?'mobile 390px':'desktop 1440px')+': categories, favorites, two-tab votes, reload, gallery, WhatsApp, Club cache, no JS errors');
  await context.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
