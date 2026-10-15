/* Sólo etiquetas y navegación; Firebase y el funcionamiento del Club se conservan. */
'use strict';
const club2Labels={es:{compose:'Abrir una conversación',community:'COMUNIDAD +18',home:'Inicio',explore:'Explorar',favorites:'Favoritas'},en:{compose:'Start a conversation',community:'18+ COMMUNITY',home:'Home',explore:'Explore',favorites:'Favorites'},pt:{compose:'Iniciar conversa',community:'COMUNIDADE +18',home:'Início',explore:'Explorar',favorites:'Favoritas'},fr:{compose:'Lancer une discussion',community:'COMMUNAUTÉ +18',home:'Accueil',explore:'Explorer',favorites:'Favoris'}};
const club2OriginalLanguage=setLang;
setLang=function(){club2OriginalLanguage();const labels=club2Labels[lang]||club2Labels.es;document.querySelectorAll('[data-club2]').forEach(e=>{e.textContent=labels[e.dataset.club2]||e.textContent})};
setLang();
