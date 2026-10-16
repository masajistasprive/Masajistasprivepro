/* Compatible con las reglas actuales: seis campos; el origen queda en el ID. */
(function(){
'use strict';
const pendientes=new Map(),guardados=new Set(),CACHE='prive_metricas_enviadas_v2';
function diaAR(now=new Date()){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const p=k=>parts.find(x=>x.type===k).value;return `${p('year')}-${p('month')}-${p('day')}`;}
function visitante(){try{let id=localStorage.getItem('prive_visitor_metrics_v1');if(!/^[a-f0-9]{32}$/.test(id||'')){id=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('prive_visitor_metrics_v1',id);}return id;}catch{return null;}}
function leido(id){if(guardados.has(id))return true;try{const cache=JSON.parse(localStorage.getItem(CACHE)||'{}');return cache[id]===true;}catch{return false;}}
function recordar(id,dia){guardados.add(id);try{const old=JSON.parse(localStorage.getItem(CACHE)||'{}'),next={};for(const [key,val]of Object.entries(old))if(key.includes(dia)&&val===true)next[key]=true;next[id]=true;const entries=Object.entries(next).slice(-500);localStorage.setItem(CACHE,JSON.stringify(Object.fromEntries(entries)));}catch{}}
async function registrar({db,perfilId,tipo,origen='perfil'}){
 if(!db||!['visita','whatsapp'].includes(tipo)||typeof perfilId!=='string'||!perfilId.length||perfilId.length>120)return false;
 const browser=visitante();if(!browser)return false;const now=new Date(),dia=diaAR(now),franja=tipo==='visita'?'dia':new Intl.DateTimeFormat('en-GB',{timeZone:'America/Argentina/Buenos_Aires',hour:'2-digit',hourCycle:'h23'}).format(now);
 const prefijo=tipo==='whatsapp'&&origen==='portada'?'whatsapp_portada':tipo;
 const id=`${prefijo}_${dia}_${franja}_${browser}_${encodeURIComponent(perfilId)}`;
 if(id.length>400||leido(id))return true;if(pendientes.has(id))return pendientes.get(id);
 const task=(async()=>{try{await db.collection('metricas_eventos').doc(id).set({tipo,perfilId,dia,franja,visitante:browser,creado:firebase.firestore.FieldValue.serverTimestamp()});recordar(id,dia);return true;}catch(error){console.warn('Métrica Privé no registrada:',error.code||error.message);return false;}finally{pendientes.delete(id);}})();pendientes.set(id,task);return task;
}
window.priveMetricas=Object.freeze({registrar});
})();
