# FedMCP TypeScript Core

TypeScript implementation of the Federal Model Context Protocol (FedMCP) v0.2.

## Installation

```bash
npm install @fedmcp/core
```

## Quick Start

### Creating and Signing Artifacts

```typescript
import { FedMCPArtifact, ArtifactType, LocalSigner } from '@fedmcp/core';

// Create an artifact
const artifact = new FedMCPArtifact({
  type: ArtifactType.AGENT_RECIPE,
  workspaceId: '550e8400-e29b-41d4-a716-446655440000',
  jsonBody: {
    name: 'Healthcare Diagnostic Agent',
    version: '1.0.0',
    capabilities: ['diagnose', 'recommend', 'monitor']
  }
});

// Sign it
const signer = new LocalSigner();
await signer.initialize();

const jws = await signer.sign(artifact.toJSON());
console.log(`Signed artifact: ${jws.substring(0, 50)}...`);
```

### Verifying Artifacts

```typescript
import { Verifier } from '@fedmcp/core';

// Create verifier and add public key
const verifier = new Verifier();
const publicKeyJWK = await signer.getPublicKeyJWK();
await verifier.addPublicKeyJWK(publicKeyJWK);

// Verify the artifact
try {
  const verifiedArtifact = await verifier.verify(jws);
  console.log(`Verified artifact ID: ${verifiedArtifact.id}`);
} catch (error) {
  console.error('Verification failed:', error);
}
```

### Using the Client

```typescript
import { FedMCPClient, LocalSigner } from '@fedmcp/core';

const client = new FedMCPClient({
  baseUrl: 'http://localhost:8000',
  workspaceId: '550e8400-e29b-41d4-a716-446655440000',
  apiKey: 'your-api-key',
  signer: new LocalSigner()
});

// Create an artifact on the server
const result = await client.createArtifact(
  ArtifactType.LLM_COMPLETION,
  {
    model: 'gpt-4',
    prompt: 'Diagnose patient symptoms',
    completion: 'Based on the symptoms...'
  }
);

console.log(`Created artifact: ${result.artifactId}`);
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

## API Reference

### FedMCPArtifact

```typescript
class FedMCPArtifact {
  constructor(params: {
    type: string;
    workspaceId: string;
    jsonBody: Record<string, any>;
    version?: number;
    id?: string;
    createdAt?: string;
  });
  
  validate(): void;
  canonicalize(): string;
  hash(): string;
  toJSON(): Artifact;
}
```

### LocalSigner

```typescript
class LocalSigner extends Signer {
  async initialize(): Promise<void>;
  async sign(artifact: Artifact): Promise<string>;
  getKeyId(): string;
  async getPublicKeyJWK(): Promise<any>;
}
```

### Verifier

```typescript
class Verifier {
  async addPublicKey(keyId: string, publicKey: CryptoKey): Promise<void>;
  async addPublicKeyJWK(jwk: any): Promise<void>;
  async verify(jws: string): Promise<Artifact>;
  async verifyWithResult(jws: string): Promise<VerificationResult>;
}
```

### FedMCPClient

```typescript
class FedMCPClient {
  constructor(options: FedMCPClientOptions);
  
  async createArtifact(
    type: string,
    jsonBody: Record<string, any>,
    version?: number,
    sign?: boolean
  ): Promise<{ artifactId: string; jws?: string }>;
  
  async getArtifact(artifactId: string): Promise<Artifact>;
  
  async verifyArtifact(
    artifact: Artifact,
    jws: string
  ): Promise<VerificationResult>;
  
  async getAuditTrail(artifactId: string): Promise<any[]>;
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## Browser Support

This library uses the Web Crypto API which is available in modern browsers. For Node.js, it requires version 15.0.0 or higher for native crypto support.

## License

Apache 2.0 - See LICENSE file for details.