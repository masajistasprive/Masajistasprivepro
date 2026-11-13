// La ficha se muestra enseguida. Solo se comparte una tarjeta ya publicada y vigente.
window.priveEnlacePerfilListo=Promise.resolve(null);
window.priveResolverEnlacePerfil=async function(profile){
 const current=new URL(location.href);
 const id=current.searchParams.get('id')||decodeURIComponent(current.pathname.split('/').pop().replace(/\.html?$/i,''));
 if(!/^[a-z0-9_-]{1,100}$/.test(id)||id==='perfil'||profile.estado==='pausado')return null;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
 try{
  const fieldsWanted=['nombre','categoria','categoriasPublicacion','zona','fotoPrincipal','foto','fotosGaleria','estado'];
  const url='https://firestore.googleapis.com/v1/projects/masajistasprivepro/databases/(default)/documents/perfiles_publicos/'+encodeURIComponent(id)+'?'+fieldsWanted.map(f=>'mask.fieldPaths='+f).join('&');
  const response=await fetch(url,{signal:controller.signal,cache:'no-store'});
  if(!response.ok)return null;
  const fields=(await response.json()).fields||{};
  if(fields.estado?.stringValue==='pausado')return null;
  const photo=new URL(fields.fotoPrincipal?.stringValue||fields.foto?.stringValue||fields.fotosGaleria?.arrayValue?.values?.[0]?.stringValue||'/img/logo.png','https://masajistasprive.com/');photo.hash='';
  if(!['http:','https:'].includes(photo.protocol))return null;
  const title=(fields.nombre?.stringValue||'Perfil').trim().slice(0,100)+' | Masajistas Privé';
  const categories=fields.categoriasPublicacion?.arrayValue;
  const category=categories?['terapeuticas','sensuales','fantasias'].filter(c=>(categories.values||[]).some(v=>v.stringValue===c)).join(' · '):fields.categoria?.stringValue;
  const description=[category,fields.zona?.stringValue].filter(v=>typeof v==='string'&&v.trim()).join(' · ').slice(0,220)||'Perfil independiente en Masajistas Privé.';
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([title,description,photo.href])));
  const version=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);
  // Un enlace nuevo antes de publicar la tarjeta guardaría en WhatsApp la portada anterior.
  const published=await fetch('https://masajistasprive.com/p/indice.json',{signal:controller.signal,cache:'no-store'});
  if(!published.ok)return null;
  const entry=(await published.json())[id];
  if(entry?.version!==version||entry?.image!==photo.href)return null;
  const next=new URL('/p/'+id+'.html','https://masajistasprive.com');
  next.search=current.search;next.searchParams.delete('id');next.searchParams.set('v',version);next.hash=current.hash;
  // Comprobar también el HTML servido: el índice puede adelantarse al despliegue o a la caché.
  const card=await fetch(next.href,{signal:controller.signal,cache:'no-store'});
  if(!card.ok)return null;
  const html=await card.text();
  const escaped=photo.href.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if(!html.includes('<meta property="og:image" content="'+escaped+'">')||!html.includes('/p/'+id+'.html?v='+version+'"'))return null;
  return next.href;
 }catch{return null;}finally{clearTimeout(timer)}
};
