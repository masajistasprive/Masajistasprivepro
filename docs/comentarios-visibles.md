# Consultar experiencias cuando se necesitan

Antes se iniciaba la suscripción de comentarios aprobados al abrir cualquier perfil, incluso si el visitante no se acercaba a las experiencias. Ahora la sección se registra en el gestor de visibilidad existente:

- Se consulta al entrar en el margen de 300 píxeles de la pantalla.
- Se mantiene en vivo mientras está cerca; conserva 30 segundos de gracia al alejarse para evitar reconectar por desplazamientos breves.
- Se libera al ocultar o abandonar la página y se resincroniza al regresar.
- Cambiar de idioma o recrear el panel conserva los datos y controles actuales.
- Se mantienen consulta por aprobado==true, ordenación, formulario, adjuntos, estrellas y votos de experiencias.
- Una respuesta tardía de una suscripción cerrada no cambia la interfaz.

Los estados de carga, lista vacía y error se distinguen. Además, las URLs de imagen vacías ya no se convierten en la dirección del perfil: las opiniones sin foto no intentan solicitar HTML como imagen.

## Verificación
Pruebas de consulta diferida, filtro de aprobados, actualizaciones, cierre, respuesta tardía, regreso y error. Chromium comprueba sección lejana sin consulta, entrada en pantalla, cambios desde otra pestaña, pausa fuera de vista y resincronización. Mantiene las pruebas de categorías, favoritos, cuatro idiomas, galería y contacto.

## Alcance del ahorro
Evita la consulta inicial de experiencias cuando el visitante no llega a esa sección y las actualizaciones fuera de vista tras el período de gracia. Las reconexiones pueden implicar lecturas nuevas, por lo que el saldo depende de la navegación y la actividad. No se ha medido una reducción de la factura ni se modifican reglas, colecciones, datos comerciales o servicios.
