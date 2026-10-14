#!/usr/bin/env python3
"""Publicación diaria de Cuaderno Privé desde GitHub Actions.

Requiere GEMINI_API_KEY en los secrets del repositorio.
No habilita facturación ni genera artículos de relleno.
"""
import datetime
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
if ROOT.name == 'scripts':
    ROOT = ROOT.parent
DEST = ROOT / 'cuaderno' / 'articulos'
KEY = os.environ.get('GEMINI_API_KEY', '').strip()
API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
TODAY = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).date()
DATE = TODAY.isoformat()
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
PREFERRED = [
    'gemini-3.1-flash-lite',
    'gemini-3-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-2-flash-lite',
    'gemini-2-flash',
]


def api(method, endpoint, payload=None, timeout=70):
    url = API_BASE + endpoint
    data = None if payload is None else json.dumps(payload).encode('utf-8')
    request = urllib.request.Request(
        url,
        data=data,
        headers={'x-goog-api-key': KEY, 'Content-Type': 'application/json'},
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read(1200).decode('utf-8', errors='replace')
        try:
            detail = json.loads(detail).get('error', {}).get('message', detail)
        except ValueError:
            pass
        raise RuntimeError(f'HTTP {exc.code}: {detail[:400]}') from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RuntimeError(f'Error de conexión: {exc}') from exc


def available_models():
    models = []
    page_token = ''
    for _ in range(10):
        query = '?pageSize=100'
        if page_token:
            query += '&pageToken=' + urllib.parse.quote(page_token, safe='')
        response = api('GET', '/models' + query, timeout=30)
        for item in response.get('models', []):
            if 'generateContent' in item.get('supportedGenerationMethods', []):
                models.append(item['name'].removeprefix('models/'))
        page_token = response.get('nextPageToken', '')
        if not page_token:
            break
    return models


def extract_article(response):
    candidates = response.get('candidates') or []
    if not candidates:
        raise ValueError('Gemini no devolvió candidatos de texto.')
    parts = candidates[0].get('content', {}).get('parts', [])
    text = ''.join(part.get('text', '') for part in parts).strip()
    if text.startswith('```'):
        text = re.sub(r'^```(?:json)?\s*|\s*```$', '', text).strip()
    article = json.loads(text)
    if not isinstance(article, dict):
        raise ValueError('La respuesta no es un objeto JSON.')
    for field in ('titulo', 'bajada', 'categoria', 'contenido'):
        if not isinstance(article.get(field), str) or not article[field].strip():
            raise ValueError(f'Falta el campo {field}.')
    if len(article['titulo']) > 85 or len(article['bajada']) > 200:
        raise ValueError('Título o bajada exceden la longitud permitida.')
    word_count = len(article['contenido'].split())
    if not 300 <= word_count <= 750:
        raise ValueError(f'Extensión inválida: {word_count} palabras.')
    cleaned = {key: article[key].strip() for key in ('titulo', 'bajada', 'categoria', 'contenido')}
    cleaned['fecha'] = DATE
    return cleaned


def main():
    if not KEY:
        sys.exit('Falta GEMINI_API_KEY en GitHub Secrets. No se publica contenido de relleno.')
    if (DEST / f'{DATE}.json').exists():
        print(f'Ya existe un artículo del {DATE}; no se duplica.')
        return
    topic = TOPICS[TODAY.toordinal() % len(TOPICS)]
    prompt = (
        'Escribí para Cuaderno Privé, revista argentina premium para adultos, '
        f'un artículo ORIGINAL sobre {topic}. Español rioplatense cuidado, elegante, '
        'no explícito, sin prometer servicios sexuales, sin testimonios inventados '
        'ni consejos médicos. Entre 450 y 650 palabras, informativo y útil. '
        'Sin enlaces inventados. Respondé SOLO JSON válido con las claves titulo '
        '(máximo 85 caracteres), bajada (máximo 200), categoria y contenido '
        '(texto plano con párrafos separados por dos saltos de línea). '
        'No uses Markdown ni HTML.'
    )
    try:
        available = available_models()
    except RuntimeError as exc:
        sys.exit(f'No se pudo consultar la lista real de modelos: {exc}')
    candidates = [name for name in PREFERRED if name in available]
    if not candidates:
        # No se elige un modelo desconocido sin confirmar que admite generateContent.
        print('Modelos que admiten generateContent:', ', '.join(available) or '(ninguno)')
        sys.exit('No hay modelos de texto preferidos disponibles para esta clave.')
    print('Modelos disponibles para probar:', ', '.join(candidates), flush=True)
    article = None
    for model in candidates:
        print(f'Probando modelo: {model}', flush=True)
        payload = {
            'contents': [{'parts': [{'text': prompt}]}],
            'generationConfig': {'responseMimeType': 'application/json', 'temperature': 0.7},
        }
        try:
            response = api('POST', f'/models/{model}:generateContent', payload)
            article = extract_article(response)
            print(f'Generación válida con {model}', flush=True)
            break
        except (RuntimeError, ValueError, KeyError, json.JSONDecodeError) as exc:
            message = str(exc)
            print(f'No se pudo generar con {model}: {message[:500]}', flush=True)
            # Errores de autorización/cuota no se arreglan rotando modelos.
            if re.search(r'HTTP (401|403)', message):
                sys.exit('Revisá los permisos de GEMINI_API_KEY; se detuvo sin publicar.')
            if 'HTTP 429' in message:
                print('Límite de solicitudes alcanzado; se prueba otra opción disponible.', flush=True)
            if 'HTTP 503' in message:
                time.sleep(2)
    if article is None:
        sys.exit('Ningún modelo devolvió un artículo válido. No se publicó nada.')
    DEST.mkdir(parents=True, exist_ok=True)
    target = DEST / f'{DATE}.json'
    target.write_text(json.dumps(article, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    items = []
    for file in sorted(DEST.glob('????-??-??.json'), reverse=True)[:90]:
        try:
            entry = json.loads(file.read_text(encoding='utf-8'))
            items.append({key: entry[key] for key in ('fecha', 'titulo', 'bajada', 'categoria')})
        except (ValueError, KeyError, TypeError):
            print(f'Se omitió del índice: {file.name}', flush=True)
    (ROOT / 'cuaderno' / 'indice.json').write_text(
        json.dumps(items, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
    )
    print(f'Publicado {DATE}: {article["titulo"]}')


if __name__ == '__main__':
    main()
