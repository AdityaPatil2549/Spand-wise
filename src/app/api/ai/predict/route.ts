import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const RequestSchema = z.object({
  expenses: z
    .array(
      z.object({
        amount: z.number().finite().nonnegative(),
        categoryId: z.string().max(64).optional(),
        note: z.string().max(250).nullable().optional(),
        type: z.enum(['expense', 'income']).optional(),
      })
    )
    .max(500),
  budget: z.object({
    budgetAmount: z.number().finite().nonnegative(),
    currency: z.string().max(12).optional(),
  }),
});

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(key);
  if (!entry || now > entry.resetAt) {
    ipHits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for') || 'local';
    const clientIp = forwarded.split(',')[0].trim() || 'local';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const parsed = RequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid expenses or budget payload' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 503 }
      );
    }

    const { expenses, budget } = parsed.data;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const sanitizedExpenses = expenses.slice(0, 100).map((e) => ({
      amount: e.amount,
      categoryId: e.categoryId ?? 'other',
      type: e.type ?? 'expense',
    }));

    const prompt = `
You are a personal finance advisor analyzing a user's monthly spending.
Monthly budget limit: ${budget.budgetAmount} ${budget.currency || 'INR'}.
Recent expenses (category & amount only):
${JSON.stringify(sanitizedExpenses)}

Provide a concise, practical insight (max 2 sentences) about their spending habits or a concrete way to stay within budget. Friendly, encouraging tone.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const insight = response.text;
    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Error in AI prediction:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insight' },
      { status: 500 }
    );
  }
}
