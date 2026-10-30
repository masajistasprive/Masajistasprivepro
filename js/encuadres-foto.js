// El fragmento conserva la URL original y no se envía al servidor de imágenes.
const CLAVE='prive-encuadre-v1=';
const CLAVE_NUEVA='prive-nueva-v1=';
const limite=(v,min,max,def)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):def;
export function normalizarEncuadres(value){
  const uno=(v,top)=>({x:limite(v?.x,0,100,50),y:limite(v?.y,0,100,top),zoom:limite(v?.zoom,25,300,100)});
  return {portada:uno(value?.portada,0),destacada:uno(value?.destacada,50),nueva:uno(value?.nueva,0)};
}
export function leerEncuadres(url){
  if(typeof url!=='string')return null;
  const fragmento=url.split('#')[1]||'';
  const dato=fragmento.split('&').find(x=>x.startsWith(CLAVE));
  if(!dato)return null;
  const numeros=dato.slice(CLAVE.length).split(',');
  if(numeros.length!==6||numeros.some(x=>x.trim()===''||!Number.isFinite(Number(x))))return null;
  const datoNueva=fragmento.split('&').find(x=>x.startsWith(CLAVE_NUEVA));
  const nueva=datoNueva?.slice(CLAVE_NUEVA.length).split(',');
  const valida=nueva?.length===3&&nueva.every(x=>x.trim()!==''&&Number.isFinite(Number(x)));
  return normalizarEncuadres({portada:{x:numeros[0],y:numeros[1],zoom:numeros[2]},destacada:{x:numeros[3],y:numeros[4],zoom:numeros[5]},nueva:valida?{x:nueva[0],y:nueva[1],zoom:nueva[2]}:undefined});
}
export function guardarEncuadres(url,valor){
  if(typeof url!=='string'||!url)return url;
  // Base64 se migra antes de guardar; el contenido binario no se altera aquí.
  if(url.startsWith('data:'))return url;
  const indice=url.indexOf('#'),base=indice<0?url:url.slice(0,indice);
  const partes=(indice<0?'':url.slice(indice+1)).split('&').filter(x=>x&&!x.startsWith(CLAVE)&&!x.startsWith(CLAVE_NUEVA));
  if(valor){const e=normalizarEncuadres(valor);partes.push(CLAVE+[e.portada.x,e.portada.y,e.portada.zoom,e.destacada.x,e.destacada.y,e.destacada.zoom].map(x=>Math.round(x*100)/100).join(','));partes.push(CLAVE_NUEVA+[e.nueva.x,e.nueva.y,e.nueva.zoom].map(x=>Math.round(x*100)/100).join(','));}
  return base+(partes.length?'#'+partes.join('&'):'');
}
export function geometriaEncuadre(iw,ih,w,h,valor){
  if(![iw,ih,w,h].every(n=>Number.isFinite(n)&&n>0))return null;
  const e=normalizarEncuadres({portada:valor}).portada;
  const escala=Math.max(w/iw,h/ih)*e.zoom/100;
  const ancho=iw*escala,alto=ih*escala;
  return {width:ancho,height:alto,left:(w-ancho)*e.x/100,top:(h-alto)*e.y/100};
}
export function aplicarEncuadre(img,valor){
  const frame=img.parentElement;
  if(!frame)return;
  const g=geometriaEncuadre(img.naturalWidth,img.naturalHeight,frame.clientWidth,frame.clientHeight,valor);
  if(!g)return;
  frame.style.position='relative';frame.style.overflow='hidden';
  const props={position:'absolute',display:'block',width:g.width+'px',height:g.height+'px',left:g.left+'px',top:g.top+'px','max-width':'none','max-height':'none','min-width':'0','aspect-ratio':'auto','object-fit':'fill',transform:'none',transition:'none',margin:'0','border-radius':'0'};
  for(const [k,v]of Object.entries(props))img.style.setProperty(k,v,'important');
}
