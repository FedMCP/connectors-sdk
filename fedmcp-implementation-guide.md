# FedMCP Implementation Guide for Peregrine Platform

> **Version**: 1.0  
> **Last Updated**: January 2025  
> **Purpose**: Complete context for implementing FedMCP in the Peregrine AI Platform  
> **Location**: projects/FedMCP/FEDMCP_IMPLEMENTATION_GUIDE.md

## 🎯 FedMCP Overview

**FedMCP (Federal Model Context Protocol)** is a signed, auditable interchange format for compliance artifacts in government ML deployments. It provides cryptographic guarantees for:
- **Provenance**: Who supplied the model context?
- **Immutability**: Did it change after ATO was granted?
- **Traceability**: Complete audit trail for every AI decision

### Key Components
1. **Artifact Envelope**: JSON schema with UUIDs, versions, workspace scoping
2. **Tamper Evidence**: JWS signatures (ES256) with per-tenant KMS keys
3. **Audit Trail**: Immutable events in Postgres + CloudTrail
4. **Size Limits**: 1MB max payloads, 180-day key rotation

## 🏗️ Architecture Integration with Peregrine

### System Architecture
```
┌────────────────────┐         ┌──────────────────────┐
│  Peregrine LLM     │─fn.call─►│  FedMCP Server      │
│  (vLLM/Mistral)    │         │  (ECS Container)     │
└────────────────────┘         └──────┬───────────────┘
        ▲                             │ S3/GovCloud
        │                             ▼
    Python Tools                 Signed Artifact Objects
    (Healthcare AI)                   │
        │                            │ webhook
        └──────────── Peregrine API ◄─┘
```

### Integration Points

#### 1. LLM Function Calls as Artifacts
Every AI tool invocation becomes a signed FedMCP artifact:

```python
@fedmcp_artifact(
    type="clinical_recommendation",
    version="1.0.0",
    compliance=["HIPAA", "FedRAMP-High"]
)
async def generate_care_plan(patient_context: dict) -> FedMCPResponse:
    """Generate a care plan with full audit trail"""
    # LLM generates recommendation
    recommendation = await llm.generate(patient_context)
    
    # Create FedMCP artifact
    artifact = {
        "id": str(uuid4()),
        "type": "clinical_recommendation",
        "version": 1,
        "workspaceId": WORKSPACE_ID,
        "createdAt": datetime.utcnow().isoformat(),
        "jsonBody": {
            "patient_id": patient_context["id"],
            "recommendation": recommendation,
            "evidence_sources": extract_sources(recommendation),
            "risk_score": calculate_risk(recommendation)
        }
    }
    
    # Sign and store
    signed_artifact = await fedmcp_client.sign_and_store(artifact)
    
    # Emit audit event
    await fedmcp_client.audit_event({
        "action": "create",
        "artifactId": artifact["id"],
        "actor": f"service:llm-{MODEL_NAME}",
        "compliance_flags": ["PHI_ACCESSED", "CLINICAL_DECISION"]
    })
    
    return FedMCPResponse(
        artifact_id=signed_artifact["id"],
        signature=signed_artifact["jws"],
        result=recommendation
    )
```

#### 2. Healthcare Service Integration
Each Peregrine healthcare service wraps its outputs as FedMCP artifacts:

```python
# Population Analytics Service
@fedmcp_artifact(type="population_analysis", version="1.0.0")
async def analyze_sdoh_risk(population_criteria: dict):
    """Social Determinant of Health risk analysis"""
    pass

# Clinical Intelligence Service  
@fedmcp_artifact(type="trial_match", version="1.0.0")
async def match_clinical_trials(patient: dict):
    """Match patient to eligible clinical trials"""
    pass

# Compliance Service
@fedmcp_artifact(type="audit_package", version="1.0.0")
async def generate_fedramp_evidence(timeframe: str):
    """Generate FedRAMP evidence package"""
    pass
```

## 📦 FedMCP Server Implementation

### Directory Structure
```
tools/fedmcp/
├── Dockerfile                  # Container definition
├── requirements.txt           # Python dependencies
├── src/
│   └── fedmcp/
│       ├── __init__.py
│       ├── server.py          # FastAPI server
│       ├── models.py          # Pydantic models
│       ├── signer.py          # JWS signing logic
│       ├── verifier.py        # Signature verification
│       ├── storage.py         # S3 + PostgreSQL
│       ├── audit.py           # Audit event handling
│       └── exchange_client.py # FedMCP Exchange integration
├── tests/
│   └── test_*.py
└── scripts/
    └── generate_keys.py       # KMS key generation
```

### Core Server Implementation

```python
# src/fedmcp/server.py
from fastapi import FastAPI, HTTPException, Depends
from typing import Optional
import json
from .models import Artifact, AuditEvent, JWSEnvelope
from .signer import FedMCPSigner
from .verifier import FedMCPVerifier
from .storage import ArtifactStorage
from .audit import AuditLogger

app = FastAPI(title="FedMCP Server", version="0.2.0")

# Initialize components
signer = FedMCPSigner()
verifier = FedMCPVerifier()
storage = ArtifactStorage()
audit = AuditLogger()

@app.post("/artifacts")
async def create_artifact(artifact: Artifact) -> JWSEnvelope:
    """Create and sign a new artifact"""
    # Validate artifact
    if artifact.jsonBody.__sizeof__() > 1_048_576:  # 1MB limit
        raise HTTPException(400, "Artifact exceeds 1MB limit")
    
    # Sign artifact
    jws = await signer.sign(artifact)
    
    # Store in S3
    await storage.store_artifact(artifact.id, jws)
    
    # Log audit event
    await audit.log_event(
        action="create",
        artifactId=artifact.id,
        actor=get_current_user(),
        workspaceId=artifact.workspaceId
    )
    
    return jws

@app.get("/artifacts/{artifact_id}")
async def get_artifact(artifact_id: str) -> JWSEnvelope:
    """Retrieve and verify an artifact"""
    # Fetch from storage
    jws = await storage.get_artifact(artifact_id)
    
    # Verify signature
    artifact = await verifier.verify(jws)
    
    # Log access
    await audit.log_event(
        action="read",
        artifactId=artifact_id,
        actor=get_current_user()
    )
    
    return jws

@app.post("/artifacts/{artifact_id}/verify")
async def verify_artifact(artifact_id: str) -> dict:
    """Verify artifact signature and return metadata"""
    jws = await storage.get_artifact(artifact_id)
    artifact = await verifier.verify(jws)
    
    return {
        "valid": True,
        "artifact_id": artifact.id,
        "workspace_id": artifact.workspaceId,
        "created_at": artifact.createdAt,
        "type": artifact.type,
        "version": artifact.version
    }

@app.get("/audit/events")
async def get_audit_events(
    artifact_id: Optional[str] = None,
    workspace_id: Optional[str] = None,
    limit: int = 100
) -> list[AuditEvent]:
    """Query audit events"""
    return await audit.query_events(
        artifact_id=artifact_id,
        workspace_id=workspace_id,
        limit=limit
    )

@app.get("/jwks/{workspace_id}")
async def get_jwks(workspace_id: str) -> dict:
    """Get public keys for verification"""
    return await signer.get_public_keys(workspace_id)
```

### JWS Signing Implementation

```python
# src/fedmcp/signer.py
import boto3
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from jose import jws
import json
import base64
from datetime import datetime, timedelta

class FedMCPSigner:
    def __init__(self):
        self.kms = boto3.client('kms', region_name='us-gov-west-1')
        self.key_cache = {}
        
    async def sign(self, artifact: Artifact) -> JWSEnvelope:
        """Sign artifact with workspace KMS key"""
        # Get or create KMS key for workspace
        key_id = await self._get_workspace_key(artifact.workspaceId)
        
        # Create JWT claims
        claims = {
            "iss": artifact.workspaceId,  # Issuer is workspace
            "sub": artifact.id,           # Subject is artifact ID
            "iat": int(datetime.utcnow().timestamp()),
            "exp": int((datetime.utcnow() + timedelta(days=90)).timestamp()),
            "artifact_type": artifact.type,
            "artifact_version": artifact.version
        }
        
        # Canonicalize artifact JSON (RFC 8785)
        canonical_json = self._canonicalize(artifact.dict())
        
        # Create JWS
        header = {
            "alg": "ES256",
            "typ": "JWT",
            "kid": await self._get_key_fingerprint(key_id)
        }
        
        # Sign with KMS
        signature = await self._kms_sign(
            key_id=key_id,
            message=f"{base64url(header)}.{base64url(canonical_json)}"
        )
        
        return JWSEnvelope(
            protected=header,
            payload=canonical_json,
            signature=signature
        )
    
    async def _get_workspace_key(self, workspace_id: str) -> str:
        """Get or create KMS key for workspace"""
        if workspace_id in self.key_cache:
            return self.key_cache[workspace_id]
        
        # Check if key exists
        alias = f"alias/fedmcp-{workspace_id}"
        try:
            response = self.kms.describe_key(KeyId=alias)
            key_id = response['KeyMetadata']['KeyId']
        except self.kms.exceptions.NotFoundException:
            # Create new key
            response = self.kms.create_key(
                Description=f"FedMCP signing key for workspace {workspace_id}",
                KeyUsage='SIGN_VERIFY',
                KeySpec='ECC_NIST_P256',
                Tags=[
                    {'TagKey': 'FedMCP', 'TagValue': 'true'},
                    {'TagKey': 'WorkspaceId', 'TagValue': workspace_id}
                ]
            )
            key_id = response['KeyMetadata']['KeyId']
            
            # Create alias
            self.kms.create_alias(
                AliasName=alias,
                TargetKeyId=key_id
            )
        
        self.key_cache[workspace_id] = key_id
        return key_id
    
    async def _kms_sign(self, key_id: str, message: str) -> str:
        """Sign message with KMS"""
        response = self.kms.sign(
            KeyId=key_id,
            Message=message.encode('utf-8'),
            MessageType='RAW',
            SigningAlgorithm='ECDSA_SHA_256'
        )
        return base64.urlsafe_b64encode(response['Signature']).decode('utf-8')
```

### Artifact Storage

```python
# src/fedmcp/storage.py
import boto3
import json
from typing import Optional
import asyncpg

class ArtifactStorage:
    def __init__(self):
        self.s3 = boto3.client('s3', region_name='us-gov-west-1')
        self.bucket = os.environ['FEDMCP_ARTIFACT_BUCKET']
        self.db_url = os.environ['DATABASE_URL']
        
    async def store_artifact(self, artifact_id: str, jws: JWSEnvelope):
        """Store signed artifact in S3 and metadata in PostgreSQL"""
        # Store JWS in S3
        key = f"artifacts/{artifact_id}.jws"
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=json.dumps(jws.dict()),
            ContentType='application/jose+json',
            ServerSideEncryption='aws:kms'
        )
        
        # Store metadata in PostgreSQL
        async with asyncpg.connect(self.db_url) as conn:
            await conn.execute('''
                INSERT INTO artifacts (id, workspace_id, type, version, created_at, s3_key)
                VALUES ($1, $2, $3, $4, $5, $6)
            ''', artifact_id, jws.payload['workspaceId'], 
                jws.payload['type'], jws.payload['version'],
                jws.payload['createdAt'], key)
    
    async def get_artifact(self, artifact_id: str) -> JWSEnvelope:
        """Retrieve artifact from storage"""
        # Get S3 key from database
        async with asyncpg.connect(self.db_url) as conn:
            row = await conn.fetchrow(
                'SELECT s3_key FROM artifacts WHERE id = $1',
                artifact_id
            )
            if not row:
                raise ValueError(f"Artifact {artifact_id} not found")
        
        # Fetch from S3
        response = self.s3.get_object(
            Bucket=self.bucket,
            Key=row['s3_key']
        )
        
        jws_data = json.loads(response['Body'].read())
        return JWSEnvelope(**jws_data)
```

## 🔄 FedMCP Exchange Integration

### Exchange Client Implementation

```python
# src/fedmcp/exchange_client.py
import httpx
from typing import List, Optional

class FedMCPExchangeClient:
    """Client for FedMCP Exchange SaaS"""
    
    def __init__(self, exchange_url: str, api_key: str):
        self.exchange_url = exchange_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "X-FedMCP-Version": "0.2"
        }
        self.client = httpx.AsyncClient()
    
    async def publish_artifact(self, artifact: JWSEnvelope, visibility: str = "private"):
        """Publish artifact to exchange"""
        response = await self.client.post(
            f"{self.exchange_url}/artifacts",
            json={
                "jws": artifact.dict(),
                "visibility": visibility,  # private, org, public
                "tags": ["healthcare", "clinical-ai", "peregrine"]
            },
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    async def search_artifacts(
        self, 
        artifact_type: Optional[str] = None,
        compliance: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> List[dict]:
        """Search exchange for artifacts"""
        params = {}
        if artifact_type:
            params["type"] = artifact_type
        if compliance:
            params["compliance"] = ",".join(compliance)
        if tags:
            params["tags"] = ",".join(tags)
        
        response = await self.client.get(
            f"{self.exchange_url}/artifacts/search",
            params=params,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()["artifacts"]
    
    async def subscribe_to_updates(self, artifact_types: List[str]):
        """Subscribe to artifact updates"""
        response = await self.client.post(
            f"{self.exchange_url}/subscriptions",
            json={
                "artifact_types": artifact_types,
                "webhook_url": f"{PEREGRINE_API_URL}/fedmcp/webhook"
            },
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
```

### Exchange Sync Job

```python
# Background job to sync with FedMCP Exchange
async def sync_with_exchange():
    """Periodically sync artifacts with FedMCP Exchange"""
    exchange = FedMCPExchangeClient(
        exchange_url="https://exchange.fedmcp.gov",
        api_key=os.environ["FEDMCP_EXCHANGE_API_KEY"]
    )
    
    # Search for new compliance templates
    new_artifacts = await exchange.search_artifacts(
        artifact_type="baseline_module",
        compliance=["FedRAMP-High", "HIPAA"],
        tags=["healthcare"]
    )
    
    for artifact_meta in new_artifacts:
        # Download full artifact
        artifact = await exchange.get_artifact(artifact_meta["id"])
        
        # Verify signature
        verified = await verifier.verify(artifact)
        
        # Store locally
        await storage.store_artifact(verified.id, artifact)
        
        # Notify LLM that new baseline is available
        await notify_llm_new_artifact(verified)
```

## 🚀 Implementation Plan

### Phase 1: Core FedMCP Server (Week 1)
1. [ ] Create `tools/fedmcp/` directory structure
2. [ ] Implement basic FastAPI server
3. [ ] Set up KMS key generation
4. [ ] Implement JWS signing/verification
5. [ ] Create S3 storage backend
6. [ ] Set up PostgreSQL schema

### Phase 2: Peregrine Integration (Week 2)
1. [ ] Create Python decorators for artifact wrapping
2. [ ] Integrate with existing LLM tools
3. [ ] Add audit event streaming
4. [ ] Update API gateway routes
5. [ ] Create FedMCP UI components

### Phase 3: Healthcare Workflows (Week 3)
1. [ ] Wrap clinical recommendations
2. [ ] Implement population analytics artifacts
3. [ ] Create compliance report artifacts
4. [ ] Add provenance tracking

### Phase 4: Exchange Integration (Week 4)
1. [ ] Implement exchange client
2. [ ] Set up webhook handling
3. [ ] Create subscription management
4. [ ] Build artifact marketplace UI

## 🔧 Infrastructure Requirements

### Terraform Resources Needed

```hcl
# fedmcp.tf
resource "aws_kms_key" "fedmcp_signing" {
  description = "FedMCP artifact signing key"
  key_usage   = "SIGN_VERIFY"
  
  tags = {
    Name    = "fedmcp-signing"
    Project = "Peregrine"
  }
}

resource "aws_s3_bucket" "fedmcp_artifacts" {
  bucket = "peregrine-fedmcp-artifacts-${data.aws_caller_identity.current.account_id}"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "aws:kms"
        kms_master_key_id = aws_kms_key.fedmcp_signing.arn
      }
    }
  }
}

resource "aws_db_instance" "fedmcp_postgres" {
  identifier     = "fedmcp-audit"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  storage_encrypted     = true
  
  db_name  = "fedmcp"
  username = "fedmcp"
  password = random_password.fedmcp_db.result
}

resource "aws_ecs_task_definition" "fedmcp" {
  family                   = "fedmcp-server"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = "512"
  memory                  = "1024"
  
  container_definitions = jsonencode([{
    name  = "fedmcp"
    image = "${aws_ecr_repository.fedmcp.repository_url}:latest"
    
    portMappings = [{
      containerPort = 8000
      protocol      = "tcp"
    }]
    
    environment = [
      {
        name  = "FEDMCP_ARTIFACT_BUCKET"
        value = aws_s3_bucket.fedmcp_artifacts.id
      },
      {
        name  = "DATABASE_URL"
        value = "postgresql://${aws_db_instance.fedmcp_postgres.endpoint}/fedmcp"
      }
    ]
    
    secrets = [
      {
        name      = "FEDMCP_EXCHANGE_API_KEY"
        valueFrom = aws_secretsmanager_secret.fedmcp_exchange_key.arn
      }
    ]
  }])
}
```

## 🎯 Success Metrics

1. **Every LLM inference** creates a signed artifact
2. **100% of clinical decisions** have audit trails
3. **Cross-agency artifact sharing** via Exchange
4. **Legal defensibility** for AI recommendations
5. **Automated compliance** evidence generation

## 📚 Open Source Components

### fedmcp-core (Apache 2.0)
- Reference Go/Rust libraries
- JSON Schema definitions
- Example implementations

### fedmcp-cli
- Command-line tools
- CI/CD integration helpers
- Verification utilities

### fedmcp-server
- This implementation
- Docker container
- Helm charts

## 🔗 Resources

- **Spec**: FedMCP v0.2 (see PDF)
- **Schema**: https://mcpfedspec.org/artifact.schema.json
- **Exchange**: https://exchange.fedmcp.gov (future)
- **Docs**: https://fedmcp.dev (future)

---

**Note**: This implementation makes every AI decision in Peregrine cryptographically verifiable and legally defensible—a game-changer for government healthcare AI.