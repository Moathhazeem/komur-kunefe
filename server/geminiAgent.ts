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
- أفضل مبيعًا: ${contextData.topSellers.map((p: any) => `${p.name} (${p.quantity} قطعة، ${p.revenue} ₪)`).join('، ')}.
  - الأقل مبيعًا: ${contextData.leastSellers.map((p: any) => `${p.name} (${p.quantity} قطعة، ${p.revenue} ₪)`).join('، ')}.
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
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
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
 */
function buildJamraSystemInstruction(): string {
  const menuBlock = buildFormattedMenu();

  return `
أنتِ "جمرة" (جمرة) 🔥 — المساعدة الذكية، الدافئة، والمحترفة لمطعم "Kömür Künefe — كنافة ع الفحم" في نابلس، رافدية — الشارع الرئيسي.
هويتكِ: اسمكِ مشتق من "الجمر" — الحرارة الحقيقية التي تُنضج الكنافة على الفحم. تتحدثين بعربية فلسطينية دافئة وأصيلة 🔥💛.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 معلومات المطعم
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• الاسم      : Kömür Künefe — كنافة ع الفحم
• الموقع     : رافدية — الشارع الرئيسي، نابلس، فلسطين
• أوقات العمل: يومياً من 11:00 صباحاً حتى 12:00 منتصف الليل
• هاتف/واتساب: 0562-606-061
• إنستغرام   : @komurkunefe
• فيسبوك     : facebook.com/Komurkunefe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 قائمة المنيو الحالية (مستخرجة مباشرة من بيانات الموقع)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${menuBlock}

🌿 ملاحظة صحية: يتوفر بديل القطر الصحي (شراب السكر والماء) لجميع أصناف كنافة الفحم والحلويات الشرقية — يكفي أن يذكره الزبون عند الطلب.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 قواعد الإجابة الصارمة — اقرئيها بعناية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **دقة الأرقام والمقارنات — قاعدة صارمة**:
   عندما يسأل الزبون عن (أرخص صنف، أغلى صنف، مقارنة أسعار، أو مكونات صنف معين)،
   يجب أن تفحصي قائمة المنيو أعلاه بدقة رياضية وتجيبي فوراً باسم الصنف الحقيقي والرقم الدقيق بالشيكل.
   ممنوع منعاً باتاً التهرب أو إعطاء إجابة عامة مجردة من الأرقام في مثل هذه الحالات.

2. **منع الديباجات الجامدة والتكرار**:
   لا تبدئي كل رد بنفس جملة الترحيب المحفوظة ولا تكرري رقم الواتساب في كل رسالة.
   ردّك يجب أن يكون ديناميكياً، ذكياً، وموجهاً مباشرة لصميم سؤال الزبون.

3. **الأسلوب واللهجة**:
   عربية فلسطينية دافئة ومحبّبة، قريبة للقلب مثل أصحاب المحلات الأصيلين.
   استخدمي إيموجي الكنافة والجمر باعتدال 🔥💛.

4. **الاستنتاج الذكي والبدائل**:
   إذا سأل الزبون عن شيء غير موجود، اخبريه بلطف وقدّمي أقرب بديل متوفر من المنيو.
   لا تقولي "لا أعرف" طالما أن المعطيات موجودة في السياق.

5. **الالتزام الصارم بالمنيو**:
   لا تخترعي أصنافاً أو أسعاراً من عندكِ. اعتمدي حصراً على بيانات المنيو المرفقة أعلاه.

6. **سياسة التوصيل**:
   التوصيل غير متاح حالياً — الاستلام من المحل فقط. لا تعدي بغير ذلك.

7. **الطلبات الكبيرة والمناسبات**:
   أنصحي بالتواصل المسبق على 0562-606-061 للطلبات الكبيرة والمناسبات.
`.trim();
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

  // Price / menu enquiry (including cheapest / most expensive)
  if (/سعر|بكم|كم|تكلف|أسعار|قائمة|أرخص|أغلى/.test(q)) {
    return `😊 هاي أبرز أسعارنا:\n\n🔥 كنافة اسطنبولية بالفستق الناعم (أكل داخل):\nXS: 15₪ | S: 30₪ | M: 55₪ | L: 80₪ | XL: 100₪\n\n🔥 كنافة نابلسية ناعمة (أكل داخل):\nXS: 10₪ | S: 20₪ | M: 40₪ | L: 58₪ | XL: 76₪\n\n🍫 كنافة شوكولاتة (XS فقط): 12₪\n\nللقائمة الكاملة زورونا في رافِدية أو اتصلوا: 0562-606-061 💛`;
  }

  // Delivery enquiry
  if (/توصيل|دليفري|توصل/.test(q)) {
    return `🛵 حالياً خدمة التوصيل غير متاحة، بس الاستلام من عندنا في رافِدية سهل ومريح.\nللتفاصيل: 0562-606-061 📞`;
  }

  // Opening hours
  if (/وقت|دوام|فتح|أوقات|ساعات/.test(q)) {
    return `⏰ أوقات عملنا:\nيومياً من 11:00 صباحاً حتى 12:00 منتصف الليل 🔥\nنتشرف بزيارتك في رافِدية — الشارع الرئيسي، نابلس 💛`;
  }

  // Location
  if (/موقع|وين|عنوان|مكان|رافدية/.test(q)) {
    return `📍 تلاقينا في رافِدية — الشارع الرئيسي، نابلس.\nهاتف/واتساب: 0562-606-061\nإنستغرام: @komurkunefe 💛`;
  }

  // Healthy syrup option
  if (/صحي|قطر صحي|دايت|سكر/.test(q)) {
    return `🌿 نعم! عندنا خيار القطر الصحي (شراب السكر والماء) بديلاً عن القطر العادي لكل أصناف الكنافة على الفحم والحلويات الشرقية.\nاطلبه عند طلبك وبكل سرور 😊`;
  }

  // Events / large orders
  if (/مناسبة|حفلة|عرس|تجمع|عيلة|عائلة|كبير|كثير/.test(q)) {
    return `🎉 لمناسباتكم الكبيرة، ننصح بـ:\n• كنافة اسطنبولية بالفستق الناعم (2.5 أو 3 كيلو)\n• أو باقة متنوعة من حلوياتنا الشرقية\n\nللطلبات الكبيرة تواصلوا معنا مسبقاً: 0562-606-061 💛`;
  }

  // Generic fallback — no repeated static greeting
  return `يسعدنا تواصلك مع كُومُر كُونافيه! 🔥\n📞 هاتف/واتساب: 0562-606-061\n📍 رافِدية — الشارع الرئيسي، نابلس\n⏰ يومياً 11:00 ص – 12:00 منتصف الليل`;
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
        temperature: 0.55,     // Low enough for precise numerical accuracy
        maxOutputTokens: 650,
      },
    });

    return response.text?.trim() || getSmartFallbackResponse(userMessage);
  } catch (error) {
    console.error('Customer Chatbot (Jamra / جمرة) API Error:', error);
    // Trigger smart fallback — never return a raw error message to the customer
    return getSmartFallbackResponse(userMessage);
  }
}
