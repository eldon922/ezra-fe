# Ezra Frontend (ezra-fe)

A **Next.js 14** application powering the frontend for the Ezra transcription/proofreading
platform.  This repo contains the UI, API routes, and client-side logic used by administrators
and users to interact with the backend services.

---

## 🚀 Features

- Admin dashboard for managing users, prompts, and transcriptions
- Authentication via NextAuth.js with customizable providers
- Server‑side API routes for proxying requests to the backend
- Tailwind CSS and Radix UI components for a responsive design
- Dark/light theme toggle with system preference support
- Modular architecture with contexts, hooks, and reusable UI components

---

## 🧱 Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+ or Yarn
- [pnpm](https://pnpm.io/) is also supported
- A running instance of the Ezra backend (`ezra-be`)

---

## ⚙️ Environment Variables

Set the following in your `.env.local` (see project secrets manager for values):

| Variable            | Description                                    |
|---------------------|------------------------------------------------|
| `BACKEND_URL`       | Base URL of the Ezra backend API               |
| `NEXTAUTH_URL`      | URL where this frontend is served              |
| `NEXTAUTH_SECRET`   | Secret used by NextAuth for signing cookies    |

> **Tip:** use `npx next env pull` (or your preferred secrets manager) to keep
> your local `.env` files in sync with the deployed environment.

---

## 🛠️ Development

```bash
# install dependencies
npm install

# run dev server
npm run dev
```

- Open <http://localhost:3000> to view the app
- Graphical components live‑reload on change
- API routes available under `/api/*`

---

## 🧪 Testing

Currently there are no automated tests in this repository.  Please open an issue or
submit a PR if you would like to add Jest/Playwright/XState tests in the future.

---

## 📦 Production Build

```bash
npm run build
npm run start         # starts Next.js in production mode
```

This will produce a `.next` directory with optimized assets. The application
can be served with `next start`, or deployed to platforms like Vercel, DigitalOcean,
or any Node.js host.

---

## 📡 Deployment Notes

The following commands are commonly used on the production server (Ubuntu):

```bash
cd /var/www/ezra-fe
git checkout main
git pull
npm install --legacy-peer-deps
npm run build
pm2 restart ezra-fe
pm2 logs
```

**Nginx configuration** (example):

```nginx
server {
  listen 80;
  server_name transcript.griibandung.org www.transcript.griibandung.org;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Enable and test:

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo ln -s /etc/nginx/sites-available/transcript.griibandung.org /etc/nginx/sites-enabled/
```

Generate certificates with Certbot:

```bash
sudo certbot --nginx -d transcript.griibandung.org -d www.transcript.griibandung.org
```

---

## 🗂️ Project Structure (high-level)

```
src/
├─ app/                  # Next.js /app router pages and layouts
│  ├─ admin/             # admin section with nested routes
│  ├─ api/               # serverless API route implementations
│  ├─ components/        # shared UI components & providers
│  ├─ context/           # React contexts (e.g. Auth)
│  └─ hooks/             # custom hooks
├─ lib/                  # utility functions
└─ types/                # global TypeScript types
```

---

## 🤝 Contributing

1. Fork the repo and create a feature branch
2. Commit with clear messages
3. Open a pull request against `main`

Please follow conventional commits and include screenshots or steps to reproduce
issues when applicable.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.