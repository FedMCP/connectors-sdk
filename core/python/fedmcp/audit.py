from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field


class AuditAction(str, Enum):
    """Standard audit actions"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    VERIFY = "verify"
    SIGN = "sign"
    EXPORT = "export"
    IMPORT = "import"


class AuditEvent(BaseModel):
    """
    Audit event for FedMCP operations
    
    Captures who did what to which artifact when
    """
    id: UUID = Field(default_factory=uuid4)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat() + "Z")
    action: AuditAction
    actor: str  # Service account, user ID, or system component
    artifactId: Optional[UUID] = Field(None, alias="artifactId")
    workspaceId: UUID = Field(alias="workspaceId")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Optional fields for enhanced tracking
    ipAddress: Optional[str] = Field(None, alias="ipAddress")
    userAgent: Optional[str] = Field(None, alias="userAgent")
    sessionId: Optional[str] = Field(None, alias="sessionId")
    
    class Config:
        populate_by_name = True
        
    def to_cloudwatch_log(self) -> Dict[str, Any]:
        """Format for AWS CloudWatch Logs"""
        return {
            "eventId": str(self.id),
            "timestamp": self.timestamp,
            "action": self.action.value,
            "actor": self.actor,
            "artifactId": str(self.artifactId) if self.artifactId else None,
            "workspaceId": str(self.workspaceId),
            "metadata": self.metadata,
            "ipAddress": self.ipAddress,
            "userAgent": self.userAgent,
            "sessionId": self.sessionId
        }
        
    def to_postgres_row(self) -> Dict[str, Any]:
        """Format for PostgreSQL storage"""
        return {
            "id": self.id,
            "timestamp": datetime.fromisoformat(self.timestamp.replace("Z", "+00:00")),
            "action": self.action.value,
            "actor": self.actor,
            "artifact_id": self.artifactId,
            "workspace_id": self.workspaceId,
            "metadata": self.metadata,
            "ip_address": self.ipAddress,
            "user_agent": self.userAgent,
            "session_id": self.sessionId
        }