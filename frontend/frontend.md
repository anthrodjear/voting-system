# Frontend Architecture

## Overview

The frontend is built with React/Next.js for voters, admins, and RO dashboards.

---

## 1. Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 / Next.js 14 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| HTTP | TanStack Query |
| Forms | React Hook Form + Zod |
| Biometrics | WebAssembly SDKs |

---

## 2. Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/           # Auth pages
│   │   ├── (voter)/          # Voter pages
│   │   ├── (admin)/          # Admin pages
│   │   └── api/              # API routes
│   │
│   ├── components/
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── biometric/        # Biometric capture
│   │   └── layout/           # Layout components
│   │
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities
│   ├── services/             # API services
│   ├── stores/               # Zustand stores
│   └── types/                # TypeScript types
│
├── public/
│   └── images/
├── tailwind.config.ts
└── package.json
```
