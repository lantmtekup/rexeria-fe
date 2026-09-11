"""Scroll-through capture using the installed Google Chrome (H.264 + WebGL OK)."""
import sys, os, json, time
from playwright.sync_api import sync_playwright
URL="https://magnolia-demo-black.vercel.app/"
OUT=sys.argv[1] if len(sys.argv)>1 else "scroll-frames"
VIEWPORTS=[("desktop",1440,900,0.5),("mobile",375,812,1.0)]  # step in viewport-heights
with sync_playwright() as p:
    b=p.chromium.launch(channel="chrome", headless=True, args=["--autoplay-policy=no-user-gesture-required","--use-gl=angle","--enable-unsafe-swiftshader"])
    for name,w,h,step in VIEWPORTS:
        ctx=b.new_context(viewport={"width":w,"height":h}, device_scale_factor=1, locale="vi-VN")
        pg=ctx.new_page()
        try: pg.goto(URL, wait_until="networkidle", timeout=20000)
        except Exception: pg.wait_for_load_state("load"); pg.wait_for_timeout(3000)
        pg.wait_for_timeout(4000)
        d=os.path.join(OUT,name); os.makedirs(d,exist_ok=True)
        total=pg.evaluate("document.documentElement.scrollHeight")
        log=[]
        y=0; i=0
        while y<=total-h+1:
            pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(700)
            if i==0: pg.wait_for_timeout(2500)
            info=pg.evaluate("""()=>{const v=[...document.querySelectorAll('video')].map(v=>({src:(v.currentSrc||'').split('/').pop(),t:+v.currentTime.toFixed(2),d:+(v.duration||0).toFixed(2),rs:v.readyState}));
              const s=[...document.querySelectorAll('[data-scroll-scrub-state]')].map(e=>e.getAttribute('data-scroll-scrub-state'));
              const sec=[...document.querySelectorAll('section[id]')].map(e=>{const r=e.getBoundingClientRect();return {id:e.id,top:Math.round(r.top),h:Math.round(r.height)}}).filter(x=>x.top<innerHeight&&x.top+x.h>0).map(x=>x.id);
              return {scrollY:scrollY,videos:v,scrub:s,visible:sec}}""")
            fn=f"{i:03d}-y{int(y)}-{'+'.join(info['visible']) or 'none'}.png"
            pg.screenshot(path=os.path.join(d,fn))
            info['file']=fn; log.append(info); print(name,fn,info['videos'],info['scrub'],flush=True)
            y+=h*step; i+=1
        json.dump({"total":total,"frames":log},open(os.path.join(d,"frames.json"),"w"),indent=1,ensure_ascii=False)
        ctx.close()
    b.close()
