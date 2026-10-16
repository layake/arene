# Galerie des FX de mêlée : python3 fxgallery.py [carchacrok_new.html] -> fxgallery.png (une case par capacité, instant t=.13 s)
import os,sys,io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
page=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'carchacrok_new.html')
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.goto('file://'+page); pg.wait_for_timeout(600)
    ids=pg.evaluate("MELEE_DEFS.map(d=>[d.id,SPL[d.id].name,d.fx])")
    pg.evaluate("()=>{menuEl.hidden=true;menuOpen=false;startMatch(['lucario','garchomp','gengar'],'duel');hideVersus();const t=document.getElementById('title');if(t)t.style.display='none';paused=true}")
    cells=[]
    for id,name,style in ids:
        pg.evaluate("id=>{fx.length=0;const e=entities[0],t=entities[1];t.x=e.x+400;e.aim=[1,0];ACE2[id].hit(e,id);fx.forEach(c=>{if(c.k==='mfx')c.t=.13})}",id)
        pg.wait_for_timeout(120)
        im=Image.open(io.BytesIO(pg.screenshot())).convert('RGB').crop((560,230,860,400))
        d=ImageDraw.Draw(im); d.rectangle((0,0,299,14),fill=(20,20,30)); d.text((3,2),f"{id} / {style}",fill=(255,255,255)); cells.append(im)
    cols=4; rows=(len(cells)+cols-1)//cols; W=Image.new('RGB',(cols*300,rows*170))
    for i,c in enumerate(cells): W.paste(c,((i%cols)*300,(i//cols)*170))
    W.save('fxgallery.png'); print(len(cells),'FX',errs); b.close()
