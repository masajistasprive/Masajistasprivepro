const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('perfil.html','utf8');
const loader=html.match(/^async function loadProfile\(\).*$/m)[0];
async function scenario(state,{exists=true,fail=false}={}){
 const calls=[],box={innerHTML:''};
 const ctx={perfilId:'renata',modelo:null,document:{getElementById:()=>box},window:{priveEnlacePerfilListo:Promise.resolve()},db:{collection(name){assert.equal(name,'modelos_prive');return{doc(id){assert.equal(id,'renata');return{async get(options){assert.equal(options.source,'server');if(fail)throw Error('offline');return{exists,data:()=>({estado:state})}}}}}}},renderProfile:()=>calls.push('render'),priveEscucharVotos:()=>calls.push('votes'),listenReviews:()=>calls.push('reviews'),registrarVisitaPerfil:()=>calls.push('visit'),hideTransition:()=>calls.push('ready'),esc:String,console:{error(){}}};
 await vm.runInNewContext(loader+';loadProfile()',ctx);
 return {calls,box};
}
(async()=>{
 assert.deepEqual((await scenario('pausado')).calls,['render','ready']);
 for(const state of ['activo','activa',undefined])assert.deepEqual((await scenario(state)).calls,['render','votes','reviews','visit','ready']);
 for(const opts of [{exists:false},{fail:true}]){const r=await scenario('activo',opts);assert.deepEqual(r.calls,['ready']);assert.match(r.box.innerHTML,/perfil/);}
 // The real renderer must stop before accessing profile photos, contact or reviews.
 const render=html.slice(html.indexOf('function renderProfile(){'),html.indexOf('function readFavs(){'));
 const elements=Object.fromEntries(['contenedorWppFlotante','perfil-title','perfil-content-box'].map(id=>[id,{innerHTML:'',textContent:''}]));
 const ctx={modelo:{estado:'pausado',get fotosGaleria(){throw Error('No cargar fotos pausadas')}},document:{getElementById:id=>elements[id]}};
 vm.runInNewContext(render+';renderProfile()',ctx);
 assert.match(elements['perfil-content-box'].innerHTML,/Perfil temporalmente no disponible/);
 assert.doesNotMatch(elements['perfil-content-box'].innerHTML,/<img|wa.me|review-form/);
 const metric=html.match(/^function registrarVisitaPerfil\(\).*$/m)[0];
 vm.runInNewContext(metric+';registrarVisitaPerfil()', {modelo:{estado:'pausado'},visitaRegistrada:false});
 for(const path of fs.readdirSync('p').filter(p=>p.endsWith('.html'))){const page=fs.readFileSync('p/'+path,'utf8');assert(page.includes(loader),'Enlace compartido sin bloqueo: '+path);}
 console.log('PASS: pausados sin contenido, métricas ni suscripciones; activos intactos, lectura de servidor, fallos cerrados y todos los enlaces compartidos protegidos.');
})().catch(e=>{console.error(e);process.exitCode=1});
