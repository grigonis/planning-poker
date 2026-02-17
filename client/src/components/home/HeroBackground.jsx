import React, { useRef, useEffect } from 'react';

const HeroBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let waves = [];

        // Configuration
        const dotSpacing = 30; // Spacing between dots
        const dotRadius = 1.0;
        const waveSpeed = 1.5; // Speed of the rising wave
        const waveSpawnRate = 180; // How often keywaves spawn
        let frameCount = 0;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const spawnWave = () => {
            waves.push({
                y: canvas.height + 100, // Start below the visible area
                thickness: Math.random() * 150 + 100, // Random thickness
                opacity: Math.random() * 0.2 + 0.1, // Random peak opacity
            });
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update waves
            for (let i = waves.length - 1; i >= 0; i--) {
                waves[i].y -= waveSpeed;
                if (waves[i].y < -waves[i].thickness) {
                    waves.splice(i, 1); // Remove off-screen waves
                }
            }

            // Spawn waves
            frameCount++;
            if (frameCount % waveSpawnRate === 0) {
                spawnWave();
            }

            // Draw grid of dots
            const cols = Math.ceil(canvas.width / dotSpacing);
            const rows = Math.ceil(canvas.height / dotSpacing);

            ctx.fillStyle = '#404040'; // Fallback / base color logic handled below

            for (let xi = 0; xi < cols; xi++) {
                for (let yi = 0; yi < rows; yi++) {
                    const x = xi * dotSpacing;
                    const y = yi * dotSpacing;

                    let opacity = 0.05; // Base opacity for "inactive" dots

                    // Calculate opacity based on proximity to waves
                    for (const wave of waves) {
                        const dist = Math.abs(y - wave.y);
                        if (dist < wave.thickness) {
                            // Simple linear fade from center of wave
                            // Normalized distance 0..1
                            const glow = 1 - (dist / wave.thickness);
                            // Add wave opacity contribution
                            opacity += wave.opacity * glow;
                        }
                    }

                    // Cap opacity
                    opacity = Math.min(opacity, 0.5);

                    ctx.beginPath();
                    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        // Initialize with one wave already partly up
        waves.push({
            y: canvas.height * 0.8,
            thickness: 150,
            opacity: 0.25
        });

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
                // Mask to fade out the edges slightly, purely aesthetic
                maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
            }}
        />
    );
};

export default HeroBackground;
