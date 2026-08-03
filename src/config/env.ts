import { z } from 'zod';

/**
 * Zod schema for environment variables.
 * All Firebase config values are required. The build will fail if any are missing.
 * This prevents silent runtime failures from misconfigured deployments.
 */
const envSchema = z.object({
 NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
 NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
 NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
 NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
 NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase messaging sender ID is required'),
 NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),
});

/**
 * Validated environment variables.
 * Import `env` instead of `process.env` for type-safe access throughout the app.
 */
const _parsed = envSchema.safeParse({
 NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
 NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
 NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
 NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
 NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

if (!_parsed.success) {
 console.error(
 '❌ Invalid or missing environment variables:\n',
 _parsed.error.flatten().fieldErrors
 );
 // In production, this would throw. In development, we log a warning.
 if (process.env.NODE_ENV === 'production') {
 throw new Error('Missing required environment variables. Check your .env.local file.');
 }
}

export const env = _parsed.success
 ? _parsed.data
 : {
 NEXT_PUBLIC_FIREBASE_API_KEY: '',
 NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: '',
 NEXT_PUBLIC_FIREBASE_PROJECT_ID: '',
 NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: '',
 NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '',
 NEXT_PUBLIC_FIREBASE_APP_ID: '',
 };
