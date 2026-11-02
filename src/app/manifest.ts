import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
 return {
 name: 'SpendWise - Expense Tracker',
 short_name: 'SpendWise',
 description: 'Student expense tracking with real-time multi-device sync.',
  start_url: '/dashboard',
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: '#faf5ee',
  theme_color: '#d96b14',
  categories: ['finance', 'productivity'],
 icons: [
 {
 src: '/favicon.ico',
 sizes: 'any',
 type: 'image/x-icon',
 },
 {
 src: '/web-app-manifest-192x192.png',
 sizes: '192x192',
 type: 'image/png',
 purpose: 'maskable',
 },
 {
 src: '/web-app-manifest-512x512.png',
 sizes: '512x512',
 type: 'image/png',
 purpose: 'any',
 },
 ],
 };
}
