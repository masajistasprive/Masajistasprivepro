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

// comentarios.js - Motor Global Optimizado con Firebase, Visor Táctil y Comentarios
(function() {
    const dictComentarios = {
        es: {
            tituloSeccion: "Experiencias y Comentarios",
            labelEstrellas: "Calificación:",
            placeholderNombre: "Tu nombre o apodo",
            placeholderTexto: "Escribe tu experiencia...",
            btnPublicar: "Publicar Experiencia",
            cargando: "Cargando experiencias...",
            sinExperiencias: "No hay experiencias aún. ¡Sé el primero en dejar una!",
            meGusta: "Me gusta",
            destacado: "★ Destacado",
            eliminar: "🗑️ Eliminar",
            alertaIncompleto: "Por favor completá tu nombre, elegí una calificación y escribí tu experiencia.",
            confirmEliminar: "¿Estás seguro de eliminar este comentario?",
            adjuntoTexto: "✓ Archivo adjunto: "
        },
        en: {
            tituloSeccion: "Experiences and Reviews",
            labelEstrellas: "Rating:",
            placeholderNombre: "Your name or nickname",
            placeholderTexto: "Write about your experience...",
            btnPublicar: "Publish Experience",
            cargando: "Loading experiences...",
            sinExperiencias: "No experiences yet. Be the first to leave one!",
            meGusta: "Like",
            destacado: "★ Featured",
            eliminar: "🗑 Delete",
            alertaIncompleto: "Please fill in your name, select a rating, and write your experience.",
            confirmEliminar: "Are you sure you want to delete this comment?",
            adjuntoTexto: "✓ Attached file: "
        },
        pt: {
            tituloSeccion: "Experiências e Comentários",
            labelEstrellas: "Avaliação:",
            placeholderNombre: "Seu nome ou apelido",
            placeholderTexto: "Escreva sua experiência...",
            btnPublicar: "Publicar Experiência",
            cargando: "Carregando experiências...",
            sinExperiencias: "Nenhuma experiência ainda. Seja o primeiro a deixar uma!",
            meGusta: "Curtir",
            destacado: "★ Destaque",
            eliminar: "🗑 Excluir",
            alertaIncompleto: "Por favor, preencha seu nome, selecione uma avaliação e escreva sua experiência.",
            confirmEliminar: "Tem certeza de que deseja excluir este comentário?",
            adjuntoTexto: "✓ Arquivo anexo: "
        },
        fr: {
            tituloSeccion: "Expériences et Avis",
            labelEstrellas: "Évaluation :",
            placeholderNombre: "Votre nom ou pseudo",
            placeholderTexto: "Écrivez votre expérience...",
            btnPublicar: "Publier l'expérience",
            cargando: "Chargement des avis...",
            sinExperiencias: "Aucun avis pour le moment. Soyez le premier à en laisser un !",
            meGusta: "J'aime",
            destacado: "★ En vedette",
            eliminar: "🗑 Supprimer",
            alertaIncompleto: "Veuillez remplir votre nom, sélectionner une note et écrire votre avis.",
            confirmEliminar: "Êtes-vous sûr de vouloir supprimer ce commentaire ?",
            adjuntoTexto: "✓ Fichier joint : "
        }
    };

    function obtenerLangActual() {
        return localStorage.getItem('idiomaPrive') || 'es';
    }

    // 1. Blindaje contra click derecho en imágenes y atajos
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

    // Inyectar estilos visuales necesarios (Lightbox, Estrellas y Seguridad)
    const styleAnim = document.createElement('style');
    styleAnim.innerHTML = `
        img {
            -webkit-user-select: none !important;
            user-select: none !important;
            -webkit-user-drag: none !important;
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
            user-select: none;
            -webkit-user-select: none;
        }
        .star-rating {
            display: inline-flex;
            gap: 4px;
            cursor: pointer;
            font-size: 22px;
            direction: rtl;
            justify-content: flex-end;
        }
        .star-rating input { display: none; }
        .star-rating label { color: #444; transition: color 0.2s; }
        .star-rating input:checked ~ label, 
        .star-rating label:hover, 
        .star-rating label:hover ~ label { color: #dfc285; }
    `;
    document.head.appendChild(styleAnim);

    // 2. Visor de Pantalla Completa Táctil (Swipe y Flechas)
    function inicializarVisorFotosDinamico() {
        let lightbox = document.getElementById('priveLightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'priveLightbox';
            lightbox.style.cssText = `
                display: none;
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.96) !important;
                z-index: 9999999 !important;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(12px);
                user-select: none;
                -webkit-user-select: none;
            `;
            lightbox.innerHTML = `
                <div style="position: relative; display: flex; justify-content: center; align-items: center; max-width: 90vw; max-height: 85vh; width: 100%;">
                    <button id="priveLbPrev" style="position: absolute; left: 10px; background: rgba(0,0,0,0.6); border: 1px solid #dfc285; color: #dfc285; font-size: 24px; padding: 10px 15px; cursor: pointer; border-radius: 50%; z-index: 10000001; outline: none;">&#10094;</button>
                    <img id="priveLightboxImg" style="display: block; max-width: 80vw; max-height: 85vh; border-radius: 8px; border: 1px solid rgba(223,194,133,0.4); box-shadow: 0 20px 50px rgba(0,0,0,0.95); object-fit: contain; pointer-events: none;">
                    <button id="priveLbNext" style="position: absolute; right: 10px; background: rgba(0,0,0,0.6); border: 1px solid #dfc285; color: #dfc285; font-size: 24px; padding: 10px 15px; cursor: pointer; border-radius: 50%; z-index: 10000001; outline: none;">&#10095;</button>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 180px; height: 80px; background-image: url('img/logo.png'); background-size: contain; background-repeat: no-repeat; background-position: center; opacity: 0.3; pointer-events: none; z-index: 10000000;"></div>
                </div>
                <button id="priveLbClose" style="position: absolute; top: 20px; right: 25px; background: none; border: none; color: #dfc285; font-size: 36px; cursor: pointer; z-index: 10000002;">&times;</button>
            `;
            document.body.appendChild(lightbox);

            document.getElementById('priveLbClose').onclick = () => { lightbox.style.display = 'none'; };
            lightbox.onclick = (e) => { if (e.target.id === 'priveLightbox') lightbox.style.display = 'none'; };
        }

        const miniaturas = document.querySelectorAll('.galeria-miniaturas img, .perfil-galeria-grid img');
        let listaUrlsFotos = [];
        miniaturas.forEach(img => {
            if (img.src && !listaUrlsFotos.includes(img.src)) {
                listaUrlsFotos.push(img.src);
            }
        });

        if (listaUrlsFotos.length === 0) {
            const fotoPrin = document.getElementById('fotoPrincipal');
            if (fotoPrin) listaUrlsFotos.push(fotoPrin.src);
        }

        let indiceLightboxActual = 0;

        function actualizarImagenLightbox(index) {
            if (listaUrlsFotos.length === 0) return;
            if (index < 0) index = listaUrlsFotos.length - 1;
            if (index >= listaUrlsFotos.length) index = 0;
            indiceLightboxActual = index;
            
            const lbImg = document.getElementById('priveLightboxImg');
            if (lbImg) {
                lbImg.style.opacity = '0.3';
                setTimeout(() => {
                    lbImg.src = listaUrlsFotos[indiceLightboxActual];
                    lbImg.style.opacity = '1';
                }, 100);
            }
        }

        const btnPrev = document.getElementById('priveLbPrev');
        const btnNext = document.getElementById('priveLbNext');
        if(btnPrev) btnPrev.onclick = (e) => { e.stopPropagation(); actualizarImagenLightbox(indiceLightboxActual - 1); };
        if(btnNext) btnNext.onclick = (e) => { e.stopPropagation(); actualizarImagenLightbox(indiceLightboxActual + 1); };

        let touchStartX = 0;
        lightbox.ontouchstart = (e) => { touchStartX = e.changedTouches[0].screenX; };
        lightbox.ontouchend = (e) => {
            let touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 40) {
                actualizarImagenLightbox(indiceLightboxActual + 1);
            } else if (touchEndX > touchStartX + 40) {
                actualizarImagenLightbox(indiceLightboxActual - 1);
            }
        };

        const fotosConVisor = document.querySelectorAll('.perfil-galeria-grid .foto-principal, img#fotoPrincipal, .galeria-miniaturas img');
        fotosConVisor.forEach(img => {
            img.style.cursor = 'zoom-in';
            if (!img.getAttribute('data-visor-vinculado')) {
                img.setAttribute('data-visor-vinculado', 'true');
                img.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const urlActual = this.src;
                    let idxEncontrado = listaUrlsFotos.indexOf(urlActual);
                    indiceLightboxActual = idxEncontrado !== -1 ? idxEncontrado : 0;
                    
                    actualizarImagenLightbox(indiceLightboxActual);
                    lightbox.style.display = 'flex';
                };
            }
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(inicializarVisorFotosDinamico, 500);
        setTimeout(inicializarVisorFotosDinamico, 1500);
    });

    // Detectar ID actual de la masajista
    const urlParams = new URLSearchParams(window.location.search);
    let perfilId = urlParams.get('id');
    if (!perfilId) {
        perfilId = window.location.pathname.split("/").pop().replace(".html", "").trim();
    }
    if (!perfilId || perfilId === "") perfilId = "general";

    const contenedorDestino = document.getElementById('seccion-comentarios');
    if (!contenedorDestino) return;

    const langInit = obtenerLangActual();
    const tInit = dictComentarios[langInit] || dictComentarios['es'];

    // Inyectar estructura de la casilla de comentarios
    contenedorDestino.innerHTML = `
        <div style="width: 100%; box-sizing: border-box; margin: 20px auto 10px auto; padding: 22px 15px; background: #141414; border: 1px solid rgba(223, 194, 133, 0.25); border-radius: 10px; font-family: 'Montserrat', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h3 style="color: #dfc285; text-align: center; font-size: 20px; margin-bottom: 20px; font-family: 'Cormorant Garamond', serif; letter-spacing: 1.5px;">${tInit.tituloSeccion}</h3>
            
            <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;">
                <div style="display: flex; align-items: center; justify-content: space-between; background: #1a1a1a; padding: 10px 15px; border-radius: 6px; border: 1px solid rgba(223, 194, 133, 0.3);">
                    <span style="font-size: 13px; color: #dfc285; font-weight: 500;">${tInit.labelEstrellas}</span>
                    <div class="star-rating">
                        <input type="radio" id="star5" name="rating" value="5" /><label for="star5" title="5 estrellas">★</label>
                        <input type="radio" id="star4" name="rating" value="4" /><label for="star4" title="4 estrellas">★</label>
                        <input type="radio" id="star3" name="rating" value="3" /><label for="star3" title="3 estrellas">★</label>
                        <input type="radio" id="star2" name="rating" value="2" /><label for="star2" title="2 estrella">★</label>
                        <input type="radio" id="star1" name="rating" value="1" /><label for="star1" title="1 estrella">★</label>
                    </div>
                </div>

                <input type="text" id="pAuthor" placeholder="${tInit.placeholderNombre}" style="width: 100% !important; padding: 12px 15px; box-sizing: border-box !important; border: 1px solid rgba(223, 194, 133, 0.3); background: #1a1a1a !important; color: #fff !important; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 14px;">
                
                <textarea id="pText" rows="3" placeholder="${tInit.placeholderTexto}" style="width: 100% !important; padding: 12px 15px; box-sizing: border-box !important; border: 1px solid rgba(223, 194, 133, 0.3); background: #1a1a1a !important; color: #fff !important; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 14px; resize: vertical;"></textarea>
                
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

                <button onclick="window.enviarComentarioPerfil()" style="background: linear-gradient(135deg, #dfc285, #c5a059); color: #0d0d0d; border: none; padding: 14px; cursor: pointer; border-radius: 6px; font-weight: 600; width: 100% !important; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-family: 'Montserrat', sans-serif; box-shadow: 0 4px 15px rgba(223,194,133,0.25);">${tInit.btnPublicar}</button>
            </div>

            <div id="pCommentsContainer" style="margin-top: 25px; width: 100%; box-sizing: border-box;">
                <p style="text-align: center; color: #888; font-size: 13px; font-style: italic;">${tInit.cargando}</p>
            </div>

            <div style="text-align: center; margin-top: 35px; font-size: 11px;">
                <span onclick="window.activarAdminPerfil()" style="cursor: pointer; color: #555; text-transform: uppercase; letter-spacing: 1px;" onmouseover="this.style.color='#dfc285'" onmouseout="this.style.color='#555'">Admin</span>
            </div>
        </div>
    `;

    // Inicializar Firebase y lógica de comentarios
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
            const currentLang = obtenerLangActual();
            const t = dictComentarios[currentLang] || dictComentarios['es'];
            if (input && input.files && input.files[0]) {
                span.textContent = t.adjuntoTexto + input.files[0].name;
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

            const currentLang = obtenerLangActual();
            const t = dictComentarios[currentLang] || dictComentarios['es'];

            if (snapshot.empty) {
                container.innerHTML = `<p style='color: #777; font-size: 13px; text-align: center; font-style: italic;'>${t.sinExperiencias}</p>`;
                inicializarVisorFotosDinamico();
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
                const fechaStr = data.fecha ? new Date(data.fecha.toDate()).toLocaleString() : (currentLang === 'es' ? 'Hace un momento' : 'Just now');
                const likes = data.likes || 0;
                
                const numEstrellas = data.rating || 5;
                const estrellasHtml = '★'.repeat(numEstrellas) + '☆'.repeat(5 - numEstrellas);

                const imgHtml = data.image ? `<img src="${data.image}" style="max-width: 100%; max-height: 180px; border-radius: 6px; margin-top: 10px; display: block; object-fit: cover; border: 1px solid rgba(223,194,133,0.4); cursor: pointer;" alt="Adjunto">` : '';
                const deleteBtn = isAdminPerfil ? `<button onclick="window.borrarComentarioPerfil('${data.id}', '${perfilId}')" style="background:none; border:none; color:#ff5555; cursor:pointer; font-size:11px; font-weight:bold; float:right; text-transform: uppercase;">${t.eliminar}</button>` : '';

                const div = document.createElement('div');
                div.style.cssText = "font-size: 13px; margin-bottom: 15px; color: #ccc; word-break: break-word; background: #1a1a1a; padding: 15px; border-radius: 6px; position: relative; border-left: 3px solid #dfc285; border: 1px solid rgba(223,194,133,0.15); width: 100%; box-sizing: border-box;";
                div.innerHTML = `
                    ${deleteBtn}
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="color: #dfc285; font-weight: bold; margin-right: 6px;">${escapeHtmlPerfil(data.autor)}:</span>
                            <span style="color: #dfc285; font-size: 14px; letter-spacing: 2px;">${estrellasHtml}</span>
                        </div>
                        <span style="color: #e5e0d8; line-height: 1.5; display: block; margin-top: 4px;">${escapeHtmlPerfil(data.contenido)}</span>
                        ${imgHtml}
                        <span style="font-size: 11px; color: #777; margin-left: 2px; display: block; margin-top: 8px;">${fechaStr}</span>
                    </div>
                    <div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; display: flex; align-items: center; justify-content: space-between;">
                        <button onclick="window.darLikePerfil('${data.id}', ${likes}, '${perfilId}')" style="background:none; border:none; color:#dfc285; cursor:pointer; font-size:12px; font-weight:600; display:flex; align-items:center; gap:5px;">👍 ${t.meGusta} (<span id="plikes-${data.id}">${likes}</span>)</button>
                        ${data.image ? `<span style="font-size: 10px; color: #dfc285; background: rgba(223,194,133,0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(223,194,133,0.3); text-transform: uppercase; letter-spacing: 0.5px;">${t.destacado}</span>` : ''}
                    </div>
                `;
                container.appendChild(div);
            });

            inicializarVisorFotosDinamico();
        });

        window.enviarComentarioPerfil = function() {
            const autor = document.getElementById('pAuthor').value.trim();
            const contenido = document.getElementById('pText').value.trim();
            const ratingSeleccionado = document.querySelector('input[name="rating"]:checked');
            const currentLang = obtenerLangActual();
            const t = dictComentarios[currentLang] || dictComentarios['es'];

            if (!autor || !contenido || !ratingSeleccionado) {
                alert(t.alertaIncompleto);
                return;
            }

            comprimirImagenPerfil((base64) => {
                dbPerfil.collection("perfiles_comentarios").doc(perfilId).collection("mensajes").add({
                    autor: autor,
                    contenido: contenido,
                    rating: parseInt(ratingSeleccionado.value),
                    image: base64 || "",
                    likes: 0,
                    fecha: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    document.getElementById('pAuthor').value = '';
                    document.getElementById('pText').value = '';
                    document.getElementById('pImageFile').value = '';
                    document.getElementById('pFileName').textContent = '';
                    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
                });
            });
        };

        window.darLikePerfil = function(msgId, currentLikes, pId) {
            dbPerfil.collection("perfiles_comentarios").doc(pId).collection("mensajes").doc(msgId).update({
                likes: currentLikes + 1
            });
        };

        window.borrarComentarioPerfil = function(msgId, pId) {
            const currentLang = obtenerLangActual();
            const t = dictComentarios[currentLang] || dictComentarios['es'];
            if (confirm(t.confirmEliminar)) {
                dbPerfil.collection("perfiles_comentarios").doc(pId).collection("mensajes").doc(msgId).delete();
            }
        };

        function escapeHtmlPerfil(text) {
            if (!text) return '';
            return text.replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m]));
        }
    }
})();
