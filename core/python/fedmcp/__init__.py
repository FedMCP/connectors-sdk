"""
FedMCP - Federal Model Context Protocol
Python implementation of the FedMCP specification v0.2
"""

from .artifact import Artifact, ArtifactType
from .signer import Signer, LocalSigner, KMSSigner
from .verifier import Verifier, KMSVerifier
from .audit import AuditEvent, AuditAction
from .client import FedMCPClient

__version__ = "0.2.0"
__all__ = [
    "Artifact",
    "ArtifactType",
    "Signer",
    "LocalSigner", 
    "KMSSigner",
    "Verifier",
    "KMSVerifier",
    "AuditEvent",
    "AuditAction",
    "FedMCPClient",
]