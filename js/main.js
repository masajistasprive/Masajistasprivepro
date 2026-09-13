document.addEventListener('DOMContentLoaded', () => {
    // 1. Generar automáticamente los Globos de Categorías arriba de todo
    const containerGlobos = document.getElementById('globosCategorias');
    if (containerGlobos) {
        const categoriasData = [
            { nombre: 'Terapéuticos', img: 'img/terapeuticos.jpg', catValor: 'terapeuticos' },
            { nombre: 'Sensuales', img: 'img/sensuales.jpg', catValor: 'sensuales' },
            { nombre: 'Masculinos', img: 'img/masculinos.jpg', catValor: 'masculinos' },
            { nombre: 'Fantasías', img: 'img/fantasias.jpg', catValor: 'fantasias' }
        ];

        let htmlGlobos = '';
        categoriasData.forEach(cat => {
            htmlGlobos += `
                <div class="globo-item" onclick="window.filtrarPorGlobo('${cat.catValor}')">
                    <div class="globo-ring">
                        <img src="${cat.img}" alt="${cat.nombre}" onerror="this.src='img/logo.png'">
                    </div>
                    <span>${cat.nombre}</span>
                </div>
            `;
        });
        containerGlobos.innerHTML = htmlGlobos;
    }

    // 2. Lógica de filtrado por zonas y categorías
    const filtroZona = document.getElementById('filtro-zona');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const tarjetas = document.querySelectorAll('.card');

    function filtrarPerfiles() {
        const zonaSeleccionada = filtroZona ? filtroZona.value.toLowerCase() : 'todos';
        const categoriaSeleccionada = filtroCategoria ? filtroCategoria.value.toLowerCase() : 'todas';

        tarjetas.forEach(card => {
            const zonaCard = (card.getAttribute('data-zona') || '').toLowerCase();
            const categoriaCard = (card.getAttribute('data-categoria') || '').toLowerCase();

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

    // Función global para que al hacer clic en un globo se active el filtro de categoría automáticamente
    window.filtrarPorGlobo = function(categoriaVal) {
        if (filtroCategoria) {
            filtroCategoria.value = categoriaVal;
            filtrarPerfiles();
            // Desplazamiento suave hacia la grilla de perfiles
            filtroCategoria.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
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
