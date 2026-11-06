import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

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
      answer: generateFallbackAnalysis(params.question, contextData),
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
- إذا سُئلت عن أداء: قدّم المقارنة، السبب، والاقتراح.`,
        temperature: 0.4,
        maxOutputTokens: 1200,
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
      answer: generateFallbackAnalysis(params.question, contextData),
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

### قاعدة الإجابة الشاملة — الأهم على الإطلاق:
**ممنوع الإجابة بجملة واحدة أو اسم فقط.**
عندما يسأل الزبون عن أي صنف أو مقارنة أسعار أو اقتراح، أجيبي دائمًا بالتنسيق التالي:

**🍽️ [اسم الصنف]**
• **الفئة:** [نوع الصنف]
• **السعر:** [كل الأحجام والأسعار بالتفصيل]
• **الحالة:** ✅ متاح الآن / ❌ غير متاح
• **المميزات:** [2-3 نقاط مميزة للصنف]
• **الإضافات المتاحة:** [إن وجدت]
• **خيار صحي:** [إن توفر القطر الصحي]
• **💬 ماذا قال زبائننا:** [اذكري تقييمًا مناسبًا إن وجد]
• **📲 للطلب:** تفضل/ي بزيارتنا في رافدية، أو تواصل معنا: 0562-606-061

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
        maxOutputTokens: 1600,   // Leave room for complete, useful customer answers
      },
    });

    return response.text?.trim() || getSmartFallbackResponse(userMessage);
  } catch (error) {
    console.error('Customer Chatbot (Jamra / جمرة) API Error:', error);
    // Trigger smart fallback — never return a raw error message to the customer
    return getSmartFallbackResponse(userMessage);
  }
}
