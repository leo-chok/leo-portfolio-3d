# Audio Assets

Organized audio folder structure for the portfolio.

## Structure

```
audio/
├── ambient/          # Background music
│   ├── space.mp3     # Exploration mode
│   └── chase.mp3     # Combat mode
├── game/             # Game sound effects
│   ├── laser1.wav    # Player/enemy laser (variant 1)
│   ├── laser2.wav    # Player/enemy laser (variant 2)
│   ├── explosion.wav # Destruction effect
│   ├── motor.wav     # Engine loop
│   └── gameover.wav  # Death sound
└── ui/               # Interface sounds
    ├── click.wav
    └── hover.wav
```

## Volume Configuration

Edit `src/stores/audioStore.js` → `SFX_VOLUMES` for individual sound levels.
