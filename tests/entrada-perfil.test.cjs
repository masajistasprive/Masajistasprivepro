/* Entrada visual sin peticiones, métricas ni escrituras reales. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(new URL('../perfil.html','file://'+__filename),'utf8');
const source=html.slice(html.indexOf('let entradaPerfilIniciada='),html.indexOf('function setLanguage('));
assert(source.startsWith('let entradaPerfilIniciada='));
function scenario({reduced=false,loaded=true,valid=true,supported=true}={}){
 const calls=[],listeners={};let removed=0,connected=true,reduce=reduced;
 const animate=function(frames,options){calls.push({target:this.name,frames,options})};
 const gallery={name:'foto',animate:supported?animate:undefined};
 const info={name:'datos',animate:supported?animate:undefined};
 const photo={complete:loaded,naturalWidth:loaded?800:0,get isConnected(){return connected},closest:()=>gallery,addEventListener:(event,fn,options)=>{listeners[event]={fn,options}}};
 const context=vm.createContext({modelo:valid?{nombre:'QA'}:null,window:{matchMedia:()=>({matches:reduce}),gtag:()=>{throw Error('La animación no envía métricas')}},document:{getElementById:id=>id==='priveTransitionScreen'?{remove:()=>removed++}:valid?photo:null,querySelector:()=>valid?info:null}});
 vm.runInContext(source,context);
 return {calls,listeners,run:()=>vm.runInContext('hideTransition()',context),get removed(){return removed},detach(){connected=false},reduce(){reduce=true}};
}
const normal=scenario();normal.run();assert.equal(normal.removed,1);assert.equal(normal.calls.length,2);
for(const call of normal.calls){assert.equal(call.options.duration,300);assert.equal(call.frames.at(-1).transform,'none');assert.equal(call.options.fill,undefined,'Sin transformaciones persistentes que alteren el encuadre');}
normal.run();assert.equal(normal.calls.length,2,'No repetir al cambiar idioma ni invocar de nuevo el cierre');
const slow=scenario({loaded:false});slow.run();assert.equal(slow.removed,1,'No esperar la imagen para desbloquear botones');assert.equal(slow.calls.length,1);assert.equal(slow.listeners.load.options.once,true);slow.listeners.load.fn();assert.equal(slow.calls.length,2);
const reduced=scenario({reduced:true});reduced.run();assert.equal(reduced.removed,1);assert.equal(reduced.calls.length,0);assert.equal(reduced.listeners.load,undefined);
const changed=scenario({loaded:false});changed.run();changed.reduce();changed.listeners.load.fn();assert.equal(changed.calls.length,1,'Respetar reducción de movimiento también al cargar tarde la foto');
const detached=scenario({loaded:false});detached.run();detached.detach();detached.listeners.load.fn();assert.equal(detached.calls.length,1);
const error=scenario({valid:false});error.run();assert.equal(error.removed,1);assert.equal(error.calls.length,0,'Mostrar errores sin bloquearlos ni animar una ficha inexistente');
const fallback=scenario({supported:false});fallback.run();assert.equal(fallback.removed,1,'Navegador sin API: contenido utilizable');
console.log('PASS: 300 ms, inicio único, foto lenta, botones inmediatos, errores, movimiento reducido y encuadres intactos.');
