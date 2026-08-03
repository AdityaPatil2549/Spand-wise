import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
 try {
 const body = await req.json();
 const { expenses, budget } = body;

 if (!expenses || !budget) {
 return NextResponse.json(
 { error: 'Missing expenses or budget data' },
 { status: 400 }
 );
 }

 if (!process.env.GEMINI_API_KEY) {
 return NextResponse.json(
 { error: 'GEMINI_API_KEY is not configured on the server.' },
 { status: 500 }
 );
 }

 const prompt = `
You are a financial advisor analyzing a user's monthly spending.
Here is the user's budget limit: ${budget.budgetAmount} ${budget.currency || 'INR'}.
Here are the user's expenses this month:
${JSON.stringify(expenses.slice(0, 100), null, 2)}

Provide a very short, punchy insight (max 2 sentences) about their spending habits or a useful tip to save money based on these expenses. Tone should be friendly and encouraging.
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
