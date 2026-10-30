import {leerEncuadres,aplicarEncuadre} from './encuadres-foto.js?v=20261030-encuadres3';
// Solo portada y destacadas: nunca cambia las fotos de la galería ni el original.
const selector='.card-image img, #stories-destacadas-container .story-ring img, #stories-nuevas-container .story-ring img';
const activos=new Map();
const resize=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{
  const padres=new Set(entries.map(e=>e.target));
  for(const [img,item]of activos)if(padres.has(img.parentElement))aplicarEncuadre(img,item.valor);
}):null;
let pendiente=false;
function sincronizar(){
  pendiente=false;
  for(const [img,item]of activos){
    if(!img.isConnected||!img.matches(selector)||img.getAttribute('src')!==item.src){
      resize?.unobserve(item.padre);img.removeEventListener('load',item.cargar);img.style.cssText=item.estilo;activos.delete(img);
    }
  }
  for(const img of document.querySelectorAll(selector)){
    if(activos.has(img))continue;
    const valor=leerEncuadres(img.getAttribute('src'));
    if(!valor)continue;
    // Cada vitrina usa su encuadre; las fotos antiguas conservan el automático superior en nuevas.
    const item={src:img.getAttribute('src'),padre:img.parentElement,estilo:img.style.cssText,valor:img.closest('#stories-nuevas-container')?valor.nueva:img.closest('.story-ring')?valor.destacada:valor.portada};
    item.cargar=()=>aplicarEncuadre(img,item.valor);
    activos.set(img,item);img.addEventListener('load',item.cargar);resize?.observe(item.padre);item.cargar();
  }
}
function programar(){if(!pendiente){pendiente=true;requestAnimationFrame(sincronizar);}}
function afectaEncuadres(node){
 if(node.nodeType!==1)return false;
 if(activos.has(node)||node.matches?.(selector)||node.querySelector?.(selector))return true;
 // Un contenedor retirado puede haber perdido los selectores de sus ancestros.
 if(node.querySelector?.('img'))for(const img of activos.keys())if(node.contains(img))return true;
 return false;
}
const observer=new MutationObserver(changes=>{
 for(const change of changes){
  if(change.type==='attributes'){if(afectaEncuadres(change.target)){programar();return;}continue;}
  for(const node of change.addedNodes)if(afectaEncuadres(node)){programar();return;}
  for(const node of change.removedNodes)if(afectaEncuadres(node)){programar();return;}
 }
});
observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
window.addEventListener('resize',programar);
// Los filtros pueden mostrar de nuevo una tarjeta cuyas dimensiones eran cero.
document.addEventListener('click',programar);document.addEventListener('change',programar);
sincronizar();
