import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {geometriaEncuadre} from '../js/encuadres-foto.js';
import {sourceURL,createThumbnail,generateThumbnails} from '../scripts/miniaturas.mjs';
const sharp=createRequire(import.meta.url)('sharp');
const remote='https://res.cloudinary.com/demo/image/upload/v1/photo.jpg';
test('solo procesa imágenes públicas admitidas y separa el encuadre',()=>{
 assert.equal(sourceURL('img/pamela1.jpg#prive-encuadre-v1=1,2,3,4,5,6').href,'https://masajistasprive.com/img/pamela1.jpg');
 assert.equal(sourceURL(remote+'#zoom=1').href,remote);
 for(const src of ['data:image/jpeg;base64,123','javascript:alert(1)','https://127.0.0.1/photo.jpg','https://example.com/photo.jpg','https://user:pass@res.cloudinary.com/demo/image/upload/a.jpg','https://res.cloudinary.com:444/demo/image/upload/a.jpg','https://masajistasprive.com/admin.jpg','img/logo.png','img/miniaturas/old.webp'])assert.equal(sourceURL(src),null);
});
test('miniatura sin recorte, tamaño acotado, orientación y original intactos',async()=>{
 const original=await sharp({create:{width:1200,height:1800,channels:3,background:'#bd8729'}}).jpeg().toBuffer();
 const before=Buffer.from(original),result=await createThumbnail(original,sharp),info=await sharp(result).metadata();
 const frame={x:25,y:70,zoom:220},a=geometriaEncuadre(1200,1800,90,90,frame),b=geometriaEncuadre(512,768,90,90,frame);for(const k of Object.keys(a))assert(Math.abs(a[k]-b[k])<0.00001,'Conserva el encuadre y zoom');
 assert.deepEqual(original,before);assert.equal(info.width,512);assert.equal(info.height,768);assert.equal(info.format,'webp');assert(result.length<original.length);
 const small=await sharp({create:{width:120,height:180,channels:3,background:'#444'}}).png().toBuffer();const s=await sharp(await createThumbnail(small,sharp)).metadata();assert.equal(s.width,120);assert.equal(s.height,180);
});
test('genera, reutiliza sin volver a descargar y cambia al reemplazar el archivo local',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'prive-thumbs-'));
 try{
  await mkdir(path.join(root,'img'));await mkdir(path.join(root,'js'));
  const input=await sharp({create:{width:1400,height:2100,channels:3,background:'#ccaa55'}}).jpeg().toBuffer();
  await writeFile(path.join(root,'img/test.jpg'),input);
  const profiles=[{id:'local',fotoPrincipal:'img/test.jpg#prive-encuadre-v1=50,0,100,50,50,200'},{id:'remote',fotoPrincipal:remote},{id:'paused',estado:'pausado',fotoPrincipal:'img/paused.jpg'}];
  let downloads=0;const fetcher=async()=>{downloads++;return new Response(input,{'headers':{'content-type':'image/jpeg'}})};
  let stats=await generateThumbnails(profiles,root,{sharp,fetcher});assert.equal(stats.generated,2);assert.equal(stats.failed,0);assert.equal(downloads,1);
  const old=JSON.parse(await readFile(path.join(root,'img/miniaturas/indice.json')));
  stats=await generateThumbnails(profiles,root,{sharp,fetcher});assert.equal(stats.cached,2);assert.equal(downloads,1);
  const next=await sharp({create:{width:1500,height:2250,channels:3,background:'#008866'}}).jpeg().toBuffer();await writeFile(path.join(root,'img/test.jpg'),next);
  stats=await generateThumbnails(profiles,root,{sharp,fetcher});assert.equal(stats.generated,1);assert.equal(stats.cached,1);
  const after=JSON.parse(await readFile(path.join(root,'img/miniaturas/indice.json')));assert.notEqual(after['https://masajistasprive.com/img/test.jpg'].file,old['https://masajistasprive.com/img/test.jpg'].file);assert.deepEqual(await readFile(path.join(root,'img/test.jpg')),next);
  assert((await readFile(path.join(root,old['https://masajistasprive.com/img/test.jpg'].file))).length>0,'Conserva miniaturas usadas por páginas en caché');
  const ctx={window:{}};vm.runInNewContext(await readFile(path.join(root,'js/miniaturas-prive.js'),'utf8'),ctx);assert(Object.keys(ctx.window.priveMiniaturas).length===2);
  stats=await generateThumbnails([{id:'bad',fotoPrincipal:remote.replace('v1','v2')}],root,{sharp,fetcher:async()=>new Response('no',{status:404})});assert.equal(stats.failed,1);assert.deepEqual(JSON.parse(await readFile(path.join(root,'img/miniaturas/indice.json'))),{});
 }finally{await rm(root,{recursive:true,force:true})}
});
test('cliente conserva fragmentos, ignora rutas falsas y tolera índice ausente',async()=>{
 const code=await readFile(new URL('../js/prive-home-2.js',import.meta.url),'utf8');const fn=code.slice(code.indexOf('function home2StorySource('),code.indexOf('function home2Vitrinas('));
 const thumb='/img/miniaturas/'+'a'.repeat(24)+'.webp',fragment='#prive-encuadre-v1=20,30,120,40,50,200';
 const ctx=vm.createContext({URL,imagenSegura:v=>v,window:{priveMiniaturas:{[remote]:thumb}}});vm.runInContext(fn,ctx);
 assert.equal(vm.runInContext('home2StorySource('+JSON.stringify(remote+fragment)+').src',ctx),thumb+fragment);
 assert.equal(vm.runInContext('home2StorySource('+JSON.stringify(remote+fragment)+').original',ctx),remote+fragment);
 ctx.window.priveMiniaturas[remote]='https://example.com/tracker';assert.equal(vm.runInContext('home2StorySource('+JSON.stringify(remote)+').src',ctx),remote);
 delete ctx.window.priveMiniaturas;assert.equal(vm.runInContext('home2StorySource('+JSON.stringify(remote)+').src',ctx),remote);
});
