// Script de emergencia global: Destruir cualquier rastro de música residual
(function() {
    window.addEventListener('DOMContentLoaded', () => {
        const burbujasMusica = document.querySelectorAll('#priveUltraSutilBtn, #privePlayerContainer, #priveMicroPlayer, #seccion-reproductor-prive');
        burbujasMusica.forEach(el => el.remove());

        const audioEngine = document.getElementById('priveGlobalAudioEngine');
        if (audioEngine) {
            audioEngine.pause();
            audioEngine.remove();
        }
    });
})();

// =========================================================
// MOTOR DE TRADUCCIÓN GLOBAL INTELIGENTE (SIN BANNERS NI CAMBIOS EN HTML)
// =========================================================
const diccionarioPrive = {
    esToEn: {
        "← Volver": "← Back",
        "✓ Privé Verificado": "✓ Privé Verified",
        "Zona:": "Area:",
        "Modalidad:": "Modality:",
        "Sobre mí y Servicios": "About Me and Services",
        "Comodidades del Gabinete": "Studio Amenities",
        "Horarios Laborales": "Working Hours",
        "Horarios:": "Hours:",
        "Pagos:": "Payments:",
        "Atención:": "Attention:",
        "💬 CONTACTAR POR WHATSAPP": "💬 CONTACT VIA WHATSAPP",
        "💬 Contactar por WhatsApp": "💬 Contact via WhatsApp",
        "Experiencias y Comentarios": "Experiences & Comments",
        "Tu nombre o apodo": "Your name or nickname",
        "Escribe tu experiencia...": "Write about your experience...",
        "Publicar Experiencia": "Publish Experience",
        "Cargando experiencias...": "Loading experiences...",
        "No hay experiencias aún. ¡Sé el primero en dejar una!": "No experiences yet. Be the first to leave one!",
        "Me gusta": "Like",
        "★ Destacado": "★ Featured",
        "Eliminar": "Delete",
        "Este es un sitio exclusivo para adultos (+18). Las anunciantes publicadas son independientes y no tienen vínculo laboral, societario ni de dependencia con este portal.": "This is an exclusive site for adults (+18). The published advertisers are independent and have no employment, corporate, or dependency relationship with this portal.",
        "Este es un sitio para adultos (+18). Las anunciantes no tienen vínculo laboral con el portal.": "This is an exclusive site for adults (+18). The published advertisers are independent and have no employment relationship with the portal.",
        "Todos los derechos reservados.": "All rights reserved.",
        "Ducha y toallas limpias": "Shower and clean towels",
        "Gabinete amplio y cómodo": "Spacious and comfortable studio",
        "Aire acondicionado / Calefacción": "Air conditioning / Heating",
        "Entrada independiente": "Independent entrance",
        "Efectivo y transferencia": "Cash and bank transfer",
        "Gabinete propio / Independiente": "Own studio / Independent",
        "Departamento propio": "Own apartment"
    },
    enToEs: {
        "← Back": "← Volver",
        "✓ Privé Verified": "✓ Privé Verificado",
        "Area:": "Zona:",
        "Modality:": "Modalidad:",
        "About Me and Services": "Sobre mí y Servicios",
        "Studio Amenities": "Comodidades del Gabinete",
        "Working Hours": "Horarios Laborales",
        "Hours:": "Horarios:",
        "Payments:": "Pagos:",
        "Attention:": "Atención:",
        "💬 CONTACT VIA WHATSAPP": "💬 CONTACTAR POR WHATSAPP",
        "💬 Contact via WhatsApp": "💬 Contactar por WhatsApp",
        "Experiences & Comments": "Experiencias y Comentarios",
        "Your name or nickname": "Tu nombre o apodo",
        "Write about your experience...": "Escribe tu experiencia...",
        "Publish Experience": "Publicar Experiencia",
        "Loading experiences...": "Cargando experiencias...",
        "No experiences yet. Be the first to leave one!": "No hay experiencias aún. ¡Sé el primero en dejar una!",
        "Like": "Me gusta",
        "★ Featured": "★ Destacado",
        "Delete": "Eliminar",
        "This is an exclusive site for adults (+18). The published advertisers are independent and have no employment, corporate, or dependency relationship with this portal.": "Este es un sitio exclusivo para adultos (+18). Las anunciantes publicadas son independientes y no tienen vínculo laboral, societario ni de dependencia con este portal.",
        "This is an exclusive site for adults (+18). The published advertisers are independent and have no employment relationship with the portal.": "Este es un sitio para adultos (+18). Las anunciantes no tienen vínculo laboral con el portal.",
        "All rights reserved.": "Todos los derechos reservados.",
        "Shower and clean towels": "Ducha y toallas limpias",
        "Spacious and comfortable studio": "Gabinete amplio y cómodo",
        "Air conditioning / Heating": "Aire acondicionado / Calefacción",
        "Independent entrance": "Entrada independiente",
        "Cash and bank transfer": "Efectivo y transferencia",
        "Own studio / Independent": "Gabinete propio / Independiente",
        "Own apartment": "Departamento propio"
    }
};

function obtenerIdiomaActual() {
    return localStorage.getItem('priveLangDefinitivo') || 'es';
}

function cambiarIdiomaPrive() {
    const actual = obtenerIdiomaActual();
    const nuevo = actual === 'es' ? 'en' : 'es';
    localStorage.setItem('priveLangDefinitivo', nuevo);
    location.reload();
}

// Ejecutar reemplazos inteligentes en todo el texto visible de la página
window.addEventListener('DOMContentLoaded', () => {
    const lang = obtenerIdiomaActual();
    
    // 1. Inyectar botón en el header
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !document.getElementById('btn-idioma')) {
        headerRight.style.cssText = "display: flex !important; align-items: center; gap: 10px;";
        const textoBtn = lang === 'es' ? '🇺🇸 EN' : '🇦🇷 ES';
        
        const btnLang = document.createElement('button');
        btnLang.id = 'btn-idioma';
        btnLang.onclick = cambiarIdiomaPrive;
        btnLang.innerHTML = textoBtn;
        btnLang.style.cssText = "background: transparent; border: 1px solid rgba(223, 194, 133, 0.4); color: #dfc285; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: 600; font-family: 'Montserrat', sans-serif; letter-spacing: 1px; transition: all 0.3s;";
        
        headerRight.insertBefore(btnLang, headerRight.firstChild);
    }

    // 2. Traducir textos si estamos en inglés
    if (lang === 'en') {
        const mapa = diccionarioPrive.esToEn;
        
        // Recorrer todos los elementos de texto en la página para traducirlos limpiamente
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            let textoOriginal = node.nodeValue.trim();
            if (mapa[textoOriginal]) {
                node.nodeValue = node.nodeValue.replace(textoOriginal, mapa[textoOriginal]);
            }
        }

        // Traducir placeholders de inputs y textareas
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
            const p = el.getAttribute('placeholder');
            if (mapa[p]) el.setAttribute('placeholder', mapa[p]);
        });
    }
});


// =========================================================
// MOTOR GLOBAL: SLIDER TÁCTIL, VISOR Y COMENTARIOS FIREBASE
// =========================================================
(function() {
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') { e.preventDefault(); return false; }
    });
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') { e.preventDefault(); return false; }
    });

    const styleAnim = document.createElement('style');
    styleAnim.innerHTML = `
        img { -webkit-user-select: none !important; user-select: none !important; -webkit-user-drag: none !important; }
        @keyframes privePulseGlow {
            0% { transform: scale(1); box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4); }
            50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(37, 211, 102, 0.8), 0 0 15px rgba(223, 194, 133, 0.5); }
            100% { transform: scale(1); box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4); }
        }
        .btn-whatsapp-titilante {
            animation: privePulseGlow 2.2s infinite ease-in-out !important;
            transition: all 0.3s ease !important;
        }
        #priveLightbox {
            display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.96) !important; z-index: 9999999 !important;
            justify-content: center; align-items: center; backdrop-filter: blur(12px); cursor: zoom-out;
        }
    `;
    document.head.appendChild(styleAnim);

    function inicializarVisorFotos() {
        if (!document.getElementById('priveLightbox')) {
            const lightbox = document.createElement('div');
            lightbox.id = 'priveLightbox';
            lightbox.innerHTML = `
                <div style="position: relative; display: flex; justify-content: center; align-items: center; max-width: 90vw; max-height: 85vh;">
                    <img id="priveLightboxImg" style="display: block; max-width: 90vw; max-height: 85vh; border-radius: 8px; border: 1px solid rgba(223,194,133,0.4); box-shadow: 0 20px 50px rgba(0,0,0,0.95); object-fit: contain; pointer-events: none;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 180px; height: 80px; background-image: url('img/logo.png'); background-size: contain; background-repeat: no-repeat; background-position: center; opacity: 0.5; pointer-events: none; z-index: 10000000;"></div>
                </div>
            `;
            document.body.appendChild(lightbox);
            lightbox.onclick = () => { lightbox.style.display = 'none'; };
        }

        document.querySelectorAll('.perfil-galeria-grid .foto-principal, .grid-perfiles .card-image img, .story-ring img, .galeria-miniaturas img').forEach(img => {
            img.style.cursor = 'zoom-in';
            img.onclick = function(e) {
                e.preventDefault(); e.stopPropagation();
                document.getElementById('priveLightboxImg').src = this.src;
                document.getElementById('priveLightbox').style.display = 'flex';
            };
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        inicializarVisorFotos();
        setTimeout(inicializarVisorFotos, 600);

        const btnWa = document.querySelector('.btn-whatsapp');
        const mainContainer = document.querySelector('.perfil-container') || document.querySelector('.container');
        
        if (btnWa && mainContainer) {
            btnWa.classList.add('btn-whatsapp-titilante');
            btnWa.style.cssText = "display: block !important; position: relative !important; width: 100% !important; margin: 30px 0 20px 0 !important; text-align: center !important; font-size: 14px !important; font-weight: 600 !important; letter-spacing: 1px !important; border-radius: 6px !important;";
            
            const seccionComentarios = document.getElementById('seccion-comentarios');
            if (seccionComentarios) {
                mainContainer.insertBefore(btnWa, seccionComentarios);
            } else {
                mainContainer.appendChild(btnWa);
            }
        }
    });

    let perfilId = typeof ID_PERFIL_ACTUAL !== 'undefined' ? ID_PERFIL_ACTUAL : window.location.pathname.split("/").pop().replace(".html", "");
    if (!perfilId || perfilId === "") perfilId = "general";

    const contenedorDestino = document.getElementById('seccion-comentarios');
    if (!contenedorDestino) return;

    const lang = obtenerIdiomaActual();
    const tExp = lang === 'en' ? "Experiences & Comments" : "Experiencias y Comentarios";
    const tAuth = lang === 'en' ? "Your name or nickname" : "Tu nombre o apodo";
    const tText = lang === 'en' ? "Write about your experience..." : "Escribe tu experiencia...";
    const tPub = lang === 'en' ? "Publish Experience" : "Publicar Experiencia";
    const tLoad = lang === 'en' ? "Loading experiences..." : "Cargando experiencias...";
    const tNone = lang === 'en' ? "No experiences yet. Be the first to leave one!" : "No hay experiencias aún. ¡Sé el primero en dejar una!";
    const tLike = lang === 'en' ? "Like" : "Me gusta";
    const tDel = lang === 'en' ? "Delete" : "Eliminar";

    contenedorDestino.innerHTML = `
        <div style="width: 100%; box-sizing: border-box; margin: 20px auto 10px auto; padding: 22px 15px; background: #141414; border: 1px solid rgba(223, 194, 133, 0.25); border-radius: 10px; font-family: 'Montserrat', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h3 style="color: #dfc285; text-align: center; font-size: 20px; margin-bottom: 20px; font-family: 'Cormorant Garamond', serif; letter-spacing: 1.5px;">${tExp}</h3>
            <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;">
                <input type="text" id="pAuthor" placeholder="${tAuth}" style="width: 100% !important; padding: 12px 15px; box-sizing: border-box !important; border: 1px solid rgba(223, 194, 133, 0.3); background: #1a1a1a; color: #fff; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 14px;">
                <textarea id="pText" rows="3" placeholder="${tText}" style="width: 100% !important; padding: 12px 15px; box-sizing: border-box !important; border: 1px solid rgba(223, 194, 133, 0.3); background: #1a1a1a; color: #fff; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 14px; resize: vertical;"></textarea>
                <div style="display: flex; gap: 8px; align-items: center; background: #1a1a1a; padding: 10px 12px; border-radius: 6px; border: 1px solid rgba(223, 194, 133, 0.3); flex-wrap: wrap; width: 100%; box-sizing: border-box;">
                    <button type="button" onclick="window.agregarEmojiPerfil('😊')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;">😊</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('👍')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;">👍</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('🔥')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;">🔥</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('❤️')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;">❤️</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('⭐')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;">⭐</button>
                    <label style="color: #dfc285; cursor: pointer; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; background: rgba(223,194,133,0.1); width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(223, 194, 133, 0.4); margin-left: auto;">
                        📎 <input type="file" id="pImageFile" accept="image/*" onchange="window.previewPerfilFile()" style="display:none;">
                    </label>
                </div>
                <span id="pFileName" style="font-size: 11px; color: #dfc285; font-style: italic; padding-left: 2px;"></span>
                <button onclick="window.enviarComentarioPerfil()" style="background: linear-gradient(135deg, #dfc285, #c5a059); color: #0d0d0d; border: none; padding: 14px; cursor: pointer; border-radius: 6px; font-weight: 600; width: 100% !important; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-family: 'Montserrat', sans-serif;">${tPub}</button>
            </div>
            <div id="pCommentsContainer" style="margin-top: 25px; width: 100%; box-sizing: border-box;">
                <p style="text-align: center; color: #888; font-size: 13px; font-style: italic;">${tLoad}</p>
            </div>
            <div style="text-align: center; margin-top: 35px; font-size: 11px;">
                <span onclick="window.activarAdminPerfil()" style="cursor: pointer; color: #555; text-transform: uppercase; letter-spacing: 1px;">Admin</span>
            </div>
        </div>
    `;

    if (typeof firebase === 'undefined') {
        const scriptApp = document.createElement('script');
        scriptApp.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
        scriptApp.onload = () => {
            const scriptFs = document.createElement('script');
            scriptFs.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js";
            scriptFs.onload = inicializarSistemaComentarios;
            document.head.appendChild(scriptFs);
        };
        document.head.appendChild(scriptApp);
    } else {
        inicializarSistemaComentarios();
    }

    function inicializarSistemaComentarios() {
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyBDSGPbs_ioH74p-RTctx9av5KKjhnDjBQ",
                authDomain: "masajistasprivepro.firebaseapp.com",
                projectId: "masajistasprivepro",
                storageBucket: "masajistasprivepro.firebasestorage.app",
                messagingSenderId: "768677270509",
                appId: "1:768677270509:web:f4409c2f9c0bbb42ebcde4",
                measurementId: "G-SBN70C32JF"
            });
        }
        const dbPerfil = firebase.firestore();
        let isAdminPerfil = sessionStorage.getItem("priveAdmin") === "true";

        window.activarAdminPerfil = function() {
            const pass = prompt("Contraseña de administrador:");
            if (pass === "prive2026") {
                isAdminPerfil = true; sessionStorage.setItem("priveAdmin", "true");
                alert("Modo administrador activado."); location.reload();
            } else if (pass !== null) { alert("Contraseña incorrecta."); }
        };

        window.agregarEmojiPerfil = function(emoji) {
            const txt = document.getElementById('pText');
            if(txt) { txt.value += emoji; txt.focus(); }
        };

        window.previewPerfilFile = function() {
            const input = document.getElementById('pImageFile');
            const span = document.getElementById('pFileName');
            if (input && input.files && input.files[0]) {
                span.textContent = "✓ " + (lang === 'en' ? "Attached file: " : "Archivo adjunto: ") + input.files[0].name;
            } else if(span) { span.textContent = ""; }
        };

        function comprimirImagenPerfil(callback) {
            const input = document.getElementById('pImageFile');
            if (!input || !input.files || !input.files[0]) { callback(null); return; }
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    const max = 500;
                    if (w > h && w > max) { h *= max / w; w = max; }
                    else if (h > max) { w *= max / h; h = max; }
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    callback(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }

        dbPerfil.collection("perfiles_comentarios").doc(perfilId).collection("mensajes").onSnapshot((snapshot) => {
            const container = document.getElementById('pCommentsContainer');
            if (!container) return;
            container.innerHTML = "";

            if (snapshot.empty) {
                container.innerHTML = `<p style='color: #777; font-size: 13px; text-align: center; font-style: italic;'>${tNone}</p>`;
                return;
            }

            let lista = [];
            snapshot.forEach(doc => lista.push({ id: doc.id, ...doc.data() }));
            
            lista.sort((a, b) => {
                const scoreA = (a.likes || 0) + (a.image ? 5 : 0);
                const scoreB = (b.likes || 0) + (b.image ? 5 : 0);
                if (scoreB !== scoreA) return scoreB - scoreA;
                return (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0);
            });

            lista.forEach(data => {
                const fechaStr = data.fecha ? new Date(data.fecha.toDate()).toLocaleString() : (lang === 'en' ? 'Just now' : 'Hace un momento');
                const likes = data.likes || 0;
                const imgHtml = data.image ? `<img src="${data.image}" style="max-width: 100%; max-height: 180px; border-radius: 6px; margin-top: 10px; display: block; object-fit: cover; border: 1px solid rgba(223,194,133,0.4);" alt="Adjunto">` : '';
                const deleteBtn = isAdminPerfil ? `<button onclick="window.borrarComentarioPerfil('${data.id}', '${perfilId}')" style="background:none; border:none; color:#ff5555; cursor:pointer; font-size:11px; font-weight:bold; float:right; text-transform: uppercase;">🗑️ ${tDel}</button>` : '';

                const div = document.createElement('div');
                div.style.cssText = "font-size: 13px; margin-bottom: 15px; color: #ccc; word-break: break-word; background: #1a1a1a; padding: 15px; border-radius: 6px; position: relative; border-left: 3px solid #dfc285; border: 1px solid rgba(223,194,133,0.15); width: 100%; box-sizing: border-box;";
                div.innerHTML = `
                    ${deleteBtn}
                    <div>
                        <span style="color: #dfc285; font-weight: bold; margin-right: 6px;">${escapeHtmlPerfil(data.autor)}:</span>
                        <span style="color: #e5e0d8; line-height: 1.5;">${escapeHtmlPerfil(data.contenido)}</span>
                        ${imgHtml}
                        <span style="font-size: 11px; color: #777; margin-left: 2px; display: block; margin-top: 8px;">${fechaStr}</span>
                    </div>
                    <div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; display: flex; align-items: center; justify-content: space-between;">
                        <button onclick="window.darLikePerfil('${data.id}', ${likes}, '${perfilId}')" style="background:none; border:none; color:#dfc285; cursor:pointer; font-size:12px; font-weight:600; display:flex; align-items:center; gap:5px;">👍 ${tLike} (<span id="plikes-${data.id}">${likes}</span>)</button>
                        ${data.image ? `<span style="font-size: 10px; color: #dfc285; background: rgba(223,194,133,0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(223,194,133,0.3); text-transform: uppercase;">${lang === 'en' ? '★ Featured' : '★ Destacado'}</span>` : ''}
                    </div>
                `;
                container.appendChild(div);
            });
        });

        window.enviarComentarioPerfil = function() {
            const autor = document.getElementById('pAuthor').value.trim();
            const contenido = document.getElementById('pText').value.trim();
            if (!autor || !contenido) {
                alert(lang === 'en' ? "Please fill in your name and experience." : "Por favor completá tu nombre y tu experiencia.");
                return;
            }
            comprimirImagenPerfil((base64) => {
                dbPerfil.collection("perfiles_comentarios").doc(perfilId).collection("mensajes").add({
                    autor: autor, contenido: contenido, image: base64 || "", likes: 0, fecha: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    document.getElementById('pAuthor').value = '';
                    document.getElementById('pText').value = '';
                    document.getElementById('pImageFile').value = '';
                    document.getElementById('pFileName').textContent = '';
                });
            });
        };

        window.darLikePerfil = function(msgId, currentLikes, pId) {
            dbPerfil.collection("perfiles_comentarios").doc(pId).collection("mensajes").doc(msgId).update({ likes: currentLikes + 1 });
        };

        window.borrarComentarioPerfil = function(msgId, pId) {
            if (confirm(lang === 'en' ? "Are you sure you want to delete this comment?" : "¿Estás seguro de eliminar este comentario?")) {
                dbPerfil.collection("perfiles_comentarios").doc(pId).collection("mensajes").doc(msgId).delete();
            }
        };

        function escapeHtmlPerfil(text) {
            if (!text) return '';
            return text.replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m]));
        }
    }
})();
