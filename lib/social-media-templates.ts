// Social Media Post Templates and Formatting Tools

export const PLATFORM_SPECS = {
  twitter: {
    name: "X (Twitter)",
    maxLength: 280,
    hashtagLimit: 3,
    bestTimes: "8-10am, 12-1pm, 5-6pm",
    mediaTypes: ["images", "videos", "GIFs", "polls"],
    tips: "Keep it punchy. Questions and hot takes perform well.",
  },
  instagram: {
    name: "Instagram",
    maxLength: 2200,
    hashtagLimit: 30,
    bestTimes: "11am-1pm, 7-9pm",
    mediaTypes: ["images", "carousels", "reels", "stories"],
    tips: "First line is crucial. Use line breaks for readability. Hashtags in first comment.",
  },
  linkedin: {
    name: "LinkedIn",
    maxLength: 3000,
    hashtagLimit: 5,
    bestTimes: "7-8am, 12pm, 5-6pm (weekdays)",
    mediaTypes: ["images", "documents", "videos", "polls", "articles"],
    tips: "Hook in first 2 lines. Professional but personal. Stories perform well.",
  },
  facebook: {
    name: "Facebook",
    maxLength: 63206,
    hashtagLimit: 3,
    bestTimes: "1-4pm, 6-9pm",
    mediaTypes: ["images", "videos", "links", "events"],
    tips: "Longer posts can work. Questions drive comments. Native video preferred.",
  },
  tiktok: {
    name: "TikTok",
    maxLength: 4000,
    hashtagLimit: 5,
    bestTimes: "7-9am, 12-3pm, 7-11pm",
    mediaTypes: ["short videos", "photos"],
    tips: "Hook in first 3 seconds. Trending sounds matter. Authenticity > polish.",
  },
  threads: {
    name: "Threads",
    maxLength: 500,
    hashtagLimit: 0,
    bestTimes: "Similar to Instagram",
    mediaTypes: ["images", "videos", "GIFs"],
    tips: "Conversational tone. No hashtags. Reply-worthy content.",
  },
};

export const POST_TEMPLATES = {
  // Engagement Templates
  hook_question: {
    name: "Hook Question",
    description: "Start with an engaging question",
    template: `🤔 {question}

{body}

{cta}

{hashtags}`,
    example: `🤔 What's the one thing holding your business back right now?

For most small business owners, it's not money or time—it's clarity.

Drop your answer below. I read every comment. 👇

#SmallBusiness #Entrepreneurship #BusinessGrowth`,
  },

  problem_solution: {
    name: "Problem → Solution",
    description: "Address a pain point and offer your solution",
    template: `❌ {problem}

✅ {solution}

{details}

{cta}

{hashtags}`,
    example: `❌ Tired of posting on social media with zero engagement?

✅ Here's what actually works in 2024:

1. Hook them in the first line
2. Provide real value (not fluff)
3. End with a clear call-to-action
4. Post when your audience is online

Save this for later ➡️

#SocialMediaTips #Marketing #ContentStrategy`,
  },

  listicle: {
    name: "Listicle / Tips",
    description: "Numbered list of tips or insights",
    template: `{title}

{items}

{cta}

{hashtags}`,
    example: `5 ways to double your website traffic (without paid ads):

1️⃣ Optimize for ONE primary keyword per page
2️⃣ Write headlines that spark curiosity
3️⃣ Add internal links to keep visitors browsing
4️⃣ Create content that answers real questions
5️⃣ Update old posts with fresh info

Which one are you trying first?

#SEO #WebsiteTraffic #DigitalMarketing`,
  },

  behind_the_scenes: {
    name: "Behind the Scenes",
    description: "Show the human side of your business",
    template: `{intro}

{story}

{lesson}

{hashtags}`,
    example: `A peek behind the curtain today 👀

We just finished a 3-week sprint building a new feature our customers have been asking for.

Lots of late nights. Lots of coffee. A few bugs that made us question our life choices.

But seeing the first user light up when they tried it? Worth every second.

What are you working on this week?

#StartupLife #BuildInPublic #SmallBusiness`,
  },

  social_proof: {
    name: "Social Proof / Testimonial",
    description: "Share customer wins and testimonials",
    template: `{headline}

"{testimonial}"
— {customer_name}

{context}

{cta}

{hashtags}`,
    example: `This made our week 🎉

"We switched to CherryCap 3 months ago and our conversion rate is up 47%. The analytics finally make sense."
— Sarah, Owner of Bloom Boutique

Nothing beats hearing that we're actually making a difference.

Want results like Sarah's? Link in bio.

#CustomerSuccess #SmallBusinessWins #Analytics`,
  },

  educational: {
    name: "Quick Tip / Educational",
    description: "Share valuable knowledge",
    template: `💡 {tip_title}

{explanation}

{example}

Save this for later 🔖

{hashtags}`,
    example: `💡 The 80/20 rule for social media:

80% of your posts → Value (tips, education, entertainment)
20% of your posts → Promotion (sales, offers, CTAs)

Most businesses do the opposite and wonder why nobody engages.

Flip the ratio. Watch engagement climb.

Save this for later 🔖

#SocialMediaStrategy #ContentTips #MarketingAdvice`,
  },

  announcement: {
    name: "Announcement / News",
    description: "Share exciting updates",
    template: `{emoji} {headline}

{details}

{what_it_means}

{cta}

{hashtags}`,
    example: `🚀 Big news: We just launched our mobile app!

After 6 months of development and 200+ beta testers, it's finally here.

Now you can check your website analytics, get AI insights, and track visitors—all from your phone.

Download free in the App Store and Play Store.

#ProductLaunch #MobileApp #SmallBusinessTools`,
  },

  controversy: {
    name: "Hot Take / Controversy",
    description: "Share a bold opinion to spark discussion",
    template: `Hot take: {opinion}

{reasoning}

{nuance}

Agree or disagree? 👇

{hashtags}`,
    example: `Hot take: Most business advice on social media is useless.

It's written by people who've never actually run a business. They just repackage the same generic tips.

Real advice is specific, actionable, and comes from experience—not a content calendar.

Agree or disagree? 👇

#BusinessAdvice #Entrepreneurship #RealTalk`,
  },

  story: {
    name: "Story / Narrative",
    description: "Tell a compelling story",
    template: `{hook}

{story}

{lesson}

{cta}

{hashtags}`,
    example: `I almost gave up on my business last year.

Revenue was down. I was working 80-hour weeks. My family barely saw me.

Then I made one change: I started saying no.

No to clients who drained my energy.
No to projects that didn't align with my goals.
No to the hustle culture that was burning me out.

Within 6 months, revenue doubled and I got my life back.

Sometimes the best business decision is subtraction, not addition.

#Entrepreneurship #BusinessLessons #WorkLifeBalance`,
  },

  carousel_hook: {
    name: "Carousel Hook",
    description: "First slide of a carousel post",
    template: `{big_promise}

(Swipe to learn how →)`,
    example: `How I grew from 0 to 10K followers in 90 days

(Swipe to learn how →)`,
  },
};

export const EMOJI_SETS = {
  business: ["📊", "📈", "💼", "🎯", "💡", "🚀", "💪", "✅", "⚡", "🔥"],
  celebration: ["🎉", "🥳", "🎊", "✨", "🌟", "💫", "🏆", "👏", "🙌", "💯"],
  warning: ["⚠️", "🚨", "❌", "⛔", "🔴", "💔", "😱", "😬", "🤯", "💀"],
  education: ["💡", "📚", "🎓", "✏️", "📝", "🧠", "🔍", "📖", "💭", "🤔"],
  time: ["⏰", "⏳", "🕐", "📅", "🗓️", "⚡", "🔜", "🆕", "📆", "🕑"],
  money: ["💰", "💵", "💸", "🤑", "💲", "📈", "💳", "🏦", "💎", "🪙"],
  social: ["👋", "🙋", "💬", "🗣️", "👥", "🤝", "❤️", "👇", "👆", "➡️"],
  nature: ["🌱", "🌿", "🌳", "☀️", "🌊", "🔥", "⭐", "🌈", "🦋", "🌸"],
};

export const HASHTAG_CATEGORIES = {
  business: ["#SmallBusiness", "#Entrepreneur", "#BusinessOwner", "#StartupLife", "#SmallBiz", "#BusinessGrowth", "#BusinessTips"],
  marketing: ["#Marketing", "#DigitalMarketing", "#SocialMediaMarketing", "#ContentMarketing", "#MarketingTips", "#MarketingStrategy"],
  social: ["#SocialMedia", "#SocialMediaTips", "#ContentCreator", "#ContentStrategy", "#SocialMediaManager"],
  motivation: ["#Motivation", "#Hustle", "#Success", "#Mindset", "#Goals", "#Inspiration", "#GrowthMindset"],
  local: ["#ShopLocal", "#SupportLocal", "#LocalBusiness", "#SmallBusinessOwner", "#CommunityFirst"],
  industry: {
    tech: ["#Tech", "#Technology", "#SaaS", "#Startup", "#Innovation"],
    retail: ["#Retail", "#Shopping", "#ECommerce", "#ShopSmall", "#RetailLife"],
    food: ["#Foodie", "#Restaurant", "#FoodBusiness", "#Hospitality", "#FoodService"],
    health: ["#Health", "#Wellness", "#Fitness", "#HealthyLiving", "#SelfCare"],
    creative: ["#Creative", "#Design", "#Art", "#Photography", "#CreativeBusiness"],
  },
};

// Generate system prompt addition for social media tools
export const SOCIAL_MEDIA_SYSTEM_PROMPT = `
## Social Media Content Creation Tools

When creating social media content, use these formatting guidelines:

### Platform-Specific Guidelines:
${Object.entries(PLATFORM_SPECS).map(([_, spec]) => `
**${spec.name}:**
- Max length: ${spec.maxLength} chars
- Hashtags: ${spec.hashtagLimit} max
- Best posting times: ${spec.bestTimes}
- Pro tip: ${spec.tips}
`).join('')}

### Post Structure Best Practices:
1. **Hook** (First 1-2 lines): Grab attention immediately. Use questions, bold statements, or curiosity gaps.
2. **Body**: Deliver value. Use short paragraphs and line breaks for readability.
3. **CTA** (Call-to-Action): Tell them what to do next (comment, share, click link, etc.)
4. **Hashtags**: Platform-appropriate, mix of popular and niche.

### Formatting Rules:
- Use emojis strategically (not excessively)
- Break up text with line breaks
- Use bullet points or numbered lists for tips
- Bold key phrases when platform supports it
- Keep paragraphs to 1-3 sentences max

### Available Post Templates:
${Object.entries(POST_TEMPLATES).map(([_, template]) => `- **${template.name}**: ${template.description}`).join('\n')}

### When Creating Social Media Content:
1. Ask which platform(s) they're targeting
2. Understand their goal (engagement, sales, awareness, etc.)
3. Match their brand voice
4. Provide multiple variations when possible
5. Include relevant hashtag suggestions
6. Format the post exactly as it should be copied/pasted

### Output Format for Social Posts:
Always format social media posts in a clean, copy-paste ready format:
\`\`\`
📱 [PLATFORM NAME] POST:

[The actual post content, formatted exactly as it should appear]

---
Hashtags: #tag1 #tag2 #tag3
Character count: X/Y
\`\`\`
`;
