import xml.etree.ElementTree as ET, base64, json, sys
from PIL import Image
d,pre=sys.argv[1],sys.argv[2]
root=ET.parse(d+'/AnimData.xml').getroot(); anims={}
for a in root.iter('Anim'):
    n=a.find('Name').text
    if a.find('FrameWidth') is None: continue
    anims[n]=dict(w=int(a.find('FrameWidth').text),h=int(a.find('FrameHeight').text),dur=[int(x.text) for x in a.iter('Duration')],hit=a.find('HitFrame').text if a.find('HitFrame') is not None else None)
MAP=[('idle','Idle',True),('walk','Walk',True),('attack','Attack',False),('hurt','Hurt',False),('guard','Charge',True)]
sheets={};anch={}
for key,name,loop in MAP:
    A=anims[name]; W,H=A['w'],A['h']; n=len(A['dur'])
    im=Image.open(f'{d}/{name}-Anim.png'); sh=Image.open(f'{d}/{name}-Shadow.png').convert('RGBA')
    assert im.size==(W*n,H*8),(name,im.size,W,H,n)
    src='data:image/png;base64,'+base64.b64encode(open(f'{d}/{name}-Anim.png','rb').read()).decode()
    sheets[key]=dict(src=src,w=W,h=H,dur=A['dur'],loop=loop)
    rows=[]
    for r in range(8):
        row=[]
        for c in range(n):
            pts=[(x,y) for x in range(W) for y in range(H) if sh.getpixel((c*W+x,r*H+y))[:3]==(255,255,255) and sh.getpixel((c*W+x,r*H+y))[3]>0]
            row.append([round(sum(p[0] for p in pts)/len(pts)),round(sum(p[1] for p in pts)/len(pts))] if pts else [W//2,H//2+8])
        rows.append(row)
    anch[key]=rows
    print(key,W,H,n,A['dur'],'hit',A['hit'])
out=f'const {pre}_SHEETS={{\n'+''.join(f'  {k}:{{src:"{v["src"]}",w:{v["w"]},h:{v["h"]},dur:{json.dumps(v["dur"])},loop:{str(v["loop"]).lower()}}},\n' for k,v in sheets.items())+f'}};\nconst {pre}_ANCH='+json.dumps(anch,separators=(',',':'))+';\n'
open(f'{d}/{d}_data.js','w').write(out)
print('portrait','data:image/png;base64,'+base64.b64encode(open(d+'/portrait.png','rb').read()).decode()[:20], len(out))
open(f'{d}/portrait.b64','w').write(base64.b64encode(open(d+'/portrait.png','rb').read()).decode())
