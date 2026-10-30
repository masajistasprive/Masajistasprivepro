/* Navegador real, Firebase simulado: no escribe datos de producción. */
const {chromium}=require('../qa/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function firebaseMock(){
 const models=Object.fromEntries(['terapeuticas','sensuales','fantasias'].map((categoria,i)=>['qa'+i,{nombre:'QA '+i,categoria,zona:'Tribunales',estado:'activo',destacada:true,nuevaAnunciante:true,fotoPrincipal:'img/logo.png',fotosGaleria:['img/logo.png','img/monograma.png'],whatsapp:'5491100000000',verificado:i===0,descripcion:'Descripción de prueba.',horarios:'10 a 20'}]));
 models.qa1.fotoPrincipal='img/monograma.png';
 models['qa-hidden']={...models.qa0,nombre:'QA hidden',destacada:false,nuevaAnunciante:false,fotoPrincipal:'img/qa-hidden.svg'};
 const listeners=new Map();let clubReads=0,reviewsStarted=0,reviewsStopped=0;
 const users=id=>JSON.parse(localStorage.getItem('qa-votes-'+id)||'[]');
 const snap=p=>{const id=p.split('/')[1];let docs=p==='perfiles_publicos'?Object.entries(models).map(([id,d])=>({id,data:()=>d})):p==='club_posts'?[{id:'post',data:()=>({status:'published',title:'Club QA',author:'QA',createdAt:{toMillis:()=>1}})}]:p.startsWith('perfiles_comentarios/')&&p.endsWith('/mensajes')?[{id:'review-qa',data:()=>({autor:'QA visitante',contenido:localStorage.getItem('qa-review-text')||'Experiencia aprobada QA',rating:5,aprobado:true})}]:p.startsWith('votos_perfiles/')?users(id).map(id=>({id})):[];return{docs,size:docs.length}};
 const emit=()=>{for(const [p,cbs]of listeners){if(p==='perfiles_publicos'||p==='club_posts')continue;for(const cb of cbs)cb(snap(p))}};
 addEventListener('storage',emit);
 function query(p){return {collection:n=>query(p+'/'+n),doc:(id='auto')=>query(p+'/'+id),where(){return this},orderBy(){return this},limit(){return this},async get(){if(p.startsWith('modelos_prive/'))return{exists:true,data:()=>models[p.split('/')[1]]};if(p==='club_posts')clubReads++;if(p.split('/').length===4)return{exists:users(p.split('/')[1]).includes('qa-user')};return snap(p)},onSnapshot(cb){const review=p.startsWith('perfiles_comentarios/')&&p.endsWith('/mensajes');if(review)reviewsStarted++;if(!listeners.has(p))listeners.set(p,new Set());listeners.get(p).add(cb);cb(snap(p));return()=>{listeners.get(p).delete(cb);if(review)reviewsStopped++}},async set(){if(p.startsWith('votos_perfiles/')){const id=p.split('/')[1];localStorage.setItem('qa-votes-'+id,JSON.stringify([...new Set([...users(id),'qa-user'])]));emit()}},async delete(){const id=p.split('/')[1];localStorage.setItem('qa-votes-'+id,JSON.stringify(users(id).filter(x=>x!=='qa-user')));emit()},async add(){return {id:'mock'}}}}
 const firestore=()=>({collection:n=>query(n)});firestore.FieldValue={serverTimestamp:()=>0};
 window.firebase={apps:[],initializeApp(){this.apps.push({})},firestore,auth:()=>({currentUser:{uid:'qa-user'},signInAnonymously:async()=>({user:{uid:'qa-user'}})})};
 window.qa={listenerCount:()=>[...listeners.values()].reduce((n,s)=>n+s.size,0),clubReads:()=>clubReads,reviewsStarted:()=>reviewsStarted,reviewsActive:()=>reviewsStarted-reviewsStopped};
}
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
const server=http.createServer((req,res)=>{if(req.url==='/img/miniaturas/'+ '1'.repeat(24)+'.webp'){res.writeHead(200,{'content-type':'image/png'});res.end(fs.readFileSync(path.join(root,'img/logo.png')));return}if(req.url==='/img/qa-hidden.svg'){res.writeHead(200,{'content-type':'image/svg+xml'});res.end('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="gold"/></svg>');return}const rel=decodeURIComponent(new URL(req.url,'http://local').pathname);const file=path.join(root,rel==='/'?'index.html':rel);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'content-type':mime[path.extname(file)]||'text/plain'});res.end(e?'missing':new URL(req.url,'http://local').searchParams.has('qa_reviews')?b.toString().replace('</head>','<style>.prive-review-panel{margin-top:1800px!important}</style></head>'):b)})});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 try{for(const width of [320,390,768,1440]){
  const mobile=width<700;
  const context=await browser.newContext({viewport:{width,height:mobile?844:1000},isMobile:mobile,hasTouch:mobile});
  await context.addInitScript(firebaseMock);
  await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.pathname==='/js/miniaturas-prive.js')return route.fulfill({contentType:'text/javascript',body:'window.priveMiniaturas='+JSON.stringify({'https://masajistasprive.com/img/logo.png':'/img/miniaturas/'+ '1'.repeat(24)+'.webp','https://masajistasprive.com/img/monograma.png':'/img/miniaturas/'+ '2'.repeat(24)+'.webp'})});if(u.origin===url)return route.continue();if(u.hostname==='www.gstatic.com')return route.fulfill({body:'',contentType:'text/javascript'});return route.fulfill({body:'{}',contentType:'application/json'})});
  const page=await context.newPage(),errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));page.on('pageerror',e=>errors.push(e.message));
  let hiddenImageRequests=0;page.on('request',r=>{if(r.url().endsWith('/img/qa-hidden.svg'))hiddenImageRequests++});
  await page.goto(url);await page.locator('#btn-mayor').click();
  await page.locator('.story-item').first().waitFor();assert(await page.locator('#priveResultados').isVisible(),'Catálogo abierto desde el inicio');for(const cat of ['terapeuticas','sensuales','fantasias'])assert(await page.locator('[data-sec='+cat+']').isVisible(),'Categoría visible desde el inicio: '+cat);assert(await page.locator('.card-image img').evaluateAll(images=>images.every(i=>i.loading==='lazy')),'Fotos del catálogo siguen con carga diferida');
  await page.waitForFunction(()=>document.querySelector('.story-item[href*=qa0] img')?.naturalWidth>0&&document.querySelector('.story-item[href*=qa1] img')?.getAttribute('src')==='img/monograma.png');
  assert((await page.locator('.story-item[href*=qa0] img').first().getAttribute('src')).includes('/img/miniaturas/'));assert.equal(await page.locator('.story-item[href*=qa1] img').first().getAttribute('data-prive-original'),null,'Si falta miniatura, recupera el original');
  const vitrinas=await page.evaluate(()=>['stories-destacadas-container','stories-nuevas-container'].map(id=>{const el=document.getElementById(id),photo=el.querySelector('.story-ring'),rect=photo.getBoundingClientRect();return{columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,ratio:rect.width/rect.height,radius:getComputedStyle(photo).borderRadius,overflow:el.scrollWidth>el.clientWidth+1}}));
  for(const v of vitrinas){assert.equal(v.columns,mobile?2:3,'Columnas adaptadas al ancho y cantidad');assert.equal(v.overflow,false,'Vitrina sin scroll horizontal');assert.equal(v.radius,'0px','Marco rectangular sin recorte circular')}
  assert(Math.abs(vitrinas[0].ratio-.8)<.02,'Destacadas con retratos 4:5');assert(Math.abs(vitrinas[1].ratio-1)<.02,'Nuevas cuadradas para conservar las caras');
  for(const cat of ['terapeuticas','sensuales','fantasias']){await page.locator('.prive-category-card[data-filter="'+cat+'"]').click();await page.locator('#grid-'+cat+' [data-prive-voto]').first().waitFor();if(cat==='terapeuticas'){await page.locator('[data-perfil-id=qa-hidden] img').waitFor();await page.waitForFunction(()=>document.querySelector('[data-perfil-id=qa-hidden] img').naturalWidth>0);assert(hiddenImageRequests>0,'Las fotos cargan al abrir su categoría')}for(const c of ['terapeuticas','sensuales','fantasias'])assert(await page.locator('[data-sec='+c+']').isVisible(),'El acceso de categoría no oculta los otros bloques')}
  await page.locator('.prive-category-card[data-filter="terapeuticas"]').click();
  const compactContact=page.locator('#grid-terapeuticas [data-whatsapp-perfil="qa0"]');
  assert(await compactContact.isVisible(),'WhatsApp accesible en la vista compacta');
  assert.equal(await compactContact.getAttribute('aria-label'),'WhatsApp · QA 0');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Catálogo sin desbordamiento horizontal');
  await page.locator('#btnAlternarEstilo').click();assert(await compactContact.isVisible(),'WhatsApp accesible en la vista ampliada');
  await page.locator('#btnAlternarEstilo').click();
  const heart=page.locator('#grid-terapeuticas [data-prive-voto="qa0"]');
  await heart.click();await page.waitForFunction(()=>document.querySelector('#grid-terapeuticas [data-prive-voto="qa0"]').getAttribute('aria-pressed')==='true');
  await page.locator('#priveBuscar').fill('QA 0');
  await page.evaluate(()=>{window.qaStable={cards:[...document.querySelectorAll('.card-link[data-perfil-id]')],stories:[...document.querySelectorAll('.story-item img')]}});
  await page.locator('[data-prive-favorite="qa0"]').first().click();
  assert(await page.evaluate(()=>window.qaStable.cards.every(n=>n.isConnected)&&window.qaStable.stories.every(n=>n.isConnected)),'Guardar favorita mantiene tarjetas e imágenes existentes');
  assert.equal(await page.locator('#priveBuscar').inputValue(),'QA 0');await page.locator('#priveBuscar').fill('');
  await page.locator('[data-prive-nav="favoritos"]').click();assert(await page.locator('#grid-favoritos [data-prive-voto="qa0"]').isVisible());
  const profile=await context.newPage();profile.on('pageerror',e=>errors.push(e.message));await profile.goto(url+'/perfil.html?id=qa0');
  const initialAnalytics=await profile.evaluate(()=>window.dataLayer.map(a=>Array.from(a)));
  assert.equal(initialAnalytics.filter(a=>a[0]==='config'&&a[1]==='G-DXX740HP41').length,1,'Una sola entrada GA por documento');
  assert.equal(initialAnalytics.find(a=>a[0]==='config')[2].perfil_id,'qa0','ID disponible antes de cargar el perfil');
  assert.equal(initialAnalytics.find(a=>a[0]==='config')[2].send_page_view,true,'La vista inicial no espera a Firebase');
  await profile.locator('#fotoPrincipal').waitFor();assert.equal(new URL(await profile.locator('#fotoPrincipal').getAttribute('src'),url).href,url+'/img/logo.png','La galería conserva el original');const ph=profile.locator('[data-prive-voto="qa0"]');await ph.scrollIntoViewIfNeeded();
  await profile.waitForFunction(()=>document.querySelector('[data-prive-voto]').getAttribute('aria-pressed')==='true');
  await ph.click();await profile.waitForFunction(()=>document.querySelector('[data-prive-voto]').getAttribute('aria-pressed')==='false');
  await page.bringToFront();await page.waitForFunction(()=>document.querySelector('#grid-favoritos [data-prive-voto]').getAttribute('aria-pressed')==='false');
  await profile.bringToFront();await profile.reload();await profile.locator('#fotoPrincipal').waitFor();
  assert.equal(await profile.locator('.perfil-titulo-seccion .badge-verificado').count(),1,'Sello para el perfil verificado');
  assert.equal(await profile.locator('#fotoPrincipal').getAttribute('role'),'button');
  await profile.locator('#fotoPrincipal').press('Enter');assert(await profile.locator('#priveLightbox').isVisible());
  assert.equal(await profile.evaluate(()=>document.activeElement.id),'priveLbClose');
  await profile.locator('#priveLbClose').press('Tab');assert.equal(await profile.evaluate(()=>document.activeElement.id),'priveLbPrev');
  await profile.locator('#priveLbPrev').press('Shift+Tab');assert.equal(await profile.evaluate(()=>document.activeElement.id),'priveLbClose');
  await profile.locator('#priveLbNext').click();assert.equal(await profile.locator('#privePhotoCount').textContent(),'2 / 2');
  await profile.locator('#priveLbNext').press('Escape');assert(!await profile.locator('#priveLightbox').isVisible());
  assert.equal(await profile.evaluate(()=>document.activeElement.id),'fotoPrincipal','Restituir foco a la foto de origen');
  await profile.locator('.galeria-miniaturas [data-photo="1"]').press('Space');assert(await profile.locator('#priveLightbox').isVisible());
  await profile.locator('#priveLbClose').click();assert.equal(await profile.evaluate(()=>document.activeElement.dataset.photo),'1');
  for(const lang of ['en','pt','fr','es']){await profile.locator('#btn-idioma').click();assert.equal(await profile.locator('html').getAttribute('lang'),lang);assert(await profile.locator('#fotoPrincipal').isVisible() || await profile.locator('#fotoPrincipal').count()===1)}
  assert.equal(await profile.evaluate(()=>window.dataLayer.filter(a=>a[0]==='event'&&a[1]==='page_view').length),0,'Galería e idiomas no duplican page_view');
  const contact=await profile.locator('[data-metrica-whatsapp="principal"]').getAttribute('href');assert(contact.startsWith('https://wa.me/5491100000000?text='));
  const reviews=await context.newPage();await reviews.goto(url+'/perfil.html?id=qa0&qa_reviews=1');await reviews.locator('#fotoPrincipal').waitFor();
  assert.equal(await reviews.evaluate(()=>window.qa.reviewsStarted()),0,'No consultar experiencias fuera de vista');
  await reviews.locator('[data-prive-reviews]').scrollIntoViewIfNeeded();await reviews.getByText('Experiencia aprobada QA',{exact:true}).waitFor();assert.equal(await reviews.evaluate(()=>window.qa.reviewsStarted()),1);
  await page.evaluate(()=>localStorage.setItem('qa-review-text','Actualizada en vivo QA'));await reviews.getByText('Actualizada en vivo QA',{exact:true}).waitFor();
  await reviews.clock.install();await reviews.locator('#fotoPrincipal').scrollIntoViewIfNeeded();await reviews.waitForTimeout(150);await reviews.clock.fastForward(31000);
  assert.equal(await reviews.evaluate(()=>window.qa.reviewsActive()),0,'Cerrar experiencias tras salir de vista');
  await page.evaluate(()=>localStorage.setItem('qa-review-text','Actualizada durante pausa QA'));
  await reviews.locator('[data-prive-reviews]').scrollIntoViewIfNeeded();await reviews.getByText('Actualizada durante pausa QA',{exact:true}).waitFor();assert.equal(await reviews.evaluate(()=>window.qa.reviewsStarted()),2,'Resincronizar al regresar');
  await reviews.close();
  await page.bringToFront();await page.reload();await page.locator('.story-item').first().waitFor();assert.equal(await page.evaluate(()=>window.qa.clubReads()),0,'Club cached during navigation');
  await profile.bringToFront();await profile.locator('#btnFavElement').click();await page.waitForFunction(()=>!document.querySelector('#grid-favoritos [data-perfil-id="qa0"]'));
  await profile.locator('#btnFavElement').click();await page.waitForFunction(()=>!!document.querySelector('#grid-favoritos [data-perfil-id="qa0"]'));
  await page.bringToFront();await page.locator('[data-prive-nav="favoritos"]').click();await page.locator('#grid-favoritos [data-prive-favorite="qa0"]').press('Enter');
  await page.waitForFunction(()=>!document.querySelector('#grid-favoritos [data-perfil-id="qa0"]'));assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.priveNav),'favoritos','Conservar foco al quitar última favorita con teclado');
  assert(await page.locator('#priveEmpty').isVisible());
  assert.deepEqual(errors,[]);console.log('PASS browser '+width+'px '+': categories, favorites, two-tab votes, reload, gallery, WhatsApp, Club cache, stable favorite DOM, cross-tab favorites, keyboard focus, visible reviews, live updates, pause/resync, no JS errors');
  await context.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());

