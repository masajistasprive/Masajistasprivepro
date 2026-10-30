const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
const source=fs.readFileSync(path.join(__dirname,'../js/encuadres-foto.js'),'utf8');
const m=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const old='https://example.test/photo.jpg#otra-marca&prive-encuadre-v1=45,15,115,65,35,125';
const e=m.leerEncuadres(old);assert.deepEqual(e.nueva,{x:50,y:0,zoom:100});
const value={...e,nueva:{x:12,y:73,zoom:145}},url=m.guardarEncuadres(old,value);
assert(url.startsWith('https://example.test/photo.jpg#otra-marca&'));
assert.deepEqual(m.leerEncuadres(url),value,'Tres encuadres independientes sobreviven al guardado');
assert.deepEqual(m.leerEncuadres(url).portada,e.portada);assert.deepEqual(m.leerEncuadres(url).destacada,e.destacada);
const twice=m.guardarEncuadres(url,value);assert.equal((twice.match(/prive-nueva-v1=/g)||[]).length,1);
assert.equal(m.guardarEncuadres(url,null),'https://example.test/photo.jpg#otra-marca');
assert.deepEqual(m.leerEncuadres(old+'&prive-nueva-v1=bad').nueva,{x:50,y:0,zoom:100});
assert.deepEqual(m.normalizarEncuadres({nueva:{x:999,y:-5,zoom:999}}).nueva,{x:100,y:0,zoom:300});
console.log('PASS: encuadre independiente de nuevas, compatibilidad anterior, restablecer, límites y URL original conservada.');
})().catch(e=>{console.error(e);process.exitCode=1});
