<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="Tookoo Logo" />
</p>

<h1 align="center">Tookoo</h1>

<p align="center">
  <strong>Smart POS App — Free, Offline, No Server Required</strong><br/>
  <em>Local-First P2P Point of Sale for Small Businesses</em>
</p>

<p align="center">
  <a href="#key-features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#free-deployment">Deploy Free</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  🇮🇩 <a href="README_id.md">Baca dalam Bahasa Indonesia</a>
</p>

---

## Why Tookoo?

Most POS apps charge monthly subscription fees and depend on cloud servers — when the internet goes down, your cashier stops working. **Tookoo eliminates both problems entirely.**

| | Traditional POS | Tookoo |
|:--|:--|:--|
| **Operating Cost** | $10–50 / month | **$0 — Free forever** |
| **When Internet Is Down** | ❌ Cannot process transactions | ✅ Runs 100% normally |
| **Business Data** | Stored on vendor servers | 🔒 100% on your devices |
| **Installation** | Download APK / installer | 🌐 Open browser, ready to use |

---

## Key Features

### 🏪 Cashier Terminal
- Responsive product catalog with instant search and category filtering.
- Reactive shopping cart — add, remove, adjust quantities with automatic calculations.
- Payment modal: **Cash** (automatic change calculator), **QRIS**, and **Bank Transfer**.
- **Variant & modifier** support per product (size, ice level, toppings, etc.).
- **Pending orders** — save orders temporarily and resume later.

### 📦 Product & Inventory Management
- Add, edit, and delete products from the catalog.
- Real-time stock tracking — automatically decremented on each transaction.
- Product organization by category.

### 📊 Sales History & Reports
- Daily summary: Revenue, Order Count, Average Order Value.
- Receipt history list with date filters.
- Detailed receipt view (line items, timestamps, payment method, cashier name).

### 🍽️ Table Layout (Restaurant Mode)
- Visual table layout for cafés and restaurants.
- Real-time table status — vacant, occupied, reserved.

### 🔄 Serverless P2P Sync
- Connect multiple cashier terminals directly over **local Wi-Fi** — no internet required.
- Instant pairing via **QR Code scan** or **12-word mnemonic passphrase (BIP-39)**.
- Automatic conflict resolution using **Last-Write-Wins (LWW)** algorithm.

### ☁️ Google Drive Backup (Optional)
- Back up store data to your personal Google Drive.
- Restore data anytime on a new device.

### 📱 Progressive Web App (PWA)
- Install on your home screen like a native app.
- Runs 100% offline thanks to Service Worker caching.
- Responsive — optimized from 5" phones to 32" monitors.

### 🌏 Bilingual
- Interface available in **Bahasa Indonesia** (default) and **English**.

---

## Demo

> 🚧 Live demo coming soon at **[tookoo.pages.dev](https://tookoo.pages.dev)**

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) version **18** or later
- [Git](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/bayurkp/tookoo.git
cd tookoo

# 2. Install dependencies
npm install

# 3. (Optional) Copy environment file
cp .env.example .env

# 4. Start the development server
npm run dev
```

The app runs at **http://localhost:5173** — open it in your browser.

### Available Commands

| Command | Description |
|:--|:--|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Check for TypeScript errors |
| `npm run lint` | Run linter (OxLint) |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |

---

## Free Deployment

Tookoo is a **static site** — it requires no backend server. You can host it **100% free** on several platforms. This guide uses **Cloudflare Pages**, which offers unlimited bandwidth and a global CDN.

### Option A: Deploy via Cloudflare Dashboard (No Terminal Required)

Best for non-technical users who are not familiar with the command line.

#### Step 1 — Create an Account

1. Go to [cloudflare.com](https://www.cloudflare.com/) and click **Sign Up** (free).
2. Verify your email.

#### Step 2 — Fork the Repository

1. Go to [github.com/bayurkp/tookoo](https://github.com/bayurkp/tookoo).
2. Click the **Fork** button in the top-right corner to copy the repository to your GitHub account.

#### Step 3 — Create a Cloudflare Pages Project

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left sidebar, select **Workers & Pages**.
3. Click **Create** → select the **Pages** tab → **Connect to Git**.
4. Connect your GitHub account and select the **tookoo** repository you forked.
5. Configure the build settings:

   | Setting | Value |
   |:--|:--|
   | **Framework preset** | `None` |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Node.js version** | `18` (or later) |

6. Click **Save and Deploy**.

#### Step 4 — Done! 🎉

Within 1–2 minutes, your Tookoo instance will be live at:

```
https://<your-project-name>.pages.dev
```

Every time you push changes to GitHub, Cloudflare will automatically build and deploy the latest version.

---

### Option B: Deploy via Terminal (Wrangler CLI)

For developers comfortable with the command line.

```bash
# 1. Log in to Cloudflare
npx wrangler pages login

# 2. Build the application
npm run build

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=tookoo
```

---

### Option C: Alternative Platforms

Tookoo can also be deployed for free on other platforms:

<details>
<summary><strong>Vercel</strong></summary>

1. Go to [vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **New Project** → Import the **tookoo** repository.
3. Framework Preset: `Vite`.
4. Click **Deploy**.

</details>

<details>
<summary><strong>Netlify</strong></summary>

1. Go to [netlify.com](https://www.netlify.com/) and log in with GitHub.
2. Click **Add new site** → **Import an existing project**.
3. Select the **tookoo** repository.
4. Build command: `npm run build`, Publish directory: `dist`.
5. Click **Deploy site**.

</details>

<details>
<summary><strong>GitHub Pages</strong></summary>

1. In your GitHub repository, go to **Settings** → **Pages**.
2. Source: **GitHub Actions**.
3. Create a workflow file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

</details>

---

### Using a Custom Domain (Optional)

If you own a domain (e.g., `pos.mystore.com`):

1. In Cloudflare Pages → your project → **Custom domains**.
2. Click **Set up a custom domain**.
3. Enter your domain and follow the DNS instructions.

---

## Architecture

### Tech Stack

| Layer | Technology |
|:--|:--|
| **Framework** | React 19, TypeScript (Strict Mode) |
| **Build Tool** | Vite |
| **Architecture** | Bulletproof React — Feature-Based Modular |
| **State Management** | Zustand (UI State) + TanStack Query v5 (DB Cache) |
| **Local Database** | Dexie.js (IndexedDB) |
| **Styling** | Tailwind CSS + shadcn/ui + Lucide Icons |
| **P2P Networking** | WebRTC DataChannel (LAN + Google STUN) |
| **Forms & Validation** | React Hook Form + Zod |
| **Routing** | React Router v7 (Lazy-loaded) |
| **PWA** | vite-plugin-pwa (Service Worker) |
| **Testing** | Vitest + React Testing Library + Playwright |

### Data Flow

```
User Interaction (UI)
  ↓ triggers action    →  Zustand Store / TanStack Mutation
  ↓ calls API layer    →  Dexie.js Repository (Local DB Mutation)
  ↓ broadcasts event   →  WebRTC P2P DataChannel (to connected peers)
  ↑ mutates IndexedDB  →  Dexie reactive write (0ms latency)
  ↑ invalidates query  →  TanStack Query refetch from Dexie
  ↑ UI re-renders      →  Component updates with zero lag
```

### Project Structure

```
src/
├── app/              # Application layer (pages, router, providers)
├── components/       # Shared UI components (shadcn/ui model)
├── config/           # Environment & global config
├── features/         # Feature modules (cashier, products, orders, sync)
│   ├── cashier/      #   Cashier terminal & transactions
│   ├── products/     #   Product catalog & inventory
│   ├── orders/       #   Sales history & receipts
│   ├── settings/     #   Store settings
│   └── sync/         #   P2P pairing & synchronization
├── hooks/            # Shared React hooks
├── lib/              # Configured libraries (db, query-client, webrtc)
├── locales/          # i18n dictionaries (id, en)
├── stores/           # Global Zustand stores
├── types/            # Shared TypeScript types
└── utils/            # Pure utility functions
```

### Data Models

All entities use **UUID v4** (no auto-increment to avoid ID collisions across devices) and include 3 audit timestamps:

```typescript
interface Product {
  id: string;          // UUID v4
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: number;   // Timestamp ms — creation time
  updatedAt: number;   // Timestamp ms — last modification time
  deletedAt: number | null; // null = active, timestamp = soft-deleted
}

interface Order {
  id: string;
  orderNumber: string; // e.g., "TKD-001"
  items: Array<{
    productId: string;
    name: string;
    price: number;
    qty: number;
    subtotal: number;
  }>;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
  cashierName: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}
```

---

## Environment Variables

| Variable | Required | Description |
|:--|:--|:--|
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth Client ID for Google Drive backup feature |

Copy `.env.example` to `.env` and fill in as needed.

---

## Contributing

Contributions are welcome! Feel free to open an **Issue** or submit a **Pull Request**.

1. Fork this repository.
2. Create a feature branch: `git checkout -b feat/new-feature`.
3. Commit your changes: `git commit -m "feat: add new feature"`.
4. Push to your branch: `git push origin feat/new-feature`.
5. Open a Pull Request.

Make sure your code passes all checks before submitting a PR:

```bash
npm run typecheck && npm run lint && npm run format:check
```

---

## License

Made with ❤️ for Indonesian small businesses.

---

<p align="center">
  <strong>Tookoo</strong> — <em>"Tuku di Toko"</em><br/>
  Smart, Fast, and Self-Sovereign POS.
</p>
