# FedMCP Python Core

Python implementation of the Federal Model Context Protocol (FedMCP) v0.2.

## Installation

```bash
pip install fedmcp
```

For development:
```bash
pip install -e ".[dev]"
```

## Quick Start

### Creating and Signing Artifacts

```python
from uuid import uuid4
from fedmcp import Artifact, ArtifactType, LocalSigner

# Create an artifact
artifact = Artifact(
    type=ArtifactType.AGENT_RECIPE,
    workspaceId=uuid4(),
    jsonBody={
        "name": "Healthcare Diagnostic Agent",
        "version": "1.0.0",
        "capabilities": ["diagnose", "recommend", "monitor"]
    }
)

# Sign it
signer = LocalSigner()
jws_token = signer.sign(artifact)
print(f"Signed artifact: {jws_token[:50]}...")
```

### Verifying Artifacts

```python
from fedmcp import Verifier

# Create verifier and add public key
verifier = Verifier()
verifier.add_public_key(signer.get_key_id(), signer.private_key.public_key())

# Verify the artifact
verified_artifact = verifier.verify(jws_token)
print(f"Verified artifact ID: {verified_artifact.id}")
```

### Using the Client

```python
from fedmcp import FedMCPClient
import asyncio

async def main():
    client = FedMCPClient(
        base_url="http://localhost:8000",
        workspace_id=uuid4(),
        signer=LocalSigner()
    )
    
    # Create an artifact
    result = await client.create_artifact(
        artifact_type=ArtifactType.LLM_COMPLETION,
        json_body={
            "model": "gpt-4",
            "prompt": "Diagnose patient symptoms",
            "completion": "Based on the symptoms..."
        }
    )
    
    print(f"Created artifact: {result['id']}")
    client.close()

asyncio.run(main())
```

### AWS KMS Integration

```python
from fedmcp import KMSSigner, KMSVerifier

# Sign with KMS
kms_signer = KMSSigner(
    kms_key_id="arn:aws:kms:us-gov-west-1:123456789012:key/abc-123",
    region="us-gov-west-1"
)
jws_token = kms_signer.sign(artifact)

# Verify with KMS
kms_verifier = KMSVerifier(region="us-gov-west-1")
kms_verifier.add_kms_key(
    key_id=kms_signer.get_key_id(),
    kms_key_id="arn:aws:kms:us-gov-west-1:123456789012:key/abc-123"
)
verified = kms_verifier.verify(jws_token)
```

## Artifact Types

Standard FedMCP artifact types:
- `SSP_FRAGMENT` - System Security Plan fragments
- `POAM_TEMPLATE` - Plan of Action & Milestones templates
- `AGENT_RECIPE` - AI agent configurations
- `BASELINE_MODULE` - Security baseline modules
- `AUDIT_SCRIPT` - Audit automation scripts

Healthcare-specific types:
- `RAG_QUERY` - Retrieval-augmented generation queries
- `LLM_COMPLETION` - Language model completions
- `TOOL_INVOCATION` - Tool/function call records

## Testing

Run tests with pytest:
```bash
pytest
```

## License

Apache 2.0 - See LICENSE file for details.