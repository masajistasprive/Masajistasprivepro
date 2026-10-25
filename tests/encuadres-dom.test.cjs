const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/encuadres-portal.js'),'utf8').replace(/^import .*;\n/,'');
let mutation,queue=[],scans=0,paints=0,observed=0,unobserved=0,sourceValue='photo.jpg#crop=1';
const events={},frame={},img={nodeType:1,isConnected:true,parentElement:frame,style:{cssText:'original'},matches:()=>true,closest:()=>null,getAttribute:()=>sourceValue,addEventListener(){},removeEventListener(){}};
const ctx=vm.createContext({Map,Set,console,leerEncuadres:src=>src.includes('#crop')?{portada:{zoom:100},destacada:{zoom:100}}:null,aplicarEncuadre:()=>paints++,requestAnimationFrame:f=>queue.push(f),ResizeObserver:class{constructor(){}observe(){observed++}unobserve(){unobserved++}},MutationObserver:class{constructor(cb){mutation=cb}observe(){}},document:{documentElement:{},querySelectorAll(){scans++;return img.isConnected?[img]:[]},addEventListener:(n,f)=>events[n]=f},window:{addEventListener:(n,f)=>events[n]=f}});
vm.runInContext(source,ctx);const run=()=>{for(const f of queue.splice(0))f()};assert.equal(scans,1);assert.equal(paints,1);
for(let i=0;i<100;i++){mutation([{type:'childList',addedNodes:[{nodeType:3}],removedNodes:[]}]);run()}
assert.equal(scans,1,'Cambios de contadores no recorren imágenes');
sourceValue='new.jpg#crop=2';mutation([{type:'attributes',attributeName:'src',target:img}]);run();assert.equal(paints,2);assert.equal(observed,2);assert.equal(unobserved,1);
img.isConnected=false;const removed={nodeType:1,matches:()=>false,querySelector:s=>s==='img'?img:null,contains:n=>n===img};mutation([{type:'childList',addedNodes:[],removedNodes:[removed]}]);run();assert.equal(unobserved,2,'Limpiar encuadres dentro de un contenedor retirado');assert.equal(img.style.cssText,'original');
img.isConnected=true;mutation([{type:'childList',addedNodes:[img],removedNodes:[]}]);run();assert.equal(paints,3);
events.click();run();assert.equal(scans,5,'Conserva ajuste al mostrar filtros y categorías');
console.log('PASS: 100 cambios de texto sin escanear fotos; src, retirada, reinserción y filtros conservan encuadres');
