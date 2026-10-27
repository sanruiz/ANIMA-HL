---
description: Prepare a GitHub release (version bump, changelog, tag/Release) for this Node/npm project
agent: agent
tools:
  - run_in_terminal
  - read_file
  - replace_string_in_file
  - create_file
---

# Prepare GitHub Release

Prepare a new version release and drive it through the **correct GitHub flow**. This repo is a
Node/npm project, so the release follows `release-node.md`; the prompt still analyzes the repo's
GitHub Actions workflows to decide whether a **bare tag** or a full **GitHub Release** is required.

## Prerequisites
- Reference: `.github/prompts/_partials/git-operations.md`
- Reference: `.github/prompts/_partials/release-node.md`
- `gh` CLI authenticated. Releases are a GitHub concept — if the `origin` remote is **not** GitHub
  (e.g. Bitbucket), stop and tell the user this flow does not apply.

## Inputs

Ask the user:
1. **Version type** — `patch`, `minor`, or `major`? (default: patch). Suggest one from the
   `[Unreleased]` changelog content: new features → `minor`, fixes only → `patch`, breaking → `major`.
2. **Changelog entry** — reuse the existing `[Unreleased]` section if present, otherwise offer to
   generate one from `git log` since the last tag.

## Steps

### 1. Detect host and project type

```bash
git remote get-url origin            # must be github.com — else stop
git fetch --tags --quiet
git tag --sort=-v:refname | head -1  # latest tag (current released version)
```

Follow the Node/npm partial:

| Signal | Project type | Use partial |
|--------|--------------|-------------|
| `package.json` (no WP header) | Node / npm | `release-node.md` |
| neither | Generic | inline fallback: bump a `VERSION` file / changelog only |

### 2. Determine the new version

- Read the **current** version from the source of truth named in the matching partial (not just the
  git tag — they can drift).
- Apply the bump type to compute `X.Y.Z`.
- **NEVER reuse an existing tag** — tags are immutable. If `vX.Y.Z` already exists, bump again.

### 3. Run quality checks (per partial)

Run the checks from `release-node.md` (`npm test` +
lint/type-check/build). **Do not proceed if any check fails.**

### 4. Bump the version (per partial)

Update every version file listed in `release-node.md` — `package.json` and
`package-lock.json`.

### 5. Update CHANGELOG.md

Promote the `[Unreleased]` section to the new version, keeping a Keep-a-Changelog structure:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added/Changed/Fixed
- ...
```

If there is no `[Unreleased]` section, add a new `## [X.Y.Z]` block at the top with the changes.

### 6. Create release branch, commit, and PR

```bash
BASE_BRANCH=$(node -e "try{const c=require('./.agents-toolkit.json');console.log(c.pr?.targetBranch||c.git?.defaultBranch||'main')}catch{console.log('main')}")
git checkout -b release/vX.Y.Z
git add -A
git commit -m "chore: bump version to X.Y.Z"
git push -u origin release/vX.Y.Z
gh pr create --base "$BASE_BRANCH" --title "Release vX.Y.Z" --body "## Changes

- changelog entry" | cat
```

### 7. Analyze workflows → decide tag-only vs GitHub Release

**This is the critical step.** Read the repo's workflows and tell the user exactly what to do after
the release PR merges:

```bash
ls .github/workflows/ 2>/dev/null
# inspect the `on:` triggers and publish/build steps of each workflow
```

Decide from the triggers:

| Workflow trigger | Post-merge action | Why |
|------------------|-------------------|-----|
| `on: release: [created\|published]` | **Create a GitHub Release** (`gh release create vX.Y.Z`) | A bare tag does **not** fire `release` workflows — publishing/build only runs on the Release event |
| `on: push: tags: ['v*']` | **Push the tag** (`git push origin vX.Y.Z`) — Release optional | The tag push alone triggers the workflow |
| neither / no workflow | **Push the tag** for history; optionally `gh release create` for visibility | No automation depends on it |

Also scan the workflow **steps** and report what the release produces (e.g. `npm publish`, plugin
ZIP artifact, Docker image) so the user knows what will happen.

### 8. Post-merge instructions (tailored to step 7)

Give the exact commands for the detected flow, e.g.:

```bash
git checkout "$BASE_BRANCH" && git pull
git tag vX.Y.Z
git push origin vX.Y.Z
# If a `release:`-triggered workflow exists, ALSO create the Release so it fires:
gh release create vX.Y.Z --generate-notes
```

## Important

- **NEVER reuse an existing tag** — tags are immutable. If a tag exists, bump to the next version.
- Some projects use `master` instead of `main` — always verify the default branch with
  `gh repo view --json defaultBranchRef | cat`.
- A bare tag and a GitHub Release are **not** interchangeable: many publish/build workflows only run
  on the `release` event. Always complete step 7 before telling the user the release is done.
