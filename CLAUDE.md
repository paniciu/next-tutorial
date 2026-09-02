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
- When an external service appears, start its notes from `docs/_template/README.md` and never place real secrets outside `.env.local`.
