import {collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, limit, orderBy} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

export async function montarModeracionClub({db,container}) {
  const root=container;
  const el=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;e.className=cls;return e};
  const btn=(text,fn)=>{const b=el('button',text,'club-button');b.type='button';b.onclick=fn;return b};
  const stamp=x=>x?.toDate?.().toLocaleString('es-AR')||'Sin fecha';
  const style=el('style');style.textContent=`.club-button{border:1px solid #80663a;background:#241d13;color:#f2d69b;padding:10px 12px;border-radius:8px;margin:4px;min-height:42px}.club-item{border:1px solid #4a3c25;background:#1b1b1b;border-radius:10px;padding:13px;margin:12px 0;overflow-wrap:anywhere}.club-item h3{color:#dfc285;margin:8px 0}.club-small{font-size:12px;color:#aaa}.club-alert{color:#ffaaa5}.club-item p{white-space:pre-wrap;line-height:1.5}`;
  root.append(style);
  const info=el('p','Cargando moderación…','muted');root.append(info);
  const tabs=el('div');root.append(tabs);
  const content=el('div');root.append(content);
  let active=true;
  const showError=e=>{console.error('Moderación Club',e);info.textContent='Error: '+(e.code||e.message||'desconocido')};
  async function cargarDenuncias(){
    content.replaceChildren();info.textContent='Cargando denuncias…';
    try{
      const snap=await getDocs(query(collection(db,'club_reports'),limit(100)));
      const reports=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
      if(!active)return;
      info.textContent=`Denuncias encontradas: ${reports.length} (máximo 100)`;
      if(!reports.length)content.append(el('p','No hay denuncias.'));
      for(const r of reports){
        const box=el('section','','club-item');box.append(el('div',stamp(r.createdAt),'club-small'),el('h3','Denuncia sobre '+(r.postId||'publicación desconocida')),el('p',r.reason||'Sin motivo'));
        box.append(el('div','Denunciante: '+(r.reporterUid||'—'),'club-small'));
        box.append(btn('Ver publicación',async()=>{try{const s=await getDoc(doc(db,'club_posts',r.postId));alert(s.exists()?`Título: ${s.data().title||''}\nEstado: ${s.data().status||''}\n\n${s.data().body||''}`:'La publicación ya no existe.')}catch(e){showError(e)}}));
        box.append(btn('Ocultar publicación',async()=>{if(!confirm('¿Ocultar esta publicación del Club?'))return;try{await updateDoc(doc(db,'club_posts',r.postId),{status:'hidden'});alert('Publicación oculta.');}catch(e){showError(e)}}));
        box.append(btn('Eliminar denuncia',async()=>{if(!confirm('¿Eliminar este registro de denuncia?'))return;try{await deleteDoc(doc(db,'club_reports',r.id));await cargarDenuncias()}catch(e){showError(e)}}));
        content.append(box);
      }
    }catch(e){showError(e)}
  }
  async function cargarPublicaciones(){
    content.replaceChildren();info.textContent='Cargando publicaciones…';
    try{
      const snap=await getDocs(query(collection(db,'club_posts'),limit(100)));
      const posts=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
      if(!active)return;
      info.textContent=`Publicaciones encontradas: ${posts.length} (máximo 100)`;
      if(!posts.length)content.append(el('p','Todavía no hay publicaciones.'));
      for(const p of posts){
        const box=el('section','','club-item');box.append(el('div',`${p.author||'Anónimo'} · ${stamp(p.createdAt)} · ${p.status||'sin estado'}`,'club-small'),el('h3',p.title||'Sin título'),el('p',p.body||''));
        box.append(btn(p.status==='published'?'Ocultar':'Restaurar',async()=>{const status=p.status==='published'?'hidden':'published';if(!confirm(`¿Cambiar estado a ${status}?`))return;try{await updateDoc(doc(db,'club_posts',p.id),{status});await cargarPublicaciones()}catch(e){showError(e)}}));
        box.append(btn('Comentarios',()=>cargarComentarios(p.id,box)));
        box.append(btn('Eliminar publicación',async()=>{if(!confirm('¿Eliminar DEFINITIVAMENTE esta publicación? Las subcolecciones de comentarios y votos pueden quedar almacenadas.'))return;try{await deleteDoc(doc(db,'club_posts',p.id));await cargarPublicaciones()}catch(e){showError(e)}}));
        content.append(box);
      }
    }catch(e){showError(e)}
  }
  async function cargarComentarios(postId,box){
    const old=box.querySelector('.club-comments');if(old){old.remove();return}
    const area=el('div','Cargando comentarios…','club-comments');box.append(area);
    try{
      const snap=await getDocs(query(collection(db,'club_posts',postId,'comments'),limit(100)));
      area.replaceChildren();if(snap.empty)area.append(el('p','No hay comentarios.'));
      for(const s of snap.docs){const c=s.data(),line=el('div','','club-item');line.append(el('div',`${c.author||'Anónimo'} · ${stamp(c.createdAt)}`,'club-small'),el('p',c.body||''));line.append(btn('Eliminar comentario',async()=>{if(!confirm('¿Eliminar este comentario definitivamente?'))return;try{await deleteDoc(doc(db,'club_posts',postId,'comments',s.id));line.remove()}catch(e){showError(e)}}));area.append(line)}
    }catch(e){showError(e);area.textContent='No se pudieron cargar los comentarios.'}
  }
  tabs.append(btn('🚩 Denuncias',cargarDenuncias),btn('📝 Publicaciones',cargarPublicaciones));
  await cargarDenuncias();
  return ()=>{active=false};
}
