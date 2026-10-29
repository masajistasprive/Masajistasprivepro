/* Sin Firebase, cookies reales ni hits a Google. Verifica las entradas reales. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('js/analytics-prive.js');
function start(href){
 const window={},context=vm.createContext({window,location:new URL(href),URL,Date,Object,String});
 vm.runInContext(source,context);
 return {window,context,commands:()=>window.dataLayer.map(a=>Array.from(a))};
}
for(const [url,id]of [
 ['https://masajistasprive.com/perfil.html?id=celeste&utm_source=facebook&utm_medium=paid_social','celeste'],
 ['https://masajistasprive.com/p/celeste.html?v=1234567890abcdef','celeste'],
 ['https://masajistasprive.com/p/delfi-9175a57a.html','delfi-9175a57a'],
 ['https://masajistasprive.com/index.html?fbclid=origen-desconocido',undefined],
 ['https://masajistasprive.com/perfil.html?id=%3Cscript%3E',undefined]
]){
 const {window,context,commands}=start(url);
 const config=commands().find(a=>a[0]==='config');
 assert.equal(config[1],'G-DXX740HP41');assert.equal(config[2].send_page_view,true);
 assert.equal(config[2].perfil_id,id);
 assert.equal(config[2].campaign_source,undefined,'No inventar un origen por detectar fbclid');
 assert.equal(config[2].session_id,undefined,'La sesión la administra Google');
 vm.runInContext(source,context);
 assert.equal(commands().filter(a=>a[0]==='config').length,1,'No configurar dos veces');
 window.priveAnalytics.perfilListo('celeste','fantasias','Celeste');
 assert.equal(commands().at(-1)[0],'set');
 assert.equal(commands().filter(a=>a[0]==='event'&&a[1]==='page_view').length,0,'La carga tardía no duplica la vista inicial');
}
const profile=read('perfil.html');
const entry=profile.slice(profile.indexOf('function registrarPaginaGA(){'),profile.indexOf("document.addEventListener('click',evento=>{",profile.indexOf('function registrarPaginaGA(){')));
const {window,context,commands}=start('https://masajistasprive.com/perfil.html?id=celeste');
let privateVisits=0;
Object.assign(context,{modelo:{nombre:'Celeste',categoria:'fantasias'},perfilId:'celeste',gtag:window.gtag,registrarMetricaPrivada:()=>privateVisits++});
window.priveRecorrido={perfilListo:id=>window.gtag('event','prive_directo_perfil_listo',{perfil_id:id})};
vm.runInContext(entry+';registrarVisitaPerfil();registrarVisitaPerfil();',context);
assert.equal(privateVisits,1,'Se conserva la deduplicación propia');
assert.equal(commands().filter(a=>a[0]==='event'&&a[1]==='perfil_visto').length,1);
assert(commands().findIndex(a=>a[0]==='config')<commands().findIndex(a=>a[0]==='event'),'Configurar antes del primer evento');
assert.equal(commands().filter(a=>a[0]==='event'&&a[1]==='page_view').length,0);
const publicFiles=['index.html','landing.html','perfil.html','perfiles.html','cuaderno.html',...fs.readdirSync(root).filter(p=>/^masajistas-.*\.html$/.test(p)),...fs.readdirSync(path.join(root,'p')).filter(p=>p.endsWith('.html')).map(p=>'p/'+p)];
for(const file of publicFiles){
 const html=read(file);
 assert.equal((html.match(/src="\/js\/analytics-prive\.js\?/g)||[]).length,1,file+': un solo arranque');
 assert.equal((html.match(/googletagmanager\.com\/gtag\/js/g)||[]).length,1,file+': una sola etiqueta');
 assert(html.indexOf('/js/analytics-prive.js')<html.indexOf('googletagmanager.com/gtag/js'),file+': cola inicial antes de cargar Google');
 assert(!html.includes('send_page_view:false'),file+': no esperar a Firebase');
 assert(!html.includes("gtag('event','page_view'"),file+': no segunda vista manual');
}
assert(!read('js/perfil-compartir.js').includes('history.replaceState('),'Compartir no dispara vistas por cambios cosméticos de URL');

const storage=new Map(),listeners={},link={href:'index.html#catalogo',getAttribute(){return this.href},setAttribute(k,v){this.href=v}};
const bridge=start('https://masajistasprive.com/landing.html');
Object.assign(bridge.context,{location:new URL('https://masajistasprive.com/landing.html?utm_source=google&utm_medium=cpc&utm_campaign=barrios&gclid=click&gbraid=gb&wbraid=wb&secreto=no#inicio'),sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{readyState:'loading',addEventListener:(n,fn)=>listeners[n]=fn,querySelectorAll:()=>[link]},Set,JSON,Number,console});
vm.runInContext(read('js/recorrido-prive.js'),bridge.context);listeners.DOMContentLoaded();
const next=new URL(link.href,'https://masajistasprive.com');
for(const [key,value]of Object.entries({utm_source:'google',utm_medium:'cpc',utm_campaign:'barrios',gclid:'click',gbraid:'gb',wbraid:'wb'}))assert.equal(next.searchParams.get(key),value);
assert.equal(next.searchParams.has('secreto'),false,'Solo trasladar identificadores de campaña permitidos');
assert.equal(next.hash,'#catalogo');

console.log('PASS: entrada inmediata, ID de perfil, sin fuente inventada, sin vistas duplicadas, deduplicación propia y cobertura de '+publicFiles.length+' páginas.');
