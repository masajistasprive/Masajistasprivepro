/* ========================================================= */
/* SCRIPT CENTRALIZADO DE COMENTARIOS Y PUENTE DE GALERÍA    */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    // 1. LÓGICA DE COMENTARIOS (Sistema local para los perfiles)
    const contenedorPerfil = document.querySelector('.perfil-main') || document.body;
    
    // Verificamos si ya existe la sección de comentarios en la página, si no, la creamos al final
    let seccionComentarios = document.getElementById('seccion-comentarios');
    
    if (!seccionComentarios && document.getElementById('fotoPrincipal')) {
        seccionComentarios = document.createElement('div');
        seccionComentarios.id = 'seccion-comentarios';
        seccionComentarios.style.cssText = "max-width: 800px; margin: 40px auto; padding: 20px; background: #141414; border: 1px solid #333; border-radius: 8px; color: #fff; font-family: 'Montserrat', sans-serif;";
        
        seccionComentarios.innerHTML = `
            <h3 style="color: #dfc285; font-family: 'Cormorant Garamond', serif; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 8px;">Dejanos tu opinión</h3>
            <div id="lista-comentarios" style="margin-bottom: 20px; font-size: 14px; color: #ccc;">
                <p style="font-style: italic; color: #777;">Sé el primero en dejar un comentario sobre este perfil.</p>
            </div>
            <form id="form-comentario" style="display: flex; flex-direction: column; gap: 10px;">
                <input type="text" id="nombre-usuario" placeholder="Tu nombre o apodo" required style="padding: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px; font-size: 14px;">
                <textarea id="texto-comentario" placeholder="Escribe tu comentario con respeto..." rows="3" required style="padding: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px; font-size: 14px; resize: vertical;"></textarea>
                <button type="submit" style="background: #dfc285; color: #0d0d0d; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 600; text-transform: uppercase; font-size: 13px; align-self: flex-end; transition: opacity 0.3s;">Publicar comentario</button>
            </form>
        `;
        
        // Lo insertamos antes del footer si existe, o al final del body
        const footer = document.querySelector('footer');
        if (footer) {
            footer.parentNode.insertBefore(seccionComentarios, footer);
        } else {
            document.body.appendChild(seccionComentarios);
        }

        // Lógica para guardar y mostrar comentarios localmente
        const form = document.getElementById('form-comentario');
        const lista = document.getElementById('lista-comentarios');
        const pathActual = window.location.pathname;
        const storageKey = 'comentarios_' + pathActual;

        // Cargar comentarios guardados previamente
        const guardados = JSON.parse(localStorage.getItem(storageKey)) || [];
        if (guardados.length > 0) {
            lista.innerHTML = '';
            guardados.forEach(c => {
                const div = document.createElement('div');
                div.style.cssText = "margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #222;";
                div.innerHTML = `<strong style="color: #dfc285; font-size: 13px;">${c.nombre}</strong><span style="font-size: 11px; color: #666; margin-left: 10px;">${c.fecha}</span><p style="margin: 5px 0 0 0; font-size: 13px; color: #ddd;">${c.texto}</p>`;
                lista.appendChild(div);
            });
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre-usuario').value.trim();
            const texto = document.getElementById('texto-comentario').value.trim();
            const fecha = new Date().toLocaleDateString();

            if (nombre && texto) {
                const nuevoComentario = { nombre, texto, fecha };
                guardados.push(nuevoComentario);
                localStorage.setItem(storageKey, JSON.stringify(guardados));

                if (lista.querySelector('p')) {
                    lista.innerHTML = '';
                }

                const div = document.createElement('div');
                div.style.cssText = "margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #222;";
                div.innerHTML = `<strong style="color: #dfc285; font-size: 13px;">${nombre}</strong><span style="font-size: 11px; color: #666; margin-left: 10px;">${fecha}</span><p style="margin: 5px 0 0 0; font-size: 13px; color: #ddd;">${texto}</p>`;
                lista.prepend(div);

                form.reset();
            }
        });
    }

    // 2. PUENTE AUTOMÁTICO: Inyección de galeria.js en perfiles
    if (document.getElementById('fotoPrincipal')) {
        const scriptGaleria = document.createElement('script');
        scriptGaleria.src = 'js/galeria.js';
        document.body.appendChild(scriptGaleria);
    }
});
