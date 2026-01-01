(function () {
    class HalloweenOverlay {
      constructor(options = {}) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.pumpkins = [];
        this.bats = [];
        this.ghosts = [];
        this.leaves = [];
        this.spiders = [];
        this.fogClouds = [];
        this.running = false;
        this.defaults = {
          // Element counts
          pumpkinCount: 5,
          batCount: 8,
          ghostCount: 6,
          leafCount: 15,
          spiderCount: 3,
          
          // Colors (arrays for variety)
          pumpkinColors: ['#FF6B1A', '#FF8C00', '#FFA500'],
          batColors: ['#000000', '#1a0033', '#2d0066'],
          ghostColors: ['rgba(255,255,255,0.8)', 'rgba(240,240,255,0.7)'],
          leafColors: ['#8B4513', '#FF8C00', '#8B0000', '#A0522D'],
          
          // Effect toggles
          enableLightning: true,
          enableFog: true,
          enableSpiders: true,
          
          // Lightning settings
          lightningInterval: { min: 8000, max: 20000 },
          lightningDuration: 150,
          
          // Animation speeds
          pumpkinSpeed: { min: 1, max: 3 },
          batSpeed: { min: 2, max: 5 },
          ghostSpeed: { min: 0.5, max: 1.5 },
          leafSpeed: { min: 1, max: 3 },
          spiderSpeed: { min: 0.5, max: 1.5 },
          
          // Size ranges
          pumpkinSize: { min: 20, max: 40 },
          batSize: { min: 15, max: 30 },
          ghostSize: { min: 25, max: 45 },
          leafSize: { min: 8, max: 15 },
          spiderSize: { min: 8, max: 12 },
          
          // Standard options
          zIndex: 9999,
          toggleButton: null,
          timeout: null,
          startTime: null,
          endTime: null,
          dateStart: null,
          dateEnd: null,
        };
        this.settings = { ...this.defaults, ...options };
        this.schedulerInterval = null;
        this.lightningTimeout = null;
        this.lightningFlash = false;
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
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();
        
        // Check Date Range
        const { dateStart, dateEnd } = this.settings;
        if (dateStart && dateEnd && this.isValidDateFormat(dateStart) && this.isValidDateFormat(dateEnd)) {
            const getCode = (str) => {
                const [m, d] = str.split('-').map(Number);
                return m * 100 + d;
            };
            
            const currentCode = currentMonth * 100 + currentDay;
            const startCode = getCode(dateStart);
            const endCode = getCode(dateEnd);

            // Handle year wrap
            if (endCode < startCode) {
                if (currentCode > endCode && currentCode < startCode) {
                    return false;
                }
            } else {
                if (currentCode < startCode || currentCode > endCode) {
                    return false;
                }
            }
        }

        // Check Time Range
        const { startTime, endTime } = this.settings;
        if (!startTime || !endTime) return true;
        if (!this.isValidTimeFormat(startTime) || !this.isValidTimeFormat(endTime)) return true;
        
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        // Handle overnight schedules
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
        this.canvas.style.pointerEvents = 'none';
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

      // Create all elements
      createElements() {
        // Create pumpkins
        for (let i = 0; i < this.settings.pumpkinCount; i++) {
          this.pumpkins.push(this.createPumpkin());
        }
        
        // Create bats
        for (let i = 0; i < this.settings.batCount; i++) {
          this.bats.push(this.createBat());
        }
        
        // Create ghosts
        for (let i = 0; i < this.settings.ghostCount; i++) {
          this.ghosts.push(this.createGhost());
        }
        
        // Create leaves
        for (let i = 0; i < this.settings.leafCount; i++) {
          this.leaves.push(this.createLeaf());
        }
        
        // Create spiders
        if (this.settings.enableSpiders) {
          for (let i = 0; i < this.settings.spiderCount; i++) {
            this.spiders.push(this.createSpider());
          }
        }
        
        // Create fog clouds
        if (this.settings.enableFog) {
          for (let i = 0; i < 6; i++) {
            this.fogClouds.push(this.createFogCloud());
          }
        }
      }

      createPumpkin() {
        const colors = this.settings.pumpkinColors;
        return {
          x: Math.random() * this.canvas.width,
          y: Math.random() * -this.canvas.height,
          size: Math.random() * (this.settings.pumpkinSize.max - this.settings.pumpkinSize.min) + this.settings.pumpkinSize.min,
          speed: Math.random() * (this.settings.pumpkinSpeed.max - this.settings.pumpkinSpeed.min) + this.settings.pumpkinSpeed.min,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          drift: (Math.random() - 0.5) * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      }

      createBat() {
        const colors = this.settings.batColors;
        return {
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height * 0.6,
          size: Math.random() * (this.settings.batSize.max - this.settings.batSize.min) + this.settings.batSize.min,
          speed: Math.random() * (this.settings.batSpeed.max - this.settings.batSpeed.min) + this.settings.batSpeed.min,
          angle: Math.random() * Math.PI * 2,
          swoopAmplitude: 30 + Math.random() * 50,
          swoopFrequency: 0.02 + Math.random() * 0.03,
          counter: Math.random() * 100,
          wingFlap: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      }

      createGhost() {
        const colors = this.settings.ghostColors;
        return {
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * (this.settings.ghostSize.max - this.settings.ghostSize.min) + this.settings.ghostSize.min,
          speed: Math.random() * (this.settings.ghostSpeed.max - this.settings.ghostSpeed.min) + this.settings.ghostSpeed.min,
          swayAmount: 20 + Math.random() * 30,
          swaySpeed: 0.02 + Math.random() * 0.02,
          baseX: 0,
          counter: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      }

      createLeaf() {
        const colors = this.settings.leafColors;
        return {
          x: Math.random() * this.canvas.width,
          y: Math.random() * -this.canvas.height,
          size: Math.random() * (this.settings.leafSize.max - this.settings.leafSize.min) + this.settings.leafSize.min,
          speed: Math.random() * (this.settings.leafSpeed.max - this.settings.leafSpeed.min) + this.settings.leafSpeed.min,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          drift: (Math.random() - 0.5) * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      }

      createSpider() {
        return {
          x: Math.random() * this.canvas.width,
          y: 0,
          targetY: Math.random() * this.canvas.height * 0.5 + 50,
          size: Math.random() * (this.settings.spiderSize.max - this.settings.spiderSize.min) + this.settings.spiderSize.min,
          speed: Math.random() * (this.settings.spiderSpeed.max - this.settings.spiderSpeed.min) + this.settings.spiderSpeed.min,
          swing: 0,
          swingSpeed: 0.03 + Math.random() * 0.02,
          swingAmount: 5 + Math.random() * 10,
        };
      }

      createFogCloud() {
        return {
          x: Math.random() * this.canvas.width - 200,
          y: this.canvas.height - 100 - Math.random() * 100,
          width: 200 + Math.random() * 300,
          height: 80 + Math.random() * 60,
          speed: 0.3 + Math.random() * 0.5,
          opacity: 0.1 + Math.random() * 0.15,
        };
      }

      // Update methods
      updatePumpkins() {
        this.pumpkins.forEach((pumpkin, index) => {
          pumpkin.y += pumpkin.speed;
          pumpkin.x += pumpkin.drift;
          pumpkin.rotation += pumpkin.rotationSpeed;
          
          if (pumpkin.y > this.canvas.height + pumpkin.size) {
            this.pumpkins[index] = this.createPumpkin();
          }
        });
      }

      updateBats() {
        this.bats.forEach((bat, index) => {
          bat.counter += bat.speed;
          bat.wingFlap += 0.3;
          
          // Complex swooping motion
          const swoopY = Math.sin(bat.counter * bat.swoopFrequency) * bat.swoopAmplitude;
          bat.y += Math.sin(bat.angle) * bat.speed + swoopY * 0.1;
          bat.x += Math.cos(bat.angle) * bat.speed;
          
          // Change direction occasionally
          if (Math.random() < 0.02) {
            bat.angle += (Math.random() - 0.5) * 0.5;
          }
          
          // Wrap around screen
          if (bat.x < -bat.size) bat.x = this.canvas.width + bat.size;
          if (bat.x > this.canvas.width + bat.size) bat.x = -bat.size;
          if (bat.y < -bat.size) bat.y = this.canvas.height + bat.size;
          if (bat.y > this.canvas.height + bat.size) bat.y = -bat.size;
        });
      }

      updateGhosts() {
        this.ghosts.forEach((ghost, index) => {
          ghost.counter += ghost.speed;
          
          // Floating motion with sway
          const sway = Math.sin(ghost.counter * ghost.swaySpeed) * ghost.swayAmount;
          ghost.x = ghost.baseX + sway;
          ghost.y -= ghost.speed * 0.5;
          
          if (!ghost.baseX) ghost.baseX = ghost.x;
          
          // Reset when off screen
          if (ghost.y < -ghost.size - 50) {
            this.ghosts[index] = this.createGhost();
            this.ghosts[index].baseX = this.ghosts[index].x;
          }
        });
      }

      updateLeaves() {
        this.leaves.forEach((leaf, index) => {
          leaf.y += leaf.speed;
          leaf.x += leaf.drift;
          leaf.rotation += leaf.rotationSpeed;
          
          if (leaf.y > this.canvas.height + leaf.size) {
            this.leaves[index] = this.createLeaf();
          }
        });
      }

      updateSpiders() {
        this.spiders.forEach((spider, index) => {
          spider.swing += spider.swingSpeed;
          
          if (spider.y < spider.targetY) {
            spider.y += spider.speed;
          }
          
          // Reset when target reached and stayed for a while
          if (spider.y >= spider.targetY && Math.random() < 0.001) {
            this.spiders[index] = this.createSpider();
          }
        });
      }

      updateFog() {
        this.fogClouds.forEach((cloud, index) => {
          cloud.x += cloud.speed;
          
          if (cloud.x > this.canvas.width + 200) {
            cloud.x = -cloud.width;
          }
        });
      }

      // Draw methods
      drawPumpkin(pumpkin) {
        this.ctx.save();
        this.ctx.translate(pumpkin.x, pumpkin.y);
        this.ctx.rotate(pumpkin.rotation);
        
        // Draw pumpkin body
        this.ctx.fillStyle = pumpkin.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, pumpkin.size * 0.5, pumpkin.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pumpkin ridges
        this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-pumpkin.size * 0.25, -pumpkin.size * 0.5);
        this.ctx.lineTo(-pumpkin.size * 0.25, pumpkin.size * 0.5);
        this.ctx.moveTo(pumpkin.size * 0.25, -pumpkin.size * 0.5);
        this.ctx.lineTo(pumpkin.size * 0.25, pumpkin.size * 0.5);
        this.ctx.stroke();
        
        // Draw stem
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(-pumpkin.size * 0.1, -pumpkin.size * 0.7, pumpkin.size * 0.2, pumpkin.size * 0.3);
        
        this.ctx.restore();
      }

      drawBat(bat) {
        this.ctx.save();
        this.ctx.translate(bat.x, bat.y);
        
        // Wing flap animation
        const wingAngle = Math.sin(bat.wingFlap) * 0.5;
        
        this.ctx.fillStyle = bat.color;
        
        // Body
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, bat.size * 0.3, bat.size * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Left wing
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(
          -bat.size * 0.8, -bat.size * 0.5 + wingAngle * bat.size,
          -bat.size * 1.2, 0
        );
        this.ctx.fill();
        
        // Right wing
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(
          bat.size * 0.8, -bat.size * 0.5 + wingAngle * bat.size,
          bat.size * 1.2, 0
        );
        this.ctx.fill();
        
        this.ctx.restore();
      }

      drawGhost(ghost) {
        this.ctx.save();
        this.ctx.fillStyle = ghost.color;
        
        // Ghost body (wavy bottom)
        this.ctx.beginPath();
        this.ctx.arc(ghost.x, ghost.y, ghost.size * 0.5, Math.PI, 0, true);
        
        // Wavy bottom
        const waves = 4;
        for (let i = 0; i <= waves; i++) {
          const waveX = ghost.x - ghost.size * 0.5 + (ghost.size / waves) * i;
          const waveY = ghost.y + Math.sin((ghost.counter + i) * 0.5) * 5;
          if (i === 0) {
            this.ctx.lineTo(waveX, waveY);
          } else {
            this.ctx.quadraticCurveTo(waveX - ghost.size / (waves * 2), ghost.y + 5, waveX, waveY);
          }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.beginPath();
        this.ctx.arc(ghost.x - ghost.size * 0.2, ghost.y - ghost.size * 0.1, ghost.size * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(ghost.x + ghost.size * 0.2, ghost.y - ghost.size * 0.1, ghost.size * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
      }

      drawLeaf(leaf) {
        this.ctx.save();
        this.ctx.translate(leaf.x, leaf.y);
        this.ctx.rotate(leaf.rotation);
        
        this.ctx.fillStyle = leaf.color;
        
        // Simple leaf shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, -leaf.size * 0.5);
        this.ctx.quadraticCurveTo(leaf.size * 0.5, 0, 0, leaf.size * 0.5);
        this.ctx.quadraticCurveTo(-leaf.size * 0.5, 0, 0, -leaf.size * 0.5);
        this.ctx.fill();
        
        // Leaf vein
        this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -leaf.size * 0.5);
        this.ctx.lineTo(0, leaf.size * 0.5);
        this.ctx.stroke();
        
        this.ctx.restore();
      }

      drawSpider(spider) {
        const swingX = Math.sin(spider.swing) * spider.swingAmount;
        
        // Draw silk thread
        this.ctx.strokeStyle = 'rgba(128,128,128,0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(spider.x, 0);
        this.ctx.lineTo(spider.x + swingX, spider.y);
        this.ctx.stroke();
        
        // Draw spider body
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(spider.x + swingX, spider.y, spider.size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw spider legs
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          this.ctx.beginPath();
          this.ctx.moveTo(spider.x + swingX, spider.y);
          this.ctx.lineTo(
            spider.x + swingX + Math.cos(angle) * spider.size,
            spider.y + Math.sin(angle) * spider.size * 0.5
          );
          this.ctx.stroke();
          
          this.ctx.beginPath();
          this.ctx.moveTo(spider.x + swingX, spider.y);
          this.ctx.lineTo(
            spider.x + swingX - Math.cos(angle) * spider.size,
            spider.y + Math.sin(angle) * spider.size * 0.5
          );
          this.ctx.stroke();
        }
      }

      drawFog(cloud) {
        const gradient = this.ctx.createLinearGradient(cloud.x, cloud.y, cloud.x, cloud.y + cloud.height);
        gradient.addColorStop(0, `rgba(200,200,200,${cloud.opacity * 0.3})`);
        gradient.addColorStop(0.5, `rgba(200,200,200,${cloud.opacity})`);
        gradient.addColorStop(1, `rgba(200,200,200,${cloud.opacity * 0.1})`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.ellipse(cloud.x + cloud.width / 2, cloud.y + cloud.height / 2, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }

      scheduleLightning() {
        if (!this.settings.enableLightning || !this.running) return;
        
        const delay = Math.random() * (this.settings.lightningInterval.max - this.settings.lightningInterval.min) + this.settings.lightningInterval.min;
        
        this.lightningTimeout = setTimeout(() => {
          this.lightningFlash = true;
          setTimeout(() => {
            this.lightningFlash = false;
          }, this.settings.lightningDuration);
          
          this.scheduleLightning();
        }, delay);
      }

      drawAll() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw fog at bottom
        if (this.settings.enableFog) {
          this.fogClouds.forEach(cloud => this.drawFog(cloud));
        }
        
        // Draw all elements
        this.leaves.forEach(leaf => this.drawLeaf(leaf));
        this.pumpkins.forEach(pumpkin => this.drawPumpkin(pumpkin));
        this.bats.forEach(bat => this.drawBat(bat));
        this.ghosts.forEach(ghost => this.drawGhost(ghost));
        
        if (this.settings.enableSpiders) {
          this.spiders.forEach(spider => this.drawSpider(spider));
        }
        
        // Draw lightning flash
        if (this.lightningFlash) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
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
        this.createElements();
        
        if (this.settings.enableLightning) {
          this.scheduleLightning();
        }

        if (this.settings.timeout !== null && this.settings.timeout > 0) {
          this.timeoutId = setTimeout(() => this.stopAnimation(), this.settings.timeout);
        }

        const animate = () => {
          if (!this.running) return;
          
          this.updatePumpkins();
          this.updateBats();
          this.updateGhosts();
          this.updateLeaves();
          if (this.settings.enableSpiders) {
            this.updateSpiders();
          }
          if (this.settings.enableFog) {
            this.updateFog();
          }
          
          this.drawAll();
          this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
      }

      startAnimation() {
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
        clearTimeout(this.timeoutId);
        clearTimeout(this.lightningTimeout);
        this.timeoutId = null;
        this.lightningTimeout = null;
        cancelAnimationFrame(this.animationFrame);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pumpkins = [];
        this.bats = [];
        this.ghosts = [];
        this.leaves = [];
        this.spiders = [];
        this.fogClouds = [];
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

    // Export to global scope
    window.HalloweenOverlay = HalloweenOverlay;
  })();
