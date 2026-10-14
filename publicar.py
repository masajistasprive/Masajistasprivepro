import os,json,datetime,urllib.request,re,html,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]; DEST=ROOT/'cuaderno'/'articulos'; DEST.mkdir(parents=True,exist_ok=True)
KEY=os.getenv('GEMINI_API_KEY','').strip()
if not KEY: sys.exit('Falta GEMINI_API_KEY. No se publica contenido inventado ni de relleno.')
HOY=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).date().isoformat()
if (DEST/f'{HOY}.json').exists():sys.exit('Ya existe articulo para hoy.')
TOPICS=['masajes relajantes y descanso','masaje sensitivo y percepción de los sentidos','aromaterapia y ambientes de spa','discreción, consentimiento y trato respetuoso','rituales de relax después del trabajo','música, luz y atmósfera de bienestar','masajes descontracturantes y sus límites','experiencias sensoriales elegantes','autocuidado masculino y relajación','higiene y etiqueta en un gabinete de masajes']
tema=TOPICS[datetime.date.fromisoformat(HOY).toordinal()%len(TOPICS)]
prompt=f'''Escribí para Cuaderno Privé, revista argentina premium para adultos, un artículo ORIGINAL sobre {tema}. Español rioplatense cuidado, elegante, no explícito, sin prometer servicios sexuales, sin testimonios inventados ni consejos médicos. Entre 450 y 650 palabras, informativo y útil. Sin links inventados. Respondé SOLO JSON válido con las claves titulo (máximo 85 caracteres), bajada (máximo 200), categoria, contenido (texto plano con párrafos separados por dos saltos de línea). No uses Markdown ni HTML.'''
url='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+KEY
payload={'contents':[{'parts':[{'text':prompt}]}],'generationConfig':{'responseMimeType':'application/json','temperature':0.8}}
req=urllib.request.Request(url,data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'},method='POST')
try:
 with urllib.request.urlopen(req,timeout=80) as response: data=json.load(response)
 text=data['candidates'][0]['content']['parts'][0]['text']; article=json.loads(text)
except Exception as exc:sys.exit(f'No se publicó: fallo la generación: {exc}')
for field in ('titulo','bajada','categoria','contenido'):
 if not isinstance(article.get(field),str) or not article[field].strip():sys.exit('Respuesta incompleta; no se publica.')
if len(article['contenido'].split())<300:sys.exit('Artículo demasiado corto; no se publica.')
article={k:article[k].strip() for k in ('titulo','bajada','categoria','contenido')};article['fecha']=HOY
(DEST/f'{HOY}.json').write_text(json.dumps(article,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
items=[]
for f in sorted(DEST.glob('????-??-??.json'),reverse=True)[:90]:
 try:
  a=json.loads(f.read_text(encoding='utf-8'))
  items.append({k:a[k] for k in ('fecha','titulo','bajada','categoria')})
 except (ValueError,KeyError):pass
(ROOT/'cuaderno'/'indice.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Publicado',HOY,article['titulo'])
