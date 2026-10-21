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
async function main(){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const template=await readFile(path.join(root,'perfil.html'),'utf8');
 const profiles=await publicProfiles();
 const entries=profiles.filter(p=>p.estado!=='pausado').map(metadata).sort((a,b)=>a.id.localeCompare(b.id));
 if(!entries.length)throw Error('No hay perfiles activos; se conservan las páginas existentes.');
 // Validar todo antes de escribir. Nunca borrar páginas ni imágenes originales.
 const pages=entries.map(meta=>({meta,html:page(template,meta)}));
 const manifest=Object.fromEntries(entries.map(m=>[m.id,{path:m.path,version:m.version}]));
 if(!process.argv.includes('--check')){
  await mkdir(path.join(root,'p'),{recursive:true});
  for(const {meta,html}of pages)await writeFile(path.join(root,meta.path.slice(1)),html);
  await writeFile(path.join(root,'p/indice.json'),JSON.stringify(manifest,null,2)+'\n');
 }
 console.log(`${entries.length} perfiles con portada y metadatos verificados.`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1});
