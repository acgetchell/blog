# shellcheck disable=SC2148
# Justfile for blog development workflow
# Install just: https://github.com/casey/just
# Usage: just <command> or just --list

set shell := ["bash", "-euo", "pipefail", "-c"]

action-lint:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v actionlint >/dev/null; then
        echo "⚠️ 'actionlint' not found. Install: brew install actionlint"
        exit 0
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
    if ! command -v uvx >/dev/null; then
        echo "❌ 'uvx' not found. Install uv (includes uvx): brew install uv"
        exit 1
    fi

    # Exclude content/_index.md because it is pure Zola TOML front matter (with TOML comments).
    uvx --from pymarkdownlnt pymarkdown --disable-rules MD041,MD013,MD025 scan -r -e content/_index.md content

serve:
    zola serve

spell:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v uvx >/dev/null; then
        echo "❌ 'uvx' not found. Install uv (includes uvx): brew install uv"
        exit 1
    fi

    uvx --from codespell codespell \
        --config .codespellrc \
        -q 3 \
        content templates config.toml

toml-fmt:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v uvx >/dev/null; then
        echo "❌ 'uvx' not found. Install uv (includes uvx): brew install uv"
        exit 1
    fi

    uvx --from taplo taplo fmt config.toml

toml-fmt-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v uvx >/dev/null; then
        echo "❌ 'uvx' not found. Install uv (includes uvx): brew install uv"
        exit 1
    fi

    uvx --from taplo taplo fmt --check config.toml

toml-lint:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v uvx >/dev/null; then
        echo "❌ 'uvx' not found. Install uv (includes uvx): brew install uv"
        exit 1
    fi

    uvx --from taplo taplo lint config.toml
