/* DOM aislado: nunca llama a Firebase ni envía Analytics. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const html=fs.readFileSync(new URL('../perfil.html','file://'+__filename),'utf8');
const render=html.slice(html.indexOf('function renderProfile(){'),html.indexOf('function readFavs(){'));
const gallery=html.slice(html.indexOf('let lightboxTrigger='),html.indexOf('function listenReviews(){'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setup(lang,flags={},photos=['/one.jpg','/two.jpg']){
 const {document,window}=parseHTML(html);let focused=document.body;
 Object.defineProperty(document,'activeElement',{get:()=>focused});
 window.HTMLElement.prototype.focus=function(){focused=this};
 const metrics=[],ctx=vm.createContext({document,console,modelo:{nombre:'QA <&',fotoPrincipal:photos[0],fotosGaleria:photos,estado:'activo',...flags},idiomaPerfil:lang,perfilId:'qa',location:{href:'https://masajistasprive.com/perfil.html?id=qa'},t:()=>({verified:'Verified'}),readFavs:()=>[],esc,safeUrl:v=>v||'',formatProfileText:esc,whatsappSvg:'',toggleFavorite(){},priveAlternarVoto(){},privePintarVotos(){},shareProfile(){},submitReview(){},registrarMetrica:(name,params)=>metrics.push({name,params})});
 vm.runInContext(gallery,ctx);vm.runInContext(render+';renderProfile();',ctx);
 const key=(target,value,shift=false)=>{const event=new window.Event('keydown',{bubbles:true,cancelable:true});Object.defineProperties(event,{key:{value},shiftKey:{value:shift},repeat:{value:false}});target.dispatchEvent(event);return event;};
 return {document,window,ctx,metrics,key};
}
for(const lang of ['es','en','pt','fr']){
 for(const [flags,expected]of [[{},0],[{verificado:false},0],[{verificado:'true'},0],[{verificado:true},1],[{perfilVerificado:true},1],[{verificado:false,perfilVerificado:true},1]]){
  const {document}=setup(lang,flags);assert.equal(document.querySelectorAll('.perfil-titulo-seccion .badge-verificado').length,expected);
 }
 const {document,ctx,metrics,key}=setup(lang,{verificado:true});
 const photos=[...document.querySelectorAll('[data-photo]')],dialog=document.getElementById('priveLightbox'),close=document.getElementById('priveLbClose'),prev=document.getElementById('priveLbPrev'),next=document.getElementById('priveLbNext');
 for(const photo of photos){assert.equal(photo.getAttribute('role'),'button');assert.equal(photo.getAttribute('tabindex'),'0');assert.equal(photo.getAttribute('aria-haspopup'),'dialog');assert.equal(photo.getAttribute('aria-controls'),'priveLightbox');assert(photo.getAttribute('aria-label').includes('QA <&'))}
 const footer=document.querySelector('footer');footer.setAttribute('aria-hidden','false');document.body.style.overflow='clip';
 photos[1].focus();const enter=key(photos[1],'Enter');assert(enter.defaultPrevented);assert.equal(dialog.style.display,'flex');assert.equal(document.activeElement,close);assert.equal(footer.inert,true);assert.equal(footer.getAttribute('aria-hidden'),'true');assert.equal(document.body.style.overflow,'hidden');
 key(close,'Tab');assert.equal(document.activeElement,prev,'Tab desde el último control vuelve al primero');
 key(prev,'Tab',true);assert.equal(document.activeElement,close,'Shift+Tab desde el primero vuelve al último');
 key(close,'ArrowRight');assert.equal(document.getElementById('privePhotoCount').textContent,'2 / 2');assert.equal(document.activeElement,close,'Cambiar foto conserva el foco del control');
 key(close,'Escape');assert.equal(dialog.style.display,'none');assert.equal(document.activeElement,photos[1]);assert.equal(footer.getAttribute('aria-hidden'),'false');assert.equal(document.body.style.overflow,'clip');assert.notEqual(footer.inert,true);
 photos[2].focus();key(photos[2],' ');assert.equal(document.getElementById('privePhotoCount').textContent,'2 / 2');close.click();assert.equal(document.activeElement,photos[2]);
 assert.equal(metrics.length,3,'Cada apertura o cambio produce un único evento de foto');
 assert.equal(dialog.getAttribute('aria-label'),({es:'Galería de fotos',en:'Photo gallery',pt:'Galeria de fotos',fr:'Galerie de photos'})[lang]);
 const single=setup(lang,{},['/only.jpg']);single.document.getElementById('fotoPrincipal').click();assert(single.document.getElementById('priveLbPrev').disabled);assert(single.document.getElementById('priveLbNext').disabled);single.key(single.document.getElementById('priveLbClose'),'Tab');assert.equal(single.document.activeElement,single.document.getElementById('priveLbClose'));
}
console.log('PASS: verificación estricta; galería Enter/Espacio, foco contenido y restaurado, Escape, flechas, estado de fondo y una sola foto en cuatro idiomas.');
