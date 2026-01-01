(function () {
    class FireworksOverlay {
      constructor(options = {}) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.rockets = [];
        this.running = false;
        
        this.defaults = {
          colors: ['#FF5733', '#FFC300', '#DAF7A6', '#C70039', '#900C3F', '#581845', '#FFD700', '#FF69B4', '#00FFFF', '#7FFF00'],
          particleCount: 80,
          gravity: 0.03,
          speed: { min: 3, max: 7 },
          radius: { min: 1, max: 4 },
          interval: 800,
          zIndex: 9999,
          toggleButton: null,
          timeout: null,
          
          // Time Schedule (HH:MM)
          startTime: null, 
          endTime: null,
          
          // Date Schedule (MM-DD)
          dateStart: null, // e.g. "12-31"
          dateEnd: null,   // e.g. "01-02"
          
          trailLength: 10, // Increased slightly since we removed the fade effect
          sparkle: true,
          rocketTrail: true,
        };
        
        this.settings = { ...this.defaults, ...options };
        this.schedulerInterval = null;
        this.init();
      }

      // --- Validation Helpers ---
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
        // Allows "12-31" or "1-1"
        return /^\d{1,2}-\d{1,2}$/.test(date);
      }

      // --- Scheduling Logic ---
      isWithinSchedule() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentDay = now.getDate();
        
        // 1. Check Date Range (if set)
        if (this.settings.dateStart && this.settings.dateEnd && 
            this.isValidDateFormat(this.settings.dateStart) && 
            this.isValidDateFormat(this.settings.dateEnd)) {
            
            const getDayCode = (str) => {
                const [m, d] = str.split('-').map(Number);
                return m * 100 + d;
            };

            const currentCode = currentMonth * 100 + currentDay;
            const startCode = getDayCode(this.settings.dateStart);
            const endCode = getDayCode(this.settings.dateEnd);

            // Handle New Year wrap (e.g. Dec 31 to Jan 2)
            if (endCode < startCode) {
                // Active if we are AFTER start OR BEFORE end
                // So, inactive if we are strictly between end and start
                if (currentCode > endCode && currentCode < startCode) {
                    return false;
                }
            } else {
                // Standard range (e.g. Dec 10 to Dec 25)
                if (currentCode < startCode || currentCode > endCode) {
                    return false;
                }
            }
        }

        // 2. Check Time Range (if set)
        const { startTime, endTime } = this.settings;
        if (startTime && endTime && this.isValidTimeFormat(startTime) && this.isValidTimeFormat(endTime)) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            
            const startTotal = startHour * 60 + startMin;
            const endTotal = endHour * 60 + endMin;
            
            // Handle overnight (e.g. 23:00 to 01:00)
            if (endTotal < startTotal) {
                if (currentMinutes < startTotal && currentMinutes > endTotal) {
                    return false;
                }
            } else {
                // Standard time
                if (currentMinutes < startTotal || currentMinutes > endTotal) {
                    return false;
                }
            }
        }
        
        return true;
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
        this.canvas.style.pointerEvents = 'none'; // Clicks pass through to website
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
        });
      }

      updateRockets() {
        this.rockets.forEach((rocket, index) => {
          // Add trail point
          if (this.settings.rocketTrail) {
            rocket.trail.push({ x: rocket.x, y: rocket.y });
            if (rocket.trail.length > 10) rocket.trail.shift();
          }
          
          rocket.y -= rocket.speed;
          rocket.x += (Math.random() - 0.5) * 2; // Wobble
          
          if (rocket.y <= rocket.targetY) {
            this.createFirework(rocket.x, rocket.y, rocket.color);
            this.rockets.splice(index, 1);
          }
        });
      }

      drawRockets() {
        this.rockets.forEach((rocket) => {
          // Draw Trail
          if (this.settings.rocketTrail && rocket.trail.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(rocket.trail[0].x, rocket.trail[0].y);
            rocket.trail.forEach(p => this.ctx.lineTo(p.x, p.y));
            this.ctx.strokeStyle = rocket.color;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.6;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
          }
          
          // Draw Head
          this.ctx.beginPath();
          this.ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
          this.ctx.fillStyle = rocket.color;
          this.ctx.fill();
        });
      }
  
      createFirework(x, y, baseColor) {
        const colors = baseColor 
            ? [baseColor, this.adjustBrightness(baseColor, 30), this.adjustBrightness(baseColor, -30)] 
            : this.settings.colors;
        
        const particleCount = this.settings.particleCount;
        
        // Explosion particles
        const createParticles = (count, speedMult, colorOverride) => {
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
                const speed = (Math.random() * (this.settings.speed.max - this.settings.speed.min) + this.settings.speed.min) * speedMult;
                
                this.fireworks.push({
                    x, y,
                    dx: Math.cos(angle) * speed,
                    dy: Math.sin(angle) * speed,
                    radius: Math.random() * (this.settings.radius.max - this.settings.radius.min) + this.settings.radius.min,
                    life: Math.random() * 60 + 60,
                    maxLife: 120,
                    color: colorOverride || colors[Math.floor(Math.random() * colors.length)],
                    trail: [],
                    sparkleOffset: Math.random() * Math.PI * 2
                });
            }
        };

        createParticles(particleCount, 1.0, null); // Outer burst
        createParticles(particleCount / 2, 0.5, '#FFFFFF'); // Inner white burst
      }

      adjustBrightness(color, percent) {
        if (typeof color !== 'string' || !color.match(/^#[0-9A-Fa-f]{6}$/)) return color;
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
      }
  
      updateFireworks() {
        // We use a flat array for fireworks particles now for simpler management
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const p = this.fireworks[i];
            
            // Record Trail
            if (this.settings.trailLength > 0) {
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > this.settings.trailLength) p.trail.shift();
            }

            p.x += p.dx;
            p.y += p.dy;
            p.dy += this.settings.gravity; // Gravity
            p.dx *= 0.96; // Air resistance
            p.dy *= 0.96;
            p.life--;

            if (p.life <= 0) {
                this.fireworks.splice(i, 1);
            }
        }
      }
  
      drawFireworks() {
        // FIX: Clear the canvas completely to maintain transparency
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawRockets();
        
        this.fireworks.forEach((p) => {
            const lifeRatio = p.life / p.maxLife;
            
            // Draw Trail (Coordinate based)
            if (p.trail.length > 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(p.trail[0].x, p.trail[0].y);
                p.trail.forEach(pt => this.ctx.lineTo(pt.x, pt.y));
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = p.radius * 0.6;
                this.ctx.globalAlpha = lifeRatio * 0.4;
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }

            // Draw Particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius * lifeRatio, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = lifeRatio;
            this.ctx.fill();
            
            // Sparkle
            if (this.settings.sparkle && Math.random() > 0.8) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.globalAlpha = 1;
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.fireworksInterval = setInterval(() => this.launchRocket(), this.settings.interval);
  
        if (this.settings.timeout) {
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
        // Check if any schedule is set
        const hasSchedule = (this.settings.startTime && this.settings.endTime) || 
                            (this.settings.dateStart && this.settings.dateEnd);

        if (hasSchedule) {
          this.checkSchedule(); // Check now
          if (!this.schedulerInterval) {
            this.schedulerInterval = setInterval(() => this.checkSchedule(), 60000); // Check every min
          }
        } else {
          this.startAnimationInternal();
        }
      }

      stopAnimationInternal() {
        this.running = false;
        clearInterval(this.fireworksInterval);
        clearTimeout(this.timeoutId);
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
    }
  
    window.FireworksOverlay = FireworksOverlay;
  })();
