# Rendimiento: recorridos de votos

## Diagnóstico
En la lectura de diagnóstico, la colección pública devolvió 17 fichas: 196.751 bytes JSON, sin imágenes data:image incrustadas. El documento de Prada devolvió 14.067 bytes, también sin imágenes incrustadas. Estas son cargas de API observadas, no promedios de usuarios ni importes facturados.

El gestor de controles hacía un querySelectorAll por registro y comparaba cada resultado contra su ID. Se agrupan los registros por atributo y se resuelve cada control mediante un Map. Se conservan las suscripciones visibles, los duplicados de Favoritas, la limpieza de nodos y los votos de experiencias.

## Comparación reproducible
Mismo banco de pruebas con el archivo real, 100 perfiles y 100 experiencias, 500 controles:

| Operación | Antes | Después |
|---|---:|---:|
| Recorridos del DOM | 200 | 2 |
| Lecturas de atributos para encontrar IDs | 50.000 | 500 |
| Controles pintados | 500 | 500 |
| Suscripciones | 200 | 200 |

Esto reduce el trabajo de búsqueda en ese escenario. No demuestra una aceleración del 99% del sitio ni reducción de lecturas facturadas.

## Validación
Pruebas de sincronización entre pestañas, recreación de tarjetas, apertura/cierre, cuatro idiomas, galería, contacto y visibilidad. El workflow de carga pública recoge datos de Chromium en escritorio y móvil emulado, bloqueando Analytics y los módulos de registro de visitas.

## Límites de costos
No hay conexión disponible a las métricas de facturación de Firestore. GA4 mide tráfico y no proporciona lecturas facturables de Firebase. Este cambio no modifica reglas, consultas ni registros comerciales.

## Primera medición pública (antes de esta publicación)
Chromium en GitHub Actions, una carga por caso y ventana de observación de ocho segundos tras cargar la ficha; móvil emulado, sin limitar CPU ni red. Analytics y registros propios bloqueados. Los bytes contabilizan transferencias terminadas; los canales abiertos de Firestore no forman una medición de facturación.

| Vista | Transferencias terminadas | Primer contenido pintado | Último LCP observado | Errores JS |
|---|---:|---:|---:|---:|
| Portada escritorio | 1.801.701 B | 1.104 ms | 1.284 ms | 0 |
| Perfil escritorio | 810.034 B | 456 ms | 1.068 ms | 0 |
| Portada móvil emulado | 1.756.645 B | 312 ms | 344 ms | 0 |
| Perfil móvil emulado | 808.438 B | 280 ms | 968 ms | 0 |

No son tiempos de un teléfono físico ni una muestra representativa de visitantes. La diferencia entre casos incluye calentamiento de red y caché; no debe presentarse como una comparación causal.

Se detectaron fotos del catálogo con carga eager aun con la categoría cerrada. Ahora sus imágenes usan carga lazy y prioridad automática; conservan el mismo src, dimensiones, encuadres y calidad. La prueba de navegador comprueba que una foto exclusiva del catálogo no se pide al inicio y se descarga al abrir la categoría. Destacadas y Nuevas conservan sus fotos visibles.

Medición inicial: https://github.com/masajistasprive/Masajistasprivepro/actions/runs/40155311541
