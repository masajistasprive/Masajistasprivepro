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

// comentarios.js - Motor Global, Miniaturas Interactivas, Visor con Marca de Agua y Blindaje
(function() {
    // 1. Blindaje contra click derecho y atajos de inspección en imágenes
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

    // Inyectar estilos para el botón de WhatsApp, animaciones y el Visor (Lightbox)
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

    // 2. Gestión de Miniaturas y Visor de Pantalla Completa
    function inicializarInteraccionFotos() {
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

        // A. Hacer que las miniaturas cambien la foto principal al hacerles clic (si el HTML usa onclick tradicional, esto lo refuerza o respeta)
        const miniaturas = document.querySelectorAll('.galeria-miniaturas img');
        const fotoPrincipal = document.querySelector('.perfil-galeria-grid .foto-principal');

        miniaturas.forEach(mini => {
            mini.style.cursor = 'pointer';
            if (!mini.dataset.miniaturaAsignada) {
                mini.dataset.miniaturaAsignada = "true";
                mini.addEventListener('click', (e) => {
                    // Si no tiene un onclick propio en el HTML, cambiamos la foto principal automáticamente
                    if (fotoPrincipal && !mini.getAttribute('onclick')) {
                        e.preventDefault();
                        fotoPrincipal.src = mini.src;
                    }
                });
            }
        });

        // B. Vincular el visor de pantalla completa a la foto principal y miniaturas
        const selectorFotos = '.perfil-galeria-grid .foto-principal, .galeria-miniaturas img, .grid-perfiles .card-image img, .story-ring img';
        document.querySelectorAll(selectorFotos).forEach(img => {
            img.style.cursor = 'zoom-in';
            if (!img.dataset.visorAsignado) {
                img.dataset.visorAsignado = "true";
                img.addEventListener('click', (e) => {
                    // Si es miniatura y cambia la foto principal, permitimos el cambio, pero si hacen doble clic o toque sostenido abre el visor.
                    // Para que abra directo al primer toque en el visor (excepto miniaturas que cambian foto), diferenciamos:
                    if (img.closest('.galeria-miniaturas') && fotoPrincipal && !img.getAttribute('onclick')) {
                        return; // Deja que actúe el cambio de miniatura
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    const lb = document.getElementById('priveLightbox');
                    const lbImg = document.getElementById('priveLightboxImg');
                    // Si hacen clic en la foto principal, muestra la principal actual
                    lbImg.src = img.src;
                    lb.style.display = 'flex';
                });
            }
        });

        // Permitir abrir la foto principal directamente al hacerle clic
        if (fotoPrincipal && !fotoPrincipal.dataset.visorDirecto) {
            fotoPrincipal.dataset.visorDirecto = "true";
            fotoPrincipal.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const lb = document.getElementById('priveLightbox');
                const lbImg = document.getElementById('priveLightboxImg');
                lbImg.src = fotoPrincipal.src;
                lb.style.display = 'flex';
            });
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        inicializarInteraccionFotos();
        setTimeout(inicializarInteraccionFotos, 600);

        // 3. Reposicionar y animar el botón de WhatsApp con saludo dinámico
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

            const horaActual = new Date().getHours();
            let momento = "hoy";
            if (horaActual >= 6 && horaActual < 12) momento = "para esta mañana";
            else if (horaActual >= 12 && horaActual < 20) momento = "para esta tarde";
            else momento = "para esta noche";

            const nombreMasajista = document.querySelector('.perfil-titulo-seccion h2')?.textContent || "Perfil";
            const baseUrl = btnWa.getAttribute('href').split('?')[0];
            const nuevoMensaje = `Hola ${nombreMasajista}, vi tu perfil en Masajistas Privé y quería consultar disponibilidad ${momento}.`;
            btnWa.setAttribute('href', `${baseUrl}?text=${encodeURIComponent(nuevoMensaje)}`);
        }
    });

    let perfilId = typeof ID_PERFIL_ACTUAL !== 'undefined' ? ID_PERFIL_ACTUAL : window.location.pathname.split("/").pop().replace(".html", "");
    if (!perfilId || perfilId === "") perfilId = "general";

    const contenedorDestino = document.getElementById('seccion-comentarios');
    if (!contenedorDestino) return;

    // Caja de comentarios con botón de adjuntar minimalista (Clip 📎)
    contenedorDestino.innerHTML = `
        <div style="width: 100%; box-sizing: border-box; margin: 20px auto 10px auto; padding: 22px 15px; background: #141414; border: 1px solid rgba(223, 194, 133, 0.25); border-radius: 10px; font-family: 'Montserrat', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h3 style="color: #dfc285; text-align: center; font-size: 20px; margin-bottom: 20px; font-family: 'Cormorant Garamond', serif; letter-spacing: 1.5px;">Experiencias y Comentarios</h3>
            
            <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;">
                <input type="text" id="pAuthor" placeholder="Tu nombre o apodo" style="width: 100% !important; padding: 12px 15px; box-sizing: border-box !important; border: 1px solid rgba(223, 194, 133, 0.3); background: #1a1a1a; color: #fff; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 14px;">
                
                <textarea id="pText" rows="3" placeholder="Escribe tu experiencia..." style="width: 100% !important; padding: 12px 15px; box-sizing: border-box !important; border: 1px solid rgba(223, 194, 133, 0.3); background: #1a1a1a; color: #fff; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 14px; resize: vertical;"></textarea>
                
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

                <button onclick="window.enviarComentarioPerfil()" style="background: linear-gradient(135deg, #dfc285, #c5a059); color: #0d0d0d; border: none; padding: 14px; cursor: pointer; border-radius: 6px; font-weight: 600; width: 100% !important; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-family: 'Montserrat', sans-serif; box-shadow: 0 4px 15px rgba(223,194,133,0.25);">Publicar Experiencia</button>
            </div>

            <div id="pCommentsContainer" style="margin-top: 25px; width: 100%; box-sizing: border-box;">
                <p style="text-align: center; color: #888; font-size: 13px; font-style: italic;">Cargando experiencias...</p>
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
                span.textContent = "✓ Archivo adjunto: " + input.files[0].name;
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
                container.innerHTML = "<p style='color: #777; font-size: 13px; text-align: center; font-style: italic;'>No hay experiencias aún. ¡Sé el primero en dejar una!</p>";
                inicializarInteraccionFotos();
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
                const fechaStr = data.fecha ? new Date(data.fecha.toDate()).toLocaleString() : 'Hace un momento';
                const likes = data.likes || 0;
                const imgHtml = data.image ? `<img src="${data.image}" style="max-width: 100%; max-height: 180px; border-radius: 6px; margin-top: 10px; display: block; object-fit: cover; border: 1px solid rgba(223,194,133,0.4); cursor: pointer;" alt="Adjunto">` : '';
                const deleteBtn = isAdminPerfil ? `<button onclick="window.borrarComentarioPerfil('${data.id}', '${perfilId}')" style="background:none; border:none; color:#ff5555; cursor:pointer; font-size:11px; font-weight:bold; float:right; text-transform: uppercase;">🗑️ Eliminar</button>` : '';

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
                        <button onclick="window.darLikePerfil('${data.id}', ${likes}, '${perfilId}')" style="background:none; border:none; color:#dfc285; cursor:pointer; font-size:12px; font-weight:600; display:flex; align-items:center; gap:5px;">👍 Me gusta (<span id="plikes-${data.id}">${likes}</span>)</button>
                        ${data.image ? '<span style="font-size: 10px; color: #dfc285; background: rgba(223,194,133,0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(223,194,133,0.3); text-transform: uppercase; letter-spacing: 0.5px;">★ Destacado</span>' : ''}
                    </div>
                `;
                container.appendChild(div);
            });

            inicializarInteraccionFotos();
        });

        window.enviarComentarioPerfil = function() {
            const autor = document.getElementById('pAuthor').value.trim();
            const contenido = document.getElementById('pText').value.trim();
            if (!autor || !contenido) {
                alert("Por favor completá tu nombre y tu experiencia.");
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
            if (confirm("¿Estás seguro de eliminar este comentario?")) {
                dbPerfil.collection("perfiles_comentarios").doc(pId).collection("mensajes").doc(msgId).delete();
            }
        };

        function escapeHtmlPerfil(text) {
            if (!text) return '';
            return text.replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m]));
        }
    }
})();

