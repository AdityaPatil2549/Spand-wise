import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
 return {
 name: 'SpendWise - Expense Tracker',
 short_name: 'SpendWise',
 description: 'Student expense tracking with real-time multi-device sync.',
 start_url: '/dashboard',
 display: 'standalone',
 background_color: '#0f0a1e',
 theme_color: '#7c3aed',
 icons: [
 {
 src: '/favicon.ico',
 sizes: 'any',
 type: 'image/x-icon',
 },
 {
 src: '/icon-192x192.png',
 sizes: '192x192',
 type: 'image/png',
 },
 {
 src: '/icon-512x512.png',
 sizes: '512x512',
 type: 'image/png',
 },
 ],
 };
}
