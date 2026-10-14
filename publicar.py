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

URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
PAYLOAD = {
    'contents': [{'parts': [{'text': PROMPT}]}],
    'generationConfig': {'responseMimeType': 'application/json', 'temperature': 0.8},
}
REQUEST = urllib.request.Request(
    URL,
    data=json.dumps(PAYLOAD).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'x-goog-api-key': KEY},
    method='POST',
)

try:
    with urllib.request.urlopen(REQUEST, timeout=100) as response:
        data = json.load(response)
    text = data['candidates'][0]['content']['parts'][0]['text']
    article = json.loads(text)
except urllib.error.HTTPError as exc:
    # No mostrar el cuerpo de respuesta ni credenciales en registros públicos.
    sys.exit(f'Gemini devolvió HTTP {exc.code}. No se publicó el artículo.')
except (urllib.error.URLError, TimeoutError, ValueError, KeyError, IndexError, TypeError) as exc:
    sys.exit(f'Falló la generación o el formato de respuesta ({type(exc).__name__}). No se publicó.')

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
