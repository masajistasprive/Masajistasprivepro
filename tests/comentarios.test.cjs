const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../perfil.html'),'utf8');
const fn=html.slice(html.indexOf('function listenReviews(){'),html.indexOf('function renderReviews(){'));
let starts=0,stops=0,registration,onData,onError,renders=0;
const collection={doc(){return this},collection(){return this},where(field,op,value){assert.equal(field,'aprobado');assert.equal(op,'==');assert.equal(value,true);return this},onSnapshot(cb,error){starts++;onData=cb;onError=error;return()=>stops++}};
const ctx=vm.createContext({console,db:{collection:()=>collection},perfilId:'test',unsubscribeReviews:null,reviewItems:[],reviewsLoaded:false,reviewLoadError:null,document:{getElementById:()=>({innerHTML:''})},window:{priveVotosVisibles:{registrar(...args){registration=args}}},renderReviews:()=>renders++,esc:String,t:()=>({loading:'Cargando'})});
vm.runInContext(fn,ctx);vm.runInContext('listenReviews()',ctx);
assert.equal(starts,0,'No consultar comentarios antes de acercarse a la sección');assert(registration,'La sección debe registrar su visibilidad');
const stop=registration[3]();assert.equal(starts,1);
onData({docs:[{id:'one',data:()=>({contenido:'Comentario aprobado'})}]});assert.equal(ctx.reviewItems[0].id,'one');assert.equal(ctx.reviewsLoaded,true);assert(renders>0);
stop();assert.equal(stops,1);assert.equal(ctx.unsubscribeReviews,null);
onData({docs:[{id:'stale',data:()=>({})}]});assert.equal(ctx.reviewItems[0].id,'one','Ignorar respuesta de una suscripción cerrada');
const stop2=registration[3]();assert.equal(starts,2);onData({docs:[{id:'two',data:()=>({})}]});assert.equal(ctx.reviewItems[0].id,'two','Resincronizar al regresar');
onError({code:'permission-denied'});assert.equal(ctx.reviewLoadError.code,'permission-denied');stop2();assert.equal(stops,2);
console.log('PASS: cero consultas fuera de vista, filtro público, actualización en vivo, cierre, resincronización y error');

const urlCode=html.slice(html.indexOf('const safeUrl='),html.indexOf('function getId()'));
const urlContext=vm.createContext({URL,document:{baseURI:'https://masajistasprive.com/perfil.html?id=test'}});vm.runInContext(urlCode,urlContext);
for(const value of [undefined,null,'','   ',{}]){urlContext.value=value;assert.equal(vm.runInContext('safeUrl(value)',urlContext),'','No convertir imagen vacía en URL del perfil')}
assert.equal(vm.runInContext("safeUrl('img/prada1.jpg')",urlContext),'https://masajistasprive.com/img/prada1.jpg');
assert.equal(vm.runInContext("safeUrl('javascript:alert(1)')",urlContext),'');
console.log('PASS: opiniones sin foto no solicitan la página como imagen');
