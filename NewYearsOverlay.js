(function () {
    class FireworksOverlay {
      constructor(options = {}) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.rockets = []; // Rockets launching upward
        this.running = false; // State to track if the animation is running
        this.defaults = {
          colors: ['#FF5733', '#FFC300', '#DAF7A6', '#C70039', '#900C3F', '#581845', '#FFD700', '#FF69B4', '#00FFFF', '#7FFF00'], 
          particleCount: 80,
          gravity: 0.03,
          speed: { min: 3, max: 7 },
          radius: { min: 1, max: 4 },
          interval: 800, // Fireworks interval in milliseconds
          zIndex: 9999,
          toggleButton: null, // Selector for a toggle button
          timeout: null, // Auto-stop timeout in milliseconds (null = no timeout)
          
          // Time-based scheduling options
          startTime: null, // Format: "HH:MM" (24-hour), e.g., "23:00"
          endTime: null,   // Format: "HH:MM" (24-hour), e.g., "01:00"
          
          // Date-based scheduling (NEW)
          dateStart: null, // Format: "MM-DD", e.g., "12-31"
          dateEnd: null,   // Format: "MM-DD", e.g., "01-02"

          trailLength: 5, // Length of particle trails
          sparkle: true, // Add sparkle effect
          rocketTrail: true, // Show rocket trail before explosion
        };
        this.settings = { ...this.defaults, ...options };
        this.schedulerInterval = null;
        this.init();
      }

      isValidTimeFormat(time) {
        if (typeof time !== 'string') return false;
        const match = time.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) return false;
        const hours = parseInt(match[1], 10);
        const mins = parseInt(match[2], 10);
        return hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59;
      }

      isValidDateFormat(date) {
        if (typeof date !== 'string') return false;
        return /^\d{1,2}-\d{1,2}$/.test(date);
      }

      isWithinSchedule() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentDay = now.getDate();
        
        // 1. Check Date Range (if configured)
        const { dateStart, dateEnd } = this.settings;
        if (dateStart && dateEnd && this.isValidDateFormat(dateStart) && this.isValidDateFormat(dateEnd)) {
            const getCode = (str) => {
                const [m, d] = str.split('-').map(Number);
                return m * 100 + d;
            };
            
            const currentCode = currentMonth * 100 + currentDay;
            const startCode = getCode(dateStart);
            const endCode = getCode(dateEnd);

            // Handle year wrap (e.g., 12-31 to 01-02)
            if (endCode < startCode) {
                // If we are NOT in the active range (between end and start)
                if (currentCode > endCode && currentCode < startCode) {
                    return false;
                }
            } else {
                // Standard range
                if (currentCode < startCode || currentCode > endCode) {
                    return false;
                }
            }
        }

        // 2. Check Time Range (if configured)
        const { startTime, endTime } = this.settings;
        if (!startTime || !endTime) return true;
        if (!this.isValidTimeFormat(startTime) || !this.isValidTimeFormat(endTime)) return true;
        
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        // Handle overnight schedules (e.g., 23:00 to 01:00)
        if (endMinutes < startMinutes) {
          return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
        }
        
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      }
  
      init() {
        this.setupCanvas();
        this.bindResize();
        this.bindToggleButton();
      }
  
      setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none'; // Essential so it doesn't block clicks
        this.canvas.style.zIndex = this.settings.zIndex;
        document.body.appendChild(this.canvas);
        this.resizeCanvas();
      }
  
      resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
  
      bindResize() {
        window.addEventListener('resize', () => this.resizeCanvas());
      }
  
      bindToggleButton() {
        if (this.settings.toggleButton) {
          const button = document.querySelector(this.settings.toggleButton);
          if (button) {
            button.addEventListener('click', () => this.toggle());
          }
        }
      }

      launchRocket() {
        const x = Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.1;
        const targetY = Math.random() * this.canvas.height * 0.4 + this.canvas.height * 0.1;
        const colors = this.settings.colors;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        this.rockets.push({
          x,
          y: this.canvas.height,
          targetY,
          speed: 8 + Math.random() * 4,
          color,
          trail: [],
          exploded: false,
        });
      }

      updateRockets() {
        this.rockets.forEach((rocket, rocketIndex) => {
          // Add current position to trail
          if (this.settings.rocketTrail) {
            rocket.trail.push({ x: rocket.x, y: rocket.y });
            if (rocket.trail.length > 15) {
              rocket.trail.shift();
            }
          }
          
          // Move rocket upward with slight wobble
          rocket.y -= rocket.speed;
          rocket.x += (Math.random() - 0.5) * 2;
          
          // Check if rocket reached target
          if (rocket.y <= rocket.targetY) {
            this.createFirework(rocket.x, rocket.y, rocket.color);
            this.rockets.splice(rocketIndex, 1);
          }
        });
      }

      drawRockets() {
        this.rockets.forEach((rocket) => {
          // Draw trail
          if (this.settings.rocketTrail && rocket.trail.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(rocket.trail[0].x, rocket.trail[0].y);
            rocket.trail.forEach((point, index) => {
              this.ctx.lineTo(point.x, point.y);
            });
            this.ctx.strokeStyle = rocket.color;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.5;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
          }
          
          // Draw rocket head
          this.ctx.beginPath();
          this.ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
          this.ctx.fillStyle = rocket.color;
          this.ctx.fill();
          this.ctx.closePath();
          
          // Draw glow
          const gradient = this.ctx.createRadialGradient(rocket.x, rocket.y, 0, rocket.x, rocket.y, 10);
          gradient.addColorStop(0, rocket.color);
          gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Transparent end
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(rocket.x - 10, rocket.y - 10, 20, 20);
        });
      }
  
      createFirework(x, y, baseColor) {
        const colors = baseColor ? [baseColor, this.adjustBrightness(baseColor, 30), this.adjustBrightness(baseColor, -30)] : this.settings.colors;
        const particleCount = this.settings.particleCount;
        
        // Create main burst
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
          const speed = Math.random() * (this.settings.speed.max - this.settings.speed.min) + this.settings.speed.min;
          
          particles.push({
            x,
            y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            radius: Math.random() * (this.settings.radius.max - this.settings.radius.min) + this.settings.radius.min,
            life: Math.random() * 60 + 60,
            maxLife: 120,
            color: colors[Math.floor(Math.random() * colors.length)],
            trail: [],
            sparkleOffset: Math.random() * Math.PI * 2,
          });
        }
        
        // Add inner burst with smaller, faster particles
        for (let i = 0; i < particleCount / 2; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (Math.random() * (this.settings.speed.max - this.settings.speed.min) + this.settings.speed.min) * 0.5;
          
          particles.push({
            x,
            y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            radius: Math.random() * 1.5 + 0.5,
            life: Math.random() * 40 + 30,
            maxLife: 70,
            color: '#FFFFFF',
            trail: [],
            sparkleOffset: Math.random() * Math.PI * 2,
          });
        }

        this.fireworks.push({ x, y, particles });
      }

      adjustBrightness(color, percent) {
        // Validate hex color format
        if (typeof color !== 'string' || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
          return color; // Return original color if not valid hex
        }
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
      }
  
      updateFireworks() {
        this.fireworks.forEach((firework, fireworkIndex) => {
          firework.particles.forEach((particle, particleIndex) => {
            // Store trail position
            if (this.settings.trailLength > 0) {
              particle.trail.push({ x: particle.x, y: particle.y });
              if (particle.trail.length > this.settings.trailLength) {
                particle.trail.shift();
              }
            }
            
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.dy += this.settings.gravity;
            particle.dx *= 0.98; // Air resistance
            particle.dy *= 0.98;
            particle.life--;
  
            if (particle.life <= 0) {
              firework.particles.splice(particleIndex, 1);
            }
          });
  
          if (firework.particles.length === 0) {
            this.fireworks.splice(fireworkIndex, 1);
          }
        });
      }
  
      drawFireworks() {
        // [IMPORTANT FIX]
        // The original code used a semi-transparent fillRect here which slowly turned the background black.
        // We replace it with clearRect to keep the background transparent.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw rockets first
        this.drawRockets();
        
        this.fireworks.forEach((firework) => {
          firework.particles.forEach((particle) => {
            const lifeRatio = particle.life / particle.maxLife;
            
            // Draw trail
            if (particle.trail.length > 1) {
              this.ctx.beginPath();
              this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
              particle.trail.forEach((point, index) => {
                this.ctx.lineTo(point.x, point.y);
              });
              this.ctx.strokeStyle = particle.color;
              this.ctx.lineWidth = particle.radius * 0.5;
              this.ctx.globalAlpha = lifeRatio * 0.3;
              this.ctx.stroke();
              this.ctx.globalAlpha = 1;
            }
            
            // Draw particle with glow
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * lifeRatio, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = lifeRatio;
            this.ctx.fill();
            this.ctx.closePath();
            
            // Sparkle effect
            if (this.settings.sparkle && Math.random() > 0.7) {
              const sparkleSize = particle.radius * 0.5 * Math.sin(Date.now() * 0.01 + particle.sparkleOffset);
              this.ctx.beginPath();
              this.ctx.arc(particle.x, particle.y, Math.abs(sparkleSize), 0, Math.PI * 2);
              this.ctx.fillStyle = '#FFFFFF';
              this.ctx.globalAlpha = lifeRatio * 0.5;
              this.ctx.fill();
              this.ctx.closePath();
            }
            
            this.ctx.globalAlpha = 1;
          });
        });
      }

      checkSchedule() {
        const shouldBeActive = this.isWithinSchedule();
        
        if (shouldBeActive && !this.running) {
          this.startAnimationInternal();
        } else if (!shouldBeActive && this.running) {
          this.stopAnimationInternal();
        }
      }

      startAnimationInternal() {
        if (this.running) return;
        this.running = true;
        
        // Clear canvas first
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.fireworksInterval = setInterval(() => this.launchRocket(), this.settings.interval);
  
        // Set timeout to auto-stop if specified
        if (this.settings.timeout !== null && this.settings.timeout > 0) {
          this.timeoutId = setTimeout(() => this.stopAnimation(), this.settings.timeout);
        }
  
        const animate = () => {
          if (!this.running) return;
          this.updateRockets();
          this.updateFireworks();
          this.drawFireworks();
          this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
      }
  
      startAnimation() {
        // If we have ANY schedule (time OR date), start the scheduler
        const hasTimeSchedule = this.settings.startTime && this.settings.endTime;
        const hasDateSchedule = this.settings.dateStart && this.settings.dateEnd;

        if (hasTimeSchedule || hasDateSchedule) {
          this.checkSchedule();
          if (!this.schedulerInterval) {
            this.schedulerInterval = setInterval(() => this.checkSchedule(), 60000);
          }
        } else {
          this.startAnimationInternal();
        }
      }

      stopAnimationInternal() {
        this.running = false;
        clearInterval(this.fireworksInterval);
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        cancelAnimationFrame(this.animationFrame);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fireworks = [];
        this.rockets = [];
      }
  
      stopAnimation() {
        if (this.schedulerInterval) {
          clearInterval(this.schedulerInterval);
          this.schedulerInterval = null;
        }
        this.stopAnimationInternal();
      }
  
      toggle() {
        this.running ? this.stopAnimation() : this.startAnimation();
      }

      isActive() {
        return this.running;
      }
  
      destroy() {
        this.stopAnimation();
        this.canvas.remove();
        window.removeEventListener('resize', this.resizeCanvas);
      }
    }
  
    // Export function to global scope
    window.FireworksOverlay = FireworksOverlay;
  })();
