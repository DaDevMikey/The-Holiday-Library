# **The Holiday Overlay**

A simple JavaScript library to add festive holiday-themed overlays to your website.

## **Demos**

* Full example:  
  [Live demo](https://dadevmikey.github.io/The-Holiday-Library/)
* **Christmas Overlay (Snow)**:  
  [Live Demo](https://dadevmikey.github.io/The-Holiday-Library/christmasoverlay.html)  
* **New Year's Overlay (Fireworks)**:  
  [Live Demo](https://dadevmikey.github.io/The-Holiday-Library/newyearsoverlay.html)

## **Installation**

Include the desired overlay library in your HTML file:

### **Christmas Overlay (Snow)**

```
<script src="[https://dadevmikey.github.io/The-Holiday-Library/ChristmasOverlay.js](https://dadevmikey.github.io/The-Holiday-Library/ChristmasOverlay.js)"></script>
```

### **New Year's Overlay (Fireworks)**

```
<script src="[https://dadevmikey.github.io/The-Holiday-Library/NewYearsOverlay.js](https://dadevmikey.github.io/The-Holiday-Library/NewYearsOverlay.js)"></script>
```

## **Usage**

### **Christmas Overlay (Snow)**

Enable the overlay:
```
christmasOverlaySnow.enable();
```
Disable the overlay:
```
christmasOverlaySnow.disable();
```
Custom Options:
```
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
#### **Time-Based Scheduling (Snow)**

You can configure the snow effect to automatically enable/disable based on the user's device time:
```
christmasOverlaySnow.enable({  
  snowflakeCount: 100,  
  startTime: '18:00',  // Start at 6 PM (user's local time)  
  endTime: '23:59',    // End at midnight  
});
```
The overlay will automatically:

* Enable when the user's device time enters the scheduled window  
* Disable when the user's device time exits the scheduled window  
* Check every minute to update the state

**Note:** Times are in 24-hour format (HH:MM). Overnight schedules are supported (e.g., startTime: '22:00', endTime: '06:00').

Check if snow is currently active:
```
christmasOverlaySnow.isActive();  // Returns true or false
```
### **New Year's Overlay (Fireworks)**

Enable the overlay:
```
const fireworks = new FireworksOverlay();  
fireworks.startAnimation();
```
Disable the overlay:
```
fireworks.stopAnimation();
```
Custom Options:
```
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
  trailLength: 10,                           // Length of particle trails (default: 10)  
  sparkle: true,                             // Enable sparkle effect (default: true)  
  rocketTrail: true,                         // Show rocket trail before explosion (default: true)  
});
```
#### **Date & Time-Based Scheduling (Fireworks)**

You can configure the fireworks to run only on specific dates (like New Year's Eve) and times.

**Example: Run only from Dec 31st to Jan 2nd, between 11 PM and 1 AM:**
```
const fireworks = new FireworksOverlay({  
  // Date Schedule (MM-DD)  
  dateStart: '12-31',  
  dateEnd: '01-02',  
    
  // Time Schedule (HH:MM)  
  startTime: '23:00',  
  endTime: '01:00'  
});

fireworks.startAnimation();  // Starts the scheduler
```
The fireworks will automatically:

* Check if today is within the date range (handles year wrap-around like Dec 31 -> Jan 2).  
* Check if current time is within the time window.  
* Enable/Disable automatically every minute.

Options:  
| Option | Format | Example | Description |  
| :--- | :--- | :--- | :--- |  
| dateStart | "MM-DD" | '12-31' | Start date (Month-Day) |  
| dateEnd | "MM-DD" | '01-02' | End date (Month-Day) |  
| startTime | "HH:MM" | '23:00' | Start time (24h) |  
| endTime | "HH:MM" | '01:00' | End time (24h) |  
Check if fireworks are currently active:
```
fireworks.isActive();  // Returns true or false
```
Add a toggle button:
```
<button id="toggleFireworks">Toggle Fireworks</button>
```
In your script:
```
const fireworks = new FireworksOverlay({  
  toggleButton: '#toggleFireworks', // Automatically links to this button  
});
```
## **Contributing**

Feel free to submit issues or pull requests to improve this library!

## **License**

This project is licensed under the MIT License.
