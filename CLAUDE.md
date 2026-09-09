# CLAUDE.md

<!-- BEGIN SHARED RULES -->

# Shared Agent Rules

- `docs/requirements.md` is the canonical product requirements file.
- Update `docs/requirements.md` first when scope or terminology changes.
- `README.md` must stay short and act as a navigation document.
- Requirements are written in Romanian.
- Agent instructions are written in English.
- SkillForge is an agent-first product with server-side LLM access, streaming, persistent profile context, and memory across sessions.
- Never commit or document real secrets.
- All provider and credential access must remain server-side.
- Chat message state belongs to `useChat` in UI components; global store keeps only shell state (profile, settings, conversation summaries).
- LLM provider calls are allowed only from server routes/actions, never directly from browser components.
- System prompt persona/guardrails must be composed only on the server, only in `src/lib/system-prompt.ts`; duplicating persona composition elsewhere is an error.
- Any data received from the browser must be normalized server-side before it is interpolated into prompts.
- Message transformations must live in `src/lib/message-utils.ts` as pure functions (no store access, no DOM APIs, no network calls).
- Text extraction from chat messages must exist in one single project location and be reused by UI + exports.
- Product UI rule: never introduce a global action bar above the conversation area; message actions stay on message hover, export stays in header menu, new chat stays in sidebar.
- Every external integration must include `docs/<integration>/README.md` with manual setup, environment variables, dashboard configuration, pricing, and official links.
- Every external integration must also update `docs/README.md` in the same commit with the integration name, the course step, and the new documentation link.

<!-- END SHARED RULES -->

This file defines repository-level instructions for AI agents working on SkillForge.

## Agent-specific notes

- Use this file as a top-level instruction reference.
- For product scope, defer to docs/requirements.md.
- For cross-agent workflow, also check AGENTS.md.
- Prefer modular, explainable implementation steps.
- Keep server and client responsibilities clearly separated.
