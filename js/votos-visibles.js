/* Consultas de votos solo para controles próximos a la vista.
   Sin caché persistente ni cambios en votos o permisos. */
(()=>{
 'use strict';
 const records=new Map(),nodes=new Map();let queued=false,suspended=false;
 const active=()=>!suspended&&document.visibilityState!=='hidden';
 function stop(r){clearTimeout(r.timer);r.timer=null;if(r.stop){r.stop();r.stop=null;}}
 function reconcile(r){
  if(active()&&r.visible.size){clearTimeout(r.timer);r.timer=null;if(!r.stop)r.stop=r.start();}
  else if(!active())stop(r);
  else if(r.stop&&!r.timer)r.timer=setTimeout(()=>{r.timer=null;if(!r.visible.size)stop(r);},30000);
 }
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  for(const e of entries){const r=nodes.get(e.target);if(!r)continue;if(e.isIntersecting)r.visible.add(e.target);else r.visible.delete(e.target);reconcile(r);}
 },{rootMargin:'300px 0px'}):null;
 function fallback(){if(observer)return;for(const [node,r]of nodes){const b=node.getBoundingClientRect();if(b.width&&b.height&&b.bottom>=-300&&b.top<=innerHeight+300)r.visible.add(node);else r.visible.delete(node);}for(const r of records.values())reconcile(r);}
 function scan(){queued=false;
  for(const [node,r]of nodes)if(!node.isConnected){observer?.unobserve(node);nodes.delete(node);r.visible.delete(node);reconcile(r);}
  for(const r of records.values())for(const node of document.querySelectorAll('['+r.attribute+']')){
   if(node.getAttribute(r.attribute)!==r.id||nodes.has(node))continue;
   nodes.set(node,r);r.paint();if(observer)observer.observe(node);
  }
  fallback();
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(scan);}}
 window.priveVotosVisibles={registrar(key,attribute,id,start,paint){if(!records.has(key))records.set(key,{attribute,id,start,paint,visible:new Set(),stop:null,timer:null});schedule();}};
 // Evitar recorrer todas las tarjetas por cambios del DOM ajenos a los corazones.
  // Las tarjetas se recrean al filtrar/renderizar: detectar altas y bajas.
  const afectaVotos=node=>{
    if(node.nodeType!==1)return false;
    if(node.matches?.('[data-prive-voto], [data-review-id]'))return true;
    return !!node.querySelector?.('[data-prive-voto], [data-review-id]');
  };
  new MutationObserver(changes=>{
    for(const change of changes){
      for(const node of change.addedNodes)if(afectaVotos(node)){schedule();return;}
      for(const node of change.removedNodes)if(afectaVotos(node)){schedule();return;}
    }
  }).observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('visibilitychange',()=>{for(const r of records.values())reconcile(r);schedule();});
 window.addEventListener('pagehide',()=>{suspended=true;for(const r of records.values())stop(r);});
 window.addEventListener('pageshow',()=>{suspended=false;for(const r of records.values())reconcile(r);schedule();});
 if(!observer){window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);}
})();
