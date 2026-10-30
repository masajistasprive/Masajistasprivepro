# Prueba de index abierto — 30/10/2026

Las categorías Terapéuticas, Sensuales y Fantasías se muestran desde el inicio, debajo de destacadas y nuevas. Los accesos superiores mantienen los mismos botones y atributos de categoría, pero desplazan al bloque sin ocultar los demás. Búsqueda, barrio, modalidad, favoritos y cambio de vista se conservan. Inicio/Explorar vuelven al catálogo completo.

Las fotos siguen con loading=lazy. Se conserva el orden aleatorio existente y la selección de anunciantes; no se escriben fichas ni se cambian categorías.

## Medición

Sin cambios en metricas-prive.js, visitas-portada.js, analytics-prive.js, recorrido-prive.js ni perfil.html. Se conservan los atributos, los IDs y los manejadores de WhatsApp, así como los eventos históricos de categoría. Un solo resultado por anunciante aunque figure en más de una categoría. No se generan eventos de clic al abrir el catálogo automáticamente.

## Validación y vuelta atrás

Pruebas de navegación con Firebase simulado a 320, 390, 768 y 1440 px. Pruebas de favoritos, idiomas, eventos de contacto, deduplicación, votos y Analytics. Punto previo: 57fc6bb20bfb86ba75603212c571c787e8f5a39a, rama respaldo/antes-index-abierto-20261030. Revertir solo esta reforma conserva los encuadres independientes y otros cambios previos.

Prueba solicitada durante esta semana; no hay reversión automática programada.
