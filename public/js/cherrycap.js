/**
 * CherryCap Analytics - Lightweight tracking script
 * 
 * Usage:
 * <script src="https://your-domain.com/js/cherrycap.js" data-site-id="cc_xxxxx"></script>
 * 
 * Or with options:
 * <script>
 *   window.cherrycap = window.cherrycap || [];
 *   window.cherrycap.push(['init', { siteId: 'cc_xxxxx' }]);
 * </script>
 * <script src="https://your-domain.com/js/cherrycap.js" async></script>
 */

(function() {
  'use strict';

  // Configuration
  const TRACKING_URL = 'https://YOUR_CONVEX_URL.convex.site/track'; // Replace with actual Convex HTTP URL
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const STORAGE_PREFIX = '_cc_';

  // State
  let config = {
    siteId: null,
    trackPageviews: true,
    trackPerformance: true,
    trackOutboundLinks: true,
    respectDNT: true,
    debug: false,
  };
  let sessionId = null;
  let visitorId = null;
  let isInitialized = false;
  let eventQueue = [];

  // Utility functions
  function log(...args) {
    if (config.debug) {
      console.log('[CherryCap]', ...args);
    }
  }

  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getStorage(key) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key);
    } catch (e) {
      return null;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch (e) {
      // Storage not available
    }
  }

  // Get or create visitor ID (persistent across sessions)
  function getVisitorId() {
    let id = getStorage('visitor_id');
    if (!id) {
      id = generateId();
      setStorage('visitor_id', id);
    }
    return id;
  }

  // Get or create session ID (expires after inactivity)
  function getSessionId() {
    const stored = getStorage('session');
    if (stored) {
      const data = JSON.parse(stored);
      if (Date.now() - data.lastActivity < SESSION_TIMEOUT) {
        data.lastActivity = Date.now();
        setStorage('session', JSON.stringify(data));
        return data.id;
      }
    }
    
    // Create new session
    const id = generateId();
    setStorage('session', JSON.stringify({
      id: id,
      lastActivity: Date.now(),
    }));
    return id;
  }

  // Detect device type
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Detect browser
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Safari/')) return 'Safari';
    if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera';
    return 'Other';
  }

  // Detect OS
  function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Other';
  }

  // Detect referrer type
  function getReferrerType(referrer) {
    if (!referrer) return 'direct';
    
    const searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'];
    const socialNetworks = ['facebook', 'twitter', 'linkedin', 'instagram', 'pinterest', 'reddit', 'tiktok', 'youtube'];
    
    const hostname = new URL(referrer).hostname.toLowerCase();
    
    for (const engine of searchEngines) {
      if (hostname.includes(engine)) return 'organic';
    }
    
    for (const network of socialNetworks) {
      if (hostname.includes(network)) return 'social';
    }
    
    // Check if it's the same domain (internal)
    if (hostname === window.location.hostname) return 'internal';
    
    return 'referral';
  }

  // Get UTM parameters
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
    };
  }

  // Send tracking data
  function send(type, data) {
    if (!config.siteId) {
      eventQueue.push({ type, data });
      return;
    }

    const payload = {
      type,
      data: {
        siteId: config.siteId,
        sessionId: sessionId,
        ...data,
      },
    };

    log('Sending:', payload);

    // Use sendBeacon if available (works even when page is closing)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACKING_URL, JSON.stringify(payload));
    } else {
      // Fallback to fetch
      fetch(TRACKING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }

  // Track session start
  function trackSession() {
    const referrer = document.referrer;
    const referrerType = getReferrerType(referrer);

    // Don't track internal navigation as new referrer
    if (referrerType === 'internal') {
      return;
    }

    send('session', {
      visitorId: visitorId,
      device: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      referrer: referrer || null,
      referrerType: referrerType,
    });
  }

  // Track page view
  function trackPageView(path) {
    const utm = getUTMParams();
    
    send('pageview', {
      path: path || window.location.pathname,
      referrer: document.referrer || null,
      ...utm,
    });
  }

  // Track performance metrics
  function trackPerformance() {
    if (!config.trackPerformance) return;

    // Wait for the page to fully load
    if (document.readyState !== 'complete') {
      window.addEventListener('load', trackPerformance);
      return;
    }

    // Give a small delay to ensure metrics are available
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const metrics = {
        path: window.location.pathname,
      };

      if (navigation) {
        metrics.loadTime = Math.round(navigation.loadEventEnd - navigation.startTime);
        metrics.ttfb = Math.round(navigation.responseStart - navigation.requestStart);
      }

      // First Contentful Paint
      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = Math.round(fcpEntry.startTime);
      }

      // LCP (requires PerformanceObserver)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = Math.round(lastEntry.startTime);
            send('performance', metrics);
            lcpObserver.disconnect();
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback if LCP doesn't fire within 5 seconds
          setTimeout(() => {
            if (!metrics.lcp) {
              send('performance', metrics);
            }
          }, 5000);
        } catch (e) {
          send('performance', metrics);
        }
      } else {
        send('performance', metrics);
      }
    }, 100);
  }

  // Track custom event
  function trackEvent(name, properties) {
    send('event', {
      name: name,
      properties: properties || {},
    });
  }

  // Track outbound link clicks
  function setupOutboundTracking() {
    if (!config.trackOutboundLinks) return;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.hostname !== window.location.hostname) {
          trackEvent('outbound_click', {
            url: href,
            text: link.textContent?.trim().slice(0, 100),
          });
        }
      } catch (e) {
        // Invalid URL
      }
    });
  }

  // Handle page visibility changes (for session ending)
  function setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        send('end', {});
      }
    });

    window.addEventListener('beforeunload', () => {
      send('end', {});
    });
  }

  // Handle SPA navigation
  function setupSPATracking() {
    // History API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
      originalPushState.apply(this, arguments);
      trackPageView();
    };

    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      trackPageView();
    };

    window.addEventListener('popstate', () => {
      trackPageView();
    });
  }

  // Initialize the tracker
  function init(options) {
    if (isInitialized) {
      log('Already initialized');
      return;
    }

    // Check Do Not Track
    if (options.respectDNT !== false && navigator.doNotTrack === '1') {
      log('Do Not Track is enabled, not tracking');
      return;
    }

    // Merge options
    config = { ...config, ...options };

    if (!config.siteId) {
      console.error('[CherryCap] Missing siteId');
      return;
    }

    log('Initializing with config:', config);

    // Get IDs
    visitorId = getVisitorId();
    sessionId = getSessionId();

    // Track session
    trackSession();

    // Track initial page view
    if (config.trackPageviews) {
      trackPageView();
    }

    // Track performance
    trackPerformance();

    // Setup event listeners
    setupOutboundTracking();
    setupVisibilityTracking();
    setupSPATracking();

    // Process queued events
    while (eventQueue.length > 0) {
      const event = eventQueue.shift();
      send(event.type, event.data);
    }

    isInitialized = true;
    log('Initialized successfully');
  }

  // Public API
  window.CherryCap = {
    init: init,
    track: trackEvent,
    trackPageView: trackPageView,
  };

  // Process command queue (for async loading)
  const queue = window.cherrycap || [];
  window.cherrycap = {
    push: function(args) {
      const command = args[0];
      const params = args[1];
      
      if (command === 'init') {
        init(params);
      } else if (command === 'track') {
        trackEvent(params.name, params.properties);
      } else if (command === 'trackPageView') {
        trackPageView(params);
      }
    },
  };

  // Process existing queue
  for (const args of queue) {
    window.cherrycap.push(args);
  }

  // Auto-init from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-site-id]');
  if (scriptTag) {
    const siteId = scriptTag.getAttribute('data-site-id');
    if (siteId) {
      init({
        siteId: siteId,
        debug: scriptTag.hasAttribute('data-debug'),
        respectDNT: !scriptTag.hasAttribute('data-ignore-dnt'),
        trackPerformance: !scriptTag.hasAttribute('data-no-performance'),
        trackOutboundLinks: !scriptTag.hasAttribute('data-no-outbound'),
      });
    }
  }
})();
