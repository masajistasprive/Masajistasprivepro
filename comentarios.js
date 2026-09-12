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

