import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === '[GCP_API_KEY]' || apiKey.startsWith('TODO') || apiKey.trim() === '') {
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    return aiClient;
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// ─── Builds a rich, human-readable product catalogue for the admin context ────
function buildAdminProductCatalogue(): string {
  const products = db.getProducts();
  const categoryLabels: Record<string, string> = {
    charcoal: '🔥 كنافة على الفحم',
    nutella: '🍫 كنافة شوكولاتة ونوتيلا',
    oriental: '🌙 حلويات شرقية',
    nawashef: '🫓 نواشف',
    beverages: '🥤 مشروبات',
    offers: '🎁 عروض',
    other: '🍽️ أخرى',
  };

  const lines: string[] = [];
  for (const p of products) {
    const catLabel = categoryLabels[p.category] ?? p.category;
    const status = p.isAvailable ? '✅ متاح' : '❌ غير متاح';
    const priceRange = p.variants.length > 1
      ? `${Math.min(...p.variants.map(v => v.price))}₪ – ${Math.max(...p.variants.map(v => v.price))}₪`
      : `${p.basePrice}₪`;
    const addOnsStr = p.addOns?.length
      ? `إضافات: ${p.addOns.map(a => `${a.name} +${a.price}₪`).join('، ')}`
      : '';
    const desc = p.description ? ` | الوصف: ${p.description}` : '';
    lines.push(
      `  • [${catLabel}] ${p.name} | السعر: ${priceRange} | الحالة: ${status}${desc}${addOnsStr ? ' | ' + addOnsStr : ''}`
    );
  }
  return lines.join('\n');
}

// ─── Builds approved customer reviews summary for admin context ────────────────
function buildAdminReviewsSummary(): string {
  const reviews = db.getReviews ? db.getReviews() : [];
  const approved = reviews.filter((r: any) => r.isApproved);
  if (!approved.length) return 'لا توجد تقييمات معتمدة حتى الآن.';
  const avgRating = (approved.reduce((s: number, r: any) => s + (r.rating || 0), 0) / approved.length).toFixed(1);
  const lines = approved.map((r: any) =>
    `  ⭐ ${r.rating}/5 — ${r.customerName || 'زبون'}: "${r.comment}"`
  );
  return `متوسط التقييم: ${avgRating}/5 (${approved.length} تقييم معتمد)\n${lines.join('\n')}`;
}

function isCompetitorQuestion(question: string): boolean {
  const normalized = question.normalize('NFKC').replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه');
  return /منافس|تنافس|مقارن|السوق|سوشال|سوشيال|سوشل|وسائل التواصل|التواصل الاجتماعي|فيسبوك|فيس بوك|انستغرام|إنستغرام|إنستا|تيك.?توك|تيكتوك|tiktok|tik tok|منشور|بوست|تفاعل|تسويق|محتوى|مشاهدات|إعجابات|اعجابات|تعليقات|مشاركات|متابعين|views|likes|comments|shares|followers|عصملي|ابو صالحه|السرايا|osmali|facebook|instagram|competitor|social[- ]media|engagement|saraya_tiktok|abu_salha|komur_kunefe/i.test(normalized);
}

function readCompetitorDatabase(fileName: string): any | null {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), fileName), 'utf8'));
  } catch (error) {
    console.warn(`[AI Business Agent] Could not load ${fileName}:`, error);
    return null;
  }
}

function buildCompetitorResearchContext(): string {
  const profileDatabase = readCompetitorDatabase('competitor-database.json');
  const socialDatabase = readCompetitorDatabase('competitor-database-social_media.json');

  const competitorProfiles = (profileDatabase?.competitors || []).map((competitor: any) => ({
    id: competitor.id,
    name: competitor.name,
    identityResolution: competitor.identityResolution,
    businessProfile: competitor.businessProfile,
    branch: competitor.branch,
    dataSource: competitor.dataSource,
    orderingPlatforms: competitor.orderingPlatforms,
    capturedAt: competitor.capturedAt,
    currency: competitor.currency,
    operatingInfo: competitor.operatingInfo,
    menuSections: competitor.menuSections,
    offers: competitor.offers,
    products: competitor.products,
    prices: competitor.prices,
    reviews: competitor.reviews,
    socialMediaActivity: competitor.socialMediaActivity,
    analysisNotes: competitor.analysisNotes,
  }));

  const socialPages = (socialDatabase?.socialAccounts || socialDatabase?.competitors || []).map((page: any) => ({
    name: page.competitorName || page.name || 'N/A',
    competitorId: page.competitorId || page.id,
    competitorName: page.competitorName || page.name || 'N/A',
    available: page.available ?? true,
    sampleAccountsCount: page.sampleAccountsCount ?? 1,
    pageName: page.pageName,
    platform: page.platform,
    url: page.url,
    postCount: page.postCount,
    followersCount: page.followersCount ?? 0,
    lastUpdatedTimestamp: page.lastUpdatedTimestamp || socialDatabase?.generatedAt,
    engagementRate: page.metrics?.engagementRateByViews ?? page.engagementRate ?? 0,
    engagementRateFormula: page.engagementRateFormula,
    engagementRateAvailable: page.metrics?.engagementRateAvailable ?? page.engagementRateAvailable ?? (page.engagementRate != null),
    metrics: page.metrics || {},
    topPerformingContent: page.topPerformingContent || [],
    dataFirstPostAt: page.dataFirstPostAt,
    dataLastPostAt: page.dataLastPostAt,
    engagement: page.engagement,
    posts: (page.posts || []).map((post: any) => ({
      publishedAt: post.publishedAt,
      text: String(post.text || '').slice(0, 900),
      hashtags: post.hashtags,
      content: post.content,
      metrics: post.metrics,
      topCommentTexts: post.topCommentTexts,
      url: post.url,
    })),
  }));

  return JSON.stringify({
    profileDatabase: profileDatabase
      ? { databasePurpose: profileDatabase.databasePurpose, lastCollectedAt: profileDatabase.lastCollectedAt, competitors: competitorProfiles }
      : null,
    socialMediaDatabase: socialDatabase
      ? { purpose: socialDatabase.purpose, generatedAt: socialDatabase.generatedAt, source: socialDatabase.source, platformBreakdown: socialDatabase.platformBreakdown, crossPlatformDashboard: socialDatabase.crossPlatformDashboard, pages: socialPages }
      : null,
  });
}

function normalizeCompetitorText(value: unknown): string {
  return String(value || '').normalize('NFKC').replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه').toLowerCase();
}

function buildCompetitorFallbackAnswer(question: string): string {
  const profileDatabase = readCompetitorDatabase('competitor-database.json');
  const socialDatabase = readCompetitorDatabase('competitor-database-social_media.json');
  const profiles: any[] = profileDatabase?.competitors || [];
  const pages: any[] = socialDatabase?.socialAccounts || socialDatabase?.competitors || [];

  if (!profiles.length && !pages.length) {
    return 'ما قدرت أوصل لملفات بيانات المنافسين حاليًا؛ تأكد من توفر competitor-database.json وcompetitor-database-social_media.json بجانب بيانات المشروع.';
  }

  const normalizedQuestion = normalizeCompetitorText(question);
  const matchesQuestion = (record: any) => [record.id, record.competitorId, record.competitorName, record.name?.ar, record.name?.en, record.name, record.pageName, record.platform]
    .some(value => {
      const normalizedValue = normalizeCompetitorText(value);
      return normalizedValue.length > 3 && normalizedQuestion.includes(normalizedValue);
    });
  const matchedProfiles = profiles.filter(matchesQuestion);
  const matchedPages = pages.filter(matchesQuestion);
  const selectedProfiles = matchedProfiles.length ? matchedProfiles : profiles;
  const selectedPages = matchedPages.length ? matchedPages : pages;
  const crossPlatformRows = (socialDatabase?.crossPlatformDashboard?.platformComparisonPerCompetitor || []).map((competitor: any) => {
    const breakdown = ['Facebook', 'Instagram', 'TikTok'].map(platform => {
      const metrics = competitor.platforms?.[platform] || {};
      const rate = metrics.engagementRateAvailable ? `${metrics.engagementRateByViews}%` : 'غير متاح';
      const views = metrics.postsWithAvailableViews ? `${metrics.averageViewsForAvailablePosts} مشاهدة متوسطًا` : 'المشاهدات غير متاحة';
      return `${platform}: تفاعل ${rate}، ${views}، ${metrics.totalPostsObserved || 0} منشورًا`;
    });
    return `• ${competitor.competitorName}: ${breakdown.join('؛ ')}`;
  });
  const platformBenchmarkRows = (socialDatabase?.crossPlatformDashboard?.competitorBenchmarkingByPlatform || []).map((platform: any) =>
    `• ${platform.platform}: عينة ${platform.sampledCompetitorCount} منافسين، ${platform.totalPostsObserved} منشورًا، معدل مجمع ${platform.aggregateEngagementRateByViews}%، متوسط مشاهدات ${platform.averageViewsForAvailablePosts}`
  );

  const profileSummaries = selectedProfiles.map(profile => {
    const business = profile.businessProfile || {};
    const sections = (profile.menuSections || []).map((section: any) => {
      const products = (section.products || []).slice(0, 6).map((product: any) => {
        const prices = (product.prices || []).map((price: any) => `${price.unit}: ${price.price}₪`).join('، ');
        return `${product.name}${prices ? ` (${prices})` : ''}`;
      });
      return products.length ? `${section.name}: ${products.join('؛ ')}` : '';
    }).filter(Boolean);
    const strengths = business.strengths || business.marketing || business.engagementAndOffers || [];
    const rating = profile.operatingInfo?.rating ?? business.googleRating?.score ?? business.branchRatings?.[0]?.score;
    const ratingLabel = rating == null ? 'غير متوفر' : `${rating}${profile.operatingInfo?.ratingCountText ? ` (${profile.operatingInfo.ratingCountText} تقييم)` : ''}`;
    const identityNote = profile.identityResolution?.status === 'unresolved'
      ? `⚠️ هوية هذا السجل غير مؤكدة: ${profile.identityResolution.note || 'لا توجد مطابقة موثقة.'}`
      : '';

    return [
      `### ${profile.name?.ar || profile.name?.en || profile.name || profile.id}`,
      identityNote,
      `• **الموقع:** ${profile.branch || business.location || (business.locations || []).join('، ') || 'غير محدد'}`,
      `• **المصدر والتاريخ:** ${profile.dataSource || business.dataSource || 'غير محدد'} — ${profile.capturedAt || business.capturedAt || profileDatabase?.lastCollectedAt || 'التاريخ غير محدد'}`,
      `• **الأسعار/التقييم:** ${business.pricePositioning || 'مقارنة الأسعار غير متوفرة'}؛ تقييم ${ratingLabel}`,
      strengths.length ? `• **نقاط القوة/التسويق المسجلة:** ${strengths.slice(0, 5).join('؛ ')}` : '',
      sections.length ? `• **أمثلة من القائمة:** ${sections.join(' | ')}` : '',
    ].filter(Boolean).join('\n');
  });

  const socialSummaries = selectedPages.map(page => {
    const engagement = page.engagement || {};
    const metric = (key: string) => engagement[key]?.average == null
      ? 'غير متوفر'
      : `${engagement[key].total ?? 0} إجمالي، ${engagement[key].average} متوسطًا (من ${engagement[key].measuredPosts ?? '?'} منشور)`;
    const recentPosts = [...(page.posts || [])]
      .sort((a: any, b: any) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')))
      .slice(0, 3)
      .map((post: any) => `  • ${post.publishedAt || 'تاريخ غير متوفر'}: ${String(post.text || 'بدون نص').slice(0, 240)} [إعجابات ${post.metrics?.likes ?? 'غير متوفر'}، تعليقات ${post.metrics?.comments ?? 'غير متوفر'}، مشاركات ${post.metrics?.shares ?? 'غير متوفر'}]`);
    const rateAvailable = page.metrics?.engagementRateAvailable ?? page.engagementRateAvailable ?? (page.engagementRate != null);
    const engagementRate = page.metrics?.engagementRateByViews ?? page.engagementRate;
    const unavailablePostMessage = !page.available
      ? 'لا تتوفر بيانات لهذا الحساب على المنصة في الملفات المصدرية.'
      : page.platform === 'TikTok'
        ? 'ملف المصدر يوفر إجماليات الحساب فقط، دون تفاصيل كل منشور.'
        : 'لا توجد منشورات محفوظة.';

    return [
      `### ${page.competitorName || page.name || page.pageName} — ${page.platform || 'منصة غير محددة'}`,
      `• **فترة البيانات:** ${page.dataFirstPostAt || '؟'} إلى ${page.dataLastPostAt || socialDatabase?.generatedAt || '؟'}؛ عدد المنشورات ${page.postCount ?? page.posts?.length ?? 0}`,
      `• **متوسط التفاعل للمنشورات المقاسة:** إعجابات ${metric('likes')}؛ تعليقات ${metric('comments')}؛ مشاركات ${metric('shares')}؛ مشاهدات ${metric('views')}`,
      `• **معدل التفاعل من المشاهدات:** ${rateAvailable && engagementRate != null ? `${engagementRate}%` : 'غير متاح لعدم توفر مشاهدات'} — ${page.metrics?.engagementRateFormula || page.engagementRateFormula || 'المعادلة غير محددة في المصدر'}`,
      `• **المتابعون:** ${page.followersCount ? page.followersCount.toLocaleString('en-US') : 'غير متوفر في المصدر'}؛ **آخر تحديث:** ${page.lastUpdatedTimestamp || socialDatabase?.generatedAt || 'غير متوفر'}`,
      `• **أعلى المنشورات أداءً:** ${(page.topPerformingContent || []).join('، ') || 'لا توجد روابط منشورات في المصدر'}`,
      `• **المنشورات المحفوظة:**\n${recentPosts.join('\n') || unavailablePostMessage}`, 
    ].join('\n');
  });

  return [
    '### ملخص من قواعد بيانات المنافسين',
    `البيانات مجمّعة بتاريخ ${profileDatabase?.lastCollectedAt || socialDatabase?.generatedAt || 'غير محدد'}. هذه إجابة احتياطية من السجلات المحلية، لذا تقتصر على الوقائع المحفوظة ولا تفترض بيانات غير موجودة.`,
    ...profileSummaries,
    '### بيانات السوشال ميديا',
    '### مقارنة المنصات لكل منافس',
    ...crossPlatformRows,
    '### معيار المنافسين حسب المنصة',
    ...platformBenchmarkRows,
    ...socialSummaries,
  ].join('\n\n');
}

export async function askStoreAgent(params: {
  question: string;
  range?: string;
  from?: string;
  to?: string;
}): Promise<{ answer: string; metricsUsed?: any }> {
  const analytics = db.getAnalytics({
    range: params.range || '7d',
    from: params.from,
    to: params.to,
  });

  const products = db.getProducts();
  const offers = db.getOffers();
  const deliveryDemand = analytics.deliveryDemand;

  // ── Enriched product detail for queries about cheapest/priciest/stock/specs ─
  const productCatalogue = buildAdminProductCatalogue();
  const reviewsSummary = buildAdminReviewsSummary();
  const competitorResearch = isCompetitorQuestion(params.question)
    ? buildCompetitorResearchContext()
    : '';

  const contextData = {
    store: 'Kömür Künefe — كنافة ع الفحم (رافدية، نابلس)',
    period: analytics.period,
    kpis: analytics.summary,
    topSellers: analytics.topProducts,
    leastSellers: analytics.leastProducts,
    hourlyOrders: analytics.hourlyDistribution,
    trafficSources: analytics.sourceBreakdown,
    deliveryAreaVotes: deliveryDemand.byArea,
    allProductsCount: products.length,
    activeOffersCount: offers.filter(o => o.isActive).length,
  };

  const ai = getAiClient();

  if (!ai) {
    return {
      answer: isCompetitorQuestion(params.question) ? buildCompetitorFallbackAnswer(params.question) : generateFallbackAnalysis(params.question, contextData),
      metricsUsed: contextData,
    };
  }

  try {
    const periodLabel =
      contextData.period.range === 'today' ? 'اليوم'
      : contextData.period.range === '30d' ? 'آخر 30 يومًا'
      : 'آخر 7 أيام';

    const prompt = `
أنت المساعد الإداري والتحليلي الذكي لصاحب محل "Kömür Künefe — كنافة ع الفحم" في رافدية - الشارع الرئيسي، نابلس.
أجب عن سؤال المالك التالي **باللغة العربية** بناءً **حصرًا** على البيانات والمنيو المرفقين أدناه:

**السؤال:** "${params.question}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 مؤشرات الأداء للفترة: ${periodLabel}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **إجمالي الإيرادات:** ${contextData.kpis.totalSales} شيكل
- **إجمالي الطلبات:** ${contextData.kpis.totalOrders} طلب
- **متوسط قيمة الطلب:** ${contextData.kpis.avgOrderValue} شيكل
- **الزبائن الكليون:** ${contextData.kpis.totalCustomers} | المتكررون: ${contextData.kpis.repeatCustomers}
- **أكثر 5 منتجات مبيعًا:** ${JSON.stringify(contextData.topSellers)}
- **أقل 5 منتجات مبيعًا:** ${JSON.stringify(contextData.leastSellers)}
- **توزيع الطلبات بالساعة:** ${JSON.stringify(contextData.hourlyOrders)}
- **مصادر الطلبات:** ${JSON.stringify(contextData.trafficSources)}
- **مناطق التوصيل المطلوبة:** ${JSON.stringify(contextData.deliveryAreaVotes)}
- **عدد الأصناف في المنيو:** ${contextData.allProductsCount} | **عروض نشطة:** ${contextData.activeOffersCount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 كامل أصناف المنيو مع الأسعار والتفاصيل
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${productCatalogue}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ تقييمات الزبائن
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reviewsSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔎 بيانات المنافسين والمنصات الاجتماعية (تُستخدم إذا كان السؤال متعلقًا بها)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${competitorResearch || 'لم تُحمّل بيانات المنافسين لهذا السؤال.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 قواعد الإجابة الصارمة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **الشمولية إلزامية:** لا تُجب بجملة واحدة. كل إجابة يجب أن تحتوي على تحليل وأرقام وتوصية.
2. **تنسيق Markdown صارم:** استخدم العناوين (###)، القوائم النقطية (•)، والنص العريض (**) لتنظيم الإجابة.
3. **استخدام الأرقام الحقيقية:** اعتمد فقط على البيانات المرفقة أعلاه ولا تخترع أرقامًا.
4. **عمق تحليلي:** اشرح السبب وراء كل رقم (مثال: لماذا هذا المنتج الأقل مبيعًا؟).
5. **قسم التوصيات:** اختم دائمًا بـ ### 💡 التوصية مع خطوة واحدة عملية قابلة للتطبيق فورًا.
6. **عند سؤال عن منتج محدد:** اذكر اسمه، السعر الكامل (كل الأحجام)، الفئة، حالة التوفر، والإضافات المتاحة.
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `أنت مستشار أعمال استراتيجي ومحلل بيانات متخصص في قطاع الحلويات الشرقية والكنافة على الفحم في فلسطين.
دورك: تقديم تحليلات عميقة ودقيقة لصاحب المحل بأسلوب مهني واضح.
أسلوب الإجابة:
- دائمًا استخدم Markdown منظم: عناوين واضحة (###)، قوائم منقطة (•)، نص عريض (**).
- لا تُجب إجابات مختصرة من كلمة أو جملة واحدة.
- كل إجابة = تحليل + أرقام + توصية عملية.
- إذا سُئلت عن منتج: قدّم كامل تفاصيله (السعر لكل حجم، الفئة، حالة التوفر، الإضافات، الوصف).
- إذا سُئلت عن أداء: قدّم المقارنة، السبب، والاقتراح.
- عند السؤال عن المنافسين أو السوشال ميديا، استخدم قواعد بيانات المنافسين المرفقة واذكر تاريخ الجمع ومصدر المعلومة.
- ميّز بين الأرقام المرصودة والاستنتاجات؛ اعتبر null معلومة غير متوفرة، ولا تخلط صفحة غير مؤكدة الهوية بمنافس مؤكد.`, 
        temperature: 0.4,
        maxOutputTokens: 2200,
      },
    });

    const text = response.text || 'عذرًا، تعذر استخراج الإجابة حاليًا.';
    return {
      answer: text,
      metricsUsed: contextData,
    };
  } catch (error: any) {
    console.error('Gemini API call failed, falling back to local analytical engine:', error);
    return {
      answer: isCompetitorQuestion(params.question) ? buildCompetitorFallbackAnswer(params.question) : generateFallbackAnalysis(params.question, contextData),
      metricsUsed: contextData,
    };
  }
}

export async function generateStoreReport(params: {
  range?: string;
  from?: string;
  to?: string;
}): Promise<{ report: string; metrics: any }> {
  const analytics = db.getAnalytics({
    range: params.range || '7d',
    from: params.from,
    to: params.to,
  });

  const ai = getAiClient();
  const contextData = {
    period: analytics.period,
    kpis: analytics.summary,
    topSellers: analytics.topProducts,
    leastSellers: analytics.leastProducts,
    hourlyOrders: analytics.hourlyDistribution,
    trafficSources: analytics.sourceBreakdown,
    deliveryDemand: analytics.deliveryDemand,
  };

  if (!ai) {
    return {
      report: generateLocalReport(contextData),
      metrics: contextData,
    };
  }

  try {
    const periodLabel = contextData.period.range === 'today' ? 'اليوم'
      : contextData.period.range === '30d' ? 'آخر 30 يومًا' : 'آخر 7 أيام';

    const topSellersDetail = contextData.topSellers
      .map((p: any) => `  • **${p.name}**: ${p.quantity} قطعة | إيراد: ${p.revenue}₪`)
      .join('\n');
    const leastSellersDetail = contextData.leastSellers
      .map((p: any) => `  • **${p.name}**: ${p.quantity} قطعة | إيراد: ${p.revenue}₪`)
      .join('\n');

    const prompt = `
أنشئ تقرير أعمال وتحليل أداء **احترافي ومفصل** باللغة العربية لمالك محل "Kömür Künefe — كنافة ع الفحم" (رافدية - نابلس).
الفترة: ${periodLabel}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 البيانات الواقعية للفترة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **إجمالي الإيرادات:** ${contextData.kpis.totalSales}₪
- **إجمالي الطلبات:** ${contextData.kpis.totalOrders} طلب
- **متوسط قيمة الطلب:** ${contextData.kpis.avgOrderValue}₪
- **الزبائن الكليون:** ${contextData.kpis.totalCustomers} | المتكررون: ${contextData.kpis.repeatCustomers}
- **أكثر 5 منتجات مبيعًا:**
${topSellersDetail}
- **أقل 5 منتجات مبيعًا (فرص للتنشيط):**
${leastSellersDetail}
- **مصادر الطلبات:** إنستغرام (${contextData.trafficSources.instagram})، واتساب (${contextData.trafficSources.whatsapp})، فيسبوك (${contextData.trafficSources.facebook})، الموقع (${contextData.trafficSources.website})
- **أكثر مناطق التوصيل طلبًا:** ${Object.entries(contextData.deliveryDemand.byArea).map(([a, count]) => `${a}: ${count}`).join(' | ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 نسّق التقرير بالأقسام التالية بشكل دقيق
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 1. الملخص التنفيذي
[أرقام محورية، مقارنة بالأهداف، نبرة واثقة]

### 2. تحليل المنتجات والأصناف
[لكل صنف رئيسي: الكمية المباعة، الإيراد، نسبته من إجمالي المبيعات، تقييم الأداء]

### 3. سلوك الزبائن وقنوات التسويق
[تحليل ساعات الذروة، قنوات السوشال ميديا، معدل التكرار]

### 4. فرص النمو والتوصيل
[جدوى التوصيل، المناطق المستهدفة، توقعات العائد]

### 5. التوصيات الاستراتيجية الفورية
[4 توصيات مرقمة قابلة للتطبيق هذا الأسبوع مع تفاصيل دقيقة]
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `أنت مستشار استراتيجي رفيع المستوى في قطاع الأغذية والحلويات الشرقية في فلسطين.
اكتب التقرير بلهجة مهنية واضحة مع التركيز على الربحية واتخاذ القرارات.
قواعد التنسيق:
- استخدم Markdown منظم: ### للعناوين، • للنقاط، ** للأرقام المهمة.
- لكل قسم: بيانات + تحليل + توصية.
- لا تترك قسمًا دون أرقام حقيقية من البيانات المرفقة.
- التقرير يجب أن يكون شاملاً وليس ملخصًا مختصرًا.`,
        temperature: 0.35,
        maxOutputTokens: 1800,
      },
    });

    return {
      report: response.text || generateLocalReport(contextData),
      metrics: contextData,
    };
  } catch (err) {
    console.error('Failed to generate report with Gemini, using structured template:', err);
    return {
      report: generateLocalReport(contextData),
      metrics: contextData,
    };
  }
}

function generateFallbackAnalysis(question: string, data: any): string {
  const topProduct = data.topSellers[0]?.name || 'كنافة نابلسية خشنة ع الفحم';
  const leastProduct = data.leastSellers[0]?.name || 'شاي خمير مع الميرمية';
  const peakHour = Object.entries(data.hourlyOrders)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || '20';

  if (question.includes('أقل') || question.includes('راكد') || question.includes('ضعيف')) {
    return `بناءً على مبيعات الفترة الحالية، الصنف الأقل مبيعاً هو **"${leastProduct}"** بإجمالي مبيعات بلغت ${data.leastSellers[0]?.revenue || 0} شيكل فقط. 
    
💡 **توصية عملية:** نقترح عمل عرض باقة (كومبو) بتقديمه مع الكنافة الفاخرة، أو ترويج تذوق مجاني في المحل لزيادة الإقبال عليه، أو إعادة النظر في طريقة تسعيره وعرضه.`;
  }

  if (question.includes('أكثر') || question.includes('أعلى') || question.includes('بطل')) {
    return `الصنف الأكثر طلباً ومبيعاً هو **"${topProduct}"** بعدد ${data.topSellers[0]?.quantity || 0} قطعة وإيراد بلغ ${data.topSellers[0]?.revenue || 0} شيكل، وهو يشكل عمود المبيعات الأساسي في المحل.
    
🔥 **توصية عملية:** حافظ على جودة الجبنة البلدية والخبز على الفحم في هذا الصنف دائماً، وتأكد من تجهيز كميات كافية قبل ساعات المساء لتجنب نفاده.`;
  }

  if (question.includes('ذروة') || question.includes('ساعة') || question.includes('وقت')) {
    return `تحليل ساعات اليوم يوضح أن ذروة الطلبات تتركز حول **الساعة ${peakHour}:00 مساءً** (بين 7:00 م و 11:00 م).
    
⏰ **توصية عملية:** تأكد من إشعال كمية إضافية من الفحم وتحضير صواني الكنافة المسبقة بدءاً من الساعة 6:00 مساءً، مع تواجد طاقم العمل بالكامل في رافدية لتسريع استلام الزبائن دون انتظار.`;
  }

  if (question.includes('توصيل') || question.includes('مناطق')) {
    const topArea = Object.entries(data.deliveryAreaVotes).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'رفيديا والمخفية';
    return `هناك اهتمام متزايد بالتوصيل بإجمالي ${data.deliveryDemand.totalVotes || 0} طلباً واهتماماً مسجلاً من الزبائن. المنطقة الأكثر طلباً هي: **"${topArea}"**.
    
🛵 **توصية عملية:** يمكن البدء بتجربة التوصيل لهذه المنطقة أولاً عبر دليفري محلي أو سائق بنظام الطلب، أو تحديد حد أدنى للطلب (مثلاً 60 شيكل).`;
  }

  return `خلال هذه الفترة، سجل المحل مبيعات إجمالية قدرها **${data.kpis.totalSales} شيكل** عبر **${data.kpis.totalOrders} طلباً**، بمتوسط **${data.kpis.avgOrderValue} شيكل** للطلب الواحد. 

المنتج المتصدر هو **${topProduct}**، بينما يحتاج **${leastProduct}** إلى تنشيط تسويقي. 
قنوات السوشال ميديا (إنستغرام وواتساب) تجلب أكثر من نصف الطلبات؛ لذا ننصح بالاستمرار في نشر فيديوهات خروج الكنافة من الجمر الساخن على ستوري الإنستغرام لجذب المزيد من الزبائن إلى رافدية.`;
}

function generateLocalReport(data: any): string {
  const top = data.topSellers.map((p: any, i: number) => `${i + 1}. **${p.name}**: ${p.quantity} قطعة (${p.revenue} ₪)`).join('\n');
  const least = data.leastSellers.map((p: any, i: number) => `${i + 1}. **${p.name}**: ${p.quantity} قطعة (${p.revenue} ₪)`).join('\n');

  return `# 📊 تقرير الأداء ومبيعات Kömür Künefe — كنافة ع الفحم
**الفرع:** رافدية - الشارع الرئيسي، نابلس
**تاريخ التقرير:** ${new Date().toLocaleDateString('ar-EG')}

---

### 1. الملخص التنفيذي
- **إجمالي الإيرادات:** ${data.kpis.totalSales} شيكل
- **إجمالي الطلبات:** ${data.kpis.totalOrders} طلب
- **متوسط الفاتورة:** ${data.kpis.avgOrderValue} شيكل
- **الزبائن المتكررون:** ${data.kpis.repeatCustomers} زبون (${Math.round((data.kpis.repeatCustomers / (data.kpis.totalCustomers || 1)) * 100)}% معدل ولاء)

---

### 2. تحليل المنتجات
**أكثر المنتجات مبيعًا:**
${top}

**أقل المنتجات حركة (فرص للتنشيط):**
${least}

---

### 3. تحليل القنوات ومصادر الطلب
- **الموقع المباشر:** ${data.trafficSources.website} طلب
- **إنستغرام:** ${data.trafficSources.instagram} طلب
- **واتساب:** ${data.trafficSources.whatsapp} طلب
- **فيسبوك:** ${data.trafficSources.facebook} طلب

---

### 4. الطلب على التوصيل في نابلس
سجل ${data.deliveryDemand.totalVotes} زبون رغبتهم في توفير التوصيل.
أبرز المناطق المسجلة: رفيديا، المعاجين، المخفية، والجبل الشمالي.

---

### 5. أهم التوصيات الاستراتيجية
1. **تنشيط الأصناف الراكدة:** عمل عرض "كنافة الفحم + فنجان قهوة/شاي بنصف السعر" لرفع حركة المشروبات والنواشف.
2. **الاستعداد للذروة المسائية:** زيادة جاهزية صواني الفحم بين الساعة 6:30 مساءً و 10:30 مساءً.
3. **توسيع التوصيل التدريجي:** التعاقد مع شركة توصيل محلية بنابلس لتغطية رفيديا والمخفية أولاً.
4. **تفعيل عروض نهاية الأسبوع:** تخصيص باقات "سدر العيلة" يومي الخميس والجمعة.
`;
}


// ─── Customer-facing Chatbot (Jamra / جمرة) ───────────────────────────────────

/**
 * Formats live menu data from the database into a structured Arabic text block
 * for injection into the system prompt on every request.
 *
 * Each product includes: name, category label, all variant names with their
 * dine-in and takeaway prices (₪), any add-ons, and the description.
 * This lets the model perform exact numerical comparisons (cheapest, priciest,
 * ingredient queries) without hallucination.
 */
function buildFormattedMenu(): string {
  const products = db.getProducts().filter(p => p.isAvailable);

  const categoryLabels: Record<string, string> = {
    charcoal: '🔥 كنافة على الفحم',
    nutella: '🍫 كنافة شوكولاتة ونوتيلا',
    oriental: '🌙 حلويات شرقية',
    nawashef: '🫓 نواشف',
    beverages: '🥤 مشروبات',
    offers: '🎁 عروض',
    other: '🍽️ أخرى',
  };

  // Group products by category
  const grouped = products.reduce<Record<string, typeof products>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  const lines: string[] = [];

  for (const [cat, items] of Object.entries(grouped)) {
    lines.push(`\n${categoryLabels[cat] ?? cat}:`);
    for (const item of items) {
      // Build price string per variant (dine-in / takeaway where available)
      const variantParts = item.variants.map(v => {
        const dine = v.dineInPrice != null ? `${v.dineInPrice}₪ أكل داخل` : '';
        const takeaway = v.takeawayPrice != null ? `${v.takeawayPrice}₪ تيك أواي` : '';
        const combined = [dine, takeaway].filter(Boolean).join(' / ') || `${v.price}₪`;
        return `${v.name}: ${combined}`;
      }).join(' | ');

      const addOns = item.addOns?.length
        ? ` [إضافات: ${item.addOns.map(a => `${a.name} +${a.price}₪`).join('، ')}]`
        : '';

      const desc = item.description ? ` — ${item.description}` : '';

      lines.push(`  • ${item.name}: ${variantParts}${addOns}${desc}`);
    }
  }

  return lines.join('\n');
}

/**
 * Builds the full dynamic systemInstruction for Jamra on every request.
 * The live menu block is re-generated each time so price or availability
 * changes in the DB are immediately reflected in the chatbot's knowledge.
 *
 * UPGRADED: Enforces rich, structured Markdown product showcases with
 * Price tiers, Availability, Pros, Add-ons, and actionable Call to Action.
 */
function buildJamraSystemInstruction(): string {
  const menuBlock = buildFormattedMenu();
  const reviews = db.getReviews(true); // approved only
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '5.0';
  const reviewsBlock = reviews.length
    ? reviews
        .slice(0, 3)
        .map(r => `  ⭐ ${r.rating}/5 — "${r.comment}" — ${r.customerName || 'زبون'}`)
        .join('\n')
    : '  ⭐ تقييمات الزبائن ممتازة!';

  return `
أنتِ "جمرة" 🔥 — المساعدة الذكية والدافئة لمطعم "Kömür Künefe — كنافة ع الفحم" في رافدية — الشارع الرئيسي، نابلس.
هويتكِ: مشتقة من الجمر الذي ينضج الكنافة. تتحدثين بعربية فلسطينية دافئة وأصيلة 🔥💛.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 معلومات المطعم
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• الاسم      : Kömür Künefe — كنافة ع الفحم
• الموقع     : رافدية — الشارع الرئيسي، نابلس، فلسطين
• أوقات العمل: يومياً من 11:00 صباحاً حتى 12:00 منتصف الليل
• هاتف/واتساب: 0562-606-061
• إنستغرام   : @komurkunefe
• فيسبوك     : facebook.com/Komurkunefe
• تقييم الزبائن: ⭐ ${avgRating}/5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 قائمة المنيو الكاملة (بيانات مباشرة من الموقع)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${menuBlock}

🌿 ملاحظة صحية: القطر الصحي (شراب السكر والماء) متوفر لجميع أصناف الكنافة والحلويات الشرقية — اطلبه عند الطلب.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ آراء زبائننا
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reviewsBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 قواعد الإجابة الصارمة — اقرئيها بعناية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### أسلوب الإجابة:
أجيبي مباشرة عن السؤال وبعربية فلسطينية دافئة، بإجابة موجزة ومكتملة تناسبه.
- إذا سأل الزبون عن صنف، اذكري اسمه وأسعاره/أحجامه المتاحة وحالته والإضافات ذات الصلة.
- إذا سأل عن مقارنة أو الأرخص/الأغلى، اذكري النتيجة والسعر الذي يحسم المقارنة.
- لا تضيفي تقييمات أو ميزات أو دعوة للطلب إلا إذا كانت تفيد السؤال، ولا تكرري معلومات غير مطلوبة.
- لا تختلقي حقائق؛ إذا غابت معلومة من بيانات المنيو فقولي ذلك بوضوح.
- أكملي الإجابة بجمل وقوائم مكتملة، ولا تتركيها معلقة.

---

### القواعد التفصيلية:

1. **دقة الأرقام والمقارنات — قاعدة صارمة**:
   عند سؤال عن (أرخص صنف، أغلى صنف، مقارنة أسعار، مكونات):
   افحصي المنيو بدقة رياضية واذكري **كامل أسعار الأحجام** للصنف المقصود.
   لا تكتفي باسم الصنف فقط — أضيفي الأسعار والتفاصيل فورًا.

2. **تحديد أرخص / أغلى صنف**:
   قارني أسعار الأحجام الأساسية (XS أو الحجم الأصغر) عبر كل الأصناف.
   اذكري: الاسم، السعر الأدنى، الفئة، وسبب كونه الأرخص أو الأغلى.

3. **منع الردود الجامدة والمكررة**:
   لا تبدئي كل رد بنفس جملة الترحيب. ردّك ديناميكي وذكي وموجّه لصميم السؤال.

4. **الأسلوب واللهجة**:
   عربية فلسطينية دافئة، قريبة للقلب. استخدمي إيموجي باعتدال 🔥💛.

5. **الالتزام الصارم بالمنيو**:
   لا تخترعي أصنافًا أو أسعارًا. اعتمدي حصرًا على بيانات المنيو أعلاه.

6. **سياسة التوصيل**:
   التوصيل غير متاح حاليًا — الاستلام من المحل فقط.

7. **الطلبات الكبيرة والمناسبات**:
   أنصحي بالتواصل المسبق على 0562-606-061 للكميات الكبيرة.
`.trim();
}


// ─── Builds a rich enriched fallback for price/product queries ────────────────
// Called BEFORE getSmartFallbackResponse so the circular reference is avoided.
function buildEnrichedPriceFallback(cheapest: boolean): string {
  const products = db.getProducts().filter(p => p.isAvailable && p.variants.length > 0);
  if (!products.length) {
    // Minimal last-resort return without calling getSmartFallbackResponse
    return 'يسعدنا تواصلك! 🔥 للاستفسار: 0562-606-061';
  }

  const getExtremePrice = (product: typeof products[number]) => {
    const prices = product.variants.flatMap(v => {
      const listedPrices = [v.dineInPrice, v.takeawayPrice].filter((price): price is number => price != null);
      return listedPrices.length ? listedPrices : [v.price];
    });
    return cheapest ? Math.min(...prices) : Math.max(...prices);
  };
  const sorted = [...products].sort((a, b) => {
    return cheapest ? getExtremePrice(a) - getExtremePrice(b) : getExtremePrice(b) - getExtremePrice(a);
  });

  const p = sorted[0];
  const variantLines = p.variants
    .map(v => {
      const dine = v.dineInPrice != null ? `${v.dineInPrice}₪ أكل داخل` : '';
      const take = v.takeawayPrice != null ? `${v.takeawayPrice}₪ تيك أواي` : '';
      const price = [dine, take].filter(Boolean).join(' / ') || `${v.price}₪`;
      return `  • ${v.name}: ${price}`;
    })
    .join('\n');

  const addOnsStr = p.addOns?.length
    ? p.addOns.map(a => `${a.name} +${a.price}₪`).join('، ')
    : 'لا يوجد';

  const categoryLabels: Record<string, string> = {
    charcoal: 'كنافة على الفحم 🔥',
    nutella: 'كنافة شوكولاتة 🍫',
    oriental: 'حلويات شرقية 🌙',
    nawashef: 'نواشف 🫓',
    beverages: 'مشروبات 🥤',
    other: 'متنوعة 🍽️',
  };
  const catLabel = categoryLabels[p.category] ?? p.category;
  const label = cheapest ? 'الأرخص' : 'الأغلى';
  const extremePrice = getExtremePrice(p);
  const extremePriceLabel = cheapest ? 'أقل سعر يبدأ من' : 'أعلى سعر مسجل';

  return [
    `🔥 **الصنف ${label} عندنا:**`,
    ``,
    `**${p.name}**`,
    `• **${extremePriceLabel}:** ${extremePrice}₪`,
    `• **الفئة:** ${catLabel}`,
    `• **الحالة:** ✅ متاح الآن`,
    `• **الأسعار (جميع الأحجام):**`,
    variantLines,
    `• **الإضافات:** ${addOnsStr}`,
    `• **خيار صحي:** القطر الصحي متوفر عند الطلب 🌿`,
    ``,
    `📲 **للطلب والاستفسار:** 0562-606-061 | رافِدية — الشارع الرئيسي، نابلس 💛`,
  ].join('\n');
}

/**
 * Smart keyword-based fallback when the Gemini API is unavailable.
 * Scans the user message for known intents (price, delivery, location, hours,
 * healthy syrup, events) and returns a direct, useful Arabic answer.
 *
 * Named getSmartFallbackResponse so it matches the call-site in
 * askCustomerChatbot.
 */
function getSmartFallbackResponse(message: string): string {
  const q = message;

  // Cheapest / most expensive product query — return full enriched details
  if (/أرخص/.test(q)) return buildEnrichedPriceFallback(true);
  if (/أغلى/.test(q)) return buildEnrichedPriceFallback(false);

  // Price / menu enquiry
  if (/سعر|بكم|كم|تكلف|أسعار|قائمة/.test(q)) {
    return [
      '😊 هاي أبرز أسعارنا:',
      '',
      '🔥 **كنافة اسطنبولية بالفستق الناعم** (أكل داخل):',
      '• XS: 15₪ | S: 30₪ | M: 55₪ | L: 80₪ | XL: 100₪',
      '• إضافة بوظة: +4₪',
      '',
      '🔥 **كنافة نابلسية ناعمة** (أكل داخل):',
      '• XS: 10₪ | S: 20₪ | M: 40₪ | L: 58₪ | XL: 76₪',
      '',
      '🍫 **كنافة اسطنبولية بالشوكولاته** (XS): 12₪',
      '',
      '• الحالة: ✅ كل الأصناف متاحة',
      '• خيار صحي: القطر الصحي متوفر 🌿',
      '',
      '📲 للقائمة الكاملة: 0562-606-061 | رافِدية، نابلس 💛',
    ].join('\n');
  }

  // Delivery enquiry
  if (/توصيل|دليفري|توصل/.test(q)) {
    return '🛵 حالياً خدمة التوصيل غير متاحة، بس الاستلام من عندنا في رافِدية سهل ومريح.\nللتفاصيل: 0562-606-061 📞';
  }

  // Opening hours
  if (/وقت|دوام|فتح|أوقات|ساعات/.test(q)) {
    return '⏰ أوقات عملنا:\nيومياً من 11:00 صباحاً حتى 12:00 منتصف الليل 🔥\nنتشرف بزيارتك في رافِدية — الشارع الرئيسي، نابلس 💛';
  }

  // Location
  if (/موقع|وين|عنوان|مكان|رافدية/.test(q)) {
    return '📍 تلاقينا في رافِدية — الشارع الرئيسي، نابلس.\nهاتف/واتساب: 0562-606-061\nإنستغرام: @komurkunefe 💛';
  }

  // Healthy syrup option
  if (/صحي|قطر صحي|دايت|سكر/.test(q)) {
    return '🌿 نعم! عندنا خيار القطر الصحي (شراب السكر والماء) بديلاً عن القطر العادي لكل أصناف الكنافة على الفحم والحلويات الشرقية.\nاطلبه عند طلبك وبكل سرور 😊';
  }

  // Events / large orders
  if (/مناسبة|حفلة|عرس|تجمع|عيلة|عائلة|كبير|كثير/.test(q)) {
    return [
      '🎉 لمناسباتكم الكبيرة، ننصح بـ:',
      '• **كنافة اسطنبولية بالفستق الناعم** — حجم 2.5 كيلو: 135₪ | 3 كيلو: 165₪',
      '• أو **باقة متنوعة** من حلوياتنا الشرقية',
      '',
      '📞 للطلبات الكبيرة تواصلوا مسبقاً: 0562-606-061 💛',
    ].join('\n');
  }

  // Generic fallback
  return 'يسعدنا تواصلك مع كُومُر كُونافيه! 🔥\n📞 هاتف/واتساب: 0562-606-061\n📍 رافِدية — الشارع الرئيسي، نابلس\n⏰ يومياً 11:00 ص – 12:00 منتصف الليل';
}

/**
 * Ask the customer-facing "Jamra" (جمرة) chatbot a question.
 *
 * Flow:
 *   1. Fetches the live product catalogue from the DB via buildFormattedMenu().
 *   2. Injects it into a fresh systemInstruction (buildJamraSystemInstruction).
 *   3. Calls Gemini with a low temperature for factual price accuracy.
 *   4. On any API or network error, falls back to getSmartFallbackResponse()
 *      which scans for keywords (price, delivery, location, hours, etc.) and
 *      returns a direct, useful Arabic answer — no generic error messages.
 */
export async function askCustomerChatbot(userMessage: string): Promise<string> {
  const normalizedQuestion = userMessage.replace(/[إأآ]/g, 'ا');
  if (/ارخص|اقل\s*(?:شي|اشي|شيء|سعر|صنف|منتج)/.test(normalizedQuestion)) {
    return buildEnrichedPriceFallback(true);
  }
  if (/اغلى|اعلى\s*سعر/.test(normalizedQuestion)) {
    return buildEnrichedPriceFallback(false);
  }
  const ai = getAiClient();

  if (!ai) {
    // No API key configured — go straight to smart keyword fallback
    return getSmartFallbackResponse(userMessage);
  }

  try {
    // Build a fresh system instruction with live menu data on every request
    const systemInstruction = buildJamraSystemInstruction();

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.4,       // Lower = more factually precise prices & details
        maxOutputTokens: 4096,
      },
    });

    let answer = response.text?.trim() || '';
    let latestResponse = response;
    let continuationAttempts = 0;

    while (
      answer &&
      latestResponse.candidates?.[0]?.finishReason === 'MAX_TOKENS' &&
      continuationAttempts < 2
    ) {
      continuationAttempts += 1;
      try {
        const continuationResponse = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          contents: `سؤال الزبون: ${userMessage}\n\nالإجابة حتى الآن:\n${answer}\n\nأكملي من حيث توقفتِ فقط، دون إعادة أو تلخيص أي جزء سابق ودون تحية جديدة. أكملي الجمل والنقاط المفتوحة واختتمي الإجابة بشكل كامل.`,
          config: {
            systemInstruction,
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        });
        const continuation = continuationResponse.text?.trim();
        if (!continuation) break;

        const separator = /[.!؟؛:…)]$/.test(answer) ? '\n' : ' ';
        answer += `${separator}${continuation}`;
        latestResponse = continuationResponse;
      } catch (continuationError) {
        console.error('[Chatbot] Could not continue a token-limited response:', continuationError);
        break;
      }
    }

    if (latestResponse.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
      console.warn('[Chatbot] Gemini response remained token-limited after continuation.');
    }

    return answer || getSmartFallbackResponse(userMessage);
  } catch (error) {
    console.error('Customer Chatbot (Jamra / جمرة) API Error:', error);
    // Trigger smart fallback — never return a raw error message to the customer
    return getSmartFallbackResponse(userMessage);
  }
}
