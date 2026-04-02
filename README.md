# InVision U Admission Intelligence Frontend

Web prototype for Decentrathon 5.0 (AI inDrive track).

This application supports the initial screening workflow for inVision U: applicant submission, manager review, analytics, explainable scoring context, and API documentation for committee and engineering teams.

## 1. Project Context

- Client: inDrive / inVision U
- Hackathon: Decentrathon 5.0
- Task: Intelligent Candidate Selection Support System
- Goal: reduce manual screening load while preserving human decision ownership

Core principle implemented in product and UX: AI supports decisions, committee makes final admission decisions.

## 2. What Is Implemented

### Candidate side

- Landing page with product narrative and flow explanation
- Multi-step application form with validation and file upload
- Motivation letter upload and deletion flow
- Submission to backend application forms API
- In-form conversational agent chat endpoint integration

### Committee side

- Manager authentication page
- Protected manager routes for applicants area
- Applicants dashboard with ranking and filters
- Candidate detail view
- Candidate comparison view
- Analytics dashboard for aggregated statistics

### Documentation and API visibility

- Interactive API documentation page
- Request/response examples in curl, JavaScript, and Python
- Dedicated ML Scoring Service section in docs
- Distinct base URL behavior:
  - default docs base URL for core backend: https://fortehack.digital
  - ML endpoints use override base URL: https://admissions-ml-service-production.up.railway.app

## 3. Routing Overview

### Main pages

- `/` landing page
- `/form` candidate application form
- `/auth` manager login
- `/applicants` manager dashboard
- `/applicants/[id]` candidate details
- `/applicants/compare` comparison view
- `/applicants/analytics` analytics view
- `/applications` alias dashboard view
- `/application/[id]` alias detail view
- `/docs` API documentation

### Next.js route handlers (server proxy layer)

- `GET /api/applicants` list forms from backend
- `GET /api/applicants/[id]` form by id
- `POST /api/application` submit form
- `GET /api/analytics` compute aggregate analytics from forms
- `POST /api/chat` proxy to agent reply endpoint
- `POST /api/file` upload file to S3 backend endpoint
- `DELETE /api/file` delete file in S3 backend
- `POST /api/auth/login` manager auth
- `GET /api/auth/session` session status
- `POST /api/auth/logout` session clear

## 4. TOR Alignment

| TOR Requirement                                   | Status in Prototype                                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Analyze candidate applications, texts, interviews | Implemented as integrated flow: structured form data + motivation text/file + agent interaction endpoints             |
| Evaluate by skills, motivation, potential         | Partially implemented in UI and contracts; current dashboard uses backend form data and temporary scoring stub fields |
| Produce recommendation/score/ranking              | Implemented as manager ranking UX and ML scoring API contracts in docs                                                |
| Reduce manual workload                            | Implemented via centralized dashboard, filters, comparisons, and analytics                                            |
| Explainability required                           | Implemented in ML scoring API contract and docs with evidence highlights, review flags, and scoring notes             |
| Human in the loop mandatory                       | Implemented in product copy and flows; no autonomous admission/rejection action in UI                                 |

## 5. Current Technical Scope and Known Limits

- Applicants list/detail currently map backend form responses into UI model and attach temporary scoring placeholders.
- Real ML scoring data is documented and integrated at API contract level but not yet wired into applicant dashboard query response.
- Authentication is credential-based for hackathon demo mode.
- Privacy and bias control are addressed by architecture intent and manual review model; full policy/legal module is outside this prototype scope.

## 6. Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- TanStack Form
- Zod
- Zustand
- GSAP (animations)
- Biome (lint)
- Prettier (format)

## 7. Local Setup

### Prerequisites

- Node.js 20+
- pnpm

### Install

```bash
pnpm install
```

### Environment

Create `.env.local` based on `.env.example`.

```env
API_URL=YOUR_API_URL
ML_API_URL=YOUR_ML_API_URL
CREDENTIALS_LOGIN=admin
CREDENTIALS_PASSWORD=admin1234
```

Environment variables used by current code:

- `API_URL`: backend base URL for form, analytics, chat, and file route handlers
- `CREDENTIALS_LOGIN`: manager login for demo auth
- `CREDENTIALS_PASSWORD`: manager password for demo auth

Note: `ML_API_URL` is reserved for ML integration configuration and documentation context. Current ML docs examples use endpoint-level base URL override.

### Run development server

```bash
pnpm dev
```

Open http://localhost:3000

### Build and run production

```bash
pnpm build
pnpm start
```

## 8. Scripts

- `pnpm dev` start dev server
- `pnpm build` create production build
- `pnpm start` run production server
- `pnpm lint` run Biome checks
- `pnpm format` run Prettier write
- `pnpm format:check` run Prettier check

## 9. Architecture Notes

- App Router pages are thin entry points that mount feature modules.
- Feature modules are grouped by domain in `src/features`.
- Shared UI and libs live in `src/shared`.
- Server route handlers in `src/app/api` provide same-origin proxying and error normalization for frontend.
- Auth uses signed cookie token flow and middleware-like route protection in `src/proxy.ts`.

## 10. Ethics, Fairness, and Responsible AI Position

- AI is decision support only.
- No automatic rejection flow is implemented.
- Explainability is first-class in ML scoring contracts (evidence spans, notes, review flags).
- Committee review remains mandatory for admission decisions.

## 11. Suggested Next Iteration

- Replace applicant scoring stub with real ML scoring response pipeline.
- Persist scoring snapshots and scoring run metadata per candidate.
- Add audit trail for reviewer actions.
- Add anonymization mode for blind review.
- Add evaluation metrics dashboard for model drift and fairness monitoring.

## 12. Demo Checklist

1. Open landing page and review value proposition.
2. Submit a candidate application from `/form`.
3. Log in via `/auth` as manager.
4. Review candidates in `/applicants`.
5. Inspect analytics in `/applicants/analytics`.
6. Compare profiles in `/applicants/compare`.
7. Open `/docs` and inspect core + ML API contracts.
