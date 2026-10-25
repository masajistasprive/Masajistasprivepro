# Revisión del PR 15

## Correcciones de la revisión
- La lectura única de votos dejaba de reflejar cambios de otras pestañas mientras el corazón seguía visible. Una prueba funcional reprodujo el fallo. Se conserva la suscripción visible original y su liberación al ocultar la página.
- Se mantienen las mejoras de pintura focalizada, la reducción de escaneos por mutaciones ajenas a los controles y la prioridad baja de las miniaturas.
- El endpoint real de Firestore devolvió FAILED_PRECONDITION para el índice de Club. Se conserva la consulta compatible anterior y se añade únicamente la caché de sesión de dos minutos. No se cambian índices, reglas ni datos.
- Se versiona el archivo de votos para evitar usar una copia anterior del navegador.

## Validación
- Pruebas estáticas de sintaxis.
- Pruebas funcionales de votos para portada y perfil: cambios desde otra pestaña, votar, retirar voto, liberar suscripción y resincronizar al regresar.
- Pruebas existentes de categorías, favoritos, idiomas, contacto en cuatro idiomas, perfiles pausados y páginas para compartir.
- El workflow incluye pruebas con Chromium real a 1440 y 390 píxeles, Firebase simulado y sin escrituras de producción: categorías, favoritos, votos entre dos pestañas, recarga, galería, WhatsApp, caché de Club y errores JavaScript.

## Publicación
El portal público se sirve desde GitHub Pages. El panel se publica por separado en Firebase Hosting, proyecto masajistasprivepro, sitio prive-control-center. Este PR modifica el portal y no requiere republicar el panel.

## Límites
La emulación móvil no sustituye una prueba en un teléfono físico. No se atribuye un ahorro económico medido: no se compararon lecturas facturables con tráfico equivalente. No se alteran anuncios, abonos, caja, perfiles ni servicios pagos.
