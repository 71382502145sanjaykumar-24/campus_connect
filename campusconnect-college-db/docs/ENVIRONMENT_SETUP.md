# CampusConnect Firebase Environment Setup & Manual Console Checklist

This guide provides the exact steps to create and configure the Firebase project in the **Google Firebase Console**.

---

## Phase 1: Firebase Project Creation (Console)

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Set the project name to: `campusconnect-college-db`.
4. (Optional) Enable Google Analytics according to your institutional policies.
5. Click **Create project** and wait for provisioning to complete.

---

## Phase 2: Firebase Authentication Setup

1. In the left navigation, select **Build ➔ Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable the following providers:
   - **Email/Password:** Enable both Email/Password and Email link (passwordless) if desired.
   - **Google:** (Optional for Institutional Google Workspace SSO).
4. Under the **Settings ➔ Authorized domains** tab, add your deployment domain (e.g. `localhost`, `campusconnect.edu`).

---

## Phase 3: Cloud Firestore Database Setup

1. In the left navigation, select **Build ➔ Firestore Database**.
2. Click **Create database**.
3. Select **Start in production mode** (our `firestore.rules` will enforce security).
4. Select your preferred Cloud Firestore location (e.g., `asia-south1` for Mumbai, India or `us-central1`).
5. Click **Enable**.

---

## Phase 4: Firebase Storage Setup

1. In the left navigation, select **Build ➔ Storage**.
2. Click **Get Started**.
3. Select **Start in production mode**.
4. Choose the storage bucket location (matching your Firestore location for minimal latency).
5. Click **Done**.

---

## Phase 5: Service Account Key Generation (Admin SDK)

To execute administrative seed scripts, migrations, and trusted services:

1. Click the **Gear icon (⚙️)** next to Project Overview ➔ **Project settings**.
2. Navigate to the **Service accounts** tab.
3. Verify that **Firebase Admin SDK** is selected.
4. Click **Generate new private key**, then confirm **Generate key**.
5. Save the downloaded JSON file into your local project:
   `campusconnect-college-db/serviceAccountKey.json`.
6. **IMPORTANT:** Ensure `serviceAccountKey.json` is listed in `.gitignore` and never committed to a public repository!

---

## Phase 6: Environment Variables Setup

1. In `campusconnect-college-db/`, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the values with your project IDs:
   ```env
   FIREBASE_PROJECT_ID=campusconnect-college-db
   FIREBASE_STORAGE_BUCKET=campusconnect-college-db.appspot.com
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   ```

---

## Phase 7: Deploying Rules & Functions via Firebase CLI

Run the following commands from the `campusconnect-college-db/` folder:

```bash
# 1. Login to Firebase CLI
firebase login

# 2. Set active project
firebase use campusconnect-college-db

# 3. Deploy Security Rules & Indexes
npm run deploy:rules
npm run deploy:indexes

# 4. Deploy Cloud Functions
npm run deploy:functions
```
