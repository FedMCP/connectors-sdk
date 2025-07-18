# FedMCP Connector SDK

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Documentation](https://img.shields.io/badge/docs-fedmcp.org-blue.svg)](https://docs.fedmcp.org)

> Open source SDK for building FedMCP-compliant connectors

## What is FedMCP?

FedMCP (Federal Model Context Protocol) is an open standard that extends Anthropic's Model Context Protocol (MCP) with government-specific security features:

- 🔐 **JWS Signatures** - Cryptographic signing of all artifacts
- 🔍 **PII Detection** - Built-in scanning with Presidio
- 📝 **Audit Trails** - Complete compliance logging
- 🏛️ **Federal Standards** - NIST 800-53 and FedRAMP aligned

## What is this SDK?

This SDK provides the framework and tools for building connectors that integrate external data sources with FedMCP. Use it to:

- Build custom connectors for your data sources
- Transform data into FedMCP artifacts  
- Add compliance and audit trails
- Sign artifacts with JWS signatures

## Quick Start

### Installation

```bash
pip install fmcpx
```

### Create Your First Connector

```bash
# Scaffold a new connector
fmcpx create my-connector

# Use a specific template
fmcpx create my-api-connector --template rest-api
```

### Simple Example

```python
from fmcpx import BaseConnector
import asyncio

class MyConnector(BaseConnector):
    """Example connector for a custom data source"""
    
    async def fetch_data(self, query):
        # Your data fetching logic here
        data = await self.api_client.get(query)
        return self.create_artifact("data-extract", data)

# Run the connector
async def main():
    connector = MyConnector(config={
        "api_key": "your-key",
        "workspace_id": "your-workspace"
    })
    
    result = await connector.fetch_data({"endpoint": "/data"})
    print(f"Created artifact: {result['id']}")

asyncio.run(main())
```

## Example Connectors

Learn from working examples in the `examples/` directory:

### Mock HR Connector
Shows how to build an HR system integration:
```bash
cd examples/mock_hr_connector
python connector.py
```

### More Examples Coming Soon
- File System Connector - Read and monitor local files
- REST API Connector - Generic HTTP/REST integration  
- Database Connector - SQL queries with connection pooling
- Stream Connector - Real-time data processing

## Building Production Connectors

### Directory Structure

```
my-connector/
├── connector.py          # Main connector logic
├── requirements.txt      # Python dependencies
├── Dockerfile           # Container definition
├── tool.schema.json     # MCP tool schema
├── README.md            # Documentation
└── tests/
    └── test_connector.py # Unit tests
```

### Best Practices

#### 🔐 Security
- Never log sensitive data (passwords, API keys, PII)
- Use environment variables for secrets
- Validate and sanitize all inputs
- Implement proper access controls
- Follow principle of least privilege

#### ⚡ Performance
- Implement connection pooling
- Add caching where appropriate
- Handle rate limits gracefully
- Support batch operations
- Monitor resource usage

#### 📋 Compliance
- Log all data access with context
- Include audit metadata in artifacts
- Support data retention policies
- Enable PII/PHI detection
- Document compliance mappings

#### 🛡️ Reliability
- Add comprehensive error handling
- Implement retry logic with backoff
- Include health check endpoints
- Provide meaningful error messages
- Test failure scenarios

## CLI Commands

The `fmcpx` CLI helps you build and manage connectors:

```bash
# Create new connector from template
fmcpx create <name> [--template <template>]

# List available templates  
fmcpx list-templates

# Validate connector structure
fmcpx validate ./my-connector

# Package connector for deployment
fmcpx package ./my-connector

# Run connector locally for testing
fmcpx run ./my-connector
```

## Templates

Start quickly with built-in templates:

- **basic** - Minimal connector structure
- **rest-api** - REST API with auth and retries
- **database** - SQL/NoSQL with connection pooling
- **filesystem** - File monitoring with access controls

## Advanced Features

### Custom Signers

```python
from fmcpx import KMSSigner

# Use AWS KMS for signing
signer = KMSSigner(key_id="arn:aws:kms:...")
connector = MyConnector(config={
    "signer": signer
})
```

### Audit Integration

```python
class MyConnector(BaseConnector):
    async def fetch_data(self, query):
        # Automatic audit logging
        self.audit_log(
            action="data_access",
            resource=query["resource"],
            user=query.get("user"),
            metadata={"query": query}
        )
        return await super().fetch_data(query)
```

### PII Detection

```python
from fmcpx import PIIDetector

detector = PIIDetector()
if detector.scan(data):
    # Handle PII appropriately
    data = detector.redact(data)
```

## Need Production Connectors?

Looking for pre-built, certified connectors for enterprise systems?

**Peregrine Tec LLC** offers premium connectors for:

- **LexisNexis Federal** - SDOH data for healthcare
- **VA VistA/CPRS** - Veterans health records
- **Salesforce Government Cloud** - Federal CRM
- **AWS GovCloud** - FedRAMP High infrastructure
- **Palantir Foundry** - Advanced analytics platform
- And more...

Visit [www.peregrinetec.com](https://www.peregrinetec.com) for licensing information.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Code style guidelines
- Testing requirements
- Pull request process
- Security policies

## Documentation

- **Getting Started**: [docs.fedmcp.org/quickstart](https://docs.fedmcp.org/quickstart)
- **API Reference**: [docs.fedmcp.org/api](https://docs.fedmcp.org/api)
- **Best Practices**: [docs.fedmcp.org/best-practices](https://docs.fedmcp.org/best-practices)
- **Examples**: [github.com/FedMCP/connectors/examples](https://github.com/FedMCP/connectors/tree/main/examples)

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/FedMCP/connectors/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/FedMCP/connectors/discussions)
- **Slack Community**: [Join #connectors channel](https://fedmcp.slack.com)

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ by the FedMCP community for secure government AI
</p>