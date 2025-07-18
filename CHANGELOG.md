# Changelog

All notable changes to the FedMCP project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-alpha] - 2025-01-15

### Added
- **Python Core Library** (`/core/python/`)
  - Complete artifact creation and validation
  - Local and KMS signer implementations
  - JWS verification with tampering detection
  - Async client for server interaction
  - Comprehensive test suite
  - Full documentation and examples

- **TypeScript Core Library** (`/core/typescript/`)
  - Full artifact implementation with validation
  - ECDSA P-256 signing using Web Crypto API
  - JWS verification with public key management
  - Enhanced client with signer integration
  - Audit event models
  - Complete test coverage
  - Browser and Node.js compatibility

- **Go Core Library** (`/core/go/`)
  - Artifact creation and validation
  - Basic signer structure
  - UUID-based workspace isolation
  - Size limit enforcement (1MB)

- **CLI Tool** (`/cli/`)
  - Commands: create, sign, verify, push
  - Workspace management
  - JSON artifact support

- **FastAPI Server** (`/server/`)
  - REST API with all CRUD operations
  - Local and S3 storage backends
  - Audit trail logging
  - JWS signature verification
  - Docker support
  - OpenAPI specification

- **Web UI** (`/fedmcp-ui/`)
  - Next.js 15 application structure
  - Dashboard, catalog, and settings pages
  - Marketing website
  - API route scaffolding

- **Healthcare Examples** (`/examples/healthcare/`)
  - Clinical Decision Support artifact
  - Population Health Analysis artifact
  - HIPAA Compliance Audit Script
  - Comprehensive documentation

- **Documentation**
  - Main README with project overview
  - Contributing guidelines
  - Security policy
  - API documentation (OpenAPI)
  - Integration guides
  - Language-specific READMEs

- **Infrastructure**
  - GitHub Actions CI/CD workflows
  - Docker Compose quick start
  - Comprehensive .gitignore files
  - Apache 2.0 license

### Changed
- Enhanced artifact validation across all languages
- Improved error handling in server implementation
- Updated client libraries to support signing

### Security
- ECDSA P-256 signatures for all artifacts
- Size limit enforcement (1MB) to prevent DoS
- Workspace-based isolation
- Immutable audit trails

### Known Issues
- UI not yet connected to backend API
- Go implementation lacks full signing capability
- Limited test coverage for Go and server components
- KMS integration needs production testing

## [0.1.0] - 2024-12-01 (Planning Phase)

### Added
- Initial project structure
- FedMCP specification v0.2
- Basic architectural design
- Integration planning documents

---

## Upcoming Releases

### [0.2.0] - Target: 2025-02-01
- Connect UI to backend API
- Add PostgreSQL persistence
- Implement production KMS signing
- Comprehensive integration tests
- Performance optimizations

### [0.3.0] - Target: 2025-03-01
- Peregrine platform integration
- FedMCP Exchange connectors
- Advanced compliance reporting
- Multi-region support

### [1.0.0] - Target: 2025-06-01
- Production-ready release
- Full FedRAMP compliance
- Enterprise features
- SLA guarantees