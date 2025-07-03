# Client Assets

## Directory Structure

- **`images/`** - Game graphics, UI elements, icons
- **`sounds/`** - Audio files, sound effects, music
- **`fonts/`** - Custom fonts for the game UI
- **`data/`** - Static game data files (JSON, CSV)

## Asset Guidelines

### Images
- Use PNG for UI elements and sprites
- Use WebP for large background images
- Keep file sizes optimized for web delivery
- Use consistent naming conventions

### Sounds
- Use MP3 for music tracks
- Use OGG for sound effects
- Keep audio files under 5MB each
- Use consistent volume levels

### Fonts
- Include web-safe fallbacks
- Use WOFF2 format for better compression
- Test font rendering across devices

## Asset Loading

Assets are loaded using Vite's asset handling:

```typescript
// Images
import heroSprite from '@/assets/images/hero.png';

// Sounds
import bgMusic from '@/assets/sounds/background.mp3';

// Fonts (via CSS)
@font-face {
  font-family: 'GameFont';
  src: url('@/assets/fonts/game-font.woff2') format('woff2');
}
```