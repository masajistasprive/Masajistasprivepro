import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export const origin='https://masajistasprive.com';
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function decode(value){
 if('stringValue' in value)return value.stringValue;
 if('booleanValue' in value)return value.booleanValue;
 if('arrayValue' in value)return (value.arrayValue.values||[]).map(decode);
 if('mapValue' in value)return Object.fromEntries(Object.entries(value.mapValue.fields||{}).map(([k,v])=>[k,decode(v)]));
 return null;
}
export async function publicProfiles(fetcher=fetch){
 const docs=[];let token='';const seen=new Set();
 do{
  const url=new URL('https://firestore.googleapis.com/v1/projects/masajistasprivepro/databases/(default)/documents/perfiles_publicos');
  url.searchParams.set('pageSize','100');if(token)url.searchParams.set('pageToken',token);
  const response=await fetcher(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`Catálogo público no disponible (${response.status}). No se modificaron páginas.`);
  const data=await response.json();
  if(data.error||!Array.isArray(data.documents))throw Error('Respuesta de catálogo inválida o vacía. Se conservan las páginas existentes.');
  docs.push(...data.documents);token=data.nextPageToken||'';
  if(token&&seen.has(token))throw Error('Paginación repetida');seen.add(token);
 }while(token);
 if(!docs.length)throw Error('Catálogo vacío: no se publican cambios.');
 return docs.map(doc=>({id:decodeURIComponent(doc.name.split('/').pop()),...Object.fromEntries(Object.entries(doc.fields||{}).map(([k,v])=>[k,decode(v)]))}));
}
export function metadata(profile){
 const id=profile.id;
 if(!/^[a-z0-9_-]+$/.test(id))throw Error('ID de perfil no compatible con enlace seguro');
 const name=String(profile.nombre||'Perfil').trim().slice(0,100);
 const description=[profile.categoria,profile.zona].filter(v=>typeof v==='string'&&v.trim()).join(' · ').slice(0,220)||'Perfil independiente en Masajistas Privé.';
 let image=profile.fotoPrincipal||profile.foto||(profile.fotosGaleria||[])[0]||'/img/logo.png';
 try{const url=new URL(image,origin+'/');if(!['http:','https:'].includes(url.protocol))throw Error();url.hash='';image=url.href}catch{throw Error(`Portada de ${id} sin URL pública. No se publican cambios incompletos.`)}
 const title=`${name} | Masajistas Privé`;
 const version=createHash('sha256').update(JSON.stringify([title,description,image])).digest('hex').slice(0,16);
 return {id,title,description,image,path:`/p/${id}.html`,version};
}
export function page(template,meta){
 let html=template.replace(/<title id="perfil-title">[\s\S]*?<\/title>/,`<title id="perfil-title">${escapeHTML(meta.title)}</title>`);
 const values={title:meta.title,description:meta.description,image:meta.image,url:origin+meta.path+'?v='+meta.version};
 for(const [key,value]of Object.entries(values)){
  const tag=`<meta property="og:${key}" content="${escapeHTML(value)}">`;
  const matcher=new RegExp(`<meta property="og:${key}" content="[^"]*">`);
  if(!matcher.test(html))throw Error(`Falta og:${key} en plantilla`);
  html=html.replace(matcher,()=>tag);
 }
 return html.replace('</head>',`<meta property="og:type" content="website">\n<meta name="description" content="${escapeHTML(meta.description)}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${escapeHTML(meta.title)}">\n<meta name="twitter:description" content="${escapeHTML(meta.description)}">\n<meta name="twitter:image" content="${escapeHTML(meta.image)}">\n<link rel="canonical" href="${origin+meta.path}">\n</head>`);
}
// El sitemap conserva las páginas editoriales y de barrios. Solo se añaden
// enlaces canónicos de perfiles actualmente publicados, sin versiones ni UTM.
export function sitemap(existing,entries){
 if(!existing.includes('</urlset>'))throw Error('Sitemap inválido: no se publican cambios.');
 const base=existing.replace(/\s*<url>\s*<loc>https:\/\/masajistasprive\.com\/(?:p\/[^<]*|perfiles\.html)<\/loc>[\s\S]*?<\/url>/g,'');
 const urls=[origin+'/perfiles.html',...entries.map(m=>origin+m.path)];
 return base.replace('</urlset>',urls.map(url=>'  <url><loc>'+escapeHTML(url)+'</loc></url>').join('\n')+'\n</urlset>');
}
export function directory(entries){
 const links=entries.map(m=>`<li><a href="${escapeHTML(m.path)}"><strong>${escapeHTML(m.title.replace(/ \| Masajistas Privé$/,''))}</strong><span>${escapeHTML(m.description)}</span><span class="open">Ver perfil →</span></a></li>`).join('\n');
 return `<!doctype html>
<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Directorio de masajistas en CABA | Masajistas Privé</title>
<meta name="description" content="Explorá los perfiles publicados en Masajistas Privé. Compará zonas y categorías de masajistas independientes en CABA y consultá desde su ficha.">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DXX740HP41"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-DXX740HP41');</script>
<link rel="canonical" href="${origin}/perfiles.html"><meta name="robots" content="index,follow"><meta name="theme-color" content="#0d0d0d"><link rel="icon" href="/img/monograma.png">
<style>*{box-sizing:border-box}body{margin:0;background:#0d0d0d;color:#eee;font:16px/1.6 system-ui,sans-serif}header,main,footer{max-width:1050px;margin:auto;padding:24px}header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px}header img{display:block;width:200px;max-width:65vw;height:auto}a{color:#dfc285}nav{display:flex;gap:20px;flex-wrap:wrap}h1{font:normal clamp(30px,6vw,48px)/1.2 Georgia,serif;color:#dfc285}p{color:#bbb;max-width:70ch}ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:16px}li a{height:100%;display:flex;flex-direction:column;gap:12px;text-decoration:none;border:1px solid #dfc28555;background:#151515;border-radius:12px;padding:24px}strong{font:normal 27px/1.3 Georgia,serif}li span{font-size:14px;color:#ccc;overflow-wrap:anywhere}.open{color:#dfc285;margin-top:auto}a:focus-visible{outline:3px solid #dfc285;outline-offset:4px}footer{border-top:1px solid #dfc28533;font-size:13px;color:#aaa}</style>
</head><body><header><a href="/"><img src="/img/logo.png" alt="Masajistas Privé" width="690" height="361"></a><nav aria-label="Navegación principal"><a href="/">Inicio</a><a href="/cuaderno.html">Cuaderno Privé</a></nav></header>
<main><h1>Directorio de masajistas en CABA</h1><p>Conocé las zonas y categorías de los perfiles publicados. Abrí cada ficha para ver sus fotografías, modalidades y datos de contacto actualizados.</p><nav aria-label="Explorar por zona"><a href="/masajistas-tribunales.html">Tribunales</a><a href="/masajistas-congreso.html">Congreso</a><a href="/masajistas-recoleta.html">Recoleta</a><a href="/masajistas-microcentro.html">Microcentro</a><a href="/masajistas-puerto-madero.html">Puerto Madero</a></nav><ul aria-label="Perfiles publicados">${links}</ul></main>
<footer>Masajistas Privé · Directorio exclusivo para mayores de 18 años. Las anunciantes son independientes. La disponibilidad se consulta en cada perfil.</footer></body></html>\n`;
}
export const areaFiles=['masajistas-tribunales.html','masajistas-congreso.html','masajistas-recoleta.html','masajistas-microcentro.html','masajistas-puerto-madero.html'];
const normalizeArea=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function areaPage(template,profiles){
 const config=template.match(/const area=("[^"]+"), aliases=(\[[^\]]+\]);/);
 if(!config)throw Error('No se pudo validar la zona de la página.');
 const area=JSON.parse(config[1]),aliases=JSON.parse(config[2]);
 const matches=profiles.filter(p=>{
  if(p.estado==='pausado')return false;
  const zone=normalizeArea(p.zona||p.traducciones?.es?.valorZona);
  return aliases.some(a=>zone===a||zone.includes(' '+a+' ')||zone.startsWith(a+' ')||zone.endsWith(' '+a));
 }).sort((a,b)=>String(a.nombre||'').localeCompare(String(b.nombre||''),'es'));
 const cards=matches.map(p=>{
  const meta=metadata(p),name=escapeHTML(p.nombre||'Anunciante');
  const zone=escapeHTML(p.zona||p.traducciones?.es?.valorZona||area);
  const mode=escapeHTML(p.modalidad||p.traducciones?.es?.valorModalidad||'Consultar modalidad');
  return `<article class="card"><a class="photo" href="${meta.path}"><img src="${escapeHTML(meta.image)}" alt="Perfil de ${name} en ${zone}" loading="lazy" decoding="async"></a><div class="info"><h3>${name}</h3><p>📍 ${zone} · ${mode}</p><div class="buttons"><a class="btn gold" href="${meta.path}">Ver perfil</a></div></div></article>`;
 }).join('\n')||`<div class="status">Por ahora no hay perfiles publicados en ${escapeHTML(area)}. Podés explorar otras zonas o el <a href="perfiles.html">directorio completo</a>.</div>`;
 const content='<!-- prive-zona-inicio -->\n'+cards+'\n<!-- prive-zona-fin -->';
 if(template.includes('<!-- prive-zona-inicio -->'))return template.replace(/<!-- prive-zona-inicio -->[\s\S]*?<!-- prive-zona-fin -->/,()=>content);
 const placeholder=`<div class="status">Cargando perfiles de ${area}…</div>`;
 if(!template.includes(placeholder))throw Error('Falta el contenedor inicial de perfiles de '+area);
 return template.replace(placeholder,()=>content);
}
async function main(){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const template=await readFile(path.join(root,'perfil.html'),'utf8');
 const profiles=await publicProfiles();
 const entries=profiles.filter(p=>p.estado!=='pausado').map(metadata).sort((a,b)=>a.id.localeCompare(b.id));
 if(!entries.length)throw Error('No hay perfiles activos; se conservan las páginas existentes.');
 // Validar todo antes de escribir. Nunca borrar páginas ni imágenes originales.
 const pages=entries.map(meta=>({meta,html:page(template,meta)}));
 const manifest=Object.fromEntries(entries.map(m=>[m.id,{path:m.path,version:m.version}]));
 const nextSitemap=sitemap(await readFile(path.join(root,'sitemap.xml'),'utf8'),entries);
 const nextDirectory=directory(entries);
 const nextAreas=await Promise.all(areaFiles.map(async file=>({file,html:areaPage(await readFile(path.join(root,file),'utf8'),profiles)})));
 if(!process.argv.includes('--check')){
  const {generateThumbnails}=await import('./miniaturas.mjs');
  console.log('Miniaturas:',JSON.stringify(await generateThumbnails(profiles,root)));
  await mkdir(path.join(root,'p'),{recursive:true});
  for(const {meta,html}of pages)await writeFile(path.join(root,meta.path.slice(1)),html);
  await writeFile(path.join(root,'p/indice.json'),JSON.stringify(manifest,null,2)+'\n');
  await writeFile(path.join(root,'sitemap.xml'),nextSitemap);
  await writeFile(path.join(root,'perfiles.html'),nextDirectory);
  for(const {file,html}of nextAreas)await writeFile(path.join(root,file),html);
 }
 console.log(`${entries.length} perfiles con portada y metadatos verificados.`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1});
