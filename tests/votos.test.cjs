const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function check(file){
 const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 const code=html.slice(html.indexOf('const priveVotos='),html.indexOf(file==='index.html'?'let idiomaActual=':'// Métricas Privé 1.0'));
 assert(code.includes('async function priveAlternarVoto'));
 const users=new Set(['other']);const listeners=new Set();let starts=0,stops=0,registration;
 const snapshot=()=>({size:users.size,docs:[...users].map(id=>({id}))});
 const emit=()=>{for(const cb of listeners)cb(snapshot())};
 const ref={get:async()=>({exists:users.has('me')}),set:async()=>{users.add('me');emit()},delete:async()=>{users.delete('me');emit()}};
 const query={get:async()=>snapshot(),doc:()=>ref,onSnapshot(cb){starts++;listeners.add(cb);cb(snapshot());return()=>{stops++;listeners.delete(cb)}}};
 const ctx=vm.createContext({console,CSS:{escape:x=>x},document:{querySelectorAll:()=>[]},db:{collection:()=>({doc:()=>({collection:()=>query})})},firebase:{auth:()=>({currentUser:{uid:'me'}}),firestore:{FieldValue:{serverTimestamp:()=>0}}},window:{priveVotosVisibles:{registrar(...args){registration=args}}},alert:e=>{throw Error(e)}});
 vm.runInContext(code,ctx);
 vm.runInContext("priveEscucharVotos('test')",ctx);const stop=registration[3]();await flush();
 const state=()=>vm.runInContext("({count:priveVotos.cuentas.get('test'),own:priveVotos.propios.get('test')})",ctx);
 assert.equal(state().count,1,file+': initial count');
 users.add('tab-two');emit();await flush();assert.equal(state().count,2,file+': updates from another tab must remain live');
 await vm.runInContext("priveAlternarVoto('test')",ctx);await flush();assert.equal(state().count,3);assert.equal(state().own,true);
 await vm.runInContext("priveAlternarVoto('test')",ctx);await flush();assert.equal(state().count,2);assert.equal(state().own,false);
 users.add('me');emit();await flush();assert.equal(state().own,true,file+': own vote from another tab');
 stop();assert.equal(stops,starts,file+': listener released');
 users.add('hidden-update');emit();assert.equal(state().count,3,file+': stopped callbacks cannot mutate state');
 const stop2=registration[3]();await flush();assert.equal(state().count,4,file+': resync after returning');stop2();
 console.log('PASS '+file+': live counts, two tabs, vote/unvote, teardown, resync');
}
(async()=>{for(const file of ['index.html','perfil.html'])await check(file)})().catch(e=>{console.error(e);process.exitCode=1});
