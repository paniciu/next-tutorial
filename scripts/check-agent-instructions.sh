#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

for file in "$ROOT_DIR/CLAUDE.md" "$ROOT_DIR/AGENTS.md" "$ROOT_DIR/.github/copilot-instructions.md"; do
  if ! grep -q "BEGIN SHARED RULES" "$file"; then
    echo "Missing shared rules block in: $file" >&2
    exit 1
  fi

  if ! grep -q "docs/requirements.md" "$file"; then
    echo "Missing requirements reference in: $file" >&2
    exit 1
  fi
done

echo "Agent instruction files look structurally valid"
