# Installation Guide
## SpendWise — Student Expense Tracker

---

## 1. Prerequisites

Before running SpendWise locally, ensure you have:
1. **Node.js**: v18.17.0 or higher
2. **npm** or **yarn** or **pnpm**
3. **Firebase CLI**: Installed globally (`npm install -g firebase-tools`)
4. **Java**: (Required for Firebase Emulator Suite)

---

## 2. Project Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/spendwise.git
cd spendwise

# 2. Install dependencies
npm install

# 3. Environment Variables
cp .env.example .env.local
```

### 2.1 Firebase Configuration

You need a Firebase project to run the app.
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (e.g., `spendwise-dev`).
3. Enable **Firestore Database** (Start in Test Mode).
4. Enable **Authentication** (Enable Google Sign-in provider).
5. Register a Web App and copy the config object into your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 3. Running Locally (with Emulators)

To avoid messing with production data during development, we use the Firebase Emulator.

```bash
# Terminal 1: Start Firebase Emulators
npm run emulators

# Terminal 2: Start Next.js Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Production Build

To test the production build locally:

```bash
npm run build
npm run start
```

## 5. Deployment

SpendWise is deployed to Firebase Hosting.

```bash
# Build the Next.js static export
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```
