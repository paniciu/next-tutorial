#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SOURCE_DIR="$ROOT_DIR/.claude/skills"
TARGET_DIR="$ROOT_DIR/.github/skills"
MODE="sync"

if [ "${1:-}" = "--check" ]; then
  MODE="check"
elif [ -n "${1:-}" ]; then
  echo "Unknown argument: $1" >&2
  echo "Usage: sh scripts/sync-skills.sh [--check]" >&2
  exit 1
fi

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Missing source skills directory: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

source_found=0

for source_file in "$SOURCE_DIR"/*/SKILL.md; do
  if [ ! -f "$source_file" ]; then
    continue
  fi

  source_found=1
  skill_name=$(basename "$(dirname "$source_file")")
  target_file="$TARGET_DIR/$skill_name/SKILL.md"

  if [ "$MODE" = "check" ]; then
    if [ ! -f "$target_file" ]; then
      echo "Missing mirrored skill: $target_file" >&2
      exit 1
    fi

    if ! cmp -s "$source_file" "$target_file"; then
      echo "Skill out of sync: $skill_name" >&2
      exit 1
    fi
  else
    mkdir -p "$(dirname "$target_file")"
    cp "$source_file" "$target_file"
  fi
done

if [ "$source_found" -eq 0 ]; then
  echo "No skill files found under: $SOURCE_DIR" >&2
  exit 1
fi

if [ "$MODE" = "check" ]; then
  for target_file in "$TARGET_DIR"/*/SKILL.md; do
    if [ ! -f "$target_file" ]; then
      continue
    fi

    skill_name=$(basename "$(dirname "$target_file")")
    source_file="$SOURCE_DIR/$skill_name/SKILL.md"

    if [ ! -f "$source_file" ]; then
      echo "Orphan mirrored skill (missing source): $target_file" >&2
      exit 1
    fi
  done

  echo "Skill files are synchronized"
else
  echo "Synchronized skills from .claude/skills to .github/skills"
fi
