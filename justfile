# shellcheck disable=SC2148
# Justfile for blog development workflow
# Install just: https://github.com/casey/just
# Usage: just <command> or just --list

set shell := ["bash", "-euo", "pipefail", "-c"]

action-lint:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v actionlint >/dev/null; then
        echo "❌ 'actionlint' not found. Install: brew install actionlint"
        exit 1
    fi

    files=()
    while IFS= read -r -d '' file; do
        files+=("$file")
    done < <(git ls-files -z '.github/workflows/*.yml' '.github/workflows/*.yaml')

    if [ "${#files[@]}" -gt 0 ]; then
        printf '%s\0' "${files[@]}" | xargs -0 actionlint
    else
        echo "No workflow files found to lint."
    fi

build:
    zola build

check:
    zola check

ci: lint check build

lint: action-lint toml-lint toml-fmt-check spell markdown-lint

markdown-lint:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v npx >/dev/null; then
        echo "❌ 'npx' not found. Install Node.js (includes npx): brew install node"
        exit 1
    fi

    MARKDOWNLINT_VERSION="0.47.0"

    files=()
    while IFS= read -r -d '' file; do
        # Exclude content/_index.md because it is pure Zola TOML front matter (with TOML comments).
        if [[ "$file" == "content/_index.md" ]]; then
            continue
        fi
        files+=("$file")
    done < <(git ls-files -z '*.md')

    if [ "${#files[@]}" -gt 0 ]; then
        # Disable some rules to fit Zola-style content:
        # - MD041: Zola posts start with TOML front matter, so the first line is not a heading.
        # - MD013: legacy posts may contain long URLs / inline math that exceed a strict line limit.
        # - MD025: some legacy content may contain multiple H1s.
        npx --yes "markdownlint-cli@${MARKDOWNLINT_VERSION}" --disable MD041 MD013 MD025 -- "${files[@]}"
    else
        echo "No markdown files found to lint."
    fi

serve:
    zola serve

spell:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v npx >/dev/null; then
        echo "❌ 'npx' not found. Install Node.js (includes npx): brew install node"
        exit 1
    fi

    CSPELL_VERSION="9.4.0"
    
    files=()
    while IFS= read -r -d '' file; do
        files+=("$file")
    done < <(git ls-files -z '*.md' '*.toml')
    
    # Add templates directory
    while IFS= read -r -d '' file; do
        files+=("$file")
    done < <(git ls-files -z 'templates/*')
    
    if [ "${#files[@]}" -gt 0 ]; then
        npx --yes "cspell@${CSPELL_VERSION}" --config cspell.json "${files[@]}"
    else
        echo "No files found to spell check."
    fi

toml-fmt:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v taplo >/dev/null; then
        echo "❌ 'taplo' not found. Install: cargo install taplo-cli"
        exit 1
    fi

    files=()
    while IFS= read -r -d '' file; do
        files+=("$file")
    done < <(git ls-files -z '*.toml')

    if [ "${#files[@]}" -gt 0 ]; then
        taplo fmt "${files[@]}"
    else
        echo "No TOML files found to format."
    fi

toml-fmt-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v taplo >/dev/null; then
        echo "❌ 'taplo' not found. Install: cargo install taplo-cli"
        exit 1
    fi

    files=()
    while IFS= read -r -d '' file; do
        files+=("$file")
    done < <(git ls-files -z '*.toml')

    if [ "${#files[@]}" -gt 0 ]; then
        taplo fmt --check "${files[@]}"
    else
        echo "No TOML files found to check."
    fi

toml-lint:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v taplo >/dev/null; then
        echo "❌ 'taplo' not found. Install: cargo install taplo-cli"
        exit 1
    fi

    files=()
    while IFS= read -r -d '' file; do
        files+=("$file")
    done < <(git ls-files -z '*.toml')

    if [ "${#files[@]}" -gt 0 ]; then
        taplo lint "${files[@]}"
    else
        echo "No TOML files found to lint."
    fi

write title:
    #!/usr/bin/env bash
    set -euo pipefail

    if ! command -v code >/dev/null; then
        echo "❌ 'code' CLI not found. In VS Code run: Shell Command: Install \"code\" command in PATH." >&2
        exit 1
    fi

    title="{{title}}"
    if [[ -z "${title// }" ]]; then
        echo "Usage: just write \"My Post Title\"" >&2
        exit 1
    fi
    safe_title=${title//\"/\\\"}

    slug=$(printf '%s' "$title" \
        | iconv -t ascii//TRANSLIT \
        | tr '[:upper:]' '[:lower:]' \
        | tr -cs 'a-z0-9' '-' \
        | sed 's/^-//; s/-$//; s/--*/-/g')
    [[ -z "$slug" ]] && slug="post"

    today=$(date +%Y-%m-%d)
    datetime=$(date +"%Y-%m-%dT%H:%M:%S%z" | sed 's/\([0-9][0-9]\)\([0-9][0-9]\)$/\1:\2/')
    filepath="content/posts/${today}-${slug}.md"

    if [[ ! -f "$filepath" ]]; then
        printf '+++\n' >"$filepath"
        printf 'title = "%s"\n' "$safe_title" >>"$filepath"
        printf 'date = %s\n' "$datetime" >>"$filepath"
        printf 'draft = true\n\n[taxonomies]\ntags = []\n+++\n\nYour markdown content goes here.\n' >>"$filepath"
    fi

    code "$filepath"
