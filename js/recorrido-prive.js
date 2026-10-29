/* Medición de entrada con GA4 existente. Sin Firebase, nuevos identificadores ni peticiones propias. */
(()=>{
 'use strict';
 if(window.priveRecorrido)return;
 const VERSION='20261020_1',KEY='prive_recorrido_v1',TIMEOUT=30*60*1000;
 const esLanding=location.pathname.endsWith('/landing.html'),esPortal=/\/(?:index\.html)?$/.test(location.pathname);
 const validos=['landing','directo','sin_memoria'];let memoria=null,perfilActual='',modal=null,botonEdad=null;
 function leer(key){try{return sessionStorage.getItem(key)}catch{return null}}
 function guardar(key,value){try{sessionStorage.setItem(key,value);return true}catch{return false}}
 function estado(){
  const ahora=Date.now();let previo=memoria;
  if(!previo){try{previo=JSON.parse(leer(KEY)||'null')}catch{}}
  if(!previo||!validos.includes(previo.origen)||!Number.isFinite(previo.ultima)||ahora-previo.ultima>TIMEOUT||previo.ultima>ahora||!previo.pasos||typeof previo.pasos!=='object'||Array.isArray(previo.pasos))previo={origen:esLanding?'landing':'directo',ultima:ahora,pasos:{}};
  // Llegar a la landing inicia ese recorrido; una navegación posterior conserva su origen.
  if(esLanding&&previo.origen==='directo')previo={origen:'landing',ultima:ahora,pasos:{}};
  previo.ultima=ahora;memoria=previo;if(!guardar(KEY,JSON.stringify(previo)))previo.origen='sin_memoria';return previo;
 }
 function evento(nombre,params={}){
  if(typeof window.gtag!=='function')return;
  try{window.gtag('event',nombre,{recorrido_version:VERSION,...params,transport_type:'beacon'})}catch{}
 }
 function paso(nombre,params={}){
  const s=estado();if(s.pasos[nombre])return;
  if(typeof window.gtag!=='function')return;
  s.pasos[nombre]=true;guardar(KEY,JSON.stringify(s));
  evento('prive_'+s.origen+'_'+nombre,params);
 }
 function mayor(){return leer('edadVerificada')==='true'}
 function aceptarEdad(origen){
  guardar('edadVerificada','true');paso('edad_aceptada',{ubicacion:origen});
  if(modal){modal.style.display='none';document.body.style.overflow=overflowPrevio;paso('portal_visto');}
 }
 let overflowPrevio='';
 function prepararEnlace(a){
  try{
   const destino=new URL(a.getAttribute('href'),location.href);if(destino.origin!==location.origin)return;
   const permitidos=new Set(['utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term','utm_source_platform','fbclid','gclid','gbraid','wbraid']);
   for(const [key,value]of new URL(location.href).searchParams){
    const k=key.trim().toLowerCase();if(!permitidos.has(k)||!value||value.length>2048)continue;
    destino.searchParams.set(k,['utm_source','utm_medium','utm_source_platform'].includes(k)?value.trim().toLowerCase():value.trim());
   }
   a.setAttribute('href',destino.pathname+destino.search+destino.hash);
  }catch{}
 }
 function modalVisible(){return modal&&modal.style.display!=='none'}
 function iniciar(){
  if(esLanding){paso('vista');document.querySelectorAll('#btnEntrarPrive, #btnEntrarPriveFinal').forEach(prepararEnlace);}
  if(esPortal){
   modal=document.getElementById('modal-edad');botonEdad=document.getElementById('btn-mayor');
   if(mayor()){if(modal)modal.style.display='none';paso('edad_recordada');paso('portal_visto');}
   else if(modal){overflowPrevio=document.body.style.overflow;document.body.style.overflow='hidden';paso('edad_vista');botonEdad?.focus({preventScroll:true});}
  }
  document.addEventListener('click',e=>{
   const target=e.target?.closest?.('a,button');if(!target)return;
   if(esLanding&&['btnEntrarPrive','btnEntrarPriveFinal'].includes(target.id)){
    aceptarEdad('landing');paso('ingreso');
    // Mantener el evento histórico para comparar con las semanas anteriores.
    evento('landing_entrada_portal',{ubicacion:'landing_meta',destino:'portal_principal',posicion:target.id==='btnEntrarPrive'?'superior':'inferior'});
   }
   if(target===botonEdad){aceptarEdad('portada');document.querySelector('#btn-idioma')?.focus({preventScroll:true});}
   if(target.matches('[data-prive-salir]'))paso('salida_edad',{ubicacion:esLanding?'landing':'portada'});
   if(esLanding&&target.matches('[data-social]'))evento('landing_click_red_social',{red_social:target.dataset.social,ubicacion:'landing_meta'});
   if(esPortal&&!modalVisible()&&target.matches('.pill-btn[data-filter]')){
    const categoria=target.dataset.filter;
    if(['todas','terapeuticas','sensuales','fantasias','favoritos'].includes(categoria))paso('categoria_elegida',{categoria});
   }
   if(target.matches('[data-whatsapp-perfil]')||target.matches('[data-metrica-whatsapp]')){
    const id=target.dataset.whatsappPerfil||perfilActual;if(id)paso('whatsapp',{perfil_id:String(id).slice(0,120)});
   }
  },true);
  document.addEventListener('keydown',e=>{
   if(e.key!=='Tab'||!modalVisible())return;
   const controls=[...modal.querySelectorAll('button,a[href]')].filter(n=>!n.disabled);if(!controls.length)return;
   const first=controls[0],last=controls[controls.length-1];
   if(!modal.contains(document.activeElement)){e.preventDefault();first.focus();}
   else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
 }
 window.priveRecorrido={perfilListo(id){perfilActual=String(id||'').slice(0,120);if(perfilActual)paso('perfil_listo',{perfil_id:perfilActual});}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();

