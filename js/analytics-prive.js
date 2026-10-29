/* Una vista inicial por documento, antes de los eventos y sin esperar Firebase.
 * La atribución la resuelve GA4 desde la URL/referrer reales: no se inventan
 * campañas, fuentes ni sesiones, ni se reescribe la URL del visitante. */
(()=>{
 'use strict';
 if(window.priveAnalytics)return;
 const measurementId='G-DXX740HP41';
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
 const config={send_page_view:true};
 try{
  const url=new URL(location.href);
  const pathId=url.pathname.match(/^\/p\/([a-z0-9_-]+)\.html$/)?.[1];
  const id=(url.pathname==='/perfil.html'||pathId)?url.searchParams.get('id')||pathId:null;
  if(id&&/^[a-z0-9_-]{1,120}$/.test(id))config.perfil_id=id;
 }catch{}
 window.gtag('js',new Date());
 window.gtag('config',measurementId,config);
 window.priveAnalytics=Object.freeze({
  perfilListo(id,categoria,nombre){
   if(!/^[a-z0-9_-]{1,120}$/.test(String(id||'')))return;
   const params={perfil_id:String(id)};
   if(categoria)params.perfil_categoria=String(categoria).slice(0,80);
   if(nombre)params.page_title=String(nombre).slice(0,100)+' | Masajistas Privé';
   window.gtag('set',params);
  }
 });
})();
