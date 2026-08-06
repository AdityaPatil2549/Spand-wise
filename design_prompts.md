# SpendWise — AI Design Prompts

This document contains highly refined, copy-paste ready prompts for generating the core branding assets (App Icons and Open Graph Social Banners) for the SpendWise application using AI image generators like Midjourney, DALL-E 3, or Stable Diffusion.

## Overview of Required Assets

Before generating, remember the core assets required for the Next.js / PWA setup:
1. **App Icon (Square):** Generate at `1024x1024`. Use tools like RealFaviconGenerator to convert this into all required `.ico` and PWA `.png` sizes.
2. **Open Graph Banner (Landscape):** Generate at `1200x630`. This is used for social media link previews.

---

## Approach 1: The "Premium FinTech" Aesthetic
*Focuses on trust, sleekness, and high-end UI design. It perfectly complements the glassmorphism, smooth animations, and clean dark/light modes we built.*

### App Icon (1024x1024)
> A hyper-minimalist, premium iOS app icon for a modern finance app. The logo features a simple, elegant geometric 'S' interlocking with a subtle upward-trending arrow. The color palette is deep obsidian black with vibrant emerald green and soft silver gradients. Sleek glassmorphism effects, soft drop shadows, clean vector style, ultra-modern UI/UX design, Dribbble aesthetic, high resolution, centered on a pristine dark background. --ar 1:1 --v 6.0

### Open Graph Banner (1200x630)
> A premium, cinematic promotional banner for a high-end web app. The scene shows abstract, frosted-glass UI cards floating elegantly against a deep, dark obsidian background. Subtle glowing emerald green and sapphire blue light leaks illuminate the edges of the glass. Minimalist, sophisticated, corporate tech aesthetic. Clean negative space on the left side for crisp typography. 8k resolution, award-winning web design. --ar 1200:630 --v 6.0

---

## Approach 2: The "Gen-Z / Neobrutalism" Aesthetic
*Leans into our app's "Neobrutalism" theme. Uses high contrast, bold typography, and retro-tech elements. Extremely trendy among college students.*

### App Icon (1024x1024)
> A bold, Neobrutalist style app icon for a student expense tracker. The design features a chunky, retro-computer pixelated coin or a bold abstract wallet icon. High contrast colors: vibrant canary yellow background, harsh solid black outlines, and harsh drop shadows. Anti-design aesthetic, Gen-Z trend, raw, playful but highly legible, flat vector graphics, UI/UX design. --ar 1:1 --v 6.0

### Open Graph Banner (1200x630)
> A bold, Gen-Z Neobrutalist promotional web banner. The background is a vibrant, solid pastel pink and canary yellow split. Floating in the scene are chunky, stylized 3D UI elements: a retro receipt, a pixelated smiling coin, and bold black geometric shapes with harsh drop shadows. Playful, high-contrast, trendy anti-design aesthetic. Negative space on the left for bold, blocky text. 8k resolution, highly stylized. --ar 1200:630 --v 6.0

---

## Approach 3: The "Cyberpunk / Dark Neon" Aesthetic
*Leans heavily into the app's "Cyberpunk" and "Midnight" themes. Appeals to gamers and tech-enthusiasts who love dark modes and neon glows.*

### App Icon (1024x1024)
> A futuristic, cyberpunk-style iOS app icon for a digital wallet. The logo is a glowing, holographic wireframe of a minimalist coin or geometric 'S', emitting an intense electric magenta and neon cyan glow. Set against a pitch-black, subtle carbon-fiber textured background. High-tech, synthwave aesthetic, sleek UI/UX design, luminescent, highly detailed, 8k resolution. --ar 1:1 --v 6.0

### Open Graph Banner (1200x630)
> A stunning cyberpunk promotional web banner for a tech dashboard. The background is a dark, futuristic server room or abstract dark-web grid glowing with neon magenta and cyan. In the foreground, glowing holographic data charts and digital currency symbols float seamlessly. High-end synthwave aesthetic, dramatic lighting, volumetric fog, negative space on the left side for futuristic text layout, ultra-detailed 8k. --ar 1200:630 --v 6.0

---

## Recommended Workflow

1. Choose your preferred aesthetic above.
2. Copy the App Icon prompt into your AI generator (Midjourney/DALL-E 3) and generate your `1024x1024` logo.
3. Save the resulting image as `logo-master.png`.
4. Upload `logo-master.png` to **[RealFaviconGenerator.net](https://realfavicongenerator.net/)** to automatically generate all required PWA icons, iOS touch icons, and favicons.
5. Extract the generated icons directly into your Next.js `public/` directory.
6. Copy the Open Graph Banner prompt into your AI generator.
7. Save the resulting image as `opengraph-image.png` (or `.jpg`).
8. Place the `opengraph-image.png` directly into your Next.js `src/app/` directory. Next.js will automatically detect it and use it for social media previews.
