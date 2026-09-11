(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [931],
  {
    4261: function (e, t, a) {
      (Promise.resolve().then(a.bind(a, 7914)),
        Promise.resolve().then(a.bind(a, 3238)),
        Promise.resolve().then(a.bind(a, 4782)),
        Promise.resolve().then(a.bind(a, 6324)),
        Promise.resolve().then(a.bind(a, 6972)),
        Promise.resolve().then(a.bind(a, 5204)),
        Promise.resolve().then(a.bind(a, 6389)),
        Promise.resolve().then(a.bind(a, 5394)),
        Promise.resolve().then(a.bind(a, 3550)),
        Promise.resolve().then(a.bind(a, 2765)),
        Promise.resolve().then(a.bind(a, 1683)));
    },
    7914: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return m;
        },
      });
      var s = a(7437),
        r = a(3145),
        n = a(2345),
        i = a(999),
        l = a(960),
        o = a(2893),
        c = a(6046),
        d = a(313);
      function m() {
        let { t: e } = (0, l.b)(),
          t = (0, n.J)(),
          a = 'tel:'.concat(e.contact.phone.replace(/[^+\d]/g, '')),
          m = 'https://maps.google.com/?q='.concat(
            encodeURIComponent(e.footer.address)
          );
        return (0, s.jsxs)('section', {
          id: 'consultation',
          'aria-labelledby': 'consultation-title',
          className:
            'relative flex min-h-[100svh] snap-start flex-col overflow-x-hidden bg-charcoal-night px-5 pb-8 pt-20 text-ivory sm:px-8 sm:pb-10 sm:pt-24 md:px-12 md:pb-12 md:pt-28',
          children: [
            (0, s.jsx)('div', {
              'aria-hidden': !0,
              className: 'pointer-events-none absolute inset-0',
              children: (0, s.jsx)(r.default, {
                src: '/images/assets/heritage/silhouette2.png',
                alt: '',
                fill: !0,
                sizes: '100vw',
                className: 'scale-[1.04] object-cover object-center',
              }),
            }),
            (0, s.jsx)(i.E.div, {
              initial: !t && { opacity: 0, y: 28 },
              whileInView: t ? void 0 : { opacity: 1, y: 0 },
              viewport: { once: !0, amount: 0.35 },
              transition: { duration: 0.6, ease: o.VR },
              className:
                'relative z-10 mx-auto my-10 flex w-full max-w-[27.75rem] flex-1 items-center sm:my-12',
              children: (0, s.jsxs)('div', {
                className:
                  'w-full border border-ivory/30 bg-black/35 px-10 py-9 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:px-14 sm:py-10',
                children: [
                  (0, s.jsxs)('div', {
                    className: 'flex flex-col items-center text-center',
                    children: [
                      (0, s.jsx)(c.Z, { className: 'h-14 w-14 text-ivory/90' }),
                      (0, s.jsx)('h2', {
                        id: 'consultation-title',
                        className:
                          'mt-3 font-display text-[clamp(2.15rem,3.15vw,3.05rem)] leading-none tracking-[-0.035em] text-ivory',
                        children: e.contact.brand,
                      }),
                      (0, s.jsx)('p', {
                        className:
                          'mt-2 font-sans text-[0.52rem] uppercase tracking-[0.34em] text-ivory/75 sm:text-[0.58rem]',
                        children: e.contact.kicker,
                      }),
                    ],
                  }),
                  (0, s.jsxs)('form', {
                    onSubmit: function (e) {
                      e.preventDefault();
                    },
                    className: 'mt-10 flex flex-col gap-5',
                    children: [
                      (0, s.jsxs)('div', {
                        children: [
                          (0, s.jsx)('label', {
                            htmlFor: 'consultation-name',
                            className:
                              'mb-2 block font-display text-[0.76rem] text-ivory/90',
                            children: e.contact.labels.name,
                          }),
                          (0, s.jsx)('input', {
                            id: 'consultation-name',
                            type: 'text',
                            name: 'name',
                            autoComplete: 'name',
                            required: !0,
                            placeholder: e.contact.fields.name,
                            className:
                              'h-11 w-full bg-black/55 px-2 font-sans text-[0.72rem] text-ivory placeholder:text-ivory/45 focus:outline-none focus:ring-1 focus:ring-champagne-200',
                          }),
                        ],
                      }),
                      (0, s.jsxs)('div', {
                        children: [
                          (0, s.jsx)('label', {
                            htmlFor: 'consultation-contact',
                            className:
                              'mb-2 block font-display text-[0.76rem] text-ivory/90',
                            children: e.contact.labels.contact,
                          }),
                          (0, s.jsx)('input', {
                            id: 'consultation-contact',
                            type: 'text',
                            name: 'contact',
                            autoComplete: 'tel',
                            inputMode: 'tel',
                            required: !0,
                            placeholder: e.contact.fields.contact,
                            className:
                              'h-11 w-full bg-black/55 px-2 font-sans text-[0.72rem] text-ivory placeholder:text-ivory/45 focus:outline-none focus:ring-1 focus:ring-champagne-200',
                          }),
                        ],
                      }),
                      (0, s.jsxs)('button', {
                        type: 'submit',
                        className:
                          'mt-5 flex h-11 items-center justify-center gap-5 border border-ivory/50 bg-ivory/15 px-4 font-display text-[clamp(0.88rem,1.2vw,1.08rem)] text-ivory transition-colors hover:bg-ivory/25 focus-visible:ring-champagne-200',
                        children: [
                          (0, s.jsx)(d.Z, { size: 12 }),
                          e.contact.submit,
                          (0, s.jsx)(d.Z, { size: 12 }),
                        ],
                      }),
                    ],
                  }),
                  (0, s.jsx)('p', {
                    className:
                      'mt-3 text-center font-sans text-[0.54rem] leading-relaxed text-ivory/55',
                    children: e.contact.kicker,
                  }),
                ],
              }),
            }),
            (0, s.jsxs)('div', {
              className:
                'relative z-10 flex flex-col gap-6 border-t border-ivory/25 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8',
              children: [
                (0, s.jsxs)('div', {
                  className: 'flex flex-wrap items-center gap-3',
                  children: [
                    (0, s.jsxs)('a', {
                      href: m,
                      target: '_blank',
                      rel: 'noreferrer',
                      className:
                        'inline-flex h-11 items-center gap-4 border border-ivory/45 px-5 font-display text-[clamp(0.82rem,1.2vw,1.05rem)] text-ivory/90 transition-colors hover:bg-ivory/10',
                      children: [
                        (0, s.jsx)(d.Z, { size: 12 }),
                        e.contact.map,
                        (0, s.jsx)(d.Z, { size: 12 }),
                      ],
                    }),
                    (0, s.jsxs)('div', {
                      className: 'flex items-center gap-2',
                      'aria-hidden': !0,
                      children: [
                        (0, s.jsx)(u, { icon: 'facebook' }),
                        (0, s.jsx)(u, { icon: 'instagram' }),
                        (0, s.jsx)(u, { icon: 'whatsapp' }),
                      ],
                    }),
                  ],
                }),
                (0, s.jsxs)('div', {
                  className:
                    'flex flex-col items-start gap-2 sm:items-end sm:text-right',
                  children: [
                    (0, s.jsx)('a', {
                      href: a,
                      className:
                        'font-display text-[clamp(1.3rem,2.3vw,2.25rem)] leading-none tracking-[-0.025em] text-ivory/95 transition-colors hover:text-champagne-200',
                      children: e.contact.phone,
                    }),
                    (0, s.jsx)('a', {
                      href: 'mailto:'.concat(e.contact.email),
                      className:
                        'font-display text-[clamp(0.8rem,1vw,1rem)] leading-none text-ivory/85 transition-colors hover:text-champagne-200',
                      children: e.contact.email,
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      function u(e) {
        let { icon: t } = e;
        return (0, s.jsxs)('span', {
          className:
            'grid h-10 w-10 place-items-center rounded-full border border-ivory/35 text-ivory/90',
          children: [
            'facebook' === t &&
              (0, s.jsx)('span', {
                className: 'font-sans text-sm font-semibold',
                children: 'f',
              }),
            'instagram' === t &&
              (0, s.jsxs)('svg', {
                viewBox: '0 0 24 24',
                className: 'h-4 w-4',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: '1.6',
                'aria-hidden': !0,
                children: [
                  (0, s.jsx)('rect', {
                    x: '3.5',
                    y: '3.5',
                    width: '17',
                    height: '17',
                    rx: '4',
                  }),
                  (0, s.jsx)('circle', { cx: '12', cy: '12', r: '3.6' }),
                  (0, s.jsx)('circle', {
                    cx: '17.8',
                    cy: '6.3',
                    r: '0.8',
                    fill: 'currentColor',
                    stroke: 'none',
                  }),
                ],
              }),
            'whatsapp' === t &&
              (0, s.jsxs)('svg', {
                viewBox: '0 0 24 24',
                className: 'h-4 w-4',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: '1.45',
                'aria-hidden': !0,
                children: [
                  (0, s.jsx)('path', {
                    d: 'M19.6 4.5A10 10 0 0 0 4.1 16.6L3 21l4.5-1.2A10 10 0 1 0 19.6 4.5Z',
                  }),
                  (0, s.jsx)('path', {
                    d: 'M9 7.5c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.7c.7 1.3 1.7 2.3 3 3l.7-.6c.2-.2.5-.2.7-.1l1.8.8c.3.1.4.3.4.5v.6c0 .3-.1.5-.5.7-.6.3-1.5.4-3-.2-1.3-.5-3-1.8-4.3-4.1-.6-1.1-.9-2.1-.7-3.2Z',
                  }),
                ],
              }),
          ],
        });
      }
    },
    3238: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return m;
        },
      });
      var s = a(7437),
        r = a(2265),
        n = a(3145),
        i = a(2345),
        l = a(9694),
        o = a(6836),
        c = a(999);
      let d = [
        {
          image: '/images/assets/grace/stair-01.png',
          title: 'Effortless Grace',
          subtitle: 'Phong vị sống thương gia',
        },
        {
          image: '/images/assets/grace/stair-02.png',
          title: void 0,
          subtitle: 'Khi chuẩn x\xe1c trở th\xe0nh thước đo của cảm gi\xe1c',
        },
        {
          image: '/images/assets/grace/stair-04.png',
          title: void 0,
          subtitle: 'Phong c\xe1ch sống cũng cần một "hạng" tương xứng',
        },
      ];
      function m() {
        let e = (0, r.useRef)(null),
          t = (0, i.J)(),
          { scrollYProgress: a } = (0, l.v)({
            target: e,
            offset: ['start start', 'end end'],
          }),
          { scrollYProgress: n } = (0, l.v)({
            target: e,
            offset: ['start end', 'start start'],
          }),
          m = (0, o.H)(n, [0, 1], [0, 0.5]),
          h = (0, o.H)(a, [0.86, 0.9, 1], [0, 1, 1]);
        return (0, s.jsx)('section', {
          id: 'grace',
          ref: e,
          className: 'relative h-[300vh] snap-start bg-black text-ivory',
          children: (0, s.jsxs)('div', {
            className: 'sticky top-0 h-[100svh] overflow-hidden bg-black',
            children: [
              d.map((e, r) =>
                (0, s.jsx)(
                  u,
                  {
                    image: e.image,
                    index: r,
                    progress: a,
                    entranceProgress: n,
                    reducedMotion: t,
                  },
                  e.image
                )
              ),
              (0, s.jsx)(c.E.div, {
                'aria-hidden': !0,
                style: { opacity: t ? 0 : h },
                className: 'pointer-events-none absolute inset-0 z-10 bg-black',
              }),
              (0, s.jsx)(c.E.div, {
                'aria-hidden': !0,
                style: { opacity: t ? 0.5 : m },
                className: 'pointer-events-none absolute inset-0 z-30 bg-black',
              }),
              (0, s.jsx)('div', {
                className:
                  'relative z-40 flex h-full items-center justify-center px-6 text-center',
                children: d.map((e, r) =>
                  (0, s.jsx)(
                    p,
                    {
                      title: e.title,
                      subtitle: e.subtitle,
                      index: r,
                      progress: a,
                      reducedMotion: t,
                    },
                    e.image
                  )
                ),
              }),
            ],
          }),
        });
      }
      function u(e) {
        let {
            image: t,
            index: a,
            progress: r,
            entranceProgress: i,
            reducedMotion: l,
          } = e,
          m = a / d.length,
          u = (a + 1) / d.length,
          p = (0, o.H)(
            r,
            0 === a
              ? [0, u - 0.09, Math.min(1, u + 0.09)]
              : a === d.length - 1
                ? [Math.max(0, m - 0.09), m + 0.09, 1]
                : [Math.max(0, m - 0.09), m + 0.09, 0.6, 0.64],
            0 === a ? [1, 1, 0] : a === d.length - 1 ? [0, 1, 1] : [0, 1, 1, 0]
          ),
          h = (0, o.H)(i, [0, 1], [0.7, 1]),
          x = (0, o.H)(r, [0.9, 1], [1, 0.7]),
          v = (0, o.H)(r, [0.9, 1], ['0px', '18px']),
          g = a === d.length - 1;
        return (0, s.jsx)(c.E.div, {
          'aria-hidden': !0,
          style: {
            opacity: l ? (0 === a ? 1 : 0) : p,
            scale: l ? 1 : 0 === a ? h : g ? x : 1,
            borderRadius: g ? v : 0 === a ? '18px' : 0,
          },
          className: 'absolute inset-0 origin-center overflow-hidden '.concat(
            g ? 'z-20' : 'z-0'
          ),
          children: (0, s.jsx)(n.default, {
            src: t,
            alt: '',
            fill: !0,
            priority: 0 === a,
            sizes: '100vw',
            className: 'object-cover',
          }),
        });
      }
      function p(e) {
        let {
            title: t,
            subtitle: a,
            index: r,
            progress: n,
            reducedMotion: i,
          } = e,
          l = r / d.length,
          m = (r + 1) / d.length,
          u = l + 0.1,
          p = m - 0.1,
          h = 1 === r,
          x = (0, o.H)(n, h ? [l, u, 0.9, 1] : [l, u, p, m], [0, 1, 1, 0]),
          v = (0, o.H)(
            n,
            h ? [l, u, 0.82, 1] : [l, u, p, m],
            h
              ? [36, 0, -50, -50]
              : 2 === r
                ? [36, 21, 21, 36]
                : [0, -42, -42, 42]
          );
        return (0, s.jsxs)(c.E.div, {
          style: { opacity: i ? (0 === r ? 1 : 0) : x, y: i ? 0 : v },
          className: 'absolute flex max-w-[90vw] flex-col items-center',
          children: [
            t
              ? (0, s.jsx)('h2', {
                  className:
                    'font-display text-[clamp(4rem,9.4vw,10rem)] leading-[0.86] tracking-[-0.055em] text-ivory',
                  children: t,
                })
              : null,
            (0, s.jsx)('p', {
              className: t ? 'mt-10' : 'whitespace-nowrap',
              children: (0, s.jsx)('span', {
                className: t
                  ? 'font-display text-[clamp(1.1rem,1.8vw,2rem)] leading-none tracking-[0.01em] text-champagne-200'
                  : 'font-display text-5xl leading-none tracking-[0.01em] text-champagne-200',
                children: a,
              }),
            }),
          ],
        });
      }
    },
    4782: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return _;
        },
      });
      var s = a(7437),
        r = a(2265),
        n = a(3145),
        i = a(6836),
        l = a(999),
        o = a(9694),
        c = a(2345),
        d = a(960),
        m = a(5284),
        u = a(313),
        p = a(5074);
      let h = '/images/assets/units/townhouse-hero.png',
        x = [
          {
            id: 'morning',
            images: [
              { src: '/images/assets/day-experience/morning-01.jpg' },
              { src: '/images/assets/day-experience/morning-02.jpg' },
            ],
          },
          {
            id: 'noon',
            images: [
              { src: '/images/assets/day-experience/noon-01.jpg' },
              { src: '/images/assets/day-experience/noon-02.jpg' },
            ],
          },
          {
            id: 'afternoon',
            images: [
              { src: '/images/assets/day-experience/afternoon-02.png' },
              { src: '/images/assets/day-experience/afternoon-01.jpg' },
            ],
          },
          {
            id: 'evening',
            images: [
              { src: '/images/assets/day-experience/evening-01.png' },
              { src: '/images/assets/day-experience/evening-02.jpg' },
            ],
          },
        ],
        v = x.slice(0, -1),
        g = x[x.length - 1],
        f = [
          { entryStart: 0.27, holdStart: 0.33, holdEnd: 0.42, exitEnd: 0.47 },
          { entryStart: 0.437, holdStart: 0.497, holdEnd: 0.62, exitEnd: 0.67 },
          { entryStart: 0.637, holdStart: 0.697, holdEnd: 0.8, exitEnd: 0.84 },
        ],
        b = {
          entryStart: 0.813,
          holdStart: 0.863,
          holdEnd: 0.93,
          exitEnd: 0.95,
        },
        y = { revealStart: 0.93, settleStart: 0.95, holdEnd: 1 };
      function w(e) {
        let { phase: t, index: a, label: r, scrollYProgress: o } = e,
          {
            range: c,
            xRange: d,
            opacityRange: m,
          } = (function (e) {
            let t = f[e];
            if (!t)
              throw Error(
                'Missing Gallery phase timeline for phase '.concat(e)
              );
            return {
              range: [t.entryStart, t.holdStart, t.holdEnd, t.exitEnd],
              xRange: ['100vw', '0vw', '0vw', '-100vw'],
              opacityRange: [0, 1, 1, 0],
            };
          })(a),
          u = (0, i.H)(o, c, d),
          p = (0, i.H)(o, c, m);
        return (0, s.jsxs)(l.E.section, {
          'aria-label': r,
          style: { x: u, opacity: p },
          className:
            'pointer-events-none absolute inset-0 z-30 flex items-center will-change-transform',
          children: [
            (0, s.jsx)('div', {
              className: 'relative h-full w-full shrink-0',
              children: t.images.map((e, a) =>
                (0, s.jsx)(
                  'div',
                  {
                    className:
                      0 === a
                        ? 'absolute bottom-[5svh] left-[2vw] h-[81svh] aspect-square overflow-hidden max-md:bottom-[10svh] max-md:left-[4vw] max-md:h-[76svh]'
                        : 'absolute right-[5vw] bottom-[5svh] h-[40svh] aspect-video overflow-hidden max-md:right-[4vw] max-md:bottom-[10svh] max-md:h-[32svh]',
                    children: (0, s.jsx)(n.default, {
                      src: e.src,
                      alt: ''.concat(r, ', ').concat(a + 1),
                      fill: !0,
                      sizes:
                        0 === a
                          ? '(max-width: 768px) 76vw, 81vw'
                          : '(max-width: 768px) 57vw, 36vw',
                      priority: 'morning' === t.id,
                      className: 'object-cover',
                      style: { objectPosition: e.objectPosition },
                    }),
                  },
                  e.src
                )
              ),
            }),
            (0, s.jsx)(l.E.p, {
              style: { opacity: p },
              className:
                'absolute bottom-[11svh] left-[4vw] z-10 font-display text-[clamp(2.5rem,5vw,5.8rem)] leading-none tracking-[-0.04em] text-ivory [text-shadow:0_3px_24px_rgb(0_0_0_/_0.42)] max-md:bottom-[16svh] max-md:left-[7vw]',
              children: r,
            }),
          ],
        });
      }
      function j(e) {
        let { phase: t, label: a, scrollYProgress: r } = e,
          { entryStart: o, holdStart: c, holdEnd: d, exitEnd: m } = b,
          u = (0, i.H)(r, [o, c, d, m], ['100vw', '0vw', '0vw', '-100vw']),
          p = (0, i.H)(r, [o, c, d, m], [0, 1, 1, 0]),
          h = t.images[1];
        return (0, s.jsx)(l.E.section, {
          'aria-label': a,
          style: { x: u, opacity: p },
          className:
            'pointer-events-none absolute inset-0 z-30 will-change-transform',
          children: (0, s.jsxs)('div', {
            className:
              'absolute right-[5vw] bottom-[5svh] h-[53svh] aspect-video overflow-hidden max-md:right-[4vw] max-md:bottom-[10svh] max-md:h-[37svh]',
            children: [
              (0, s.jsx)(n.default, {
                src: h.src,
                alt: ''.concat(a, ', 1'),
                fill: !0,
                sizes: '(max-width: 768px) 66vw, 48vw',
                className: 'object-cover',
                style: { objectPosition: h.objectPosition },
              }),
              (0, s.jsx)('p', {
                className:
                  'absolute bottom-[8%] left-[6%] z-10 font-display text-[clamp(2.5rem,5vw,5.8rem)] leading-none tracking-[-0.04em] text-ivory [text-shadow:0_3px_24px_rgb(0_0_0_/_0.42)]',
                children: a,
              }),
            ],
          }),
        });
      }
      function N(e) {
        let { phase: t, scrollYProgress: a } = e,
          { revealStart: r, settleStart: o, holdEnd: c } = y,
          d = (0, i.H)(a, [r, o, c], ['100vw', '0vw', '0vw']),
          m = t.images[0];
        return (0, s.jsxs)(l.E.div, {
          'aria-label': 'Evening finale',
          style: { x: d },
          className:
            'pointer-events-none absolute inset-0 z-30 overflow-hidden will-change-transform',
          children: [
            (0, s.jsx)(n.default, {
              src: m.src,
              alt: '',
              fill: !0,
              sizes: '100vw',
              className: 'object-cover',
              style: { objectPosition: m.objectPosition },
            }),
            (0, s.jsx)('div', {
              'aria-hidden': !0,
              className:
                'absolute inset-0 bg-gradient-to-t from-charcoal-950/50 via-transparent to-charcoal-950/15',
            }),
          ],
        });
      }
      function k() {
        let { t: e } = (0, d.b)(),
          t = (0, r.useRef)(null),
          { scrollYProgress: a } = (0, o.v)({
            target: t,
            offset: ['start start', 'end end'],
          }),
          c = (0, i.H)(a, [0, 0.05, 0.17, 0.27], [0, 1, 1, 0]),
          m = (0, i.H)(a, [0, 0.05, 0.17, 0.27], [24, 0, 0, -18]),
          x = (0, i.H)(
            a,
            [0, 0.05, 0.17, 0.27],
            ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(4px)']
          ),
          f = (0, i.H)(a, [0, 0.05, 0.17, 0.27], [1, 0.72, 0.58, 0]);
        return (0, s.jsx)('section', {
          id: 'gallery',
          ref: t,
          'aria-label': e.gallery.ariaLabel,
          className: 'relative snap-start bg-charcoal-950',
          style: { height: '520vh' },
          children: (0, s.jsxs)('div', {
            className: 'sticky top-0 h-[100svh] min-h-[620px] overflow-hidden',
            children: [
              (0, s.jsxs)('div', {
                className: 'absolute inset-0',
                children: [
                  (0, s.jsx)(n.default, {
                    src: h,
                    alt: '',
                    fill: !0,
                    sizes: '100vw',
                    className: 'object-cover',
                  }),
                  (0, s.jsx)(p.Z, {
                    src: '/videos/grace-scroll.mp4',
                    poster: h,
                    targetRef: t,
                    scrollYProgress: a,
                    getTime: (e, t) => e * t,
                    enabled: !0,
                    diagnosticLabel: 'gallery',
                    rootMargin: '100% 0px',
                    className:
                      'pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                  }),
                  (0, s.jsx)('div', {
                    'aria-hidden': !0,
                    className:
                      'absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/50 to-charcoal-950/35',
                  }),
                  (0, s.jsx)(l.E.div, {
                    'aria-hidden': !0,
                    style: { opacity: f },
                    className: 'absolute inset-0 z-10 bg-black',
                  }),
                ],
              }),
              (0, s.jsxs)('div', {
                className:
                  'pointer-events-none absolute inset-x-0 top-[54%] z-20 flex items-center',
                children: [
                  (0, s.jsx)('div', {
                    className: 'h-px flex-1 bg-champagne-100/20',
                  }),
                  (0, s.jsx)(u.Z, {
                    size: 18,
                    className: 'mx-4 text-champagne-300',
                  }),
                  (0, s.jsx)('div', {
                    className: 'h-px flex-1 bg-champagne-100/20',
                  }),
                ],
              }),
              v.map((t, r) =>
                (0, s.jsx)(
                  w,
                  {
                    phase: t,
                    index: r,
                    label: e.gallery.phases[t.id],
                    scrollYProgress: a,
                  },
                  t.id
                )
              ),
              (0, s.jsx)(j, {
                phase: g,
                label: e.gallery.phases.evening,
                scrollYProgress: a,
              }),
              (0, s.jsx)(N, { phase: g, scrollYProgress: a }),
              (0, s.jsx)(l.E.p, {
                style: { opacity: c, y: m, filter: x },
                className:
                  'pointer-events-none absolute top-[65%] left-[10vw] z-50 max-w-[min(82vw,48rem)] px-2 font-display text-[clamp(1.8rem,3.2vw,3.2rem)] leading-[1.2] tracking-[-0.025em] whitespace-pre-line text-left text-ivory [text-shadow:0_3px_24px_rgb(0_0_0_/_0.35)]',
                children: e.gallery.intro,
              }),
            ],
          }),
        });
      }
      function E() {
        let { t: e } = (0, d.b)();
        return (0, s.jsxs)('section', {
          id: 'gallery',
          'aria-label': e.gallery.ariaLabel,
          className: 'snap-start bg-charcoal-950',
          children: [
            (0, s.jsxs)('div', {
              className:
                'relative overflow-hidden px-6 py-20 sm:px-10 md:px-16',
              children: [
                (0, s.jsx)(n.default, {
                  src: h,
                  alt: '',
                  fill: !0,
                  sizes: '100vw',
                  className: 'object-cover opacity-30',
                }),
                (0, s.jsx)('div', {
                  'aria-hidden': !0,
                  className: 'absolute inset-0 bg-charcoal-950/65',
                }),
                (0, s.jsx)('p', {
                  className:
                    'relative z-10 max-w-[min(82vw,48rem)] font-display text-[clamp(1.8rem,3.2vw,3.2rem)] leading-[1.2] tracking-[-0.025em] whitespace-pre-line text-ivory',
                  children: e.gallery.intro,
                }),
              ],
            }),
            (0, s.jsxs)('div', {
              className: 'space-y-20 px-6 py-16 sm:px-10 md:px-16',
              children: [
                v.map(t => {
                  let a = e.gallery.phases[t.id];
                  return (0, s.jsxs)(
                    'section',
                    {
                      'aria-label': a,
                      children: [
                        (0, s.jsx)('h2', {
                          className:
                            'mb-8 font-display text-[clamp(2.3rem,5vw,4.5rem)] leading-none tracking-[-0.04em] text-ivory',
                          children: a,
                        }),
                        (0, s.jsx)('div', {
                          className: 'grid gap-5 md:grid-cols-2',
                          children: t.images.map((e, t) =>
                            (0, s.jsx)(
                              'div',
                              {
                                className:
                                  'relative aspect-[4/3] overflow-hidden',
                                children: (0, s.jsx)(n.default, {
                                  src: e.src,
                                  alt: ''.concat(a, ', ').concat(t + 1),
                                  fill: !0,
                                  sizes: '(max-width: 768px) 100vw, 50vw',
                                  className: 'object-cover',
                                  style: { objectPosition: e.objectPosition },
                                }),
                              },
                              e.src
                            )
                          ),
                        }),
                      ],
                    },
                    t.id
                  );
                }),
                (0, s.jsxs)('section', {
                  'aria-label': e.gallery.phases.evening,
                  children: [
                    (0, s.jsx)('h2', {
                      className:
                        'mb-8 font-display text-[clamp(2.3rem,5vw,4.5rem)] leading-none tracking-[-0.04em] text-ivory',
                      children: e.gallery.phases.evening,
                    }),
                    (0, s.jsx)('div', {
                      className: 'relative aspect-video overflow-hidden',
                      children: (0, s.jsx)(n.default, {
                        src: g.images[1].src,
                        alt: ''.concat(e.gallery.phases.evening, ', 1'),
                        fill: !0,
                        sizes: '(max-width: 768px) 100vw, 80vw',
                        className: 'object-cover',
                        style: { objectPosition: g.images[1].objectPosition },
                      }),
                    }),
                    (0, s.jsx)('div', {
                      className: 'relative mt-5 aspect-[16/7] overflow-hidden',
                      children: (0, s.jsx)(n.default, {
                        src: g.images[0].src,
                        alt: ''.concat(e.gallery.phases.evening, ', 2'),
                        fill: !0,
                        sizes: '100vw',
                        className: 'object-cover',
                        style: { objectPosition: g.images[0].objectPosition },
                      }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      function _() {
        let e = (0, c.J)();
        return (
          (0, r.useEffect)(() => {
            if (e) {
              (0, m.$)({
                event: 'mode-static-reduced-motion',
                label: 'gallery',
                phase: 'static-reduced-motion',
                attempt: 0,
                isEligible: !1,
                visibility: document.visibilityState,
              });
              return;
            }
          }, [e]),
          e ? (0, s.jsx)(E, {}) : (0, s.jsx)(k, {})
        );
      }
    },
    6324: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return p;
        },
      });
      var s = a(7437),
        r = a(2265),
        n = a(2345),
        i = a(9694),
        l = a(6836),
        o = a(999),
        c = a(960),
        d = a(8530),
        m = a(2893),
        u = a(6776);
      function p() {
        var e, t, a;
        let { t: p } = (0, c.b)(),
          h = d.P.heritage,
          x = p.heritage.taglines,
          v = (0, r.useRef)(null),
          g = (0, n.J)(),
          { scrollYProgress: f } = (0, i.v)({
            target: v,
            offset: ['start start', 'end end'],
          }),
          b =
            null !==
              (t =
                null === (e = x[0]) || void 0 === e ? void 0 : e.split(' ')) &&
            void 0 !== t
              ? t
              : [],
          y = b.slice(0, 5).join(' '),
          w = b.slice(5).join(' '),
          j = null !== (a = x[1]) && void 0 !== a ? a : '',
          N = (0, l.H)(
            f,
            [0, 0.35, 0.62, 0.88],
            ['80vw', '0vw', '0vw', '-80vw']
          ),
          k = (0, l.H)(
            f,
            [0, 0.35, 0.62, 0.88],
            ['-80vw', '0vw', '0vw', '80vw']
          ),
          E = (0, l.H)(f, [0, 0.26, 0.66, 0.88], [0, 1, 1, 0]),
          _ = (0, l.H)(f, [0.72, 0.96], ['24vh', '0vh']),
          M = (0, l.H)(f, [0.74, 0.96], [0, 1]);
        return (0, s.jsx)('section', {
          id: 'heritage',
          ref: v,
          className: 'relative min-h-[100svh] snap-start bg-charcoal-950',
          style: { height: '260vh' },
          'aria-labelledby': 'heritage-title',
          children: (0, s.jsxs)('div', {
            className: 'sticky top-0 h-[100svh] min-h-[620px] overflow-hidden',
            children: [
              (0, s.jsx)(u.Z, {
                src: h.src,
                alt: h.alt,
                tone: h.tone,
                depth: m.UQ.subtle,
                scrim: !1,
                layerClassName: 'scale-[1.04]',
                imageClassName: 'object-cover object-[50%_48%]',
              }),
              (0, s.jsx)('div', {
                'aria-hidden': !0,
                className:
                  'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_34%,rgba(255,226,170,0.38),transparent_34%),linear-gradient(90deg,rgba(245,205,141,0.18),transparent_28%,rgba(11,9,8,0.1)_72%,rgba(11,9,8,0.42)),linear-gradient(180deg,rgba(11,9,8,0.08),transparent_42%,rgba(11,9,8,0.58))]',
              }),
              (0, s.jsx)('div', {
                'aria-hidden': !0,
                className:
                  'pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay',
                style: {
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.7'/></svg>\")",
                },
              }),
              (0, s.jsxs)(o.E.div, {
                initial: 'hidden',
                whileInView: 'visible',
                viewport: m.d1,
                variants: (0, m.EY)(0.18, 0.1),
                className:
                  'absolute inset-x-0 top-[37.5%] z-10 flex flex-col items-center px-5 text-center sm:px-8',
                children: [
                  (0, s.jsx)(o.E.p, {
                    id: 'heritage-title',
                    variants: m.pB,
                    className:
                      'font-display text-[clamp(1.08rem,1.72vw,2.16rem)] leading-none text-ivory drop-shadow-[0_2px_14px_rgba(0,0,0,0.22)]',
                    children: p.heritage.brand,
                  }),
                  (0, s.jsx)(o.E.div, {
                    variants: m.pB,
                    transition: { duration: 0.9, ease: m.VR },
                    className:
                      'relative mt-9 flex min-h-[13rem] w-full max-w-[81rem] items-start justify-center overflow-hidden md:min-h-[17rem]',
                    children: g
                      ? (0, s.jsxs)('div', {
                          className:
                            'max-w-[22ch] whitespace-normal font-display text-[clamp(2.52rem,4.68vw,6.32rem)] leading-[0.98] tracking-[-0.018em] text-ivory drop-shadow-[0_3px_22px_rgba(0,0,0,0.22)]',
                          children: [
                            (0, s.jsx)('p', { children: x[0] }),
                            j &&
                              (0, s.jsx)('p', {
                                className: 'mt-6 whitespace-nowrap',
                                children: j,
                              }),
                          ],
                        })
                      : (0, s.jsxs)(s.Fragment, {
                          children: [
                            (0, s.jsxs)(o.E.div, {
                              style: { opacity: E },
                              className:
                                'absolute w-full max-w-[22ch] whitespace-normal font-display text-[clamp(2.52rem,4.68vw,6.32rem)] leading-[0.98] tracking-[-0.018em] text-ivory drop-shadow-[0_3px_22px_rgba(0,0,0,0.22)]',
                              'aria-hidden': !0,
                              children: [
                                (0, s.jsx)(o.E.span, {
                                  style: { x: N },
                                  className: 'block',
                                  children: y,
                                }),
                                (0, s.jsx)(o.E.span, {
                                  style: { x: k },
                                  className: 'block',
                                  children: w,
                                }),
                              ],
                            }),
                            j &&
                              (0, s.jsx)(o.E.p, {
                                style: { y: _, opacity: M },
                                className:
                                  'absolute whitespace-nowrap font-display text-[clamp(2.52rem,4.68vw,6.32rem)] leading-[0.98] tracking-[-0.018em] text-ivory drop-shadow-[0_3px_22px_rgba(0,0,0,0.22)]',
                                'aria-hidden': !0,
                                children: j,
                              }),
                            (0, s.jsx)('span', {
                              className: 'sr-only',
                              children: x.join('. '),
                            }),
                          ],
                        }),
                  }),
                ],
              }),
            ],
          }),
        });
      }
    },
    6972: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return y;
        },
      });
      var s = a(7437),
        r = a(2265),
        n = a(5284),
        i = a(999),
        l = a(9694),
        o = a(2934),
        c = a(2345),
        d = a(960),
        m = a(8530),
        u = a(2893),
        p = a(6776),
        h = a(1906),
        x = a(1854);
      function v(e) {
        let { size: t = 520 } = e,
          a = (0, c.J)(),
          [n, l] = (0, r.useState)(!1),
          o = (0, h.c)(-9999),
          d = (0, h.c)(-9999),
          m = (0, x.q)(o, { stiffness: 90, damping: 22, mass: 0.6 }),
          u = (0, x.q)(d, { stiffness: 90, damping: 22, mass: 0.6 });
        return ((0, r.useEffect)(() => {
          if (
            a ||
            !window.matchMedia('(hover: hover) and (pointer: fine)').matches
          )
            return;
          l(!0);
          let e = e => {
            (o.set(e.clientX), d.set(e.clientY));
          };
          return (
            window.addEventListener('pointermove', e, { passive: !0 }),
            () => window.removeEventListener('pointermove', e)
          );
        }, [a, o, d]),
        n)
          ? (0, s.jsx)(i.E.div, {
              'aria-hidden': !0,
              className:
                'pointer-events-none fixed z-[1] rounded-full mix-blend-soft-light blur-3xl',
              style: {
                x: m,
                y: u,
                width: t,
                height: t,
                marginLeft: -t / 2,
                marginTop: -t / 2,
                background:
                  'radial-gradient(circle, rgba(224,160,64,0.5) 0%, rgba(200,129,31,0.22) 40%, transparent 70%)',
              },
            })
          : null;
      }
      var g = a(5074);
      function f() {
        let { t: e } = (0, d.b)(),
          t = m.P.hero;
        return (
          (0, r.useEffect)(() => {
            (0, n.$)({
              event: 'mode-static-reduced-motion',
              label: 'hero',
              phase: 'static-reduced-motion',
              attempt: 0,
              isEligible: !1,
              visibility: document.visibilityState,
            });
          }, []),
          (0, s.jsxs)(i.E.section, {
            id: 'top',
            whileInView: u.Fv,
            viewport: u.gT,
            transition: u.V1,
            className:
              'relative h-[100svh] min-h-[620px] snap-start overflow-hidden',
            children: [
              (0, s.jsx)(p.Z, {
                src: t.src,
                alt: t.alt,
                tone: t.tone,
                depth: 0,
                priority: !0,
                scrim: !1,
                layerClassName: 'scale-100',
              }),
              m.siteConfig.cursorGlow && (0, s.jsx)(v, {}),
              (0, s.jsx)(i.E.p, {
                initial: { opacity: 0, y: 16 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 1.4, delay: 1.1, ease: u.VR },
                className:
                  'pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 text-center font-display text-[clamp(2.7rem,5.4vw,4.95rem)] leading-none tracking-[-0.005em] text-ivory/85',
                children: e.hero.tagline,
              }),
            ],
          })
        );
      }
      function b(e) {
        var t;
        let { onComplete: a } = e,
          n = m.P.hero,
          i = (0, r.useRef)(null),
          { scrollYProgress: c } = (0, l.v)({
            target: i,
            offset: ['start start', 'end end'],
          });
        return (
          (0, o.W)(c, 'change', e => {
            e >= 0.8 && a();
          }),
          (0, s.jsx)('section', {
            id: 'top',
            ref: i,
            className: 'relative h-[260svh] snap-start bg-charcoal-950',
            'aria-label': 'The Magnolia opening film',
            children: (0, s.jsxs)('div', {
              className:
                'sticky top-0 h-[100svh] min-h-[620px] overflow-hidden',
              children: [
                (0, s.jsx)(p.Z, {
                  src: n.src,
                  alt: n.alt,
                  tone: n.tone,
                  depth: 0,
                  priority: !0,
                  scrim: !1,
                  layerClassName: 'scale-100',
                }),
                (0, s.jsx)('div', {
                  className: 'absolute inset-0 z-10',
                  children: (0, s.jsx)(g.Z, {
                    src: '/videos/hero/FULL_0409.mp4',
                    poster: null !== (t = n.src) && void 0 !== t ? t : '',
                    targetRef: i,
                    scrollYProgress: c,
                    getTime: (e, t) => Math.min(1, Math.max(0, e) / 0.8) * t,
                    enabled: !0,
                    diagnosticLabel: 'hero',
                    activateImmediately: !0,
                    className:
                      'pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                  }),
                }),
                m.siteConfig.cursorGlow && (0, s.jsx)(v, {}),
              ],
            }),
          })
        );
      }
      function y() {
        let e = (0, c.J)(),
          [t, a] = (0, r.useState)(!1);
        return e
          ? (0, s.jsx)(f, {})
          : t
            ? (0, s.jsx)(f, {})
            : (0, s.jsx)(b, {
                onComplete: () => {
                  (a(!0),
                    window.requestAnimationFrame(() => window.scrollTo(0, 0)));
                },
              });
      }
    },
    5204: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return g;
        },
      });
      var s = a(7437),
        r = a(2265),
        n = a(2345),
        i = a(6836),
        l = a(999),
        o = a(2934),
        c = a(9694),
        d = a(960);
      let m = [
          {
            src: '/images/assets/horizontal-slide/slide-1.jpg',
            alt: 'The Place',
            amenityIndex: 0,
            tourUrl:
              'https://themagnolia360.vistax.vn/?s=pano10&/tong-the-01.html',
          },
          {
            src: '/images/assets/horizontal-slide/slide-2.jpg',
            alt: 'The Private Arrival',
            amenityIndex: 1,
            tourUrl:
              'https://themagnolia360.vistax.vn/?s=pano33273&/sanh-don-tiep-pavillion.html',
          },
          {
            src: '/images/assets/horizontal-slide/slide-3.jpg',
            alt: 'The Pavilion Lobby',
            amenityIndex: 2,
            tourUrl:
              'https://themagnolia360.vistax.vn/?s=pano36996&/sanh-don-tiep-pavillion.html',
          },
          {
            src: '/images/assets/horizontal-slide/slide-4.jpg',
            alt: 'The Car Gallery',
            amenityIndex: 3,
            tourUrl:
              'https://themagnolia360.vistax.vn/?s=pano36994&/khu-trung-bay-sieu-xe-tang-b1.html',
          },
          {
            src: '/images/assets/horizontal-slide/slide-5.jpg',
            alt: 'The Vertical Garden',
            amenityIndex: 4,
            tourUrl:
              'https://themagnolia360.vistax.vn/?s=pano36997&/vuon-rieng-tang-5.html',
          },
        ],
        u = '3rem';
      function p(e) {
        let t = m.length - 1,
          a = 0.86 / t,
          s = e * a,
          r = Math.min(0.86, (e + 1) * a),
          n = Math.min(0.86, Math.max(0, (e - 1) * a) + 0.055),
          i = Math.min(0.86, s + 0.055);
        return 0 === e
          ? { range: [0, i, r], xRange: ['0%', '0%', '-100%'] }
          : e === t
            ? { range: [n, s, 0.86], xRange: ['100%', '0%', '0%'] }
            : { range: [n, s, i, r], xRange: ['100%', '0%', '0%', '-100%'] };
      }
      function h(e) {
        let { slide: t, index: a, title: r, scrollYProgress: o } = e,
          c = (0, n.J)(),
          { range: d, xRange: u } = p(a),
          {
            range: h,
            xRange: x,
            yRange: v,
            scaleRange: g,
          } = (function (e) {
            let { range: t } = p(e),
              a = m.length - 1;
            return 0 === e
              ? {
                  range: t,
                  xRange: ['0%', '0%', '2.4%'],
                  yRange: ['0%', '0%', '-1.2%'],
                  scaleRange: [1.05, 1.05, 1.065],
                }
              : e === a
                ? {
                    range: t,
                    xRange: ['-2.4%', '0%', '0%'],
                    yRange: ['1.2%', '0%', '0%'],
                    scaleRange: [1.065, 1.05, 1.05],
                  }
                : {
                    range: t,
                    xRange: ['-2.4%', '0%', '0%', '2.4%'],
                    yRange: ['1.2%', '0%', '0%', '-1.2%'],
                    scaleRange: [1.065, 1.05, 1.05, 1.065],
                  };
          })(a),
          f = (0, i.H)(o, d, u),
          b = (0, i.H)(o, h, x),
          y = (0, i.H)(o, h, v),
          w = (0, i.H)(o, h, g);
        return (0, s.jsxs)(l.E.div, {
          style: { x: f, zIndex: a + 1 },
          className: 'absolute inset-0 overflow-hidden will-change-transform',
          children: [
            (0, s.jsx)(l.E.div, {
              style: c ? void 0 : { x: b, y: y, scale: w },
              className: 'absolute inset-0 h-full w-full will-change-transform',
              children: (0, s.jsx)('img', {
                src: t.src,
                alt: r,
                loading: 0 === a ? 'eager' : 'lazy',
                decoding: 'async',
                fetchPriority: 0 === a ? 'high' : 'auto',
                className: 'h-full w-full object-cover',
              }),
            }),
            (0, s.jsx)('div', {
              'aria-hidden': !0,
              className:
                'absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-charcoal-950/10 to-charcoal-950/20',
            }),
          ],
        });
      }
      function x(e) {
        let { index: t, title: a, scrollYProgress: r } = e,
          {
            titleRange: n,
            titleYRange: o,
            opacityRange: c,
          } = (function (e) {
            let t = m.length - 1,
              a = (function (e) {
                let t = m.length - 1,
                  a = Math.max(0, ((e - 1) / t) * 0.86),
                  s = Math.min(0.86, ((e + 1) / t) * 0.86);
                return 0 === e
                  ? [0, s]
                  : e === t
                    ? [a, 0.86]
                    : [a, (e / t) * 0.86, s];
              })(e),
              s = 0 === e,
              r = e === t;
            return {
              titleRange: s
                ? [a[0], 0.72 * a[1]]
                : r
                  ? [a[0], a[1]]
                  : [a[0], a[1], a[1] + (a[2] - a[1]) * 0.68],
              titleYRange: s
                ? ['0rem', '-'.concat(u)]
                : r
                  ? [u, '0rem']
                  : [u, '0rem', '-'.concat(u)],
              opacityRange: s ? [1, 0] : r ? [0, 1] : [0, 1, 0],
            };
          })(t),
          d = (0, i.H)(r, n, o),
          p = (0, i.H)(r, n, c),
          h = (0, i.H)(p, e => (e <= 0.01 ? 'hidden' : 'visible'));
        return (0, s.jsxs)('div', {
          className: 'absolute left-0 top-0 origin-bottom',
          children: [
            (0, s.jsx)(l.E.p, {
              style: { opacity: p, visibility: h },
              className:
                'font-display text-[clamp(1.2rem,1.6vw,2.08rem)] leading-none text-ivory/90 drop-shadow-[0_2px_14px_rgba(0,0,0,0.42)]',
              children: String(t + 1).padStart(2, '0'),
            }),
            (0, s.jsx)(l.E.h2, {
              style: { opacity: p, y: d, visibility: h },
              className:
                'mt-7 origin-bottom whitespace-nowrap font-display text-[clamp(2.96rem,5.84vw,6.56rem)] leading-[0.9] tracking-[-0.04em] text-ivory drop-shadow-[0_3px_18px_rgba(0,0,0,0.42)] will-change-transform',
              children: a,
            }),
            (0, s.jsx)(l.E.div, {
              'aria-hidden': !0,
              style: { opacity: p, visibility: h },
              className:
                'mt-12 h-[3px] w-full max-w-[53rem] bg-ivory/85 shadow-[0_1px_8px_rgba(0,0,0,0.18)]',
            }),
          ],
        });
      }
      function v(e) {
        var t, a, n;
        let { scrollYProgress: i, items: l, exploreLabel: c } = e,
          [d, u] = (0, r.useState)(0);
        (0, o.W)(i, 'change', e => {
          let t = 0.86 / (m.length - 1);
          u(Math.min(m.length - 1, Math.max(0, Math.round(e / t))));
        });
        let p = null === (t = l[d]) || void 0 === t ? void 0 : t.slide.tourUrl;
        return (0, s.jsxs)('div', {
          className:
            'absolute inset-x-5 bottom-9 z-20 max-w-[92rem] sm:inset-x-8 md:left-12 md:right-auto md:bottom-16 md:w-[min(86vw,64rem)]',
          children: [
            (0, s.jsx)('div', {
              className:
                'relative h-[clamp(8rem,12.5vw,13rem)] overflow-visible [perspective:900px]',
              children: l.map((e, t) => {
                let { slide: a, title: r } = e;
                return (0, s.jsx)(
                  x,
                  { index: t, title: r, scrollYProgress: i },
                  a.src
                );
              }),
            }),
            (0, s.jsxs)('a', {
              href: p,
              target: '_blank',
              rel: 'noreferrer',
              className:
                'mt-11 inline-flex min-w-[15.5rem] items-center justify-center gap-6 border border-ivory/35 bg-ivory/5 px-8 py-5 font-display text-[clamp(0.84rem,1.08vw,1.16rem)] leading-none text-ivory/90 backdrop-blur-[2px] transition hover:bg-ivory/12 hover:text-ivory focus-visible:ring-champagne-300',
              'aria-label': ''
                .concat(c, ': ')
                .concat(
                  null !==
                    (n =
                      null === (a = l[d]) || void 0 === a ? void 0 : a.title) &&
                    void 0 !== n
                    ? n
                    : ''
                ),
              children: [
                (0, s.jsx)('span', {
                  'aria-hidden': !0,
                  className: 'text-[1.08em] leading-none',
                  children: '✣',
                }),
                c,
                (0, s.jsx)('span', {
                  'aria-hidden': !0,
                  className: 'text-[1.08em] leading-none',
                  children: '✣',
                }),
              ],
            }),
          ],
        });
      }
      function g() {
        let { t: e } = (0, d.b)(),
          t = (0, r.useRef)(null),
          a = m.map(t => {
            var a, s;
            return {
              slide: t,
              title:
                null !==
                  (s =
                    null === (a = e.amenities.items[t.amenityIndex]) ||
                    void 0 === a
                      ? void 0
                      : a.title) && void 0 !== s
                  ? s
                  : t.alt,
            };
          }),
          { scrollYProgress: n } = (0, c.v)({
            target: t,
            offset: ['start start', 'end end'],
          });
        return (0, s.jsx)('section', {
          id: 'horizontal-slide',
          ref: t,
          className: 'relative snap-start bg-charcoal-950',
          style: { height: ''.concat(100 * m.length, 'vh') },
          'aria-label': 'The Magnolia image journey',
          children: (0, s.jsx)('div', {
            className: 'sticky top-0 h-[100svh] min-h-[620px] overflow-hidden',
            children: (0, s.jsxs)('div', {
              className: 'relative h-full w-full overflow-hidden',
              children: [
                m.map((t, a) => {
                  let r = e.amenities.items[t.amenityIndex];
                  return r
                    ? (0, s.jsx)(
                        h,
                        {
                          slide: t,
                          index: a,
                          title: r.title,
                          scrollYProgress: n,
                        },
                        t.src
                      )
                    : null;
                }),
                (0, s.jsx)(v, {
                  items: a,
                  exploreLabel: e.amenities.explore,
                  scrollYProgress: n,
                }),
              ],
            }),
          }),
        });
      }
    },
    6389: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return d;
        },
      });
      var s = a(7437),
        r = a(2265),
        n = a(2345),
        i = a(999),
        l = a(960),
        o = a(8530),
        c = a(313);
      function d() {
        let { t: e } = (0, l.b)(),
          t = (0, n.J)(),
          a = (0, r.useRef)(null),
          [d, m] = (0, r.useState)(!1),
          [u, p] = (0, r.useState)('dormant'),
          { interactiveTour: h } = o.siteConfig;
        ((0, r.useEffect)(() => {
          let e = a.current;
          if (!e || d) return;
          let t = () => {
            (m(!0), p('loading'));
          };
          if ('undefined' == typeof IntersectionObserver) {
            let a = () => {
              let { top: s, bottom: r } = e.getBoundingClientRect();
              s >= window.innerHeight ||
                r <= 0 ||
                (t(),
                window.removeEventListener('scroll', a),
                window.removeEventListener('resize', a));
            };
            return (
              window.addEventListener('scroll', a, { passive: !0 }),
              window.addEventListener('resize', a),
              a(),
              () => {
                (window.removeEventListener('scroll', a),
                  window.removeEventListener('resize', a));
              }
            );
          }
          let s = new IntersectionObserver(
            e => {
              e.some(e => e.isIntersecting) && (t(), s.disconnect());
            },
            { threshold: 0 }
          );
          return (s.observe(e), () => s.disconnect());
        }, [d]),
          (0, r.useEffect)(() => {
            if (!d || 'loading' !== u) return;
            let e = window.setTimeout(() => p('failed'), h.readyTimeoutMs);
            return () => window.clearTimeout(e);
          }, [d, h.readyTimeoutMs, u]));
        let x = 'loading' === u;
        return (0, s.jsxs)('section', {
          id: 'interactive-tour',
          ref: a,
          className:
            'relative h-[100svh] snap-start overflow-hidden bg-black px-10 pt-[120px] pb-16 sm:px-10 sm:pt-32 md:px-10 md:pt-28 md:pb-16',
          'aria-labelledby': 'interactive-tour-heading',
          children: [
            (0, s.jsxs)('div', {
              className: 'flex h-full flex-col',
              children: [
                (0, s.jsx)('div', {
                  className:
                    'flex flex-wrap items-end justify-between gap-x-8 gap-y-4',
                  children: (0, s.jsx)('h2', {
                    id: 'interactive-tour-heading',
                    className:
                      'max-w-[40rem] font-display text-[clamp(1.536rem,2.72vw,3.2rem)] leading-[1.08] tracking-[-0.02em] text-ivory',
                    children: e.globe.heading,
                  }),
                }),
                (0, s.jsxs)('div', {
                  className:
                    'relative mt-7 min-h-0 flex-1 overflow-hidden rounded-[18px] bg-charcoal-night md:mt-8',
                  'aria-busy': x,
                  children: [
                    (0, s.jsx)('img', {
                      src: h.previewSrc,
                      alt: '',
                      loading: 'lazy',
                      decoding: 'async',
                      className: 'absolute inset-0 h-full w-full object-cover',
                    }),
                    (0, s.jsx)('div', {
                      'aria-hidden': !0,
                      className:
                        'absolute inset-0 bg-gradient-to-t from-charcoal-950/55 via-charcoal-950/10 to-charcoal-950/20',
                    }),
                    d &&
                      (0, s.jsx)('iframe', {
                        src: h.embedUrl,
                        title: e.tour.title,
                        loading: 'eager',
                        allow:
                          'fullscreen; xr-spatial-tracking; accelerometer; gyroscope',
                        allowFullScreen: !0,
                        referrerPolicy: 'strict-origin-when-cross-origin',
                        onLoad: () => p('ready'),
                        onError: () => p('failed'),
                        className:
                          'absolute inset-0 z-10 h-full w-full border-0 '
                            .concat(
                              t ? '' : 'transition-opacity duration-500',
                              ' '
                            )
                            .concat(
                              'ready' === u ? 'opacity-100' : 'opacity-0'
                            ),
                      }),
                    x &&
                      (0, s.jsx)('div', {
                        className:
                          'absolute inset-0 z-20 grid place-items-center bg-charcoal-950/30 px-6 text-center backdrop-blur-[1px]',
                        children: (0, s.jsx)('p', {
                          role: 'status',
                          'aria-live': 'polite',
                          className:
                            'font-display text-[clamp(1rem,1.7vw,1.5rem)] text-ivory/90',
                          children: e.tour.loading,
                        }),
                      }),
                    'failed' === u &&
                      (0, s.jsx)('div', {
                        className:
                          'absolute inset-0 z-20 grid place-items-center bg-charcoal-950/35 px-6 text-center backdrop-blur-[1px]',
                        children: (0, s.jsxs)('div', {
                          children: [
                            (0, s.jsx)('p', {
                              role: 'alert',
                              className:
                                'font-display text-[clamp(1rem,1.7vw,1.5rem)] text-ivory/90',
                              children: e.tour.unavailable,
                            }),
                            (0, s.jsxs)('a', {
                              href: h.externalUrl,
                              target: '_blank',
                              rel: 'noopener noreferrer',
                              className:
                                'mt-5 inline-flex items-center gap-3 border border-ivory/45 px-5 py-3 font-sans text-[0.56rem] uppercase tracking-luxe text-ivory transition-colors hover:bg-ivory/10 focus-visible:ring-champagne-300',
                              children: [
                                (0, s.jsx)(c.Z, { size: 9 }),
                                e.tour.openExternal,
                              ],
                            }),
                          ],
                        }),
                      }),
                  ],
                }),
              ],
            }),
            (0, s.jsx)(i.E.div, {
              'aria-hidden': !0,
              animate: t
                ? { opacity: 0.7 }
                : { y: [0, 5, 0], opacity: [0.55, 1, 0.55] },
              transition: t
                ? void 0
                : { duration: 1.35, repeat: 1 / 0, ease: 'easeInOut' },
              className:
                'pointer-events-none absolute bottom-[14px] left-1/2 z-20 -translate-x-1/2 text-ivory',
              children: (0, s.jsx)('svg', {
                width: '18',
                height: '12',
                viewBox: '0 0 18 12',
                fill: 'none',
                'aria-hidden': !0,
                children: (0, s.jsx)('path', {
                  d: 'm2 2 7 7 7-7',
                  stroke: 'currentColor',
                  strokeWidth: '1.5',
                }),
              }),
            }),
          ],
        });
      }
    },
    5394: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return x;
        },
      });
      var s = a(7437),
        r = a(2265),
        n = a(999),
        i = a(960),
        l = a(6051),
        o = a(6046),
        c = a(4508);
      function d(e) {
        let { className: t, scale: a = 1 } = e;
        return (0, s.jsxs)('div', {
          className: (0, c.cn)('flex items-center text-ivory', t),
          style: { gap: 7 * a },
          'aria-label': 'The Magnolia — Private Residences',
          role: 'img',
          children: [
            (0, s.jsx)(o.Z, { size: 44 * a }),
            (0, s.jsxs)('span', {
              className: 'flex flex-col',
              style: { gap: 3 * a },
              children: [
                (0, s.jsx)('span', {
                  className: 'font-display leading-none',
                  style: { fontSize: 27 * a, letterSpacing: '0.005em' },
                  children: 'The Magnolia',
                }),
                (0, s.jsx)('span', {
                  className:
                    'self-center font-sans font-light leading-none text-ivory/85',
                  style: {
                    fontSize: 8 * a,
                    letterSpacing: ''.concat(0.3 * a, 'em'),
                  },
                  children: 'PRIVATE RESIDENCES',
                }),
              ],
            }),
          ],
        });
      }
      function m(e) {
        let { value: t, onChange: a, labels: r, className: n } = e;
        return (0, s.jsx)('div', {
          role: 'tablist',
          'aria-label': ''.concat(r.story, ' / ').concat(r.explore),
          className: (0, c.cn)('flex h-[30px] w-[195px] items-stretch', n),
          children: ['story', 'explore'].map(e => {
            let n = e === t;
            return (0, s.jsxs)(
              'button',
              {
                role: 'tab',
                'aria-selected': n,
                tabIndex: n ? 0 : -1,
                onClick: () => a(e),
                className: (0, c.cn)(
                  'relative flex-1 font-display text-[10.4px] leading-none text-ivory',
                  'transition-opacity duration-500 ease-luxe',
                  n
                    ? 'bg-white/[0.04] backdrop-blur-[35.9px]'
                    : 'opacity-[0.64] hover:opacity-90'
                ),
                children: [
                  r[e],
                  n &&
                    (0, s.jsx)('span', {
                      'aria-hidden': !0,
                      className: 'absolute inset-x-0 bottom-0 h-px bg-ivory',
                    }),
                ],
              },
              e
            );
          }),
        });
      }
      var u = a(2345);
      let p = [9, 16, 20, 13, 7];
      function h(e) {
        let { on: t, onToggle: a, label: r, className: i } = e,
          l = (0, u.J)(),
          o = t && !l;
        return (0, s.jsxs)('button', {
          type: 'button',
          onClick: a,
          'aria-pressed': t,
          className: (0, c.cn)(
            'group flex items-center gap-4 text-ivory transition-opacity duration-300',
            t ? 'opacity-100' : 'opacity-60 hover:opacity-90',
            i
          ),
          children: [
            (0, s.jsx)('span', {
              'aria-hidden': !0,
              className: 'flex h-5 items-center gap-[3px]',
              children: p.map((e, a) =>
                (0, s.jsx)(
                  n.E.span,
                  {
                    className: 'w-px bg-ivory',
                    style: { height: e },
                    animate: o
                      ? { scaleY: [1, 0.35, 1] }
                      : { scaleY: t ? 1 : 0.4 },
                    transition: o
                      ? {
                          duration: 1.1 + 0.17 * a,
                          repeat: 1 / 0,
                          ease: 'easeInOut',
                          delay: 0.09 * a,
                        }
                      : { duration: 0.4 },
                  },
                  a
                )
              ),
            }),
            (0, s.jsx)('span', {
              className: 'font-sans text-[10.4px] font-light leading-none',
              children: r,
            }),
          ],
        });
      }
      function x() {
        let { t: e, locale: t, setLocale: a } = (0, i.b)(),
          [o, u] = (0, r.useState)('story'),
          [p, x] = (0, r.useState)(!0);
        return (0, s.jsxs)(n.E.header, {
          initial: { y: -20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] },
          className: 'fixed inset-x-0 top-0 z-50 bg-transparent',
          children: [
            (0, s.jsxs)('div', {
              className:
                'relative flex items-start justify-between px-8 py-7 md:px-10',
              children: [
                (0, s.jsx)(m, {
                  value: o,
                  onChange: u,
                  labels: e.modes,
                  className: 'hidden md:flex',
                }),
                (0, s.jsx)('a', {
                  href: '#top',
                  className: 'absolute left-1/2 top-6 -translate-x-1/2',
                  'aria-label': e.hero.brand,
                  children: (0, s.jsx)(d, {}),
                }),
                (0, s.jsxs)('div', {
                  className: 'ml-auto flex items-center gap-7',
                  children: [
                    (0, s.jsx)('div', {
                      role: 'group',
                      'aria-label': e.a11y.languageSwitcher,
                      className:
                        'hidden items-center font-sans text-[10.4px] font-light text-ivory sm:flex',
                      children: l.k1.map((e, r) =>
                        (0, s.jsxs)(
                          'span',
                          {
                            className: 'flex items-center',
                            children: [
                              r > 0 &&
                                (0, s.jsx)('span', {
                                  className: 'mx-1.5 opacity-40',
                                  children: '/',
                                }),
                              (0, s.jsx)('button', {
                                type: 'button',
                                onClick: () => a(e),
                                'aria-pressed': t === e,
                                className: (0, c.cn)(
                                  'transition-opacity duration-300',
                                  t === e
                                    ? 'opacity-100'
                                    : 'opacity-50 hover:opacity-85'
                                ),
                                children: l.PR[e],
                              }),
                            ],
                          },
                          e
                        )
                      ),
                    }),
                    (0, s.jsx)('a', {
                      href: '#consultation',
                      className:
                        'hidden font-sans text-[10.4px] font-light text-ivory opacity-80 transition-opacity duration-300 hover:opacity-100 sm:inline-flex',
                      children: e.contact.trigger,
                    }),
                    (0, s.jsx)(h, {
                      on: p,
                      onToggle: () => x(e => !e),
                      label: p ? e.sound.on : e.sound.off,
                    }),
                  ],
                }),
              ],
            }),
            (0, s.jsx)('div', {
              className: 'px-8 pb-4 md:hidden',
              children: (0, s.jsx)(m, {
                value: o,
                onChange: u,
                labels: e.modes,
              }),
            }),
          ],
        });
      }
    },
    3550: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return n;
        },
      });
      var s = a(7437),
        r = a(4294);
      function n(e) {
        let { children: t } = e;
        return ((0, r.OZ)(), (0, s.jsx)('main', { id: 'main', children: t }));
      }
    },
    1683: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return m;
        },
      });
      var s = a(7437),
        r = a(3145),
        n = a(999),
        i = a(960),
        l = a(8530),
        o = a(2893);
      let c = {
          '3 Bedroom': '/images/assets/units/card-3br.png',
          Penthouse: '/images/assets/units/card-penthouse.png',
          Duplex: '/images/assets/units/card-duplex.png',
        },
        d = [
          '/images/assets/units/strip-1.png',
          '/images/assets/units/strip-2.png',
          '/images/assets/units/strip-3.png',
        ];
      function m() {
        var e;
        let { locale: t, t: a } = (0, i.b)(),
          m = l.P.units;
        return (0, s.jsxs)('section', {
          id: 'units',
          className: 'relative bg-black text-ivory',
          'aria-labelledby': 'units-heading',
          children: [
            (0, s.jsxs)('div', {
              className: 'mx-auto max-w-[1440px] px-8 pt-24 md:pt-28',
              children: [
                (0, s.jsx)(n.E.h2, {
                  id: 'units-heading',
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: o.d1,
                  transition: { duration: 0.9, ease: o.VR },
                  className:
                    'max-w-[36rem] font-display leading-[1.05] tracking-[-0.015em] text-ivory text-[clamp(1.88rem,3.32vw,3.48rem)]',
                  children:
                    'vi' === t
                      ? (0, s.jsxs)(s.Fragment, {
                          children: [
                            'Kh\xf4ng gian sống được',
                            (0, s.jsx)('br', {}),
                            'tinh chỉnh',
                          ],
                        })
                      : a.units.heading,
                }),
                (0, s.jsx)(n.E.ul, {
                  initial: 'hidden',
                  whileInView: 'visible',
                  viewport: o.d1,
                  variants: (0, o.EY)(0.12, 0.15),
                  className:
                    'mt-20 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-5 lg:gap-x-7',
                  children: a.units.types.map(e =>
                    (0, s.jsxs)(
                      n.E.li,
                      {
                        variants: o.pB,
                        className: 'group/card flex flex-col gap-4',
                        children: [
                          (0, s.jsxs)('div', {
                            className:
                              'relative aspect-[329/372] w-full overflow-hidden border border-ivory/20 bg-ivory/5 md:aspect-[329/365] rounded-2xl',
                            children: [
                              (0, s.jsx)(r.default, {
                                src: c[e.title],
                                alt: e.title,
                                fill: !0,
                                sizes: '(max-width: 768px) 45vw, 22vw',
                                className:
                                  'object-cover grayscale-[0.35] transition duration-700 ease-luxe group-hover/card:scale-105 group-hover/card:grayscale-0 group-focus-within/card:scale-105 group-focus-within/card:grayscale-0 rounded-2xl',
                              }),
                              (0, s.jsx)('div', {
                                'aria-hidden': !0,
                                className:
                                  'pointer-events-none absolute inset-0 bg-black/15 transition-opacity duration-700 group-hover/card:opacity-0 group-focus-within/card:opacity-0 rounded-2xl',
                              }),
                            ],
                          }),
                          (0, s.jsxs)('div', {
                            className: 'flex flex-col items-start gap-6 pr-2',
                            children: [
                              (0, s.jsx)('p', {
                                className:
                                  'font-display text-[clamp(0.84rem,1.08vw,1.16rem)] leading-none text-ivory/90',
                                children: e.title,
                              }),
                              (0, s.jsxs)('button', {
                                type: 'button',
                                className:
                                  'group inline-flex h-10 min-w-[9rem] items-center justify-center gap-4 border border-ivory/60 px-4 font-sans text-[0.75rem] leading-none text-ivory transition-colors duration-500 hover:bg-ivory hover:text-black',
                                children: [
                                  (0, s.jsx)(u, {}),
                                  (0, s.jsx)('span', {
                                    children: a.units.explore,
                                  }),
                                  (0, s.jsx)(u, {}),
                                ],
                              }),
                            ],
                          }),
                        ],
                      },
                      e.title
                    )
                  ),
                }),
              ],
            }),
            (0, s.jsxs)('div', {
              className: 'mx-auto mt-36 max-w-[1440px] px-8',
              children: [
                (0, s.jsx)('div', {
                  className: 'grid grid-cols-[1fr_2.08fr_1fr] gap-5 md:gap-7',
                  children: d.map((e, t) =>
                    (0, s.jsx)(
                      n.E.div,
                      {
                        initial: { opacity: 0, y: 32 },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: o.d1,
                        transition: {
                          duration: 1,
                          delay: 0.12 * t,
                          ease: o.VR,
                        },
                        className:
                          'relative aspect-[329/437] w-full overflow-hidden border border-ivory/15 rounded-2xl',
                        style: 1 === t ? { aspectRatio: '678 / 439' } : void 0,
                        children: (0, s.jsx)(r.default, {
                          src: e,
                          alt: '',
                          fill: !0,
                          sizes: 1 === t ? '47vw' : '22vw',
                          className: 'object-cover grayscale-[0.2]',
                        }),
                      },
                      e
                    )
                  ),
                }),
                (0, s.jsx)(n.E.div, {
                  initial: 'hidden',
                  whileInView: 'visible',
                  viewport: o.d1,
                  variants: (0, o.EY)(0.1, 0.35),
                  className:
                    'mx-auto mt-16 max-w-[42rem] text-center font-display leading-[1.1] tracking-[-0.002em] text-ivory text-[clamp(1.4rem,3.12vw,2.8rem)]',
                  children: [a.units.divider[0], a.units.divider[1]].map(
                    (e, t) =>
                      (0, s.jsx)(
                        'span',
                        {
                          className: 0 === t ? 'block' : 'mt-2 block',
                          children: e.split(' ').map((e, t, a) =>
                            (0, s.jsxs)(
                              n.E.span,
                              {
                                variants: o.pB,
                                className:
                                  t === a.length - 1
                                    ? 'inline-block text-champagne-200'
                                    : 'inline-block',
                                children: [e, t < a.length - 1 ? '\xa0' : ''],
                              },
                              ''.concat(e, '-').concat(t)
                            )
                          ),
                        },
                        e
                      )
                  ),
                }),
              ],
            }),
            (0, s.jsxs)('div', {
              className:
                'relative mt-24 h-[min(58vw,860px)] min-h-[520px] w-full overflow-hidden bg-navy-dark',
              children: [
                (0, s.jsx)(r.default, {
                  src:
                    null !== (e = m.src) && void 0 !== e ? e : c['3 Bedroom'],
                  alt: m.alt,
                  fill: !0,
                  sizes: '100vw',
                  className: 'object-cover',
                }),
                (0, s.jsxs)(n.E.div, {
                  initial: { opacity: 0, y: 28 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: o.d1,
                  transition: { duration: 1.1, ease: o.VR },
                  className:
                    'absolute bottom-0 left-8 right-8 flex flex-col gap-2 pb-36 text-ivory md:left-10 md:right-auto md:pb-20',
                  children: [
                    (0, s.jsx)('p', {
                      className:
                        'font-display text-[clamp(1rem,1.6vw,1.72rem)] leading-none',
                      children: a.units.hero.eyebrow,
                    }),
                    (0, s.jsx)('p', {
                      className:
                        'font-display font-semibold leading-none tracking-[-0.018em] text-[clamp(2.72rem,5.92vw,5.6rem)]',
                      children: a.units.hero.title,
                    }),
                  ],
                }),
                (0, s.jsx)('div', {
                  className:
                    'absolute bottom-16 left-8 right-8 md:left-auto md:right-10 md:bottom-20',
                  children: (0, s.jsxs)('button', {
                    type: 'button',
                    className:
                      'group inline-flex h-[72px] w-full min-w-[18rem] items-center justify-center gap-[22px] border border-ivory/55 bg-black/[0.16] px-[34px] font-sans text-[0.75rem] text-ivory backdrop-blur-[5px] transition-colors duration-500 hover:bg-ivory hover:text-black md:w-auto',
                    children: [
                      (0, s.jsx)(u, { className: 'h-5 w-5' }),
                      (0, s.jsx)('span', {
                        className: 'font-display',
                        children: a.units.hero.explore,
                      }),
                      (0, s.jsx)(u, { className: 'h-5 w-5' }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        });
      }
      function u(e) {
        let { className: t } = e;
        return (0, s.jsxs)('svg', {
          viewBox: '0 0 16 16',
          fill: 'currentColor',
          'aria-hidden': !0,
          className: null != t ? t : 'h-3 w-3',
          children: [
            (0, s.jsx)('path', { d: 'M8 0 L8.7 6.4 L8 8 L7.3 6.4 Z' }),
            (0, s.jsx)('path', { d: 'M8 16 L8.7 9.6 L8 8 L7.3 9.6 Z' }),
            (0, s.jsx)('path', { d: 'M0 8 L6.4 7.3 L8 8 L6.4 8.7 Z' }),
            (0, s.jsx)('path', { d: 'M16 8 L9.6 7.3 L8 8 L9.6 8.7 Z' }),
            (0, s.jsx)('path', {
              d: 'M2.34 2.34 L6.4 6.05 L8 8 L6.05 6.4 Z',
              opacity: '.55',
            }),
            (0, s.jsx)('path', {
              d: 'M13.66 2.34 L9.95 6.4 L8 8 L9.6 6.05 Z',
              opacity: '.55',
            }),
            (0, s.jsx)('path', {
              d: 'M2.34 13.66 L6.05 9.6 L8 8 L6.4 9.95 Z',
              opacity: '.55',
            }),
            (0, s.jsx)('path', {
              d: 'M13.66 13.66 L9.95 9.6 L8 8 L9.6 9.95 Z',
              opacity: '.55',
            }),
          ],
        });
      }
    },
    6776: function (e, t, a) {
      'use strict';
      a.d(t, {
        Z: function () {
          return o;
        },
      });
      var s = a(7437),
        r = a(3145),
        n = a(4294),
        i = a(2893),
        l = a(4508);
      function o(e) {
        let {
            src: t,
            alt: a = '',
            tone: o = 'from-amber-600 via-amber-700 to-charcoal-900',
            depth: c = i.UQ.base,
            priority: d = !1,
            scrim: m = !0,
            className: u,
            layerClassName: p,
            imageClassName: h,
            overlayClassName: x,
          } = e,
          v = (0, n.YT)(c);
        return (0, s.jsxs)('div', {
          className: (0, l.cn)('absolute inset-0 overflow-hidden', u),
          children: [
            (0, s.jsx)('div', {
              ref: v,
              className: (0, l.cn)(
                'absolute inset-0 scale-[1.15] will-change-transform',
                p
              ),
              children: t
                ? (0, s.jsx)(r.default, {
                    src: t,
                    alt: a,
                    fill: !0,
                    priority: d,
                    sizes: '100vw',
                    className: (0, l.cn)('object-cover', h),
                  })
                : (0, s.jsx)('div', {
                    className: (0, l.cn)('h-full w-full bg-gradient-to-br', o),
                    children: (0, s.jsx)('div', {
                      className:
                        'absolute inset-0 opacity-[0.14] mix-blend-overlay',
                      style: {
                        backgroundImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>\")",
                      },
                    }),
                  }),
            }),
            m &&
              (0, s.jsx)('div', {
                className: (0, l.cn)('absolute inset-0 bg-panel-scrim', x),
                'aria-hidden': !0,
              }),
          ],
        });
      }
    },
    5074: function (e, t, a) {
      'use strict';
      a.d(t, {
        Z: function () {
          return u;
        },
      });
      var s = a(7437),
        r = a(2265),
        n = a(2934),
        i = a(5284);
      let l = {
          maxAttempts: 3,
          metadataTimeoutMs: 8e3,
          initialFrameTimeoutMs: 5e3,
          seekTimeoutMs: 3e3,
          retryDelaysMs: [250, 1e3],
        },
        o = { phase: 'dormant', attempt: 0, reason: null };
      function c(e, t) {
        switch (t.type) {
          case 'activate':
            return 'dormant' === e.phase
              ? { phase: 'loading', attempt: 1, reason: null }
              : e;
          case 'metadata-valid':
            return 'loading' === e.phase ? { ...e, phase: 'priming' } : e;
          case 'frame-ready':
            return 'loading' === e.phase || 'priming' === e.phase
              ? { ...e, phase: 'ready' }
              : e;
          case 'recover':
            if ('fallback' === e.phase || 'retry-wait' === e.phase) return e;
            return e.attempt >= l.maxAttempts
              ? { ...e, phase: 'fallback', reason: t.reason }
              : { ...e, phase: 'retry-wait', reason: t.reason };
          case 'retry':
            return 'retry-wait' === e.phase
              ? { phase: 'loading', attempt: e.attempt + 1, reason: null }
              : e;
          default:
            return e;
        }
      }
      let d = 1 / 24,
        m = 1 / 24 / 2;
      function u(e) {
        var t, a;
        let {
            src: u,
            poster: p,
            className: h,
            targetRef: x,
            scrollYProgress: v,
            getTime: g,
            enabled: f,
            diagnosticLabel: b,
            activateImmediately: y = !1,
            rootMargin: w = '0px',
          } = e,
          [j, N] = (0, r.useReducer)(c, o),
          [k, E] = (0, r.useState)(y),
          [_, M] = (0, r.useState)(!0),
          z = (0, r.useRef)(null),
          R = (0, r.useRef)(j),
          T = (0, r.useRef)(0),
          P = (0, r.useRef)(v.get()),
          C = (0, r.useRef)(0),
          L = (0, r.useRef)(null),
          S = (0, r.useRef)(y),
          Z = (0, r.useRef)(!0),
          H = (0, r.useRef)(null),
          I = (0, r.useRef)(!1),
          V = (0, r.useRef)(null),
          A = (0, r.useRef)(null),
          F = (0, r.useRef)(null),
          Y = (0, r.useRef)(null),
          U = (0, r.useRef)(0);
        (0, r.useEffect)(() => {
          R.current = j;
        }, [j]);
        let B = (0, r.useCallback)(() => f && S.current && Z.current, [f]),
          O = (0, r.useCallback)(e => {
            null !== e.current &&
              (window.clearTimeout(e.current), (e.current = null));
          }, []),
          q = (0, r.useCallback)(
            function () {
              let { preserveRetry: e = !1 } =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : {};
              (null !== H.current &&
                (window.cancelAnimationFrame(H.current), (H.current = null)),
                O(V),
                O(A),
                O(F),
                e || O(Y),
                (L.current = null),
                (I.current = !1));
            },
            [O]
          ),
          J = (0, r.useCallback)(
            (e, t, a) => {
              var s, r, n, l, o;
              let c = null == t ? void 0 : t.error;
              (0, i.$)({
                event: e,
                label: b,
                phase: R.current.phase,
                attempt: R.current.attempt,
                reason: a,
                elapsedMs: U.current
                  ? Math.round(performance.now() - U.current)
                  : void 0,
                isEligible: B(),
                visibility:
                  'undefined' == typeof document
                    ? 'unknown'
                    : document.visibilityState,
                readyState:
                  null !== (s = null == t ? void 0 : t.readyState) &&
                  void 0 !== s
                    ? s
                    : null,
                networkState:
                  null !== (r = null == t ? void 0 : t.networkState) &&
                  void 0 !== r
                    ? r
                    : null,
                duration:
                  null !== (n = null == t ? void 0 : t.duration) && void 0 !== n
                    ? n
                    : null,
                currentTime:
                  null !== (l = null == t ? void 0 : t.currentTime) &&
                  void 0 !== l
                    ? l
                    : null,
                desiredTime: C.current,
                mediaErrorCode:
                  null !== (o = null == c ? void 0 : c.code) && void 0 !== o
                    ? o
                    : null,
              });
            },
            [b, B]
          ),
          D = (0, r.useCallback)(() => {
            let e = T.current;
            return !Number.isFinite(e) || e <= 0
              ? null
              : Math.min(
                  Math.max(0, g(Math.min(1, Math.max(0, P.current)), e)),
                  Math.max(0, e - d)
                );
          }, [g]),
          W = (0, r.useCallback)(
            (e, t) => {
              var a;
              let s = R.current;
              'retry-wait' !== s.phase &&
                'fallback' !== s.phase &&
                (q(),
                null == t || t.pause(),
                null === (a = z.current) || void 0 === a || a.pause(),
                J(
                  s.attempt >= l.maxAttempts
                    ? 'media-recovery-exhausted'
                    : 'retry-scheduled',
                  null != t ? t : z.current,
                  e
                ),
                N({ type: 'recover', reason: e }));
            },
            [q, J]
          ),
          G = (0, r.useCallback)(
            function (e) {
              let t =
                  arguments.length > 1 &&
                  void 0 !== arguments[1] &&
                  arguments[1],
                a = z.current,
                { attempt: s, phase: r } = R.current;
              if (a && B() && ['loading', 'priming', 'ready'].includes(r)) {
                if (L.current) {
                  I.current || (I.current = t);
                  return;
                }
                if (!(!t && Math.abs(e - a.currentTime) < m)) {
                  ((C.current = e),
                    (L.current = { target: e, attempt: s }),
                    O(F),
                    (F.current = window.setTimeout(() => {
                      let e = L.current;
                      if (e && e.attempt === s && R.current.attempt === s) {
                        if (
                          a.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
                          Math.abs(a.currentTime - e.target) < m
                        ) {
                          ((F.current = null),
                            (L.current = null),
                            J('seek-timeout-resolved', a));
                          let e = D();
                          null !== e &&
                            Math.abs(e - a.currentTime) >= m &&
                            window.requestAnimationFrame(() => G(e, !0));
                          return;
                        }
                        W('seek-timeout', a);
                      }
                    }, l.seekTimeoutMs)));
                  try {
                    a.currentTime = e;
                  } catch (e) {
                    W('seek-assignment-failed', a);
                  }
                }
              }
            },
            [O, D, B, W, J]
          ),
          $ = (0, r.useCallback)(
            function () {
              let e =
                arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
              (I.current || (I.current = e),
                null === H.current &&
                  (H.current = window.requestAnimationFrame(() => {
                    if (((H.current = null), !B())) return;
                    let e = D(),
                      t = I.current;
                    ((I.current = !1), null !== e && G(e, t));
                  })));
            },
            [D, B, G]
          ),
          Q = (0, r.useCallback)(
            e => {
              (O(V),
                B() &&
                  (V.current = window.setTimeout(() => {
                    R.current.attempt === e &&
                      'loading' === R.current.phase &&
                      W('metadata-timeout');
                  }, l.metadataTimeoutMs)));
            },
            [O, B, W]
          ),
          K = (0, r.useCallback)(
            e => {
              (O(A),
                B() &&
                  (A.current = window.setTimeout(() => {
                    let t = R.current.phase;
                    R.current.attempt === e &&
                      ('loading' === t || 'priming' === t) &&
                      W('initial-frame-timeout');
                  }, l.initialFrameTimeoutMs)));
            },
            [O, B, W]
          ),
          X = (0, r.useCallback)(
            (e, t, a) => {
              a !== R.current.attempt ||
                e.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
                (O(V),
                O(A),
                'ready' !== R.current.phase &&
                  (N({ type: 'frame-ready' }), J('first-frame-ready', e, t)));
            },
            [O, J]
          );
        ((0, n.W)(v, 'change', e => {
          ((P.current = e), 'ready' === R.current.phase && $());
        }),
          (0, r.useEffect)(() => {
            if (!f) return;
            let e = () => {
              if (
                ((Z.current = 'visible' === document.visibilityState),
                M(Z.current),
                !Z.current)
              ) {
                q();
                return;
              }
              ('loading' === R.current.phase && Q(R.current.attempt),
                'priming' === R.current.phase && K(R.current.attempt),
                'ready' === R.current.phase && $(!0));
            };
            return (
              e(),
              document.addEventListener('visibilitychange', e),
              () => document.removeEventListener('visibilitychange', e)
            );
          }, [K, Q, q, f, $]),
          (0, r.useEffect)(() => {
            if (!f) return;
            if (y) {
              ((S.current = !0),
                E(!0),
                J('activated', void 0, 'immediate'),
                N({ type: 'activate' }));
              return;
            }
            let e = x.current;
            if (!e || 'undefined' == typeof IntersectionObserver) {
              ((S.current = !0),
                E(!0),
                J('activated', void 0, 'observer-unavailable'),
                N({ type: 'activate' }));
              return;
            }
            let t = new IntersectionObserver(
              e => {
                let [t] = e;
                ((S.current = t.isIntersecting),
                  E(t.isIntersecting),
                  t.isIntersecting
                    ? (J('activated', void 0, 'intersection'),
                      N({ type: 'activate' }),
                      'ready' === R.current.phase && $(!0))
                    : q());
              },
              { rootMargin: w }
            );
            return (t.observe(e), () => t.disconnect());
          }, [y, q, f, J, w, $, x]),
          (0, r.useEffect)(() => {
            if (!B()) {
              q();
              return;
            }
            ('loading' === j.phase && Q(j.attempt),
              'priming' === j.phase && K(j.attempt),
              'ready' === j.phase && $(!0));
          }, [K, Q, q, _, B, k, $, j.attempt, j.phase]),
          (0, r.useEffect)(() => {
            'loading' === j.phase &&
              ((U.current = performance.now()),
              (T.current = 0),
              (C.current = 0),
              (L.current = null),
              J('attempt-started'),
              Q(j.attempt));
          }, [Q, J, j.attempt, j.phase]),
          (0, r.useEffect)(() => {
            var e, t;
            if ('retry-wait' !== j.phase) return;
            let a =
              ((e = j.attempt),
              null !== (t = l.retryDelaysMs[Math.max(0, e - 1)]) && void 0 !== t
                ? t
                : 0);
            return (
              B() &&
                (Y.current = window.setTimeout(() => {
                  ((Y.current = null), B() && N({ type: 'retry' }));
                }, a)),
              () => O(Y)
            );
          }, [O, _, B, k, j.attempt, j.phase]),
          (0, r.useEffect)(() => {
            f &&
              'fallback' === j.phase &&
              J('fallback-terminal', void 0, j.reason);
          }, [f, J, j.phase, j.reason]),
          (0, r.useEffect)(
            () => () => {
              var e;
              (q(), null === (e = z.current) || void 0 === e || e.pause());
            },
            [q]
          ));
        let ee = f && k && ['loading', 'priming', 'ready'].includes(j.phase),
          et = {
            'data-scroll-scrub-label': b,
            'data-scroll-scrub-state': f ? j.phase : 'disabled',
            'data-scroll-scrub-attempt': j.attempt,
            'data-scroll-scrub-reason':
              null !== (t = j.reason) && void 0 !== t ? t : void 0,
          };
        if (!ee)
          return (0, s.jsx)('span', {
            'aria-hidden': !0,
            className: 'hidden',
            ...et,
          });
        let ea = j.attempt;
        return (0, s.jsxs)(s.Fragment, {
          children: [
            (0, s.jsx)('span', {
              'aria-hidden': !0,
              className: 'hidden',
              ...et,
            }),
            (0, s.jsx)(
              'video',
              {
                ref: z,
                'aria-hidden': !0,
                muted: !0,
                playsInline: !0,
                preload: 'auto',
                poster: p,
                onLoadedMetadata: e => {
                  var t;
                  let a = e.currentTarget;
                  if (ea !== R.current.attempt) return;
                  let s = a.duration;
                  if (!Number.isFinite(s) || s <= 0) {
                    W('invalid-duration', a);
                    return;
                  }
                  ((T.current = s),
                    (P.current = v.get()),
                    a.pause(),
                    O(V),
                    N({ type: 'metadata-valid' }),
                    J('metadata-valid', a));
                  let r = null !== (t = D()) && void 0 !== t ? t : 0;
                  (K(ea),
                    G(r > m ? r : Math.min(0.1, Math.max(0, s - d)), !0),
                    X(a, 'metadata-current-data', ea));
                },
                onLoadedData: e => X(e.currentTarget, 'loadeddata', ea),
                onCanPlay: e => X(e.currentTarget, 'canplay', ea),
                onSeeked: e => {
                  let t = e.currentTarget,
                    a = L.current;
                  if (!a || a.attempt !== ea || ea !== R.current.attempt)
                    return;
                  (O(F), (L.current = null), X(t, 'seeked', ea));
                  let s = D();
                  null !== s && Math.abs(s - t.currentTime) >= m && $(!0);
                },
                onError: e => W('media-error', e.currentTarget),
                onWaiting: e => J('waiting', e.currentTarget),
                onStalled: e => J('stalled', e.currentTarget),
                onSuspend: e => J('suspend', e.currentTarget),
                onAbort: e => J('abort', e.currentTarget),
                'data-scroll-scrub-label': b,
                'data-scroll-scrub-state': j.phase,
                'data-scroll-scrub-attempt': ea,
                'data-scroll-scrub-reason':
                  null !== (a = j.reason) && void 0 !== a ? a : void 0,
                className: ''
                  .concat(h, ' ')
                  .concat('ready' === j.phase ? 'opacity-100' : 'opacity-0'),
                children: (0, s.jsx)('source', { src: u, type: 'video/mp4' }),
              },
              ea
            ),
          ],
        });
      }
    },
    2765: function (e, t, a) {
      'use strict';
      a.d(t, {
        default: function () {
          return n;
        },
      });
      var s = a(7437),
        r = a(960);
      function n() {
        let { t: e } = (0, r.b)();
        return (0, s.jsx)('a', {
          href: '#main',
          className:
            'sr-only z-[100] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-none focus:border focus:border-champagne-200 focus:bg-charcoal-950 focus:px-5 focus:py-3 focus:font-sans focus:text-xs focus:uppercase focus:tracking-luxe focus:text-champagne-50',
          children: e.a11y.skipToContent,
        });
      }
    },
    313: function (e, t, a) {
      'use strict';
      a.d(t, {
        Z: function () {
          return n;
        },
      });
      var s = a(7437),
        r = a(4508);
      function n(e) {
        let { className: t, size: a = 12, twinkle: n = !1 } = e;
        return (0, s.jsxs)('svg', {
          width: a,
          height: a,
          viewBox: '0 0 16 16',
          fill: 'currentColor',
          'aria-hidden': 'true',
          focusable: 'false',
          className: (0, r.cn)('shrink-0', n && 'animate-twinkle', t),
          children: [
            (0, s.jsx)('path', {
              d: 'M8 0c.55 4.3 1.2 6.1 2.2 6.9C9.1 7.3 8.5 7.5 8 8c-.5-.5-1.1-.7-2.2-1.1C6.8 6.1 7.45 4.3 8 0Z',
            }),
            (0, s.jsx)('path', {
              d: 'M8 16c-.55-4.3-1.2-6.1-2.2-6.9C6.9 8.7 7.5 8.5 8 8c.5.5 1.1.7 2.2 1.1C9.2 9.9 8.55 11.7 8 16Z',
            }),
            (0, s.jsx)('path', {
              d: 'M16 8c-4.3.55-6.1 1.2-6.9 2.2C8.7 9.1 8.5 8.5 8 8c.5-.5.7-1.1 1.1-2.2C9.9 6.8 11.7 7.45 16 8Z',
            }),
            (0, s.jsx)('path', {
              d: 'M0 8c4.3-.55 6.1-1.2 6.9-2.2C7.3 6.9 7.5 7.5 8 8c-.5.5-.7 1.1-1.1 2.2C6.1 9.2 4.3 8.55 0 8Z',
            }),
          ],
        });
      }
    },
    4294: function (e, t, a) {
      'use strict';
      a.d(t, {
        OZ: function () {
          return o;
        },
        YT: function () {
          return l;
        },
      });
      var s = a(2265),
        r = a(6498),
        n = a(9498),
        i = a(2893);
      function l() {
        let e =
            arguments.length > 0 && void 0 !== arguments[0]
              ? arguments[0]
              : i.UQ.base,
          t = (0, s.useRef)(null);
        return (
          (0, s.useEffect)(() => {
            let a = t.current;
            if (
              !a ||
              window.matchMedia('(prefers-reduced-motion: reduce)').matches
            )
              return;
            let s = r.ZP.context(() => {
              var t;
              r.ZP.fromTo(
                a,
                { yPercent: -(100 * e) },
                {
                  yPercent: 100 * e,
                  ease: 'none',
                  scrollTrigger: {
                    trigger:
                      null !== (t = a.parentElement) && void 0 !== t ? t : a,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: !0,
                  },
                }
              );
            }, a);
            return () => s.revert();
          }, [e]),
          t
        );
      }
      function o() {
        (0, s.useEffect)(() => {
          var e, t;
          let a = () => n.i.refresh();
          return (
            (null === (e = document.fonts) || void 0 === e
              ? void 0
              : e.status) === 'loaded'
              ? a()
              : null === (t = document.fonts) ||
                void 0 === t ||
                t.ready.then(a),
            window.addEventListener('load', a),
            () => window.removeEventListener('load', a)
          );
        }, []);
      }
      r.ZP.registerPlugin(n.i);
    },
    5284: function (e, t, a) {
      'use strict';
      function s(e) {
        window.dispatchEvent(
          new CustomEvent('scroll-scrub-video-diagnostic', { detail: e })
        );
      }
      a.d(t, {
        $: function () {
          return s;
        },
      });
    },
  },
  function (e) {
    (e.O(0, [922, 178, 907, 11, 971, 117, 744], function () {
      return e((e.s = 4261));
    }),
      (_N_E = e.O()));
  },
]);
