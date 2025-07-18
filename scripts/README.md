# FedMCP Scripts

This directory contains utility scripts for the FedMCP project.

## Scripts

### migrate-to-multi-repo.sh

Splits the FedMCP monorepo into multiple repositories while preserving git history.

**Prerequisites:**
- `git-filter-repo` must be installed: `pip install git-filter-repo`
- GitHub CLI (`gh`) for creating repositories (optional)

**Usage:**
```bash
cd /path/to/FedMCP
./scripts/migrate-to-multi-repo.sh
```

**What it does:**
1. Creates a temporary directory for migration
2. Splits the monorepo into 10 separate repositories:
   - core (protocol specs)
   - server (FastAPI implementation)
   - cli (Go command-line tool)
   - ui (Next.js web interface)
   - go-sdk, python-sdk, typescript-sdk
   - connectors (connector framework)
   - docs (documentation)
   - examples (quickstart guides)
3. Preserves git history for each component
4. Adds common files (LICENSE, CONTRIBUTING.md, SECURITY.md)
5. Creates README.md for each repository
6. Generates helper scripts:
   - `create-github-repos.sh` - Creates repos on GitHub using gh CLI
   - `push-all-repos.sh` - Pushes all repos to GitHub

**Output:**
- Migrated repositories in `/tmp/fedmcp-migration/`
- Each repo configured with correct remote URL
- Ready to push to GitHub

### Other Scripts

- `pre-push-check.sh` - Pre-push validation checks
- `prepare-public-release.sh` - Prepare for public release
- `prepare-ui-release.sh` - Prepare UI for release