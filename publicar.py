import datetime
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
DEST = ROOT / 'cuaderno' / 'articulos'
KEY = os.getenv('GEMINI_API_KEY', '').strip()

if not KEY:
    sys.exit('Falta GEMINI_API_KEY en GitHub Secrets. No se publica contenido de relleno.')

HOY = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).date().isoformat()
ARCHIVO = DEST / f'{HOY}.json'
if ARCHIVO.exists():
    print('Ya existe un artículo para hoy:', HOY)
    sys.exit(0)

TOPICS = [
    'masajes relajantes y descanso',
    'masaje sensitivo y percepción de los sentidos',
    'aromaterapia y ambientes de spa',
    'discreción, consentimiento y trato respetuoso',
    'rituales de relax después del trabajo',
    'música, luz y atmósfera de bienestar',
    'masajes descontracturantes y sus límites',
    'experiencias sensoriales elegantes',
    'autocuidado masculino y relajación',
    'higiene y etiqueta en un gabinete de masajes',
]
TEMA = TOPICS[datetime.date.fromisoformat(HOY).toordinal() % len(TOPICS)]
PROMPT = (
    f'Escribí para Cuaderno Privé, revista argentina premium para adultos, '
    f'un artículo ORIGINAL sobre {TEMA}. Español rioplatense cuidado, elegante, '
    'no explícito, sin prometer servicios sexuales, sin testimonios inventados '
    'ni consejos médicos. Entre 450 y 650 palabras, informativo y útil. '
    'Sin links inventados. Respondé SOLO JSON válido con las claves titulo '
    '(máximo 85 caracteres), bajada (máximo 200), categoria, contenido '
    '(texto plano con párrafos separados por dos saltos de línea). '
    'No uses Markdown ni HTML.'
)

API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
PAYLOAD = {
    'contents': [{'parts': [{'text': PROMPT}]}],
    'generationConfig': {'responseMimeType': 'application/json', 'temperature': 0.8},
}


def consultar(url, payload=None):
    headers = {'x-goog-api-key': KEY}
    if payload is not None:
        headers['Content-Type'] = 'application/json'
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8') if payload is not None else None,
        headers=headers,
        method='POST' if payload is not None else 'GET',
    )
    with urllib.request.urlopen(request, timeout=100) as response:
        return json.load(response)


def detalle_error(exc):
    """Muestra solo el mensaje de error, nunca URL, cabeceras ni credenciales."""
    try:
        respuesta = json.loads(exc.read(8192).decode('utf-8', errors='replace'))
        error = respuesta.get('error', {})
        mensaje = error.get('message', '')
        estado = error.get('status', '')
        if not isinstance(mensaje, str):
            mensaje = ''
        if not isinstance(estado, str):
            estado = ''
        # Protección adicional: eliminar la clave si el proveedor la incluyera.
        mensaje = mensaje.replace(KEY, '[CLAVE OCULTA]')
        mensaje = mensaje.replace('\n', ' ').replace('\r', ' ')[:450]
        return f'{estado}: {mensaje}' if mensaje else (estado or 'Sin detalle de Google')
    except (ValueError, UnicodeError, TypeError, AttributeError):
        return 'Google no devolvió un detalle JSON legible'


def modelos_disponibles():
    encontrados = []
    siguiente = None
    while True:
        url = API_BASE + '/models?pageSize=100'
        if siguiente:
            from urllib.parse import quote
            url += '&pageToken=' + quote(siguiente, safe='')
        respuesta = consultar(url)
        for modelo in respuesta.get('models', []):
            nombre = modelo.get('name', '')
            metodos = modelo.get('supportedGenerationMethods', [])
            if nombre.startswith('models/') and 'generateContent' in metodos:
                encontrados.append(nombre)
        siguiente = respuesta.get('nextPageToken')
        if not siguiente:
            return encontrados


try:
    disponibles = modelos_disponibles()
except urllib.error.HTTPError as exc:
    sys.exit(f'No se pudo consultar la lista de modelos de Gemini: HTTP {exc.code}. {detalle_error(exc)}. No se publicó.')
except (urllib.error.URLError, TimeoutError, ValueError, TypeError) as exc:
    sys.exit(f'No se pudo consultar la lista de modelos ({type(exc).__name__}). No se publicó.')

# Priorizar los modelos que Google recomienda explícitamente para esta clave.
preferidos = (
    'models/gemini-3.8-flash',
    'models/gemini-3.5-flash-lite',
    'models/gemini-3-flash-preview',
    'models/gemini-flash-latest',
)
ordenados = [m for m in preferidos if m in disponibles]
ordenados += [
    m for m in disponibles
    if m not in ordenados
    and 'flash' in m.lower()
    and 'tts' not in m.lower()
    and 'audio' not in m.lower()
    and 'live' not in m.lower()
    and 'image' not in m.lower()
    and '2.5-flash' not in m.lower()
]
if not ordenados:
    sys.exit('No hay modelos Flash de texto disponibles para esta clave. No se publicó.')

article = None
for modelo in ordenados:
    print('Probando modelo:', modelo)
    try:
        data = consultar(f'{API_BASE}/{modelo}:generateContent', PAYLOAD)
        partes = data['candidates'][0]['content']['parts']
        texto = ''.join(p.get('text', '') for p in partes)
        article = json.loads(texto)
        break
    except urllib.error.HTTPError as exc:
        print(f'El modelo {modelo} devolvió HTTP {exc.code}: {detalle_error(exc)}')
        if exc.code in (404, 400):
            continue
        sys.exit(f'Gemini devolvió HTTP {exc.code}. No se publicó.')
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError, IndexError, TypeError) as exc:
        sys.exit(f'Falló la generación o el formato de respuesta ({type(exc).__name__}). No se publicó.')

if article is None:
    sys.exit('Ninguno de los modelos disponibles pudo generar el artículo. No se publicó.')

if not isinstance(article, dict):
    sys.exit('La respuesta no es un objeto JSON. No se publicó.')

CAMPOS = ('titulo', 'bajada', 'categoria', 'contenido')
for field in CAMPOS:
    if not isinstance(article.get(field), str) or not article[field].strip():
        sys.exit(f'Falta el campo {field}. No se publicó.')

article = {field: article[field].strip() for field in CAMPOS}
if len(article['titulo']) > 85 or len(article['bajada']) > 200:
    sys.exit('El título o la bajada superan el límite. No se publicó.')
if len(article['contenido'].split()) < 300:
    sys.exit('El artículo es demasiado corto. No se publicó.')

article['fecha'] = HOY
DEST.mkdir(parents=True, exist_ok=True)
ARCHIVO.write_text(json.dumps(article, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

items = []
for path in sorted(DEST.glob('????-??-??.json'), reverse=True)[:90]:
    try:
        entry = json.loads(path.read_text(encoding='utf-8'))
        items.append({key: entry[key] for key in ('fecha', 'titulo', 'bajada', 'categoria')})
    except (ValueError, KeyError, TypeError):
        continue

(ROOT / 'cuaderno' / 'indice.json').write_text(
    json.dumps(items, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
)
print('Publicado:', HOY, article['titulo'])
