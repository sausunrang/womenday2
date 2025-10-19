/**
 * Fireworks Effect Library
 * Tách từ heart-beat.html để sử dụng độc lập
 * 
 * Cách sử dụng:
 * 1. Include file này vào HTML
 * 2. Tạo canvas element với id="fireworks-canvas"
 * 3. Gọi FireworksEffect.init() để khởi tạo
 * 4. Sử dụng các method để điều khiển hiệu ứng
 */

class FireworksEffect {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.fireworks = [];
        this.maxFireworks = 5;
        this.isInitialized = false;
        this.animationId = null;
        this.autoCreateInterval = null;
        this.width = 0;
        this.height = 0;
    }

    /**
     * Khởi tạo hiệu ứng pháo hoa
     * @param {string} canvasId - ID của canvas element
     * @param {Object} options - Các tùy chọn cấu hình
     */
    init(canvasId = 'fireworks-canvas', options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found with id:', canvasId);
            return false;
        }

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;

        // Cấu hình mặc định
        this.maxFireworks = options.maxFireworks || 5;
        this.autoCreate = options.autoCreate !== false; // Mặc định bật
        this.autoCreateInterval = options.autoCreateInterval || 2000; // 2 giây
        this.particleCount = options.particleCount || { min: 15, max: 25 };
        this.particleSpeed = options.particleSpeed || { min: 2, max: 5 };
        this.particleSize = options.particleSize || { min: 2, max: 6 };
        this.colors = options.colors || ['hsl(320, 80%, 70%)', 'hsl(340, 80%, 70%)', 'hsl(0, 80%, 70%)', 'hsl(20, 80%, 70%)'];

        this.isInitialized = true;

        // Bắt đầu animation loop
        this.startAnimation();

        // Bắt đầu tự động tạo pháo hoa
        if (this.autoCreate) {
            this.startAutoCreate();
        }

        // Xử lý resize window
        window.addEventListener('resize', () => this.handleResize());

        console.log('🎆 Fireworks effect initialized successfully');
        return true;
    }

    /**
     * Bắt đầu animation loop
     */
    startAnimation() {
        if (!this.isInitialized) return;

        const animate = () => {
            this.update();
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Dừng animation
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Bắt đầu tự động tạo pháo hoa
     */
    startAutoCreate() {
        this.autoCreateInterval = setInterval(() => {
            if (this.fireworks.length < this.maxFireworks - 1) {
                // Tạo 2 pháo hoa cùng lúc ở vị trí khác nhau
                const x1 = Math.random() * this.width;
                const y1 = Math.random() * this.height * 0.6; // 60% trên cùng
                this.createFirework(x1, y1);

                const x2 = Math.random() * this.width;
                const y2 = Math.random() * this.height * 0.6;
                this.createFirework(x2, y2);
            }
        }, this.autoCreateInterval);
    }

    /**
     * Dừng tự động tạo pháo hoa
     */
    stopAutoCreate() {
        if (this.autoCreateInterval) {
            clearInterval(this.autoCreateInterval);
            this.autoCreateInterval = null;
        }
    }

    /**
     * Tạo pháo hoa tại vị trí cụ thể
     * @param {number} x - Tọa độ X
     * @param {number} y - Tọa độ Y
     * @param {Object} options - Tùy chọn cho pháo hoa cụ thể
     */
    createFirework(x, y, options = {}) {
        const particleCount = options.particleCount || 
            (this.particleCount.min + Math.floor(Math.random() * (this.particleCount.max - this.particleCount.min)));
        
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = options.speed || 
                (this.particleSpeed.min + Math.random() * (this.particleSpeed.max - this.particleSpeed.min));
            const size = options.size || 
                (this.particleSize.min + Math.random() * (this.particleSize.max - this.particleSize.min));

            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                alpha: 1,
                life: 1,
                decay: Math.random() * 0.02 + 0.015,
                hue: options.hue || (Math.random() * 40 + 320), // Pink to red range
                gravity: options.gravity || 0.1,
                trail: []
            });
        }

        this.fireworks.push({
            x: x,
            y: y,
            particles: particles,
            life: 1,
            decay: 0.01
        });
    }

    /**
     * Tạo pháo hoa tại vị trí chuột
     * @param {MouseEvent} event - Sự kiện chuột
     */
    createFireworkAtMouse(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.createFirework(x, y);
    }

    /**
     * Cập nhật trạng thái các pháo hoa
     */
    update() {
        // Cập nhật từng pháo hoa
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];

            // Cập nhật từng particle
            for (let j = firework.particles.length - 1; j >= 0; j--) {
                const particle = firework.particles[j];

                // Cập nhật vị trí
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += particle.gravity;

                // Thêm vào trail
                particle.trail.push({ x: particle.x, y: particle.y });
                if (particle.trail.length > 5) {
                    particle.trail.shift();
                }

                // Cập nhật life
                particle.life -= particle.decay;
                particle.alpha = particle.life;

                // Xóa particle nếu hết life
                if (particle.life <= 0) {
                    firework.particles.splice(j, 1);
                }
            }

            // Xóa pháo hoa nếu hết particles
            if (firework.particles.length === 0) {
                this.fireworks.splice(i, 1);
            }
        }
    }

    /**
     * Vẽ các pháo hoa lên canvas
     */
    draw() {
        // Xóa canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Vẽ từng pháo hoa
        for (let i = 0; i < this.fireworks.length; i++) {
            const firework = this.fireworks[i];

            // Vẽ từng particle
            for (let j = 0; j < firework.particles.length; j++) {
                const particle = firework.particles[j];

                // Vẽ trail
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha * 0.3;
                this.ctx.strokeStyle = `hsl(${particle.hue}, 80%, 70%)`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                for (let k = 0; k < particle.trail.length - 1; k++) {
                    this.ctx.moveTo(particle.trail[k].x, particle.trail[k].y);
                    this.ctx.lineTo(particle.trail[k + 1].x, particle.trail[k + 1].y);
                }
                this.ctx.stroke();
                this.ctx.restore();

                // Vẽ particle (hình trái tim)
                if (particle.life > 0) {
                    this.drawHeartParticle(particle.x, particle.y, particle.size, particle.alpha, particle.hue);
                }
            }
        }
    }

    /**
     * Vẽ particle hình trái tim
     * @param {number} x - Tọa độ X
     * @param {number} y - Tọa độ Y
     * @param {number} size - Kích thước
     * @param {number} alpha - Độ trong suốt
     * @param {number} hue - Màu sắc (HSL)
     */
    drawHeartParticle(x, y, size, alpha, hue) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
        this.ctx.shadowColor = `hsl(${hue}, 80%, 50%)`;
        this.ctx.shadowBlur = 4;

        // Vẽ hình trái tim đơn giản
        this.ctx.beginPath();
        const heartSize = size * 0.5;
        this.ctx.moveTo(x, y + heartSize * 0.3);

        // Đường cong trái
        this.ctx.bezierCurveTo(x, y, x - heartSize * 0.5, y, x - heartSize * 0.5, y + heartSize * 0.3);
        this.ctx.bezierCurveTo(x - heartSize * 0.5, y + heartSize * 0.5, x, y + heartSize * 0.7, x, y + heartSize * 0.9);

        // Đường cong phải
        this.ctx.bezierCurveTo(x, y + heartSize * 0.7, x + heartSize * 0.5, y + heartSize * 0.5, x + heartSize * 0.5, y + heartSize * 0.3);
        this.ctx.bezierCurveTo(x + heartSize * 0.5, y, x, y, x, y + heartSize * 0.3);

        this.ctx.fill();
        this.ctx.restore();
    }

    /**
     * Xử lý resize window
     */
    handleResize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    /**
     * Xóa tất cả pháo hoa
     */
    clear() {
        this.fireworks = [];
    }

    /**
     * Dừng hoàn toàn hiệu ứng
     */
    destroy() {
        this.stopAnimation();
        this.stopAutoCreate();
        this.clear();
        this.isInitialized = false;
        console.log('🎆 Fireworks effect destroyed');
    }

    /**
     * Tạm dừng hiệu ứng
     */
    pause() {
        this.stopAnimation();
        this.stopAutoCreate();
    }

    /**
     * Tiếp tục hiệu ứng
     */
    resume() {
        if (this.isInitialized) {
            this.startAnimation();
            if (this.autoCreate) {
                this.startAutoCreate();
            }
        }
    }

    /**
     * Lấy thông tin trạng thái
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            fireworksCount: this.fireworks.length,
            totalParticles: this.fireworks.reduce((sum, fw) => sum + fw.particles.length, 0),
            isAnimating: this.animationId !== null,
            isAutoCreating: this.autoCreateInterval !== null
        };
    }
}

// Tạo instance global để sử dụng dễ dàng
window.FireworksEffect = FireworksEffect;

// Export cho module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FireworksEffect;
}
