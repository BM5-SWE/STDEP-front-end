# STDEP Frontend

Frontend application for the Smart Trend Driven E-commerce Pilot (STDEP) project.

Built with **Next.js 16**, **React 19**, and **TypeScript**, this modern SPA provides:
- User authentication (login/signup)
- Dashboard with analytics views
- Forecast, history, and margins data visualization

## Quick Start

### Prerequisites

- **Node.js 18+** (check with `node --version`)
- **npm 9+** (comes with Node.js)
- **Backend running** on http://localhost:8000 (see `../STDEP-back-end` README)

### Setup

1. **Clone and navigate to the frontend folder:**
   ```powershell
   cd STDEP-front-end/stdep-frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **(Optional) Environment configuration:**
   - Create a `.env.local` file if you need custom backend URLs:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000
     ```
   - By default, the app assumes the backend is at `http://localhost:8000`

### Running the Development Server

```powershell
npm run dev
```

The app will be available at **http://localhost:3000**

Open http://localhost:3000 in your browser. Hot-reload is enabled—changes will reflect instantly.

### Project Structure

```
stdep-frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── (auth)/                 # Auth route group
│   │   ├── page.tsx            # Auth redirect
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page
│   └── dashboard/              # Dashboard route group
│       ├── layout.tsx          # Dashboard layout
│       ├── page.tsx            # Dashboard home
│       └── (tabs)/             # Tab-based views
│           ├── forecast/page.tsx
│           ├── history/page.tsx
│           └── margins/page.tsx
├── public/                     # Static assets
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
└── README.md
```

### Key Pages

| Route | Purpose |
|-------|---------|
| `/` | Home/Landing page |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | Main analytics dashboard |
| `/dashboard/forecast` | Sales forecast view |
| `/dashboard/history` | Historical data view |
| `/dashboard/margins` | Margin analysis view |

### Available Scripts

```powershell
# Start dev server with hot-reload
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run linter
npm run lint
```

### Building for Production

1. **Build the application:**
   ```powershell
   npm run build
   ```

2. **Start the production server:**
   ```powershell
   npm start
   ```

The optimized build will be available at http://localhost:3000

### Troubleshooting

**"Cannot find module" errors**
- Delete `node_modules` and reinstall:
  ```powershell
  rm -r node_modules
  npm install
  ```

**Port 3000 already in use**
- Use a different port:
  ```powershell
  npm run dev -- -p 3001
  ```

**Backend API calls failing / 404 errors**
- Ensure the backend is running on http://localhost:8000
- Check the browser console (F12) for network errors
- Verify `.env.local` has the correct `NEXT_PUBLIC_API_URL`

**TypeScript errors in editor**
- Restart the dev server or your IDE
- Ensure `typescript` is installed: `npm install typescript`

### Development Tips

- **Hot Module Replacement (HMR)** enabled by default; edits to `*.tsx`/`*.ts` files reload instantly.
- **TypeScript** enforced; run `npm run lint` to check for issues.
- **Tailwind CSS** is pre-configured for utility-first styling.
- Use **browser DevTools** (F12) to inspect network calls and debug authentication tokens.

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and safe for non-sensitive values.

### Team Notes

- The frontend expects the backend API to be running and accessible.
- Authentication tokens are stored in `localStorage` after login.
- Ensure both frontend and backend are running for full functionality.
- If you modify API endpoints in the backend, update the fetch URLs in login/signup pages accordingly.

### Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)

