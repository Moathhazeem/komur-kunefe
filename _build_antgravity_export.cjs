const fs = require('fs');
const path = require('path');
const target = 'competitor-database-social_media.json';
const current = JSON.parse(fs.readFileSync(target, 'utf8'));
const instagramRows = JSON.parse(fs.readFileSync('dataset_instagram-scraper.json', 'utf8'));
const tiktokSources = {
  'al-saraya-sweets': { file: 'saraya_tiktok.json', handle: 'saraya_tiktok' },
  'abu-salha-rafidia': { file: 'abu_salha__tiktok.json', handle: 'abu_salha__tiktok' },
  'komur-kunefe': { file: 'komur_kunefe_tiktok.json', handle: 'komur_kunefe_tiktok' },
};
const instagramMap = {
  komurkunefe: 'komur-kunefe',
  abusalha_sweets: 'abu-salha-rafidia',
  saraya_sweets: 'al-saraya-sweets',
  osmanlipal: 'osmali-sweets',
};
const instagramHandles = {
  'komur-kunefe': 'komurkunefe',
  'abu-salha-rafidia': 'abusalha_sweets',
  'al-saraya-sweets': 'saraya_sweets',
  'osmali-sweets': 'osmanlipal',
};
const generatedAt = '2026-11-07';
const isoUpdated = generatedAt + 'T00:00:00Z';
const num = value => value == null || value === '' || !Number.isFinite(Number(value)) ? 0 : Number(value);
const text = (value, fallback = 'N/A') => typeof value === 'string' && value.length ? value : fallback;
const metric = (total, measuredPosts) => ({
  total: num(total),
  average: measuredPosts ? Number((num(total) / measuredPosts).toFixed(2)) : 0,
  measuredPosts: num(measuredPosts),
});
const existingFacebook = current.socialAccounts?.filter(record => record.platform === 'Facebook') || current.competitors.filter(record => record.platform === 'Facebook');
const fbById = new Map(existingFacebook.map(record => [record.id, record]));
const instagramById = new Map(Object.keys(instagramMap).map(username => [instagramMap[username], []]));
for (const post of instagramRows) {
  const competitorId = instagramMap[String(post.ownerUsername || '').toLowerCase()];
  if (competitorId && instagramById.has(competitorId)) instagramById.get(competitorId).push(post);
}
function normalizePost(post, platform) {
  const rawMetrics = post.metrics || {};
  const viewsAvailable = rawMetrics.viewsAvailable ?? (rawMetrics.views != null && Number.isFinite(Number(rawMetrics.views)));
  const likesAvailable = rawMetrics.likesAvailable ?? ((rawMetrics.likes ?? post.likesCount) != null && Number.isFinite(Number(rawMetrics.likes ?? post.likesCount)));
  const commentsAvailable = rawMetrics.commentsAvailable ?? ((rawMetrics.comments ?? post.commentsCount) != null && Number.isFinite(Number(rawMetrics.comments ?? post.commentsCount)));
  const sharesAvailable = rawMetrics.shares != null && Number.isFinite(Number(rawMetrics.shares));
  return {
    postId: text(post.postId || post.id || post.shortCode),
    url: text(post.url),
    publishedAt: text(post.publishedAt || post.timestamp),
    text: text(post.text || post.caption, ''),
    hashtags: Array.isArray(post.hashtags) ? post.hashtags.filter(x => typeof x === 'string') : [],
    content: {
      isVideo: Boolean(post.content?.isVideo || String(post.type || '').toLowerCase().includes('video') || post.productType === 'reel'),
      mediaTypes: Array.isArray(post.content?.mediaTypes) ? post.content.mediaTypes.filter(x => typeof x === 'string') : [text(post.type, 'N/A')],
    },
    metrics: {
      likes: num(rawMetrics.likes ?? post.likesCount),
      comments: num(rawMetrics.comments ?? post.commentsCount),
      shares: num(rawMetrics.shares),
      views: num(rawMetrics.views ?? post.videoViewCount),
      likesAvailable,
      commentsAvailable,
      sharesAvailable,
      viewsAvailable: rawMetrics.viewsAvailable ?? (platform === 'Instagram' ? post.videoViewCount != null && Number.isFinite(Number(post.videoViewCount)) : viewsAvailable),
    },
    topCommentTexts: Array.isArray(post.topCommentTexts) ? post.topCommentTexts.filter(x => typeof x === 'string').slice(0, 5)
      : Array.isArray(post.latestComments) ? post.latestComments.map(c => c?.text).filter(x => typeof x === 'string').slice(0, 5) : [],
  };
}
function platformRecord({ competitor, platform, pageName, url, posts, accountTotals, available, firstAt, lastAt }) {
  const normalizedPosts = posts.map(post => normalizePost(post, platform));
  const viewedPosts = normalizedPosts.filter(post => post.metrics.viewsAvailable);
  const sum = key => normalizedPosts.reduce((total, post) => total + post.metrics[key], 0);
  const totalViews = accountTotals ? num(accountTotals.total_views) : viewedPosts.reduce((total, post) => total + post.metrics.views, 0);
  const viewsMeasuredPosts = accountTotals ? num(accountTotals.total_posts) : viewedPosts.length;
  const likes = accountTotals ? num(accountTotals.total_likes) : sum('likes');
  const comments = accountTotals ? num(accountTotals.total_comments) : sum('comments');
  const shares = accountTotals ? num(accountTotals.total_shares) : sum('shares');
  const interactionsWithViews = accountTotals
    ? likes + comments + shares
    : viewedPosts.reduce((total, post) => total + post.metrics.likes + post.metrics.comments + post.metrics.shares, 0);
  const engagementRateAvailable = totalViews > 0 && available;
  const engagementRateByViews = engagementRateAvailable ? Number((interactionsWithViews / totalViews * 100).toFixed(2)) : 0;
  const topPosts = [...normalizedPosts].sort((a, b) =>
    (b.metrics.likes + b.metrics.comments + b.metrics.shares) - (a.metrics.likes + a.metrics.comments + a.metrics.shares)).slice(0, 5);
  const dataFirstPostAt = firstAt || (normalizedPosts.length ? normalizedPosts.map(p => p.publishedAt).filter(x => x !== 'N/A').sort()[0] : 'N/A');
  const dataLastPostAt = lastAt || (normalizedPosts.length ? normalizedPosts.map(p => p.publishedAt).filter(x => x !== 'N/A').sort().at(-1) : 'N/A');
  return {
    id: competitor.id + '-' + platform.toLowerCase(),
    competitorId: competitor.id,
    competitorName: competitor.name,
    platform,
    pageName: text(pageName),
    url: text(url),
    available: Boolean(available),
    sampleAccountsCount: available ? 1 : 0,
    followersCount: 0,
    lastUpdatedTimestamp: isoUpdated,
    postCount: accountTotals ? num(accountTotals.total_posts) : normalizedPosts.length,
    dataFirstPostAt,
    dataLastPostAt,
    metrics: {
      totalPostsObserved: accountTotals ? num(accountTotals.total_posts) : normalizedPosts.length,
      postsWithAvailableViews: viewsMeasuredPosts,
      totalLikes: likes,
      totalComments: comments,
      totalShares: shares,
      totalViews,
      averageViewsForAvailablePosts: viewsMeasuredPosts ? Number((totalViews / viewsMeasuredPosts).toFixed(2)) : 0,
      averageReachForAvailablePosts: 'N/A',
      reachAvailable: false,
      interactionsOnViewedPosts: interactionsWithViews,
      engagementRateByViews,
      engagementRateAvailable,
      engagementRateFormula: '(likes + comments + shares) / views * 100, using records with available views',
      accountSampleSize: available ? 1 : 0,
    },
    engagement: {
      likes: metric(likes, accountTotals ? num(accountTotals.total_posts) : normalizedPosts.filter(p => p.metrics.likesAvailable).length),
      comments: metric(comments, accountTotals ? num(accountTotals.total_posts) : normalizedPosts.filter(p => p.metrics.commentsAvailable).length),
      shares: metric(shares, accountTotals ? num(accountTotals.total_posts) : normalizedPosts.filter(p => p.metrics.sharesAvailable).length),
      views: metric(totalViews, viewsMeasuredPosts),
    },
    topPerformingContent: topPosts.map(post => post.url).filter(url => url !== 'N/A'),
    posts: normalizedPosts,
  };
}
function noDataRecord(competitor, platform) {
  return platformRecord({ competitor, platform, pageName: 'N/A', url: 'N/A', posts: [], accountTotals: null, available: false });
}
const competitors = existingFacebook.map(fb => {
  const competitor = { id: fb.competitorId || fb.id, name: text(fb.competitorName || fb.name), facebookPageName: text(fb.pageName), facebookUrl: text(fb.url) };
  const fbRecord = platformRecord({
    competitor,
    platform: 'Facebook',
    pageName: fb.pageName,
    url: fb.url,
    posts: Array.isArray(fb.posts) ? fb.posts : [],
    accountTotals: null,
    available: true,
    firstAt: fb.dataFirstPostAt,
    lastAt: fb.dataLastPostAt,
  });
  const igUsername = instagramHandles[competitor.id];
  const igPosts = igUsername ? instagramById.get(competitor.id) || [] : [];
  const igRecord = igUsername
    ? platformRecord({
      competitor,
      platform: 'Instagram',
      pageName: igUsername,
      url: 'https://www.instagram.com/' + igUsername + '/',
      posts: igPosts.map(p => ({
        ...p,
        metrics: { likes: p.likesCount, comments: p.commentsCount, shares: null, views: p.videoViewCount },
      })),
      accountTotals: null,
      available: igPosts.length > 0,
    })
    : noDataRecord(competitor, 'Instagram');
  const ttInfo = tiktokSources[competitor.id];
  let ttRecord = noDataRecord(competitor, 'TikTok');
  if (ttInfo) {
    const totals = JSON.parse(fs.readFileSync(ttInfo.file, 'utf8'));
    ttRecord = platformRecord({
      competitor,
      platform: 'TikTok',
      pageName: ttInfo.handle,
      url: 'https://www.tiktok.com/@' + ttInfo.handle,
      posts: [],
      accountTotals: totals,
      available: true,
    });
  }
  return { ...competitor, platforms: { Facebook: fbRecord, Instagram: igRecord, TikTok: ttRecord } };
});
const socialAccounts = competitors.flatMap(competitor => ['Facebook', 'Instagram', 'TikTok'].map(platform => competitor.platforms[platform]));
const platformComparisonPerCompetitor = competitors.map(competitor => ({
  competitorId: competitor.id,
  competitorName: competitor.name,
  platforms: Object.fromEntries(['Facebook', 'Instagram', 'TikTok'].map(platform => {
    const item = competitor.platforms[platform];
    return [platform, {
      available: item.available,
      accountSampleSize: item.sampleAccountsCount,
      totalPostsObserved: item.metrics.totalPostsObserved,
      postsWithAvailableViews: item.metrics.postsWithAvailableViews,
      engagementRateByViews: item.metrics.engagementRateByViews,
      engagementRateAvailable: item.metrics.engagementRateAvailable,
      averageViewsForAvailablePosts: item.metrics.averageViewsForAvailablePosts,
      averageReachForAvailablePosts: item.metrics.averageReachForAvailablePosts,
      totalViews: item.metrics.totalViews,
    }];
  })),
}));
const competitorBenchmarkingByPlatform = ['Facebook', 'Instagram', 'TikTok'].map(platform => {
  const accounts = socialAccounts.filter(account => account.platform === platform);
  const withRate = accounts.filter(account => account.metrics.engagementRateAvailable);
  const totalViews = withRate.reduce((total, account) => total + account.metrics.totalViews, 0);
  const totalInteractions = withRate.reduce((total, account) => total + account.metrics.interactionsOnViewedPosts, 0);
  const measuredViewPosts = accounts.reduce((total, account) => total + account.metrics.postsWithAvailableViews, 0);
  return {
    platform,
    sampledCompetitorCount: accounts.filter(account => account.available).length,
    sampledAccountCount: accounts.reduce((total, account) => total + account.sampleAccountsCount, 0),
    totalPostsObserved: accounts.reduce((total, account) => total + account.postCount, 0),
    postsWithAvailableViews: measuredViewPosts,
    aggregateEngagementRateByViews: totalViews ? Number((totalInteractions / totalViews * 100).toFixed(2)) : 0,
    averageViewsForAvailablePosts: measuredViewPosts ? Number((totalViews / measuredViewPosts).toFixed(2)) : 0,
    competitors: accounts.map(account => ({
      competitorId: account.competitorId,
      competitorName: account.competitorName,
      available: account.available,
      sampleAccountsCount: account.sampleAccountsCount,
      totalPostsObserved: account.metrics.totalPostsObserved,
      postsWithAvailableViews: account.metrics.postsWithAvailableViews,
      engagementRateByViews: account.metrics.engagementRateByViews,
      engagementRateAvailable: account.metrics.engagementRateAvailable,
      averageViewsForAvailablePosts: account.metrics.averageViewsForAvailablePosts,
      averageReachForAvailablePosts: account.metrics.averageReachForAvailablePosts,
      totalViews: account.metrics.totalViews,
    })),
  };
});
const output = {
  schemaVersion: 2,
  databaseName: 'competitor-database-social_media',
  purpose: 'Antgravity unified competitor social media dataset with platform metrics and chart-ready comparisons',
  generatedAt,
  source: {
    platformFiles: {
      Facebook: ['existing Facebook scrape records in previous competitor-database-social_media.json'],
      Instagram: ['dataset_instagram-scraper.json'],
      TikTok: ['dataset_tiktok-scraper.json', ...Object.values(tiktokSources).map(x => x.file)],
    },
    notes: [
      'Facebook page names are the canonical competitor names used to link every platform account.',
      'No standalone dataset_facebook-scraper.json file was present; existing Facebook scrape records were used as the canonical source.',
      'Instagram and TikTok accounts are mapped to canonical Facebook competitors by the verified account handles supplied or found in scraper records.',
      'Follower counts and reach were not present in the source datasets; follower counts are 0 and reach is N/A.',
      'Engagement rate by views uses only viewed posts for per-post sources; TikTok uses its supplied account totals.',
      'Missing numeric values are normalized to 0; unreported dates, handles, and URLs use N/A.',
      'Instagram share metrics were not supplied and normalize to 0.',
      'TikTok files contain account totals only and do not contain per-post records or links.',
    ],
  },
  platformBreakdown: ['Facebook', 'Instagram', 'TikTok'],
  competitors,
  socialAccounts,
  crossPlatformDashboard: {
    metricDefinitions: {
      engagementRateByViews: '(likes + comments + shares) / views * 100',
      averageViewsForAvailablePosts: 'total views / count of posts with a reported views value',
      averageReachForAvailablePosts: 'N/A when source reach is not provided',
      totalPostsObserved: 'number of posts observed in source',
      sampledAccountCount: 'number of source accounts available for the competitor and platform',
      engagementRateCoverage: 'rate is available only when total reported views are greater than zero',
    },
    platformComparisonPerCompetitor,
    competitorBenchmarkingByPlatform,
  },
};
fs.writeFileSync(target, JSON.stringify(output, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join('src', 'competitor-social-summary.json'), JSON.stringify(socialAccounts.map(account => ({
  id: account.id,
  competitorId: account.competitorId,
  name: account.competitorName,
  pageName: account.pageName,
  platform: account.platform,
  url: account.url,
  available: account.available,
  sampleAccountsCount: account.sampleAccountsCount,
  postCount: account.postCount,
  engagementRate: account.metrics.engagementRateByViews,
  engagementRateAvailable: account.metrics.engagementRateAvailable,
  viewsMeasuredPosts: account.metrics.postsWithAvailableViews,
  engagement: account.engagement,
  topPerformingContent: account.topPerformingContent,
})), null, 2) + '\n', 'utf8');
console.log(JSON.stringify({
  competitors: competitors.map(c => ({id:c.id,name:c.name,platforms:Object.fromEntries(Object.entries(c.platforms).map(([p,x])=>[p,{available:x.available,posts:x.postCount,views:x.metrics.totalViews,rate:x.metrics.engagementRateByViews}]))})),
  socialAccounts: socialAccounts.length,
  benchmarkPlatforms: competitorBenchmarkingByPlatform.map(x=>({platform:x.platform,sampledCompetitors:x.sampledCompetitorCount,posts:x.totalPostsObserved})),
}, null, 2));
