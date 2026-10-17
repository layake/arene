"""Audit UI/UX automatisé : captures des écrans clés à plusieurs tailles + contrôles (débordements, cibles tactiles, contraste, focus, textes FR en mode EN).
Usage : python audit_ui.py   ->  captures dans out/audit/, rapport JSON affiché."""
import os,json
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
OUT=os.path.join(ROOT,"out","audit"); os.makedirs(OUT,exist_ok=True)
SIZES=[(1920,1080),(1366,768),(1280,720),(1024,600),(800,500)]
START="([keys,mode])=>{menuEl.hidden=true;menuOpen=false;startMatch(keys,mode||'duel');hideVersus();document.getElementById('title').style.display='none'}"
CHECK=r"""()=>{
  const vw=innerWidth,vh=innerHeight,res={overflow:[],small:[],lowContrast:[],noName:[],tiny:[]};
  const lum=c=>{const m=c.match(/[\d.]+/g);if(!m)return null;const [r,g,b]=m.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
  const bgOf=e=>{while(e){const c=getComputedStyle(e).backgroundColor;const m=c.match(/[\d.]+/g);if(m&&(m.length<4||+m[3]>.5))return c;e=e.parentElement}return 'rgb(255,255,255)'};
  const seen=new Set();
  document.querySelectorAll('body *').forEach(e=>{
    const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<.05||['CANVAS','SCRIPT','STYLE','OPTION','svg','path'].includes(e.tagName))return;
    const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;
    const id=(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/)[0]:'')||e.tagName;
    if((r.left<-2||r.top<-2||r.right>vw+2||r.bottom>vh+2)&&e.children.length===0&&e.textContent.trim())res.overflow.push(e.tagName+id+':'+e.textContent.trim().slice(0,24));
    const interactive=['BUTTON','A','INPUT','SELECT'].includes(e.tagName)||e.onclick;
    if(interactive&&(r.width<32||r.height<28)&&!seen.has(id))res.small.push(e.tagName+id+' '+Math.round(r.width)+'x'+Math.round(r.height));
    if(interactive&&!(e.getAttribute('aria-label')||e.textContent.trim()||e.title||e.getAttribute('aria-labelledby')||e.labels&&e.labels.length)&&!seen.has('n'+id))res.noName.push(e.tagName+id);
    if(e.children.length===0&&e.textContent.trim().length>1){
      const fs=parseFloat(s.fontSize);if(fs<11&&!seen.has('t'+id)){res.tiny.push(id+' '+fs+'px "'+e.textContent.trim().slice(0,16)+'"');seen.add('t'+id)}
      const fg=lum(s.color),bg=lum(bgOf(e));if(fg!==null&&bg!==null){const cr=(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);if(cr<3&&!seen.has('c'+id)){res.lowContrast.push(id+' '+cr.toFixed(1)+':1 "'+e.textContent.trim().slice(0,16)+'"');seen.add('c'+id)}}
    }
    seen.add(id);
  });
  Object.keys(res).forEach(k=>res[k]=res[k].slice(0,8));
  return res}"""
rep={}
with sync_playwright() as p:
    b=p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    for (w,h) in SIZES:
        pg=b.new_page(viewport={'width':w,'height':h}); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+REPO+'/index.html'); pg.wait_for_timeout(900)
        R=rep.setdefault(f"{w}x{h}",{})
        def snap(name):
            pg.screenshot(path=f"{OUT}/{name}_{w}.png"); R[name]=pg.evaluate(CHECK)
        snap("1_titre")
        pg.keyboard.press("Enter"); pg.wait_for_timeout(500); snap("2_selection_solo")
        pg.click('[data-tab=online]'); pg.wait_for_timeout(300); snap("3_en_ligne")
        pg.click('[data-tab=ranked]'); pg.wait_for_timeout(300); snap("4_classe")
        pg.click('[data-tab=solo]'); pg.wait_for_timeout(200)
        pg.evaluate("openSettings()"); pg.wait_for_timeout(300); snap("5_parametres"); pg.evaluate("document.getElementById('sClose').click()")
        pg.evaluate("picks=['garchomp','lucario','gengar'];pick='garchomp';refreshMenu()")
        pg.evaluate(START,[['garchomp','lucario','gengar'],None]); pg.wait_for_timeout(300); snap("6_vs_1v1")
        pg.wait_for_timeout(4500); snap("7_combat_1v1")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300); snap("8_pause"); pg.keyboard.press("Escape")
        pg.evaluate("()=>{setPause(false)}")
        pg.evaluate(START,[['garchomp','lucario'],'ffa']); pg.wait_for_timeout(400); snap("9_vs_melee")
        pg.wait_for_timeout(6500); snap("10_combat_melee")
        pg.evaluate("()=>{fighters.forEach(f=>{if(f!==player&&!f.out){f.hp=1;strike(player,f,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}})}"); pg.wait_for_timeout(9000); snap("11_fin_melee")
        R["erreurs_js"]=errs; pg.close()
    # mode anglais : textes français restants (écrans principaux)
    pg=b.new_page(viewport={'width':1280,'height':720}); pg.goto('file://'+REPO+'/index.html'); pg.wait_for_timeout(900)
    pg.evaluate("setLang&&setLang('en')") if False else None
    pg.keyboard.press("Enter"); pg.wait_for_timeout(300)
    pg.evaluate("document.querySelectorAll('#menu .langrow button, #menu button').forEach(b=>{if(/English/.test(b.textContent))b.click()})"); pg.wait_for_timeout(500)
    FR=r"""()=>{const w=/\b(le|la|les|des|une?|pour|avec|dans|sur|tes?|ton|ta|choisis|combat|équipe|sélection|rejoindre|créer|quitter|prêt|retour|manche|joueurs?|adversaire)\b/i,o=[];document.querySelectorAll('body *').forEach(e=>{if(e.children.length||!e.offsetParent)return;const t=e.textContent.trim();if(t.length>3&&w.test(t)&&!/^(Carchacrok|Draco)/.test(t))o.push(t.slice(0,40))});return [...new Set(o)].slice(0,25)}"""
    rep["EN_menu_textes_francais"]=pg.evaluate(FR)
    pg.click('[data-tab=online]'); pg.wait_for_timeout(300); rep["EN_en_ligne_textes_francais"]=pg.evaluate(FR)
    pg.screenshot(path=f"{OUT}/en_en_ligne.png")
    b.close()
json.dump(rep,open(OUT+"/rapport.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
print("ok",OUT)
