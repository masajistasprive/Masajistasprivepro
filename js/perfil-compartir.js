// La carga de la ficha no espera la generación de páginas estáticas.
window.priveEnlacePerfilListo=Promise.resolve(null);

// La vista previa se resuelve en el servidor desde la ficha pública actual.
window.priveResolverEnlacePerfil=async function(profile){
 const current=new URL(location.href);
 const id=current.searchParams.get('id')||decodeURIComponent(current.pathname.split('/').pop().replace(/\.html?$/i,''));
 if(!/^[a-z0-9_-]{1,100}$/.test(id)||id==='perfil'||profile.estado==='pausado')return null;
 const next=new URL('/p/'+id+'.html','https://masajistasprive.com');
 next.search=current.search;next.searchParams.delete('id');next.searchParams.delete('v');next.hash=current.hash;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
 try{
  const url='https://firestore.googleapis.com/v1/projects/masajistasprivepro/databases/(default)/documents/perfiles_publicos/'+encodeURIComponent(id)+'?mask.fieldPaths=fotoPrincipal&mask.fieldPaths=foto&mask.fieldPaths=fotosGaleria&mask.fieldPaths=estado';
  const response=await fetch(url,{signal:controller.signal,cache:'no-store'});
  if(response.status===404)return null;
  if(!response.ok)throw Error('No se pudo comprobar la portada');
  const fields=(await response.json()).fields||{};
  if(fields.estado?.stringValue==='pausado')return null;
  const photo=new URL(fields.fotoPrincipal?.stringValue||fields.foto?.stringValue||fields.fotosGaleria?.arrayValue?.values?.[0]?.stringValue||'/img/logo.png',location.origin);photo.hash='';
  let a=2166136261,b=5381;for(const c of photo.href){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0)}
  next.searchParams.set('v',(a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0'));
 }catch{
  // Aun sin esta consulta, el servidor consulta la portada al abrir el enlace.
  next.searchParams.set('v',Date.now().toString(36));
 }finally{clearTimeout(timer)}
 return next.href;
};
