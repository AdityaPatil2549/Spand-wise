/**
 * ==============================================================================
 * SpendWise Client-Side Machine Learning Categorizer Engine
 * High-Speed Deterministic NLP & Statistical Naive Categorization
 * Zero API Latency • Zero External Keys • Privacy-Preserving
 * ==============================================================================
 */

export interface CategorizationResult {
  categoryId: string;
  type: 'expense' | 'income';
  confidence: number; // 0.0 to 1.0
  matchedKeywords: string[];
}

interface CategoryRule {
  id: string;
  type: 'expense' | 'income';
  keywords: { word: string; weight: number }[];
  amountBias?: { min?: number; max?: number; boost: number };
}

// Comprehensive curated campus and everyday Indian spending lexicon matching preset categories
const CATEGORY_RULES: CategoryRule[] = [
  // 1. Food (Full meals & dining)
  {
    id: 'food',
    type: 'expense',
    keywords: [
      { word: 'lunch', weight: 1.0 },
      { word: 'dinner', weight: 1.0 },
      { word: 'breakfast', weight: 0.95 },
      { word: 'meal', weight: 0.95 },
      { word: 'thali', weight: 1.0 },
      { word: 'biryani', weight: 1.0 },
      { word: 'mess', weight: 0.9 },
      { word: 'canteen', weight: 0.9 },
      { word: 'zomato', weight: 1.0 },
      { word: 'swiggy', weight: 1.0 },
      { word: 'dominos', weight: 1.0 },
      { word: 'pizza', weight: 0.95 },
      { word: 'burger', weight: 0.95 },
      { word: 'mcdonald', weight: 1.0 },
      { word: 'kfc', weight: 1.0 },
      { word: 'subway', weight: 1.0 },
      { word: 'restaurant', weight: 0.95 },
      { word: 'dhabba', weight: 0.95 },
      { word: 'dhaba', weight: 0.95 },
      { word: 'shawarma', weight: 1.0 },
      { word: 'paratha', weight: 0.95 },
      { word: 'roti', weight: 0.9 },
      { word: 'paneer', weight: 0.9 },
      { word: 'chicken', weight: 0.9 },
      { word: 'cafe', weight: 0.8 },
      { word: 'dining', weight: 0.9 },
    ],
  },
  // 2. Snacks & Chai (Campus quick bites)
  {
    id: 'snacks',
    type: 'expense',
    keywords: [
      { word: 'chai', weight: 1.0 },
      { word: 'tea', weight: 1.0 },
      { word: 'coffee', weight: 0.95 },
      { word: 'samosa', weight: 1.0 },
      { word: 'vadapav', weight: 1.0 },
      { word: 'vada pav', weight: 1.0 },
      { word: 'maggi', weight: 1.0 },
      { word: 'snack', weight: 0.95 },
      { word: 'snacks', weight: 1.0 },
      { word: 'biscuit', weight: 0.9 },
      { word: 'puff', weight: 0.95 },
      { word: 'poha', weight: 1.0 },
      { word: 'dosa', weight: 0.9 },
      { word: 'idli', weight: 0.9 },
      { word: 'kachori', weight: 1.0 },
      { word: 'bun maska', weight: 1.0 },
      { word: 'chips', weight: 0.9 },
      { word: 'lays', weight: 0.95 },
      { word: 'kurkure', weight: 0.95 },
      { word: 'cold drink', weight: 0.95 },
      { word: 'coke', weight: 0.9 },
      { word: 'pepsi', weight: 0.9 },
      { word: 'frooti', weight: 0.95 },
      { word: 'juice', weight: 0.9 },
      { word: 'lassi', weight: 0.95 },
      { word: 'ice cream', weight: 0.95 },
    ],
  },
  // 3. Transport & Commute
  {
    id: 'transport',
    type: 'expense',
    keywords: [
      { word: 'metro', weight: 1.0 },
      { word: 'auto', weight: 0.95 },
      { word: 'rickshaw', weight: 0.95 },
      { word: 'uber', weight: 1.0 },
      { word: 'ola', weight: 1.0 },
      { word: 'rapido', weight: 1.0 },
      { word: 'bus', weight: 0.95 },
      { word: 'train', weight: 0.9 },
      { word: 'irctc', weight: 1.0 },
      { word: 'fuel', weight: 1.0 },
      { word: 'petrol', weight: 1.0 },
      { word: 'diesel', weight: 1.0 },
      { word: 'cab', weight: 0.95 },
      { word: 'taxi', weight: 0.95 },
      { word: 'toll', weight: 0.95 },
      { word: 'fastag', weight: 1.0 },
      { word: 'parking', weight: 0.95 },
      { word: 'fare', weight: 0.85 },
      { word: 'ticket', weight: 0.8 },
    ],
  },
  // 4. Groceries & Essentials
  {
    id: 'groceries',
    type: 'expense',
    keywords: [
      { word: 'dmart', weight: 1.0 },
      { word: 'd-mart', weight: 1.0 },
      { word: 'zepto', weight: 1.0 },
      { word: 'blinkit', weight: 1.0 },
      { word: 'instamart', weight: 1.0 },
      { word: 'bigbasket', weight: 1.0 },
      { word: 'kirana', weight: 1.0 },
      { word: 'supermarket', weight: 0.95 },
      { word: 'grocery', weight: 1.0 },
      { word: 'groceries', weight: 1.0 },
      { word: 'milk', weight: 0.95 },
      { word: 'curd', weight: 0.9 },
      { word: 'dahi', weight: 0.95 },
      { word: 'bread', weight: 0.9 },
      { word: 'eggs', weight: 0.95 },
      { word: 'vegetables', weight: 0.95 },
      { word: 'sabzi', weight: 0.95 },
      { word: 'fruits', weight: 0.9 },
      { word: 'atta', weight: 0.95 },
      { word: 'dal', weight: 0.9 },
      { word: 'rice', weight: 0.85 },
      { word: 'shampoo', weight: 0.9 },
      { word: 'soap', weight: 0.85 },
      { word: 'toothpaste', weight: 0.9 },
    ],
  },
  // 5. Stationery & College Works
  {
    id: 'stationery',
    type: 'expense',
    keywords: [
      { word: 'xerox', weight: 1.0 },
      { word: 'photocopy', weight: 1.0 },
      { word: 'print', weight: 0.9 },
      { word: 'printout', weight: 1.0 },
      { word: 'spiral', weight: 0.95 },
      { word: 'binding', weight: 0.95 },
      { word: 'stationery', weight: 1.0 },
      { word: 'pen', weight: 0.9 },
      { word: 'pencil', weight: 0.9 },
      { word: 'notebook', weight: 0.95 },
      { word: 'register', weight: 0.9 },
      { word: 'file', weight: 0.75 },
      { word: 'folder', weight: 0.8 },
      { word: 'chart paper', weight: 0.95 },
      { word: 'marker', weight: 0.9 },
      { word: 'highlighter', weight: 0.95 },
      { word: 'assignment', weight: 0.85 },
      { word: 'lab manual', weight: 1.0 },
      { word: 'record book', weight: 0.95 },
    ],
  },
  // 6. Books & Academics
  {
    id: 'books',
    type: 'expense',
    keywords: [
      { word: 'book', weight: 0.9 },
      { word: 'books', weight: 0.95 },
      { word: 'textbook', weight: 1.0 },
      { word: 'novel', weight: 0.95 },
      { word: 'rd sharma', weight: 1.0 },
      { word: 'hc verma', weight: 1.0 },
      { word: 'kindle', weight: 0.95 },
      { word: 'syllabus', weight: 0.9 },
      { word: 'study material', weight: 1.0 },
      { word: 'notes', weight: 0.85 },
    ],
  },
  // 7. Tuition & College Fees
  {
    id: 'tuition',
    type: 'expense',
    keywords: [
      { word: 'tuition', weight: 1.0 },
      { word: 'coaching', weight: 1.0 },
      { word: 'allen', weight: 1.0 },
      { word: 'fitjee', weight: 1.0 },
      { word: 'fiitjee', weight: 1.0 },
      { word: 'aakash', weight: 1.0 },
      { word: 'course', weight: 0.9 },
      { word: 'udemy', weight: 1.0 },
      { word: 'coursera', weight: 1.0 },
      { word: 'college fee', weight: 1.0 },
      { word: 'semester fee', weight: 1.0 },
      { word: 'exam fee', weight: 1.0 },
      { word: 'admission fee', weight: 1.0 },
      { word: 'classes', weight: 0.8 },
    ],
  },
  // 8. Hostel & Rent
  {
    id: 'rent',
    type: 'expense',
    keywords: [
      { word: 'rent', weight: 1.0 },
      { word: 'hostel', weight: 1.0 },
      { word: 'pg', weight: 1.0 },
      { word: 'flat', weight: 0.85 },
      { word: 'room rent', weight: 1.0 },
      { word: 'landlord', weight: 1.0 },
      { word: 'deposit', weight: 0.95 },
      { word: 'brokerage', weight: 1.0 },
      { word: 'maintenance', weight: 0.9 },
      { word: 'electricity bill', weight: 0.95 },
    ],
  },
  // 9. Mobile & Internet Recharge
  {
    id: 'recharge',
    type: 'expense',
    keywords: [
      { word: 'recharge', weight: 1.0 },
      { word: 'jio', weight: 1.0 },
      { word: 'airtel', weight: 1.0 },
      { word: 'vi', weight: 0.8 },
      { word: 'vodafone', weight: 0.95 },
      { word: 'wifi', weight: 1.0 },
      { word: 'broadband', weight: 1.0 },
      { word: 'fiber', weight: 0.95 },
      { word: 'data pack', weight: 1.0 },
      { word: 'mobile plan', weight: 1.0 },
      { word: 'prepaid', weight: 0.9 },
      { word: 'postpaid', weight: 0.9 },
    ],
  },
  // 10. Medical & Health
  {
    id: 'medical',
    type: 'expense',
    keywords: [
      { word: 'medicine', weight: 1.0 },
      { word: 'medicines', weight: 1.0 },
      { word: 'pharmacy', weight: 1.0 },
      { word: 'chemist', weight: 1.0 },
      { word: 'apollo', weight: 0.95 },
      { word: 'medplus', weight: 1.0 },
      { word: 'doctor', weight: 1.0 },
      { word: 'clinic', weight: 0.95 },
      { word: 'hospital', weight: 0.95 },
      { word: 'dolo', weight: 1.0 },
      { word: 'paracetamol', weight: 1.0 },
      { word: 'tablet', weight: 0.9 },
      { word: 'syrup', weight: 0.9 },
      { word: 'bandaid', weight: 0.95 },
      { word: 'bandage', weight: 0.95 },
      { word: 'dental', weight: 0.95 },
      { word: 'eye test', weight: 0.95 },
      { word: 'prescription', weight: 1.0 },
      { word: 'blood test', weight: 1.0 },
    ],
  },
  // 11. Entertainment & Media
  {
    id: 'entertainment',
    type: 'expense',
    keywords: [
      { word: 'movie', weight: 1.0 },
      { word: 'cinema', weight: 1.0 },
      { word: 'pvr', weight: 1.0 },
      { word: 'inox', weight: 1.0 },
      { word: 'cinepolis', weight: 1.0 },
      { word: 'netflix', weight: 1.0 },
      { word: 'spotify', weight: 1.0 },
      { word: 'hotstar', weight: 1.0 },
      { word: 'prime video', weight: 1.0 },
      { word: 'concert', weight: 1.0 },
      { word: 'gaming', weight: 0.95 },
      { word: 'steam', weight: 1.0 },
      { word: 'playstation', weight: 1.0 },
      { word: 'arcade', weight: 0.95 },
      { word: 'bowling', weight: 0.95 },
    ],
  },
  // 12. Shopping & Apparel
  {
    id: 'shopping',
    type: 'expense',
    keywords: [
      { word: 'amazon', weight: 0.9 },
      { word: 'flipkart', weight: 0.9 },
      { word: 'myntra', weight: 1.0 },
      { word: 'meesho', weight: 0.95 },
      { word: 'clothes', weight: 1.0 },
      { word: 'shirt', weight: 0.95 },
      { word: 't-shirt', weight: 0.95 },
      { word: 'jeans', weight: 0.95 },
      { word: 'shoes', weight: 0.95 },
      { word: 'sneakers', weight: 1.0 },
      { word: 'zara', weight: 1.0 },
      { word: 'h&m', weight: 1.0 },
      { word: 'mall', weight: 0.85 },
      { word: 'bag', weight: 0.8 },
      { word: 'hoodie', weight: 0.95 },
      { word: 'jacket', weight: 0.9 },
    ],
  },
  // 13. Subscriptions & Memberships
  {
    id: 'subscriptions',
    type: 'expense',
    keywords: [
      { word: 'subscription', weight: 1.0 },
      { word: 'recurring', weight: 0.9 },
      { word: 'gym', weight: 1.0 },
      { word: 'cult', weight: 1.0 },
      { word: 'cult fit', weight: 1.0 },
      { word: 'membership', weight: 1.0 },
      { word: 'google one', weight: 1.0 },
      { word: 'icloud', weight: 1.0 },
      { word: 'youtube premium', weight: 1.0 },
      { word: 'annual pass', weight: 0.95 },
    ],
  },
  // 14. Travel & Trips
  {
    id: 'travel',
    type: 'expense',
    keywords: [
      { word: 'flight', weight: 1.0 },
      { word: 'indigo', weight: 1.0 },
      { word: 'air india', weight: 1.0 },
      { word: 'hotel', weight: 1.0 },
      { word: 'oyo', weight: 1.0 },
      { word: 'trip', weight: 0.95 },
      { word: 'vacation', weight: 1.0 },
      { word: 'holiday', weight: 0.95 },
      { word: 'airbnb', weight: 1.0 },
      { word: 'makemytrip', weight: 1.0 },
      { word: 'goibibo', weight: 1.0 },
      { word: 'resort', weight: 0.95 },
    ],
  },
  // 15. Emergency & Fines
  {
    id: 'emergency',
    type: 'expense',
    keywords: [
      { word: 'emergency', weight: 1.0 },
      { word: 'fine', weight: 1.0 },
      { word: 'challan', weight: 1.0 },
      { word: 'penalty', weight: 1.0 },
      { word: 'traffic police', weight: 1.0 },
      { word: 'puncture', weight: 1.0 },
      { word: 'mechanic', weight: 0.95 },
      { word: 'repair', weight: 0.9 },
      { word: 'towing', weight: 1.0 },
      { word: 'urgent', weight: 0.8 },
    ],
  },
  // 16. Gifts & Celebrations
  {
    id: 'gifts',
    type: 'expense',
    keywords: [
      { word: 'gift', weight: 1.0 },
      { word: 'present', weight: 0.95 },
      { word: 'birthday gift', weight: 1.0 },
      { word: 'anniversary', weight: 0.95 },
      { word: 'flowers', weight: 0.95 },
      { word: 'bouquet', weight: 1.0 },
      { word: 'chocolates', weight: 0.95 },
    ],
  },
  // 17. Peer Settlements & Friends (IOU)
  {
    id: 'friend',
    type: 'expense',
    keywords: [
      { word: 'paid to', weight: 1.0 },
      { word: 'gave to', weight: 1.0 },
      { word: 'sent to', weight: 1.0 },
      { word: 'transfer to', weight: 1.0 },
      { word: 'split', weight: 0.95 },
      { word: 'settled', weight: 0.95 },
      { word: 'lent', weight: 0.95 },
      { word: 'lent to', weight: 1.0 },
      { word: 'friend', weight: 0.9 },
      { word: 'rahul', weight: 0.9 },
      { word: 'rohan', weight: 0.9 },
      { word: 'priya', weight: 0.9 },
      { word: 'amit', weight: 0.9 },
      { word: 'ananya', weight: 0.9 },
      { word: 'sneha', weight: 0.9 },
      { word: 'vikas', weight: 0.9 },
      { word: 'aditya', weight: 0.9 },
    ],
  },
  // Income 1. Allowance / Pocket Money
  {
    id: 'allowance',
    type: 'income',
    keywords: [
      { word: 'pocket money', weight: 1.0 },
      { word: 'allowance', weight: 1.0 },
      { word: 'mom', weight: 0.95 },
      { word: 'dad', weight: 0.95 },
      { word: 'papa', weight: 0.95 },
      { word: 'mummy', weight: 0.95 },
      { word: 'parents', weight: 1.0 },
      { word: 'family', weight: 0.85 },
    ],
  },
  // Income 2. Salary / Stipend
  {
    id: 'salary',
    type: 'income',
    keywords: [
      { word: 'salary', weight: 1.0 },
      { word: 'stipend', weight: 1.0 },
      { word: 'internship', weight: 0.95 },
      { word: 'payroll', weight: 1.0 },
      { word: 'employer', weight: 0.95 },
      { word: 'wages', weight: 1.0 },
    ],
  },
  // Income 3. Freelance & Gigs
  {
    id: 'freelance',
    type: 'income',
    keywords: [
      { word: 'freelance', weight: 1.0 },
      { word: 'upwork', weight: 1.0 },
      { word: 'fiverr', weight: 1.0 },
      { word: 'client', weight: 0.95 },
      { word: 'project payment', weight: 1.0 },
      { word: 'bounty', weight: 0.95 },
      { word: 'gig', weight: 0.9 },
    ],
  },
  // Income 4. Gift Received
  {
    id: 'gift_received',
    type: 'income',
    keywords: [
      { word: 'gift received', weight: 1.0 },
      { word: 'shagun', weight: 1.0 },
      { word: 'birthday money', weight: 1.0 },
      { word: 'cash gift', weight: 1.0 },
    ],
  },
  // Income 5. Investment & Returns
  {
    id: 'investment',
    type: 'income',
    keywords: [
      { word: 'dividend', weight: 1.0 },
      { word: 'interest', weight: 0.95 },
      { word: 'mutual fund', weight: 0.95 },
      { word: 'stocks', weight: 0.9 },
      { word: 'crypto profit', weight: 1.0 },
      { word: 'fd interest', weight: 1.0 },
    ],
  },
];

/**
 * Predicts the most likely category based on the expense note and optional amount.
 * Matches using full phrase lookups and tokenized stemming.
 */
export function predictCategory(
  noteText: string,
  amount?: number,
  preferredType?: 'expense' | 'income'
): CategorizationResult | null {
  if (!noteText || !noteText.trim()) return null;

  const text = noteText.toLowerCase().trim();
  const tokens = text.split(/[\s,.\-_/]+/).filter((t) => t.length > 1);

  let bestCategory = '';
  let bestType: 'expense' | 'income' = 'expense';
  let highestScore = 0;
  let bestMatches: string[] = [];

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    const matches: string[] = [];

    // Prioritize type if preferred
    const typeMultiplier = preferredType ? (rule.type === preferredType ? 1.2 : 0.8) : 1.0;

    for (const kw of rule.keywords) {
      if (text.includes(kw.word)) {
        score += kw.weight * 2.5 * typeMultiplier;
        matches.push(kw.word);
      } else {
        const tokenMatch = tokens.some(
          (t) => t === kw.word || (t.length >= 3 && kw.word.startsWith(t))
        );
        if (tokenMatch) {
          score += kw.weight * 1.2 * typeMultiplier;
          matches.push(kw.word);
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = rule.id;
      bestType = rule.type;
      bestMatches = matches;
    }
  }

  // Minimum threshold to avoid false positives
  if (highestScore < 1.0 || !bestCategory) {
    return null;
  }

  // Confidence normalized to [0.55, 0.99]
  const confidence = Math.min(0.99, Math.max(0.55, 0.45 + highestScore * 0.15));

  return {
    categoryId: bestCategory,
    type: bestType,
    confidence: Number(confidence.toFixed(2)),
    matchedKeywords: bestMatches,
  };
}

