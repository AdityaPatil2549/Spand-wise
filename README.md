<div align="center">
  <a href="https://spendwise-458f0.web.app">
    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuACrBq3mzB3KNbIhNfjJxMjvPG1Um8git0W7hb2Flj45gHRWfuQb1cHJysssenPSQUQRy0XaYiZ4y0Pc3FxrIyvLR_plgQcjvCsveiQrpRo6l0_Ej6tLu71vNYS4XksDCEvgFp7JHxqqDtijfqBEZ_X8uDtdzRL2_-Lw-8ubtxj5KpY1sYpkDtcfLKGFYgZibWy-dDQoEXVrwgRPdbtu-k-ljEbnxNIAfhPQX_EPVVDdL9lJE4G9g" alt="SpendWise Premium Aesthetic" width="100%" style="border-radius: 16px; margin-bottom: 24px; object-fit: cover; height: 350px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);"/>
  </a>

  <h1 style="font-weight: 900; letter-spacing: -1px; font-size: 3em;">✦ SpendWise ✦</h1>
  
  <p style="font-size: 1.2em; color: #666; max-width: 600px; margin: 0 auto; line-height: 1.5;">
    <em>Personal finance shouldn't feel like a spreadsheet. It should feel like luxury. A premium, intelligence-driven expense tracking engine designed exclusively for the modern student.</em>
  </p>

  <br />

  <p align="center">
    <a href="https://spendwise-458f0.web.app" target="_blank">
      <img src="https://img.shields.io/badge/Launch_Live_App-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
  </p>

  <br />

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Firebase_9-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Zustand-443E38?style=flat-square&logo=react&logoColor=white" alt="Zustand" />
    <img src="https://img.shields.io/badge/Tesseract.js-008000?style=flat-square&logo=cplusplus&logoColor=white" alt="Tesseract OCR" />
  </p>

  ---
</div>

<br/>

## 💎 The Vibe
Most budgeting apps are clinical, boring, and tedious. **SpendWise is different.** 
We engineered a Progressive Web Application that marries brutalist efficiency with glassmorphic elegance. It features physics-based micro-interactions, hardware-accelerated animations, and intelligent automation to make logging a coffee purchase feel like unlocking an iPhone.

<br/>

## 🚀 The Arsenal: Killer Features

<table width="100%">
  <tr>
    <td width="33%" valign="top">
      <h3 align="center">📸<br/>Vision AI (OCR)</h3>
      <p align="center">Stop typing. Snap a photo of your receipt. Our on-device Tesseract.js engine instantly extracts the total amount and pre-fills your ledger. 100% private. Zero cloud processing.</p>
    </td>
    <td width="33%" valign="top">
      <h3 align="center">🤖<br/>Autopilot Subs</h3>
      <p align="center">Netflix. Spotify. Gym. Enter them once. The SpendWise background engine silently logs your recurring subscriptions on their exact due date while you sleep.</p>
    </td>
    <td width="33%" valign="top">
      <h3 align="center">🪄<br/>Physics & Haptics</h3>
      <p align="center">Framer Motion spring physics power buttery-smooth swipe-to-delete gestures, paired with native mobile haptic vibrations and confetti bursts for hitting savings goals.</p>
    </td>
  </tr>
</table>

<br/>

## 🎨 The Matrix: Dynamic Theming
Why settle for Light/Dark mode? SpendWise features a deeply integrated CSS-variable injection engine that hot-swaps the entire molecular structure of the app at runtime. 

Choose your aesthetic:
> **`CYBERPUNK`** (Neon purples & harsh tech fonts) · **`MINIMAL`** (Stark contrast & Swiss typography) · **`SAHARA`** (Warm desert peach & elegant serifs) · **`OCEAN`** (Abyssal blues) · **`NEOBRUTALISM`** (Harsh shadows & loud borders) · **`MIDNIGHT`** (OLED pitch black)

<br/>

## 🏗 The Engine: Architecture

SpendWise operates on a **"Thick Client + Smart Cloud"** paradigm. By shifting compute to the client and caching aggressively via `Zustand`, we bypass the need for a traditional backend, reducing latency to near zero.

- **The Brain:** Next.js 14 (App Router) + TypeScript.
- **The Muscle:** Firebase Firestore (Real-time NoSQL sync with offline-first persistence).
- **The Soul:** TailwindCSS + Framer Motion (Hardware-accelerated DOM manipulation).
- **The Eyes:** Client-side Tesseract OCR (WASM-based optical character recognition).

<br/>

## 📂 The Blueprint

```bash
src/
├── app/                  # Next.js 14 App Router (RSC & Client Boundaries)
├── components/           
│   ├── features/         # Highly cohesive, domain-specific modules (OCR, Budgeting)
│   ├── layout/           # Global shells (Glassmorphic TopNav, Blur Sidebars)
│   ├── shared/           # Reusable primitive atoms
│   └── ui/               # Radix/Tailwind styled components
├── config/               # Master configuration (Themes, Categories, Tokens)
├── hooks/                # Specialized React hooks (useHaptic, useIntersectionObserver)
├── lib/                  # Pure utility functions & Firebase singletons
├── store/                # Zustand atomic state slices
└── types/                # Strict TypeScript interfaces & Zod schemas
```

<br/>

<details>
<summary><b>🛠️ Boot up the Local Development Server (Click to expand)</b></summary>
<br/>

Ready to hack on the codebase? Here is how to spin it up locally.

1. **Clone & Install**
   ```bash
   git clone https://github.com/AdityaPatil2549/Spand-wise.git
   cd Spand-wise
   npm install
   ```

2. **Environment Variables**
   Duplicate `.env.example` into `.env.local` and inject your Firebase keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   # ...
   ```

3. **Ignition**
   ```bash
   # Terminal A: The Next.js UI Engine
   npm run dev

   # Terminal B: The Local Firebase Backend Emulators
   npm run emulators
   ```
   Navigate to `http://localhost:3000`. Welcome to SpendWise.

</details>

<br/>

## 🤝 The Guild (Contributing)

We hold this codebase to the highest standard of engineering and design. If you want to contribute, we would love to have you. 

Before opening a PR, please review the rules of engagement:
- 📖 [Read the Contributing Guide](CONTRIBUTING.md)
- ⚖️ [Review the Code of Conduct](CODE_OF_CONDUCT.md)
- 🐛 [Report a Bug](.github/ISSUE_TEMPLATE/bug_report.md) or [Request a Feature](.github/ISSUE_TEMPLATE/feature_request.md)

---

<div align="center">
  <p style="font-size: 1.1em; font-family: serif; font-style: italic; color: #888;">
    "Discipline is the bridge between goals and accomplishment."
  </p>
  <br/>
  <b>Built with ⚡ by Aditya Patil & Contributors.</b>
</div>
