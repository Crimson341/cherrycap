import { NextResponse } from "next/server";

// This serves the tracking script with the correct Convex URL injected
export async function GET() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    return new NextResponse("// CherryCap: Missing configuration", {
      status: 500,
      headers: { "Content-Type": "application/javascript" },
    });
  }

  // Convert convex.cloud URL to convex.site URL for HTTP actions
  const trackingUrl = convexUrl.replace(".convex.cloud", ".convex.site") + "/track";

  const script = `/**
 * CherryCap Analytics - Advanced Tracking Script
 * Version: 2.0.0
 * 
 * BASIC USAGE (add to <head>):
 * <script src="https://your-domain.com/api/script" data-site-id="cc_xxxxx" defer></script>
 * 
 * ELEMENT TRACKING (add data attributes to elements):
 * 
 * Track clicks on any element:
 * <button data-cc-track="click" data-cc-name="signup-btn">Sign Up</button>
 * 
 * Track gallery views and interactions:
 * <div data-cc-track="gallery" data-cc-name="portfolio">
 *   <img data-cc-track="gallery-item" data-cc-id="photo-1" src="..." />
 *   <img data-cc-track="gallery-item" data-cc-id="photo-2" src="..." />
 * </div>
 * 
 * Track form submissions:
 * <form data-cc-track="form" data-cc-name="contact-form">...</form>
 * 
 * Track video plays:
 * <video data-cc-track="video" data-cc-name="intro-video">...</video>
 * 
 * Track scroll depth on sections:
 * <section data-cc-track="section" data-cc-name="pricing">...</section>
 * 
 * Track downloads:
 * <a data-cc-track="download" data-cc-name="brochure" href="file.pdf">Download</a>
 */

(function() {
  'use strict';

  const TRACKING_URL = '${trackingUrl}';
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const STORAGE_PREFIX = '_cc_';

  let config = {
    siteId: null,
    trackPageviews: true,
    trackPerformance: true,
    trackElements: true,
    trackScrollDepth: true,
    respectDNT: false, // Disabled by default for business tracking
    debug: false,
  };
  
  let sessionId = null;
  let visitorId = null;
  let isInitialized = false;
  let eventQueue = [];
  let trackedSections = new Set();
  let scrollDepthMax = 0;

  // Utilities
  function log(...args) {
    if (config.debug) console.log('[CherryCap]', ...args);
  }

  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getStorage(key) {
    try { return localStorage.getItem(STORAGE_PREFIX + key); } catch { return null; }
  }

  function setStorage(key, value) {
    try { localStorage.setItem(STORAGE_PREFIX + key, value); } catch {}
  }

  function getVisitorId() {
    let id = getStorage('visitor_id');
    if (!id) { id = generateId(); setStorage('visitor_id', id); }
    return id;
  }

  function getSessionId() {
    const stored = getStorage('session');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (Date.now() - data.lastActivity < SESSION_TIMEOUT) {
          data.lastActivity = Date.now();
          setStorage('session', JSON.stringify(data));
          return data.id;
        }
      } catch {}
    }
    const id = generateId();
    setStorage('session', JSON.stringify({ id, lastActivity: Date.now() }));
    return id;
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Safari/')) return 'Safari';
    return 'Other';
  }

  function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Other';
  }

  function getReferrerType(referrer) {
    if (!referrer) return 'direct';
    const searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu'];
    const socialNetworks = ['facebook', 'twitter', 'linkedin', 'instagram', 'pinterest', 'tiktok'];
    try {
      const hostname = new URL(referrer).hostname.toLowerCase();
      for (const engine of searchEngines) if (hostname.includes(engine)) return 'organic';
      for (const network of socialNetworks) if (hostname.includes(network)) return 'social';
      if (hostname === window.location.hostname) return 'internal';
      return 'referral';
    } catch { return 'direct'; }
  }

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
    if (!config.siteId) { eventQueue.push({ type, data }); return; }
    const payload = { type, data: { siteId: config.siteId, sessionId, ...data } };
    log('Tracking:', type, data);
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACKING_URL, JSON.stringify(payload));
    } else {
      fetch(TRACKING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }

  // Core tracking functions
  function trackSession() {
    const referrer = document.referrer;
    const referrerType = getReferrerType(referrer);
    if (referrerType === 'internal') return;
    send('session', {
      visitorId,
      device: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      referrer: referrer || null,
      referrerType,
    });
  }

  function trackPageView(path) {
    const utm = getUTMParams();
    send('pageview', { 
      path: path || window.location.pathname, 
      referrer: document.referrer || null,
      title: document.title,
      ...utm 
    });
  }

  function trackEvent(name, properties) {
    send('event', { name, properties: properties || {} });
  }

  // Element tracking
  function setupElementTracking() {
    if (!config.trackElements) return;

    // Click tracking
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-cc-track]');
      if (!target) return;

      const trackType = target.getAttribute('data-cc-track');
      const name = target.getAttribute('data-cc-name') || '';
      const id = target.getAttribute('data-cc-id') || '';
      const category = target.getAttribute('data-cc-category') || '';

      switch (trackType) {
        case 'click':
          trackEvent('element_click', {
            name,
            id,
            category,
            text: target.textContent?.trim().slice(0, 100),
            tag: target.tagName.toLowerCase(),
          });
          break;

        case 'gallery-item':
          const gallery = target.closest('[data-cc-track="gallery"]');
          trackEvent('gallery_item_click', {
            gallery: gallery?.getAttribute('data-cc-name') || 'unknown',
            itemId: id,
            itemName: name,
            src: target.getAttribute('src') || target.querySelector('img')?.getAttribute('src'),
          });
          break;

        case 'download':
          trackEvent('download', {
            name,
            url: target.getAttribute('href'),
            fileType: target.getAttribute('href')?.split('.').pop(),
          });
          break;

        case 'cta':
          trackEvent('cta_click', {
            name,
            id,
            text: target.textContent?.trim().slice(0, 100),
            destination: target.getAttribute('href'),
          });
          break;
      }
    });

    // Form tracking
    document.addEventListener('submit', (e) => {
      const form = e.target.closest('[data-cc-track="form"]');
      if (!form) return;

      trackEvent('form_submit', {
        name: form.getAttribute('data-cc-name') || '',
        id: form.getAttribute('data-cc-id') || form.id || '',
        action: form.getAttribute('action') || '',
      });
    });

    // Video tracking
    document.querySelectorAll('[data-cc-track="video"]').forEach((video) => {
      const name = video.getAttribute('data-cc-name') || '';
      
      video.addEventListener('play', () => {
        trackEvent('video_play', { name, currentTime: video.currentTime });
      });
      
      video.addEventListener('pause', () => {
        trackEvent('video_pause', { name, currentTime: video.currentTime, duration: video.duration });
      });
      
      video.addEventListener('ended', () => {
        trackEvent('video_complete', { name, duration: video.duration });
      });
    });

    // Gallery view tracking (when gallery comes into view)
    if ('IntersectionObserver' in window) {
      const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const gallery = entry.target;
            const name = gallery.getAttribute('data-cc-name') || '';
            const items = gallery.querySelectorAll('[data-cc-track="gallery-item"]');
            
            trackEvent('gallery_view', {
              name,
              itemCount: items.length,
            });
            
            galleryObserver.unobserve(gallery);
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('[data-cc-track="gallery"]').forEach((gallery) => {
        galleryObserver.observe(gallery);
      });
    }
  }

  // Section visibility tracking
  function setupSectionTracking() {
    if (!('IntersectionObserver' in window)) return;

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target;
          const name = section.getAttribute('data-cc-name') || section.id || '';
          const key = name || entry.target.tagName;
          
          if (!trackedSections.has(key)) {
            trackedSections.add(key);
            trackEvent('section_view', {
              name,
              id: section.id || '',
            });
          }
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-cc-track="section"]').forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // Scroll depth tracking
  function setupScrollTracking() {
    if (!config.trackScrollDepth) return;

    const checkScrollDepth = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      const milestones = [25, 50, 75, 90, 100];
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && scrollDepthMax < milestone) {
          scrollDepthMax = milestone;
          trackEvent('scroll_depth', { depth: milestone, path: window.location.pathname });
        }
      }
    };

    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkScrollDepth, 100);
    }, { passive: true });
  }

  // Performance tracking
  function trackPerformance() {
    if (!config.trackPerformance) return;
    if (document.readyState !== 'complete') {
      window.addEventListener('load', trackPerformance);
      return;
    }

    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const metrics = { path: window.location.pathname };

      if (navigation) {
        metrics.loadTime = Math.round(navigation.loadEventEnd - navigation.startTime);
        metrics.ttfb = Math.round(navigation.responseStart - navigation.requestStart);
      }

      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) metrics.fcp = Math.round(fcpEntry.startTime);

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
          setTimeout(() => { if (!metrics.lcp) send('performance', metrics); }, 5000);
        } catch { send('performance', metrics); }
      } else {
        send('performance', metrics);
      }
    }, 100);
  }

  // SPA navigation tracking
  function setupSPATracking() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      trackedSections.clear();
      scrollDepthMax = 0;
      trackPageView();
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      trackPageView();
    };
    
    window.addEventListener('popstate', () => {
      trackedSections.clear();
      scrollDepthMax = 0;
      trackPageView();
    });
  }

  // Session end tracking
  function setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        send('end', { scrollDepthMax });
      }
    });
    
    window.addEventListener('beforeunload', () => {
      send('end', { scrollDepthMax });
    });
  }

  // Initialize
  function init(options) {
    if (isInitialized) { log('Already initialized'); return; }
    if (options.respectDNT && navigator.doNotTrack === '1') { log('DNT enabled'); return; }
    
    config = { ...config, ...options };
    if (!config.siteId) { console.error('[CherryCap] Missing siteId'); return; }
    
    log('Initializing with config:', config);
    
    visitorId = getVisitorId();
    sessionId = getSessionId();
    
    trackSession();
    if (config.trackPageviews) trackPageView();
    trackPerformance();
    
    setupElementTracking();
    setupSectionTracking();
    setupScrollTracking();
    setupSPATracking();
    setupVisibilityTracking();
    
    while (eventQueue.length > 0) {
      const event = eventQueue.shift();
      send(event.type, event.data);
    }
    
    isInitialized = true;
    log('Initialized successfully');
  }

  // Public API
  window.CherryCap = {
    init,
    track: trackEvent,
    trackPageView,
    // Manual element tracking
    trackClick: (name, props) => trackEvent('element_click', { name, ...props }),
    trackGalleryView: (name, itemCount) => trackEvent('gallery_view', { name, itemCount }),
    trackGalleryItem: (gallery, itemId) => trackEvent('gallery_item_click', { gallery, itemId }),
    trackForm: (name, props) => trackEvent('form_submit', { name, ...props }),
    trackDownload: (name, url) => trackEvent('download', { name, url }),
    trackVideo: (name, action, time) => trackEvent('video_' + action, { name, currentTime: time }),
  };

  // Process command queue
  const queue = window.cherrycap || [];
  window.cherrycap = {
    push: function(args) {
      const [command, params] = args;
      if (command === 'init') init(params);
      else if (command === 'track') trackEvent(params.name, params.properties);
      else if (command === 'trackPageView') trackPageView(params);
    },
  };
  for (const args of queue) window.cherrycap.push(args);

  // Auto-init from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-site-id]');
  if (scriptTag) {
    const siteId = scriptTag.getAttribute('data-site-id');
    if (siteId) init({
      siteId,
      debug: scriptTag.hasAttribute('data-debug'),
      trackPerformance: !scriptTag.hasAttribute('data-no-performance'),
      trackElements: !scriptTag.hasAttribute('data-no-elements'),
      trackScrollDepth: !scriptTag.hasAttribute('data-no-scroll'),
    });
  }
})();
`;

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      "Access-Control-Allow-Origin": "*",
    },
  });
}
