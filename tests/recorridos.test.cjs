/* Carga reproducible del gestor real; no accede a Firebase. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/votos-visibles.js'),'utf8');
let queries=0,comparisons=0,paints=0,starts=0,stops=0,queue=[],intersect,mutation;
const events={},nodes=[];
for(const [attribute,perId]of [['data-prive-voto',3],['data-review-id',2]])for(let i=0;i<100;i++)for(let j=0;j<perId;j++)nodes.push({attribute,id:String(i),nodeType:1,isConnected:true,getAttribute(a){comparisons++;return a===attribute?String(i):null},matches(s){return s.includes('['+attribute+']')},querySelector:()=>null});
const context=vm.createContext({console,Map,Set,setTimeout,clearTimeout,requestAnimationFrame:f=>queue.push(f),IntersectionObserver:class{constructor(cb){intersect=cb}observe(node){intersect([{target:node,isIntersecting:true}])}unobserve(){}},MutationObserver:class{constructor(cb){mutation=cb}observe(){}},document:{documentElement:{},visibilityState:'visible',querySelectorAll(selector){queries++;return nodes.filter(n=>n.isConnected&&selector==='['+n.attribute+']')},addEventListener:(n,f)=>events[n]=f},window:{addEventListener:(n,f)=>events[n]=f}});
vm.runInContext(source,context);
for(const attribute of ['data-prive-voto','data-review-id'])for(let i=0;i<100;i++)context.window.priveVotosVisibles.registrar(attribute+':'+i,attribute,String(i),()=>{starts++;return()=>stops++},()=>paints++);
const flush=()=>{for(const f of queue.splice(0))f()};flush();
assert.equal(paints,500);assert.equal(starts,200,'Una suscripción por perfil o experiencia, aunque haya controles duplicados');
const initial={controls:500,records:200,queries,comparisons,paints,subscriptions:starts};
if(!process.argv.includes('--baseline')){assert(queries<=2,'Solo un recorrido por tipo de control');assert(comparisons<=500,'No comparar cada tarjeta contra todos los perfiles')}
mutation([{addedNodes:[{nodeType:3}],removedNodes:[]}]);assert.equal(queue.length,0);
const old=nodes[0];old.isConnected=false;const replacement={...old,isConnected:true};nodes.push(replacement);mutation([{addedNodes:[replacement],removedNodes:[old]}]);flush();assert.equal(paints,501,'Control recreado recibe su estado');assert.equal(starts,200,'No duplica la suscripción');
events.pagehide();assert.equal(stops,200);events.pageshow();flush();assert.equal(starts,400);events.pagehide();assert.equal(stops,400);
console.log(JSON.stringify({initial,recreated:true,visibilityLifecycle:true}));
