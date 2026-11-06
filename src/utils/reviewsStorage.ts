import { Review } from '../types';

const STORAGE_KEY = 'komur_kunefe_product_reviews';

const LEGACY_PRODUCT_ID_MAP: Record<string, string> = {
  'prod-1': 'menu-6',
  'prod-6': 'menu-8',
  'prod-5': 'menu-3',
  'prod-8': 'menu-7',
  'prod-3': 'menu-1',
};

// Initial sample reviews for authenticity & social proof
const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-sample-1',
    productId: 'menu-6',
    userName: 'أحمد النابلسي',
    rating: 5,
    comment: 'إسطنبولية القشطة فوق التوقعات! القرمشة والقشطة البلدية مع الفحم خياال. ما رح تندم.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'rev-sample-2',
    productId: 'menu-6',
    userName: 'سارة خالد',
    rating: 5,
    comment: 'القطر موزون وما بتغث أبداً، ونكهة جمر الفحم مميزة جداً عن باقي المحلات.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'rev-sample-3',
    productId: 'menu-8',
    userName: 'محمد عثمان',
    rating: 5,
    comment: 'إسطنبولية النوتيلا ع الفحم إدمان! الأولاد حبوها كثير وطلبوها مرة ثانية.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'rev-sample-4',
    productId: 'menu-3',
    userName: 'ليلى درويش',
    rating: 5,
    comment: 'كنافة نابلسية ناعمة ع الفحم ممتازة، طرية وكمية الجبنة وفيرة. تستحق التجربة دائماً.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'rev-sample-5',
    productId: 'menu-7',
    userName: 'يوسف بركات',
    rating: 5,
    comment: 'برجر الكنافة فكرة عبقرية! مقرمش من الخارج وجبنة ذائبة من الداخل. لازم تجربها!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'rev-sample-6',
    productId: 'menu-1',
    userName: 'رنا يوسف',
    rating: 5,
    comment: 'إسطنبولية الفستق المطحون ناعم من أحلى ما جربت، الفستق طازج وبطعم أصيل.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
];

export const getStoredReviews = (): Review[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    const reviews = JSON.parse(raw) as Review[];
    let hasLegacyIds = false;
    const normalizedReviews = reviews.map((review) => {
      const productId = review.productId ? LEGACY_PRODUCT_ID_MAP[review.productId] : undefined;
      if (!productId) return review;
      hasLegacyIds = true;
      return { ...review, productId };
    });
    if (hasLegacyIds) localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedReviews));
    return normalizedReviews;
  } catch (e) {
    console.error('Failed to parse reviews from localStorage', e);
    return INITIAL_REVIEWS;
  }
};

export const getReviewsByProductId = (productId: string): Review[] => {
  const reviews = getStoredReviews();
  return reviews.filter((r) => r.productId === productId);
};

export const addReview = (review: Omit<Review, 'id' | 'createdAt'>): Review => {
  const reviews = getStoredReviews();
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const updatedReviews = [newReview, ...reviews];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
  } catch (e) {
    console.error('Failed to save review to localStorage', e);
  }
  return newReview;
};

export const calculateProductRating = (reviews: Review[]) => {
  const ratings = reviews
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating) && rating >= 1 && rating <= 5);
  const totalReviews = ratings.length;
  const averageRating = totalReviews
    ? ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews
    : 0;

  return { averageRating, totalReviews };
};
