import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {metadata,page,publicProfiles,sitemap,directory,areaPage,decode} from '../scripts/perfiles-compartir.mjs';
const template=await readFile(new URL('../perfil.html',import.meta.url),'utf8');
test('metadatos estáticos personalizados, escapados y misma aplicación',()=>{
 const m=metadata({id:'prada-123',nombre:'Prada <"&',categoria:'terapeuticas',zona:'Tribunales',fotoPrincipal:'/img/prada1.jpg#prive-encuadre-v1=x'});
 const html=page(template,m);
 assert.match(html,/<base href="\/">/);
 assert.match(html,/og:image" content="https:\/\/masajistasprive.com\/img\/prada1.jpg"/);
 assert.match(html,/Prada &lt;&quot;&amp;/);
 assert.match(html,/og:url" content="https:\/\/masajistasprive.com\/p\/prada-123.html\?v=[a-f0-9]{16}"/);
 assert.ok(html.includes("collection('modelos_prive').doc(perfilId).get()"));
 assert.ok(html.includes('await window.priveEnlacePerfilListo;renderProfile()'));
 assert.equal(metadata({id:'a',nombre:'A',foto:'/x.jpg'}).version,metadata({id:'a',nombre:'A',foto:'/x.jpg'}).version);
 assert.throws(()=>metadata({id:'../bad',foto:'/x.jpg'}));
 assert.throws(()=>metadata({id:'a',foto:'javascript:alert(1)'}));
});
test('catálogo paginado y fallo seguro ante límites o respuesta vacía',async()=>{
 let n=0;
 const result=await publicProfiles(async url=>({ok:true,json:async()=>{
  n++;
  if(n===1)return {documents:[{name:'x/a',fields:{nombre:{stringValue:'A'}}}],nextPageToken:'next'};
  assert.equal(url.searchParams.get('pageToken'),'next');
  return {documents:[{name:'x/b',fields:{estado:{stringValue:'pausado'}}}]};
 }}));
 assert.equal(result.length,2);assert.equal(result[0].nombre,'A');
 await assert.rejects(publicProfiles(async()=>({ok:false,status:429})));
 await assert.rejects(publicProfiles(async()=>({ok:true,json:async()=>({})})));
});
const client=await readFile(new URL('../js/perfil-compartir.js',import.meta.url),'utf8');
test('enlace nuevo mantiene campaña y hash; sin catálogo conserva original',async()=>{
 const location=new URL('https://masajistasprive.com/perfil.html?id=prada-123&utm_source=facebook#galeria');
 let replaced;
 const context={window:{},URL,location,AbortController,setTimeout,clearTimeout,history:{state:null,replaceState:(a,b,url)=>replaced=url},fetch:async()=>({ok:true,json:async()=>({'prada-123':{path:'/p/prada-123.html',version:'1234567890abcdef'}})})};
 vm.runInNewContext(client,context);await context.window.priveEnlacePerfilListo;
 assert.equal(replaced,'https://masajistasprive.com/p/prada-123.html?utm_source=facebook&v=1234567890abcdef#galeria');
 replaced=undefined;context.fetch=async()=>{throw Error('offline')};vm.runInNewContext(client,context);await context.window.priveEnlacePerfilListo;assert.equal(replaced,undefined);
});

test('sitemap conserva barrios, excluye perfiles anteriores y genera canónicos únicos',()=>{
 const original='<urlset>\n<url><loc>https://masajistasprive.com/</loc></url>\n<url><loc>https://masajistasprive.com/masajistas-recoleta.html</loc></url>\n<url><loc>https://masajistasprive.com/p/pausado.html</loc></url>\n</urlset>';
 const active=[metadata({id:'activa',nombre:'Activa',zona:'CABA'})];
 const result=sitemap(original,active);
 assert.ok(result.includes('masajistas-recoleta.html'));
 assert.ok(!result.includes('pausado.html'));
 assert.ok(result.includes('/p/activa.html</loc>'));
 assert.ok(!result.includes('?v='));
 assert.equal(sitemap(result,active),result);
 assert.throws(()=>sitemap('error',active));
});
test('directorio ofrece enlaces reales y escapa contenido de las fichas',()=>{
 const html=directory([metadata({id:'activa',nombre:'<script>"&',zona:'CABA'})]);
 assert.ok(html.includes('href="/p/activa.html"'));
 assert.ok(html.includes('&lt;script&gt;&quot;&amp;'));
 assert.ok(!html.includes('<script>"&'));
 assert.ok(!html.includes('firebase'));
});

test('barrios tienen fichas iniciales correctas, seguras y sincronizables',async()=>{
 const template=await readFile(new URL('../masajistas-microcentro.html',import.meta.url),'utf8');
 const fixtures=[{id:'ok',nombre:'A <script>',zona:'Microcentro - CABA'}, {id:'no',nombre:'Otra',zona:'Congreso'}, {id:'pausado',nombre:'Pausada',zona:'Microcentro',estado:'pausado'},{id:'similar',nombre:'Similar',zona:'Microcentronorte'},{id:'alias',nombre:'Alias',zona:'Micro Centro'}];
 const first=areaPage(template,fixtures);
 const content=first.split('<!-- prive-zona-inicio -->')[1].split('<!-- prive-zona-fin -->')[0];
 assert.ok(content.includes('/p/ok.html'));assert.ok(content.includes('/p/alias.html'));
 assert.ok(!content.includes('/p/no.html'));assert.ok(!content.includes('/p/pausado.html'));assert.ok(!content.includes('/p/similar.html'));
 assert.ok(content.includes('A &lt;script&gt;'));assert.ok(first.includes("collection('perfiles_publicos').onSnapshot"));
 assert.equal(areaPage(first,fixtures),first);
 const empty=areaPage(first,[]).split('<!-- prive-zona-inicio -->')[1].split('<!-- prive-zona-fin -->')[0];
 assert.ok(!empty.includes('/p/ok.html'));assert.ok(empty.includes('Por ahora no hay perfiles'));
 assert.throws(()=>areaPage('<html></html>',fixtures));
 assert.equal(decode({mapValue:{fields:{zona:{stringValue:'Congreso'}}}}).zona,'Congreso');
});
