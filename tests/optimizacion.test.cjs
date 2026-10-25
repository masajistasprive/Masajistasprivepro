/* Pruebas sin dependencias externas: node tests/optimizacion.test.cjs */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const htmlScripts=html=>[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m=>!/\bsrc\s*=|application\/ld\+json/i.test(m[1])).map(m=>m[2]);
let checks=0;
for(const file of ['index.html','perfil.html']){
 const html=read(file);
 const scripts=htmlScripts(html);
 assert(scripts.length>0,file+': scripts embebidos ausentes');
 for(const [i,script] of scripts.entries()){new vm.Script(script,{filename:file+':inline-'+i});checks++;}
 assert(html.includes('.onSnapshot(snap=>{ultimo=snap;pintar();}'),file+': sin sincronización en vivo');checks++;
 assert(html.includes("ref.get({source:'server'})"),file+': sin revalidación de voto');checks++;
 assert(html.includes('priveVotos.ocupados.has(id)'),file+': sin bloqueo de voto concurrente');checks++;
}
new vm.Script(read('js/votos-visibles.js'),{filename:'js/votos-visibles.js'});checks++;
const home=read('index.html');
assert(home.includes(".where('status','==','published').limit(100).get()"),'Consulta compatible del Club ausente');checks++;
assert(home.includes('prive_club_home_v1'),'Caché de Club ausente');checks++;
console.log('OK: '+checks+' verificaciones estáticas.');
console.log('IMPORTANTE: estas pruebas no reemplazan las pruebas con navegador y Firebase.');
