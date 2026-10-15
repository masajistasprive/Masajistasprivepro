/* Portada 2.0: usa las mismas colecciones, enlaces y funciones del sitio. */
'use strict';
const home2Text={
 es:{kicker:'CABA · BIENESTAR Y RELAX',hero:'Tu momento de bienestar',sub:'Encontrá tu próximo masaje en CABA.',discover:'Descubrí profesionales',all:'Ver todas →',home:'Inicio',explore:'Explorar',favorites:'Favoritas',area:'Barrio',mode:'Modalidad',areas:'Todos los barrios',modes:'Toda modalidad',search:'¿En qué barrio buscás?',searchLabel:'Buscar por nombre o zona',empty:'No encontramos perfiles con esos filtros.',emptyFav:'Todavía no guardaste favoritas. Tocá la estrella de un perfil para guardarlo.',reset:'Limpiar filtros',byArea:'Explorar por barrio',advertise:'Publicá tu perfil ↗',useful:'Información de Buenos Aires',save:'Guardar en favoritas',unsave:'Quitar de favoritas',saved:'Perfil guardado en favoritas.',removed:'Perfil quitado de favoritas.',localError:'No se pudo guardar en este navegador. Revisá el almacenamiento.',results:'perfiles',result:'perfil',loading:'Cargando perfiles…',failed:'No se pudieron cargar los perfiles. Revisá tu conexión y reintentá.',retry:'Reintentar',reviews:'Experiencias',view:'Ver perfil',large:'Vista ampliada',compact:'Vista compacta',likes:'Me gusta'},
 en:{kicker:'BUENOS AIRES · WELLNESS & RELAXATION',hero:'Your moment of wellbeing',sub:'Find your next massage in Buenos Aires.',discover:'Discover professionals',all:'View all →',home:'Home',explore:'Explore',favorites:'Favorites',area:'Area',mode:'Service setting',areas:'All areas',modes:'Any setting',search:'Which area are you looking for?',searchLabel:'Search by name or area',empty:'No profiles match these filters.',emptyFav:'No favorites yet. Tap the star on a profile to save it.',reset:'Clear filters',byArea:'Explore by area',advertise:'Advertise your profile ↗',useful:'Buenos Aires information',save:'Save to favorites',unsave:'Remove from favorites',saved:'Profile saved to favorites.',removed:'Profile removed from favorites.',localError:'Unable to save in this browser. Check storage settings.',results:'profiles',result:'profile',loading:'Loading profiles…',failed:'Unable to load profiles. Check your connection and retry.',retry:'Retry',reviews:'Reviews',view:'View profile',large:'Expanded view',compact:'Compact view',likes:'Like'},
 pt:{kicker:'BUENOS AIRES · BEM-ESTAR E RELAXAMENTO',hero:'Seu momento de bem-estar',sub:'Encontre sua próxima massagem em Buenos Aires.',discover:'Descubra profissionais',all:'Ver todas →',home:'Início',explore:'Explorar',favorites:'Favoritas',area:'Bairro',mode:'Modalidade',areas:'Todos os bairros',modes:'Toda modalidade',search:'Em qual bairro você procura?',searchLabel:'Buscar por nome ou bairro',empty:'Nenhum perfil com esses filtros.',emptyFav:'Ainda não há favoritas. Toque na estrela de um perfil para salvar.',reset:'Limpar filtros',byArea:'Explorar por bairro',advertise:'Publique seu perfil ↗',useful:'Informações de Buenos Aires',save:'Salvar nas favoritas',unsave:'Remover das favoritas',saved:'Perfil salvo nas favoritas.',removed:'Perfil removido das favoritas.',localError:'Não foi possível salvar neste navegador. Verifique o armazenamento.',results:'perfis',result:'perfil',loading:'Carregando perfis…',failed:'Não foi possível carregar os perfis. Verifique a conexão e tente novamente.',retry:'Tentar novamente',reviews:'Experiências',view:'Ver perfil',large:'Vista ampliada',compact:'Vista compacta',likes:'Curtir'},
 fr:{kicker:'BUENOS AIRES · BIEN-ÊTRE ET DÉTENTE',hero:'Votre moment de bien-être',sub:'Trouvez votre prochain massage à Buenos Aires.',discover:'Découvrez les professionnels',all:'Tout voir →',home:'Accueil',explore:'Explorer',favorites:'Favoris',area:'Quartier',mode:'Modalité',areas:'Tous les quartiers',modes:'Toutes les modalités',search:'Dans quel quartier cherchez-vous ?',searchLabel:'Rechercher par nom ou quartier',empty:'Aucun profil ne correspond à ces filtres.',emptyFav:'Aucun favori. Touchez l’étoile d’un profil pour le garder.',reset:'Effacer les filtres',byArea:'Explorer par quartier',advertise:'Publiez votre profil ↗',useful:'Informations de Buenos Aires',save:'Ajouter aux favoris',unsave:'Retirer des favoris',saved:'Profil ajouté aux favoris.',removed:'Profil retiré des favoris.',localError:'Impossible d’enregistrer. Vérifiez le stockage du navigateur.',results:'profils',result:'profil',loading:'Chargement des profils…',failed:'Impossible de charger les profils. Vérifiez la connexion et réessayez.',retry:'Réessayer',reviews:'Avis',view:'Voir le profil',large:'Vue agrandie',compact:'Vue compacte',likes:'J’aime'}
};
const home2=id=>document.getElementById(id),home2T=()=>home2Text[idiomaActual]||home2Text.es;
const home2Normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
let home2Filter='todas',home2LastCategory='todas',home2Loaded=false,home2Failed=false;
let home2PendingState=null,home2InitialHash=location.hash==='#favoritas';
try{home2PendingState=JSON.parse(sessionStorage.getItem('priveHome2Filters')||'null')}catch{}
function home2Favorites(){const value=obtenerJSONLocal('priveFavoritos',[]);return new Set(Array.isArray(value)?value.filter(v=>typeof v==='string'):[])}
const home2Star='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9Z"/></svg>';
const home2Pin='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
function home2SaveState(){try{sessionStorage.setItem('priveHome2Filters',JSON.stringify({category:home2Filter,lastCategory:home2LastCategory,search:home2('priveBuscar').value,area:home2('priveZona').value,mode:home2('priveModalidad').value}))}catch{}}
function home2Choose(filter){
 if(!['todas','terapeuticas','sensuales','fantasias','favoritos'].includes(filter))filter='todas';
 home2Filter=filter;if(filter!=='favoritos')home2LastCategory=filter;
 document.querySelectorAll('.pill-btn[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 document.querySelectorAll('[data-prive-nav]').forEach(b=>{const active=b.dataset.priveNav===(filter==='favoritos'?'favoritos':'explorar');b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 aplicarBusquedaPrive();
}
function home2Reset(){home2('priveBuscar').value='';home2('priveZona').value='';home2('priveModalidad').value='';home2Choose('todas')}
function home2Options(){
 const t=home2T(),docs=documentosPerfiles.filter(d=>d.data().estado!=='pausado');
 for(const[id,key,label]of [['priveZona','zona',t.areas],['priveModalidad','modalidad',t.modes]]){
  const select=home2(id);if(!select)return;
  const previous=select.value;const values=new Map();
  for(const d of docs){const m=d.data(),value=String(m[key]||'').trim();if(!value)continue;const normalized=home2Normalize(value);if(!values.has(normalized))values.set(normalized,value)}
  select.replaceChildren(new Option(label,''));
  for(const[value,display]of [...values].sort((a,b)=>a[1].localeCompare(b[1],'es'))){select.add(new Option(display,value))}
  if(values.has(previous))select.value=previous;
 }
}
function home2UpdateText(){
 const t=home2T();document.querySelectorAll('[data-v2]').forEach(e=>{if(t[e.dataset.v2])e.textContent=t[e.dataset.v2]});
 home2('priveBuscar').placeholder=t.search;home2('priveBuscar').setAttribute('aria-label',t.searchLabel);home2('priveZona').setAttribute('aria-label',t.area);home2('priveModalidad').setAttribute('aria-label',t.mode);home2('priveReset').setAttribute('aria-label',t.reset);
 home2('grid-favoritos').parentElement.querySelector('h2').textContent='☆ '+t.favorites;
 aplicarEstiloVisualActual();home2Options();aplicarBusquedaPrive();
}
// Keep existing function names, event entry points, Firebase votes and destination URLs.
construirTarjeta=function(docSnap,indice){
 const m=docSnap.data(),id=docSnap.id,esc=escaparHTML,t=home2T();
 const tr=m.traducciones?.[idiomaActual]||m.traducciones?.es||{},name=String(m.nombre||'Anunciante'),zone=String(tr.valorZona||m.zona||'CABA'),mode=String(tr.valorModalidad||m.modalidad||'');
 const cat=categoriaDeModelo(m.categoriaNormalizada||m.categoria),url='perfil.html?id='+encodeURIComponent(id),saved=home2Favorites().has(id),voted=priveVotos.propios.get(id)===true,count=priveVotos.cuentas.get(id)||0;
 const phone=String(m.whatsapp||m.telefono||'').replace(/\D/g,''),whatsapp=phone.length>=8&&phone.length<=16?'https://wa.me/'+phone+'?text='+encodeURIComponent('Hola, vi tu perfil en Masajistas Privé y quiero consultar.'):'';
 const verified=m.verificado===true||m.perfilVerificado===true; // No deducir verificación de una foto o del nombre.
 return `<div class="card-link" data-perfil-id="${esc(id)}" data-categoria="${cat}" data-zona="${esc(home2Normalize(m.zona||''))}" data-modalidad="${esc(home2Normalize(m.modalidad||''))}" data-busqueda="${esc(name+' '+zone+' '+(m.zona||''))}"><article class="card"><a class="prive-card-photo-link" href="${esc(url)}" aria-label="${esc(t.view+' '+name)}"><div class="card-image"><img src="${esc(imagenSegura(m.fotoPrincipal||m.foto||'img/monograma.png'))}" alt="${esc(name+' · '+zone)}" ${indice<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"'} decoding="async" width="400" height="500" onerror="this.onerror=null;this.src='img/monograma.png'"></div></a><button type="button" class="prive-favorite-button" data-prive-favorite="${esc(id)}" aria-pressed="${saved}" aria-label="${esc((saved?t.unsave:t.save)+' · '+name)}">${home2Star}</button><a href="${esc(url)}" class="prive-card-summary"><h3>${esc(name)}${verified?`<span class="prive-card-verified" role="img" aria-label="${esc(traducciones[idiomaActual].badgeVerificado)}">✦</span>`:''}</h3><span class="prive-card-zone">${home2Pin}${esc(zone)}</span>${mode?`<span class="prive-card-mode">${esc(mode)}</span>`:''}</a><div class="prive-barra-clasica"><button type="button" class="prive-voto-btn ${voted?'prive-votado':''}" data-prive-voto="${esc(id)}" aria-pressed="${voted}" aria-label="${esc(t.likes+' · '+name)}">♡ ${esc(t.likes)} <span data-prive-cuenta>${count||''}</span></button><a href="${esc(url+'#pCommentsContainer')}">💬 ${esc(t.reviews)}</a></div><div class="prive-card-actions"><a href="${esc(url)}">${esc(t.view)}</a>${whatsapp?`<a class="prive-btn-ws" href="${esc(whatsapp)}" data-whatsapp-perfil="${esc(id)}" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>`:''}</div></article></div>`;
};
aplicarBusquedaPrive=function(){
 const input=home2('priveBuscar');if(!input)return;
 const t=home2T(),term=home2Normalize(input.value),area=home2('priveZona').value,mode=home2('priveModalidad').value;
 home2('priveLimpiar').hidden=!input.value;
 const ids=new Set();
 document.querySelectorAll('.categoria-seccion-wrapper').forEach(wrap=>{
  const section=wrap.dataset.sec,selected=home2Filter==='todas'?section!=='favoritos':section===home2Filter;let count=0;
  wrap.querySelectorAll('.card-link[data-busqueda]').forEach(card=>{
   const match=(!term||home2Normalize(card.dataset.busqueda).includes(term))&&(!area||card.dataset.zona===area)&&(!mode||card.dataset.modalidad===mode);
   card.style.display=match?'':'none';if(match){count++;if(selected)ids.add(card.dataset.perfilId)}
  });
  const showAds=selected&&home2Filter!=='favoritos'&&!term&&!area&&!mode;
  wrap.querySelectorAll('.card-ad-link').forEach(ad=>{ad.hidden=!showAds;ad.style.display=showAds?'':'none'});
  wrap.style.display=selected&&(count>0||showAds)?'block':'none';
 });
 const empty=home2('priveEmpty');empty.hidden=!home2Loaded||home2Failed||ids.size>0;
 empty.querySelector('p').textContent=home2Filter==='favoritos'&&!home2Favorites().size?t.emptyFav:t.empty;
 const status=home2('priveSearchCount');
 status.replaceChildren(document.createTextNode(home2Failed?t.failed:!home2Loaded?t.loading:ids.size+' '+(ids.size===1?t.result:t.results)));
 if(home2Failed){const retry=document.createElement('button');retry.type='button';retry.className='prive-reset-text';retry.textContent=t.retry;retry.onclick=()=>{home2Failed=false;suscripcionPerfiles?.();suscripcionPerfiles=null;if(!db)iniciarFirebase();else cargarPerfilesDesdeFirebase()};status.append(' ',retry)}
 home2SaveState();
};
const home2OriginalRender=renderizarPerfiles;
renderizarPerfiles=function(){
 const focus=document.activeElement?.dataset?.priveFavorite;
 home2OriginalRender();home2Options();
 if(home2PendingState&&home2Loaded){const v=home2PendingState;home2PendingState=null;home2('priveBuscar').value=typeof v.search==='string'?v.search:'';for(const[id,value]of [['priveZona',v.area],['priveModalidad',v.mode]]){const select=home2(id);if([...select.options].some(o=>o.value===value))select.value=value}home2LastCategory=['todas','terapeuticas','sensuales','fantasias'].includes(v.lastCategory)?v.lastCategory:'todas';home2Choose(v.category)}
 if(home2InitialHash&&home2Loaded){home2InitialHash=false;home2Choose('favoritos')}
 aplicarBusquedaPrive();
 const featured=home2('stories-destacadas-container');if(featured){const total=featured.children.length;featured.parentElement.hidden=!total;featured.style.setProperty('--prive-featured-columns',String(Math.max(1,Math.min(total,4))));featured.style.setProperty('--prive-featured-wide-columns',String(Math.max(1,Math.min(total,6))));}
 if(focus){const buttons=[...document.querySelectorAll('[data-prive-favorite]')];const next=buttons.find(b=>b.dataset.priveFavorite===focus&&b.closest('.categoria-seccion-wrapper').style.display!=='none');(next||document.querySelector('[data-prive-nav=favoritos]')).focus({preventScroll:true})}
};
const home2OriginalLanguage=aplicarIdioma;
aplicarIdioma=function(lang){home2OriginalLanguage(lang);home2UpdateText()};
aplicarEstiloVisualActual=function(){document.body.classList.toggle('modo-tarjeta-alternativo',modoTarjetaActivo);const button=home2('btnAlternarEstilo');if(button){button.textContent='▦ '+(modoTarjetaActivo?home2T().compact:home2T().large);button.setAttribute('aria-pressed',String(modoTarjetaActivo))}};
cargarPerfilesDesdeFirebase=function(){
 if(!db||suscripcionPerfiles)return;
 suscripcionPerfiles=db.collection('perfiles_publicos').onSnapshot(snapshot=>{
  documentosPerfiles=snapshot.docs.slice();for(let i=documentosPerfiles.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[documentosPerfiles[i],documentosPerfiles[j]]=[documentosPerfiles[j],documentosPerfiles[i]]}
  home2Loaded=true;home2Failed=false;programarRenderPerfiles();snapshot.docs.filter(d=>d.data().estado!=='pausado').forEach(d=>priveEscucharVotos(d.id));ocultarTransicionPrive();
 },error=>{console.error('Error cargando fichas públicas:',error);home2Failed=true;aplicarBusquedaPrive();ocultarTransicionPrive()});
};
const home2OriginalInteractions=inicializarInteracciones;
inicializarInteracciones=function(){
 home2OriginalInteractions();
 const announce=document.createElement('p');announce.id='priveFavoriteNotice';announce.className='sr-only';announce.setAttribute('role','status');document.body.append(announce);
 const closeMenu=()=>{home2('priveSiteMenu').hidden=true;home2('priveMenuButton').setAttribute('aria-expanded','false')};
 home2('priveMenuButton').onclick=()=>{const open=home2('priveSiteMenu').hidden;home2('priveSiteMenu').hidden=!open;home2('priveMenuButton').setAttribute('aria-expanded',String(open));if(open)cerrarMenuIdioma()};
 home2('priveZona').onchange=aplicarBusquedaPrive;home2('priveModalidad').onchange=aplicarBusquedaPrive;home2('priveReset').onclick=home2Reset;
 document.addEventListener('click',event=>{
  const favorite=event.target.closest('[data-prive-favorite]');
  if(favorite){event.preventDefault();const id=favorite.dataset.priveFavorite,ids=home2Favorites(),added=!ids.has(id);if(added)ids.add(id);else ids.delete(id);try{localStorage.setItem('priveFavoritos',JSON.stringify([...ids]));announce.textContent=added?home2T().saved:home2T().removed;renderizarPerfiles()}catch{announce.textContent=home2T().localError}return}
  const pill=event.target.closest('.pill-btn[data-filter]');if(pill)home2Choose(pill.dataset.filter);
  const nav=event.target.closest('[data-prive-nav]');if(nav){const id=nav.dataset.priveNav;if(id==='inicio'){home2Reset();window.scrollTo({top:0,behavior:'smooth'});document.querySelectorAll('[data-prive-nav]').forEach(b=>{const active=b===nav;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}else{if(id==='explorar'&&home2Filter==='favoritos')home2Choose(home2LastCategory);home2('catalogo-prive').scrollIntoView({behavior:'smooth',block:'start'})}}
  if(event.target.closest('[data-prive-reset]'))home2Reset();
  if(!event.target.closest('#priveMenuButton')&&!event.target.closest('#priveSiteMenu'))closeMenu();
  if(event.target.closest('#priveSiteMenu a'))closeMenu();
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!home2('priveSiteMenu').hidden){closeMenu();home2('priveMenuButton').focus()}});
 window.addEventListener('storage',event=>{if(event.key==='priveFavoritos')programarRenderPerfiles()});
 window.addEventListener('pageshow',()=>{if(home2Loaded)renderizarPerfiles()});
 // The last search is restored after the first Firebase snapshot and option generation.
 const state=home2PendingState;home2UpdateText();home2PendingState=state;
};
const home2OriginalStart=iniciarFirebase;
iniciarFirebase=function(){home2OriginalStart();if(!db){home2Failed=true;aplicarBusquedaPrive()}};
window.addEventListener('hashchange',()=>{if(location.hash==='#favoritas')home2Choose('favoritos')});
