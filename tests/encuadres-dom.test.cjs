const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/encuadres-portal.js'),'utf8').replace(/^import .*;\n/,'');
let mutation,queue=[],scans=0,paints=0,observed=0,unobserved=0,sourceValue='photo.jpg#crop=1',inNew=false,lastCrop;
const events={},frame={},img={nodeType:1,isConnected:true,parentElement:frame,style:{cssText:'original'},matches:()=>true,closest:s=>inNew&&s==='#stories-nuevas-container'?{}:null,getAttribute:()=>sourceValue,addEventListener(){},removeEventListener(){}};
const ctx=vm.createContext({Map,Set,console,leerEncuadres:src=>src.includes('#crop')?{portada:{zoom:100},destacada:{zoom:100},nueva:{x:50,y:0,zoom:100}}:null,aplicarEncuadre:(img,crop)=>{paints++;lastCrop=crop},requestAnimationFrame:f=>queue.push(f),ResizeObserver:class{constructor(){}observe(){observed++}unobserve(){unobserved++}},MutationObserver:class{constructor(cb){mutation=cb}observe(){}},document:{documentElement:{},querySelectorAll(){scans++;return img.isConnected?[img]:[]},addEventListener:(n,f)=>events[n]=f},window:{addEventListener:(n,f)=>events[n]=f}});
vm.runInContext(source,ctx);const run=()=>{for(const f of queue.splice(0))f()};assert.equal(scans,1);assert.equal(paints,1);
for(let i=0;i<100;i++){mutation([{type:'childList',addedNodes:[{nodeType:3}],removedNodes:[]}]);run()}
assert.equal(scans,1,'Cambios de contadores no recorren imágenes');
sourceValue='new.jpg#crop=2';mutation([{type:'attributes',attributeName:'src',target:img}]);run();assert.equal(paints,2);assert.equal(observed,2);assert.equal(unobserved,1);
img.isConnected=false;const removed={nodeType:1,matches:()=>false,querySelector:s=>s==='img'?img:null,contains:n=>n===img};mutation([{type:'childList',addedNodes:[],removedNodes:[removed]}]);run();assert.equal(unobserved,2,'Limpiar encuadres dentro de un contenedor retirado');assert.equal(img.style.cssText,'original');
img.isConnected=true;mutation([{type:'childList',addedNodes:[img],removedNodes:[]}]);run();assert.equal(paints,3);
events.click();run();assert.equal(scans,5,'Conserva ajuste al mostrar filtros y categorías');
console.log('PASS: 100 cambios de texto sin escanear fotos; src, retirada, reinserción y filtros conservan encuadres');

inNew=true;sourceValue='new.jpg#crop=3';mutation([{type:'attributes',attributeName:'src',target:img}]);run();assert.equal(lastCrop.y,0,'Nuevas muestran la parte superior');assert.equal(lastCrop.zoom,100,'Nuevas no heredan zoom circular');assert.equal(lastCrop.x,50,'Centrado horizontal estable');

const previousReader=ctx.leerEncuadres;ctx.leerEncuadres=()=>({portada:{x:50,y:0,zoom:100},destacada:{x:50,y:50,zoom:100},nueva:{x:15,y:60,zoom:130}});sourceValue='manual.jpg#crop=4';mutation([{type:'attributes',attributeName:'src',target:img}]);run();assert.equal(lastCrop.x,15);assert.equal(lastCrop.y,60);assert.equal(lastCrop.zoom,130,'La portada respeta el encuadre manual de nuevas');
