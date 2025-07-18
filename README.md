# FedMCP - Federal Model Context Protocol

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.21+-blue.svg)](https://golang.org)
[![Python Version](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)

FedMCP is a signed, auditable interchange format and workflow for compliance artifacts in government ML deployments. It provides cryptographic guarantees for provenance, immutability, and traceability of AI/ML artifacts in FedRAMP environments.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/fedmcp/fedmcp.git
cd fedmcp

# Run the quick start
cd examples/quickstart
./quickstart.sh
```

This will start a local FedMCP server and demonstrate creating, signing, and verifying artifacts.

## 📦 Components

### Core Libraries
Multi-language implementations of the FedMCP specification:

- **[Go](/core/go)** - For high-performance services and CLI tools
- **[Python](/core/python)** - For AI/ML integrations and data science workflows  
- **[TypeScript](/core/typescript)** - For web applications and Node.js services

### Server
Reference [FastAPI server](/server) with:
- RESTful API for artifact management
- Local and S3 storage backends
- Audit trail logging
- JWS signature verification
- Docker deployment support

### CLI Tool
[Command-line interface](/cli) for:
- Creating and signing artifacts
- Verifying signatures
- Pushing artifacts to servers
- Managing workspaces

### Web UI
[Next.js application](/fedmcp-ui) for:
- Browsing artifact catalogs
- Viewing audit trails
- Managing workspaces
- Signature verification

## 🔧 Installation

### Python Library
```bash
pip install fedmcp
```

### Go Library
```bash
go get github.com/fedmcp/fedmcp/core/go
```

### TypeScript/JavaScript
```bash
npm install @fedmcp/core
```

### CLI Tool
```bash
go install github.com/fedmcp/fedmcp/cli/cmd/fedmcp@latest
```

## 📚 Documentation

- [Quick Start Guide](examples/quickstart/README.md)
- [API Reference](docs/api.md) (coming soon)
- [Integration Guide](docs/integration.md) (coming soon)
- [FedMCP Specification](spec/README.md)

## 🎯 Use Cases

FedMCP is designed for:

1. **AI/ML Model Governance** - Track model versions, training data, and performance metrics
2. **Compliance Automation** - Generate auditable evidence for FedRAMP, HIPAA, and other frameworks
3. **Healthcare AI** - Ensure provenance of clinical decision support systems
4. **Cross-Agency Collaboration** - Share verified AI artifacts between government agencies
5. **Supply Chain Security** - Cryptographically verify AI component integrity

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI/ML System  │────▶│  FedMCP Server   │────▶│   S3/Database   │
│  (Your Platform)│     │  (Signs/Stores)  │     │  (Persistence)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                          │
         │                       ▼                          │
         │              ┌──────────────────┐               │
         └─────────────▶│  Audit Service   │◀──────────────┘
                        │  (CloudWatch)    │
                        └──────────────────┘
```

## 🔒 Security Features

- **JWS Signatures** - ECDSA P-256 signatures for all artifacts
- **Workspace Isolation** - Multi-tenant support with UUID-based workspaces
- **Audit Trail** - Immutable record of all operations
- **Size Limits** - 1MB maximum artifact size to prevent abuse
- **PII Detection** - Optional Presidio integration for sensitive data scanning

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Python development
cd core/python
pip install -e ".[dev]"
pytest

# Go development  
cd core/go
go test ./...

# Run the server locally
cd server
pip install -r requirements.txt
python -m src.main
```

## 📄 License

FedMCP is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

FedMCP is designed to complement the [Model Context Protocol](https://modelcontextprotocol.io) by adding federal compliance capabilities.

## 📞 Support

- GitHub Issues: [github.com/fedmcp/fedmcp/issues](https://github.com/fedmcp/fedmcp/issues)
- Documentation: [fedmcp.dev](https://fedmcp.dev) (coming soon)
- Email: support@fedmcp.dev (coming soon)

---

**Note**: This is a pre-release version. APIs and specifications may change before the 1.0 release.