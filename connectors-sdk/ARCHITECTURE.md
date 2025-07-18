# FedMCP Connector Architecture

## Overview

This document explains the architecture and separation between the open source FedMCP Connector SDK and premium connectors.

## Repository Structure

### Open Source (This Repository)

```
github.com/FedMCP/connectors/
├── fedmcp_connector/          # SDK Core
│   ├── __init__.py
│   ├── base.py               # BaseConnector class
│   ├── config.py             # Configuration management
│   ├── audit.py              # Audit logging
│   └── utils.py              # Utilities (retry, rate limit, etc.)
├── examples/                  # Example connectors
│   ├── filesystem_connector/  # Simple file system example
│   ├── rest_api_connector/   # Generic REST API example
│   └── hr_connector/         # Mock HR system example
├── templates/                 # Connector templates
│   ├── basic/                # Basic connector template
│   ├── database/             # Database connector template
│   └── streaming/            # Real-time data template
├── docs/                     # Documentation
│   ├── getting-started.md
│   ├── api-reference.md
│   └── best-practices.md
├── tests/                    # SDK tests
├── README.md
├── setup.py
└── LICENSE                   # Apache 2.0
```

### Premium Connectors (Private Repository)

```
github.com/FedMCP/fedmcp-connect/ (PRIVATE)
├── connectors/
│   ├── lexisnexis-sdoh/      # $100K+ license
│   ├── va-vista/             # Government only
│   ├── salesforce-gov/       # Enterprise license
│   ├── aws-govcloud/         # Government only
│   └── palantir-foundry/     # Enterprise license
├── LICENSE.txt               # Proprietary - Peregrine Tec LLC
└── README.md
```

## How They Work Together

### 1. Developers Use the SDK

```python
# Install the open source SDK
pip install fedmcp-connector-sdk

# Create custom connector
from fedmcp_connector import BaseConnector

class MyCustomConnector(BaseConnector):
    # Implementation using SDK
```

### 2. Enterprises License Premium Connectors

```python
# With valid license from Peregrine Tec
from premium_connectors.lexisnexis_sdoh import LexisNexisConnector

connector = LexisNexisConnector(
    license_key="GOV-XXXXX-XXXXX"
)
```

## Key Differences

| Aspect | Open Source SDK | Premium Connectors |
|--------|----------------|-------------------|
| **Purpose** | Enable connector development | Ready-to-use integrations |
| **License** | Apache 2.0 | Proprietary (Peregrine Tec) |
| **Cost** | Free | $25K-$100K+/year |
| **Support** | Community | 24/7 Professional |
| **Examples** | Generic/Mock | Production Systems |
| **Compliance** | Framework only | Pre-certified |

## Why This Architecture?

### Benefits for the Community
- Learn how to build FedMCP connectors
- Contribute improvements to the SDK
- Build custom connectors for their needs
- No vendor lock-in

### Benefits for Peregrine Tec
- Drive adoption of FedMCP standard
- Showcase connector capabilities
- Build trust through transparency
- Monetize premium integrations

### Benefits for Government
- Open standard ensures no lock-in
- Can build custom connectors if needed
- Option to buy pre-built, certified connectors
- Community can audit the framework

## Connector Types

### Open Source Examples
These show HOW to build connectors:
- **File System**: Read local files
- **REST API**: Generic HTTP/REST integration
- **Database**: SQL/NoSQL templates
- **Streaming**: Real-time data sources

### Premium Connectors
These provide production-ready integrations:
- **LexisNexis SDOH**: Healthcare social determinants
- **VA VistA**: Veterans health records
- **Salesforce Gov Cloud**: CRM for government
- **AWS GovCloud**: FedRAMP High infrastructure
- **Palantir Foundry**: Advanced analytics

## Development Flow

1. **Learn**: Use open source SDK and examples
2. **Build**: Create custom connectors with SDK
3. **Test**: Validate with FedMCP compliance tools
4. **Deploy**: Self-host or use managed service
5. **Scale**: License premium connectors as needed

## Security Model

### SDK (Open Source)
- Provides security framework
- Audit logging interface
- Signing/verification tools
- Best practice guidelines

### Premium Connectors
- Pre-implemented security controls
- Compliance certifications
- Vulnerability management
- Security incident support

## Support Model

### Community Support (SDK)
- GitHub issues
- Community Slack
- Documentation
- Example code

### Professional Support (Premium)
- SLA guarantees
- Phone/email support
- Custom development
- Training services

## Future Roadmap

### SDK Enhancements
- More connector templates
- Additional utility functions
- Performance optimizations
- Expanded documentation

### Premium Offerings
- Industry-specific connectors
- Compliance accelerators
- Managed connector service
- Custom connector development

## Conclusion

This architecture provides the best of both worlds:
- **Open source SDK** for transparency and adoption
- **Premium connectors** for enterprise needs

The community benefits from a robust framework while Peregrine Tec can build a sustainable business providing high-value integrations to government and enterprise customers.