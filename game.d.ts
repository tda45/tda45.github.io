interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
}
declare class SoundManager {
    private audioContext;
    private sounds;
    private enabled;
    constructor();
    private initAudio;
    private createSounds;
    private playTone;
    play(soundName: string): void;
    toggleMute(): boolean;
    isEnabled(): boolean;
}
interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    icon: string;
}
declare class AchievementManager {
    private achievements;
    constructor();
    private loadAchievements;
    private saveAchievements;
    unlock(achievementId: string, soundManager?: SoundManager): boolean;
    private showNotification;
    getUnlockedCount(): number;
    getTotalCount(): number;
    createAchievementPanel(): void;
    toggleAchievementPanel(): void;
}
interface PowerUp extends GameObject {
    type: 'speed' | 'shield' | 'magnet' | 'double' | 'slowmo';
    duration: number;
    collected: boolean;
}
interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    icon: string;
}
declare enum ObstacleType {
    NORMAL = "normal",
    SPIKE = "spike",
    MOVING = "moving",
    FLYING = "flying"
}
declare class Player implements GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityY: number;
    jumping: boolean;
    color: string;
    gameActive: boolean;
    shield: boolean;
    doubleJump: boolean;
    jumpCount: number;
    trail: Particle[];
    rainbowTrail: Particle[];
    animationFrame: number;
    powerUpTime: number;
    rainbowMode: boolean;
    neonPulse: number;
    rotationAngle: number;
    scale: number;
    glowIntensity: number;
    constructor(canvasWidth: number, canvasHeight: number);
    jump(): void;
    setGameActive(active: boolean): void;
    createJumpParticles(): void;
    createRainbowExplosion(): void;
    update(gravity: number, canvasHeight: number): void;
    createLandingParticles(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
declare class Obstacle implements GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    color: string;
    type: ObstacleType;
    originalY: number;
    moveDirection: number;
    animationFrame: number;
    constructor(canvasWidth: number, canvasHeight: number, speed: number, type?: ObstacleType);
    update(): void;
    draw(ctx: CanvasRenderingContext2D): void;
    isOffScreen(): boolean;
}
declare class Particle {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    life: number;
    color: string;
    size: number;
    type: 'normal' | 'rainbow' | 'neon' | 'explosion' | 'trail';
    hue: number;
    constructor(x: number, y: number, color?: string, type?: Particle['type']);
    update(): void;
    draw(ctx: CanvasRenderingContext2D): void;
    drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, points: number): void;
}
declare class PowerUp implements GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'speed' | 'shield' | 'magnet' | 'double' | 'slowmo';
    collected: boolean;
    animationFrame: number;
    floatY: number;
    constructor(canvasWidth: number, canvasHeight: number);
    update(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
declare class Background {
    stars: {
        x: number;
        y: number;
        size: number;
        speed: number;
        hue: number;
        type: 'normal' | 'rainbow' | 'neon';
    }[];
    clouds: {
        x: number;
        y: number;
        width: number;
        height: number;
        speed: number;
        hue: number;
    }[];
    groundOffset: number;
    lightning: {
        x: number;
        y: number;
        life: number;
        intensity: number;
    }[];
    aurora: {
        x: number;
        y: number;
        width: number;
        height: number;
        hue: number;
        alpha: number;
    }[];
    animationFrame: number;
    constructor(canvasWidth: number, canvasHeight: number);
    update(gameSpeed: number): void;
    draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void;
}
declare class RedRunnerGame {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;
    obstacles: Obstacle[];
    powerUps: PowerUp[];
    particles: Particle[];
    background: Background;
    score: number;
    highScore: number;
    combo: number;
    multiplier: number;
    gameSpeed: number;
    gravity: number;
    isRunning: boolean;
    isPaused: boolean;
    frameCount: number;
    obstacleSpawnRate: number;
    powerUpSpawnRate: number;
    screenShake: number;
    soundManager: SoundManager;
    achievementManager: AchievementManager;
    powerUpCount: number;
    maxCombo: number;
    survialTime: number;
    perfectRun: boolean;
    constructor();
    setupEventListeners(): void;
    createJumpParticles(): void;
    start(): void;
    togglePause(): void;
    reset(): void;
    spawnObstacle(): void;
    spawnPowerUp(): void;
    collectPowerUp(powerUp: PowerUp): void;
    createCollectParticles(x: number, y: number): void;
    checkCollisions(): boolean;
    createExplosionParticles(x: number, y: number): void;
    update(): void;
    draw(): void;
    drawUI(): void;
    updateUI(): void;
    gameOver(): void;
    createAchievementPanel(): void;
    toggleAchievementPanel(): void;
    showMuteNotification(enabled: boolean): void;
    loadHighScore(): void;
    saveHighScore(): void;
    gameLoop(): void;
}
