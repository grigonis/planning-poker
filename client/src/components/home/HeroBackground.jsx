import { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const DOT_SPACING  = 40;
const DOT_RADIUS   = 1.2;
const MOUSE_RADIUS = 180;

const HeroBackground = () => {
    const canvasRef = useRef(null);
    const mouseRef  = useRef({ x: -9999, y: -9999 });
    const ripplesRef = useRef([]);
    const { isDark } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext('2d');
        let rafId;
        const startTime = performance.now();

        // ── Resize ──────────────────────────────────────────
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width  = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        // ── Mouse / click — translate page coords to canvas-local coords ──
        const onMove  = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const onClick = (e) => {
            const rect = canvas.getBoundingClientRect();
            ripplesRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, opacity: 0.55 });
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('click', onClick);

        // ── Draw loop ────────────────────────────────────────
        const draw = (now) => {
            const t  = now - startTime;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const cols = Math.ceil(canvas.width  / DOT_SPACING) + 1;
            const rows = Math.ceil(canvas.height / DOT_SPACING) + 1;
            const { x: mx, y: my } = mouseRef.current;

            // Advance ripples
            for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
                const rip = ripplesRef.current[i];
                rip.r      += 2.8;
                rip.opacity -= 0.009;
                if (rip.opacity <= 0) ripplesRef.current.splice(i, 1);
            }

            for (let xi = 0; xi < cols; xi++) {
                for (let yi = 0; yi < rows; yi++) {
                    const x = xi * DOT_SPACING;
                    const y = yi * DOT_SPACING;

                    // ── Organic ambient breathing (no straight bands) ──
                    const ambient = 0.05 + 0.13 * (
                        0.5 + 0.5 * Math.sin(t * 0.00065 + xi * 0.37 + yi * 0.53)
                    );

                    // ── Mouse proximity (squared dist avoids sqrt for cull) ──
                    const ddx = x - mx;
                    const ddy = y - my;
                    const distSq = ddx * ddx + ddy * ddy;
                    let mouseGlow = 0;
                    let dist = 0;
                    if (distSq < MOUSE_RADIUS * MOUSE_RADIUS) {
                        dist      = Math.sqrt(distSq);
                        mouseGlow = 1 - dist / MOUSE_RADIUS;
                    }

                    // ── Ripple rings ──
                    let rippleGlow = 0;
                    for (const rip of ripplesRef.current) {
                        const rdx = x - rip.x;
                        const rdy = y - rip.y;
                        // Early-out with squared bounds before sqrt
                        const rMin = rip.r - 22, rMax = rip.r + 22;
                        const rdistSq = rdx * rdx + rdy * rdy;
                        if (rdistSq < rMin * rMin || rdistSq > rMax * rMax) continue;
                        const rdist = Math.sqrt(rdistSq);
                        const diff  = Math.abs(rdist - rip.r);
                        rippleGlow += rip.opacity * (1 - diff / 22);
                    }

                    const opacity = Math.min(ambient + mouseGlow * 0.52 + rippleGlow * 0.38, 0.72);

                    // ── Color: banana-yellow near cursor, white/black elsewhere ──
                    let r = 255, g = 255, b = 255;
                    if (!isDark) { r = 0; g = 0; b = 0; }

                    if (mouseGlow > 0.05) {
                        // Lerp toward #ffb800 (255,184,0) based on proximity
                        const t2 = mouseGlow;
                        g = Math.round(isDark ? 255 - (255 - 184) * t2 : (184 * t2));
                        b = Math.round(isDark ? 255 * (1 - t2)         : 0);
                        r = 255;
                    }

                    ctx.beginPath();
                    ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
                    ctx.fill();
                }
            }

            rafId = requestAnimationFrame(draw);
        };

        rafId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('click', onClick);
        };
    }, [isDark]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)',
            }}
        />
    );
};

export default HeroBackground;
