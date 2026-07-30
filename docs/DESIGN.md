# Maneza CoachOS — Mintlify Design System

> This DESIGN.md defines the visual language for all Maneza client apps (web, staff, student, admin).
> Based on the Mintlify design system specification.

## Overview

The design system combines cinematic atmospheric heroes with developer-grade information density.
- **Inter** for all UI prose; **Geist Mono** for code/mono content
- Signature **Mintlify mint green** (#00D4A4) for accent CTAs and active states
- Black-pill primary buttons with `rounded-full`
- Flat cards with `rounded-lg` (12px) and 1px hairline borders

## Portals

| Portal | Port | Auth Endpoint | Login |
|---|---|---|---|
| `apps/admin` | 5174 | `POST /auth/super-admin/login` | Super Admin |
| `apps/web` | 5173 | `POST /auth/login` | Institute Owner |
| `apps/staff` | 5175 | `POST /auth/staff/login` | Staff/Teacher/Accountant |
| `apps/student` | 5176 | `POST /auth/student/login` | Student |

## Shared Package

`packages/ui` contains:
- `api.ts` — Axios client factory with interceptors
- `auth.store.ts` — Zustand auth store factory
- `RouteGuards.tsx` — Protected/PublicOnly route components
- `styles/tokens.css` — Complete Mintlify design tokens

All apps import: `@coachos/ui`
