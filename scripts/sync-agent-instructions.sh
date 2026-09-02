#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SHARED_FILE="$ROOT_DIR/scripts/templates/agent-shared.md"
CLAUDE_FILE="$ROOT_DIR/CLAUDE.md"
AGENTS_FILE="$ROOT_DIR/AGENTS.md"
COPILOT_FILE="$ROOT_DIR/.github/copilot-instructions.md"

if [ ! -f "$SHARED_FILE" ]; then
  echo "Missing shared rules file: $SHARED_FILE" >&2
  exit 1
fi

shared_block=$(cat "$SHARED_FILE")

write_file() {
  target_file="$1"
  header="$2"
  body="$3"

  cat > "$target_file" <<EOF
$header

<!-- BEGIN SHARED RULES -->
$shared_block
<!-- END SHARED RULES -->

$body
EOF
}

write_file "$CLAUDE_FILE" "# CLAUDE.md" "This file defines repository-level instructions for AI agents working on SkillForge.

## Agent-specific notes

- Use this file as a top-level instruction reference.
- For product scope, defer to docs/requirements.md.
- For cross-agent workflow, also check AGENTS.md.
- Prefer modular, explainable implementation steps.
- Keep server and client responsibilities clearly separated."

write_file "$AGENTS_FILE" "# AGENTS.md" "Shared instructions for all coding agents working in this repository.

## Agent-specific notes

- Use small, explainable modules.
- Update docs together with behavior changes.
- Do not introduce undocumented external dependencies.
- Review integration docs whenever a new external service appears."

write_file "$COPILOT_FILE" "# Copilot Instructions" "These instructions apply to GitHub Copilot and related coding agents in this repository.

## Agent-specific notes

- Review docs/requirements.md before implementing features.
- Prefer implementations that support the course progression.
- Keep examples safe for local development and deployment.
- Confirm external integration docs exist when relevant."

echo "Synchronized CLAUDE.md, AGENTS.md, and .github/copilot-instructions.md"
