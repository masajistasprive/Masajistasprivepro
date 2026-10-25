# Miniaturas de Destacadas y Nuevas

Las vitrinas pequeñas usaban los mismos archivos grandes que los perfiles. Ahora usan WebP derivados alojados en GitHub Pages. Los perfiles, galerías, tarjetas del catálogo, fotos originales y datos de Firebase conservan sus archivos anteriores.

## Generación y actualización
- scripts/miniaturas.mjs procesa las portadas públicas activas y genera variantes de al menos 512 píxeles por lado cuando el original lo permite, conservando proporción, orientación y contenido completo. No amplía imágenes pequeñas.
- Mantiene los fragmentos de encuadre y zoom; las pruebas comparan la geometría entre original y miniatura.
- Solo incluye versiones más livianas que el original. Si falta una miniatura, el navegador recupera el original antes de usar el monograma de error.
- El workflow existente de portadas reutiliza la misma lectura de perfiles para actualizar las miniaturas. No añade otra consulta de Firestore ni otra programación horaria.
- Los archivos usan nombres derivados del origen, contenido local y receta. Las versiones anteriores se conservan para los navegadores que aún tengan una página en caché.
- Las imágenes remotas se reutilizan sin descargarlas si la URL versionada y su variante no cambiaron. Las fotos locales se verifican por contenido para detectar reemplazos bajo el mismo nombre.

## Resultado del conjunto inicial
15 imágenes derivadas, sin fallos: originales 1.757.381 bytes; miniaturas 572.598 bytes. Reducción de 67,4% en estos archivos. Esto no equivale al ahorro total de una visita ni a una reducción de la factura de Firebase.

## Verificación
Pruebas de tamaños, proporción, encuadre, conservación del original, caché, cambio de foto local, fallo remoto y rutas permitidas. Chromium prueba miniatura válida, recuperación ante miniatura ausente, original en galería y las funciones existentes en escritorio y móvil emulado.

Las únicas fuentes remotas que procesa el generador son URLs HTTPS de imágenes subidas a Cloudinary; rechaza credenciales, puertos alternativos, redirecciones y otras fuentes. Las imágenes propias se leen dentro de img. Hay límites de descarga y de píxeles decodificados. Las fuentes no admitidas mantienen su entrega original.
