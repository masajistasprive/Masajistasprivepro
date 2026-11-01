# Landing y contactos — 1 de noviembre de 2026

La revisión semanal mostró más tráfico al final de la semana, sin un aumento proporcional de los eventos de contacto. Es una señal para mejorar y medir el recorrido; no demuestra una falla concreta de la landing ni una causa atribuible al cambio de portada.

## Cambios

- Landing más breve: se conserva «Entrar al sitio», con la confirmación de mayoría de edad explícita en el mismo acceso. Se reduce el espacio superior en pantallas bajas. Se mantienen logo, colores, redes y destino.
- Un emisor compartido de `whatsapp_click` incorpora ID, nombre, categoría y ubicación (portada, principal o flotante). Sustituye al evento previo en los botones, no agrega otro. Se conserva el fallback y el registro privado existente, con sus reglas de deduplicación.
- Nuevos pasos `prive_<origen>_catalogo_listo` y `prive_<origen>_catalogo_error`: distinguen la llegada al portal de un catálogo que efectivamente terminó de renderizar. Se registran como máximo una vez por recorrido de 30 minutos; un error seguido de recuperación puede tener ambos pasos.
- Versionado de módulos en todas las entradas y actualización de las fichas estáticas sin cambiar sus fotos, metadatos ni datos comerciales.

## Validación y límites

Pruebas de Analytics, recorrido landing→portal, conservación de campañas, no repetición del aviso de edad con almacenamiento disponible, navegación con almacenamiento bloqueado, un evento GA y un registro privado por clic de perfil, y deduplicación de los pasos del catálogo. Se ejecutaron además las pruebas existentes de votos, experiencias, encuadres y enlaces para compartir. La revisión visual local usa una copia sin Analytics ni Firebase; el workflow de PR ejecuta las pruebas de navegador existentes con Firebase simulado.

Los parámetros personalizados enviados a GA4 requieren sus dimensiones correspondientes para desglosarlos en los informes habituales. Esta modificación no las registra en la propiedad de Analytics y no reconstruye datos históricos. No se equiparan clics con mensajes ni turnos. Las métricas privadas no se igualan a GA4: conservan su criterio propio.

## Publicidad

Lectura de Windsor.ai: la campaña «Prive | CABA | Prueba consultas | Octubre 2026» tiene inicio 15/10/2026 y fin 29/10/2026; devuelve `ENABLED`, `ENDED`, `CAMPAIGN_ENDED`, presupuesto informado de $2.500. No se modificaron campañas ni presupuestos.

## Publicación

Cambios preparados en una rama de revisión; no se modifica producción desde esta rama. Antes de evaluar resultados, registrar la fecha efectiva de publicación y comparar períodos completos con presupuesto y origen de tráfico identificados. Una variación posterior no demuestra por sí sola causalidad.
