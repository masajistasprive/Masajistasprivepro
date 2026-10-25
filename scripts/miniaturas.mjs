import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {publicProfiles,origin} from './perfiles-compartir.mjs';
const recipe='story-512-outside-webp85-v1',maxBytes=10*1024*1024;
const hash=value=>createHash('sha256').update(value).digest('hex');
export function sourceURL(raw){
 try{const u=new URL(raw,origin+'/');u.hash='';
  if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
  if(u.origin===origin&&/^\/img\/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp)$/i.test(u.pathname)&&!u.pathname.includes('/miniaturas/')&&!/\/(?:logo|monograma)\.png$/i.test(u.pathname))return u;
  if(u.hostname==='res.cloudinary.com'&&/^\/[^/]+\/image\/upload\//.test(u.pathname)&&/\.(?:jpe?g|png|webp)$/i.test(u.pathname))return u;
 }catch{}return null;
}
export async function imageBytes(url,root,fetcher=fetch){
 if(url.origin===origin){const file=path.resolve(root,'.'+url.pathname);if(!file.startsWith(path.resolve(root,'img')+path.sep))throw Error('Ruta de imagen no válida');if((await stat(file)).size>maxBytes)throw Error('Imagen demasiado grande');return readFile(file)}
 const res=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(30000)});
 if(!res.ok)throw Error('Imagen no disponible: '+res.status);
 if(Number(res.headers.get('content-length')||0)>maxBytes)throw Error('Imagen demasiado grande');
 const reader=res.body.getReader(),parts=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw Error('Imagen demasiado grande')}parts.push(value)}}finally{reader.releaseLock()}
 return Buffer.concat(parts);
}
export async function createThumbnail(input,sharp){
 return sharp(input,{limitInputPixels:40000000,animated:false}).rotate().resize({width:512,height:512,fit:'outside',withoutEnlargement:true}).webp({quality:85,effort:5}).toBuffer();
}
export async function generateThumbnails(profiles,root,{sharp,fetcher=fetch}={}){
 if(!sharp)sharp=createRequire(new URL('../qa/package.json',import.meta.url))('sharp');
 let old={};try{old=JSON.parse(await readFile(path.join(root,'img/miniaturas/indice.json'),'utf8'))}catch{}
 const manifest={},stats={generated:0,cached:0,failed:0,notSmaller:0,originalBytes:0,thumbnailBytes:0};
 const sources=[...new Set(profiles.filter(p=>p.estado!=='pausado').map(p=>sourceURL(p.fotoPrincipal||p.foto||'')?.href).filter(Boolean))].sort();
 await mkdir(path.join(root,'img/miniaturas'),{recursive:true});
 for(const source of sources){try{
  const url=new URL(source);let bytes;
  const fingerprint=url.origin===origin?hash(bytes=await imageBytes(url,root,fetcher)):hash(source);
  const id=hash(recipe+'\n'+source+'\n'+fingerprint).slice(0,24),file='img/miniaturas/'+id+'.webp';
  const previous=old[source];
  if(previous?.file===file&&/^img\/miniaturas\/[a-f0-9]{24}\.webp$/.test(previous.file)&&(await stat(path.join(root,file)).catch(()=>null))?.size===previous.bytes){manifest[source]=previous;stats.cached++;stats.originalBytes+=previous.originalBytes;stats.thumbnailBytes+=previous.bytes;continue}
  bytes ||= await imageBytes(url,root,fetcher);
  const result=await createThumbnail(bytes,sharp);
  if(result.length>=bytes.length){stats.notSmaller++;continue}
  const info=await sharp(result).metadata();
  await writeFile(path.join(root,file),result);
  manifest[source]={file,bytes:result.length,originalBytes:bytes.length,width:info.width,height:info.height};
  stats.generated++;stats.originalBytes+=bytes.length;stats.thumbnailBytes+=result.length;
 }catch(error){stats.failed++;console.warn('Miniatura omitida; se usará el original:',error.message)}}
 // Archivos antiguos se conservan para las páginas aún almacenadas en caché.
 await writeFile(path.join(root,'img/miniaturas/indice.json'),JSON.stringify(manifest,null,2)+'\n');
 const client=Object.fromEntries(Object.entries(manifest).map(([source,item])=>[source,'/'+item.file]));
 await writeFile(path.join(root,'js/miniaturas-prive.js'),'/* Miniaturas derivadas; originales intactos. Generado por scripts/miniaturas.mjs. */\nwindow.priveMiniaturas=Object.freeze('+JSON.stringify(client,null,2)+');\n');
 return stats;
}
async function main(){const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const profiles=await publicProfiles();console.log(JSON.stringify(await generateThumbnails(profiles,root)))}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1});
