import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { askStoreAgent, generateStoreReport, askCustomerChatbot } from './server/geminiAgent.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS Middleware for external AI agents (e.g., n8n)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // --- Real-time Server-Sent Events (SSE) for Order Notifications ---
  const sseClients = new Set<express.Response>();

  const broadcastEvent = (eventType: string, data: any) => {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  };

  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    res.write(`event: connected\ndata: ${JSON.stringify({ connected: true, timestamp: new Date().toISOString() })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  app.get('/api/notifications', (req, res) => {
    try {
      const orders = db.getOrders().slice(0, 15);
      res.json({ success: true, orders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- API Routes ---

  // Products
  app.get('/api/products', (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      let products = db.getProducts();
      if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
      }
      res.json({ success: true, products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/products', (req, res) => {
    try {
      const { name, category, description, basePrice, isInitialPrice, image, variants, featured, isSeasonal } = req.body;
      if (!name || basePrice === undefined) {
        return res.status(400).json({ success: false, error: 'اسم المنتج والسعر الأساسي مطلوبان' });
      }
      const newProduct = db.saveProduct({
        id: `prod-${Date.now()}`,
        name,
        category: category || 'charcoal',
        description: description || '',
        basePrice: Number(basePrice),
        isInitialPrice: isInitialPrice !== undefined ? isInitialPrice : false,
        image: image || '',
        isAvailable: true,
        featured: !!featured,
        isSeasonal: !!isSeasonal,
        variants: variants && variants.length > 0 ? variants : [
          { id: `v-${Date.now()}-1`, name: 'حجم واحد (افتراضي)', price: Number(basePrice), isDefault: true }
        ],
        createdAt: new Date().toISOString()
      });
      res.status(201).json({ success: true, product: newProduct });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const existing = db.getProductById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
      }
      const updated = db.saveProduct({
        ...existing,
        ...req.body,
        id: existing.id
      });
      res.json({ success: true, product: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      const deleted = db.deleteProduct(req.params.id);
      if (deleted) {
        res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
      } else {
        res.status(404).json({ success: false, error: 'المنتج غير موجود' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Orders
  app.get('/api/orders', (req, res) => {
    try {
      const { status, search } = req.query;
      let orders = db.getOrders();
      if (status && status !== 'all') {
        orders = orders.filter(o => o.status === status);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        orders = orders.filter(o =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
        );
      }
      res.json({ success: true, orders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/orders/:id', (req, res) => {
    try {
      const order = db.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
      }
      res.json({ success: true, order });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/orders', (req, res) => {
    try {
      if (db.getSettings().isStoreOpen === false) {
        return res.status(409).json({ success: false, error: 'المحل مغلق حالياً ولا يستقبل الطلبات.' });
      }
      const { customerName, customerPhone, items, total, pickupTime, notes, paymentMethod, source } = req.body;
      if (!customerName || !customerPhone || !items || items.length === 0) {
        return res.status(400).json({ success: false, error: 'يرجى إدخال الاسم ورقم الهاتف واختيار الأصناف' });
      }

      const newOrder = db.addOrder({
        customerName,
        customerPhone,
        items,
        total: Number(total),
        pickupTime: pickupTime || 'خلال 20-30 دقيقة',
        notes: notes || '',
        status: 'new',
        // Online payments are not connected to a real provider yet. Never mark an
        // order paid from a client-supplied flag; keep the supported demo flow as
        // cash on pickup until server-verified provider confirmation exists.
        paymentMethod: 'cash_on_pickup',
        paymentStatus: 'pending',
        source: source || 'website'
      });

      broadcastEvent('order_created', newOrder);
      broadcastEvent('order_status_updated', newOrder);

      res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'الحالة الجديدة مطلوبة' });
      }
      const updated = db.updateOrderStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
      }
      broadcastEvent('order_status_updated', updated);
      res.json({ success: true, order: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Offers
  app.get('/api/offers', (req, res) => {
    try {
      const offers = db.getOffers();
      res.json({ success: true, offers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/offers', (req, res) => {
    try {
      const { title, description, discountPercent, badge, startDate, endDate, isActive, includedProductNames } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, error: 'عنوان العرض مطلوب' });
      }
      const newOffer = db.saveOffer({
        id: `off-${Date.now()}`,
        title,
        description: description || '',
        discountPercent: Number(discountPercent) || 0,
        badge: badge || 'عرض خاص',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || '',
        isActive: isActive !== undefined ? isActive : true,
        includedProductNames: includedProductNames || []
      });
      res.status(201).json({ success: true, offer: newOffer });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/offers/:id', (req, res) => {
    try {
      const existing = db.getOffers().find(o => o.id === req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'العرض غير موجود' });
      }
      const updated = db.saveOffer({ ...existing, ...req.body, id: existing.id });
      res.json({ success: true, offer: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/offers/:id', (req, res) => {
    try {
      const deleted = db.deleteOffer(req.params.id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reviews
  app.get('/api/reviews', (req, res) => {
    try {
      const all = req.query.all === 'true';
      const reviews = db.getReviews(!all);
      res.json({ success: true, reviews });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const { customerName, rating, comment } = req.body;
      if (!customerName || !rating || !comment) {
        return res.status(400).json({ success: false, error: 'الاسم والتقييم والنص مطلوبة' });
      }
      const review = db.addReview({
        customerName,
        rating: Math.max(1, Math.min(5, Number(rating))),
        comment
      });
      res.status(201).json({
        success: true,
        review,
        message: 'شكراً لمشاركتك! سيظهر تقييمك بعد مراجعة الإدارة.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/reviews/:id/status', (req, res) => {
    try {
      const { isApproved } = req.body;
      const updated = db.updateReviewStatus(req.params.id, !!isApproved);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'التقييم غير موجود' });
      }
      res.json({ success: true, review: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/reviews/:id', (req, res) => {
    try {
      const deleted = db.deleteReview(req.params.id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/reviews/clear-demo', (req, res) => {
    try {
      db.clearDemoReviews();
      res.json({ success: true, message: 'تم حذف التقييمات التجريبية بنجاح' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delivery interest survey
  app.get('/api/delivery-interest', (req, res) => {
    try {
      const interests = db.getDeliveryInterests();
      res.json({ success: true, interests });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/delivery-interest', (req, res) => {
    try {
      const { area, customerPhone, notes } = req.body;
      if (!area) {
        return res.status(400).json({ success: false, error: 'يرجى كتابة منطقتك أو حيك في نابلس' });
      }
      const record = db.addDeliveryInterest(area, customerPhone || '', notes || '');
      res.status(201).json({
        success: true,
        record,
        message: 'تم تسجيل رغبتك بنجاح! سنعمل على توفير التوصيل لمنطقتك قريباً.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    try {
      const settings = db.getSettings();
      res.json({ success: true, settings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/settings', (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Analytics & Dashboard
  app.get('/api/dashboard/stats', (req, res) => {
    try {
      const { range, from, to } = req.query as { range?: string; from?: string; to?: string };
      const stats = db.getAnalytics({ range, from, to });
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Gemini AI Agent
  // Public Context Endpoint for AI Agent (n8n / Customers)
  app.get('/api/v1/ai/public-context', (req, res) => {
    try {
      const settings = db.getSettings();
      const rawProducts = db.getProducts();
      const rawOffers = db.getOffers();

      const categoryLabels: Record<string, string> = {
        charcoal: 'كنافة على الفحم',
        nutella: 'نوتيلا وشوكولاتة',
        oriental: 'حلويات شرقية',
        nawashef: 'نواشف وبقلاوة',
        beverages: 'مشروبات',
        offers: 'عروض خاصة',
        other: 'أصناف متنوعة',
      };

      const categories = [
        { id: 'charcoal', name: 'كنافة على الفحم', description: 'محضرة ومخبوزة على جمر الفحم الطبيعي' },
        { id: 'nutella', name: 'شوكولاتة ونوتيلا', description: 'كنافة بلمسات الشوكولاتة والخلطات الحديثة' },
        { id: 'oriental', name: 'حلويات شرقية', description: 'بقلاوة، فطائر، بين نارين، أصناف شرقية فاخرة' },
        { id: 'nawashef', name: 'نواشف وبقلاوة', description: 'حلويات ناشفة ومقرمشة' },
        { id: 'beverages', name: 'مشروبات', description: 'مشروبات باردة وغازية ومياه' },
        { id: 'healthy', name: 'خيارات صحية', description: 'إمكانية استبدال القطر العادي بقطر صحي خفيف' },
      ];

      const healthyNote = settings.healthySyrupNote || 'يوجد لدينا أصناف صحية، يمكن استبدال القطر العادي بقطر صحي';

      // Sanitize & map menu items (no internal, cost, or sales info)
      const menu_items = rawProducts.map(p => {
        const options: Array<{
          id?: string;
          name: string;
          price: number;
          dineInPrice?: number;
          takeawayPrice?: number;
        }> = (p.variants || []).map(v => ({
          id: v.id,
          name: v.name,
          price: v.price ?? v.dineInPrice ?? p.basePrice,
          dineInPrice: v.dineInPrice,
          takeawayPrice: v.takeawayPrice,
        }));

        if (p.addOns && p.addOns.length > 0) {
          p.addOns.forEach(addon => {
            options.push({
              name: `إضافة: ${addon.name}`,
              price: addon.price,
            });
          });
        }

        const isHealthyEligible = p.category === 'charcoal' || p.category === 'oriental';

        return {
          id: p.id,
          name: p.name,
          category: p.category,
          category_label: categoryLabels[p.category] || p.category,
          price: p.basePrice,
          is_available: p.isAvailable !== false,
          options,
          description: p.description && p.description.trim() !== ''
            ? p.description
            : (isHealthyEligible ? `${p.name} الأصيلة على الفحم. ${healthyNote}` : p.name),
          healthy_syrup_available: isHealthyEligible,
        };
      });

      // Filter active offers only and sanitize internal dates/IDs if needed
      const nowStr = new Date().toISOString().split('T')[0];
      const active_offers = rawOffers
        .filter(o => o.isActive && (!o.endDate || o.endDate >= nowStr))
        .map(o => ({
          id: o.id,
          title: o.title,
          description: o.description,
          discount_percent: o.discountPercent,
          badge: o.badge || 'عرض خاص',
          valid_until: o.endDate || 'حتى نفاد الكمية',
          applicable_products: o.includedProductNames || [],
        }));

      const restaurant_info = {
        name: settings.storeName || 'Kömür Künefe — كنافة ع الفحم',
        tagline: settings.tagline || 'المذاق النابلسي الأصيل على جمر الفحم الطبيعي',
        branch: settings.branch || 'رافِدية - نابلس',
        hours: settings.hours || 'يوميًا: 11:00 صباحًا – 12:00 منتصف الليل',
        contact: {
          phone: settings.phone || '+970 562 606 061',
          whatsapp: settings.whatsapp || '970562606061',
          facebookUrl: settings.facebookUrl || 'https://www.facebook.com/Komurkunefe/',
          instagramUrl: settings.instagramUrl || 'https://www.instagram.com/komurkunefe',
        },
        healthy_options_note: healthyNote,
        is_store_open: settings.isStoreOpen !== false,
        story_of_the_embers: settings.ourStory || 'بدأت قصة كُومُر كُونافيه من إيماننا بأن سر الكنافة النابلسية الحقيقي لا يكتمل إلا مع حرارة جمر الفحم الهادئة وسمنها الأصيل.',
      };

      res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        restaurant_info,
        categories,
        menu_items,
        active_offers,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
  });

  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { question, range, from, to } = req.body;
      if (!question) {
        return res.status(400).json({ success: false, error: 'يرجى إدخال السؤال' });
      }
      const response = await askStoreAgent({ question, range, from, to });
      res.json({ success: true, ...response });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/report', async (req, res) => {
    try {
      const { range, from, to } = req.body;
      const reportData = await generateStoreReport({ range, from, to });
      res.json({ success: true, ...reportData });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── Customer Chatbot: powered directly by Gemini AI ───────────────────────
  // Calls the Gemini API server-side — no n8n, no webhooks, no CORS issues.
  // Returns { reply: "..." } which ChatbotWidget.tsx reads from data.reply.
  app.post('/api/chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ success: false, error: 'message is required' });
      }

      const reply = await askCustomerChatbot(message.trim());
      return res.json({ reply });
    } catch (err: any) {
      console.error('[/api/chat] Chatbot error:', err?.message || err);
      // Always return a friendly Arabic message — never expose a raw 500 error
      return res.status(200).json({
        reply: 'عذراً، نواجه ضغطاً على الخدمة حالياً. يرجى المحاولة مجدداً أو التواصل معنا على واتساب: 0562-606-061 💛',
      });
    }
  });

  // Reset sample data
  app.post('/api/seed/reset', (req, res) => {
    try {
      db.resetSampleData();
      res.json({ success: true, message: 'تمت استعادة البيانات الافتراضية بنجاح' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Auth (Owner & Staff login)
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Default Owner credentials: admin / komur2025
    // Staff credentials: staff / staff123
    if (username === 'admin' && (password === 'komur2025' || password === 'admin123')) {
      return res.json({
        success: true,
        user: { username: 'admin', role: 'owner', name: 'صاحب المحل (المالك)' },
        token: 'token-owner-komur-992'
      });
    }
    if (username === 'staff' && password === 'staff123') {
      return res.json({
        success: true,
        user: { username: 'staff', role: 'staff', name: 'طاقم العمل - رافدية' },
        token: 'token-staff-komur-331'
      });
    }
    return res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  });

  // Frontend Integration: Vite dev mode or static files in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 Kömür Künefe Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
