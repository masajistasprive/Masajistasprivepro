
document.addEventListener('DOMContentLoaded', () => {
    const filtroZona = document.getElementById('filtro-zona');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const tarjetas = document.querySelectorAll('.card');

    function filtrarPerfiles() {
        const zonaSeleccionada = filtroZona.value.toLowerCase();
        const categoriaSeleccionada = filtroCategoria.value.toLowerCase();

        tarjetas.forEach(card => {
            const zonaCard = card.getAttribute('data-zona').toLowerCase();
            const categoriaCard = card.getAttribute('data-categoria').toLowerCase();

            const coincideZona = (zonaSeleccionada === 'todos' || zonaCard === zonaSeleccionada);
            const coincideCategoria = (categoriaSeleccionada === 'todas' || categoriaCard === categoriaSeleccionada);

            if (coincideZona && coincideCategoria) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (filtroZona && filtroCategoria) {
        filtroZona.addEventListener('change', filtrarPerfiles);
        filtroCategoria.addEventListener('change', filtrarPerfiles);
    }
});
/* ========================================================= */
/* MEDIDAS DE DISUASIÓN Y PROTECCIÓN DE CONTENIDO             */
/* ========================================================= */

// 1. Bloquear menú contextual (botón derecho)
document.addEventListener('contextmenu', e => e.preventDefault());

// 2. Bloquear atajos de teclado comunes (F12, Ctrl+U, Ctrl+S, etc.)
document.addEventListener('keydown', e => {
    if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && (e.key === 'U' || e.key === 's' || e.key === 'S'))
    ) {
        e.preventDefault();
    }
});

// 3. Bloquear el arrastre de imágenes (Drag & Drop)
document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
/* ========================================================= */
/* LÓGICA DEL MODAL DE EDAD                                  */
/* ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const modalEdad = document.getElementById('modal-edad');
    const btnMayor = document.getElementById('btn-mayor');

    // Si ya confirmó la edad antes en esta sesión, oculta el modal de entrada
    if (sessionStorage.getItem('edadVerificada') === 'true') {
        if (modalEdad) modalEdad.style.display = 'none';
    }

    if (btnMayor && modalEdad) {
        btnMayor.addEventListener('click', () => {
            sessionStorage.setItem('edadVerificada', 'true');
            modalEdad.style.display = 'none';
        });
    }
});
