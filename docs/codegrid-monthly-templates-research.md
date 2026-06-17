# CodeGrid Monthly Templates — Nghiên cứu source & bóc tách block

> Nguồn: `~/Documents/discord-summarizer/output_1112149715237228635/` (kênh #templates).
> 31 template monthly (cg-tpl-may2023 → may2026). Map: `templates_deployed.json` (slug → key/url).
> Source thật: `projects/<slug>/<CGMWT…>/<app>/`. Đọc **mới → cũ** (2026 trở về trước).
>
> Mỗi tháng ghi: stack · pages · component→animation→block. Ký hiệu block:
> **✅built** (đã có trong block-editor) · **🟡cand** (nên thành block mới) · **⛔TierC** (app/WebGL — code-template, không block) · **🅰️motion** (chỉ cần motion system mask-reveal/scrub).

---

## 2026 · may2026 — “Deadlock Studios” (Creative Agency)
- **URL:** https://cg-tpl-may2026.vercel.app · **slug:** `037_…__CGMWTMAY2026/deadlock-studios`
- **Stack:** Next 16 + React 19 · GSAP 3.14 + @gsap/react · **Lenis** (smooth scroll) · **Three 0.183 + postprocessing** (bloom) · `next-transition-router` (page transitions) · react-icons
- **Pages:** `/` (home) · `/catalog` · `/studio` · `/connect` · `/brief`
- **Assets:** featured-work, catalog, team, accordion, spiral, trail-images(19), brief, fonts

### Component → animation → block
| Component | Hiệu ứng | Kỹ thuật | Block |
|---|---|---|---|
| **AnimeText** | Đoạn text reveal theo scroll: từng **word** sáng dần + flash highlight + keyword bọc pill màu | ScrollTrigger **pin** container, `end=+vh*pinDuration`, `onUpdate` set opacity/word theo `self.progress` (cửa sổ overlap 15 word) | 🟡 `scroll_word_reveal` (hoặc mở rộng motion) |
| **TrailContainer** | Image trail bám chuột, ảnh reveal bằng **clip-path mask**, lerp theo con trỏ | rAF + lerp + `getBoundingClientRect`, config (lifespan 1000, threshold 150px, stagger in/out, cubic-bezier), tạo/huỷ DOM `.trail-img`, **desktop-only (>1000px)** | ✅ `image_trail` (thêm biến thể masked clip-path) |
| **Copy** | Reveal dòng chữ (line/word mask) khi vào màn | GSAP SplitText-style + mask `overflow:hidden` + y | 🅰️ motion `mask-reveal` |
| **FeaturedProjects** | Showcase dự án (grid/scroll) | GSAP scroll | 🅰️/🟡 |
| **Accordion** | Accordion mở/đóng có ảnh | height/clip + GSAP | 🟡 `accordion_media` |
| **Team** | Lưới thành viên | reveal | 🅰️ motion |
| **Menu** + `scramble.js` | Overlay nav full-screen + **text scramble** (random char → settle) | timeline overlay + scramble RAF | ⛔ TierC (nav) — *scramble* tách được thành util |
| **Preloader** | Màn chờ vào trang | GSAP timeline | ⛔ TierC |
| **Spiral** | **WebGL** xoắn ốc hậu cảnh | Three + postprocessing (bloom) | ⛔ TierC |
| **Fluorescent** | **WebGL** shader phát sáng | Three shader | ⛔ TierC |
| **BlindingLight** + `logoPath.js` | Logo SVG loé sáng | SVG path + bloom | ⛔ TierC |
| **TransitionProvider** | Chuyển trang mượt | `next-transition-router` | ⛔ TierC |
| **Footer** | reveal | motion | 🅰️ |

### Tổng kết may2026
- **Block-able:** AnimeText (🟡 scroll word-reveal — đáng làm), TrailContainer (✅ image_trail masked), Copy/Team/Footer (🅰️ motion), Accordion (🟡), FeaturedProjects (🟡).
- **Tier C (app/WebGL):** Preloader, Menu+scramble, Spiral, Fluorescent, BlindingLight, TransitionProvider — 6 cái, thuộc tầng trang/shader.

### Code lõi + port spec (build block ngay)

#### 🟡 `scroll_word_reveal` (từ AnimeText) — mô hình B
**Hiệu ứng:** đoạn văn pin giữa màn, scroll xuống → từng word sáng dần kèm flash nền; keyword bọc pill màu. Cuộn ngược → highlight quay lại khi chữ ẩn.
**DOM:** `<section.at-container>` (pinned) → mỗi word `<span.at-word><span>{word}</span></span>`; keyword thêm class + CSS var `--kw-color`. CSS: `.at-word{opacity:0;will-change:background-color,opacity}`, inner `span{opacity:0}`.
**JS lõi:** ScrollTrigger pin, `end:+=innerHeight*pinDuration(4)`, `onUpdate(self.progress)`:
```js
// forward (progress<=0.7): per-word reveal, cửa sổ overlap 15 word
const overlap=15, ws=i/N, we=ws+overlap/N, scale=1/Math.min(1+overlap/N, 1+(N-1)/N+overlap/N);
const wp = clamp01((rev - ws*scale)/((we-ws)*scale));      // rev = min(1, progress/0.7)
word.style.opacity = wp;
word.style.backgroundColor = `rgba(${highlightBg}, ${1 - flash(wp)})`; // flash khi wp>=0.9
inner.style.opacity = Math.pow(wp>=0.9?(wp-0.9)/0.1:0, 0.5);
// reverse (progress>0.7): overlap 5 → inner.opacity=1-rp, bg=rgba(hl, rp)
```
**Content:** `paragraphs[]`, `keywords[]`, `keywordColors{}`, `highlightBg(rgb)`, `pinDuration(4)`.
**Mobile/⚠️:** pin = vấn đề iOS → dùng `position:sticky` thay pin hoặc giảm pinDuration; `prefers-reduced-motion` → hiện full text. Kill ScrollTrigger khi unmount.

#### 🟡 `accordion_media` (từ Accordion) — mô hình B
**Hiệu ứng:** hàng panel ngang, panel active nở rộng (ảnh + title + mô tả word-reveal), còn lại thu hẹp; mobile → xếp dọc hiện hết.
**JS lõi:** GSAP + SplitText. Active `flexGrow:52`, khác `16` (flexShrink:0, flexBasis:0), tween `duration:0.6 power3.out`. Mô tả: `SplitText(words)` → active `opacity:1,y:0`, ẩn `opacity:0,y:6`, stagger `0.015`. Mobile `<1000px` → `.accordion--stacked`, kill tween, show full.
**Content:** `items[{id,title,description,image}]`. **Config:** expanded 52 · collapsed 16 · duration .6 · ease power3.out · wordStagger .015 · breakpoint 1000.
**⚠️:** cần plugin `SplitText` (GSAP); revert split khi unmount.

#### ✅ `image_trail` masked (từ TrailContainer) — biến thể của block đã có
Giống `image_trail` đã build (plan §7) nhưng reveal bằng **clip-path mask** + slide. Config thật: `imageLifespan 1000 · mouseThreshold 150 · inDuration 750 · outDuration 1000 · staggerIn 100 · staggerOut 25 · slideDuration 1000 · easing cubic-bezier(.87,0,.13,1)`, 19 ảnh, **desktop-only (>1000px)**, lerp interpolated mouse. → bổ sung option `reveal:'mask'` cho block hiện có.

#### 🔧 Util tách dùng lại: **text-scramble** (Menu/scramble.js) — random char → settle, cho heading/nav.

> **Cần làm sau khi gom đủ tháng:** scroll_word_reveal, accordion_media là 2 block mới đáng thêm; image_trail thêm option masked; text-scramble thành util chung.

---

## 2026 · apr2026 — “Lemon Bureau” (Creative Studio)
- **URL:** https://cg-tpl-apr2026.vercel.app · **slug:** `036_…__CGMWTAPR2026/lemon-bureau`
- **Stack:** **Vite vanilla** (HTML/CSS/JS đa trang) · GSAP 3.15 (ScrollTrigger + SplitText + Observer) · **Lenis** · **Three 0.183 (WebGL)** · **physics: rapier3d + cannon-es + matter-js** + `wrappedgl` (fluid sim)
- **Pages:** index · studio · work · sample-project · contact
- **JS modules:** animated-copy · team-cards · clients · studio-services · cursor · home-hero · studio-hero · nav · preloader · footer · lenis-scroll · **fluidparticles · simulation · simulator · particle-visual · footer-fluid · wrappedgl** (cụm WebGL fluid)

### Component → animation → block
| Module | Hiệu ứng | Kỹ thuật | Block |
|---|---|---|---|
| **animated-copy** | Reveal chữ slide-up qua mask, lines/words, theo load hoặc scroll | `SplitText.create({type,mask,autoSplit})` + `yPercent:100→0` stagger; điều khiển bằng **data-attribute** | 🅰️ motion `mask-reveal` (tham chiếu chuẩn) |
| **team-cards** | Lưới thẻ team build từ data, reveal/scroll | DOM build + ScrollTrigger | 🟡 `card_showcase` |
| **studio-services / clients** | Section reveal theo scroll | ScrollTrigger + SplitText | 🅰️ motion |
| **cursor** | Custom cursor bám chuột (lerp) | rAF + lerp | 🔧 util `custom-cursor` |
| **home-hero / studio-hero** | Hero + chữ vào theo preloader delay | SplitText + delay | 🅰️/🟡 |
| **fluidparticles · simulation · simulator · wrappedgl · footer-fluid · particle-visual** | **Mô phỏng fluid/particle WebGL** (physics rapier/cannon/matter) | Three + GLSL + physics engine | ⛔ TierC (nặng) |
| **preloader · nav** | Màn chờ + nav overlay | GSAP timeline | ⛔ TierC |

### Code lõi + port spec
#### 🅰️ `mask-reveal` (từ animated-copy) — MỞ RỘNG motion system, không cần block mới
**Đây là khuôn chuẩn cho Tier A** (plan §2): reveal chữ slide-up qua mask, cấu hình bằng data-attr.
```js
SplitText.create(el, {
  type: splitType,            // 'lines' | 'words'
  mask: splitType,            // ← GSAP SplitText mask (overflow:hidden tự lo)
  autoSplit: true, linesClass: "line", wordsClass: "word",
  onSplit(self){
    const targets = splitType==='words'? self.words : self.lines;
    gsap.set(targets,{ yPercent:100 });
    gsap.to(targets,{ yPercent:0, duration:0.75, stagger:0.1, ease:'…',
      delay, scrollTrigger: animateOnScroll && { trigger:el, start:'top 70%' } });
  }
});
```
**Data-attr:** `data-animate-variant="slide-lines|slide-words"` · `data-animate-split` · `data-animate-on-scroll` · `data-animate-delay|duration|stagger|start`. Hero + preloader: cộng delay `PRELOADER_HERO_DELAY 3.25s` khi preloader hiện.
**→ Port:** thêm preset `mask-reveal` + property dùng `SplitText mask` vào `motion/presets.ts`+`runtime.tsx`; map config trên về MotionProvider. Phục vụ MỌI block có text.
**⚠️:** SplitText là plugin GSAP (club) — kiểm tra license/đã có trong repo; revert split + ScrollTrigger khi unmount; reduced-motion → bỏ qua.

#### 🔧 util `custom-cursor` (cursor.js): vòng lerp `cur += (target-cur)*k` mỗi rAF, ẩn trên touch.
#### 🟡 `card_showcase` (team-cards): build thẻ từ `items[{id,name,img,description}]`, reveal theo scroll — gần `hover_reveal_list`/grid đã có.

### Tổng kết apr2026
- **Block-able:** animated-copy (🅰️ — chốt khuôn mask-reveal), team-cards (🟡 card_showcase), cursor (🔧 util), studio-services/clients/hero (🅰️).
- **Tier C (rất nặng):** cả cụm fluid/particle WebGL + physics (6 module) + preloader + nav. Đây là tháng “WebGL fluid” — phần lõi không thành block.
- **Rút ra:** animated-copy củng cố quyết định **mở rộng motion `mask-reveal`** (Tier A) — ưu tiên làm vì áp cho mọi block.

---

## 2026 · march2026 — “House of Epochs” (Cinematic Brand)
- **URL:** https://cg-tpl-march2026.vercel.app · **slug:** `035_…__CGMWTMARCH2026/house-of-epochs`
- **Stack:** Next 16 + GSAP 3.14 (+ScrollTrigger +**Flip**) · **Lenis** · Three 0.183 · `next-transition-router` · react-icons (cùng họ may2026, không postprocessing)
- **Pages:** home · catalog · chronicles · report · transmit
- **Components:** About · Button · CTA · Copy · FeaturedCards · Footer · Menu · **MusicToggle** · Preloader · **Showreel** · TransitionProvider

### Component → animation → block
| Component | Hiệu ứng | Kỹ thuật | Block |
|---|---|---|---|
| **Showreel** | Khối tiêu đề + visual + marquee **morph layout theo scroll** (giãn ra / gom lại) | **GSAP Flip** `getState→from(absolute,paused)` rồi gắn progress vào ScrollTrigger; compact `<1000px` | 🟡 `flip_showreel` (mới, hay) |
| **FeaturedCards** | Lưới thẻ thế giới (subtitle/title/image) reveal scroll | data-driven + ScrollTrigger + Copy(mask) | 🟡 `card_showcase` |
| **Copy** | Reveal dòng/chữ qua mask | SplitText mask (như apr/may) | 🅰️ motion `mask-reveal` |
| **About / CTA** | Section reveal | ScrollTrigger | 🅰️ |
| **Menu / Preloader / TransitionProvider** | nav overlay · preloader · chuyển trang | GSAP timeline + next-transition-router | ⛔ TierC |
| **MusicToggle** | Bật/tắt nhạc nền | Audio API | ⛔ TierC (audio) |

### Code lõi + port spec
#### 🟡 `flip_showreel` (từ Showreel) — mô hình B, dùng GSAP Flip
**Hiệu ứng:** trạng thái đầu (layout A) → cuộn → Flip morph mượt sang layout B (visual phóng to/tiêu đề dạt ra), scrub theo scroll. Marquee chạy ngang trong lúc đó.
```js
gsap.registerPlugin(ScrollTrigger, Flip);
// đo state layout A
const headerState = Flip.getState(headers);
const visualState = Flip.getState(visual);
headers.forEach(h=>h.classList.add('end-state'));   // chuyển CSS → layout B
visual.classList.add('end-state');
const headerFlip = Flip.from(headerState,{duration:1,ease:'none',absolute:true,paused:true});
const visualFlip = Flip.from(visualState,{duration:1,ease:'none',paused:true});
// gắn tiến trình Flip (paused) vào scroll
ScrollTrigger.create({ trigger:section, start:'top top', end:'+=…', scrub:true,
  onUpdate:self=>{ headerFlip.progress(self.progress); visualFlip.progress(self.progress); }});
```
**Content:** headers[], 1 visual (img/video), marquee text. **Config:** duration, compactBreakpoint 1000.
**⚠️:** `clearProps:'all'` + re-`getState` khi resize; iOS Flip + scrub ổn hơn pin; reduced-motion → bỏ Flip, hiện layout B.

### Tổng kết march2026
- **Block-able:** Showreel (🟡 `flip_showreel` — pattern mới đáng làm), FeaturedCards (🟡 `card_showcase` — lặp lại apr2026 → gộp thành 1 block), Copy/About/CTA (🅰️).
- **Tier C:** Menu · Preloader · TransitionProvider · MusicToggle (audio).
- **Rút ra:** `card_showcase` xuất hiện ≥2 tháng → block ưu tiên. `flip_showreel` bổ sung họ Flip (cùng `flip_gallery`/`lightbox_flip` đã có).

---

## 2026 · feb2026 — “Salle Blanche” (Restaurant — sạch, KHÔNG WebGL ⇒ block-rich nhất)
- **URL:** https://cg-tpl-feb2026.vercel.app · **slug:** `…CGMWTFEB2026/salle-blanche`
- **Stack:** Next 16 + GSAP (+ScrollTrigger) · **Lenis** · `next-view-transitions` · react-icons. **Không Three** → gần như mọi section map thẳng vào block đã có.
- **Pages:** home · about · menu · reservation
- **Components:** Button · CTA · Chefs · Copy · DiningMenu(+data) · Footer · ImageBanner · Marquee · Nav · Preloader · **StickyCards** · Testimonials(+data)

| Component | Hiệu ứng | Block |
|---|---|---|
| **StickyCards** | 6 thẻ pin chồng theo scroll (title+desc+image), mobile<1000 stack | ✅ `sticky_scroll_cards` (KHỚP block đã build — xác nhận spec) |
| **Marquee** | Băng chữ chạy ngang vô tận | ✅ `marquee_band` |
| **ImageBanner** | Ảnh nền full + heading/desc reveal lines | 🟡 `image_banner` (bg image + `<Copy type=lines animateOnScroll>`) |
| **Testimonials / Chefs / DiningMenu** | List/card data-driven reveal | 🟡 `card_showcase` (gộp) |
| **Copy / CTA / Footer** | mask reveal lines/words | 🅰️ motion |
| **Nav / Preloader / view-transitions** | nav · preloader · chuyển trang | ⛔ TierC |

**Port `image_banner`:** section `bg img` + `Copy type="lines" animateOnScroll` cho heading (mảng từ), footer desc `Copy` delay 0.5 trigger section. → ghép từ motion mask-reveal + 1 ảnh nền. Block nhẹ, mobile-OK.
**Tổng kết feb2026:** tháng “sạch” nhất — **map gần hết vào block đã có** (sticky_scroll_cards, marquee_band) + `image_banner` mới nhẹ + `card_showcase`. Không Tier C nặng (chỉ nav/preloader). → Mẫu tốt để demo bộ block hiện tại.

---

## 2026 · jan2026 — “Deadspace” (Sci-fi / WebGL)
- **URL:** https://cg-tpl-jan2026.vercel.app · **slug:** `…CGMWTJAN2026/deadspace`
- **Stack:** **Vite vanilla** + GSAP (+ScrollTrigger) · **Lenis** · **Three (WebGL + shaders)**
- **JS:** animated-copy · clients · contact · footer · **lab · menuShaders · particle-visual · skyline** (WebGL) · nav · menu · preloader · **pie-transition · transition** · stats · work · project

| Module | Hiệu ứng | Block |
|---|---|---|
| **skyline · particle-visual · menuShaders · lab** | Cảnh WebGL/shader (skyline 3D, particle, menu shader) | ⛔ TierC (nặng) |
| **animated-copy** | mask reveal lines/words (data-attr) | 🅰️ motion |
| **stats** | Stat-item **trượt từ phải** theo scroll (scrub) | 🟡/🅰️ `slide-scrub` |
| **clients / work / project** | List/grid reveal | 🟡 `card_showcase` |
| **pie-transition · transition · preloader · nav · menu** | Page/nav transition + preloader | ⛔ TierC |

**Code lõi `slide-scrub` (stats.js):**
```js
ScrollTrigger.create({ trigger:item, start:'top bottom', end:'top 25%', scrub:true,
  onUpdate:self => gsap.set(item, { x: 250 - self.progress*250 }) });  // x:250→0 theo scroll
```
→ Đây là **property `x` + trigger `scroll-progress`** đã có sẵn trong motion system (mô hình A). Không cần block mới.
**Tổng kết jan2026:** WebGL-heavy (skyline/particle/shader = Tier C). Block-able chỉ: animated-copy (🅰️), stats (🅰️ slide-scrub), clients/work (🟡 card_showcase).

---

> ## ✅ Chốt 2026 (5 tháng: may→jan)
> **Stack chuẩn:** Next/Vite + GSAP(ScrollTrigger/SplitText/Flip) + Lenis (+Three khi cần WebGL).
> **Block ưu tiên rút ra:**
> 1. 🅰️ **motion mask-reveal** (SplitText lines/words) — DÙNG MỌI THÁNG → làm trước hết (Tier A).
> 2. 🟡 **card_showcase** — 4/5 tháng (FeaturedCards/Testimonials/Chefs/clients/work).
> 3. 🟡 **scroll_word_reveal** (may), **flip_showreel** (march), **image_banner** (feb), **accordion_media** (may).
> 4. ✅ Xác nhận khớp: `sticky_scroll_cards`, `marquee_band`, `image_trail` (+masked).
> 5. 🔧 util: text-scramble, custom-cursor.
> **Tier C cố định (không block):** Preloader · Menu/Nav overlay · page-transition · WebGL Three (skyline/fluid/particle/shader/bloom) · audio toggle.

---

## 2025 · dec2025 — “nrmlss” (E-commerce / Fashion)
- **URL:** https://cg-tpl-dec2025.vercel.app · slug `…CGMWTDEC2025/nrmlss` · **Stack:** Next + GSAP(+SplitText) + Lenis + Three + **zustand** (cart state)
- **Components:** Preloader · Footer · ContactForm · CTA · **DotMatrix** · Product · BrandIcon · **PeelReveal** · MarqueeBanner · Menu · **ShoppingCart** · Copy · **Orb**(WebGL) · TextBlock

| Component | Block |
|---|---|
| **PeelReveal** | 🟡 `peel_reveal` (mask layers “lột” + scale theo scroll pin) — MỚI |
| MarqueeBanner | ✅ `marquee_band` |
| Product / TextBlock / Copy | 🟡 `card_showcase` · 🅰️ motion |
| DotMatrix | 🟡 `dot_matrix` (canvas lưới chấm phản ứng chuột) |
| Orb (Three) · ShoppingCart · Menu · Preloader | ⛔ TierC (WebGL / cart app / nav) |

**Code lõi `peel_reveal`:** pin `end:+=innerHeight*4`; SplitText words `opacity:0`; nhiều `.mask` `scale:0.9-i*0.2` + `imageContainer scale:0` → scroll progress “lột” từng lớp mask + phóng ảnh + hiện chữ. ⚠️ iOS dùng sticky thay pin.

## 2025 · nov2025 — “orbit-matter” (Interactive / Space)
- **URL:** https://cg-tpl-nov2025.vercel.app · **Vite vanilla** + GSAP + Lenis (KHÔNG three)
- **JS:** animated-copy · cta · expedition · faq · home · **interactive-grid** · **observatory** · traces · nav · preloader · transition

| Module | Block |
|---|---|
| **interactive-grid** | 🟡 `interactive_grid` (lưới ảnh kéo/hover phản ứng) — MỚI |
| **faq** | 🟡 `faq_accordion` (gần `accordion_media`) |
| animated-copy | 🅰️ motion |
| observatory / traces / expedition | 🟡 section reveal / 🅰️ |
| nav · preloader · transition | ⛔ TierC |
→ Không WebGL → block-rich; `interactive_grid` + `faq_accordion` là pattern mới.

## 2025 · oct2025 — “polite-chaos” (Agency — block-rich, no WebGL)
- **URL:** https://cg-tpl-oct2025.vercel.app · Next + GSAP + Lenis + `next-view-transitions` + **split-type**
- **Components:** Preloader · Footer · **Spotlight** · **Showreel** · **TeamCards** · **ClientReviews** · Button · Menu · Copy · **StorySlides** · **FeaturedWork** · CTACard

| Component | Block |
|---|---|
| **StorySlides** | 🟡 `story_slides` (slide tự chạy kiểu IG-stories, thanh index progress) — MỚI |
| **Showreel** | 🟡 `flip_showreel` (lặp march2026) |
| **TeamCards / FeaturedWork / ClientReviews** | 🟡 `card_showcase` (gộp) |
| **Spotlight** | 🟡 `spotlight` (đèn rọi theo chuột — mask radial) |
| Copy / CTACard | 🅰️ motion |
| Preloader · Menu · view-transitions | ⛔ TierC |

**Code lõi `story_slides`:** auto-advance `storyDuration 4000ms`; mỗi index có `.index-highlight` chạy `width/scaleX` (thanh tiến trình); chuyển slide có `contentUpdateDelay 0.4`, lock `isAnimating`. → block tự chạy (setInterval + GSAP), có prev/next + auto.

## 2025 · sept2025 — “negative-films” (Photography/Film — WebGL image)
- **URL:** https://cg-tpl-sept2025.vercel.app · **Vite** + GSAP + **split-type** + **Three** + **ukiyojs**(image transition) + html2canvas
- **JS:** clients · contact · culture · directors · film · **hover · parallax · pixelated-text · pixelated-video · scramble · slides · spotlight · split-element · shaders**

| Module | Block |
|---|---|
| **pixelated-text / pixelated-video** | 🟡 `pixel_reveal` (lộ ảnh/chữ qua pixelation — gần `hover_pixel_image` đã có) |
| **scramble** | 🔧 util `text-scramble` (lặp may2026) |
| **hover / parallax / spotlight / slides** | ✅/🟡 hover_*, parallax_hero, spotlight, slider |
| **shaders · ukiyojs · split-element** | ⛔ TierC (WebGL image transition) |
| clients/directors/culture/film | 🟡 card_showcase |

→ `pixel_reveal` (mở rộng hover_pixel_image), củng cố `text-scramble`, `spotlight`.

## 2025 · august2025 — “terrene” (Agency, no WebGL — block-rich)
- Next + GSAP + Lenis + view-transitions + **split-type**. Components: **FeaturedProjects · HowWeWork · Spotlight · Gallery · ClientReviews · CTAWindow · AnimatedButton · Copy · Nav · TopBar · MenuBtn**
- Block: FeaturedProjects/ClientReviews → 🟡 `card_showcase` · **HowWeWork** → 🟡 `process_steps` (MỚI — quy trình đánh số reveal) · Gallery → ✅ gallery_* · Spotlight → 🟡 `spotlight` (lặp) · Copy/CTAWindow → 🅰️ · Nav/Preloader/view-transitions → ⛔TierC

## 2025 · july2025 — vanilla (src đọc được)
- GSAP + Lenis. JS: about · **anime** · contact · home · menu · project · **slides** · transition · work
- Block: anime → 🅰️ mask-reveal · slides → 🟡 `slider` · work/project → 🟡 card_showcase · menu/transition → ⛔TierC

## 2025 · may2025 — vanilla (src đọc được)
- GSAP + Lenis. JS: about · contact · **featured-work** · footer · **hero** · menu · project · **services** · work
- Block: featured-work/work/project → 🟡 card_showcase · hero → 🟡/🅰️ · services → 🟡 process_steps/list · menu/transition → ⛔TierC

## 2025 · mar2025 — React+Vite (src 1 phần)
- GSAP. Readable data modules: **faqs · projects · reviews · workList** (index minified)
- Block: faqs → 🟡 `faq_accordion` · projects/workList → 🟡 card_showcase · reviews → 🟡 card_showcase

## 2025 · june2025 / apr2025 / feb2025 — ⚠️ CHỈ CÓ BẢN BUILD MINIFIED
- Source gốc không nằm trong gói (chỉ `.next`/out chunk hashed → không đọc cơ chế). Suy từ tiêu đề/cat + module đọc được:
  - **apr2025**: e-commerce (`products.js`, `useCartStore.js`) → card_showcase + cart (⛔TierC app) + articles
  - **june2025 / feb2025**: portfolio Next (page chunks) → hero + card_showcase + mask-reveal (suy đoán, cần xem live URL để xác minh)
- → 3 tháng này KHÔNG có spec code lõi; nếu cần, mở live `cg-tpl-*.vercel.app` xem DOM hoặc tìm bản src khác.

---

> ## ✅ Chốt 2025 (11 tháng). Block pattern bổ sung so với 2026:
> 🟡 `peel_reveal` · `story_slides` · `pixel_reveal` · `interactive_grid` · `faq_accordion` · `spotlight` · `dot_matrix` · `process_steps` · `slider`. Còn lại lặp `card_showcase` / `flip_showreel` / 🅰️ mask-reveal / Tier C (WebGL, cart, nav, preloader, transition). **3 tháng minified (jun/apr/feb) thiếu src.**

---

## 2024 (7 tháng) — Portfolio/Studio đời giữa (đơn giản hơn, ÍT/không WebGL)
Stack: vanilla **HTML/CSS/JS + GSAP + Lenis** (jan/feb/jun/jul) · **React×GSAP** (mar/apr/may — phần lớn build minified). Cấu trúc portfolio chuẩn → **map hết vào block đã có**.

| Tháng | Tên/loại | JS src | Section → block |
|---|---|---|---|
| july2024 | Creative Director (damien-tsarantos) | `script.js` | hero + work grid + about + contact → 🟡 card_showcase · 🅰️ mask-reveal · ⛔ menu/transition |
| june2024 | Web3/AI Studio | about·loader·menu·prices·projects·lenis | projects→card_showcase · prices→🟡 `pricing_table` · loader/menu→⛔TierC |
| may2024 | Portfolio (React×GSAP) | `items.js`(data) | work items → card_showcase (React build) |
| april2024 | Minimalist Portfolio (React) | minified | hero+work+about → card_showcase/mask-reveal (không src) |
| mar2024 | Portfolio (React×GSAP) | minified | như trên (không src) |
| feb2024 | SaaS | html/css | hero+features+pricing → 🟡 `pricing_table` + feature grid |
| jan2024 | Creative Studio | html/css | hero+work+about (CSS-only reveal) |

**Pattern mới 2024:** chỉ `pricing_table` (SaaS/web3). Còn lại lặp card_showcase + mask-reveal.

## 2023 (8 tháng) — Template đời đầu (portfolio/agency/SaaS/brutalist)
Stack: chủ yếu **vanilla `script.js`** hoặc **CRA React cơ bản**. Cơ chế đơn giản (GSAP reveal + smooth scroll + page transition).

| Tháng | Loại | JS src | Ghi chú block |
|---|---|---|---|
| dec2023 | Minimalist + **Video Gallery** | html/css | 🟡 `video_gallery` (lưới video showcase) — pattern mới nhẹ |
| nov2023 | SaaS | html/css | hero+features+`pricing_table` |
| october2023 | Creative Agency (React) | minified | card_showcase + mask-reveal |
| september2023 | Minimal Studio | `script.js` | hero+work+about |
| august2023 | **Brutalist** Portfolio | `script.js` | phong cách brutalist nhưng cơ chế chuẩn (reveal + hover) |
| july2023 | Creative Agency | html/css | card_showcase |
| june2023 | Portfolio (CRA React) | App·Home·Project·**transition** | route + page transition (⛔TierC) + work grid |
| may2023 | Portfolio | `script.js` | hero + work + smooth scroll (template gốc đầu tiên) |

**Pattern mới 2023:** `video_gallery` (dec). Còn lại lặp toàn bộ.

---

# 🎯 TỔNG KẾT MASTER — 31 tháng (2023→2026)

### A. Block ĐÃ BUILD (18) — xác nhận khớp nhiều tháng
`sticky_scroll_cards` (feb2026✓) · `marquee_band` (feb/dec…) · `image_trail` (may2026, +masked) · `flip_gallery`/`lightbox_flip` · `hover_reveal_list`/`hover_grid_reveal`/`hover_equalizer_heading`/`hover_pixel_image` · `parallax_hero` · `gallery_3d_depth`/`wheel_gallery`/`gallery_pan_lens` · `letter_slider` · `product_spec_sheet` · `svg_morph_overlay` · `image_explosion` · `seamless_scroll_gallery` · `text_displace_hero`.

### B. Block NÊN THÊM (ưu tiên theo tần suất)
1. 🅰️ **motion `mask-reveal`** (SplitText lines/words) — *xuất hiện gần như MỌI tháng*. Mở rộng motion system (Tier A), không phải block. **#1 ưu tiên.**
2. 🟡 **`card_showcase`** — lưới thẻ data-driven reveal (FeaturedProjects/Team/Clients/Work…) — ~15+ tháng. **#2.**
3. 🟡 **`slider`** / **`story_slides`** — carousel + slide tự chạy (index progress).
4. 🟡 **`flip_showreel`** — Flip morph layout theo scroll (march2026, oct2025).
5. 🟡 **`peel_reveal`** · **`scroll_word_reveal`** — pin + mask/word progress (dec2025, may2026).
6. 🟡 **`faq_accordion`** · **`accordion_media`** — accordion (nov2025, mar2025, may2026).
7. 🟡 **`process_steps`** · **`pricing_table`** · **`image_banner`** · **`video_gallery`** — section composite hay gặp.
8. 🟡 **`spotlight`** (đèn rọi mask radial) · **`pixel_reveal`** · **`interactive_grid`** · **`dot_matrix`** — hiệu ứng đặc thù.
9. 🔧 util: **`text-scramble`** · **`custom-cursor`** (dùng lại nhiều tháng).

### C. Tier C — KHÔNG thành block (làm code-template/app khi cần)
Preloader · Menu/Nav overlay · **page-transition** (next-transition-router / view-transitions / CRA transition) · **WebGL Three** (orb/skyline/fluid/particle/shader/bloom — rapier/cannon/matter/wrappedgl/ukiyojs) · audio toggle · shopping-cart (zustand).

### D. Ghi chú nguồn
- **Đọc được src đầy đủ:** toàn bộ 2026 (5), 2025 (aug/oct/sept/dec/nov), 2024 (jul/jun + data), 2023 (sept/aug/jun/may).
- **Chỉ bản build minified (không có cơ chế):** 2025 jun/apr/feb · 2024 mar/apr/may · 2023 oct. → nếu cần spec, mở live `cg-tpl-*.vercel.app` xem DOM.
- **Stack tiến hoá:** 2023 vanilla/CRA → 2024 vanilla+React → 2025/2026 Next15/16 + GSAP(ScrollTrigger/SplitText/Flip) + Lenis + Three (+ physics/shader cho “wow” WebGL).

> **Kết luận:** ~18 block đã build phủ phần lớn hiệu ứng tương tác. Bổ sung **mask-reveal (Tier A) + card_showcase + slider/story_slides + flip_showreel + peel/word reveal + faq/accordion** là đủ phủ ~80% nhu cầu 31 template. Phần “wow” WebGL (Three/shader/fluid) để code-template riêng, không nhồi vào block.
