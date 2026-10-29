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


// Volver a comprobar al compartir: una foto nueva puede estar sincronizándose.
window.priveResolverEnlacePerfil=async function(profile){
 const current=new URL(location.href);
 const id=current.searchParams.get('id')||decodeURIComponent(current.pathname.split('/').pop().replace(/\.html?$/i,''));
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
 try{
  const response=await fetch('/p/indice.json',{signal:controller.signal,cache:'no-store'});
  if(!response.ok)throw Error('Portada pendiente');
  const manifest=await response.json(),entry=Object.hasOwn(manifest,id)?manifest[id]:null;
  const photo=new URL(profile.fotoPrincipal||profile.foto||(profile.fotosGaleria||[])[0]||'/img/logo.png',location.origin);photo.hash='';
  if(!entry||entry.path!=='/p/'+id+'.html'||!/^\/p\/[a-z0-9_-]+\.html$/.test(entry.path)||!/^[a-f0-9]{16}$/.test(entry.version)||entry.image!==photo.href)throw Error('Portada pendiente');
  const next=new URL(entry.path,location.origin);next.search=current.search;next.searchParams.delete('id');next.searchParams.set('v',entry.version);next.hash=current.hash;
  return next.href;
 }finally{clearTimeout(timer)}
};

