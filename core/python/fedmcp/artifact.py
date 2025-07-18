from datetime import datetime, timezone
from typing import Dict, Any, Optional
from uuid import UUID, uuid4
import json
import hashlib
from pydantic import BaseModel, Field, validator


class ArtifactType:
    """Standard artifact types from FedMCP spec v0.2"""
    SSP_FRAGMENT = "ssp_fragment"
    POAM_TEMPLATE = "poam_template" 
    AGENT_RECIPE = "agent_recipe"
    BASELINE_MODULE = "baseline_module"
    AUDIT_SCRIPT = "audit_script"
    
    # Extended types for healthcare
    RAG_QUERY = "rag_query"
    LLM_COMPLETION = "llm_completion"
    TOOL_INVOCATION = "tool_invocation"


class Artifact(BaseModel):
    """
    FedMCP Artifact as defined in spec v0.2
    
    All artifacts must be under 1 MiB when serialized
    """
    id: UUID = Field(default_factory=uuid4)
    type: str
    version: int = Field(default=1, ge=1)
    workspaceId: UUID = Field(alias="workspaceId")
    createdAt: str = Field(alias="createdAt")
    jsonBody: Dict[str, Any] = Field(alias="jsonBody")
    
    class Config:
        populate_by_name = True
    
    def __init__(self, **data):
        if "createdAt" not in data:
            data["createdAt"] = datetime.now(timezone.utc).isoformat() + "Z"
        super().__init__(**data)
    
    @validator("jsonBody")
    def validate_size(cls, v):
        """Ensure jsonBody doesn't exceed 1 MiB limit"""
        size = len(json.dumps(v).encode())
        if size > 1024 * 1024:
            raise ValueError(f"jsonBody size {size} exceeds 1 MiB limit")
        return v
    
    def canonicalize(self) -> bytes:
        """
        Return RFC 8785 canonical JSON representation
        """
        # For now, using standard JSON with sorted keys
        # TODO: Implement full RFC 8785 canonicalization
        return json.dumps(
            self.model_dump(by_alias=True),
            sort_keys=True,
            separators=(",", ":")
        ).encode()
    
    def hash(self) -> str:
        """Return SHA256 hash of canonical artifact"""
        return hashlib.sha256(self.canonicalize()).hexdigest()