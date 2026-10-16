import {leerEncuadres,aplicarEncuadre} from './encuadres-foto.js?v=20261016-1';
// Solo portada y destacadas: nunca cambia las fotos de la galería ni el original.
const selector='.card-image img, #stories-destacadas-container .story-ring img';
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
    const item={src:img.getAttribute('src'),padre:img.parentElement,estilo:img.style.cssText,valor:img.closest('.story-ring')?valor.destacada:valor.portada};
    item.cargar=()=>aplicarEncuadre(img,item.valor);
    activos.set(img,item);img.addEventListener('load',item.cargar);resize?.observe(item.padre);item.cargar();
  }
}
function programar(){if(!pendiente){pendiente=true;requestAnimationFrame(sincronizar);}}
const observer=new MutationObserver(programar);
observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
window.addEventListener('resize',programar);
// Los filtros pueden mostrar de nuevo una tarjeta cuyas dimensiones eran cero.
document.addEventListener('click',programar);document.addEventListener('change',programar);
sincronizar();
