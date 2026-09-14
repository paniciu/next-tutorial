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
- Chat message ownership is split by phase: while a reply streams, messages belong to `useChat`; after stream completion, the global store keeps the persisted archive (profile, provider settings, conversation list with messages).
- Theme state does not live in the global store; it is managed by the dedicated `ThemeProvider` context (`createContext` + `useContext`).
- Theme preference persistence uses its own localStorage key: `skillforge-theme`, separated from the app store key (`skillforge-app`).
- Store reads must use selectors (for example `useAppStore(state => state.selectedProvider)`), never `useAppStore()` + destructuring.
- Selectors must not create new objects per call unless shallow comparison is explicitly used.
- Any persisted state shape change requires `version` + `migrate` in the persisted store config.
- LLM provider calls are allowed only from server routes/actions, never directly from browser components.
- System prompt persona/guardrails must be composed only on the server, only in `src/lib/system-prompt.ts`; duplicating persona composition elsewhere is an error.
- Any data received from the browser must be normalized server-side before it is interpolated into prompts.
- Message transformations must live in `src/lib/message-utils.ts` as pure functions (no store access, no DOM APIs, no network calls).
- Text extraction from chat messages must exist in one single project location and be reused by UI + exports.
- Product UI rule: never introduce a global action bar above the conversation area; message actions stay on message hover, export stays in header menu, new chat stays in sidebar.
- Manual edits under `src/components/ui/` are generally forbidden, except `src/components/ui/sonner.tsx` where the toaster must consume the app theme context (documented shadcn exception).
- Every external integration must include `docs/<integration>/README.md` with manual setup, environment variables, dashboard configuration, pricing, and official links.
- Every external integration must also update `docs/README.md` in the same commit with the integration name, the course step, and the new documentation link.

## Security Rule: Content from Model is User Input (Phase 1D, 2026-09-14)

⚠️ **Content from the LLM response must be treated as untrusted user input.**

- HTML rendering from model responses is **strictly forbidden**. `dangerouslySetInnerHTML` is **NOT ALLOWED** on any model-sourced data.
- Markdown rendering must be centralized in **one component only**: `src/components/chat/markdown.tsx`. This is the single entry point for rendering model output.
- The Markdown component rejects HTML plugins and uses React components for all markdown elements (headers, lists, tables, links).
- Syntax highlighting from `highlight.js` is the only exception where `dangerouslySetInnerHTML` is used, because the HTML is generated internally, not interpolated from model output.
- All links in rendered content must include `target="_blank"` and `rel="noopener noreferrer"` to prevent XSS via `window.opener`.
- Incomplete Markdown (unclosed code fences, partial tables) must not throw errors — remark parses best-effort to support streaming responses.
- Every new content-rendering integration (API responses, user input, model output) must be audited for XSS vectors.

**Rationale**: The classic attack vector in chat applications is `<img onerror=...>` written by the model or injected into the model from external documents, becoming XSS in your app. Strict content treatment is the primary defense.

## Architecture Rule: Provider Abstraction and SDK Location (Phase 1D, 2026-09-14)

⚠️ **Provider selection and SDK instantiation follow strict rules to scale cleanly across multiple LLM providers.**

- `src/lib/providers.ts` reaches the browser and **must NOT touch `process.env` or API keys**. It defines only: `PROVIDER_REGISTRY` (list of providers + models), `DEFAULT_PROVIDER_ID`, helpers to format labels.
- All provider credentials, SDK instantiation, and availability checks live in `src/lib/providers.server.ts` (server-only).
- `getModel(providerId, modelId)` in `providers.server.ts` is the **single source of truth** for SDK instantiation. It validates `modelId` against the registry and falls back to the provider's default if invalid.
- `isProviderConfigured(providerId)` checks if an API key exists; it returns a boolean, never the key itself or a string value from the browser.
- Each API key is accessed exactly once in the switch in `providers.server.ts`, never elsewhere.
- Provider status (available/not available + reason) is fetched server-side via `GET /api/providers` and sent to the UI as data to display, never as a boolean computed in the browser.
- The chat input sends `providerId` and `modelId` with each message; the server validates both before calling `getModel()`.
- A provider missing a configured key returns a clear 400 error (not 503 or 500), e.g.: "Provider OpenAI not configured: OPENAI_API_KEY is not set."
- No if-statements on `providerId` exist outside `providers.server.ts`. All routing between providers happens in the switch inside `getModel()`.

**Rationale**: This pattern ensures adding a second provider touches exactly one production file (`providers.server.ts`), not chat-input, settings, or routes. The registry drives the UI; abstraction scales to N providers with linear cost.

<!-- END SHARED RULES -->

Shared instructions for all coding agents working in this repository.

## Skills convention

- Skill source of truth: .claude/skills/
- Copilot mirror: .github/skills/
- Keep mirrors synchronized with sh scripts/sync-skills.sh.
- Validate synchronization with sh scripts/sync-skills.sh --check.

## Definition of done before publish

- Run skill pre-deploy before each publish.
- Run sh scripts/sync-agent-instructions.sh after agent-instruction edits.

## Agent-specific notes

- Use small, explainable modules.
- Update docs together with behavior changes.
- Do not introduce undocumented external dependencies.
- Review integration docs whenever a new external service appears.
