
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
<script src="https://dadevmikey.github.io/christmas-overlay-snow/ChristmasOverlay.js"></script>
```

### New Year's Overlay (Fireworks)
```html
<script src="https://dadevmikey.github.io/the-holiday-library/NewYearsOverlay.js"></script>
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
  snowflakeColor: 'red',     // Color of snowflakes (default: 'white')
  zIndex: 99999              // Z-index of the overlay (default: 9999)
});
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
  particleCount: 100,                        // Number of particles per firework (default: 50)
  gravity: 0.05,                             // Simulated gravity (default: 0.02)
  speed: { min: 3, max: 8 },                 // Speed range of particles (default: { min: 2, max: 6 })
  radius: { min: 2, max: 5 },                // Radius range of particles (default: { min: 1, max: 3 })
  interval: 500,                             // Time between fireworks in ms (default: 1000)
  zIndex: 10000,                             // Z-index of the overlay (default: 9999)
  toggleButton: '#toggleFireworks',          // Button selector to toggle the overlay (optional)
  timeout: 30000,                            // Auto-stop timeout in ms (default: null, no timeout)
});
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
