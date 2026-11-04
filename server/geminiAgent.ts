import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.startsWith('TODO') || apiKey.trim() === '') {
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
    // High-quality local analytical response if Gemini API key isn't configured yet
    return {
      answer: generateFallbackAnalysis(params.question, contextData),
      metricsUsed: contextData,
    };
  }

  try {
    const prompt = `
أنت المساعد الإداري والتحليلي الذكي لمالك محل "Kömür Künefe — كنافة ع الفحم" في رافدية - الشارع الرئيسي، نابلس.
أجب عن سؤال المالك التالي باللغة العربية بناءً على البيانات الواقعية المرفقة فقط:
السؤال: "${params.question}"

بيانات المحل المعتمدة للفترة (${contextData.period.range || 'المحددة'}):
- إجمالي المبيعات: ${contextData.kpis.totalSales} شيكل
- عدد الطلبات: ${contextData.kpis.totalOrders} طلب
- متوسط قيمة الطلب: ${contextData.kpis.avgOrderValue} شيكل
- الزبائن المتكررون: ${contextData.kpis.repeatCustomers} زبون
- أكثر المنتجات مبيعًا: ${JSON.stringify(contextData.topSellers)}
- أقل المنتجات مبيعًا: ${JSON.stringify(contextData.leastSellers)}
- توزيع الطلبات حسب ساعات اليوم: ${JSON.stringify(contextData.hourlyOrders)}
- مصادر الطلبات (سوشال ميديا وموقع): ${JSON.stringify(contextData.trafficSources)}
- تصويت مناطق التوصيل المطلوبة من الزبائن: ${JSON.stringify(contextData.deliveryAreaVotes)}

قواعد الإجابة:
1. كن مباشرًا، مهنيًا، ولطيفًا. استخدم أرقامًا واقعية من البيانات أعلاه دون اختلاق.
2. قدم تحليلاً موجزاً للسبب وراء هذا الرقم أو النتيجة.
3. اختم بنصيحة أو توصية عملية لصاحب المحل في رافدية (مثال: عروض على المنتجات الأقل مبيعًا، أو الاستعداد لساعات الذروة المسائية، أو بدء خدمة التوصيل للمناطق الأكثر طلبًا).
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'أنت مستشار أعمال وخبير تسويق محلي لمطاعم الحلويات الشرقية والكنافة على الفحم في فلسطين. أجب بأسلوب لبق وموجز ومدعوم بالأرقام.',
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
    const prompt = `
أنشئ تقرير أعمال وتحليل أداء احترافي باللغة العربية لمالك محل "Kömür Künefe — كنافة ع الفحم" (رافدية - نابلس).
الفترة: ${contextData.period.range === 'today' ? 'اليوم' : contextData.period.range === '30d' ? 'آخر 30 يومًا' : 'آخر 7 أيام'}.

البيانات:
- المبيعات: ${contextData.kpis.totalSales} شيكل عبر ${contextData.kpis.totalOrders} طلب.
- متوسط الفاتورة: ${contextData.kpis.avgOrderValue} شيكل.
- نسبة إعادة الشراء: ${contextData.kpis.repeatCustomers} زبون متكرر من أصل ${contextData.kpis.totalCustomers}.
- أفضل مبيعًا: ${contextData.topSellers.map(p => `${p.name} (${p.quantity} قطعة، ${p.revenue} ₪)`).join('، ')}.
- الأقل مبيعًا: ${contextData.leastSellers.map(p => `${p.name} (${p.quantity} قطعة، ${p.revenue} ₪)`).join('، ')}.
- مصادر الطلبات: إنستغرام (${contextData.trafficSources.instagram})، فيسبوك (${contextData.trafficSources.facebook})، واتساب (${contextData.trafficSources.whatsapp})، الموقع المباشر (${contextData.trafficSources.website}).
- أكثر مناطق التوصيل طلبًا: ${Object.entries(contextData.deliveryDemand.byArea).map(([a, count]) => `${a}: ${count} طلب`).join('، ')}.

نسق التقرير بأقسام واضحة:
1. ملخص تنفيذي (Executive Summary)
2. تحليل المنتجات والأصناف الأكثر ركودًا ورواجًا
3. سلوك الزبائن وأوقات الذروة وقنوات السوشال ميديا
4. فرص النمو وقياس الجدوى لخدمة التوصيل في نابلس
5. 4 توصيات عملية فورية قابلة للتطبيق هذا الأسبوع
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'أنت مستشار استراتيجي رفيع المستوى في قطاع الأغذية والحلويات. اكتب التقرير بلهجة مهنية متفائلة وواضحة، مع التركيز على اتخاذ القرارات والربحية.',
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


// ─── Customer-facing Chatbot ──────────────────────────────────────────────────

/**
 * Full menu knowledge-base baked directly into the system prompt so the
 * chatbot can answer price, availability, and recommendation questions
 * instantly without any extra API round-trip.
 */
const CUSTOMER_SYSTEM_PROMPT = `
أنت "جمرة"، المساعدة الذكية الودودة لمطعم "كُومُر كُونافيه — كنافة ع الفحم" في رافِدية، نابلس.
مهمتك: مساعدة الزبائن بأسلوب حار ومرحِّب باللغة العربية الفلسطينية الأصيلة.

─────────────────────────────────────────
🏠 معلومات المطعم
─────────────────────────────────────────
الاسم     : كُومُر كُونافيه — كنافة ع الفحم
الموقع    : رافِدية — الشارع الرئيسي، نابلس، فلسطين
أوقات العمل: يومياً من 11:00 صباحاً حتى 12:00 منتصف الليل
الهاتف    : 0562-606-061
واتساب    : 0562-606-061
إنستغرام  : @komurkunefe
فيسبوك    : facebook.com/Komurkunefe

─────────────────────────────────────────
🔥 قائمة الكنافة على الفحم (Charcoal)
─────────────────────────────────────────
تتوفر بأحجام: XS • S • M • L • XL • 2.5 كيلو • 3 كيلو • 3.5 كيلو

1. كنافة اسطنبولية بالفستق الناعم
   أكل داخل  : 15 | 30 | 55 | 80 | 100 | 135 | 165 | 190 ₪
   تيك أواي  : — | — | 63 | 90 | 110 | 145 | 175 | 200 ₪
   إضافة بوظة: +4 ₪

2. كنافة اسطنبولية فستق أكسترا
   أكل داخل  : 15 | 30 | 60 | 85 | 110 | 150 | 180 | 210 ₪
   تيك أواي  : — | — | 68 | 90 | 110 | 160 | 190 | 220 ₪
   إضافة بوظة: +4 ₪

3. كنافة نابلسية ناعمة
   أكل داخل  : 10 | 20 | 40 | 58 | 76 | 90 | 110 | 125 ₪
   تيك أواي  : — | — | 48 | 67 | 86 | 100 | 120 | 135 ₪
   إضافة بوظة: +4 ₪

4. كنافة اسطنبولية محيرة
   أكل داخل  : 10 | 20 | 40 | 60 | 85 | 110 | 120 | 140 ₪
   تيك أواي  : — | 30 | 48 | 70 | 95 | 120 | 130 | 150 ₪
   إضافة بوظة: +4 ₪

5. اسطنبولية بحشوة الجبن والفستق الحلبي
   أكل داخل  : 13 | 25 | 52 | 75 | 100 | 130 | 155 | 180 ₪
   تيك أواي  : — | — | 60 | 85 | 110 | 140 | 165 | 190 ₪
   إضافة بوظة: +4 ₪

6. اسطنبولية بالقشطة
   أكل داخل  : 12 | 25 | 50 | 75 | 95 | 125 | 150 | 175 ₪
   تيك أواي  : — | — | 58 | 85 | 105 | 135 | 160 | 185 ₪
   إضافات    : حشوة بالفستق +3 ₪ | بوظة +4 ₪

7. كنافة برغر (أحجام XS و S فقط)
   أكل داخل  : 15 | 35 ₪
   صلصات    : نوتيلا | لوتس | زبدة الفستق | شوكولاتة بيضاء (+4 ₪ لكل إضافة)

─────────────────────────────────────────
🍫 كنافة شوكولاتة ونوتيلا
─────────────────────────────────────────
8. كنافة اسطنبولية بالشوكولاته (أحجام XS و S فقط)
   أكل داخل  : 12 | 25 ₪
   صلصات    : نوتيلا | لوتس | زبدة الفستق | شوكولاتة بيضاء (+4 ₪)

─────────────────────────────────────────
🌙 حلويات شرقية
─────────────────────────────────────────
فطير السلطان      : 40 ₪    | بقلاوة بالبوظة    : 15 ₪
كنافة برمة بالجبنة: 36 ₪    | بصله فستق         : 95 ₪
ععملية (عملية)    : 38 ₪    | بين نارين         : 36 ₪
خدود              : 45 ₪    | مدلوقة            : 50 ₪
عش بلبل           : 55 ₪    | حلاوة جبن         : 40 ₪
اصابع فستق دولما  : 95 ₪    | ترليشيا           : 50 ₪
فطير بالجبنة      : 34 ₪    | فطير بالحليب      : 32 ₪
بسكويت بالقشطة    : 38 ₪    | اصابع بالقشطة     : 40 ₪
وربات بالقشطة     : 40 ₪    | برمه حلبي بالقشطة : 45 ₪
هريسة بالقشطة     : 40 ₪

─────────────────────────────────────────
🥤 مشروبات
─────────────────────────────────────────
مياه صغير: 3 ₪  |  مياه كبير: 5 ₪  |  كوكا كولا: 3 ₪  |  سودا: 3 ₪  |  سبرايت: 3 ₪

─────────────────────────────────────────
🌿 الخيار الصحي
─────────────────────────────────────────
يتوفر بديل القطر الصحي لأصناف الكنافة على الفحم والحلويات الشرقية — اطلبه عند طلبك.

─────────────────────────────────────────
📋 قواعد الردود الصارمة
─────────────────────────────────────────
1. تحدث دائماً باللغة العربية بلهجة فلسطينية دافئة ومرحِّبة.
2. أعطِ الأسعار الدقيقة من القائمة أعلاه عند السؤال عنها.
3. التوصيل غير متاح حالياً — الاستلام من المحل فقط. لا تعد بأي شيء خلاف ذلك.
4. إن لم تعرف الإجابة، أحل الزبون إلى: 0562-606-061 (هاتف/واتساب).
5. لا تخترع أصنافاً أو أسعاراً غير موجودة في القائمة أعلاه.
6. للمناسبات والطلبات الكبيرة، أنصح بالتواصل المسبق على الهاتف.
7. ردودك موجزة وعملية مع لمسة ترحيب دافئة.
`.trim();

/**
 * Ask the customer-facing chatbot a question.
 * Falls back to a helpful Arabic message if Gemini is unavailable.
 */
export async function askCustomerChatbot(message: string): Promise<string> {
  const ai = getAiClient();

  if (!ai) {
    return buildChatbotFallback(message);
  }

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: CUSTOMER_SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  } catch (error: any) {
    console.error('[askCustomerChatbot] Gemini error:', error?.message || error);
    return buildChatbotFallback(message);
  }
}

/**
 * Smart keyword-based fallback when the AI is unavailable.
 * Provides useful Arabic answers for common questions.
 */
function buildChatbotFallback(message: string): string {
  const q = message;

  if (/سعر|بكم|كم|تكلف|أسعار|قائمة/.test(q)) {
    return `أهلاً وسهلاً! 😊 هاي أبرز أسعارنا:\n\n🔥 كنافة اسطنبولية بالفستق (أكل داخل):\nXS: 15₪ | S: 30₪ | M: 55₪ | L: 80₪ | XL: 100₪\n\n🔥 كنافة نابلسية ناعمة (أكل داخل):\nXS: 10₪ | S: 20₪ | M: 40₪ | L: 58₪ | XL: 76₪\n\nللاطلاع على كامل القائمة زورونا في رافِدية أو اتصلوا: 0562-606-061 💛`;
  }

  if (/توصيل|دليفري|توصل/.test(q)) {
    return `أهلاً! 🛵 حالياً خدمة التوصيل غير متاحة، بس يمكنك الطلب والاستلام من عندنا في رافِدية مباشرةً.\nللاستفسار: 0562-606-061 📞`;
  }

  if (/وقت|دوام|فتح|أوقات|ساعات/.test(q)) {
    return `⏰ أوقات عملنا:\nيومياً من 11:00 صباحاً حتى 12:00 منتصف الليل 🔥\n\nنتشرف بزيارتك في رافِدية — الشارع الرئيسي، نابلس 💛`;
  }

  if (/موقع|وين|عنوان|مكان|رافدية/.test(q)) {
    return `📍 تلاقينا في رافِدية — الشارع الرئيسي، نابلس.\nللتواصل: 0562-606-061\nأو عبر إنستغرام: @komurkunefe 💛`;
  }

  if (/صحي|قطر صحي|دايت/.test(q)) {
    return `🌿 نعم! عندنا خيار القطر الصحي كبديل عن القطر العادي لأصناف الكنافة على الفحم والحلويات الشرقية.\nاطلبه عند طلبك 😊`;
  }

  if (/مناسبة|حفلة|عرس|تجمع|عيلة|عائلة/.test(q)) {
    return `🎉 لمناسباتكم الكبيرة، ننصح بـ:\n- كنافة اسطنبولية بالفستق الناعم (2.5 أو 3 كيلو)\n- أو باقة متنوعة من حلوياتنا الشرقية\n\nللطلبات الكبيرة تواصلوا معنا مسبقاً: 0562-606-061 💛`;
  }

  return `أهلاً وسهلاً! 🔥 يسعدنا تواصلك مع كُومُر كُونافيه.\nللمساعدة الفورية:\n📞 هاتف/واتساب: 0562-606-061\n📍 رافِدية — الشارع الرئيسي، نابلس\n⏰ يومياً 11:00 ص – 12:00 منتصف الليل`;
}
