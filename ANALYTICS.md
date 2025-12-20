# CherryCap Analytics System

## Overview

CherryCap Analytics is a white-label analytics tracking system. You (the admin) add tracking to client websites, and clients view their analytics in the CherryCap dashboard.

## Architecture

```
Client Website                    CherryCap
┌─────────────────┐              ┌─────────────────────────────┐
│  tracking       │   HTTP POST  │  Convex HTTP Endpoint       │
│  script         │ ──────────►  │  /track                     │
│  (cherrycap.js) │              │                             │
└─────────────────┘              │  ┌─────────────────────┐    │
                                 │  │ Convex Database     │    │
                                 │  │ - sites             │    │
                                 │  │ - pageViews         │    │
                                 │  │ - sessions          │    │
                                 │  │ - performance       │    │
                                 │  │ - events            │    │
                                 │  └─────────────────────┘    │
                                 │                             │
                                 │  ┌─────────────────────┐    │
                                 │  │ Next.js Dashboard   │    │
                                 │  │ /dashboard          │    │
                                 │  └─────────────────────┘    │
                                 └─────────────────────────────┘
```

## File Structure

```
/convex
  schema.ts          # Database schema (sites, pageViews, sessions, etc.)
  sites.ts           # Site CRUD operations
  tracking.ts        # Tracking mutations (pageview, session, event, etc.)
  analytics.ts       # Query functions for dashboard
  http.ts            # HTTP endpoints for tracking script
  auth.config.ts     # Clerk authentication config

/app
  /api/script
    route.ts         # Serves the tracking script with Convex URL injected
  /dashboard
    page.tsx         # Main dashboard with charts
    /sites
      page.tsx       # Site management (admin only)

/components/ui
  charts.tsx         # Recharts components for dashboard

/public/js
  cherrycap.js       # Static version of tracking script (backup)
```

## Database Schema

### sites
Registered websites for tracking.
```typescript
{
  userId: string,      // Clerk user ID (owner)
  name: string,        // Display name
  domain: string,      // e.g., "example.com"
  siteId: string,      // Public tracking ID (cc_xxxxx)
  createdAt: number,
  isActive: boolean,
}
```

### pageViews
Individual page view events.
```typescript
{
  siteId: string,
  sessionId: string,
  path: string,
  referrer?: string,
  timestamp: number,
  utmSource?: string,
  utmMedium?: string,
  utmCampaign?: string,
}
```

### sessions
Visitor sessions (30-min timeout).
```typescript
{
  siteId: string,
  sessionId: string,
  visitorId: string,    // Persistent across sessions
  startTime: number,
  lastActivity: number,
  device: string,       // "desktop" | "mobile" | "tablet"
  browser: string,
  os: string,
  country?: string,
  referrer?: string,
  referrerType?: string, // "direct" | "organic" | "social" | "referral"
  pageCount: number,
  duration: number,
  isBounce: boolean,
}
```

### performance
Web Vitals metrics.
```typescript
{
  siteId: string,
  sessionId: string,
  path: string,
  timestamp: number,
  lcp?: number,        // Largest Contentful Paint
  fid?: number,        // First Input Delay
  cls?: number,        // Cumulative Layout Shift
  fcp?: number,        // First Contentful Paint
  ttfb?: number,       // Time to First Byte
  loadTime?: number,
}
```

### events
Custom tracked events.
```typescript
{
  siteId: string,
  sessionId: string,
  name: string,        // e.g., "gallery_item_click", "form_submit"
  properties?: any,    // Custom data
  timestamp: number,
}
```

## Tracking Script

### Installation

Add to client website `<head>`:
```html
<script src="https://YOUR_DOMAIN/api/script" data-site-id="cc_xxxxx" defer></script>
```

### Script Options (data attributes)

| Attribute | Description |
|-----------|-------------|
| `data-site-id` | Required. The site's tracking ID |
| `data-debug` | Enable console logging |
| `data-no-performance` | Disable performance tracking |
| `data-no-elements` | Disable element tracking |
| `data-no-scroll` | Disable scroll depth tracking |

### Auto-Tracked Events

The script automatically tracks:
- Page views (including SPA navigation)
- Sessions (new/returning visitors)
- Performance metrics (LCP, FCP, TTFB, load time)
- Scroll depth (25%, 50%, 75%, 90%, 100%)
- Session end (on page close)

### Element Tracking

Add `data-cc-*` attributes to track specific elements.

#### Click Tracking
```html
<button data-cc-track="click" data-cc-name="signup-btn">Sign Up</button>
```
Event: `element_click` with `{ name, text, tag }`

#### Gallery Tracking
```html
<div data-cc-track="gallery" data-cc-name="portfolio">
  <img data-cc-track="gallery-item" data-cc-id="photo-1" src="..." />
  <img data-cc-track="gallery-item" data-cc-id="photo-2" src="..." />
</div>
```
Events:
- `gallery_view` when gallery scrolls into view
- `gallery_item_click` when item is clicked

#### Form Tracking
```html
<form data-cc-track="form" data-cc-name="contact-form">...</form>
```
Event: `form_submit` with `{ name, id, action }`

#### Video Tracking
```html
<video data-cc-track="video" data-cc-name="intro-video">...</video>
```
Events: `video_play`, `video_pause`, `video_complete`

#### Section Tracking
```html
<section data-cc-track="section" data-cc-name="pricing">...</section>
```
Event: `section_view` when section scrolls into view (30% visible)

#### Download Tracking
```html
<a data-cc-track="download" data-cc-name="brochure" href="file.pdf">Download</a>
```
Event: `download` with `{ name, url, fileType }`

#### CTA Tracking
```html
<a data-cc-track="cta" data-cc-name="book-now" href="/booking">Book Now</a>
```
Event: `cta_click` with `{ name, text, destination }`

### JavaScript API

```javascript
// Track custom event
CherryCap.track('event_name', { custom: 'properties' });

// Manual page view (for SPAs if needed)
CherryCap.trackPageView('/custom-path');

// Convenience methods
CherryCap.trackClick('button-name', { extra: 'data' });
CherryCap.trackGalleryView('gallery-name', itemCount);
CherryCap.trackGalleryItem('gallery-name', 'item-id');
CherryCap.trackForm('form-name', { fields: 'count' });
CherryCap.trackDownload('file-name', 'https://url.com/file.pdf');
CherryCap.trackVideo('video-name', 'play', currentTime);
```

## Convex Functions

### Sites (`convex/sites.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `createSite` | mutation | Create new tracked site |
| `getUserSites` | query | Get all sites for current user |
| `getSite` | query | Get single site by siteId |
| `updateSite` | mutation | Update site settings |
| `deleteSite` | mutation | Delete site |
| `validateSiteId` | query | Check if siteId exists |

### Tracking (`convex/tracking.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `trackPageView` | mutation | Record page view |
| `trackSession` | mutation | Create/update session |
| `trackPerformance` | mutation | Record Web Vitals |
| `trackEvent` | mutation | Record custom event |
| `endSession` | mutation | Mark session ended |

### Analytics (`convex/analytics.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `getOverviewStats` | query | Visitors, sessions, bounce rate, etc. |
| `getTrafficOverTime` | query | Daily visitors/pageviews |
| `getTrafficSources` | query | Direct, organic, social breakdown |
| `getDeviceBreakdown` | query | Desktop/mobile/tablet split |
| `getTopPages` | query | Most viewed pages |
| `getPerformanceMetrics` | query | Daily performance averages |
| `getActiveVisitors` | query | Real-time active sessions |

### HTTP Endpoints (`convex/http.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/track` | POST | Main tracking endpoint |
| `/track` | OPTIONS | CORS preflight |
| `/track/batch` | POST | Batch multiple events |

Request body:
```json
{
  "type": "pageview|session|performance|event|end",
  "data": {
    "siteId": "cc_xxxxx",
    "sessionId": "uuid",
    ...
  }
}
```

## Admin vs Client Access

The sites page (`/dashboard/sites`) checks user email against `ADMIN_EMAILS` array.

**Admin sees:**
- All site management features
- Site IDs
- Tracking code snippets
- Delete buttons

**Client sees:**
- Their sites only
- View Analytics button only
- No tracking code or site IDs

Update admin emails in `/app/dashboard/sites/page.tsx`:
```typescript
const ADMIN_EMAILS = ["your-email@example.com"];
```

## Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
CLERK_JWT_ISSUER_DOMAIN=https://xxx.clerk.accounts.dev

# Convex
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
```

## Deployment

1. Deploy Convex schema:
   ```bash
   npx convex dev      # Development
   npx convex deploy   # Production
   ```

2. Add `CLERK_JWT_ISSUER_DOMAIN` to Convex Dashboard environment variables

3. The tracking script URL will be:
   ```
   https://YOUR_DOMAIN/api/script
   ```

4. HTTP tracking endpoint will be:
   ```
   https://YOUR_CONVEX_DEPLOYMENT.convex.site/track
   ```
