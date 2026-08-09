# Abdul Nabi Portfolio

Premium personal portfolio built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**, featuring a dark glassmorphism design system throughout.

## Features

- Glass / blur-glass UI across navbar, cards, forms, blog, and chatbot
- Homepage sections: Hero, About, Skills, Projects, Experience, Education, Contact
- Blog listing + dynamic `[slug]` article pages from mock data
- Floating chatbot widget (`/api/chat`) with OpenAI-ready helper + local mock fallback
- Contact form API scaffold (`/api/contact`)
- Reusable UI primitives under `components/ui/`
- SEO metadata, semantic HTML, and accessible controls
- Mobile-first responsive layout

## Getting started

```bash
cd abdul-nabu-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Optional | Real chatbot replies via OpenAI. Without it, a local mock reply is used. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL (placeholder client). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key (placeholder client). |

### Optional packages (not installed by default)

```bash
# When wiring real Supabase
npm install @supabase/supabase-js

# When preferring the official OpenAI SDK over fetch
npm install openai
```

`lib/supabase.ts` and `lib/openai.ts` include comments showing how to swap in the real clients.

## Project structure

```
abdul-nabu-portfolio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── api/
│       ├── chat/route.ts
│       └── contact/route.ts
├── components/
│   ├── sections/          # Hero, About, Skills, Projects, etc.
│   ├── ui/                # GlassCard, Button, Badge, Input, ...
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── chatbot.tsx
│   └── blog-card.tsx
├── data/
│   └── content.ts         # All mock portfolio + blog content
└── lib/
    ├── supabase.ts
    ├── openai.ts
    └── utils.ts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Customization

1. Edit **`data/content.ts`** for name, copy, projects, experience, education, and blog posts.
2. Adjust accent colors and glass tokens in **`tailwind.config.ts`** and **`app/globals.css`**.
3. Connect contact submissions in **`app/api/contact/route.ts`** (email provider or Supabase).
4. Add `OPENAI_API_KEY` for live chatbot answers grounded in your system prompt in **`lib/openai.ts`**.

## License

Private / personal use. Update as needed.
