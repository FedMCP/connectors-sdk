# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FedMCP (Federal Model Context Protocol) is a FedRAMP-aligned superset of the Model Context Protocol that adds audit, redaction, and signature controls to MCP agents for government cloud workloads. It provides multi-language SDKs (Go, Python, TypeScript) and a reference implementation with UI.

## Common Development Commands

### FedMCP UI (Next.js)
```bash
cd fedmcp-ui
pnpm install          # Install dependencies
pnpm dev             # Run development server (port 3000)
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run linting
```

### TypeScript Core SDK
```bash
cd core/typescript
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm test             # Run tests
npm run lint         # Run ESLint
```

### Python Server
```bash
cd server
poetry install       # Install dependencies
python -m src.main   # Run server (port 8090)
pytest              # Run tests
```

### Go CLI
```bash
cd cli
go build ./cmd/fedmcp  # Build CLI
go test ./...          # Run tests
```

### Quick Start with Docker
```bash
cd examples/quickstart
docker-compose up   # Runs server on 8090, demo app on 3000
```

## High-Level Architecture

### Component Structure
- **`/cli`**: Go-based CLI tool for creating, signing, and managing artifacts
  - Entry point: `cmd/fedmcp/main.go`
  - Commands: create, sign, verify, push

- **`/server`**: FastAPI Python server with PII detection and audit logging
  - Entry point: `src/main.py`
  - Features: Presidio integration, CloudWatch logging, content hashing

- **`/fedmcp-ui`**: Next.js 15 TypeScript application
  - Main routes: dashboard, catalog, connector, settings, exchange
  - API route: `/api/artifacts` for artifact signing

- **`/core`**: Multi-language SDKs
  - Go: `/core/go/pkg/fedmcp/` - artifact, signer, verifier, audit modules
  - Python: `/core/python/fedmcp/` - artifact, client, signer modules
  - TypeScript: `/core/typescript/src/` - artifact, client, types modules

- **`/fedmcp-connect`**: Python-based connector SDK
  - CLI tool: `fmcpx` for scaffolding connectors
  - Example connectors in `/connectors/`

### Key Artifact Types
- SSP Fragments (System Security Plan)
- POA&M Templates (Plan of Action & Milestones)
- Agent Recipes
- Baseline Modules
- Audit Scripts
- RAG Queries
- LLM Completions
- Tool Invocations

### Important Environment Variables
- `AUDIT_LOG_GROUP`: CloudWatch log group for audit logs
- `AUDIT_LOG_STREAM`: CloudWatch log stream (default: "primary")
- Server runs on port 8090 by default
- UI runs on port 3000 by default

### Testing Patterns
- Go: Standard `_test.go` files with `go test`
- Python: pytest-based testing
- TypeScript: npm test scripts
- Focus on roundtrip testing for sign/verify operations