# SpendWise — Student Expense Tracker

![SpendWise Banner](https://via.placeholder.com/1200x400/7C3AED/FFFFFF?text=SpendWise+-+Student+Expense+Tracker)

SpendWise is a Progressive Web Application (PWA) tailored specifically for college students to track their daily expenses quickly, manage monthly allowances, and analyze their spending habits. Designed with a mobile-first philosophy, SpendWise offers an ultra-fast, offline-capable, and visually stunning experience using modern web technologies.

---

## 🌟 Key Features

### 🚀 Core Functionality
- **Lightning Fast Logging:** Add expenses in under 3 seconds using the optimized numeric keypad and one-tap category chips.
- **Real-time Syncing:** Powered by Firebase Firestore, your expenses synchronize across your phone, tablet, and laptop in milliseconds.
- **Offline Support:** Full PWA offline persistence. Log expenses while on the subway; they sync automatically when connection is restored.
- **Smart Budgets:** Set your monthly allowance and watch the remaining balance automatically recalculate via atomic batch updates.

### 📊 Analytics & Reporting
- **Category Insights:** Beautiful Recharts-powered donut charts to visualize where your money goes.
- **PDF Generation:** One-click monthly summary PDF generation using `jsPDF` for local processing—no server required.
- **Smart Alerts:** Dynamic UI elements that shift from safe (purple) to warning (amber) to critical (red) as you approach your budget limit.

### 🛡 Security & Privacy
- **Secure Authentication:** 1-tap Google OAuth login.
- **Data Ownership:** You own your data. Strict Firestore security rules ensure only you can read or modify your expenses.
- **No Plaid/Bank Integrations:** SpendWise acts as a manual cashbook. No bank credentials are ever required, maximizing privacy.

---

## 🏗 System Architecture

SpendWise utilizes a "Thick Client + Smart Database" architecture pattern, eliminating the need for a custom backend server (like Node.js or Python) to reduce latency and maintenance costs.

- **Frontend Framework:** [Next.js 14](https://nextjs.org) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) + custom CSS Variables (Tokens)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Backend as a Service:** [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

For deep architectural documentation, see the `/docs/08_frontend/Frontend_Architecture.md` and `/docs/06_database/Database_Design.md` files.

---

## 💻 Local Development

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm** or **pnpm**
- **Firebase CLI**: Installed globally (`npm i -g firebase-tools`)
- **Java**: Required for running the local Firebase Emulator Suite

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/spendwise.git
cd spendwise

# Install all dependencies
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
To avoid writing junk data to production, we develop against the local Firebase Emulators.

```bash
# Terminal 1: Start the Next.js development server
npm run dev

# Terminal 2: Start the Firebase Emulator Suite (Firestore & Auth)
npm run emulators
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```text
spendwise/
├── docs/                      # Comprehensive 175-document project specification
├── src/
│   ├── app/                   # Next.js 14 App Router routes and layouts
│   ├── components/            # Reusable UI, Layout, and Feature components
│   ├── lib/                   # Business logic, Firebase helpers, utils
│   ├── store/                 # Zustand slices for global client state
│   ├── styles/                # Tailwind global CSS and design tokens
│   └── types/                 # TypeScript interfaces and Zod schemas
├── public/                    # Static assets, PWA manifest, favicons
├── AGENTS.md                  # Strict AI guidelines and rules
└── tailwind.config.ts         # Tailwind configuration
```

---

## 🧪 Testing

SpendWise maintains quality through a hybrid testing approach:
- **Unit Tests:** Jest + React Testing Library for utility functions and complex state logic.
- **Integration Tests:** Verifying Firestore Security Rules against the local emulator.
- **E2E Tests:** Playwright covering Critical User Journeys (CUJs).

Run tests:
```bash
npm run test       # Unit tests
npm run test:e2e   # Playwright E2E tests
```

---

## 🤝 Contributing

Contributions are welcome! Please read the `CONTRIBUTING.md` in the `/docs/16_documentation/` folder for details on our code of conduct, branching strategy, and pull request process.

Before opening a PR, ensure:
1. You have run `npm run lint` and `npm run format`.
2. All new functions are fully typed with TypeScript.
3. No hardcoded colors are introduced (use Tailwind design tokens).
4. Tests pass successfully.

---

## 📜 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

*SpendWise — Built for students, by students.*
