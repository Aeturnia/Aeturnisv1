export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private lastTime: number;
  private fps: number;
  private frameCount: number;
  private fpsUpdateTime: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.lastTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsUpdateTime = 0;
    
    this.resize();
    this.init();
  }

  private init() {
    // TODO: Initialize game objects, sprites, etc.
    console.log('Game Engine initialized with canvas:', this.width, 'x', this.height);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    // Set canvas resolution to match display size
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    console.log('Canvas resized to:', this.width, 'x', this.height);
  }

  update(deltaTime: number) {
    // TODO: Update game logic here
    // Example: Update player position, enemy AI, physics, etc.
    
    // Calculate FPS
    this.frameCount++;
    this.fpsUpdateTime += deltaTime;
    
    if (this.fpsUpdateTime >= 1000) { // Update FPS every second
      this.fps = Math.round(this.frameCount * 1000 / this.fpsUpdateTime);
      this.frameCount = 0;
      this.fpsUpdateTime = 0;
    }
  }

  render() {
    // Clear the canvas
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // TODO: Render game objects here
    // Example: Draw sprites, UI elements, etc.
    
    // Draw a simple grid for reference (optional)
    this.drawGrid();
    
    // Draw center point for reference
    this.drawCenterPoint();
    
    // Draw FPS counter
    this.drawFPS();
    
    // Draw instructions
    this.drawInstructions();
  }

  private drawGrid() {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    
    const gridSize = 50;
    
    // Vertical lines
    for (let x = 0; x <= this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  private drawCenterPoint() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw center cross
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 10, centerY);
    this.ctx.lineTo(centerX + 10, centerY);
    this.ctx.moveTo(centerX, centerY - 10);
    this.ctx.lineTo(centerX, centerY + 10);
    this.ctx.stroke();
  }

  private drawFPS() {
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 30);
  }

  private drawInstructions() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';
    
    const instructions = [
      'Empty Game Development Environment',
      'Press F to toggle fullscreen',
      'Click and drag to test mouse input',
      'Use keyboard for input testing',
      'Check console for input logs'
    ];
    
    instructions.forEach((instruction, index) => {
      this.ctx.fillText(instruction, 10, this.height - 100 + (index * 15));
    });
  }

  // Method to add game objects (empty implementation ready for extension)
  addGameObject(object: any) {
    // TODO: Implement game object management
    console.log('Game object added:', object);
  }

  // Method to remove game objects (empty implementation ready for extension)
  removeGameObject(object: any) {
    // TODO: Implement game object removal
    console.log('Game object removed:', object);
  }

  // Method to get canvas coordinates from screen coordinates
  getCanvasCoordinates(screenX: number, screenY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: screenX - rect.left,
      y: screenY - rect.top
    };
  }

  // Cleanup method
  destroy() {
    // TODO: Cleanup resources, event listeners, etc.
    console.log('Game Engine destroyed');
  }
}
