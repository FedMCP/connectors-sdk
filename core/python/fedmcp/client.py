import httpx
from typing import Dict, Any, Optional, List
from uuid import UUID

from .artifact import Artifact
from .signer import Signer


class FedMCPClient:
    """Client for interacting with FedMCP server"""
    
    def __init__(
        self, 
        base_url: str,
        workspace_id: UUID,
        signer: Optional[Signer] = None,
        timeout: int = 30
    ):
        self.base_url = base_url.rstrip("/")
        self.workspace_id = workspace_id
        self.signer = signer
        self.client = httpx.Client(timeout=timeout)
    
    async def create_artifact(
        self,
        artifact_type: str,
        json_body: Dict[str, Any],
        version: int = 1
    ) -> Dict[str, Any]:
        """Create and sign a new artifact"""
        artifact = Artifact(
            type=artifact_type,
            version=version,
            workspaceId=self.workspace_id,
            jsonBody=json_body
        )
        
        # Sign if signer available
        jws = None
        if self.signer:
            jws = self.signer.sign(artifact)
        
        # Send to server
        response = self.client.post(
            f"{self.base_url}/artifacts",
            json={
                "artifact": artifact.model_dump(by_alias=True),
                "jws": jws
            }
        )
        response.raise_for_status()
        
        return response.json()
    
    async def get_artifact(self, artifact_id: UUID) -> Dict[str, Any]:
        """Retrieve an artifact by ID"""
        response = self.client.get(
            f"{self.base_url}/artifacts/{artifact_id}",
            headers={"X-Workspace-ID": str(self.workspace_id)}
        )
        response.raise_for_status()
        
        return response.json()
    
    async def verify_artifact(
        self,
        artifact: Artifact,
        jws: str
    ) -> Dict[str, Any]:
        """Verify an artifact's signature"""
        response = self.client.post(
            f"{self.base_url}/artifacts/verify",
            json={
                "artifact": artifact.model_dump(by_alias=True),
                "jws": jws
            }
        )
        response.raise_for_status()
        
        return response.json()
    
    async def get_audit_trail(
        self,
        artifact_id: UUID
    ) -> List[Dict[str, Any]]:
        """Get audit events for an artifact"""
        response = self.client.get(
            f"{self.base_url}/audit/artifacts/{artifact_id}"
        )
        response.raise_for_status()
        
        return response.json()["events"]
    
    def close(self):
        """Close the HTTP client"""
        self.client.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()