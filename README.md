
# The Holiday Overlay

A simple JavaScript library to add festive holiday-themed overlays to your website.

## Demos
- **Full example**:
  [Live demo](https://dadevmikey.github.io/The-Holiday-Library/index.html)
  
- **Christmas Overlay (Snow)**:  
  [Live Demo](https://dadevmikey.github.io/The-Holiday-Library/christmasoverlay.html)

- **New Year's Overlay (Fireworks)**:  
  [Live Demo](https://dadevmikey.github.io/The-Holiday-Library/newyearsoverlay.html)

## Installation

Include the desired overlay library in your HTML file:

### Christmas Overlay (Snow)
```html
<script src="https://dadevmikey.github.io/The-Holiday-Library/ChristmasOverlay.js"></script>
```

### New Year's Overlay (Fireworks)
```html
<script src="https://dadevmikey.github.io/The-Holiday-Library/NewYearsOverlay.js"></script>
```

## Usage

### Christmas Overlay (Snow)

Enable the overlay:
```javascript
christmasOverlaySnow.enable();
```

Disable the overlay:
```javascript
christmasOverlaySnow.disable();
```

Custom Options:
```javascript
christmasOverlaySnow.enable({
  snowflakeCount: 100,       // Number of snowflakes (default: 50)
  snowflakeColor: 'white',   // Color of snowflakes (default: 'white')
  zIndex: 99999,             // Z-index of the overlay (default: 9999)
  minSize: 3,                // Minimum snowflake size in px (default: 3)
  maxSize: 12,               // Maximum snowflake size in px (default: 12)
  minOpacity: 0.4,           // Minimum opacity (default: 0.4)
  maxOpacity: 1,             // Maximum opacity (default: 1)
});
```

#### Time-Based Scheduling (Snow)

You can configure the snow effect to automatically enable/disable based on the user's device time:

```javascript
christmasOverlaySnow.enable({
  snowflakeCount: 100,
  startTime: '18:00',  // Start at 6 PM (user's local time)
  endTime: '23:59',    // End at midnight
});
```

The overlay will automatically:
- Enable when the user's device time enters the scheduled window
- Disable when the user's device time exits the scheduled window
- Check every minute to update the state

**Note:** Times are in 24-hour format (HH:MM). Overnight schedules are supported (e.g., `startTime: '22:00'`, `endTime: '06:00'`).

Check if snow is currently active:
```javascript
christmasOverlaySnow.isActive();  // Returns true or false
```

### New Year's Overlay (Fireworks)

Enable the overlay:
```javascript
const fireworks = new FireworksOverlay();
fireworks.startAnimation();
```

Disable the overlay:
```javascript
fireworks.stopAnimation();
```

Custom Options:
```javascript
const fireworks = new FireworksOverlay({
  colors: ['#FF0000', '#00FF00', '#0000FF'], // Colors of fireworks (default: multicolored)
  particleCount: 100,                        // Number of particles per firework (default: 80)
  gravity: 0.05,                             // Simulated gravity (default: 0.03)
  speed: { min: 3, max: 8 },                 // Speed range of particles (default: { min: 3, max: 7 })
  radius: { min: 2, max: 5 },                // Radius range of particles (default: { min: 1, max: 4 })
  interval: 500,                             // Time between fireworks in ms (default: 800)
  zIndex: 10000,                             // Z-index of the overlay (default: 9999)
  toggleButton: '#toggleFireworks',          // Button selector to toggle the overlay (optional)
  timeout: 30000,                            // Auto-stop timeout in ms (default: null, no timeout)
  trailLength: 5,                            // Length of particle trails (default: 5)
  sparkle: true,                             // Enable sparkle effect (default: true)
  rocketTrail: true,                         // Show rocket trail before explosion (default: true)
});
```

#### Time-Based Scheduling (Fireworks)

You can configure the fireworks effect to automatically enable/disable based on the user's device time:

```javascript
const fireworks = new FireworksOverlay({
  startTime: '23:00',  // Start at 11 PM (user's local time)
  endTime: '01:00',    // End at 1 AM (overnight schedule)
});
fireworks.startAnimation();  // Starts the scheduler
```

The fireworks will automatically:
- Enable when the user's device time enters the scheduled window
- Disable when the user's device time exits the scheduled window
- Check every minute to update the state

**Note:** Times are in 24-hour format (HH:MM). Overnight schedules are supported for New Year's celebrations!

Check if fireworks are currently active:
```javascript
fireworks.isActive();  // Returns true or false
```

Add a toggle button:
```html
<button id="toggleFireworks">Toggle Fireworks</button>
```

In your script:
```javascript
const fireworks = new FireworksOverlay({
  toggleButton: '#toggleFireworks', // Automatically links to this button
});
```

## Contributing

Feel free to submit issues or pull requests to improve this library!

## License
This project is licensed under the MIT License.
