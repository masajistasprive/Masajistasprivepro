const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const html=fs.readFileSync(new URL('../perfil.html','file://'+__filename),'utf8');
const render=html.slice(html.indexOf('function renderProfile(){'),html.indexOf('function readFavs(){'));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={es:'Enviar WhatsApp',en:'Send WhatsApp',pt:'Enviar WhatsApp',fr:'Envoyer WhatsApp'};
for(const lang of Object.keys(labels))for(const state of ['active','paused','no-phone']){
 const {document}=parseHTML(html);
 const ctx={document,modelo:{nombre:'Prueba <&',zona:'CABA',estado:state==='paused'?'pausado':'activo',telefono:state==='no-phone'?'':'5491112345678'},idiomaPerfil:lang,perfilId:'prueba',location:{href:'https://masajistasprive.com/p/prueba.html'},t:()=>({sendWhatsApp:labels[lang],whatsapp:labels[lang]}),readFavs:()=>[],esc:escape,safeUrl:v=>v||'',formatProfileText:escape,whatsappSvg:'<svg></svg>',openLightbox:()=>{},toggleFavorite:()=>{},priveAlternarVoto:()=>{},privePintarVotos:()=>{},shareProfile:()=>{},submitReview:()=>{}};
 vm.runInNewContext(render+';renderProfile();',ctx);
 const main=document.querySelector('[data-metrica-whatsapp="principal"]'),floating=document.querySelector('[data-metrica-whatsapp="flotante"]');
 if(state==='active'){
  assert(main&&floating);assert.equal(main.textContent,labels[lang]);
  assert.equal(main.getAttribute('href'),floating.getAttribute('href'));
  assert(main.getAttribute('href').startsWith('https://wa.me/5491112345678?text='));
  assert.equal(main.getAttribute('target'),'_blank');assert.equal(main.getAttribute('rel'),'noopener noreferrer');
  assert(main.compareDocumentPosition(document.querySelector('.perfil-descripcion'))&4);
 }else{assert.equal(main,null);assert.equal(floating,null)}
}
console.log('PASS: contacto principal y flotante coherentes en cuatro idiomas; sin contacto en perfiles pausados o sin teléfono. Sin red ni mensajes reales.');
