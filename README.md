# NexusAI Frontend

> Enterprise RAG Knowledge System — React Frontend

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)

**Live App:** https://nexusai-frontend-nine.vercel.app  
**Backend:** https://github.com/Junead04/nexusai-backend  
**Live API:** https://nexusai-backend-production-f2e2.up.railway.app

---

## What is NexusAI?

NexusAI is a full-stack enterprise RAG (Retrieval-Augmented Generation) system. This is the React frontend — a clean, professional UI where employees can log in, ask questions in natural language, and get AI-powered answers from company documents, filtered by their role and department access.

---

## Features

- **Chat Interface** — Real-time AI responses with source citations, latency, token count, and sentiment badges
- **Role-Based Dashboard** — Sidebar adapts to the logged-in user's role and departments
- **Voice Input** — Click the mic button and speak your question (Chrome/Edge)
- **Multi-language** — Switch between English, Hindi, and Tamil (EN/HI/TA)
- **Google SSO** — One-click sign-in with Google account
- **Document Management** — Upload and view department documents (role permitting)
- **Analytics Page** — Usage stats and query history
- **Light Lavender Theme** — Professional, clean UI with frosted glass cards
- **Responsive** — Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| State Management | Zustand |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Markdown Rendering | react-markdown |
| Deployment | Vercel |

---

## Project Structure

```
nexusai-frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx       # Login + Google SSO + demo accounts
│   │   ├── ChatPage.jsx        # Main chat interface + voice input
│   │   ├── DocumentsPage.jsx   # Upload + view documents
│   │   ├── AnalyticsPage.jsx   # Usage statistics
│   │   └── AuditPage.jsx       # Query audit trail (admin)
│   ├── components/
│   │   └── layout/
│   │       └── DashboardLayout.jsx  # Sidebar + topbar + nav
│   ├── store/
│   │   └── useStore.js         # Zustand auth + chat + lang stores
│   ├── utils/
│   │   ├── api.js              # Axios instance + all API calls
│   │   └── i18n.js             # EN/HI/TA translations
│   ├── App.jsx                 # Routes + auth guard
│   └── main.jsx                # React entry point
├── public/
│   └── hero-person.png         # Login page hero image
├── .env.local                  # Local dev env vars (not committed)
├── .env.production             # Production env vars (committed)
└── package.json
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- The backend running locally (see [nexusai-backend](https://github.com/Junead04/nexusai-backend))

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Junead04/nexusai-frontend.git
cd nexusai-frontend

# 2. Install dependencies
npm install

# 3. Create local env file
echo "VITE_API_URL=http://localhost:8000" > .env.local

# 4. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

> Make sure the backend is running on port 8000 before starting the frontend.

---

## Environment Variables

**For local development** — create `.env.local`:
```env
VITE_API_URL=http://localhost:8000
```

**For production** — `.env.production` (already committed):
```env
VITE_API_URL=https://nexusai-backend-production-f2e2.up.railway.app
```

---

## Demo Accounts

Click any account on the login page to auto-fill credentials:

| Name | Role | What they can see |
|---|---|---|
| Alex Chen | Account Admin | Everything |
| Priya Sharma | HR Manager | HR + General docs |
| Rahul Gupta | Finance Analyst | Finance + General docs |
| Sneha Patel | Marketing Manager | Marketing + General docs |
| Arjun Nair | Engineer | Engineering + General docs |
| Meera Iyer | Employee | General docs only |

---

## Pages

### Login Page
- Email/password login
- Google SSO button
- Demo account quick-select table
- Hero section with feature cards

### Chat Page
- Natural language question input
- AI responses with formatted markdown
- Source document citations with department badges
- Latency, token count, and model used (8B vs 70B)
- Sentiment indicator (positive/neutral/negative)
- Voice input (mic button)
- Suggestion chips for first-time users
- Clear chat button

### Documents Page
- Upload new documents (PDF, DOCX, TXT, MD, CSV)
- Select department for the document
- View all indexed documents filtered by your role

### Analytics Page
- Total queries and responses
- Department usage breakdown
- Response time trends

---

## Deployment on Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Import project at vercel.com

# 3. Add environment variable in Vercel dashboard:
#    VITE_API_URL = https://your-railway-url.up.railway.app

# 4. Deploy — Vercel auto-deploys on every push to main
```

---

## Key Implementation Details

**Auth persistence** — Zustand with localStorage persistence. On page refresh, the user stays logged in. On logout or login as a different user, chat history is completely cleared to prevent data leaks between accounts.

**Hydration guard** — A `_hasHydrated` flag prevents the auth redirect from flickering on page load while Zustand reads from localStorage.

**Voice recognition** — Uses Web Speech API with `en-IN` (Indian English) language setting, continuous mode, and interim results for real-time feedback. Works on Chrome and Edge only.

**VITE_API_URL** — Baked into the JS bundle at build time by Vite. Changing it in Vercel requires a redeploy to take effect.

---

## Author

**Junead** — [GitHub](https://github.com/Junead04) · [LinkedIn](https://linkedin.com/in/junead04)

---

## License

MIT License — free to use and modify.
