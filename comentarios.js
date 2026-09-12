// comentarios.js - Sistema unificado de experiencias para Masajistas Privé
(function() {
    // Buscar si la página tiene definido un ID de perfil, si no usa el nombre del archivo HTML
    let perfilId = typeof ID_PERFIL_ACTUAL !== 'undefined' ? ID_PERFIL_ACTUAL : window.location.pathname.split("/").pop().replace(".html", "");
    if (!perfilId || perfilId === "") perfilId = "general";

    // Inyectar los estilos y la estructura HTML automáticamente donde esté el contenedor
    const contenedorDestino = document.getElementById('seccion-comentarios');
    if (!contenedorDestino) return;

    contenedorDestino.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto 30px auto; padding: 0 15px; font-family: Arial, sans-serif;">
            <h3 style="color: #dfbc63; text-align: center; font-size: 1.3em; margin-bottom: 15px;">Experiencias y Comentarios</h3>
            
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <input type="text" id="pAuthor" placeholder="Tu nombre o apodo" style="width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #444; background: #1a1a1a; color: #fff; border-radius: 4px;">
                
                <textarea id="pText" rows="3" placeholder="Escribe tu experiencia..." style="width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #444; background: #1a1a1a; color: #fff; border-radius: 4px;"></textarea>
                
                <div style="display: flex; gap: 8px; align-items: center; background: #1a1a1a; padding: 6px; border-radius: 4px; border: 1px solid #444;">
                    <button type="button" onclick="window.agregarEmojiPerfil('😊')" style="background:none; border:none; font-size:1.2em; cursor:pointer;">😊</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('👍')" style="background:none; border:none; font-size:1.2em; cursor:pointer;">👍</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('🔥')" style="background:none; border:none; font-size:1.2em; cursor:pointer;">🔥</button>
                    <button type="button" onclick="window.agregarEmojiPerfil('❤️')" style="background:none; border:none; font-size:1.2em; cursor:pointer;">❤️</button>
                    
                    <label style="color: #dfbc63; cursor: pointer; font-size: 0.85em; display: flex; align-items: center; gap: 4px; background: #252525; padding: 6px 10px; border-radius: 4px; border: 1px solid #444; margin-left: auto;">
                        📷 Adjuntar foto <input type="file" id="pImageFile" accept="image/*" onchange="window.previewPerfilFile()" style="display:none;">
                    </label>
                </div>
                <span id="pFileName" style="font-size: 0.75em; color: #dfbc63; font-style: italic;"></span>

                <button onclick="window.enviarComentarioPerfil()" style="background: #dfbc63; color: #121212; border: none; padding: 12px; cursor: pointer; border-radius: 4px; font-weight: bold; width: 100%; font-size: 1em;">PUBLICAR EXPERIENCIA</button>
            </div>

            <div id="pCommentsContainer" style="margin-top: 20px;">
                <p style="text-align: center; color: #888; font-style: italic;">Cargando experiencias...</p>
            </div>

            <div style="text-align: center; margin-top: 30px; font-size: 0.75em;">
                <span onclick="window.activarAdminPerfil()" style="cursor: pointer; color: #444;" onmouseover="this.style.color='#dfbc63'" onmouseout="this.style.color='#444'">Admin</span>
            </div>
        </div>
    `;

    // Cargar Firebase dinámicamente si no está cargado
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
                span.textContent = "✓ " + input.files[0].name;
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
                container.innerHTML = "<p style='color: #777; font-size: 0.85em; text-align: center; font-style: italic;'>No hay experiencias aún. ¡Sé el primero en dejar una!</p>";
                return;
            }

            let lista = [];
            snapshot.forEach(doc => lista.push({ id: doc.id, ...doc.data() }));
            lista.sort((a, b) => (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0));

            lista.forEach(data => {
                const fechaStr = data.fecha ? new Date(data.fecha.toDate()).toLocaleString() : 'Hace un momento';
                const likes = data.likes || 0;
                const imgHtml = data.image ? `<img src="${data.image}" style="max-width: 140px; max-height: 140px; border-radius: 6px; margin-top: 6px; display: block; object-fit: cover; border: 1px solid #444;" alt="Adjunto">` : '';
                const deleteBtn = isAdminPerfil ? `<button onclick="window.borrarComentarioPerfil('${data.id}', '${perfilId}')" style="background:none; border:none; color:#ff5555; cursor:pointer; font-size:0.8em; font-weight:bold; float:right;">🗑️ Eliminar</button>` : '';

                const div = document.createElement('div');
                div.style.cssText = "font-size: 0.9em; margin-bottom: 12px; color: #ccc; word-break: break-word; background: #1c1c1c; padding: 12px; border-radius: 6px; position: relative; border-left: 3px solid #dfbc63;";
                div.innerHTML = `
                    ${deleteBtn}
                    <div>
                        <span style="color: #dfbc63; font-weight: bold; margin-right: 6px;">${escapeHtmlPerfil(data.autor)}:</span>
                        <span>${escapeHtmlPerfil(data.contenido)}</span>
                        ${imgHtml}
                        <span style="font-size: 0.75em; color: #777; margin-left: 8px; display: block; margin-top: 4px;">${fechaStr}</span>
                    </div>
                    <div style="margin-top: 10px; border-top: 1px solid #333; padding-top: 6px;">
                        <button onclick="window.darLikePerfil('${data.id}', ${likes}, '${perfilId}')" style="background:none; border:none; color:#dfbc63; cursor:pointer; font-size:0.85em; font-weight:bold; display:flex; align-items:center; gap:4px;">👍 Me gusta (<span id="plikes-${data.id}">${likes}</span>)</button>
                    </div>
                `;
                container.appendChild(div);
            });
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
// --- SOUNDTRACK PRIVÉ - GLAMOUR CON MEMORIA PERSISTENTE ---
(function() {
    // Evitar múltiples instancias del script en la misma página
    if (window.priveSoundtrackLoaded) return;
    window.priveSoundtrackLoaded = true;

    // Crear o recuperar el elemento de audio globalmente en el DOM para persistir la sesión
    let audio = document.getElementById('priveAudioGlobal');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'priveAudioGlobal';
        audio.loop = true;
        audio.preload = 'auto';
        audio.innerHTML = '<source src="/masajistasprive/Masajistasprivepro/chill.mp3" type="audio/mpeg">';
        document.body.appendChild(audio);
    }

    // Restaurar el tiempo y estado previo desde localStorage al cargar
    window.addEventListener('DOMContentLoaded', () => {
        let savedTime = localStorage.getItem('priveAudioTime');
        let isPlaying = localStorage.getItem('priveAudioPlaying') === 'true';

        if (savedTime) {
            audio.currentTime = parseFloat(savedTime);
        }

        if (isPlaying) {
            audio.play().then(() => {
                updateUIState(true);
            }).catch(e => {
                console.log("Autoplay bloqueado por políticas del navegador:", e);
                updateUIState(false);
            });
        }

        // Actualizar la interfaz en la página actual
        buildPlayerInterface();
    });

    // Guardar el tiempo actual continuamente mientras se reproduce
    setInterval(() => {
        if (!audio.paused) {
            localStorage.setItem('priveAudioTime', audio.currentTime);
        }
    }, 1000);

    function buildPlayerInterface() {
        let targetContainer = document.getElementById('seccion-reproductor-prive');
        
        const playerHTML = `
            <div style="background: linear-gradient(145deg, #161616, #0d0d0d); border: 1px solid rgba(223, 188, 99, 0.4); border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); font-family: 'Cinzel', 'Times New Roman', serif; text-align: center; position: relative; overflow: hidden; margin: 10px 0;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #dfbc63, transparent);"></div>
                
                <span style="color: #dfbc63; font-size: 0.85em; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px;">Soundtrack Privé</span>
                <span style="color: #999; font-size: 0.72em; display: block; margin-bottom: 15px; letter-spacing: 0.5px;">Atmósfera sonora exclusiva para acompañar tu navegación</span>

                <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <button id="priveCustomPlayBtn" style="
                        background: linear-gradient(135deg, #dfbc63, #b89742); 
                        color: #121212; 
                        border: none; 
                        border-radius: 50px; 
                        padding: 10px 24px; 
                        cursor: pointer; 
                        font-weight: bold; 
                        font-size: 0.85em; 
                        letter-spacing: 1px;
                        display: flex; 
                        align-items: center; 
                        gap: 8px;
                        box-shadow: 0 4px 15px rgba(223, 188, 99, 0.3);
                        transition: all 0.3s ease;
                    ">
                        <span id="priveIcon" style="font-size: 1.1em;">${audio.paused ? '▶' : '⏸'}</span> 
                        <span id="priveBtnText">${audio.paused ? 'REPRODUCIR' : 'PAUSAR'}</span>
                    </button>
                </div>
                
                <div id="priveStatusText" style="color: ${audio.paused ? '#dfbc63' : '#dfbc63'}; font-size: 0.65em; margin-top: 12px; letter-spacing: 1px; text-transform: uppercase; opacity: 0.8;">
                    ${audio.paused ? 'Sistema en espera' : 'Reproduciendo ambiente'}
                </div>
            </div>
        `;

        if (targetContainer) {
            targetContainer.innerHTML = playerHTML;
        } else if (!document.getElementById('privePlayerContainer')) {
            const playerContainer = document.createElement('div');
            playerContainer.id = 'privePlayerContainer';
            playerContainer.style.cssText = "position: fixed; bottom: 20px; left: 20px; z-index: 9999;";
            playerContainer.innerHTML = playerHTML;
            document.body.appendChild(playerContainer);
        }

        const playBtn = document.getElementById('priveCustomPlayBtn');
        if (playBtn) {
            playBtn.onclick = () => {
                if (audio.paused) {
                    audio.play().then(() => {
                        localStorage.setItem('priveAudioPlaying', 'true');
                        updateUIState(true);
                    }).catch(e => {
                        console.log("Error al reproducir:", e);
                        audio.load();
                        audio.play().then(() => {
                            localStorage.setItem('priveAudioPlaying', 'true');
                            updateUIState(true);
                        });
                    });
                } else {
                    audio.pause();
                    localStorage.setItem('priveAudioPlaying', 'false');
                    updateUIState(false);
                }
            };
        }
    }

    function updateUIState(isPlaying) {
        const icon = document.getElementById('priveIcon');
        const btnText = document.getElementById('priveBtnText');
        const statusText = document.getElementById('priveStatusText');

        if (icon && btnText && statusText) {
            if (isPlaying) {
                icon.textContent = "⏸";
                btnText.textContent = "PAUSAR";
                statusText.textContent = "Reproduciendo ambiente";
            } else {
                icon.textContent = "▶";
                btnText.textContent = "REPRODUCIR";
                statusText.textContent = "En pausa";
            }
        }
    }
})();
