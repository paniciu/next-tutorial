# Copilot Instructions

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
- Every external integration must include `docs/<integration>/README.md` with manual setup, environment variables, dashboard configuration, pricing, and official links.
- Every external integration must also update `docs/README.md` in the same commit with the integration name, the course step, and the new documentation link.

<!-- END SHARED RULES -->

These instructions apply to GitHub Copilot and related coding agents in this repository.

## Agent-specific notes

- Review docs/requirements.md before implementing features.
- Prefer implementations that support the course progression.
- Keep examples safe for local development and deployment.
- Confirm external integration docs exist when relevant.
