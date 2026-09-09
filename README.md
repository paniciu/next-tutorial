# SkillForge

SkillForge is a personal AI copilot for skills and career growth.

This repository contains the Next.js application used in the SkillForge course flow.

## Current status

- Product requirements live in docs/requirements.md.
- The App Router, Tailwind v4, TypeScript, ESLint, shadcn/ui, and formatting baseline are in place.
- LLM chat streaming runs server-side, with provider keys kept outside source code.
- Deploy flow targets Vercel Preview per branch and Production on `main`.

## Public links

- Production (shareable): [ADD-PRODUCTION-URL](https://ADD-PRODUCTION-URL)
- Vercel project setup and redeploy workflow: [docs/vercel/README.md](docs/vercel/README.md)

> Replace `ADD-PRODUCTION-URL` right after the first successful production deploy.

## Key documents

- Product requirements: [docs/requirements.md](docs/requirements.md)
- Documentation index: [docs/README.md](docs/README.md)
- Agent conventions: [AGENTS.md](AGENTS.md)
- Claude instructions: [CLAUDE.md](CLAUDE.md)
- Copilot instructions: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Integration doc template: [docs/_template/README.md](docs/_template/README.md)

## Scripts

- `npm run dev` — local development server
- `npm run build` — production build check
- `npm run lint` — ESLint validation
- `npm run format` — apply Prettier and Tailwind class ordering
- `npm run format:check` — CI-friendly formatting check
- Sync agent instructions: [scripts/sync-agent-instructions.sh](scripts/sync-agent-instructions.sh)
- Sync skills between Claude/Copilot: [scripts/sync-skills.sh](scripts/sync-skills.sh)
- Validate instruction structure: [scripts/check-agent-instructions.sh](scripts/check-agent-instructions.sh)

## Vite + React vs Next.js

| Topic                 | Vite + React                                        | Next.js                                                                       |
| --------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| Routing               | Usually added with a separate router library        | Built into the App Router through folders in `src/app`                        |
| Where code runs       | Mostly browser-side unless you add your own backend | Client and server code live in the same repo with explicit boundaries         |
| Environment variables | Client-facing values commonly use `VITE_*`          | Only `NEXT_PUBLIC_*` reaches the browser; server-only secrets stay unprefixed |
| Deploy                | Frontend deploy plus separate backend/API choices   | One framework can ship pages, server logic, and route handlers together       |

## Running the project

1. Copy [.env.example](.env.example) values into `.env.local` if you need to reset local variables.
2. Run `npm run dev`.
3. Open `http://localhost:3000` for `/` and `http://localhost:3000/demo` for the extra route.

## Pre-deploy check (quick)

Before each publish, run the checklist from [docs/vercel/README.md](docs/vercel/README.md) and [pre-deploy skill](.claude/skills/pre-deploy/SKILL.md).
