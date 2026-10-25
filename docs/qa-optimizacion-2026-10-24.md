# Validación técnica — optimización Privé (24/10/2026)

## Resultado de comprobaciones estáticas
- 13/13 verificaciones aprobadas, ejecutadas sobre la rama de optimización.
- JavaScript embebido de `index.html` y `perfil.html`: sintaxis válida.
- `js/votos-visibles.js`: sintaxis válida.
- Verificados por inspección: protección de voto en curso, caché de 60 segundos, revalidación del voto contra servidor, fallback de Club e IntersectionObserver.

## Límites de estas pruebas
Estas verificaciones **no** prueban funcionamiento real, tiempos de carga, lecturas facturables ni ahorro. No se ejecutó el sitio contra Firestore, ni se instalaron índices, ni se probaron votos de usuarios reales.

## Pruebas obligatorias antes de publicar
1. Abrir portada y ficha en Android y escritorio; comprobar que no hay errores en consola.
2. Votar, retirar voto y recargar. Confirmar contador y estado del corazón.
3. Abrir dos pestañas con la misma sesión y probar votos alternados; verificar estado final.
4. Recorrer tarjetas y regresar tras 60 segundos; verificar resincronización.
5. Comprobar que el Club muestra las 3 publicaciones más recientes y que su índice existe antes de habilitar la consulta optimizada.
6. Verificar galería, ampliación de imágenes, favoritos, WhatsApp y traducciones.
7. Medir lecturas de Firestore antes/después con tráfico comparable y revisar límites.
8. Confirmar reglas de lectura pública antes de cualquier migración de `modelos_prive`.

## Riesgos conocidos
- La caché de 60 segundos puede mostrar recuentos temporalmente desactualizados.
- La consulta puntual todavía descarga documentos de votos: no equivale a un contador agregado.
- El fallback de Club puede consultar hasta 100 documentos hasta que se despliegue el índice.
- No fusionar ni desplegar hasta completar pruebas funcionales y validar el índice.
