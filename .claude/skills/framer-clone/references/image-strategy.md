# Image Strategy

Framer assets via `framerusercontent.com` work as prototype but ship gotchas: hotlinking, no SLA, CDN drift, lost ownership. Migrate strategically.

## Decision tree

```
Asset URL is on framerusercontent.com?
├─ Prototype / demo / quick clone     → keep URL as-is (CDN handles it)
├─ Production deploy on YOUR domain   → migrate to your CDN (next/image, S3, etc.)
└─ Integrate into existing host CMS   → upload via host's media library (see framer-clone-host)
```

## Path A standalone: `next/image` optimization

```tsx
import Image from 'next/image';

// Hero LCP image — eager, priority
<Image
  src="https://framerusercontent.com/images/abc.png"
  alt="Cyclist racing"
  width={1440}
  height={900}
  priority           // preload, no lazy
  fetchPriority="high"
  sizes="100vw"
/>

// Below-fold gallery
<Image
  src="..."
  alt="..."
  width={800}
  height={600}
  loading="lazy"
  sizes="(max-width: 810px) 100vw, 50vw"
/>
```

**Allow `framerusercontent.com` in `next.config.js`:**

```js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'framerusercontent.com' },
    ],
  },
};
```

## Migration to own CDN

Keep image URLs in code as a constant, easy to swap later:

```tsx
const IMAGES = {
  hero: 'https://cdn.yoursite.com/clones/perform/hero.jpg', // after migration
  // hero: 'https://framerusercontent.com/images/abc.png',  // before
};
```

Download + reupload:
```bash
curl -L "https://framerusercontent.com/images/abc.png" -o ./public/hero.jpg
# upload ./public/hero.jpg to your CDN, update URL
```

## LCP optimization rules

Hero image is the **LCP element** on most Framer landing pages. Targets:
- LCP < 2.5s on 3G Fast (Lighthouse)
- Image format: AVIF/WebP fallback to JPG. `next/image` auto-handles.
- Resolution: serve 2× density max (don't ship 4K image for a 700px container)
- `fetchpriority="high"` on hero → tells browser to prioritize over below-fold assets
- Inline critical CSS (Next.js does by default), defer non-critical font weights

## Common mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Hero `<img loading="lazy">` | LCP > 4s | Remove `lazy`, add `fetchPriority="high"` |
| Default `<img>` (no width/height) | CLS spike | Set explicit `width` + `height` or `aspect-ratio` |
| Same image at all viewports | Mobile wastes data (8MB hero on 4G) | `sizes` attribute + responsive srcset (auto via `next/image`) |
| `next/image` for hero animation | Image freezes mid-load | Use raw `<img>` if hero has scroll-zoom; `next/image` only for static |
| Self-host all framer images | Build > 100MB | Keep CDN; only mirror if hotlinking forbidden |

## Decorative vs informative

- Decorative (background pattern, divider line): `alt=""` + `role="presentation"`
- Informative (hero subject, product photo): descriptive `alt`

Framer auto-generates `alt="Cover"` and similar — replace with semantic alt text in clone.
