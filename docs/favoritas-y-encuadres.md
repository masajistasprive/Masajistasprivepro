# Favoritas sin reconstruir el catálogo

Guardar una favorita antes invocaba renderizarPerfiles, que sustituía todas las tarjetas y vitrinas. Ahora se actualiza el estado de los botones y se agrega, quita u ordena únicamente la lista de favoritas. Mantiene las tarjetas y fotos del catálogo, filtros, búsqueda, etiquetas accesibles y foco. Los cambios de favoritas de otra pestaña y la limpieza de localStorage se sincronizan; al regresar se conserva el catálogo existente. Las actualizaciones de datos y los cambios de idioma siguen usando el renderizado completo para mostrar el contenido actualizado.

El observador de encuadres antes recorría las imágenes ante cualquier cambio del DOM, incluidos textos de contadores. Ahora detecta cambios de imágenes y contenedores relevantes. Conserva el cambio de src, la recuperación del original, la limpieza de imágenes retiradas, la reinserción y los eventos de filtros, categorías y tamaño.

## Evidencia reproducible
- La prueba de referencia mostraba que guardar una favorita desconectaba las tarjetas y fotos anteriores; ahora permanecen conectadas.
- En 100 cambios de texto separados por cuadros, el observador anterior ejecutaba 100 recorridos adicionales de imágenes. El nuevo ejecuta cero; conserva el recorrido inicial y los disparados por cambios relevantes.
- Pruebas de quitar la última favorita, estado vacío, sincronización de almacenamiento y conservación del catálogo.
- Chromium verifica filtros y búsqueda, misma identidad de tarjetas y fotos al guardar, favoritas entre pestañas, foco al quitar con teclado y las funciones previas de votos, experiencias, galería e idiomas en escritorio y móvil emulado.

Estos resultados miden trabajo de interfaz, no una mejora porcentual del tiempo total ni un ahorro facturado. No cambian fotos, diseño, consultas o datos de Firebase.
