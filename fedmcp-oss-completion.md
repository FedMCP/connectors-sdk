# FedMCP Open Source Project Completion Guide

> **Version**: 1.0  
> **Last Updated**: January 2025  
> **Purpose**: Complete the FedMCP open source components for public release  
> **Repository**: github.com/fedmcp/fedmcp (planned)

## 🎯 Project Overview

FedMCP is being released as an open source project with these components:
1. **Core Libraries** (Go, Python, TypeScript) - Reference implementations
2. **CLI Tool** - Developer-friendly command line interface
3. **Server** - Reference HTTP/gRPC API server
4. **UI** - Web interface for artifact management
5. **Spec** - Formal specification and examples
6. **Connectors** - Integration templates for federal platforms

## 📁 Current Project Structure

```
FedMCP/
├── cli/                    # Command-line interface
├── connectors/            # Platform connectors (Palantir, etc.)
├── core/                  # Reference libraries
│   ├── go/               # Go implementation
│   ├── python/           # Python implementation
│   └── typescript/       # TypeScript implementation
├── examples/             # Quick start examples
├── fedmcp-connect/       # Connector framework
├── fedmcp-ui/           # Web UI (Next.js)
├── server/              # Reference server
├── spec/                # Formal specification
└── CLAUDE.md            # AI context document
```

## 🚀 Completion Checklist

### Phase 1: Core Libraries ✅ 

#### Go Core (`core/go/`)
```go
// core/go/pkg/fedmcp/artifact.go
package fedmcp

import (
    "encoding/json"
    "time"
    "github.com/google/uuid"
)

// Artifact represents a FedMCP artifact
type Artifact struct {
    ID          uuid.UUID              `json:"id"`
    Type        string                 `json:"type"`
    Version     int                    `json:"version"`
    WorkspaceID uuid.UUID              `json:"workspaceId"`
    CreatedAt   time.Time              `json:"createdAt"`
    JSONBody    map[string]interface{} `json:"jsonBody"`
}

// NewArtifact creates a new artifact
func NewArtifact(artifactType string, workspaceID uuid.UUID, body map[string]interface{}) *Artifact {
    return &Artifact{
        ID:          uuid.New(),
        Type:        artifactType,
        Version:     1,
        WorkspaceID: workspaceID,
        CreatedAt:   time.Now().UTC(),
        JSONBody:    body,
    }
}

// Validate ensures the artifact meets spec requirements
func (a *Artifact) Validate() error {
    if a.Type == "" {
        return ErrInvalidType
    }
    if a.Version < 1 {
        return ErrInvalidVersion
    }
    // Check 1MB size limit
    data, err := json.Marshal(a)
    if err != nil {
        return err
    }
    if len(data) > MaxArtifactSize {
        return ErrArtifactTooLarge
    }
    return nil
}

// Canonical returns RFC 8785 canonical JSON
func (a *Artifact) Canonical() ([]byte, error) {
    return canonicalizeJSON(a)
}
```

```go
// core/go/pkg/fedmcp/signer.go
package fedmcp

import (
    "crypto/ecdsa"
    "crypto/x509"
    "encoding/base64"
    "encoding/json"
    "fmt"
    "github.com/go-jose/go-jose/v3"
)

// Signer handles JWS signing of artifacts
type Signer struct {
    privateKey *ecdsa.PrivateKey
    keyID      string
}

// NewSigner creates a signer with a P-256 key
func NewSigner(privateKey *ecdsa.PrivateKey, keyID string) *Signer {
    return &Signer{
        privateKey: privateKey,
        keyID:      keyID,
    }
}

// Sign creates a JWS for an artifact
func (s *Signer) Sign(artifact *Artifact) (*JWSEnvelope, error) {
    // Create signer
    signer, err := jose.NewSigner(
        jose.SigningKey{Algorithm: jose.ES256, Key: s.privateKey},
        &jose.SignerOptions{
            ExtraHeaders: map[jose.HeaderKey]interface{}{
                "kid": s.keyID,
                "typ": "JWT",
            },
        },
    )
    if err != nil {
        return nil, fmt.Errorf("failed to create signer: %w", err)
    }
    
    // Get canonical JSON
    payload, err := artifact.Canonical()
    if err != nil {
        return nil, fmt.Errorf("failed to canonicalize: %w", err)
    }
    
    // Create JWS
    jws, err := signer.Sign(payload)
    if err != nil {
        return nil, fmt.Errorf("failed to sign: %w", err)
    }
    
    // Return envelope
    return &JWSEnvelope{
        Protected: jws.Protected,
        Payload:   base64.RawURLEncoding.EncodeToString(payload),
        Signature: jws.Signature,
    }, nil
}
```

#### Python Core (`core/python/`)
```python
# core/python/fedmcp/artifact.py
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from uuid import UUID, uuid4
import json
from dataclasses import dataclass, field

@dataclass
class Artifact:
    """FedMCP Artifact model"""
    id: UUID = field(default_factory=uuid4)
    type: str = ""
    version: int = 1
    workspace_id: UUID = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    json_body: Dict[str, Any] = field(default_factory=dict)
    
    def validate(self) -> None:
        """Validate artifact against spec"""
        if not self.type:
            raise ValueError("Artifact type is required")
        if self.version < 1:
            raise ValueError("Version must be >= 1")
        if not self.workspace_id:
            raise ValueError("Workspace ID is required")
        
        # Check size limit (1MB)
        data = json.dumps(self.to_dict())
        if len(data.encode('utf-8')) > 1_048_576:
            raise ValueError("Artifact exceeds 1MB limit")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "type": self.type,
            "version": self.version,
            "workspaceId": str(self.workspace_id),
            "createdAt": self.created_at.isoformat(),
            "jsonBody": self.json_body
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Artifact':
        """Create from dictionary"""
        return cls(
            id=UUID(data["id"]),
            type=data["type"],
            version=data["version"],
            workspace_id=UUID(data["workspaceId"]),
            created_at=datetime.fromisoformat(data["createdAt"]),
            json_body=data["jsonBody"]
        )
```

```python
# core/python/fedmcp/client.py
import httpx
from typing import Optional, List, Dict, Any
from .artifact import Artifact
from .signer import Signer

class FedMCPClient:
    """Client for FedMCP server interactions"""
    
    def __init__(self, server_url: str, workspace_id: str, signer: Optional[Signer] = None):
        self.server_url = server_url.rstrip('/')
        self.workspace_id = workspace_id
        self.signer = signer
        self.client = httpx.AsyncClient()
    
    async def create_artifact(self, artifact_type: str, body: Dict[str, Any]) -> Artifact:
        """Create and sign a new artifact"""
        artifact = Artifact(
            type=artifact_type,
            workspace_id=self.workspace_id,
            json_body=body
        )
        artifact.validate()
        
        # Sign if signer available
        if self.signer:
            jws = await self.signer.sign(artifact)
            response = await self.client.post(
                f"{self.server_url}/artifacts",
                json=jws.to_dict()
            )
        else:
            response = await self.client.post(
                f"{self.server_url}/artifacts",
                json=artifact.to_dict()
            )
        
        response.raise_for_status()
        return Artifact.from_dict(response.json())
    
    async def get_artifact(self, artifact_id: str) -> Artifact:
        """Retrieve an artifact"""
        response = await self.client.get(
            f"{self.server_url}/artifacts/{artifact_id}"
        )
        response.raise_for_status()
        return Artifact.from_dict(response.json())
    
    async def verify_artifact(self, artifact_id: str) -> Dict[str, Any]:
        """Verify artifact signature"""
        response = await self.client.post(
            f"{self.server_url}/artifacts/{artifact_id}/verify"
        )
        response.raise_for_status()
        return response.json()
    
    async def close(self):
        """Close client connections"""
        await self.client.aclose()
```

### Phase 2: CLI Tool 🔲

```go
// cli/cmd/fedmcp/main.go
package main

import (
    "encoding/json"
    "fmt"
    "os"
    
    "github.com/spf13/cobra"
    "github.com/fedmcp/fedmcp/core/go/pkg/fedmcp"
)

var rootCmd = &cobra.Command{
    Use:   "fedmcp",
    Short: "FedMCP CLI - Manage compliance artifacts",
    Long: `FedMCP (Federal Model Context Protocol) CLI
    
Sign, verify, and manage compliance artifacts for government ML deployments.`,
}

var createCmd = &cobra.Command{
    Use:   "create [type] [file]",
    Short: "Create and sign a new artifact",
    Args:  cobra.ExactArgs(2),
    RunE: func(cmd *cobra.Command, args []string) error {
        artifactType := args[0]
        filename := args[1]
        
        // Read JSON body
        data, err := os.ReadFile(filename)
        if err != nil {
            return fmt.Errorf("failed to read file: %w", err)
        }
        
        var body map[string]interface{}
        if err := json.Unmarshal(data, &body); err != nil {
            return fmt.Errorf("invalid JSON: %w", err)
        }
        
        // Create artifact
        workspaceID := mustGetWorkspaceID()
        artifact := fedmcp.NewArtifact(artifactType, workspaceID, body)
        
        // Sign artifact
        signer := mustGetSigner()
        jws, err := signer.Sign(artifact)
        if err != nil {
            return fmt.Errorf("failed to sign: %w", err)
        }
        
        // Output JWS
        output, err := json.MarshalIndent(jws, "", "  ")
        if err != nil {
            return err
        }
        fmt.Println(string(output))
        
        return nil
    },
}

var verifyCmd = &cobra.Command{
    Use:   "verify [jws-file]",
    Short: "Verify a signed artifact",
    Args:  cobra.ExactArgs(1),
    RunE: func(cmd *cobra.Command, args []string) error {
        filename := args[0]
        
        // Read JWS
        data, err := os.ReadFile(filename)
        if err != nil {
            return fmt.Errorf("failed to read file: %w", err)
        }
        
        var jws fedmcp.JWSEnvelope
        if err := json.Unmarshal(data, &jws); err != nil {
            return fmt.Errorf("invalid JWS: %w", err)
        }
        
        // Verify
        verifier := mustGetVerifier()
        artifact, err := verifier.Verify(&jws)
        if err != nil {
            return fmt.Errorf("verification failed: %w", err)
        }
        
        fmt.Println("✓ Signature valid")
        fmt.Printf("  Artifact ID: %s\n", artifact.ID)
        fmt.Printf("  Type: %s\n", artifact.Type)
        fmt.Printf("  Workspace: %s\n", artifact.WorkspaceID)
        fmt.Printf("  Created: %s\n", artifact.CreatedAt.Format(time.RFC3339))
        
        return nil
    },
}

var pushCmd = &cobra.Command{
    Use:   "push [artifact-file]",
    Short: "Push artifact to FedMCP server",
    Args:  cobra.ExactArgs(1),
    RunE: func(cmd *cobra.Command, args []string) error {
        // Implementation for pushing to server
        return nil
    },
}

var diffCmd = &cobra.Command{
    Use:   "diff [artifact1] [artifact2]",
    Short: "Compare two artifacts",
    Args:  cobra.ExactArgs(2),
    RunE: func(cmd *cobra.Command, args []string) error {
        // Implementation for diff
        return nil
    },
}

func init() {
    rootCmd.AddCommand(createCmd)
    rootCmd.AddCommand(verifyCmd)
    rootCmd.AddCommand(pushCmd)
    rootCmd.AddCommand(diffCmd)
}

func main() {
    if err := rootCmd.Execute(); err != nil {
        fmt.Fprintf(os.Stderr, "Error: %v\n", err)
        os.Exit(1)
    }
}
```

### Phase 3: Server Implementation 🔲

```python
# server/src/fedmcp_server/main.py
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
import os
from typing import Optional

from .models import Artifact, JWSEnvelope, AuditEvent
from .storage import ArtifactStorage
from .signer import KMSSigner
from .verifier import Verifier
from .audit import AuditLogger

# Initialize app
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.storage = ArtifactStorage()
    app.state.signer = KMSSigner()
    app.state.verifier = Verifier()
    app.state.audit = AuditLogger()
    yield
    # Shutdown
    await app.state.storage.close()
    await app.state.audit.close()

app = FastAPI(
    title="FedMCP Server",
    version="0.2.0",
    description="Federal Model Context Protocol reference server",
    lifespan=lifespan
)

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "version": "0.2.0"}

@app.post("/artifacts", response_model=JWSEnvelope)
async def create_artifact(
    artifact: Artifact,
    request: Request,
    auth: HTTPAuthorizationCredentials = Depends(security)
):
    """Create and sign a new artifact"""
    # Validate size
    if artifact.size_bytes() > 1_048_576:
        raise HTTPException(400, "Artifact exceeds 1MB limit")
    
    # Sign artifact
    jws = await request.app.state.signer.sign(artifact)
    
    # Store
    await request.app.state.storage.store(artifact.id, jws)
    
    # Audit
    await request.app.state.audit.log(
        action="create",
        artifact_id=artifact.id,
        actor=get_actor_from_token(auth),
        workspace_id=artifact.workspace_id
    )
    
    return jws

@app.get("/artifacts/{artifact_id}")
async def get_artifact(
    artifact_id: str,
    request: Request,
    auth: HTTPAuthorizationCredentials = Depends(security)
):
    """Retrieve an artifact"""
    jws = await request.app.state.storage.get(artifact_id)
    if not jws:
        raise HTTPException(404, "Artifact not found")
    
    # Audit access
    await request.app.state.audit.log(
        action="read",
        artifact_id=artifact_id,
        actor=get_actor_from_token(auth)
    )
    
    return jws

@app.post("/artifacts/{artifact_id}/verify")
async def verify_artifact(
    artifact_id: str,
    request: Request
):
    """Verify artifact signature"""
    jws = await request.app.state.storage.get(artifact_id)
    if not jws:
        raise HTTPException(404, "Artifact not found")
    
    try:
        artifact = await request.app.state.verifier.verify(jws)
        return {
            "valid": True,
            "artifact": artifact.dict(),
            "signed_by": jws.protected.get("kid")
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }

@app.get("/jwks/{workspace_id}")
async def get_jwks(workspace_id: str):
    """Get public keys for workspace"""
    keys = await request.app.state.signer.get_public_keys(workspace_id)
    return {"keys": keys}

@app.get("/audit/events")
async def get_audit_events(
    artifact_id: Optional[str] = None,
    workspace_id: Optional[str] = None,
    limit: int = 100,
    request: Request = None
):
    """Query audit events"""
    events = await request.app.state.audit.query(
        artifact_id=artifact_id,
        workspace_id=workspace_id,
        limit=limit
    )
    return {"events": events}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Phase 4: Quick Start Example 🔲

```yaml
# examples/quickstart/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fedmcp
      POSTGRES_USER: fedmcp
      POSTGRES_PASSWORD: fedmcp123
    volumes:
      - postgres_data:/var/lib/postgresql/data

  fedmcp:
    build: ../../server
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://fedmcp:fedmcp123@postgres:5432/fedmcp
      AWS_REGION: us-gov-west-1
      FEDMCP_ARTIFACT_BUCKET: fedmcp-artifacts-local
    depends_on:
      - postgres
    volumes:
      - ./keys:/app/keys

  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      SERVICES: s3,kms
      AWS_DEFAULT_REGION: us-gov-west-1
    volumes:
      - localstack_data:/var/lib/localstack

volumes:
  postgres_data:
  localstack_data:
```

```bash
# examples/quickstart/quickstart.sh
#!/bin/bash
set -e

echo "🚀 FedMCP Quick Start"
echo "==================="

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services
echo "Waiting for services to be ready..."
sleep 10

# Create test workspace
echo "Creating test workspace..."
WORKSPACE_ID=$(uuidgen)
echo "Workspace ID: $WORKSPACE_ID"

# Create sample artifact
cat > sample_artifact.json <<EOF
{
  "patient_id": "12345",
  "recommendation": "Continue current treatment plan",
  "confidence": 0.95,
  "evidence": ["study_1", "study_2"]
}
EOF

# Create and sign artifact
echo "Creating artifact..."
fedmcp create clinical_recommendation sample_artifact.json \
  --workspace $WORKSPACE_ID \
  > signed_artifact.jws

# Verify artifact
echo "Verifying artifact..."
fedmcp verify signed_artifact.jws

# Push to server
echo "Pushing to server..."
fedmcp push signed_artifact.jws \
  --server http://localhost:8000

echo "✅ Quick start complete!"
echo "Access the server at: http://localhost:8000/docs"
```

### Phase 5: README Files 🔲

```markdown
# FedMCP - Federal Model Context Protocol

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.21+-blue.svg)](https://golang.org)
[![Python Version](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)

FedMCP is a signed, auditable interchange format and workflow for compliance artifacts in government ML deployments.

## 🚀 Quick Start

```bash
# Install CLI
go install github.com/fedmcp/fedmcp/cli/cmd/fedmcp@latest

# Create and sign an artifact
fedmcp create agent_recipe my_agent.json --workspace $WORKSPACE_ID

# Verify a signed artifact  
fedmcp verify signed_artifact.jws

# Run local server
docker run -p 8000:8000 fedmcp/server:latest
```

## 📦 Components

- **Core Libraries**: Reference implementations in Go, Python, TypeScript
- **CLI**: Command-line tool for artifact management
- **Server**: HTTP/gRPC API for artifact storage and verification
- **UI**: Web interface for browsing and managing artifacts
- **Spec**: Formal specification and JSON schemas

## 🔧 Installation

### Go Library
```go
go get github.com/fedmcp/fedmcp/core/go
```

### Python Library
```bash
pip install fedmcp
```

### TypeScript/JavaScript
```bash
npm install @fedmcp/core
```

## 📚 Documentation

- [Specification](spec/README.md)
- [API Reference](docs/api.md)
- [Integration Guide](docs/integration.md)
- [Security Model](docs/security.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

FedMCP is licensed under Apache 2.0. See [LICENSE](LICENSE) for details.
```

## 🎯 Integration with Peregrine

### 1. Add FedMCP to Peregrine
```bash
# In Peregrine project
cd tools/
git submodule add https://github.com/fedmcp/fedmcp fedmcp

# Or copy directly
cp -r ../FedMCP/server ./fedmcp-server
```

### 2. Update Docker Compose
```yaml
# Add to Peregrine's docker-compose.yml
fedmcp:
  build: ./tools/fedmcp-server
  environment:
    DATABASE_URL: ${DATABASE_URL}
    FEDMCP_ARTIFACT_BUCKET: peregrine-fedmcp-artifacts
    AWS_REGION: us-gov-west-1
```

### 3. Wrap LLM Functions
```python
# In tools/rag/api.py
from fedmcp import artifact_decorator

@artifact_decorator(
    type="clinical_recommendation",
    compliance=["HIPAA", "FedRAMP-High"]
)
async def generate_recommendation(patient_data: dict):
    # Existing logic
    pass
```

## 🔄 Next Steps

### Week 1: Complete Core OSS
1. [ ] Finish Go core library
2. [ ] Complete Python client
3. [ ] Implement basic CLI commands
4. [ ] Write unit tests

### Week 2: Server & UI
1. [ ] Complete FastAPI server
2. [ ] Add PostgreSQL migrations
3. [ ] Implement S3 storage
4. [ ] Basic Next.js UI

### Week 3: Documentation & Examples
1. [ ] Write comprehensive README
2. [ ] Create integration guide
3. [ ] Add quickstart example
4. [ ] Record demo video

### Week 4: Peregrine Integration
1. [ ] Deploy FedMCP server in Peregrine
2. [ ] Wrap all LLM functions
3. [ ] Add audit UI to Peregrine
4. [ ] Test end-to-end flow

## 📊 Success Criteria

1. **Working OSS Release**: All components functional
2. **Clear Documentation**: Easy for others to adopt
3. **Peregrine Integration**: Every AI decision creates artifact
4. **Exchange Ready**: Prepared for SaaS connector development

---

This completes the open source FedMCP project, ready for:
1. Public GitHub release
2. Integration into Peregrine
3. Building Exchange connectors
4. Government adoption