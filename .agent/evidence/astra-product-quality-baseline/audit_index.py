import pathlib, json, re, sys
ROOT=pathlib.Path('/workspace/scratch/0490b207d766/nicheworks')
reg=json.loads((ROOT/'tools/tools-index.json').read_text())['items']
checks=list((ROOT/'scripts').glob('*.mjs'))+list((ROOT/'tools/_shared').glob('*check*.mjs'))
check_text={str(p.relative_to(ROOT)):p.read_text(errors='replace') for p in checks}
waves={}
for p in (ROOT/'audits/non-affiliate-waves').glob('*.json'):
 for r in json.loads(p.read_text()).get('records',[]): waves[r['slug']]=r
rows=[]
for item in reg:
 s=item['slug']; d=ROOT/'tools'/s
 spec=(d/'SPEC.md').read_text() if (d/'SPEC.md').exists() else ''
 parts=re.split(r'^## (.+)\n',spec,flags=re.M); sections={parts[i]:parts[i+1].strip() for i in range(1,len(parts)-1,2)}
 files=[p for p in d.rglob('*') if p.is_file()]
 tests=[str(p.relative_to(ROOT)) for p in files if re.search(r'(^|/)(tests?|__tests__)(/|$)|[.-]test[.-]|[.-]spec[.-]',str(p.relative_to(d))) and p.suffix in ['.js','.mjs','.cjs','.html']]
 refs=[p for p,t in check_text.items() if s in t]
 docs=[str(p.relative_to(ROOT)) for p in files if p.suffix.lower()=='.md']
 html=(d/'index.html').read_text(errors='replace') if (d/'index.html').exists() else ''
 scripts=re.findall(r'<script[^>]*src=[\"\']([^\"\']+)',html)
 runtime=[]
 for src in scripts:
  if src.startswith(('https:','http:','//')): continue
  f=(ROOT/src.lstrip('/')) if src.startswith('/') else d/src.split('?')[0]
  if f.exists() and f.suffix in ['.js','.mjs']: runtime.append(str(f.relative_to(ROOT)))
 row=dict(slug=s,name=item['title_en'],impl=bool(html),spec=bool(spec),sections=sections,docs=docs,tests=tests,checks=refs,runtime=runtime,html_scripts=scripts,old_audit=waves.get(s,{}))
 rows.append(row)
pathlib.Path('/workspace/scratch/0490b207d766/audit-index.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
if len(sys.argv)>1:
 start=int(sys.argv[1]); end=int(sys.argv[2])
 for r in rows[start:end]:
  print('\n###',r['slug'])
  for sec in ['Purpose','Inputs','Outputs','Limits and non-goals','Acceptance criteria']:
   lines=r['sections'].get(sec,'MISSING').splitlines()
   print(sec+': '+ '\n'.join(lines[:7]))
  print('Runtime:',', '.join(r['runtime'][:6]))
  print('Tests:',', '.join(r['tests'][:3]),'checks',len(r['checks']))
  print('Earlier findings:', ' | '.join(f['summary'] for f in r['old_audit'].get('findings',[]) if 'regression' not in f['summary'].lower())[:1300])
