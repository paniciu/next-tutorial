# AGENTS.md

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
<!-- END SHARED RULES -->

Shared instructions for all coding agents working in this repository.

## Agent-specific notes

- Use small, explainable modules.
- Update docs together with behavior changes.
- Do not introduce undocumented external dependencies.
- Review integration docs whenever a new external service appears.
