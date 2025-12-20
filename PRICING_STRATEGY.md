# CherryCap Pricing Strategy

## Executive Summary

CherryCap is a multi-feature SaaS platform combining:
1. **Website Analytics** (like Fathom, Pirsch, Plausible)
2. **AI-Powered Insights** (unique differentiator)
3. **Unified Inbox/CRM** (like Crisp, Intercom)
4. **Customer Communications** (Gmail, social integrations)

This positions CherryCap as an **all-in-one small business operations platform** rather than competing in a single category.

---

## Competitor Analysis

### Privacy-Focused Analytics

| Competitor | Pricing Model | Starting Price | Notes |
|------------|---------------|----------------|-------|
| **Fathom Analytics** | Pageviews | $15/mo (100K views) | No free tier, forever data retention |
| **Pirsch Analytics** | Pageviews | $6/mo (10K views) | 30-day trial, German-hosted |
| **Plausible** | Pageviews | ~$9/mo (10K views) | Open source option |
| **Simple Analytics** | Pageviews | $9/mo | EU-focused |

### Customer Support/Inbox Platforms

| Competitor | Pricing Model | Starting Price | Notes |
|------------|---------------|----------------|-------|
| **Intercom** | Per seat + AI resolution | $29/seat/mo + $0.99/resolution | Enterprise-focused, expensive |
| **Crisp** | Flat per workspace | $45/mo (Mini), $95/mo (Essentials) | Includes AI chatbot |
| **Drift** | Per seat | Custom pricing | Very enterprise |
| **Freshdesk** | Per agent | $15/agent/mo | No AI included |

### AI Costs to Consider

| AI Provider | Model | Cost |
|-------------|-------|------|
| **OpenRouter - Gemini 2.5 Flash** | Your current model | ~$0.10-0.30 per 1M tokens |
| **OpenAI GPT-4o-mini** | Alternative | ~$0.15 input / $0.60 output per 1M tokens |
| **Claude Sonnet** | Premium option | ~$3 input / $15 output per 1M tokens |
| **Intercom Fin** | Per resolution | $0.99 per resolved conversation |

**Estimated AI cost per user query**: $0.001-0.01 (with Gemini 2.5 Flash)

### Infrastructure Costs

| Service | Your Usage | Estimated Cost |
|---------|------------|----------------|
| **Convex** | Database + Functions | Free tier -> $25/mo+ |
| **Clerk** | Auth | Free (10K MAU) -> $25/mo+ |
| **Vercel** | Hosting | Free -> $20/mo+ |
| **Email (Postmark/Resend)** | Transactional | $15/mo (10K emails) |

---

## Recommended Pricing Structure

### Option A: Tiered Plans (Recommended)

```
                    FREE          STARTER        PRO           BUSINESS
Monthly Price       $0            $19/mo         $49/mo        $99/mo
Annual Price        -             $190/yr        $490/yr       $990/yr
                                  (save $38)     (save $98)    (save $198)

ANALYTICS
Pageviews/mo        5,000         50,000         250,000       1,000,000
Sites               1             3              10            Unlimited
Data Retention      30 days       1 year         Forever       Forever
Custom Events       10/mo         100/mo         Unlimited     Unlimited

AI FEATURES
AI Chat Queries     10/mo         100/mo         500/mo        2,000/mo
AI Summaries        -             Yes            Yes           Yes
AI Insights         -             Basic          Advanced      Advanced

INBOX/CRM
Connected Accounts  1             3              5             Unlimited
Customers           100           1,000          10,000        Unlimited
Email Sync          -             Last 30 days   Last 90 days  Full history
AI Email Analysis   -             -              Yes           Yes

SUPPORT
Support             Community     Email          Priority      Dedicated
API Access          -             Read-only      Full          Full
White Label         -             -              -             Yes
```

### Option B: Usage-Based Hybrid (Alternative)

```
BASE PLATFORM: $29/mo
Includes:
- 25,000 pageviews
- 50 AI queries
- 3 sites
- 1,000 customers
- Basic inbox features

ADD-ONS:
- Extra pageviews: $5 per 25,000
- Extra AI queries: $10 per 100
- Extra sites: $5 per site
- Extra inbox accounts: $10 per account
- AI Email Analysis: $15/mo add-on
```

### Option C: Per-Resolution AI Model (Like Intercom)

```
PLATFORM: $19/mo base
- Unlimited analytics (up to 100K views)
- Basic features

AI RESOLUTIONS: $0.25 per AI-answered query
- Only pay when AI successfully helps
- Cap at $50/mo (200 queries) then unlimited
```

---

## Recommended Strategy: Option A with Modifications

### Final Recommended Tiers

#### Free Tier - "Starter"
**$0/month**
- 5,000 pageviews/month
- 1 website
- 30-day data retention
- 10 AI queries/month
- Basic dashboard
- Community support

*Purpose: Lead generation, try before you buy*

#### Growth - "Most Popular"
**$29/month** ($290/year - save $58)
- 100,000 pageviews/month
- 5 websites
- 1-year data retention
- 200 AI queries/month
- 3 connected accounts (Gmail, etc.)
- 2,500 customers
- Email support
- Custom events tracking

*Target: Small businesses, freelancers, agencies*

#### Pro
**$79/month** ($790/year - save $158)
- 500,000 pageviews/month
- Unlimited websites
- Forever data retention
- 1,000 AI queries/month
- 10 connected accounts
- 25,000 customers
- AI email analysis & categorization
- Priority support
- API access
- Funnels & advanced reports

*Target: Growing businesses, marketing teams*

#### Business
**$199/month** ($1,990/year - save $398)
- 2,000,000 pageviews/month
- Everything in Pro
- Unlimited AI queries
- Unlimited connected accounts
- Unlimited customers
- White-label option
- Dedicated account manager
- Custom integrations
- SSO/SAML
- SLA guarantee

*Target: Agencies managing multiple clients, enterprises*

---

## Pricing Psychology & Positioning

### Why These Prices Work

1. **Free tier** creates viral growth and reduces friction
2. **$29** is the psychological "small business sweet spot" - same as Intercom Essential
3. **$79** positions as "serious tool" but still accessible
4. **$199** enterprise tier for white-label/agency use

### Competitive Positioning

| Feature | CherryCap | Fathom + Intercom | Crisp + Pirsch |
|---------|-----------|-------------------|----------------|
| Analytics | Included | $15/mo separate | $6/mo separate |
| AI Chat | Included | $29/mo + $0.99/res | $95/mo (Essentials) |
| Inbox | Included | $29/mo | $95/mo |
| **Total** | **$29-79/mo** | **$44-74/mo+** | **$101/mo+** |

**Value Proposition**: "Get analytics AND AI inbox for less than competitors charge for just one."

---

## Cost Analysis & Margins

### Estimated Cost Per User (Growth Tier)

| Cost Center | Monthly Cost |
|-------------|--------------|
| Convex (pro-rated) | $2-5 |
| AI tokens (200 queries) | $0.50-2 |
| Email delivery | $1-3 |
| Auth (Clerk) | $0.50-1 |
| Infrastructure | $1-2 |
| **Total** | **$5-13** |

**Margin at $29/mo**: 55-83% gross margin

### Break-Even Analysis

- Fixed costs (tooling, hosting base): ~$100/mo
- Variable cost per user: ~$8/mo average
- **Break-even**: ~5 paying users
- **Profitable**: 10+ paying users

---

## Go-to-Market Recommendations

### Launch Strategy

1. **Beta Period (2-3 months)**
   - Offer lifetime 50% discount to first 100 users
   - "Founding Member" badge
   - Lock in $14.50/mo forever for Growth tier

2. **Product Hunt Launch**
   - Free tier prominent
   - Limited-time 30% annual discount

3. **Ongoing Promotions**
   - Annual = 2 months free (17% discount)
   - Startup program: 50% off first year if < $1M ARR
   - Nonprofit: 50% off always

### Feature Gating Strategy

| Feature | Free | Growth | Pro | Business |
|---------|------|--------|-----|----------|
| Real-time analytics | Yes | Yes | Yes | Yes |
| AI analytics chat | Limited | Yes | Yes | Yes |
| Custom events | Limited | Yes | Yes | Yes |
| Email inbox | - | Yes | Yes | Yes |
| AI email triage | - | - | Yes | Yes |
| White label | - | - | - | Yes |
| API | - | Read | Full | Full |

---

## Overage Handling

### Soft Limits Approach (Recommended)
- At 80% usage: Email notification
- At 100% usage: Dashboard warning, features still work
- At 150% usage: Auto-upgrade suggestion, features still work
- At 200% usage: Features paused until upgrade or next billing cycle

*Never hard-cutoff during critical usage - builds goodwill*

---

## Future Monetization Opportunities

### Phase 2 Add-ons
- **Dedicated support**: +$50/mo
- **Extended data retention**: +$10/mo per year
- **Custom AI training**: +$25/mo
- **Advanced reporting/exports**: +$15/mo
- **SMS notifications**: Usage-based

### Phase 3 Features
- **Marketing automation**: Separate pricing tier
- **A/B testing**: Premium add-on
- **Heatmaps/session recording**: Premium add-on
- **Social media management**: Separate product

---

## Summary

| Tier | Price | Target | Key Value |
|------|-------|--------|-----------|
| Free | $0 | Hobbyists | Try it out |
| Growth | $29 | Small biz | Analytics + AI + Inbox |
| Pro | $79 | Growing teams | Unlimited + Advanced AI |
| Business | $199 | Agencies | White-label + Enterprise |

**Key Differentiator**: CherryCap offers analytics, AI insights, AND customer inbox in one platform for less than competitors charge for just analytics OR just inbox alone.

---

## Team/Employee Seats Pricing (Business Profiles)

### Overview

Business profiles can add team members (employees) with per-seat pricing. This is a significant revenue opportunity as teams scale.

### Competitor Analysis - Per-Seat Pricing

| Competitor | Base Price | Per-Seat Cost | Notes |
|------------|------------|---------------|-------|
| **Intercom** | $29/mo | $29/seat/mo | Same as base, expensive |
| **Crisp** | $95/mo | Included (4 seats) | +$10/extra seat |
| **Freshdesk** | $15/agent/mo | $15/agent | Pure per-seat |
| **HubSpot** | $45/mo | $23/seat/mo | Starter plan |
| **Zendesk** | $19/agent/mo | $19/agent | Support Suite |
| **Notion** | $8/user/mo | $8/user | Team plan |
| **Linear** | $8/user/mo | $8/user | Pro plan |
| **Slack** | $7.25/user/mo | $7.25/user | Pro plan |

**Average per-seat cost in SaaS**: $8-25/seat/month

### Recommended Team Seat Pricing

```
                    FREE      GROWTH     PRO        BUSINESS   ENTERPRISE
Base Price          $0        $29/mo     $79/mo     $199/mo    Custom
Included Seats      1         1          3          10         Unlimited
Max Seats           1         5          25         100        Unlimited
Extra Seat Cost     -         $15/seat   $12/seat   $10/seat   $8/seat
```

### Per-Seat Pricing Rationale

| Plan | Per-Seat Price | Justification |
|------|----------------|---------------|
| **Growth: $15/seat** | Higher per-seat to encourage Pro upgrade | Small teams pay premium |
| **Pro: $12/seat** | Volume discount, 3 seats included | Sweet spot for growing teams |
| **Business: $10/seat** | Enterprise volume discount | Scales well for agencies |
| **Enterprise: $8/seat** | Maximum discount, negotiable | Custom contracts |

### Why This Works

1. **Growth tier seats are expensive** - Encourages upgrade to Pro where 3 seats included
2. **Pro includes 3 seats** - Most small teams need 2-5 people, this is the value tier
3. **Business includes 10 seats** - Agencies/enterprises get volume included
4. **Decreasing per-seat cost** - Rewards larger teams, increases stickiness

### Example Team Scenarios

**Scenario 1: 3-Person Startup**
- Growth plan: $29 + (2 × $15) = $59/mo ❌
- Pro plan: $79 (3 included) = $79/mo ✅ Better value

**Scenario 2: 8-Person Agency**
- Pro plan: $79 + (5 × $12) = $139/mo ❌
- Business plan: $199 (10 included) = $199/mo ✅ Better value

**Scenario 3: 25-Person Company**
- Business plan: $199 + (15 × $10) = $349/mo ✅

### Revenue Projections

| Scenario | Monthly Revenue | Annual Revenue |
|----------|-----------------|----------------|
| 100 Growth users (avg 2 seats) | $4,400 | $52,800 |
| 50 Pro users (avg 5 seats) | $5,150 | $61,800 |
| 20 Business users (avg 15 seats) | $4,980 | $59,760 |
| **Total** | **$14,530** | **$174,360** |

### Seat Cost Analysis

**Cost per additional seat:**
- Clerk auth: ~$0.02-0.05/MAU
- Convex storage: ~$0.50-1/user
- AI queries (shared pool): ~$0.25/user
- Email notifications: ~$0.10/user
- **Total: ~$1-2/seat/month**

**Margin per seat:**
- At $15/seat: 87-93% margin
- At $12/seat: 83-92% margin
- At $10/seat: 80-90% margin
- At $8/seat: 75-88% margin

### Role-Based Pricing (Alternative Model)

Consider tiered pricing based on role if some users are view-only:

| Role | Suggested Price | Access Level |
|------|-----------------|--------------|
| Admin/Owner | Full seat price | Full access, billing |
| Member | Full seat price | Create, edit, delete |
| Viewer | 50% seat price | Read-only access |

This could be:
- Pro: $12/member, $6/viewer
- Business: $10/member, $5/viewer

### Implementation Priority

1. **Phase 1** - Basic seat management (current implementation)
   - Add/remove members
   - Role assignment
   - Seat limits per plan

2. **Phase 2** - Billing integration
   - Stripe subscription with seat add-ons
   - Prorated billing for mid-cycle changes
   - Auto-upgrade prompts at seat limit

3. **Phase 3** - Advanced features
   - Department/team grouping
   - Custom permissions per user
   - Activity/usage reporting per seat
   - SSO/SAML for Business+

---

## Action Items

- [x] Design organization/team database schema
- [x] Build organization management functions
- [x] Create team invitation system
- [ ] Implement usage tracking for pageviews
- [ ] Add AI query counting
- [ ] Build billing integration (Stripe recommended)
- [ ] Create upgrade/downgrade flows
- [ ] Design pricing page with comparison table
- [ ] Set up usage alerts and notifications
- [ ] Implement feature flags per tier
- [ ] Build team management UI
- [ ] Add seat-based billing to Stripe integration
