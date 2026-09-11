"""Compare the local clone against the original scroll-frames at identical scrollY, using real Chrome."""
import sys, os, json, re
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops, ImageStat
ROOT=os.path.dirname(os.path.abspath(__file__))
LOCAL=sys.argv[1] if len(sys.argv)>1 else "http://localhost:7790/"
OUT=os.path.join(ROOT,"compare-frames"); os.makedirs(OUT,exist_ok=True)
VIEWPORTS=[("desktop",1440,900),("mobile",375,812)]
def similarity(a,b):
    a=a.convert("RGB"); b=b.convert("RGB").resize(a.size)
    d=ImageChops.difference(a,b); s=ImageStat.Stat(d)
    return 100-(sum(s.mean)/3)/255*100
report={}
with sync_playwright() as p:
    b=p.chromium.launch(channel="chrome",headless=True,args=["--autoplay-policy=no-user-gesture-required"])
    for name,w,h in VIEWPORTS:
        frames=json.load(open(os.path.join(ROOT,"scroll-frames",name,"frames.json")))
        ctx=b.new_context(viewport={"width":w,"height":h},device_scale_factor=1,locale="vi-VN")
        pg=ctx.new_page()
        try: pg.goto(LOCAL,wait_until="networkidle",timeout=20000)
        except Exception: pg.wait_for_load_state("load"); pg.wait_for_timeout(3000)
        pg.wait_for_timeout(4500)
        total=pg.evaluate("document.documentElement.scrollHeight")
        os.makedirs(os.path.join(OUT,name),exist_ok=True)
        rows=[]
        for i,f in enumerate(frames["frames"]):
            # Replay the REQUESTED y (encoded in the filename), not the recorded scrollY:
            # the original run hit a hero-completion scroll reset, and replaying its
            # post-reset scrollY puts the clone in a different state.
            y=int(re.search(r"-y(\d+)-", f["file"]).group(1))
            pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(700)
            if i==0: pg.wait_for_timeout(2500)
            local_path=os.path.join(OUT,name,f["file"]); pg.screenshot(path=local_path)
            orig=Image.open(os.path.join(ROOT,"scroll-frames",name,f["file"])); loc=Image.open(local_path)
            sim=similarity(orig,loc)
            vis=pg.evaluate("[...document.querySelectorAll('section[id]')].map(e=>{const r=e.getBoundingClientRect();return {id:e.id,top:Math.round(r.top),h:Math.round(r.height)}}).filter(x=>x.top<innerHeight&&x.top+x.h>0).map(x=>x.id).join('+')")
            rows.append({"file":f["file"],"scrollY":y,"orig_visible":"+".join(f["visible"]),"local_visible":vis,"similarity":round(sim,1)})
            print(f"{name} {f['file']:<48} sim={sim:5.1f}%  local={vis}",flush=True)
        report[name]={"orig_total":frames["total"],"local_total":total,"frames":rows,"mean":round(sum(r['similarity'] for r in rows)/len(rows),1)}
        print(f"== {name}: orig height {frames['total']} vs local {total}; mean similarity {report[name]['mean']}%")
        ctx.close()
    b.close()
json.dump(report,open(os.path.join(OUT,"report.json"),"w"),indent=1)
