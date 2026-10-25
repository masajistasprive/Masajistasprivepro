const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../js/votos-visibles.js'),'utf8');
function check(attribute){
let mutate,intersection,queued=[],observed=[],stops=0;const events={};
const review={nodeType:1,isConnected:true,getAttribute:()=> 'review1',matches:s=>s.includes('['+attribute+']'),querySelector:()=>null};
const ctx=vm.createContext({Map,Set,console,setTimeout,clearTimeout,innerHeight:800,requestAnimationFrame:f=>queued.push(f),IntersectionObserver:class{constructor(f){intersection=f}observe(n){observed.push(n)}unobserve(n){observed=observed.filter(x=>x!==n)}},MutationObserver:class{constructor(f){mutate=f}observe(){}},document:{documentElement:{},visibilityState:'visible',querySelectorAll:()=>review.isConnected?[review]:[],addEventListener:(n,f)=>events[n]=f},window:{addEventListener:(n,f)=>events[n]=f}});
vm.runInContext(code,ctx);const run=()=>{for(const f of queued.splice(0))f()};
ctx.window.priveVotosVisibles.registrar('review:review1',attribute,'review1',()=>()=>stops++,()=>{});run();intersection([{target:review,isIntersecting:true}]);
mutate([{addedNodes:[{nodeType:3}],removedNodes:[]}]);assert.equal(queued.length,0,'Text updates must not trigger rescans');
review.isConnected=false;mutate([{addedNodes:[],removedNodes:[review]}]);assert.equal(queued.length,1,'Review removal must trigger cleanup');run();
assert.equal(observed.length,0,'Detached review must be unobserved');events.pagehide();assert.equal(stops,1,'Hidden page releases listeners');events.pageshow();run();
}
for(const attribute of ['data-review-id','data-prive-reviews'])check(attribute);
console.log('PASS: unrelated mutations skipped, detached reviews cleaned, listeners released');
