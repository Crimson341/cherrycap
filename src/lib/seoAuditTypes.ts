export type CheckStatus = "pass" | "warn" | "fail" | "info";

export type Check = {
  id: string;
  label: string;
  status: CheckStatus;
  value?: string;
  detail?: string;
  recommendation?: string;
  impact?: "high" | "medium" | "low";
};

export type CheckCategory = {
  id: string;
  title: string;
  description: string;
  score: number;
  maxScore: number;
  checks: Check[];
};

export type AuditResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  timings: {
    dnsLookupMs?: number;
    responseMs: number;
    totalMs: number;
  };
  response: {
    status: number;
    statusText: string;
    redirects: { from: string; to: string; status: number }[];
    redirectChainLength: number;
    headers: Record<string, string>;
    sizeBytes: number;
    encoding?: string;
    http2?: boolean;
  };
  tls?: {
    protocol?: string;
    cipher?: string;
    validFrom?: string;
    validTo?: string;
    daysUntilExpiry?: number;
    error?: string;
  };
  llmsTxt?: {
    found: boolean;
    status?: number;
    bytes?: number;
    error?: string;
  };
  ogImageMeta?: {
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
    error?: string;
  };
  coreWebVitalsDesktop?: {
    strategy: "mobile" | "desktop";
    lcpMs?: number;
    inpMs?: number;
    cls?: number;
    ttfbMs?: number;
    fcpMs?: number;
    performanceScore?: number;
    accessibilityScore?: number;
    seoScore?: number;
    bestPracticesScore?: number;
    source: "PageSpeed Insights";
    error?: string;
  };
  schemaValidation?: { type: string; issues: string[] }[];
  schemaOpportunities?: {
    breadcrumb: boolean;
    faq: boolean;
    article: boolean;
    localBusiness: boolean;
  };
  subresourceIntegrity?: {
    externalScripts: number;
    withIntegrity: number;
    withoutIntegrity: string[];
  };
  dns?: {
    dmarc?: string;
    spf?: string;
    mx?: string[];
    caa?: string[];
    error?: string;
  };
  sitemapValidation?: {
    urlCount: number;
    sizeBytes: number;
    tooManyUrls: boolean;
    tooLarge: boolean;
    hasXmlns: boolean;
    invalidLastmod: number;
    parseError?: string;
  };
  headless?: {
    attempted: boolean;
    available: boolean;
    renderedWordCount?: number;
    renderedVsRawDiff?: number;
    axeViolations?: { id: string; impact?: string; nodes: number; help?: string }[];
    mobileUsability?: {
      tapTargetsTooSmall: number;
      fontTooSmall: number;
      horizontalScroll: boolean;
      smallTargetSamples: string[];
    };
    error?: string;
  };
  richResultsEligibility?: {
    eligibleTypes: string[];
    ineligibleReasons: string[];
  };
  meta: {
    title?: string;
    description?: string;
    canonical?: string;
    robots?: string;
    viewport?: string;
    lang?: string;
    charset?: string;
    favicon?: string;
    author?: string;
    themeColor?: string;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  content: {
    wordCount: number;
    textToHtmlRatio: number;
    readability?: {
      fleschReadingEase: number;
      gradeLevel: number;
      avgWordsPerSentence: number;
      avgSyllablesPerWord: number;
      sentenceCount: number;
    };
  };
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  schema: { type: string; raw: unknown }[];
  links: {
    total: number;
    internal: number;
    external: number;
    nofollow: number;
    brokenSampled: { href: string; status: number }[];
    sampleChecked: number;
  };
  images: {
    total: number;
    missingAlt: number;
    missingAltSamples: string[];
    oversized: { src: string; bytes: number }[];
    altQuality?: {
      generic: number;
      tooLong: number;
      filenameLike: number;
      samples: string[];
    };
  };
  security: {
    https: boolean;
    hsts: boolean;
    csp: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    referrerPolicy: boolean;
    permissionsPolicy: boolean;
  };
  crawlability: {
    robotsTxtFound: boolean;
    robotsTxtStatus?: number;
    robotsAllowsAll?: boolean;
    sitemapFound: boolean;
    sitemapUrl?: string;
    sitemapUrlCount?: number;
    robotsTxtSample?: string;
    robotsTxtDeclaresSitemap?: boolean;
    aiCrawlerDirectives?: Record<string, "allow" | "disallow" | "not-set">;
    hreflangCount?: number;
  };
  coreWebVitals?: {
    strategy: "mobile" | "desktop";
    lcpMs?: number;
    inpMs?: number;
    cls?: number;
    ttfbMs?: number;
    fcpMs?: number;
    performanceScore?: number;
    accessibilityScore?: number;
    seoScore?: number;
    bestPracticesScore?: number;
    source: "PageSpeed Insights";
    error?: string;
  };
  modernWeb: {
    httpVersionHint?: string;
    hasAltSvc: boolean;
    preconnects: string[];
    preloads: string[];
    lazyImages: number;
    eagerImages: number;
    imagesWithDimensions: number;
    modernFormatImages: number;
    renderBlockingScripts: number;
    renderBlockingStyles: number;
    thirdPartyScriptOrigins: string[];
    inlineScriptBytes: number;
    mixedContent: number;
    hasFontDisplay?: boolean;
    hasFetchPriority: boolean;
    hasPictureElement: boolean;
    fontPreloads: number;
  };
  accessibility: {
    landmarks: {
      header: boolean;
      nav: boolean;
      main: boolean;
      mainCount: number;
      footer: boolean;
      article: boolean;
      section: boolean;
    };
    skipLink: boolean;
    formsWithoutLabels: number;
    anchorsGenericText: number;
    langValid: boolean;
  };
  deprecated: {
    metaKeywords: boolean;
    xFrameOptionsOnly: boolean;
    deprecatedSchemaTypes: string[];
    deprecatedTags: string[];
  };
  categories: CheckCategory[];
  overallScore: number;
  maxScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  siteCrawl?: SiteCrawlResult;
};

export type CrawledPage = {
  url: string;
  status: number;
  fetchedMs?: number;
  title?: string;
  titleLength?: number;
  description?: string;
  descriptionLength?: number;
  h1Count: number;
  h1Text?: string;
  wordCount: number;
  canonical?: string;
  canonicalMismatch?: boolean;
  noindex: boolean;
  imagesMissingAlt: number;
  imagesTotal: number;
  internalLinks: number;
  outboundInternalLinks?: string[];
  hreflang?: { hreflang: string; href: string }[];
  contentHash?: string;
  shingles?: string[];
  issues: string[];
  error?: string;
};

export type SiteCrawlResult = {
  source: "sitemap" | "link-crawl" | "hybrid";
  discovered: number;
  audited: number;
  capped: boolean;
  cap: number;
  pages: CrawledPage[];
  duplicateTitles: string[];
  duplicateDescriptions: string[];
  duplicateH1s?: string[];
  missingTitles: number;
  missingDescriptions: number;
  noindexPages: number;
  brokenPages: number;
  totalIssues: number;
  orphanPages: string[];
  canonicalIssues?: { page: string; canonical: string; reason: string }[];
  hreflangIssues?: string[];
  nearDuplicates?: { pages: string[]; similarity: number }[];
};

export type AuditError = {
  error: string;
  detail?: string;
};
