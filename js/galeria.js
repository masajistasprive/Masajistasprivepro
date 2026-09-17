/* ========================================================= */
/* SCRIPT CENTRALIZADO DE SLIDER Y TÁCTIL PARA GALERÍAS      */
/* ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const fotoPrincipal = document.getElementById('fotoPrincipal');
    
    // Si no estamos en una página de perfil, frena acá
    if (!fotoPrincipal) return;

    // 1. Recolectar automáticamente todas las miniaturas de la página
    const miniaturasImgs = document.querySelectorAll('.galeria-miniaturas img');
    if (miniaturasImgs.length === 0) return;

    let galeriaImgs = [];
    miniaturasImgs.forEach((img, index) => {
        galeriaImgs.push(img.src);
        img.onclick = function() {
            indiceActual = index;
            actualizarFotoPrincipal();
        };
    });

    let indiceActual = 0;

    // Detectar qué foto está activa al cargar la página
    const srcActual = fotoPrincipal.getAttribute('src');
    const indexEncontrado = galeriaImgs.indexOf(srcActual);
    if (indexEncontrado !== -1) {
        indiceActual = indexEncontrado;
    }

    function actualizarFotoPrincipal() {
        fotoPrincipal.style.opacity = '0.4';
        setTimeout(() => {
            fotoPrincipal.src = galeriaImgs[indiceActual];
            fotoPrincipal.style.opacity = '1';
        }, 150);
    }

    function cambiarFotoSlider(direccion) {
        indiceActual += direccion;
        if (indiceActual < 0) {
            indiceActual = galeriaImgs.length - 1;
        } else if (indiceActual >= galeriaImgs.length) {
            indiceActual = 0;
        }
        actualizarFotoPrincipal();
    }

    // 2. Inyectar automáticamente las flechas a los costados de la foto
    const contenedorPadre = fotoPrincipal.parentElement;
    contenedorPadre.style.position = 'relative';
    
    const btnPrev = document.createElement('button');
    btnPrev.className = 'slider-btn prev-btn';
    btnPrev.innerHTML = '&#10094;';
    btnPrev.onclick = () => cambiarFotoSlider(-1);

    const btnNext = document.createElement('button');
    btnNext.className = 'slider-btn next-btn';
    btnNext.innerHTML = '&#10095;';
    btnNext.onclick = () => cambiarFotoSlider(1);

    contenedorPadre.appendChild(btnPrev);
    contenedorPadre.appendChild(btnNext);

    // 3. Activar soporte táctil (Swipe) para deslizar con el dedo en celulares
    let touchStartX = 0;
    let touchEndX = 0;

    fotoPrincipal.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    fotoPrincipal.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 40) {
            cambiarFotoSlider(1);  // Deslizar izquierda -> Siguiente
        }
        if (touchEndX > touchStartX + 40) {
            cambiarFotoSlider(-1); // Deslizar derecha -> Anterior
        }
    }, {passive: true});
});

