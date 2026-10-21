/* Enlaces públicos con metadatos legibles sin JavaScript. Sin lecturas Firebase. */
window.priveEnlacePerfilListo=(async()=>{
 const current=new URL(location.href);
 const id=current.searchParams.get('id')||decodeURIComponent(current.pathname.split('/').pop().replace(/\.html?$/i,''));
 if(!id||id==='perfil')return;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),2500);
 try{
  const response=await fetch('/p/indice.json',{signal:controller.signal});
  if(!response.ok)return;
  const manifest=await response.json();
  const entry=Object.hasOwn(manifest,id)?manifest[id]:null;
  if(!entry||!/^\/p\/[a-z0-9_-]+\.html$/.test(entry.path)||!/^[a-f0-9]{16}$/.test(entry.version))return;
  const next=new URL(entry.path,location.origin);
  next.search=current.search;next.searchParams.delete('id');next.searchParams.set('v',entry.version);
  next.hash=current.hash;
  history.replaceState(history.state,'',next.href);
 }catch{/* El perfil sigue disponible con el enlace original si no hay conexión. */}
 finally{clearTimeout(timer)}
})();
