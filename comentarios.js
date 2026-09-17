/* ========================================================= */
/* SCRIPT CENTRALIZADO DE COMENTARIOS PARA PERFILES          */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    // Verificamos si estamos en una página de perfil (si existe la foto principal)
    if (!document.getElementById('fotoPrincipal')) return;
    
    // Verificamos si ya existe la sección de comentarios para no duplicarla
    if (document.getElementById('seccion-comentarios')) return;

    const seccionComentarios = document.createElement('div');
    seccionComentarios.id = 'seccion-comentarios';
    seccionComentarios.style.cssText = "max-width: 650px; margin: 30px auto; padding: 25px; background: rgba(22, 22, 24, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(223, 194, 133, 0.25); border-radius: 12px; color: #fff; font-family: 'Montserrat', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.6);";
    
    seccionComentarios.innerHTML = `
        <h3 style="color: #dfc285; font-family: 'Cormorant Garamond', serif; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid rgba(223, 194, 133, 0.2); padding-bottom: 8px; letter-spacing: 1.5px;">Opiniones y Comentarios</h3>
        <div id="lista-comentarios" style="margin-bottom: 20px; font-size: 13.5px; color: #ded9d0;">
            <p style="font-style: italic; color: #888;">Sé el primero en dejar un comentario sobre este perfil.</p>
        </div>
        <form id="form-comentario" style="display: flex; flex-direction: column; gap: 12px;">
            <input type="text" id="nombre-usuario" placeholder="Tu nombre o apodo" required style="padding: 12px; background: #141416; border: 1px solid rgba(223, 194, 133, 0.3); color: #fff; border-radius: 6px; font-size: 13.5px; font-family: 'Montserrat', sans-serif;">
            <textarea id="texto-comentario" placeholder="Escribe tu comentario con respeto..." rows="3" required style="padding: 12px; background: #141416; border: 1px solid rgba(223, 194, 133, 0.3); color: #fff; border-radius: 6px; font-size: 13.5px; font-family: 'Montserrat', sans-serif; resize: vertical;"></textarea>
            <button type="submit" style="background: linear-gradient(135deg, #f5ebd0 0%, #dfc285 50%, #b8934f 100%); color: #0d0d0d; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; align-self: flex-end; transition: opacity 0.3s;">Publicar comentario</button>
        </form>
    `;
    
    // Lo insertamos justo antes del footer
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
            div.style.cssText = "margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed rgba(255,255,255,0.1);";
            div.innerHTML = `<strong style="color: #dfc285; font-size: 13px;">${c.nombre}</strong><span style="font-size: 11px; color: #777; margin-left: 10px;">${c.fecha}</span><p style="margin: 5px 0 0 0; font-size: 13.5px; color: #ded9d0; font-weight: 300;">${c.texto}</p>`;
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
            div.style.cssText = "margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed rgba(255,255,255,0.1);";
            div.innerHTML = `<strong style="color: #dfc285; font-size: 13px;">${nombre}</strong><span style="font-size: 11px; color: #777; margin-left: 10px;">${fecha}</span><p style="margin: 5px 0 0 0; font-size: 13.5px; color: #ded9d0; font-weight: 300;">${texto}</p>`;
            lista.prepend(div);

            form.reset();
        }
    });
});
