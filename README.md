<div align="center">
  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuACrBq3mzB3KNbIhNfjJxMjvPG1Um8git0W7hb2Flj45gHRWfuQb1cHJysssenPSQUQRy0XaYiZ4y0Pc3FxrIyvLR_plgQcjvCsveiQrpRo6l0_Ej6tLu71vNYS4XksDCEvgFp7JHxqqDtijfqBEZ_X8uDtdzRL2_-Lw-8ubtxj5KpY1sYpkDtcfLKGFYgZibWy-dDQoEXVrwgRPdbtu-k-ljEbnxNIAfhPQX_EPVVDdL9lJE4G9g" alt="SpendWise Premium Aesthetic" width="100%" style="border-radius: 12px; margin-bottom: 20px; object-fit: cover; height: 300px;"/>

  # ✦ SpendWise ✦
  
  *Premium Personal Finance & Expense Tracking, Elevated for Students.*

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  </p>
  
  ---
</div>

## ✧ The Vision

**SpendWise** is not just another budgeting app. It is a meticulously crafted Progressive Web Application (PWA) designed to bring a high-end, luxury editorial aesthetic to personal finance for college students. 

By combining minimalist typography (EB Garamond & Manrope), soft glassmorphism, and dynamic micro-interactions, SpendWise makes tracking your daily expenses feel like flipping through a premium lifestyle magazine.

---

## 🌟 Signature Features

### 🎨 Editorial Aesthetic
- **Sahara Layout:** Warm peach and orange tones paired with elegant serif typography.
- **Glassmorphic UI:** Soft blur panels and ultra-soft drop shadows.
- **Micro-Animations:** Smooth, responsive hover states and scale transitions for every interaction.

### ⚡ Lightning Fast Logging
- Add expenses in under 3 seconds with optimized numeric keypads and one-tap category chips.
- Seamlessly integrates directly into the global Bottom Sheet.

### 🔄 Real-time Cloud Sync
- Powered by **Firebase Firestore**, your expenses synchronize instantly across your phone, tablet, and laptop.
- Full offline persistence: log expenses on the subway, and they’ll silently sync when you’re back online.

### 📊 Beautiful Analytics
- **Category Insights:** Stunning visualizations to see exactly where your money goes.
- **Smart Budgets:** Set your monthly allowance and watch the remaining balance recalculate instantly.

---

## 🏗 System Architecture

SpendWise utilizes a "Thick Client + Smart Database" architecture pattern, completely eliminating the need for a custom backend server to reduce latency and infrastructure overhead.

- **Frontend:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Custom Design Tokens
- **State Management:** Zustand
- **Backend as a Service:** Firebase (Auth, Firestore, Hosting)
- **Typography:** Google Fonts (EB Garamond & Manrope)
- **Icons:** Google Material Symbols (Outlined)

---

## 💻 Local Development

Want to run this premium experience on your local machine? Follow these steps:

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **Firebase CLI**: Installed globally (`npm i -g firebase-tools`)
- **Java**: Required for running the local Firebase Emulator Suite

### 2. Installation
Clone the repository from GitHub:
```bash
git clone https://github.com/AdityaPatil2549/Spand-wise.git
cd Spand-wise
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory based on the `.env.example`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Running the Development Server
```bash
# Terminal 1: Start the Next.js development server
npm run dev

# Terminal 2: Start the Firebase Emulator Suite (Firestore & Auth)
npm run emulators
```
Open [http://localhost:3000](http://localhost:3000) to view the application in all its glory.

---

## 🤝 Contributing

Contributions are welcome! Whether it's adding new features, improving the UI/UX, or fixing bugs, we appreciate your help in making SpendWise the most beautiful expense tracker available.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <i>"Discipline is the bridge between goals and accomplishment."</i><br><br>
  Built with ❤️ for students, by students.
</div>
