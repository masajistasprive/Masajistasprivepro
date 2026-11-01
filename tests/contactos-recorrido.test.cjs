/* Pruebas del recorrido real, sin enviar eventos a Google ni escribir en Firebase. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function boot(url,storage=new Map(),blocked=false){
 const listeners={},link={id:'btnEntrarPrive',href:'index.html',getAttribute(){return this.href},setAttribute(k,v){this.href=v},closest(){return this},matches(){return false}};
 const modal={style:{display:''},contains:()=>false,querySelectorAll:()=>[]},body={style:{overflow:''}};
 const document={readyState:'loading',body,addEventListener:(n,fn)=>listeners[n]=fn,querySelectorAll:()=>[link],getElementById:id=>id==='modal-edad'?modal:null};
 const window={},context=vm.createContext({window,location:new URL(url),URL,Date,Object,String,Number,Set,JSON,document,sessionStorage:{getItem:k=>{if(blocked)throw Error('blocked');return storage.get(k)||null},setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v)}}});
 vm.runInContext(read('js/analytics-prive.js'),context);vm.runInContext(read('js/recorrido-prive.js'),context);listeners.DOMContentLoaded();
 const events=()=>window.dataLayer.map(a=>Array.from(a)).filter(a=>a[0]==='event');
 return {window,context,listeners,link,modal,body,events};
}
const memory=new Map(),landing=boot('https://masajistasprive.com/landing.html?utm_source=FB&utm_medium=Paid_Social&gclid=abc&private=no',memory);
landing.listeners.click({target:landing.link});
assert.equal(memory.get('edadVerificada'),'true');
const destination=new URL(landing.link.href,'https://masajistasprive.com');assert.equal(destination.searchParams.get('utm_source'),'fb');assert.equal(destination.searchParams.get('utm_medium'),'paid_social');assert(!destination.searchParams.has('private'));
const portal=boot(destination.href,memory);assert.equal(portal.modal.style.display,'none','No repetir la confirmación de edad');assert.equal(portal.body.style.overflow,'');
portal.window.priveRecorrido.catalogoListo(12);portal.window.priveRecorrido.catalogoListo(12);portal.window.priveRecorrido.catalogoError();portal.window.priveRecorrido.catalogoError();
assert.equal(portal.events().filter(a=>a[1]==='prive_landing_catalogo_listo').length,1,'Redibujar no duplica el paso');assert.equal(portal.events().filter(a=>a[1]==='prive_landing_catalogo_error').length,1);
portal.window.priveAnalytics.contacto({id:'camila',categoria:'terapeuticas',nombre:'Camila',ubicacion:'portada'});
const wa=portal.events().filter(a=>a[1]==='whatsapp_click');assert.equal(wa.length,1);assert.equal(wa[0][2].perfil_id,'camila');assert.equal(wa[0][2].perfil_nombre,'Camila');assert.equal(wa[0][2].ubicacion_boton,'portada');
assert.equal(portal.window.priveAnalytics.contacto({id:'<script>'}),false);assert.equal(portal.events().filter(a=>a[1]==='whatsapp_click').length,1);
const noStorage=boot('https://masajistasprive.com/landing.html',new Map(),true);assert.doesNotThrow(()=>noStorage.listeners.click({target:noStorage.link}));assert(new URL(noStorage.link.href,'https://masajistasprive.com').pathname.endsWith('/index.html'),'El enlace sigue siendo navegable sin almacenamiento');
// Ejecutar el listener de contacto del perfil con la API nueva y con el fallback.
const profile=read('perfil.html'),marker="document.addEventListener('click',evento=>{\n const enlace=evento.target.closest('[data-metrica-whatsapp]');",start=profile.indexOf(marker),end=profile.indexOf('\nconst langs=',start);
for(const helper of [true,false]){
 let callback,privateCount=0,fallbackCount=0;const measured=[];
 const context=vm.createContext({document:{addEventListener:(n,fn)=>callback=fn},window:{priveAnalytics:helper?{contacto:args=>measured.push(args)}:undefined},perfilId:'camila',modelo:{nombre:'Camila',categoria:'terapeuticas'},registrarMetrica:()=>fallbackCount++,registrarMetricaPrivada:()=>privateCount++});
 vm.runInContext(profile.slice(start,end),context);callback({target:{closest:()=>({dataset:{metricaWhatsapp:'principal'}})}});
 assert.equal(privateCount,1,'Se conserva un registro privado');assert.equal(measured.length,helper?1:0);assert.equal(fallbackCount,helper?0:1,'Un solo evento GA por clic');
}
console.log('PASS: landing→portal, atribución, edad, catálogo deduplicado, WhatsApp único, fallback y almacenamiento bloqueado.');
