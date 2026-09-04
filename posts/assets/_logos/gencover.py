import io, os, re, glob

MD='../md'
FONT = "'Helvetica Neue', Helvetica, Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
GRAD = {'frontend':('#61dafb','#a78bfa'),'docker':('#2496ed','#66d9f2'),'oracle':('#ff6b5b','#ffb26b'),
        'spring':('#6db33f','#a8e063'),'stockanalyst':('#00b56e','#34d399'),'nearby':('#F3757C','#EFA116')}
NAME = {'frontend':'Frontend','docker':'Docker','oracle':'Oracle','spring':'Spring',
        'stockanalyst':'StockAnalyst','nearby':'nearby'}
LOGODIR='_logos'

def cat(s):
    if s.startswith(('buildtool-','cra-to-vite')): return 'frontend'
    for k in ('docker','oracle','spring','stockanalyst','nearby'):
        if s.startswith(k): return k
    return 'frontend'

def w(t, fs):
    """대략 폭. 한글/CJK 1.0em, 그 외 0.54em"""
    return sum(fs*(1.0 if ord(c)>0x1100 else 0.54) for c in t)

def wrap(t, fs, maxw, lines=2):
    words=t.split(' '); out=[]; cur=''
    for wd in words:
        trial=(cur+' '+wd).strip()
        if cur and w(trial,fs)>maxw: out.append(cur); cur=wd
        else: cur=trial
        if len(out)==lines: break
    if cur and len(out)<lines: out.append(cur)
    return out[:lines]

def mark(c):
    p=os.path.join(LOGODIR,c+'.svg')
    if not os.path.exists(p): return None
    s=io.open(p,encoding='utf-8').read()
    vb=re.search(r'viewBox="([\d.\s-]+)"',s).group(1).split()
    W,H=float(vb[2]),float(vb[3])
    inner=re.sub(r'^[\s\S]*?<svg[^>]*>','',s).replace('</svg>','').strip().replace('currentColor','url(#accent)')
    # 로고는 박스 없이 그대로 놓는다. viewBox 원점이 0이 아닐 수 있으므로 보정한다.
    x0,y0=float(vb[0]),float(vb[1])
    k=min(150.0/W, 104.0/H)   # 가로로 긴 마크도 존재감이 살도록 150x104 안에 맞춘다
    tx=548+52-(x0+W/2)*k; ty=146+52-(y0+H/2)*k
    return f'  <g transform="translate({tx:.1f},{ty:.1f}) scale({k:.4f})">\n{inner}\n  </g>'

def esc(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

n=0
for f in sorted(glob.glob(MD+'/*.md')):
    slug=os.path.basename(f)[:-3]
    if not os.path.isdir(slug): continue
    c=cat(slug); c0,c1=GRAD[c]
    s=io.open(f,encoding='utf-8').read()
    title=re.search(r'^title:\s*(.+)$',s,re.M).group(1).strip().strip('"')
    tg=re.search(r'^tags:\s*\[(.*?)\]',s,re.M)
    tags=[x.strip() for x in tg.group(1).split(',')] if tg else []

    title=re.sub(r'\s*\([^()]*(학습 노트|로드맵|시리즈 목차)[^()]*\)\s*$','',title).strip()
    # 프로젝트 글만 접두사를 뗀다(바로 위에 이름이 이미 있으므로). 학습 노트는 'Docker Compose'
    # 처럼 이름이 제목의 일부라 떼면 문장이 깨진다.
    if c in ('stockanalyst','nearby') and title.startswith(NAME[c]+' '):
        title=title[len(NAME[c])+1:].strip()
    # '주제 - 부제' 는 주제만 쓴다. 주제가 너무 짧거나 이름과 같으면 부제를 쓴다.
    if ' - ' in title:
        head, tail = title.split(' - ', 1)
        head=head.strip().lstrip('-').strip()
        title = tail.strip() if (len(head) < 4 or head.lower()==NAME[c].lower()) else head
    title=title.lstrip('-').strip()
    tags=[t for t in tags if t.lower()!=c][:6]

    m=mark(c)
    tl=wrap(title, 30, 980, 2)
    base = 336 if m else 286
    Y_name=base; Y_bar=base+28; Y_t1=base+88; Y_t2=base+126
    Y_tags=(Y_t2+46) if len(tl)>1 else (Y_t1+46)
    # 시리즈 편수 표기
    mm=re.match(r'(docker|oracle|buildtool|spring)-(\d\d)', slug)
    total={'docker':'08','oracle':'08','buildtool':'02'}
    part=''
    if mm:
        part = f'PART {mm.group(2)}' + (f' / {total[mm.group(1)]}' if mm.group(1) in total else '')

    r=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">','  <defs>',
       '    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0d1117"/><stop offset="100%" stop-color="#161b22"/></linearGradient>',
       f'    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="{c0}"/><stop offset="100%" stop-color="{c1}"/></linearGradient>',
       '  </defs>','  <rect width="1200" height="630" fill="url(#bg)"/>',
       '  <g stroke="#1a212a" stroke-width="1"><path d="M0 157.5H1200M0 315H1200M0 472.5H1200M300 0V630M600 0V630M900 0V630"/></g>',
       f'  <circle cx="600" cy="300" r="250" fill="{c0}" opacity="0.06"/>']
    if m: r.append(m)
    r.append(f'  <text x="600" y="{Y_name}" text-anchor="middle" font-family="{FONT}" font-size="62" font-weight="bold" fill="url(#accent)">{esc(NAME[c])}</text>')
    r.append(f'  <rect x="555" y="{Y_bar}" width="90" height="5" rx="2.5" fill="url(#accent)"/>')
    for i,line in enumerate(tl):
        r.append(f'  <text x="600" y="{Y_t1 if i==0 else Y_t2}" text-anchor="middle" font-family="{FONT}" font-size="30" fill="#e6edf3">{esc(line)}</text>')
    if tags:
        r.append(f'  <text x="600" y="{Y_tags}" text-anchor="middle" font-family="{FONT}" font-size="22" fill="#8b95a1">{esc(" · ".join(tags))}</text>')
    if part:
        r.append(f'  <text x="600" y="566" text-anchor="middle" font-family="{FONT}" font-size="21" fill="#6b7785" letter-spacing="4">{part}</text>')
    r.append('</svg>')
    io.open(f'{slug}/cover.svg','w',encoding='utf-8',newline='').write("\n".join(r)); n+=1
    print(f'{slug:38s} | {" / ".join(tl):52s} | {part}')
print(n,'장')
