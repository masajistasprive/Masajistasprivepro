/* Privé: un navegador por día en la portada. Sin IP, huellas ni lecturas públicas. */
(function(){
 'use strict';
 const pendientes=new Map(),guardados=new Set();
 const ID_KEY='prive_visitor_metrics_v1',DIA_KEY='prive_portada_dia_v1';
 function diaAR(now=new Date()){
  const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const v=k=>p.find(x=>x.type===k).value;return `${v('year')}-${v('month')}-${v('day')}`;
 }
 function visitante(){
  try{let id=localStorage.getItem(ID_KEY);if(!/^[a-f0-9]{32}$/.test(id||'')){
   id=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
   localStorage.setItem(ID_KEY,id);
   if(localStorage.getItem(ID_KEY)!==id)return null;
  }return id;}catch{return null;}
 }
 async function registrar(db){
  if(!db||document.visibilityState==='hidden')return false;
  const browser=visitante();if(!browser)return false;
  const dia=diaAR(),id=`${dia}_${browser}`;
  try{if(guardados.has(id)||localStorage.getItem(DIA_KEY)===id)return true;}catch{}
  if(pendientes.has(id))return pendientes.get(id);
  const tarea=(async()=>{
   try{
    // ID determinista: dos pestañas simultáneas tampoco crean dos visitantes.
    await db.collection('metricas_portada').doc(id).set({dia,visitante:browser,creado:firebase.firestore.FieldValue.serverTimestamp()});
    guardados.add(id);try{localStorage.setItem(DIA_KEY,id);}catch{}
    return true;
   }catch(e){console.warn('Visita a portada no registrada:',e.code||e.message);return false;}
   finally{pendientes.delete(id);}
  })();pendientes.set(id,tarea);return tarea;
 }
 window.privePortada=Object.freeze({registrar});
})();
