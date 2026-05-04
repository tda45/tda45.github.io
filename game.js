"use strict";
// Sound System
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.enabled = true;
        this.initAudio();
    }
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        }
        catch (e) {
            console.log('Audio not supported');
            this.enabled = false;
        }
    }
    createSounds() {
        // Jump sound
        this.sounds.set('jump', () => this.playTone(400, 0.1, 'square'));
        // Collect sound
        this.sounds.set('collect', () => {
            this.playTone(800, 0.1, 'sine');
            setTimeout(() => this.playTone(1000, 0.1, 'sine'), 50);
        });
        // Hit sound
        this.sounds.set('hit', () => this.playTone(200, 0.2, 'sawtooth'));
        // Game over sound
        this.sounds.set('gameOver', () => {
            this.playTone(300, 0.2, 'square');
            setTimeout(() => this.playTone(200, 0.2, 'square'), 150);
            setTimeout(() => this.playTone(100, 0.3, 'square'), 300);
        });
        // Achievement sound
        this.sounds.set('achievement', () => {
            this.playTone(523, 0.1, 'sine'); // C
            setTimeout(() => this.playTone(659, 0.1, 'sine'), 100); // E
            setTimeout(() => this.playTone(784, 0.2, 'sine'), 200); // G
        });
        // Power-up sounds
        this.sounds.set('powerup', () => {
            this.playTone(600, 0.1, 'sine');
            setTimeout(() => this.playTone(800, 0.1, 'sine'), 100);
            setTimeout(() => this.playTone(1000, 0.15, 'sine'), 200);
        });
    }
    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext)
            return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    play(soundName) {
        const sound = this.sounds.get(soundName);
        if (sound) {
            sound();
        }
    }
    toggleMute() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    isEnabled() {
        return this.enabled;
    }
}
class AchievementManager {
    constructor() {
        this.achievements = [
            { id: 'first_jump', name: 'İlk Zıplama', description: 'Oyunda ilk zıplamayı yap', unlocked: false, icon: '🦘' },
            { id: 'score_10', name: 'Başlangıç', description: '10 skor ulaş', unlocked: false, icon: '🎯' },
            { id: 'score_50', name: 'Usta', description: '50 skor ulaş', unlocked: false, icon: '⭐' },
            { id: 'score_100', name: 'Efsane', description: '100 skor ulaş', unlocked: false, icon: '🏆' },
            { id: 'combo_10', name: 'Combo Master', description: '10 combo yap', unlocked: false, icon: '🔥' },
            { id: 'speed_demon', name: 'Hız Canavarı', description: 'Hız 3x ulaş', unlocked: false, icon: '⚡' },
            { id: 'survivor', name: 'Hayatta Kalan', description: '60 saniye hayatta kal', unlocked: false, icon: '💪' },
            { id: 'perfectionist', name: 'Mükemmeliyetçi', description: 'Hiç çarpmadan 20 skor yap', unlocked: false, icon: '💎' },
            { id: 'powerup_collector', name: 'Power-up Koleksiyoncusu', description: '10 power-up topla', unlocked: false, icon: '⭐' },
            { id: 'rainbow_master', name: 'Gökkuşağı Ustası', description: 'Çift zıplama ile 50 skor yap', unlocked: false, icon: '🌈' }
        ];
        this.loadAchievements();
    }
    loadAchievements() {
        const saved = localStorage.getItem('redRunnerAchievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            this.achievements.forEach(achievement => {
                const saved = savedAchievements.find(a => a.id === achievement.id);
                if (saved) {
                    achievement.unlocked = saved.unlocked;
                }
            });
        }
    }
    saveAchievements() {
        localStorage.setItem('redRunnerAchievements', JSON.stringify(this.achievements));
    }
    unlock(achievementId, soundManager) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveAchievements();
            this.showNotification(achievement);
            if (soundManager) {
                soundManager.play('achievement');
            }
            return true;
        }
        return false;
    }
    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">Başarı Kazanıldı!</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    getUnlockedCount() {
        return this.achievements.filter(a => a.unlocked).length;
    }
    getTotalCount() {
        return this.achievements.length;
    }
    createAchievementPanel() {
        const panel = document.createElement('div');
        panel.id = 'achievement-panel';
        panel.innerHTML = `
            <div class="achievement-toggle" onclick="game.toggleAchievementPanel()">
                🏆 Başarılar (${this.getUnlockedCount()}/${this.getTotalCount()})
            </div>
            <div class="achievement-list" id="achievement-list" style="display: none;">
                ${this.achievements.map(achievement => `
                    <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-info">
                            <div class="achievement-name">${achievement.name}</div>
                            <div class="achievement-description">${achievement.description}</div>
                        </div>
                        <div class="achievement-status">${achievement.unlocked ? '✅' : '🔒'}</div>
                    </div>
                `).join('')}
            </div>
        `;
        document.body.appendChild(panel);
    }
    toggleAchievementPanel() {
        const list = document.getElementById('achievement-list');
        if (list) {
            list.style.display = list.style.display === 'none' ? 'block' : 'none';
        }
    }
}
var ObstacleType;
(function (ObstacleType) {
    ObstacleType["NORMAL"] = "normal";
    ObstacleType["SPIKE"] = "spike";
    ObstacleType["MOVING"] = "moving";
    ObstacleType["FLYING"] = "flying";
})(ObstacleType || (ObstacleType = {}));
class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 40;
        this.height = 40;
        this.velocityY = 0;
        this.jumping = false;
        this.color = '#ff4444';
        this.gameActive = true;
        this.shield = false;
        this.doubleJump = false;
        this.jumpCount = 0;
        this.trail = [];
        this.rainbowTrail = [];
        this.animationFrame = 0;
        this.powerUpTime = 0;
        this.rainbowMode = false;
        this.neonPulse = 0;
        this.rotationAngle = 0;
        this.scale = 1;
        this.glowIntensity = 0;
        this.x = 100;
        this.y = canvasHeight - this.height - 50;
    }
    jump() {
        if (!this.gameActive)
            return;
        if (!this.jumping) {
            this.velocityY = -12;
            this.jumping = true;
            this.jumpCount = 1;
            this.createJumpParticles();
            this.rotationAngle = Math.PI / 4; // Rotation on jump
            this.scale = 1.2; // Scale effect
            this.glowIntensity = 20;
        }
        else if (this.doubleJump && this.jumpCount < 2) {
            this.velocityY = -10;
            this.jumpCount = 2;
            this.createJumpParticles();
            this.createRainbowExplosion();
            this.rainbowMode = true;
            setTimeout(() => this.rainbowMode = false, 1000);
            this.rotationAngle = Math.PI / 2;
            this.scale = 1.5;
            this.glowIntensity = 30;
        }
    }
    setGameActive(active) {
        this.gameActive = active;
    }
    createJumpParticles() {
        for (let i = 0; i < 15; i++) {
            this.trail.push(new Particle(this.x + this.width / 2, this.y + this.height, '#ff6666', 'trail'));
        }
        // Add neon particles
        for (let i = 0; i < 8; i++) {
            this.trail.push(new Particle(this.x + this.width / 2, this.y + this.height, '#ff00ff', 'neon'));
        }
    }
    createRainbowExplosion() {
        for (let i = 0; i < 30; i++) {
            this.rainbowTrail.push(new Particle(this.x + this.width / 2, this.y + this.height / 2, '#ff00ff', 'rainbow'));
        }
    }
    update(gravity, canvasHeight) {
        this.velocityY += gravity;
        this.y += this.velocityY;
        this.animationFrame++;
        // Update visual effects
        this.neonPulse += 0.1;
        this.rotationAngle *= 0.95; // Smooth rotation return
        this.scale += (1 - this.scale) * 0.1; // Smooth scale return
        this.glowIntensity *= 0.9; // Fade glow
        // Create continuous rainbow trail when in rainbow mode
        if (this.rainbowMode && Math.random() > 0.7) {
            this.rainbowTrail.push(new Particle(this.x + this.width / 2 + (Math.random() - 0.5) * this.width, this.y + this.height, '#ff00ff', 'rainbow'));
        }
        // Update trails
        this.trail = this.trail.filter(p => {
            p.update();
            return p.life > 0;
        });
        this.rainbowTrail = this.rainbowTrail.filter(p => {
            p.update();
            return p.life > 0;
        });
        // Ground collision with effects
        if (this.y >= canvasHeight - this.height - 50) {
            this.y = canvasHeight - this.height - 50;
            this.velocityY = 0;
            this.jumping = false;
            this.jumpCount = 0;
            // Landing effects
            if (this.glowIntensity > 5) {
                this.createLandingParticles();
            }
        }
        // Update power-up timer
        if (this.powerUpTime > 0) {
            this.powerUpTime--;
            if (this.powerUpTime === 0) {
                this.shield = false;
                this.doubleJump = false;
            }
        }
    }
    createLandingParticles() {
        for (let i = 0; i < 10; i++) {
            this.trail.push(new Particle(this.x + this.width / 2, this.y + this.height, '#ffff00', 'explosion'));
        }
    }
    draw(ctx) {
        // Draw rainbow trail (behind everything)
        this.rainbowTrail.forEach(p => p.draw(ctx));
        // Draw normal trail
        this.trail.forEach(p => p.draw(ctx));
        // Draw shield effect with neon animation
        if (this.shield) {
            const pulseSize = this.width + Math.sin(this.neonPulse) * 5;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, pulseSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.fill();
            // Additional neon rings
            for (let i = 1; i <= 3; i++) {
                ctx.globalAlpha = 0.3 / i;
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, pulseSize + i * 10, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
        // Draw player with extreme animations
        const wobble = Math.sin(this.animationFrame * 0.1) * 2;
        const breathing = Math.sin(this.animationFrame * 0.05) * 0.05 + 1;
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotationAngle + wobble * 0.01);
        ctx.scale(this.scale * breathing, this.scale * breathing);
        ctx.translate(-this.width / 2, -this.height / 2);
        // Extreme glow effect
        const glowColor = this.rainbowMode ?
            `hsl(${(this.animationFrame * 3) % 360}, 100%, 50%)` :
            (this.shield ? '#00ffff' : this.color);
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = this.glowIntensity + 15;
        // Rainbow gradient body
        let gradient;
        if (this.rainbowMode) {
            gradient = ctx.createLinearGradient(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2);
            for (let i = 0; i <= 5; i++) {
                const hue = ((this.animationFrame * 2 + i * 60) % 360);
                gradient.addColorStop(i / 5, `hsl(${hue}, 100%, 50%)`);
            }
        }
        else {
            gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width);
            gradient.addColorStop(0, '#ff6666');
            gradient.addColorStop(0.5, '#ff4444');
            gradient.addColorStop(1, this.color);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        // Neon border
        if (this.rainbowMode || this.shield) {
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        ctx.shadowBlur = 0;
        ctx.restore();
        // Animated eyes with rainbow effect
        const eyeBlink = Math.random() > 0.98 ? 0 : 1;
        const eyeColor = this.rainbowMode ?
            `hsl(${(this.animationFrame * 4) % 360}, 100%, 70%)` :
            '#ffffff';
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x + 8, this.y + 10, 8, 8 * eyeBlink);
        ctx.fillRect(this.x + 24, this.y + 10, 8, 8 * eyeBlink);
        if (eyeBlink === 1) {
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 0;
            ctx.fillRect(this.x + 10, this.y + 12, 4, 4);
            ctx.fillRect(this.x + 26, this.y + 12, 4, 4);
        }
        // Add sparkles around player in rainbow mode
        if (this.rainbowMode && Math.random() > 0.8) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            const sparkleX = this.x + this.width / 2 + (Math.random() - 0.5) * this.width * 2;
            const sparkleY = this.y + this.height / 2 + (Math.random() - 0.5) * this.height * 2;
            ctx.fillRect(sparkleX, sparkleY, 2, 2);
            ctx.shadowBlur = 0;
        }
    }
}
class Obstacle {
    constructor(canvasWidth, canvasHeight, speed, type = ObstacleType.NORMAL) {
        this.color = '#8b0000';
        this.moveDirection = 1;
        this.animationFrame = 0;
        this.type = type;
        this.speed = speed;
        this.x = canvasWidth;
        switch (type) {
            case ObstacleType.FLYING:
                this.width = 50;
                this.height = 20;
                this.y = canvasHeight - 150 - Math.random() * 100;
                break;
            case ObstacleType.MOVING:
                this.width = 40;
                this.height = 40;
                this.y = canvasHeight - this.height - 50;
                break;
            case ObstacleType.SPIKE:
                this.width = 30;
                this.height = 50;
                this.y = canvasHeight - this.height - 50;
                break;
            default:
                this.width = 30 + Math.random() * 30;
                this.height = 40 + Math.random() * 40;
                this.y = canvasHeight - this.height - 50;
        }
        this.originalY = this.y;
    }
    update() {
        this.x -= this.speed;
        this.animationFrame++;
        switch (this.type) {
            case ObstacleType.MOVING:
                this.y += Math.sin(this.animationFrame * 0.1) * 2;
                break;
            case ObstacleType.FLYING:
                this.y += Math.sin(this.animationFrame * 0.05) * 1.5;
                break;
        }
    }
    draw(ctx) {
        ctx.save();
        switch (this.type) {
            case ObstacleType.FLYING:
                // Draw flying obstacle with wings
                ctx.fillStyle = '#ff6666';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                // Animated wings
                const wingFlap = Math.sin(this.animationFrame * 0.2) * 5;
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(this.x - 10, this.y - 5 + wingFlap, 15, 5);
                ctx.fillRect(this.x + this.width - 5, this.y - 5 - wingFlap, 15, 5);
                break;
            case ObstacleType.SPIKE:
                // Draw spike obstacle
                ctx.fillStyle = '#8b0000';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + this.height);
                ctx.lineTo(this.x + this.width / 2, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.closePath();
                ctx.fill();
                // Add glow effect
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 10;
                ctx.strokeStyle = '#ff6666';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.shadowBlur = 0;
                break;
            case ObstacleType.MOVING:
                // Draw moving obstacle with gradient
                const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
                gradient.addColorStop(0, '#ff6666');
                gradient.addColorStop(1, this.color);
                ctx.fillStyle = gradient;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                // Add rotation effect
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(this.animationFrame * 0.02);
                ctx.translate(-this.width / 2, -this.height / 2);
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                break;
            default:
                // Normal obstacle
                const normalGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
                normalGradient.addColorStop(0, '#ff6666');
                normalGradient.addColorStop(1, this.color);
                ctx.fillStyle = normalGradient;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                // Draw spikes on top
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width / 2, this.y - 10);
                ctx.lineTo(this.x + this.width, this.y);
                ctx.closePath();
                ctx.fill();
        }
        ctx.restore();
    }
    isOffScreen() {
        return this.x + this.width < 0;
    }
}
class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.hue = Math.random() * 360;
        switch (type) {
            case 'rainbow':
                this.color = `hsl(${this.hue}, 100%, 50%)`;
                this.velocityX = (Math.random() - 0.5) * 8;
                this.velocityY = (Math.random() - 0.5) * 8;
                this.size = Math.random() * 6 + 2;
                break;
            case 'neon':
                this.color = `hsl(${Math.random() * 60 + 280}, 100%, 60%)`;
                this.velocityX = (Math.random() - 0.5) * 6;
                this.velocityY = (Math.random() - 0.5) * 6;
                this.size = Math.random() * 8 + 3;
                break;
            case 'explosion':
                this.color = color || `hsl(${Math.random() * 60}, 100%, 50%)`;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 10 + 5;
                this.velocityX = Math.cos(angle) * speed;
                this.velocityY = Math.sin(angle) * speed;
                this.size = Math.random() * 10 + 5;
                break;
            case 'trail':
                this.color = color || `hsl(${this.hue}, 100%, 50%)`;
                this.velocityX = (Math.random() - 0.5) * 2;
                this.velocityY = Math.random() * 2 + 1;
                this.size = Math.random() * 4 + 1;
                break;
            default:
                this.color = color || `hsl(${Math.random() * 60}, 100%, 50%)`;
                this.velocityX = (Math.random() - 0.5) * 4;
                this.velocityY = (Math.random() - 0.5) * 4;
                this.size = Math.random() * 4 + 2;
        }
        this.life = 1.0;
    }
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        if (this.type === 'rainbow') {
            this.hue += 5;
            this.color = `hsl(${this.hue % 360}, 100%, 50%)`;
        }
        if (this.type === 'explosion') {
            this.velocityY += 0.3; // gravity
            this.velocityX *= 0.98; // friction
        }
        this.life -= this.type === 'explosion' ? 0.015 : 0.02;
        this.size *= 0.98;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        if (this.type === 'neon') {
            // Neon glow effect
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            // Inner bright core
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (this.type === 'rainbow') {
            // Rainbow star shape
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            this.drawStar(ctx, this.x, this.y, this.size, 5);
        }
        else if (this.type === 'explosion') {
            // Explosion flash
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, this.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        else {
            // Normal particle
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }
        ctx.restore();
    }
    drawStar(ctx, x, y, size, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? size : size * 0.5;
            const px = x + Math.cos(angle - Math.PI / 2) * radius;
            const py = y + Math.sin(angle - Math.PI / 2) * radius;
            if (i === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }
}
class PowerUp {
    constructor(canvasWidth, canvasHeight) {
        this.width = 30;
        this.height = 30;
        this.collected = false;
        this.animationFrame = 0;
        this.floatY = 0;
        this.x = canvasWidth + Math.random() * 200;
        this.y = canvasHeight - 100 - Math.random() * 100;
        const types = ['speed', 'shield', 'magnet', 'double', 'slowmo'];
        this.type = types[Math.floor(Math.random() * types.length)];
    }
    update() {
        this.animationFrame++;
        this.floatY = Math.sin(this.animationFrame * 0.1) * 5;
    }
    draw(ctx) {
        const y = this.y + this.floatY;
        ctx.save();
        ctx.translate(this.x + this.width / 2, y + this.height / 2);
        ctx.rotate(this.animationFrame * 0.02);
        // Draw power-up based on type
        switch (this.type) {
            case 'speed':
                ctx.fillStyle = '#ffff00';
                ctx.shadowColor = '#ffff00';
                break;
            case 'shield':
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                break;
            case 'magnet':
                ctx.fillStyle = '#ff00ff';
                ctx.shadowColor = '#ff00ff';
                break;
            case 'double':
                ctx.fillStyle = '#00ff00';
                ctx.shadowColor = '#00ff00';
                break;
            case 'slowmo':
                ctx.fillStyle = '#ff8800';
                ctx.shadowColor = '#ff8800';
                break;
        }
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        // Draw icon
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icons = {
            speed: '⚡',
            shield: '🛡',
            magnet: '🧲',
            double: '2x',
            slowmo: '⏱'
        };
        ctx.fillText(icons[this.type], 0, 0);
        ctx.restore();
    }
}
class Background {
    constructor(canvasWidth, canvasHeight) {
        this.stars = [];
        this.clouds = [];
        this.groundOffset = 0;
        this.lightning = [];
        this.aurora = [];
        this.animationFrame = 0;
        // Create enhanced stars with different types
        for (let i = 0; i < 150; i++) {
            const types = ['normal', 'normal', 'rainbow', 'neon'];
            this.stars.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * (canvasHeight - 100),
                size: Math.random() * 3 + 0.5,
                speed: Math.random() * 0.8 + 0.1,
                hue: Math.random() * 360,
                type: types[Math.floor(Math.random() * types.length)]
            });
        }
        // Create rainbow clouds
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * canvasWidth * 2,
                y: Math.random() * 150 + 50,
                width: Math.random() * 120 + 60,
                height: Math.random() * 40 + 20,
                speed: Math.random() * 0.4 + 0.1,
                hue: Math.random() * 360
            });
        }
        // Create aurora effects
        for (let i = 0; i < 3; i++) {
            this.aurora.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * 100,
                width: Math.random() * 200 + 100,
                height: Math.random() * 80 + 40,
                hue: Math.random() * 120 + 180, // Green to purple range
                alpha: Math.random() * 0.3 + 0.1
            });
        }
    }
    update(gameSpeed) {
        this.animationFrame++;
        // Update stars with twinkling
        this.stars.forEach(star => {
            star.x -= star.speed * (gameSpeed / 5);
            star.hue = (star.hue + 1) % 360;
            if (star.x < 0) {
                star.x = 800;
                star.y = Math.random() * 350;
                star.hue = Math.random() * 360;
            }
        });
        // Update rainbow clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed * (gameSpeed / 5);
            cloud.hue = (cloud.hue + 0.5) % 360;
            if (cloud.x + cloud.width < 0) {
                cloud.x = 800 + Math.random() * 200;
                cloud.hue = Math.random() * 360;
            }
        });
        // Update aurora
        this.aurora.forEach(aurora => {
            aurora.x -= 0.2;
            aurora.hue = (aurora.hue + 0.2) % 360;
            aurora.alpha = 0.2 + Math.sin(this.animationFrame * 0.02 + aurora.x * 0.01) * 0.1;
            if (aurora.x + aurora.width < 0) {
                aurora.x = 800;
                aurora.hue = Math.random() * 120 + 180;
            }
        });
        // Random lightning
        if (Math.random() > 0.98) {
            this.lightning.push({
                x: Math.random() * 800,
                y: 0,
                life: 5,
                intensity: Math.random() * 0.5 + 0.5
            });
        }
        // Update lightning
        this.lightning = this.lightning.filter(bolt => {
            bolt.life--;
            return bolt.life > 0;
        });
        // Update ground
        this.groundOffset -= gameSpeed;
        if (this.groundOffset <= -40) {
            this.groundOffset = 0;
        }
    }
    draw(ctx, canvasWidth, canvasHeight) {
        // Animated gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        const hue1 = (this.animationFrame * 0.5) % 360;
        const hue2 = (hue1 + 30) % 360;
        gradient.addColorStop(0, `hsl(${hue1}, 50%, 5%)`);
        gradient.addColorStop(0.3, `hsl(${hue2}, 60%, 10%)`);
        gradient.addColorStop(0.7, '#1a0505');
        gradient.addColorStop(1, '#2a0a0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        // Draw aurora
        this.aurora.forEach(aurora => {
            const auroraGradient = ctx.createLinearGradient(aurora.x, aurora.y, aurora.x + aurora.width, aurora.y + aurora.height);
            auroraGradient.addColorStop(0, `hsla(${aurora.hue}, 100%, 50%, 0)`);
            auroraGradient.addColorStop(0.5, `hsla(${aurora.hue}, 100%, 50%, ${aurora.alpha})`);
            auroraGradient.addColorStop(1, `hsla(${aurora.hue + 30}, 100%, 50%, 0)`);
            ctx.fillStyle = auroraGradient;
            ctx.fillRect(aurora.x, aurora.y, aurora.width, aurora.height);
        });
        // Draw enhanced stars
        this.stars.forEach(star => {
            const twinkle = Math.sin(this.animationFrame * 0.1 + star.x * 0.01) * 0.5 + 0.5;
            ctx.globalAlpha = twinkle * (star.size / 3);
            if (star.type === 'rainbow') {
                ctx.fillStyle = `hsl(${star.hue}, 100%, 70%)`;
                ctx.shadowColor = `hsl(${star.hue}, 100%, 50%)`;
                ctx.shadowBlur = 10;
            }
            else if (star.type === 'neon') {
                ctx.fillStyle = `hsl(${star.hue + 280}, 100%, 60%)`;
                ctx.shadowColor = `hsl(${star.hue + 280}, 100%, 40%)`;
                ctx.shadowBlur = 15;
            }
            else {
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 5;
            }
            // Draw star shape
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI / 2) + this.animationFrame * 0.01;
                const x = star.x + Math.cos(angle) * star.size;
                const y = star.y + Math.sin(angle) * star.size;
                if (i === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = 1;
        // Draw rainbow clouds
        this.clouds.forEach(cloud => {
            const cloudGradient = ctx.createRadialGradient(cloud.x + cloud.width / 2, cloud.y + cloud.height / 2, 0, cloud.x + cloud.width / 2, cloud.y + cloud.height / 2, cloud.width / 2);
            cloudGradient.addColorStop(0, `hsla(${cloud.hue}, 70%, 60%, 0.3)`);
            cloudGradient.addColorStop(0.5, `hsla(${cloud.hue + 30}, 80%, 50%, 0.2)`);
            cloudGradient.addColorStop(1, `hsla(${cloud.hue + 60}, 90%, 40%, 0)`);
            ctx.fillStyle = cloudGradient;
            ctx.beginPath();
            ctx.ellipse(cloud.x + cloud.width / 2, cloud.y + cloud.height / 2, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        // Draw lightning
        this.lightning.forEach(bolt => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.life * bolt.intensity})`;
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.moveTo(bolt.x, bolt.y);
            let currentX = bolt.x;
            let currentY = bolt.y;
            while (currentY < canvasHeight - 100) {
                currentY += Math.random() * 50 + 20;
                currentX += (Math.random() - 0.5) * 40;
                ctx.lineTo(currentX, currentY);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
    }
}
class RedRunnerGame {
    constructor() {
        this.obstacles = [];
        this.powerUps = [];
        this.particles = [];
        this.score = 0;
        this.highScore = 0;
        this.combo = 0;
        this.multiplier = 1;
        this.gameSpeed = 5;
        this.gravity = 0.5;
        this.isRunning = false;
        this.isPaused = false;
        this.frameCount = 0;
        this.obstacleSpawnRate = 120;
        this.powerUpSpawnRate = 300;
        this.screenShake = 0;
        this.powerUpCount = 0;
        this.maxCombo = 0;
        this.survialTime = 0;
        this.perfectRun = true;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.background = new Background(this.canvas.width, this.canvas.height);
        this.soundManager = new SoundManager();
        this.achievementManager = new AchievementManager();
        this.loadHighScore();
        this.setupEventListeners();
        this.createAchievementPanel();
    }
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isRunning && !this.isPaused) {
                e.preventDefault();
                this.player.jump();
                this.soundManager.play('jump');
                this.createJumpParticles();
                // First jump achievement
                if (this.frameCount < 100) {
                    this.achievementManager.unlock('first_jump', this.soundManager);
                }
            }
            // Mute toggle with M key
            if (e.code === 'KeyM') {
                const enabled = this.soundManager.toggleMute();
                this.showMuteNotification(enabled);
            }
        });
        // Button controls
        document.getElementById('startBtn')?.addEventListener('click', () => this.start());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());
        document.getElementById('restartBtn')?.addEventListener('click', () => {
            document.getElementById('gameOver').style.display = 'none';
            this.reset();
            this.start();
        });
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isRunning && !this.isPaused) {
                this.player.jump();
                this.soundManager.play('jump');
                this.createJumpParticles();
                // First jump achievement
                if (this.frameCount < 100) {
                    this.achievementManager.unlock('first_jump', this.soundManager);
                }
            }
        });
    }
    createJumpParticles() {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(this.player.x + this.player.width / 2, this.player.y + this.player.height));
        }
    }
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.gameLoop();
        }
    }
    togglePause() {
        if (this.isRunning) {
            this.isPaused = !this.isPaused;
            if (!this.isPaused) {
                this.gameLoop();
            }
        }
    }
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.combo = 0;
        this.multiplier = 1;
        this.gameSpeed = 5;
        this.frameCount = 0;
        this.obstacleSpawnRate = 120;
        this.powerUpSpawnRate = 300;
        this.obstacles = [];
        this.powerUps = [];
        this.particles = [];
        this.screenShake = 0;
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.player.setGameActive(true); // Enable jumping when reset
        this.updateUI();
        this.draw();
    }
    spawnObstacle() {
        if (this.frameCount % this.obstacleSpawnRate === 0) {
            // Random obstacle type based on score
            let type = ObstacleType.NORMAL;
            if (this.score > 20) {
                const obstacleTypes = [ObstacleType.NORMAL, ObstacleType.MOVING, ObstacleType.SPIKE];
                type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            }
            if (this.score > 50) {
                const advancedTypes = [ObstacleType.NORMAL, ObstacleType.MOVING, ObstacleType.SPIKE, ObstacleType.FLYING];
                type = advancedTypes[Math.floor(Math.random() * advancedTypes.length)];
            }
            this.obstacles.push(new Obstacle(this.canvas.width, this.canvas.height, this.gameSpeed, type));
            // Increase difficulty
            if (this.score > 0 && this.score % 10 === 0) {
                this.gameSpeed += 0.5;
                this.obstacleSpawnRate = Math.max(40, this.obstacleSpawnRate - 5);
                this.powerUpSpawnRate = Math.max(150, this.powerUpSpawnRate - 10);
            }
        }
    }
    spawnPowerUp() {
        if (this.frameCount % this.powerUpSpawnRate === 0 && Math.random() > 0.3) {
            this.powerUps.push(new PowerUp(this.canvas.width, this.canvas.height));
        }
    }
    collectPowerUp(powerUp) {
        powerUp.collected = true;
        this.createCollectParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        switch (powerUp.type) {
            case 'shield':
                this.player.shield = true;
                this.player.powerUpTime = 300;
                break;
            case 'double':
                this.player.doubleJump = true;
                this.player.powerUpTime = 400;
                break;
            case 'speed':
                this.gameSpeed = Math.min(15, this.gameSpeed + 2);
                break;
            case 'slowmo':
                this.gameSpeed = Math.max(3, this.gameSpeed - 2);
                break;
            case 'magnet':
                this.multiplier = 2;
                setTimeout(() => this.multiplier = 1, 5000);
                break;
        }
        this.score += 5 * this.multiplier;
        this.screenShake = 10;
        this.powerUpCount++;
        this.soundManager.play('powerup');
        // Power-up collector achievement
        if (this.powerUpCount === 10) {
            this.achievementManager.unlock('powerup_collector', this.soundManager);
        }
        // Rainbow master achievement
        if (this.player.rainbowMode && this.score >= 50) {
            this.achievementManager.unlock('rainbow_master', this.soundManager);
        }
    }
    createCollectParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, '#ffff00'));
        }
    }
    checkCollisions() {
        // Check obstacle collisions
        for (const obstacle of this.obstacles) {
            if (this.player.x < obstacle.x + obstacle.width &&
                this.player.x + this.player.width > obstacle.x &&
                this.player.y < obstacle.y + obstacle.height &&
                this.player.y + this.player.height > obstacle.y) {
                if (this.player.shield) {
                    this.player.shield = false;
                    this.player.powerUpTime = 0;
                    this.createExplosionParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
                    this.screenShake = 15;
                    return false;
                }
                return true;
            }
        }
        // Check power-up collisions
        for (const powerUp of this.powerUps) {
            if (!powerUp.collected &&
                this.player.x < powerUp.x + powerUp.width &&
                this.player.x + this.player.width > powerUp.x &&
                this.player.y < powerUp.y + powerUp.height &&
                this.player.y + this.player.height > powerUp.y) {
                this.collectPowerUp(powerUp);
            }
        }
        return false;
    }
    createExplosionParticles(x, y) {
        for (let i = 0; i < 30; i++) {
            this.particles.push(new Particle(x, y, '#ff4444'));
        }
    }
    update() {
        if (!this.isRunning || this.isPaused)
            return;
        this.frameCount++;
        this.survialTime++;
        this.player.update(this.gravity, this.canvas.height);
        this.spawnObstacle();
        this.spawnPowerUp();
        // Update background
        this.background.update(this.gameSpeed);
        // Update obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.update();
            if (obstacle.isOffScreen()) {
                this.score += this.multiplier;
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                if (this.combo > 5) {
                    this.multiplier = Math.min(3, Math.floor(this.combo / 5) + 1);
                }
                // Score achievements
                if (this.score === 10) {
                    this.achievementManager.unlock('score_10', this.soundManager);
                }
                if (this.score === 50) {
                    this.achievementManager.unlock('score_50', this.soundManager);
                }
                if (this.score === 100) {
                    this.achievementManager.unlock('score_100', this.soundManager);
                }
                // Combo achievements
                if (this.combo === 10) {
                    this.achievementManager.unlock('combo_10', this.soundManager);
                }
                // Speed achievements
                if (this.gameSpeed >= 15) {
                    this.achievementManager.unlock('speed_demon', this.soundManager);
                }
                // Perfectionist achievement
                if (this.score === 20 && this.perfectRun) {
                    this.achievementManager.unlock('perfectionist', this.soundManager);
                }
                this.soundManager.play('collect');
                return false;
            }
            return true;
        });
        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();
            return !powerUp.collected && powerUp.x > -powerUp.width;
        });
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake--;
        }
        // Check collisions
        if (this.checkCollisions()) {
            this.combo = 0;
            this.perfectRun = false;
            this.soundManager.play('hit');
            this.gameOver();
        }
        // Survivor achievement
        if (this.survialTime === 3600) { // 60 seconds at 60fps
            this.achievementManager.unlock('survivor', this.soundManager);
        }
        this.updateUI();
    }
    draw() {
        // Apply screen shake
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.save();
            this.ctx.translate(shakeX, shakeY);
        }
        // Draw background
        this.background.draw(this.ctx, this.canvas.width, this.canvas.height);
        // Draw ground with parallax
        const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height - 50, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#1a0505');
        groundGradient.addColorStop(1, '#0a0000');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        // Draw moving ground lines
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 2;
        for (let i = this.background.groundOffset; i < this.canvas.width; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.canvas.height - 50);
            this.ctx.lineTo(i + 20, this.canvas.height - 50);
            this.ctx.stroke();
        }
        // Draw particles (behind obstacles)
        this.particles.forEach(particle => particle.draw(this.ctx));
        // Draw power-ups
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        // Draw player
        this.player.draw(this.ctx);
        // Draw UI elements
        this.drawUI();
        if (this.screenShake > 0) {
            this.ctx.restore();
        }
    }
    drawUI() {
        // Score and multiplier
        this.ctx.fillStyle = '#ff6666';
        this.ctx.font = 'bold 20px Inter';
        this.ctx.fillText(`Skor: ${this.score}`, 10, 30);
        if (this.multiplier > 1) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText(`${this.multiplier}x`, 10, 55);
        }
        // Combo indicator
        if (this.combo > 5) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 16px Inter';
            this.ctx.fillText(`Combo: ${this.combo}`, 10, 80);
        }
        // Power-up indicators
        let yOffset = 30;
        if (this.player.shield) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillText('🛡 Shield', this.canvas.width - 100, yOffset);
            yOffset += 25;
        }
        if (this.player.doubleJump) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillText('2X Jump', this.canvas.width - 100, yOffset);
            yOffset += 25;
        }
        // Speed indicator
        const speedColor = this.gameSpeed > 10 ? '#ff0000' : this.gameSpeed > 7 ? '#ff8800' : '#ffff00';
        this.ctx.fillStyle = speedColor;
        this.ctx.fillText(`Speed: ${this.gameSpeed.toFixed(1)}`, this.canvas.width - 100, this.canvas.height - 20);
    }
    updateUI() {
        document.getElementById('score').textContent = this.score.toString();
        document.getElementById('highScore').textContent = this.highScore.toString();
        document.getElementById('speed').textContent = (this.gameSpeed / 5).toFixed(1);
    }
    gameOver() {
        this.isRunning = false;
        this.player.setGameActive(false); // Disable jumping when game is over
        // Play game over sound
        this.soundManager.play('gameOver');
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        document.getElementById('finalScore').textContent = this.score.toString();
        document.getElementById('gameOver').style.display = 'block';
    }
    createAchievementPanel() {
        this.achievementManager.createAchievementPanel();
    }
    toggleAchievementPanel() {
        this.achievementManager.toggleAchievementPanel();
    }
    showMuteNotification(enabled) {
        const notification = document.createElement('div');
        notification.className = 'mute-notification';
        notification.textContent = enabled ? '🔊 Ses Açık' : '🔇 Ses Kapalı';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 18px;
            z-index: 1000;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 1000);
    }
    loadHighScore() {
        const saved = localStorage.getItem('redRunnerHighScore');
        if (saved) {
            this.highScore = parseInt(saved);
        }
    }
    saveHighScore() {
        localStorage.setItem('redRunnerHighScore', this.highScore.toString());
    }
    gameLoop() {
        if (!this.isRunning || this.isPaused)
            return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}
// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new RedRunnerGame();
    game.draw(); // Initial draw
});
//# sourceMappingURL=game.js.map