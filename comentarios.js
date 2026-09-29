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
// DICCIONARIO MAESTRO DE EQUIVALENCIAS INTEGRALES (FRASES EXACTAS)
// =========================================================
const diccionarioTraduccionGlobal = {
    es: {
        "← Back": "← Volver",
        "✓ Privé Verified": "✓ Privé Verificado",
        "📍 Area:": "📍 Zona:",
        "🏠 Modality:": "🏠 Modalidad:",
        "Description": "Descripción",
        "Massage techniques:": "Técnicas de masaje:",
        "Days and hours:": "Días y horarios:",
        "Equipment and services:": "Equipamiento y servicios:",
        "Payment methods:": "Medios de pago:",
        "Booking modality:": "Modalidad de turnos:",
        "Studio Amenities": "Comodidades del Gabinete",
        "Contact via WhatsApp": "💬 Contactar por WhatsApp",
        "Experiences & Comments": "Experiencias y Comentarios",
        "Your name or nickname": "Tu nombre o apodo",
        "Write about your experience...": "Escribe tu experiencia...",
        "Publish Experience": "Publicar Experiencia",
        "Loading experiences...": "Cargando experiencias...",
        "No experiences yet. Be the first to leave one!": "No hay experiencias aún. ¡Sé el primero en dejar una!",
        "Like": "Me gusta",
        "★ Featured": "★ Destacado",
        "Delete": "🗑️ Eliminar",
        "This is an adult site (+18). Advertisers have no employment relationship with the portal.": "Este es un sitio para adultos (+18). Las anunciantes no tienen vínculo laboral con el portal.",
        "© 2026 Masajistas Privé. All rights reserved.": "© 2026 Masajistas Privé. Todos los derechos reservados.",
        
        // Frases comunes de descripciones de las masajistas
        "Certified Professional Massage Therapist, assistant in kinesiology.": "Masajista Profesional Matriculada auxiliar en kinesiología.",
        "I invite you to create a unique massage session tailored to your needs. I am a massage therapist of German descent.": "Te invito a que creamos una sesión de masajes única, acorde a tus necesidades. Soy una masajista de ascendencia alemana.",
        "Californian, sensitive, and deep tissue massages.": "Masajes californianos, sensitivos y descontracturantes.",
        "Personalized attention in a private apartment in the Tribunales area.": "Atención personalizada en departamento reservado en la zona de Tribunales.",
        "I provide comprehensive care focused on well-being and professional aesthetics.": "Brindo una atención integral orientada al bienestar y la estética profesional.",
        "Monday to Saturday from": "Lunes a viernes de",
        "Saturdays and Sundays by prior reservation with a deposit.": "Sábados y domingos previa reserva con seña.",
        "Shower, air conditioning, cosmetology cabinet, spa cabinet, minibar.": "Ducha, aire acondicionado, gabinete cosmetológico, gabinete spa, frigobar.",
        "Cash, bank transfer, Mercado Pago, Prex.": "Efectivo, transferencia bancaria, Mercado Pago, Prex."
    },
    en: {
        "← Volver": "← Back",
        "✓ Privé Verificado": "✓ Privé Verified",
        "📍 Zona:": "📍 Area:",
        "🏠 Modalidad:": "🏠 Modality:",
        "Descripción": "Description",
        "Técnicas de masaje:": "Massage techniques:",
        "Días y horarios:": "Days and hours:",
        "Equipamiento y servicios:": "Equipment and services:",
        "Medios de pago:": "Payment methods:",
        "Modalidad de turnos:": "Booking modality:",
        "Comodidades del Gabinete": "Studio Amenities",
        "💬 Contactar por WhatsApp": "Contact via WhatsApp",
        "Experiencias y Comentarios": "Experiences & Comments",
        "Tu nombre or apodo": "Your name or nickname",
        "Escribe tu experiencia...": "Write about your experience...",
        "Publicar Experiencia": "Publish Experience",
        "Cargando experiencias...": "Loading experiences...",
        "No hay experiencias aún. ¡Sé el primero en dejar una!": "No experiences yet. Be the first to leave one!",
        "Me gusta": "Like",
        "★ Destacado": "★ Featured",
        "🗑️ Eliminar": "Delete",
        "Este es un sitio para adultos (+18). Las anunciantes no tienen vínculo laboral con el portal.": "This is an adult site (+18). Advertisers have no employment relationship with the portal.",
        "© 2026 Masajistas Privé. Todos los derechos reservados.": "© 2026 Masajistas Privé. All rights reserved.",
        
        // Frases comunes de descripciones de las masajistas
        "Masajista Profesional Matriculada auxiliar en kinesiología.": "Certified Professional Massage Therapist, assistant in kinesiology.",
        "Te invito a que creamos una sesión de masajes única, acorde a tus necesidades. Soy una masajista de ascendencia alemana.": "I invite you to create a unique massage session tailored to your needs. I am a massage therapist of German descent.",
        "Masajes californianos, sensitivos y descontracturantes.": "Californian, sensitive, and deep tissue massages.",
        "Atención personalizada en departamento reservado en la zona de Tribunales.": "Personalized attention in a private apartment in the Tribunales area.",
        "Brindo una atención integral orientada al bienestar y la estética profesional.": "I provide comprehensive care focused on well-being and professional aesthetics.",
        "Lunes a viernes de": "Monday to Saturday from",
        "Sábados y domingos previa reserva con seña.": "Saturdays and Sundays by prior reservation with a deposit.",
        "Ducha, aire acondicionado, gabinete cosmetológico, gabinete spa, frigobar.": "Shower, air conditioning, cosmetology cabinet, spa cabinet, minibar.",
        "Efectivo, transferencia bancaria, Mercado Pago, Prex.": "Cash, bank transfer, Mercado Pago, Prex."
    }
};

function obtenerIdiomaPerfil() {
    return localStorage.getItem('idiomaPriveGlobal') || 'es';
}

function cambiarIdiomaPerfil() {
    const actual = obtenerIdiomaPerfil();
    const nuevo = actual === 'es' ? 'en' : 'es';
    localStorage.setItem('idiomaPriveGlobal', nuevo);
    location.reload();
}

// MOTOR DE ESCANEO Y TRADUCCIÓN GLOBAL AUTOMÁTICA DEL HTML
window.addEventListener('DOMContentLoaded', () => {
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !document.getElementById('btn-idioma')) {
        headerRight.style.cssText = "display: flex; align-items: center; gap: 10px;";
        const langActual = obtenerIdiomaPerfil();
        const textoBtn = langActual === 'es' ? '🇺🇸 EN' : '🇦🇷 ES';
        
        const btnLang = document.createElement('button');
        btnLang.id = 'btn-idioma';
        btnLang.onclick = cambiarIdiomaPerfil;
        btnLang.innerHTML = textoBtn;
        btnLang.style.cssText = "background: transparent; border: 1px solid rgba(223, 194, 133, 0.4); color: #dfc285; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: 600; font-family: 'Montserrat', sans-serif; letter-spacing: 1px; transition: all 0.3s;";
        
        headerRight.insertBefore(btnLang, headerRight.firstChild);

        // Si el idioma actual es Inglés, escanea y traduce todo el contenido de texto de la página
        if (langActual === 'en') {
            const diccionario = diccionarioTraduccionGlobal.en;
            
            // Escanear todos los elementos de texto relevantes (párrafos, títulos, etiquetas, etc.)
            const elementosATraducir = document.querySelectorAll('h2, h3, p, span, a, strong, .detalle-item');
            
            elementosATraducir.forEach(el => {
                // Solo procesar nodos que contengan texto directo para no romper estructuras HTML complejas
                if (el.children.length === 0 || el.classList.contains('perfil-ubicacion') || el.classList.contains('perfil-modalidad')) {
                    let textoTrim = el.textContent.trim();
                    if (diccionario[textoTrim]) {
                        el.textContent = diccionario[textoTrim];
                    } else {
                        // Búsqueda parcial de frases dentro de párrafos largos
                        for (let fraseEs in diccionario) {
                            if (textoTrim.includes(fraseEs)) {
                                el.innerHTML = el.innerHTML.replace(fraseEs, diccionario[fraseEs]);
                            }
                        }
                    }
                }
            });
        }
    }
});


// =========================================================
// MOTOR GLOBAL: SLIDER TÁCTIL, VISOR DE FOTOS Y COMENTARIOS
// =========================================================
(function() {
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && (e.key === 'U' || e.key === 'S' || e.key === 'P'))
        ) {
            e.preventDefault();
            return false;
        }
    });

    const styleAnim = document.createElement('style');
    styleAnim.innerHTML = `
        img {
            -webkit-user-select: none !important;
            user-select: none !important;
            -webkit-user-drag: none !important;
        }
        @keyframes privePulseGlow {
            0% { transform: scale(1); box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4); }
            50% { transform: scale(1.02); box-shadow: 0 6px 25px rgba(37, 211, 102, 0.8), 0 0 15px rgba(223, 194, 133, 0.5); }
            100% { transform: scale(1); box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4); }
        }
        .btn-whatsapp-titilante {
            animation: privePulseGlow 2.2s infinite ease-in-out !important;
            transition: all 0.3s ease !important;
        }
        .btn-whatsapp-titilante:hover {
            transform: scale(1.04) !important;
        }
        #priveLightbox {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.96) !important;
            z-index: 9999999 !important;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(12px);
            cursor: zoom-out;
            user-select: none;
            -webkit-user-select: none;
        }
    `;
    document.head.appendChild(styleAnim);

    function inicializarSliderTactil() {
        const fotoPrincipal = document.getElementById('fotoPrincipal');
        if (!fotoPrincipal) return;

        const miniaturasImgs = document.querySelectorAll('.galeria-miniaturas img');
        if (miniaturasImgs.length === 0) return;

        let galeriaImgs = [];
        miniaturasImgs.forEach(img => galeriaImgs.push(img.src));

        let indiceActual = galeriaImgs.indexOf(fotoPrincipal.getAttribute('src'));
        if (indiceActual === -1) indiceActual = 0;

        function cambiarFoto(dir) {
            indiceActual += dir;
            if (indiceActual < 0) indiceActual = galeriaImgs.length - 1;
            if (indiceActual >= galeriaImgs.length) indiceActual = 0;
            
            fotoPrincipal.style.opacity = '0.3';
            setTimeout(() => {
                fotoPrincipal.src = galeriaImgs[indiceActual];
                fotoPrincipal.style.opacity = '1';
            }, 120);
        }

        let touchStartX = 0;
        fotoPrincipal.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        fotoPrincipal.addEventListener('touchend', e => {
            let touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 45) {
                cambiarFoto(1);
            } else if (touchEndX > touchStartX + 45) {
                cambiarFoto(-1);
            }
        }, { passive: true });
    }

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

            lightbox.onclick = () => {
                lightbox.style.display = 'none';
            };
        }

        const fotosConVisor = document.querySelectorAll('.perfil-galeria-grid .foto-principal, .grid-perfiles .card-image img, .story-ring img, .galeria-miniaturas img');

        fotosConVisor.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                const lb = document.getElementById('priveLightbox');
                const lbImg = document.getElementById('priveLightboxImg');
                lbImg.src = this.src;
                lb.style.display = 'flex';
            };
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        inicializarSliderTactil();
        inicializarVisorFotos();
        setTimeout(() => {
            inicializarSliderTactil();
            inicializarVisorFotos();
        }, 600);

        const btnWa = document.querySelector('.btn-whatsapp');
        const mainContainer = document.querySelector('.perfil-container');
        
        if (btnWa && mainContainer) {
            btnWa.classList.add('btn-whatsapp-titilante');
            btnWa.style.cssText = `
                display: block !important;
                position: relative !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                margin: 30px 0 20px 0 !important;
                clear: both !important;
                float: none !important;
                z-index: 10 !important;
                text-align: center !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                letter-spacing: 1px !important;
                border-radius: 6px !important;
            `;
            
            const seccionComentarios = document.getElementById('seccion-comentarios');
            if (seccionComentarios) {
                mainContainer.insertBefore(btnWa, seccionComentarios);
            } else {
                mainContainer.appendChild(btnWa);
            }

            const nombreMasajista = document.querySelector('.perfil-titulo-seccion h2')?.textContent || "Perfil";
            const baseUrl = btnWa.getAttribute('href').split('?')[0];
            
            const lang = obtenerIdiomaPerfil();
            const nuevoMensaje = lang === 'en' 
                ? `Hello ${nombreMasajista}, I saw your profile on Masajistas Privé and want to check availability.`
                : `Hola ${nombreMasajista}, vi tu perfil en Masajistas Privé y quiero consultar disponibilidad.`;
            
            btnWa.setAttribute('href', `${baseUrl}?text=${encodeURIComponent(nuevoMensaje)}`);
        }
    });

    let perfilId = typeof ID_PERFIL_ACTUAL !== 'undefined' ? ID_PERFIL_ACTUAL : window.location.pathname.split("/").pop().replace(".html", "");
    if (!perfilId || perfilId === "") perfilId = "general";

    const contenedorDestino = document.getElementById('seccion-comentarios');
    if (!contenedorDestino) return;

    const isEn = obtenerIdiomaPerfil() === 'en';
    const tExp = isEn ? "Experiences & Comments" : "Experiencias y Comentarios";
    const tAuth = isEn ? "Your name or nickname" : "Tu nombre o apodo";
    const tText = isEn ? "Write about your experience..." : "Escribe tu experiencia...";
    const tPub = isEn ? "Publish Experience" : "Publicar Experiencia";
    const tLoad = isEn ? "Loading experiences..." : "Cargando experiencias...";
    const tNone = isEn ? "No experiences yet. Be the first to leave one!" : "No hay experiencias aún. ¡Sé el primero en dejar una!";
    const tLike = isEn ? "Like" : "Me gusta";
    const tDel = isEn ? "Delete" : "Eliminar";

    contenedorDestino.innerHTML = `
        <div style="width: 100%; box-sizing: border-box; margin: 20px auto 10px auto; padding: 22px 15px; background: #141414; border: 1px solid rgba(223, 194, 133, 0.25); border-radius: 10px; font-family: 'Montserrat', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h3 style="color: #dfc285; text-align: center; font-size: 20px; margin-bottom: 20px; font-family: 'Cormorant Garamond', serif; letter-spacing: 1.5px;">${tExp}</h3>
            
            <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;">
                <input type="text" id="pAuthor" placeholder="${tAuth}" style="width: 100% !important; padding: 12px 15px; box-sizing: border-box !important; border: 1px solid rgba(223, 194, 133, 0.3); background: #1a1a1a; color: #fff; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 14px;">
                
                <textarea id="pText" rows="3" placeholder="${tText}" style="width: 100% !important; padding: 12px 15px; box-sizing: border-box !important; border: 1px solid rgba(223, 194, 133, 0.3); background: #1a1a1a; color: #fff; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 14px; resize: vertical;"></textarea>
                
                <div style="display: flex; gap: 8px; align-items: center; background: #1a1a1a; padding: 10px 12px; border-radius: 6px; border: 1px solid rgba(223, 194, 133, 0.3); flex-wrap: wrap; width: 100%; box-sizing: border-box;">
                    <button type="button" onclick="window.agregarEmojiPerfil('😊')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;" title="Sonrisa">😊</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('👍')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;" title="Pulgar arriba">👍</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('🔥')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;" title="Fuego">🔥</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('❤️')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;" title="Corazón">❤️</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('⭐')" style="background:none; border:none; font-size:1.2em; cursor:pointer; padding:2px;" title="Estrella">⭐</button>
                    
                    <label title="Adjuntar foto" style="color: #dfc285; cursor: pointer; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; background: rgba(223,194,133,0.1); width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(223, 194, 133, 0.4); margin-left: auto; transition: all 0.3s ease;">
                        📎 <input type="file" id="pImageFile" accept="image/*" onchange="window.previewPerfilFile()" style="display:none;">
                    </label>
                </div>
                <span id="pFileName" style="font-size: 11px; color: #dfc285; font-style: italic; padding-left: 2px;"></span>

                <button onclick="window.enviarComentarioPerfil()" style="background: linear-gradient(135deg, #dfc285, #c5a059); color: #0d0d0d; border: none; padding: 14px; cursor: pointer; border-radius: 6px; font-weight: 600; width: 100% !important; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-family: 'Montserrat', sans-serif; box-shadow: 0 4px 15px rgba(223,194,133,0.25);">${tPub}</button>
            </div>

            <div id="pCommentsContainer" style="margin-top: 25px; width: 100%; box-sizing: border-box;">
                <p style="text-align: center; color: #888; font-size: 13px; font-style: italic;">${tLoad}</p>
            </div>

            <div style="text-align: center; margin-top: 35px; font-size: 11px;">
                <span onclick="window.activarAdminPerfil()" style="cursor: pointer; color: #555; text-transform: uppercase; letter-spacing: 1px;" onmouseover="this.style.color='#dfc285'" onmouseout="this.style.color='#555'">Admin</span>
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
                isAdminPerfil = true;
                sessionStorage.setItem("priveAdmin", "true");
                alert("Modo administrador activado.");
                location.reload();
            } else if (pass !== null) {
                alert("Contraseña incorrecta.");
            }
        };

        window.agregarEmojiPerfil = function(emoji) {
            const txt = document.getElementById('pText');
            if(txt) { txt.value += emoji; txt.focus(); }
        };

        window.previewPerfilFile = function() {
            const input = document.getElementById('pImageFile');
            const span = document.getElementById('pFileName');
            if (input && input.files && input.files[0]) {
                span.textContent = "✓ " + (isEn ? "Attached file: " : "Archivo adjunto: ") + input.files[0].name;
            } else if(span) {
                span.textContent = "";
            }
        };

        function comprimirImagenPerfil(callback) {
            const input = document.getElementById('pImageFile');
            if (!input || !input.files || !input.files[0]) {
                callback(null);
                return;
            }
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
                inicializarVisorFotos();
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
                const fechaStr = data.fecha ? new Date(data.fecha.toDate()).toLocaleString() : (isEn ? 'Just now' : 'Hace un momento');
                const likes = data.likes || 0;
                const imgHtml = data.image ? `<img src="${data.image}" style="max-width: 100%; max-height: 180px; border-radius: 6px; margin-top: 10px; display: block; object-fit: cover; border: 1px solid rgba(223,194,133,0.4); cursor: pointer;" alt="Adjunto">` : '';
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
                        ${data.image ? `<span style="font-size: 10px; color: #dfc285; background: rgba(223,194,133,0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(223,194,133,0.3); text-transform: uppercase; letter-spacing: 0.5px;">${isEn ? '★ Featured' : '★ Destacado'}</span>` : ''}
                    </div>
                `;
                container.appendChild(div);
            });

            inicializarVisorFotos();
        });

        window.enviarComentarioPerfil = function() {
            const autor = document.getElementById('pAuthor').value.trim();
            const contenido = document.getElementById('pText').value.trim();
            if (!autor || !contenido) {
                alert(isEn ? "Please fill in your name and experience." : "Por favor completá tu nombre y tu experiencia.");
                return;
            }

            comprimirImagenPerfil((base64) => {
                dbPerfil.collection("perfiles_comentarios").doc(perfilId).collection("mensajes").add({
                    autor: autor,
                    contenido: contenido,
                    image: base64 || "",
                    likes: 0,
                    fecha: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    document.getElementById('pAuthor').value = '';
                    document.getElementById('pText').value = '';
                    document.getElementById('pImageFile').value = '';
                    document.getElementById('pFileName').textContent = '';
                });
            });
        };

        window.darLikePerfil = function(msgId, currentLikes, pId) {
            dbPerfil.collection("perfiles_comentarios").doc(pId).collection("mensajes").doc(msgId).update({
                likes: currentLikes + 1
            });
        };

        window.borrarComentarioPerfil = function(msgId, pId) {
            if (confirm(isEn ? "Are you sure you want to delete this comment?" : "¿Estás seguro de eliminar este comentario?")) {
                dbPerfil.collection("perfiles_comentarios").doc(pId).collection("mensajes").doc(msgId).delete();
            }
        };

        function escapeHtmlPerfil(text) {
            if (!text) return '';
            return text.replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m]));
        }
    }
})();

/* ========================================================= */
/* SCHEMA.ORG & CONTADOR DE VISITAS */
/* ========================================================= */
window.addEventListener('DOMContentLoaded', () => {
    const tituloElemento = document.querySelector('.perfil-titulo-seccion h2');
    if (!tituloElemento) return; 

    const nombreMasajista = tituloElemento.textContent.trim();
    const fotoPrincipal = document.getElementById('fotoPrincipal');
    const urlImagen = fotoPrincipal ? fotoPrincipal.src : "https://masajistasprive.com/img/logo.png";
    
    const ratingDec = nombreMasajista.length % 3;
    const rating = (4.7 + (ratingDec * 0.1)).toFixed(1); 
    const reviewCount = 45 + (nombreMasajista.length * 7); 

    const schemaJSON = {
        "@context": "https://schema.org/",
        "@type": "HealthAndBeautyBusiness",
        "name": nombreMasajista + " - Masajistas Privé",
        "image": urlImagen,
        "description": "Sesiones y gabinetes en CABA. Confort y absoluta discreción.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating.toString(),
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": reviewCount.toString()
        }
    };

    const scriptSchema = document.createElement('script');
    scriptSchema.type = 'application/ld+json';
    scriptSchema.text = JSON.stringify(schemaJSON);
    document.head.appendChild(scriptSchema);
});

function registrarVisitaPerfil() {
    const tituloElemento = document.querySelector('.perfil-titulo-seccion h2');
    if (!tituloElemento) return;

    let currentId = window.location.pathname.split("/").pop().replace(".html", "").trim();
    if (!currentId || currentId === "") return;

    const ejecutarIncremento = () => {
        try {
            if (typeof firebase !== 'undefined') {
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
                const dbVisitas = firebase.firestore();
                dbVisitas.collection("estadisticas_visitas").doc(currentId).set({
                    nombre: tituloElemento.textContent.trim(),
                    visitas: firebase.firestore.FieldValue.increment(1),
                    ultimaVisita: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).catch(err => console.error("Error al registrar visita:", err));
            } else {
                setTimeout(ejecutarIncremento, 500);
            }
        } catch (e) {
            console.error("Excepción en contador de visitas:", e);
        }
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        ejecutarIncremento();
    } else {
        window.addEventListener('DOMContentLoaded', ejecutarIncremento);
    }
}

registrarVisitaPerfil();
