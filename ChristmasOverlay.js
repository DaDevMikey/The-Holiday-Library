(function () {
    const defaultOptions = {
      snowflakeCount: 50,
      snowflakeColor: 'white',
      zIndex: 9999,
      minSize: 3,
      maxSize: 12,
      minOpacity: 0.4,
      maxOpacity: 1,
      // Time-based scheduling options
      startTime: null, // Format: "HH:MM" (24-hour), e.g., "18:00"
      endTime: null,   // Format: "HH:MM" (24-hour), e.g., "23:59"
    };

    let schedulerInterval = null;

    const isValidTimeFormat = (time) => {
      if (typeof time !== 'string') return false;
      const match = time.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return false;
      const hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      return hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59;
    };

    const isWithinSchedule = (startTime, endTime) => {
      if (!startTime || !endTime) return true;
      if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) return true;
      
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      // Handle overnight schedules (e.g., 22:00 to 06:00)
      if (endMinutes < startMinutes) {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }
      
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    };
  
    const createOverlay = (options) => {
      const { snowflakeCount, snowflakeColor, zIndex, minSize, maxSize, minOpacity, maxOpacity } = options;
  
      // Create overlay container
      const overlay = document.createElement('div');
      overlay.id = 'christmas-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = zIndex;
      overlay.style.overflow = 'hidden';
  
      // Add falling snowflakes with varied sizes and animations
      for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Varied size for depth perception
        const size = minSize + Math.random() * (maxSize - minSize);
        // Varied opacity based on size (smaller = more distant = more transparent)
        const opacity = minOpacity + ((size - minSize) / (maxSize - minSize)) * (maxOpacity - minOpacity);
        // Varied fall duration based on size (smaller = slower for parallax effect)
        const fallDuration = 8 + (1 - (size - minSize) / (maxSize - minSize)) * 12;
        // Random horizontal sway amount
        const swayAmount = 20 + Math.random() * 40;
        // Random sway duration
        const swayDuration = 2 + Math.random() * 3;
        // Random animation delay for staggered start
        const animDelay = Math.random() * -20;
        
        snowflake.style.position = 'absolute';
        snowflake.style.top = `${Math.random() * -20}%`;
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.background = snowflakeColor;
        snowflake.style.borderRadius = '50%';
        snowflake.style.opacity = `${opacity}`;
        snowflake.style.boxShadow = `0 0 ${size/2}px ${snowflakeColor}`;
        snowflake.style.setProperty('--sway-amount', `${swayAmount}px`);
        snowflake.style.setProperty('--sway-duration', `${swayDuration}s`);
        snowflake.style.animation = `snowfall ${fallDuration}s linear infinite, snowsway var(--sway-duration) ease-in-out infinite`;
        snowflake.style.animationDelay = `${animDelay}s, ${Math.random() * swayDuration}s`;
        
        overlay.appendChild(snowflake);
      }
  
      document.body.appendChild(overlay);
    };
  
    const injectStyles = () => {
      if (document.getElementById('christmas-overlay-styles')) return;
      const style = document.createElement('style');
      style.id = 'christmas-overlay-styles';
      style.textContent = `
        @keyframes snowfall {
          0% { transform: translateY(-10vh); }
          100% { transform: translateY(110vh); }
        }
        @keyframes snowsway {
          0%, 100% { margin-left: 0; }
          25% { margin-left: var(--sway-amount); }
          75% { margin-left: calc(var(--sway-amount) * -1); }
        }
        .snowflake {
          will-change: transform, margin-left;
        }
      `;
      document.head.appendChild(style);
    };

    const removeStyles = () => {
      const style = document.getElementById('christmas-overlay-styles');
      if (style) style.remove();
    };

    const startScheduler = (options) => {
      if (schedulerInterval) clearInterval(schedulerInterval);
      
      const checkSchedule = () => {
        const shouldBeActive = isWithinSchedule(options.startTime, options.endTime);
        const overlay = document.getElementById('christmas-overlay');
        
        if (shouldBeActive && !overlay) {
          injectStyles();
          createOverlay(options);
        } else if (!shouldBeActive && overlay) {
          overlay.remove();
          removeStyles();
        }
      };
      
      // Check immediately
      checkSchedule();
      // Then check every minute
      schedulerInterval = setInterval(checkSchedule, 60000);
    };
  
    // Public API
    window.christmasOverlaySnow = {
      enable: (userOptions = {}) => {
        const options = { ...defaultOptions, ...userOptions };
        
        if (options.startTime && options.endTime) {
          // Use time-based scheduling
          startScheduler(options);
        } else {
          // Immediate enable without scheduling
          if (!document.getElementById('christmas-overlay')) {
            injectStyles();
            createOverlay(options);
          }
        }
      },
      disable: () => {
        if (schedulerInterval) {
          clearInterval(schedulerInterval);
          schedulerInterval = null;
        }
        const overlay = document.getElementById('christmas-overlay');
        if (overlay) overlay.remove();
        removeStyles();
      },
      isActive: () => {
        return !!document.getElementById('christmas-overlay');
      }
    };
  })();
  