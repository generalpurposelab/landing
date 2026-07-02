'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './home.module.css';

const PHRASES = [
  "the planet's most pressing challenges",
  "conservation and ecosystem resilience",
  "cultural preservation",
  "biodiversity",
  "human thriving",
  "our collective future",
];

const G = 29;
const SP = 8;
const OF = 4;
const CX = 14;
const CY = 14;
const SIZE = OF * 2 + (G - 1) * SP;
const MIN_R = 1.15;
const MAX_R = 3.6;
const DOT_OP = 0.80;
const LERP = 0.072;
const TAU = Math.PI * 2;

function g2(r: number, c: number, cr: number, cc: number, sigma: number) {
  const dr = r - cr, dc = c - cc;
  return Math.exp(-(dr * dr + dc * dc) / (2 * sigma * sigma));
}

function symEndlessKnot(r: number, c: number) {
  let v = 0;
  const W = 0.54, steps = 900;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * TAU;
    const px = CX + 8.5 * Math.sin(2 * t);
    const py = CY + 6.5 * Math.sin(3 * t - Math.PI / 6);
    const dd = (r - py) * (r - py) + (c - px) * (c - px);
    if (dd < 4) v = Math.max(v, Math.exp(-dd / (W * W)));
  }
  return Math.min(1, v);
}

function symGeez(r: number, c: number) {
  const dr = r - CY, dc = c - CX;
  let v = 0;
  const W = 0.68, arm = 7.5;
  if (Math.abs(dr) < arm + 1.5) v = Math.max(v, Math.exp(-(dc * dc) / (W * W)));
  if (Math.abs(dc) < arm + 1.5) v = Math.max(v, Math.exp(-(dr * dr) / (W * W)));
  ([[0, arm], [0, -arm], [arm, 0], [-arm, 0]] as [number, number][]).forEach(([ey, ex]) => {
    const d2 = (dr - ey) * (dr - ey) + (dc - ex) * (dc - ex);
    v = Math.max(v, Math.exp(-d2 / (1.6 * 1.6)));
  });
  ([[-4.2, -4.2], [-4.2, 4.2], [4.2, -4.2], [4.2, 4.2]] as [number, number][]).forEach(([qy, qx]) => {
    const d2 = (dr - qy) * (dr - qy) + (dc - qx) * (dc - qx);
    v = Math.max(v, Math.exp(-d2 / (1.1 * 1.1)));
  });
  return Math.min(1, v);
}

function symFibonacci(r: number, c: number) {
  const dr = r - CY, dc = c - (CX - 4);
  const dist = Math.sqrt(dr * dr + dc * dc) + 0.001;
  const ang = Math.atan2(dr, dc);
  const b = Math.log(1.6180339887) / (Math.PI * 0.5);
  const W = 1.05;
  let v = 0;
  for (let n = 0; n <= 3; n++) {
    const theta = ang + n * TAU;
    const sR = 1.7 * Math.exp(b * theta);
    if (sR >= 0.8 && sR <= 19.5) v = Math.max(v, Math.exp(-((dist - sR) * (dist - sR)) / (W * W)));
  }
  return Math.min(1, v);
}

function symHuman(r: number, c: number) {
  const rr = r - 3;
  const dc = c - CX;
  let v = 0;
  const W = 1.2;
  const dH = Math.sqrt((rr - (CY - 9.8)) * (rr - (CY - 9.8)) + dc * dc);
  v = Math.max(v, Math.exp(-((dH - 2.1) * (dH - 2.1)) / (0.75 * 0.75)));
  for (let tr = CY - 7.2; tr <= CY + 3.3; tr += 0.4) {
    const d2 = (rr - tr) * (rr - tr) + dc * dc;
    v = Math.max(v, Math.exp(-d2 / (W * W)));
  }
  ([-1, 1] as number[]).forEach(s => {
    const sC = CX + s * 2.5;
    for (let st = 0; st <= 8; st += 0.4) {
      const ar = CY - 5.9 - st * 0.9, ac = sC + s * st * 1.1;
      const d2 = (rr - ar) * (rr - ar) + (c - ac) * (c - ac);
      v = Math.max(v, Math.exp(-d2 / (W * W)));
    }
  });
  ([-1, 1] as number[]).forEach(s => {
    for (let st = 0; st <= 6; st += 0.4) {
      const lr = CY + 3.3 + st, lc = CX + s * st * 0.95;
      const d2 = (rr - lr) * (rr - lr) + (c - lc) * (c - lc);
      v = Math.max(v, Math.exp(-d2 / (W * W)));
    }
  });
  return Math.min(1, v);
}

const SYMBOL_FNS = [
  () => 0,
  symEndlessKnot,
  symGeez,
  symFibonacci,
  symHuman,
  () => 0,
];

export default function HomeClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const earthLayerRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const productRowRef = useRef<HTMLDivElement>(null);
  const introStageRef = useRef<HTMLDivElement>(null);
  const logotypeRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const phraseInnerRef = useRef<HTMLSpanElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const coinInnerRef = useRef<HTMLDivElement>(null);
  const coinElRef = useRef<HTMLDivElement>(null);
  const footerCopyrightRef = useRef<HTMLDivElement>(null);
  const footerQuoteRef = useRef<HTMLParagraphElement>(null);
  const footerResponseRef = useRef<HTMLParagraphElement>(null);

  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const phraseIdxRef = useRef(0);
  const isBusyRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const earthLayer = earthLayerRef.current;
    if (!canvas || !earthLayer) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width = SIZE + 'px';
    canvas.style.height = SIZE + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(DPR, DPR);

    // Pre-compute fields
    const FIELDS = SYMBOL_FNS.map(fn => {
      const f = new Float32Array(G * G);
      for (let r = 0; r < G; r++) {
        for (let c = 0; c < G; c++) {
          f[r * G + c] = Math.max(0, Math.min(1, fn(r, c)));
        }
      }
      return f;
    });

    // Load CANOPY.svg into field 1
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    fetch(`${base}/assets/CANOPY.svg`).then(r => r.text()).then(svgText => {
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const oc = document.createElement('canvas');
        oc.width = G; oc.height = G;
        const ox = oc.getContext('2d')!;
        ox.drawImage(img, 0, 0, G, G);
        const px = ox.getImageData(0, 0, G, G).data;
        const field = new Float32Array(G * G);
        for (let i = 0; i < G * G; i++) {
          const lum = (px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 3;
          field[i] = Math.max(0, Math.min(1, 1 - lum / 255));
        }
        FIELDS[1] = field;
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }).catch(() => {});

    // Load Stippling.svg into field 2
    fetch(`${base}/assets/Stippling.svg`).then(r => r.text()).then(svgText => {
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const oc = document.createElement('canvas');
        oc.width = G; oc.height = G;
        const ox = oc.getContext('2d')!;
        ox.drawImage(img, 0, 0, G, G);
        const px = ox.getImageData(0, 0, G, G).data;
        const field = new Float32Array(G * G);
        for (let i = 0; i < G * G; i++) {
          const lum = (px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 3;
          field[i] = Math.max(0, Math.min(1, 1 - lum / 255));
        }
        FIELDS[2] = field;
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }).catch(() => {});

    // Build dots
    interface Dot {
      r: number; c: number;
      x: number; y: number;
      rad: number; tRad: number;
      delay: number;
      ox: number; oy: number;
      vx: number; vy: number;
    }
    const dots: Dot[] = [];
    for (let r = 0; r < G; r++) {
      for (let c = 0; c < G; c++) {
        dots.push({ r, c, x: OF + c * SP, y: OF + r * SP, rad: MIN_R, tRad: MIN_R, delay: 0, ox: 0, oy: 0, vx: 0, vy: 0 });
      }
    }

    let mouseX = -9999, mouseY = -9999;
    const REPEL_R = 54;
    const REPEL_F = 4.0;
    const SPRING_K = 0.15;
    const DAMP = 0.74;
    let earthMode = false;
    let canvasHovered = false;
    let introMode = false;
    let animFrame: number;

    function getDotColor() {
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || 'rgb(48,48,48)';
      return ink.replace('rgb(', 'rgba(').replace(')', `,${DOT_OP})`);
    }
    let dotColor = getDotColor();
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkQuery.addEventListener('change', () => { dotColor = getDotColor(); });

    function applyField(fieldIdx: number) {
      const field = FIELDS[fieldIdx];
      const maxD = Math.sqrt(CX * CX + CY * CY);
      dots.forEach((d, i) => {
        d.tRad = MIN_R + (MAX_R - MIN_R) * field[i];
        const dist = Math.sqrt((d.r - CY) ** 2 + (d.c - CX) ** 2);
        d.delay = (dist / maxD) * 420;
      });
    }

    // Expose applyField and earthMode for phrase switcher
    (window as any).__gpApplyField = applyField;
    (window as any).__gpSetEarthMode = (v: boolean) => { earthMode = v; };
    (window as any).__gpShowEarth = () => {
      earthMode = true;
      earthLayer.style.opacity = '1';
      if (!canvasHovered) canvas.style.opacity = '0';
      applyField(0);
    };
    (window as any).__gpShowCanvas = () => {
      earthMode = false;
      earthLayer.style.opacity = '0';
      canvas.style.opacity = '1';
    };

    function render() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = dotColor;
      dots.forEach(d => {
        if (!introMode) {
          if (d.delay > 0) { d.delay -= 16.7; }
          else { d.rad += (d.tRad - d.rad) * LERP; }
          const rx = (d.x + d.ox) - mouseX;
          const ry = (d.y + d.oy) - mouseY;
          const dist = Math.sqrt(rx * rx + ry * ry);
          let fx = 0, fy = 0;
          if (dist < REPEL_R && dist > 0.5) {
            const t = 1 - dist / REPEL_R;
            const force = t * t * REPEL_F;
            fx = (rx / dist) * force;
            fy = (ry / dist) * force;
          }
          fx -= d.ox * SPRING_K;
          fy -= d.oy * SPRING_K;
          d.vx = (d.vx + fx) * DAMP;
          d.vy = (d.vy + fy) * DAMP;
          d.ox += d.vx;
          d.oy += d.vy;
        }
        ctx.beginPath();
        ctx.arc(d.x + d.ox, d.y + d.oy, Math.max(0.2, d.rad), 0, TAU);
        ctx.fill();
      });
      animFrame = requestAnimationFrame(render);
    }
    render();

    canvas.addEventListener('mouseenter', () => {
      canvasHovered = true;
      if (earthMode && !introMode) {
        canvas.style.transition = 'opacity 0.22s ease';
        earthLayer.style.transition = 'opacity 0.22s ease';
        canvas.style.opacity = '1';
        earthLayer.style.opacity = '0';
      }
    });
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => {
      canvasHovered = false;
      mouseX = -9999; mouseY = -9999;
      if (earthMode && !introMode) {
        canvas.style.transition = 'opacity 0.8s ease';
        earthLayer.style.transition = 'opacity 0.8s ease';
        canvas.style.opacity = '0';
        earthLayer.style.opacity = '1';
      }
    });

    // Intro animation
    function runIntro() {
      if (!canvas || !earthLayer) return;
      const cvs = canvas;
      const el = earthLayer;
      introMode = true;
      const heroEl = heroRef.current;
      if (heroEl) heroEl.style.opacity = '1';
      dots.forEach(d => { d.rad = MIN_R; d.tRad = MIN_R; });
      cvs.style.transition = 'none';
      cvs.style.opacity = '1';
      el.style.transition = 'none';
      el.style.opacity = '0';

      requestAnimationFrame(() => { cvs.style.transition = 'opacity 1s ease'; });

      const peaks = dots.map(d => {
        const dr = d.r - CY, dc = d.c - CX;
        const dist = Math.sqrt(dr * dr + dc * dc);
        const g = Math.exp(-(dist * dist) / (2 * 7.8 * 7.8));
        return MIN_R + (MAX_R - MIN_R) * g;
      });

      const maxDist = Math.sqrt(CX * CX + CY * CY);
      const SILENCE = 600, TRAVEL = 1100, RISE = 360, BELL_W = 320;
      const arrivals = dots.map(d => {
        const dr = d.r - CY, dc = d.c - CX;
        return SILENCE + (Math.sqrt(dr * dr + dc * dc) / maxDist) * TRAVEL;
      });

      const SVG_IN = SILENCE + TRAVEL * 0.52;
      const CANVAS_OUT = SVG_IN + 750;
      const MARK_IN = SVG_IN + 100;
      const SETTLE_IN = MARK_IN + 600;
      const H1_IN = SETTLE_IN + 700;
      const TOTAL = H1_IN + 800;

      let t0: number | null = null;
      let svgDone = false, canvasDone = false, markDone = false, settleDone = false, h1Done = false;

      function tick(ts: number) {
        if (!t0) t0 = ts;
        const t = ts - t0;

        dots.forEach((d, i) => {
          const rel = t - arrivals[i];
          if (rel <= 0) { d.rad = MIN_R; }
          else {
            const norm = (rel - RISE) / BELL_W;
            const bell = Math.exp(-norm * norm * 2.4);
            d.rad = MIN_R + (peaks[i] - MIN_R) * Math.max(0, bell);
          }
        });

        if (!svgDone && t >= SVG_IN) {
          svgDone = true;
          el.style.transition = 'opacity 1.1s ease';
          el.style.opacity = '1';
        }
        if (!canvasDone && t >= CANVAS_OUT) {
          canvasDone = true;
          cvs.style.opacity = '0';
          earthMode = true;
        }
        if (!markDone && t >= MARK_IN) {
          markDone = true;
          const wm = logotypeRef.current;
          if (wm) {
            requestAnimationFrame(() => {
              wm.style.transition = 'opacity 0.9s ease-out';
              wm.style.opacity = '1';
            });
          }
        }
        if (!settleDone && t >= SETTLE_IN) {
          settleDone = true;
          const stage = introStageRef.current;
          if (stage) requestAnimationFrame(() => stage.classList.add(styles.settled));
        }
        if (!h1Done && t >= H1_IN) {
          h1Done = true;
          requestAnimationFrame(() => {
            h1Ref.current?.classList.add(styles.visible);
            productRowRef.current?.classList.add(styles.visible);
          });
        }

        if (t < TOTAL) {
          requestAnimationFrame(tick);
        } else {
          introMode = false;
          dots.forEach(d => { d.rad = MIN_R; d.tRad = MIN_R; });
        }
      }

      requestAnimationFrame(tick);
    }

    // Load SVGs then run intro
    Promise.all([
      fetch(`${base}/assets/Union.svg`).then(r => r.text()).catch(() => null),
      fetch(`${base}/assets/icon-sphere.svg`).then(r => r.text()).catch(() => null),
      document.fonts.ready,
    ]).then(([unionSvg, sphereSvg]) => {
      if (unionSvg && logotypeRef.current) {
        logotypeRef.current.innerHTML = unionSvg.replace('fill="none"', 'fill="currentColor"');
      }

      let storedSphereSvg = sphereSvg || null;
      function injectSphere() {
        if (!storedSphereSvg || !earthLayer) return;
        const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || 'rgb(48,48,48)';
        earthLayer.innerHTML = storedSphereSvg.replace(/rgb\(168,172,181\)/g, ink);
      }
      if (sphereSvg) injectSphere();
      darkQuery.addEventListener('change', injectSphere);

      runIntro();
    });

    return () => {
      cancelAnimationFrame(animFrame);
      delete (window as any).__gpApplyField;
      delete (window as any).__gpSetEarthMode;
      delete (window as any).__gpShowEarth;
      delete (window as any).__gpShowCanvas;
    };
  }, []);

  function advance() {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setIsBusy(true);

    const next = (phraseIdxRef.current + 1) % PHRASES.length;
    phraseIdxRef.current = next;

    if (next === 0) {
      (window as any).__gpShowEarth?.();
    } else {
      (window as any).__gpApplyField?.(next);
      (window as any).__gpShowCanvas?.();
    }

    const inner = phraseInnerRef.current;
    if (!inner) { isBusyRef.current = false; return; }
    inner.style.transition = 'transform 0.2s cubic-bezier(0.4,0,1,1), opacity 0.16s';
    inner.style.transform = 'translateY(-10px)';
    inner.style.opacity = '0';

    setTimeout(() => {
      if (!phraseInnerRef.current) return;
      phraseInnerRef.current.textContent = PHRASES[next];
      phraseInnerRef.current.style.transition = 'none';
      phraseInnerRef.current.style.transform = 'translateY(12px)';
      phraseInnerRef.current.style.opacity = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!phraseInnerRef.current) return;
        phraseInnerRef.current.style.transition = 'transform 0.32s cubic-bezier(0.2,0,0.2,1), opacity 0.24s';
        phraseInnerRef.current.style.transform = 'translateY(0)';
        phraseInnerRef.current.style.opacity = '1';
        setTimeout(() => {
          isBusyRef.current = false;
          setIsBusy(false);
          setPhraseIdx(next);
        }, 340);
      }));
    }, 210);
  }

  // Footer animations
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const QUOTE = "The future is here, it's just not evenly distributed";
    const quoteEl = footerQuoteRef.current;
    const responseEl = footerResponseRef.current;
    if (!quoteEl || !responseEl) return;

    const words = QUOTE.split(' ');
    quoteEl.innerHTML = words.map((w, i) =>
      `<span class="${styles.fqWord}" style="transition-delay:${i * 52}ms">${w}</span>`
    ).join(' ');
    const totalQuoteDuration = words.length * 52 + 560;

    let responseTimer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        quoteEl.querySelectorAll(`.${styles.fqWord}`).forEach(w => w.classList.add(styles.fqWordVisible));
        responseTimer = setTimeout(() => responseEl.classList.add(styles.visible), totalQuoteDuration);
      } else {
        clearTimeout(responseTimer);
        quoteEl.querySelectorAll(`.${styles.fqWord}`).forEach(w => {
          (w as HTMLElement).style.transition = 'none';
          w.classList.remove(styles.fqWordVisible);
          requestAnimationFrame(() => requestAnimationFrame(() => { (w as HTMLElement).style.transition = ''; }));
        });
        responseEl.classList.remove(styles.visible);
      }
    }, { threshold: 0.35 });

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Coin flip
  useEffect(() => {
    const coinEl = coinElRef.current;
    const coinInner = coinInnerRef.current;
    if (!coinEl || !coinInner) return;

    let currentAngle = 0;

    function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
    function coinEase(t: number) {
      const split = 0.55;
      if (t < split) return (t / split) * split;
      const t2 = (t - split) / (1 - split);
      return split + (1 - split) * easeOutCubic(t2);
    }

    let timer: ReturnType<typeof setTimeout>;

    function spinCoin() {
      const spins = 4 + Math.floor(Math.random() * 4);
      const targetFace = Math.random() < 0.5 ? 0 : 180;
      const curMod = ((currentAngle % 360) + 360) % 360;
      const faceOffset = ((targetFace - curMod) + 360) % 360;
      const targetAngle = currentAngle + spins * 360 + faceOffset;
      const duration = 2000 + Math.random() * 900;
      const startAngle = currentAngle;
      let t0: number | null = null;
      let af: number;

      function step(ts: number) {
        if (!t0) t0 = ts;
        const t = Math.min((ts - t0) / duration, 1);
        currentAngle = startAngle + (targetAngle - startAngle) * coinEase(t);
        if (coinInnerRef.current) coinInnerRef.current.style.transform = `rotateY(${currentAngle}deg)`;
        if (t < 1) { af = requestAnimationFrame(step); }
        else { currentAngle = targetAngle; timer = setTimeout(spinCoin, 1400 + Math.random() * 1000); }
      }
      af = requestAnimationFrame(step);
    }

    const t1 = setTimeout(() => {
      coinEl.classList.add(styles.coinVisible);
      timer = setTimeout(spinCoin, 600);
    }, 1800);

    return () => { clearTimeout(t1); clearTimeout(timer); };
  }, []);

  // Copyright scramble
  useEffect(() => {
    const el = footerCopyrightRef.current;
    if (!el) return;

    const FINAL = 'COPYRIGHT © 2038';
    const DIGITS = '0123456789';
    const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const SYMS = '§¶&#@$';

    function randChar(c: string) {
      if (/\d/.test(c)) return DIGITS[Math.floor(Math.random() * DIGITS.length)];
      if (/[A-Za-z]/.test(c)) return UPPER[Math.floor(Math.random() * UPPER.length)];
      if (c === '©') return SYMS[Math.floor(Math.random() * SYMS.length)];
      return c;
    }

    function scramble() { return FINAL.split('').map(randChar).join(''); }

    let outerTimer: ReturnType<typeof setTimeout>;
    let innerTimer: ReturnType<typeof setTimeout>;

    function runCycle() {
      const chars = FINAL.split('');
      const n = chars.length;
      const TOTAL_MS = 3200;

      const state = chars.map((c, i) => ({
        finalChar: c,
        cur: c === ' ' ? ' ' : randChar(c),
        resolveAt: c === ' ' ? 0 : (i / n) * TOTAL_MS * 0.55 + Math.random() * TOTAL_MS * 0.55,
        nextFlip: 0,
        done: c === ' ',
      }));

      let t0: number | null = null;
      let af: number;

      function frame(ts: number) {
        if (!t0) t0 = ts;
        const elapsed = ts - t0;
        let dirty = false;

        state.forEach(s => {
          if (s.done) return;
          if (elapsed >= s.resolveAt) { s.cur = s.finalChar; s.done = true; dirty = true; return; }
          const progress = elapsed / s.resolveAt;
          const interval = 55 + Math.pow(progress, 2.2) * 340;
          if (ts >= s.nextFlip) {
            const ghost = progress > 0.88 && Math.random() < 0.45;
            s.cur = ghost ? s.finalChar : randChar(s.finalChar);
            s.nextFlip = ts + interval;
            dirty = true;
          }
        });

        if (dirty && footerCopyrightRef.current) footerCopyrightRef.current.textContent = state.map(s => s.cur).join('');

        if (state.some(s => !s.done)) { af = requestAnimationFrame(frame); }
        else {
          if (footerCopyrightRef.current) footerCopyrightRef.current.textContent = FINAL;
          innerTimer = setTimeout(() => {
            if (footerCopyrightRef.current) footerCopyrightRef.current.textContent = scramble();
            outerTimer = setTimeout(runCycle, 90);
          }, 3300 + Math.random() * 700);
        }
      }

      af = requestAnimationFrame(frame);
    }

    const t1 = setTimeout(() => {
      el.classList.add(styles.copyrightVisible);
      el.textContent = scramble();
      outerTimer = setTimeout(runCycle, 420);
    }, 2400);

    return () => { clearTimeout(t1); clearTimeout(outerTimer); clearTimeout(innerTimer); };
  }, []);

  return (
    <>
      <main className={styles.hero} ref={heroRef}>
        <div
          ref={introStageRef}
          className={styles.introStage}
          style={{ transform: 'scale(1.14)' }}
        >
          <div className={styles.dotGridWrap}>
            <canvas ref={canvasRef} id="dotCanvas" className={styles.dotCanvas} />
            <div ref={earthLayerRef} className={styles.earthLayer} />
          </div>
          <Link href="/about" aria-label="General Purpose — About">
            <div ref={logotypeRef} className={styles.logotypeWrap} />
          </Link>
        </div>

        <h1 ref={h1Ref} className={styles.h1}>
          <span className={styles.lineStatic}>Frontier intelligence for</span>
          <span
            className={styles.phraseWrap}
            tabIndex={0}
            role="button"
            aria-label="Click to discover more applications"
            onClick={advance}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); } }}
          >
            <span ref={phraseInnerRef} className={styles.phraseInner}>{PHRASES[0]}</span>
            <span className={styles.phraseUnderline} />
          </span>
        </h1>


      </main>

      <footer className={styles.footer} ref={footerRef} id="siteFooter">
        <div ref={coinElRef} className={styles.footerCoin}>
          <div ref={coinInnerRef} className={styles.coinInner}>
            <div className={`${styles.coinFace} ${styles.coinDark}`}><span>GP</span></div>
            <div className={`${styles.coinFace} ${styles.coinLight}`}><span>GP</span></div>
          </div>
        </div>
        <div className={styles.footerRule} />
        <p className={styles.footerQuote} ref={footerQuoteRef} />
        <p className={styles.footerResponse} ref={footerResponseRef}>We exist to distribute the future&hellip;</p>
        <div ref={footerCopyrightRef} className={styles.footerCopyright} />
      </footer>
    </>
  );
}
