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
