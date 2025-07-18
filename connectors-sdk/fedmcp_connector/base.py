"""
Base class for FedMCP Connectors
Provides common functionality for building compliant connectors
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import logging
from dataclasses import dataclass
import os

from fedmcp import Artifact, LocalSigner, KMSSigner

@dataclass
class ConnectorConfig:
    """Configuration for FedMCP connectors"""
    workspace_id: str
    connector_name: str
    api_endpoint: Optional[str] = None
    auth_token: Optional[str] = None
    use_kms: bool = False
    kms_key_id: Optional[str] = None
    cache_enabled: bool = True
    audit_level: str = "INFO"
    extra_config: Dict[str, Any] = None

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value"""
        if hasattr(self, key):
            return getattr(self, key)
        if self.extra_config and key in self.extra_config:
            return self.extra_config[key]
        return default


class AuditLogger:
    """Compliance audit logger for FedMCP connectors"""
    
    def __init__(self, connector_name: str, level: str = "INFO"):
        self.connector_name = connector_name
        self.logger = logging.getLogger(f"fedmcp.connector.{connector_name}")
        self.logger.setLevel(getattr(logging, level))
        
        # Add handler if not already present
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def log_access(self, resource: str, action: str, user: Optional[str] = None, 
                   success: bool = True, metadata: Optional[Dict] = None):
        """Log data access for compliance"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "connector": self.connector_name,
            "resource": resource,
            "action": action,
            "user": user or "system",
            "success": success,
            "metadata": metadata or {}
        }
        
        if success:
            self.logger.info(f"Access granted: {json.dumps(log_entry)}")
        else:
            self.logger.warning(f"Access denied: {json.dumps(log_entry)}")
        
        return log_entry


class BaseConnector(ABC):
    """
    Abstract base class for all FedMCP connectors
    
    Provides common functionality:
    - Configuration management
    - Artifact signing
    - Audit logging
    - Health checks
    - Error handling
    """
    
    def __init__(self, config: ConnectorConfig):
        self.config = config
        self.workspace_id = config.workspace_id
        self.connector_name = config.connector_name
        
        # Initialize signer
        if config.use_kms and config.kms_key_id:
            self.signer = KMSSigner(key_id=config.kms_key_id)
        else:
            self.signer = LocalSigner()
        
        # Initialize audit logger
        self.audit = AuditLogger(
            connector_name=config.connector_name,
            level=config.audit_level
        )
        
        # Cache for performance
        self._cache = {} if config.cache_enabled else None
        
        # Initialize connector-specific resources
        self._initialize()
        
        self.audit.log_access(
            resource="connector",
            action="initialize",
            success=True,
            metadata={"version": self.get_version()}
        )
    
    @abstractmethod
    def _initialize(self):
        """Initialize connector-specific resources"""
        pass
    
    @abstractmethod
    async def fetch_data(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fetch data from the external source
        
        Args:
            query: Query parameters specific to the connector
            
        Returns:
            Dictionary containing the fetched data
        """
        pass
    
    @abstractmethod
    def get_version(self) -> str:
        """Return connector version"""
        pass
    
    async def create_artifact(self, 
                            artifact_type: str,
                            data: Dict[str, Any],
                            name: Optional[str] = None,
                            metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create and sign a FedMCP artifact from data
        
        Args:
            artifact_type: Type of artifact (e.g., "data-extract", "report")
            data: The data to include in the artifact
            name: Optional name for the artifact
            metadata: Optional metadata to include
            
        Returns:
            Signed FedMCP artifact
        """
        # Create artifact
        artifact = Artifact(
            type=artifact_type,
            workspaceId=self.workspace_id,
            name=name or f"{self.connector_name}-{artifact_type}-{datetime.utcnow().isoformat()}",
            jsonBody=data
        )
        
        # Add standard metadata
        artifact.jsonBody["_metadata"] = {
            "connector": self.connector_name,
            "connector_version": self.get_version(),
            "created_at": datetime.utcnow().isoformat(),
            "workspace_id": self.workspace_id,
            **(metadata or {})
        }
        
        # Sign artifact
        signature = self.signer.sign(artifact)
        
        # Log artifact creation
        self.audit.log_access(
            resource=artifact_type,
            action="create_artifact",
            success=True,
            metadata={
                "artifact_id": artifact.id,
                "artifact_name": artifact.name
            }
        )
        
        return {
            "id": artifact.id,
            "type": artifact.type,
            "name": artifact.name,
            "workspaceId": artifact.workspaceId,
            "jsonBody": artifact.jsonBody,
            "signature": signature,
            "signatureType": "kms" if self.config.use_kms else "local"
        }
    
    def sign_artifact(self, artifact: Artifact) -> str:
        """Sign an artifact using configured signer"""
        return self.signer.sign(artifact)
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on the connector
        
        Returns:
            Health status including connection status and metadata
        """
        try:
            # Subclasses should implement specific health checks
            is_healthy = self._check_connection()
            
            return {
                "status": "healthy" if is_healthy else "unhealthy",
                "connector": self.connector_name,
                "version": self.get_version(),
                "timestamp": datetime.utcnow().isoformat(),
                "workspace_id": self.workspace_id
            }
        except Exception as e:
            return {
                "status": "error",
                "connector": self.connector_name,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    @abstractmethod
    def _check_connection(self) -> bool:
        """Check connection to external source"""
        pass
    
    def get_cache(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if self._cache is not None:
            return self._cache.get(key)
        return None
    
    def set_cache(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache"""
        if self._cache is not None:
            self._cache[key] = {
                "value": value,
                "timestamp": datetime.utcnow(),
                "ttl": ttl
            }
    
    def clear_cache(self):
        """Clear all cached values"""
        if self._cache is not None:
            self._cache.clear()
    
    async def __aenter__(self):
        """Async context manager entry"""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit - cleanup resources"""
        # Subclasses can override to clean up connections
        pass


class RateLimiter:
    """Simple rate limiter for API calls"""
    
    def __init__(self, calls_per_minute: int = 60):
        self.calls_per_minute = calls_per_minute
        self.calls = []
    
    async def check_rate_limit(self):
        """Check if rate limit is exceeded"""
        now = datetime.utcnow()
        # Remove calls older than 1 minute
        self.calls = [call for call in self.calls 
                     if (now - call).total_seconds() < 60]
        
        if len(self.calls) >= self.calls_per_minute:
            # Rate limit exceeded
            sleep_time = 60 - (now - self.calls[0]).total_seconds()
            if sleep_time > 0:
                import asyncio
                await asyncio.sleep(sleep_time)
        
        self.calls.append(now)


class RetryHandler:
    """Retry handler for transient failures"""
    
    def __init__(self, max_retries: int = 3, backoff_factor: float = 2.0):
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
    
    async def retry_async(self, func, *args, **kwargs):
        """Retry an async function with exponential backoff"""
        import asyncio
        
        last_exception = None
        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    sleep_time = (self.backoff_factor ** attempt)
                    await asyncio.sleep(sleep_time)
                else:
                    raise
        
        raise last_exception