/* Enlaces públicos con metadatos legibles sin JavaScript. Sin lecturas Firebase. */
window.priveEnlacePerfilListo=(async()=>{
 const current=new URL(location.href);
 const id=current.searchParams.get('id')||decodeURIComponent(current.pathname.split('/').pop().replace(/\.html?$/i,''));
 if(!id||id==='perfil')return;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),2500);
 try{
  const response=await fetch('/p/indice.json',{signal:controller.signal,cache:'no-store'});
  if(!response.ok)return;
  const manifest=await response.json();
  const entry=Object.hasOwn(manifest,id)?manifest[id]:null;
  if(!entry||!/^\/p\/[a-z0-9_-]+\.html$/.test(entry.path)||!/^[a-f0-9]{16}$/.test(entry.version))return;
  const next=new URL(entry.path,location.origin);
  next.search=current.search;next.searchParams.delete('id');next.searchParams.set('v',entry.version);
  next.hash=current.hash;
  // Resolver el enlace sin simular navegación: replaceState dispara otra
  // page_view con la medición mejorada de GA4 aunque la ficha sea la misma.
  return next.href;
 }catch{/* El perfil sigue disponible con el enlace original si no hay conexión. */}
 finally{clearTimeout(timer)}
})();


// Comprobar la portada publicada al compartir y evitar un índice antiguo en la caché.
window.priveResolverEnlacePerfil=async function(profile){
 const current=new URL(location.href);
 const id=current.searchParams.get('id')||decodeURIComponent(current.pathname.split('/').pop().replace(/\.html?$/i,''));
 if(!id||id==='perfil'||profile.estado==='pausado')return null;
 // El enlace dinámico funciona antes de que se genere la portada pública.
 const fallback=new URL('/perfil.html',location.origin);
 fallback.search=current.search;
 fallback.searchParams.set('id',id);
 fallback.searchParams.delete('v');
 fallback.hash=current.hash;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
 try{
  const response=await fetch('/p/indice.json?share_check='+Date.now(),{signal:controller.signal,cache:'no-store'});
  if(!response.ok)return fallback.href;
  const manifest=await response.json(),entry=Object.hasOwn(manifest,id)?manifest[id]:null;
  const photo=new URL(profile.fotoPrincipal||profile.foto||(profile.fotosGaleria||[])[0]||'/img/logo.png',location.origin);photo.hash='';
  if(!entry||entry.path!=='/p/'+id+'.html'||!/^\/p\/[a-z0-9_-]+\.html$/.test(entry.path)||!/^[a-f0-9]{16}$/.test(entry.version))return fallback.href;
  if(entry.image!==photo.href){
   // Una pestaña abierta antes de cambiar la foto no debe quedar bloqueada para siempre.
   // Confirmar contra la ficha pública actual; nunca compartir una portada desactualizada.
   const url='https://firestore.googleapis.com/v1/projects/masajistasprivepro/databases/(default)/documents/perfiles_publicos/'+encodeURIComponent(id)+'?mask.fieldPaths=fotoPrincipal&mask.fieldPaths=foto&mask.fieldPaths=fotosGaleria&mask.fieldPaths=estado';
   const fresh=await fetch(url,{signal:controller.signal,cache:'no-store'});
   if(!fresh.ok)return fallback.href;
   const fields=(await fresh.json()).fields||{};
   if(fields.estado?.stringValue==='pausado')return null;
   const source=fields.fotoPrincipal?.stringValue||fields.foto?.stringValue||fields.fotosGaleria?.arrayValue?.values?.[0]?.stringValue;
   if(!source)return fallback.href;
   const currentPhoto=new URL(source,location.origin);currentPhoto.hash='';
   if(entry.image!==currentPhoto.href)return fallback.href;
  }
  const next=new URL(entry.path,location.origin);next.search=current.search;next.searchParams.delete('id');next.searchParams.set('v',entry.version);next.hash=current.hash;
  return next.href;
 }catch{return fallback.href}
 finally{clearTimeout(timer)}
};

