import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;

const BLUE_MAIN = { r: 0, g: 114, b: 206 };
const BLUE_CYAN = { r: 0, g: 169, b: 224 };
const WHITE = { r: 255, g: 255, b: 255 };

function lerp(a, b, t) { return a + (b - a) * t; }

function colorAt(t, alpha) {
  let r, g, b;
  if (t < 0.6) {
    const p = t / 0.6;
    r = lerp(BLUE_MAIN.r, BLUE_CYAN.r, p);
    g = lerp(BLUE_MAIN.g, BLUE_CYAN.g, p);
    b = lerp(BLUE_MAIN.b, BLUE_CYAN.b, p);
  } else {
    const p = (t - 0.6) / 0.4;
    r = lerp(BLUE_CYAN.r, WHITE.r, p * 0.5);
    g = lerp(BLUE_CYAN.g, WHITE.g, p * 0.5);
    b = lerp(BLUE_CYAN.b, WHITE.b, p * 0.5);
  }
  return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
}

// ── Brain lateral silhouette — 28 control points ──
const BRAIN_POINTS = [
  { x: -88, y: 10 }, { x: -90, y: 0 }, { x: -88, y: -12 }, { x: -82, y: -26 },
  { x: -70, y: -42 }, { x: -55, y: -54 }, { x: -38, y: -62 },
  { x: -18, y: -68 }, { x: 0, y: -70 }, { x: 18, y: -68 }, { x: 35, y: -62 },
  { x: 52, y: -54 }, { x: 65, y: -42 }, { x: 74, y: -28 },
  { x: 80, y: -12 }, { x: 82, y: 2 }, { x: 78, y: 16 },
  { x: 70, y: 28 }, { x: 58, y: 36 },
  { x: 42, y: 40 }, { x: 28, y: 42 },
  { x: 10, y: 44 }, { x: -10, y: 46 }, { x: -30, y: 46 }, { x: -48, y: 44 },
  { x: -62, y: 40 }, { x: -74, y: 34 }, { x: -82, y: 24 },
];

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function getP(i) {
  const n = BRAIN_POINTS.length;
  return BRAIN_POINTS[((i % n) + n) % n];
}

function brainPointAt(progress) {
  const n = BRAIN_POINTS.length;
  const i = progress * n;
  const i0 = Math.floor(i);
  const f = i - i0;
  const p0 = getP(i0 - 1), p1 = getP(i0), p2 = getP(i0 + 1), p3 = getP(i0 + 2);
  return {
    x: catmullRom(p0.x, p1.x, p2.x, p3.x, f),
    y: catmullRom(p0.y, p1.y, p2.y, p3.y, f),
  };
}

function isInside(px, py) {
  let inside = false;
  const pts = BRAIN_POINTS, n = pts.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

export default function JellyfishCanvas({ width = 340, height = 360 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const cx = width / 2;
    const cy = height * 0.42;

    // ── DNA helix strands (background) ──
    const DNA_STRAND_COUNT = 4;
    const dnaStrands = [];
    for (let s = 0; s < DNA_STRAND_COUNT; s++) {
      const baseX = width * 0.15 + (s / (DNA_STRAND_COUNT - 1)) * width * 0.7;
      const phase = (s / DNA_STRAND_COUNT) * TAU;
      const amp = 18 + Math.random() * 12;
      const freq = 0.025 + Math.random() * 0.01;
      const speed = 0.3 + Math.random() * 0.3;
      const pointCount = 40;
      dnaStrands.push({ baseX, phase, amp, freq, speed, pointCount, alpha: 0.04 + Math.random() * 0.03 });
    }

    // ── Brain fill — soft cloud (no hard outline) ──
    const fillParticles = [];
    let att = 0;
    while (fillParticles.length < 500 && att < 5000) {
      att++;
      const x = -95 + Math.random() * 185;
      const y = -75 + Math.random() * 126;
      if (isInside(x, y)) {
        const dist = Math.sqrt(x * x + y * y) / 80;
        // Particles near edge are more transparent — soft boundary
        const edgeFade = isInside(x * 0.88, y * 0.88) ? 1 : 0.4;
        fillParticles.push({
          baseX: x, baseY: y,
          distFromCenter: Math.min(dist, 1),
          edgeFade,
          size: 1.2 + Math.random() * 2.4,
          phase: Math.random() * TAU,
          speed: 0.2 + Math.random() * 0.55,
          drift: 0.5 + Math.random() * 1.8,
          alpha: (0.12 + Math.random() * 0.35) * edgeFade,
        });
      }
    }

    // ── Outer haze particles (very soft edge, replaces hard outline) ──
    const hazeParticles = [];
    for (let i = 0; i < 140; i++) {
      const progress = i / 140;
      const pt = brainPointAt(progress);
      // Scatter around the edge
      const scatter = (Math.random() - 0.5) * 12;
      const nx = Math.cos(progress * TAU);
      const ny = Math.sin(progress * TAU);
      hazeParticles.push({
        baseX: pt.x + nx * scatter,
        baseY: pt.y + ny * scatter,
        progress,
        size: 2.0 + Math.random() * 3.0,
        phase: Math.random() * TAU,
        speed: 0.3 + Math.random() * 0.4,
        alpha: 0.06 + Math.random() * 0.1,
      });
    }

    // ── Sulci (internal folds — very subtle) ──
    const sulciDefs = [
      [{ x: -8, y: -60 }, { x: -12, y: -45 }, { x: -14, y: -28 }, { x: -10, y: -12 }, { x: -4, y: 2 }],
      [{ x: -55, y: 10 }, { x: -38, y: 6 }, { x: -20, y: 8 }, { x: 0, y: 14 }, { x: 20, y: 20 }, { x: 35, y: 28 }],
      [{ x: -78, y: -18 }, { x: -65, y: -30 }, { x: -48, y: -38 }, { x: -30, y: -40 }],
      [{ x: -22, y: -58 }, { x: -26, y: -42 }, { x: -28, y: -24 }, { x: -24, y: -8 }],
      [{ x: 4, y: -62 }, { x: 6, y: -46 }, { x: 8, y: -28 }, { x: 10, y: -10 }],
      [{ x: 40, y: -50 }, { x: 45, y: -36 }, { x: 48, y: -20 }, { x: 44, y: -4 }],
      [{ x: -48, y: 22 }, { x: -30, y: 26 }, { x: -10, y: 30 }, { x: 10, y: 34 }],
      [{ x: 50, y: 0 }, { x: 58, y: 8 }, { x: 65, y: 18 }, { x: 68, y: 28 }],
    ];
    const sulci = [];
    for (const def of sulciDefs) {
      const fold = [];
      for (const p of def) {
        if (isInside(p.x * 0.9, p.y * 0.9)) {
          fold.push({ baseX: p.x, baseY: p.y, phase: Math.random() * TAU, alpha: 0.06 + Math.random() * 0.08 });
        }
      }
      if (fold.length > 1) sulci.push(fold);
    }

    // ── Neural network ──
    const neurons = [];
    let nAtt = 0;
    while (neurons.length < 35 && nAtt < 600) {
      nAtt++;
      const x = -75 + Math.random() * 155;
      const y = -60 + Math.random() * 105;
      if (isInside(x * 0.82, y * 0.82)) {
        neurons.push({
          baseX: x, baseY: y,
          size: 1.8 + Math.random() * 1.5,
          phase: Math.random() * TAU,
          pulseSpeed: 0.25 + Math.random() * 0.7,
          alpha: 0.25 + Math.random() * 0.35,
        });
      }
    }

    const connections = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].baseX - neurons[j].baseX;
        const dy = neurons[i].baseY - neurons[j].baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 55 && Math.random() < 0.45) {
          connections.push({ a: i, b: j, dist, phase: Math.random() * TAU, speed: 0.2 + Math.random() * 0.5 });
        }
      }
    }

    const signals = connections.map((_, idx) => ({
      connIdx: idx,
      phase: Math.random() * TAU,
      speed: 0.6 + Math.random() * 1.0,
      active: Math.random() < 0.5,
    }));

    // ── Brainstem (short, subtle, clarifies "brain" shape) ──
    const STEM_PARTICLES = 28;
    const stemParticles = [];
    for (let i = 0; i < STEM_PARTICLES; i++) {
      const progress = i / STEM_PARTICLES;
      const spread = (Math.random() - 0.5) * (10 - progress * 6);
      stemParticles.push({
        progress,
        spread,
        size: 1.6 + Math.random() * 1.2 - progress * 0.8,
        phase: Math.random() * TAU,
        alpha: 0.25 - progress * 0.12,
      });
    }

    let t = 0;

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, width, height);

      // ── DNA helix strands (background, very subtle) ──
      for (const strand of dnaStrands) {
        const yStep = height / strand.pointCount;
        for (let i = 0; i < strand.pointCount; i++) {
          const y = i * yStep;
          const scrollY = (y + t * 30 * strand.speed) % (height + 20) - 10;

          // Two helical strands intertwined
          const angle1 = scrollY * strand.freq + strand.phase + t * strand.speed;
          const angle2 = angle1 + Math.PI;
          const x1 = strand.baseX + Math.sin(angle1) * strand.amp;
          const x2 = strand.baseX + Math.sin(angle2) * strand.amp;

          // Strand 1
          ctx.beginPath();
          ctx.arc(x1, scrollY, 1.0, 0, TAU);
          ctx.fillStyle = `rgba(0, 114, 206, ${strand.alpha})`;
          ctx.fill();

          // Strand 2
          ctx.beginPath();
          ctx.arc(x2, scrollY, 1.0, 0, TAU);
          ctx.fillStyle = `rgba(0, 169, 224, ${strand.alpha * 0.8})`;
          ctx.fill();

          // Cross-bridges (every ~5 points)
          if (i % 5 === 0) {
            ctx.beginPath();
            ctx.moveTo(x1, scrollY);
            ctx.lineTo(x2, scrollY);
            ctx.strokeStyle = `rgba(0, 140, 220, ${strand.alpha * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // ── Brain motion ──
      const breathe = Math.sin(t * 1.0) * 0.07 + Math.sin(t * 2.3) * 0.02;
      const swayX = Math.sin(t * 0.35) * 6 + Math.sin(t * 0.9) * 2;
      const swayY = Math.cos(t * 0.5) * 4 + Math.sin(t * 1.0) * 2.5;
      const tilt = Math.sin(t * 0.25) * 0.025;
      const sc = 1 + breathe;

      ctx.save();
      ctx.translate(cx + swayX, cy + swayY);
      ctx.rotate(tilt);

      // ── Deep glow (large, diffuse) ──
      const glow1 = ctx.createRadialGradient(0, -10, 10, 0, -5, 130);
      glow1.addColorStop(0, 'rgba(0, 130, 215, 0.07)');
      glow1.addColorStop(0.4, 'rgba(0, 114, 206, 0.03)');
      glow1.addColorStop(1, 'rgba(0, 114, 206, 0)');
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(0, -10, 130, 0, TAU);
      ctx.fill();

      // ── Haze particles (soft edge — no hard outline) ──
      for (const p of hazeParticles) {
        const wobble = Math.sin(t * p.speed + p.phase) * 3;
        const pt = brainPointAt(p.progress);
        const x = (pt.x + wobble * 0.4) * sc;
        const y = (pt.y + Math.cos(t * p.speed + p.phase) * 2) * sc;
        const breathAlpha = p.alpha * (0.7 + Math.sin(t * 0.8 + p.progress * 8) * 0.3);

        ctx.beginPath();
        ctx.arc(x, y, p.size * sc, 0, TAU);
        ctx.fillStyle = colorAt(0.4, breathAlpha);
        ctx.fill();
      }

      // ── Neural connections (behind fill) ──
      for (const c of connections) {
        const na = neurons[c.a], nb = neurons[c.b];
        const ax = (na.baseX + Math.sin(t * na.pulseSpeed + na.phase) * 1.2) * sc;
        const ay = (na.baseY + Math.cos(t * na.pulseSpeed * 0.7 + na.phase) * 0.8) * sc;
        const bx = (nb.baseX + Math.sin(t * nb.pulseSpeed + nb.phase) * 1.2) * sc;
        const by = (nb.baseY + Math.cos(t * nb.pulseSpeed * 0.7 + nb.phase) * 0.8) * sc;

        const pulse = 0.5 + Math.sin(t * c.speed + c.phase) * 0.3;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        const mx = (ax + bx) / 2 + Math.sin(t * 0.4 + c.phase) * 4;
        const my = (ay + by) / 2 + Math.cos(t * 0.35 + c.phase) * 3;
        ctx.quadraticCurveTo(mx, my, bx, by);
        ctx.strokeStyle = `rgba(0, 169, 224, ${0.04 * pulse})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // ── Traveling signals ──
      for (const sig of signals) {
        if (!sig.active) { if (Math.random() < 0.001) sig.active = true; continue; }
        const c = connections[sig.connIdx];
        if (!c) continue;

        const progress = ((t * sig.speed + sig.phase) % TAU) / TAU;
        const na = neurons[c.a], nb = neurons[c.b];
        const ax = na.baseX * sc, ay = na.baseY * sc;
        const bx = nb.baseX * sc, by = nb.baseY * sc;
        const sx = lerp(ax, bx, progress);
        const sy = lerp(ay, by, progress);
        const intensity = Math.sin(progress * Math.PI);

        if (intensity > 0.1) {
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2 + intensity * 1.8, 0, TAU);
          ctx.fillStyle = `rgba(160, 220, 255, ${intensity * 0.5})`;
          ctx.fill();

          // Trail
          const trailP = Math.max(0, progress - 0.08);
          const tx = lerp(ax, bx, trailP);
          const ty = lerp(ay, by, trailP);
          ctx.beginPath();
          ctx.arc(tx, ty, 0.8 + intensity * 0.8, 0, TAU);
          ctx.fillStyle = `rgba(160, 220, 255, ${intensity * 0.2})`;
          ctx.fill();
        }
      }

      // ── Fill particles (the brain mass) ──
      for (const p of fillParticles) {
        const wave = Math.sin(t * p.speed + p.phase) * p.drift;
        const x = (p.baseX + wave * 0.3) * sc;
        const y = (p.baseY + Math.cos(t * p.speed * 0.5 + p.phase) * 1.2) * sc;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, TAU);
        ctx.fillStyle = colorAt(1 - p.distFromCenter, p.alpha);
        ctx.fill();
      }

      // ── Sulci (very subtle fold hints) ──
      for (const fold of sulci) {
        if (fold.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(fold[0].baseX * sc, fold[0].baseY * sc);
          for (let i = 1; i < fold.length; i++) {
            const wX = Math.sin(t * 0.4 + fold[i].phase) * 0.8;
            const wY = Math.cos(t * 0.3 + fold[i].phase) * 0.6;
            ctx.lineTo((fold[i].baseX + wX) * sc, (fold[i].baseY + wY) * sc);
          }
          ctx.strokeStyle = 'rgba(0, 50, 130, 0.05)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // ── Neuron nodes ──
      for (const n of neurons) {
        const pulse = 0.4 + Math.sin(t * n.pulseSpeed + n.phase) * 0.6;
        const nx = (n.baseX + Math.sin(t * n.pulseSpeed + n.phase) * 1.2) * sc;
        const ny = (n.baseY + Math.cos(t * n.pulseSpeed * 0.7 + n.phase) * 0.8) * sc;
        const sz = n.size * (0.7 + pulse * 0.5);

        // Halo
        ctx.beginPath();
        ctx.arc(nx, ny, sz + 4, 0, TAU);
        ctx.fillStyle = `rgba(0, 169, 224, ${0.025 * pulse})`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(nx, ny, sz, 0, TAU);
        ctx.fillStyle = colorAt(0.65 + pulse * 0.35, n.alpha * pulse);
        ctx.fill();
      }

      // ── Inner core glow ──
      const coreGlow = ctx.createRadialGradient(-8, -15, 5, -5, -10, 45);
      coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
      coreGlow.addColorStop(0.4, 'rgba(0, 169, 224, 0.03)');
      coreGlow.addColorStop(1, 'rgba(0, 114, 206, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(-8, -15, 45, 0, TAU);
      ctx.fill();

      // ── Brainstem (short, tapers down — confirms brain identity) ──
      const stemTopY = 44 * sc;
      const stemWave = Math.sin(t * 0.6) * 3;
      for (const p of stemParticles) {
        const y = stemTopY + p.progress * 50;
        const taperX = (1 - p.progress * 0.6) * (p.spread + stemWave * (0.5 + p.progress));
        const waveX = Math.sin(t * 0.8 + p.progress * 3 + p.phase) * (2 + p.progress * 4);

        ctx.beginPath();
        ctx.arc(taperX + waveX, y + Math.sin(t * 0.5 + p.phase) * 1.5, p.size * sc, 0, TAU);
        ctx.fillStyle = colorAt(0.35, p.alpha * (0.6 + Math.sin(t * 1.2 + p.phase) * 0.2));
        ctx.fill();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block', margin: '0 auto' }}
    />
  );
}
